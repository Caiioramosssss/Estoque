import app from './firebase-config.js';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  updateDoc,
  doc,
  deleteDoc,
  serverTimestamp,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";

const auth = getAuth(app);
const db = getFirestore(app);
const root = document.getElementById("root");

function renderLogin() {
  root.innerHTML = \`
    <div class="card">
      <h1>Login</h1>
      <input id="email" type="email" placeholder="Email" />
      <input id="senha" type="password" placeholder="Senha" />
      <button onclick="login()">Entrar</button>
      <button onclick="registrar()">Registrar</button>
    </div>
  \`;
}

window.login = async () => {
  const email = document.getElementById("email").value;
  const senha = document.getElementById("senha").value;
  try {
    await signInWithEmailAndPassword(auth, email, senha);
  } catch (e) {
    alert("Erro no login: " + e.message);
  }
};

window.registrar = async () => {
  const email = document.getElementById("email").value;
  const senha = document.getElementById("senha").value;
  try {
    await createUserWithEmailAndPassword(auth, email, senha);
    alert("Registrado com sucesso! Agora entre com seu login.");
  } catch (e) {
    alert("Erro ao registrar: " + e.message);
  }
};

function renderSistema(user) {
  root.innerHTML = \`
    <div class="card">
      <h1>Bem-vindo, \${user.email}</h1>
      <button onclick="logout()">Sair</button>
    </div>

    <div class="card">
      <h2>Cadastrar Puff</h2>
      <input id="nome" placeholder="Nome do puff" />
      <input id="cor" placeholder="Cor" />
      <input id="tecido" placeholder="Tecido" />
      <input id="quantidade" type="number" placeholder="Quantidade" />
      <button onclick="cadastrarPuff()">Salvar</button>
    </div>

    <div class="card">
      <h2>Estoque Atual</h2>
      <ul id="listaEstoque"></ul>
    </div>

    <div class="card">
      <h2>Histórico</h2>
      <ul id="listaHistorico"></ul>
    </div>
  \`;
  carregarEstoque();
  carregarHistorico();
}

window.logout = () => signOut(auth);

window.cadastrarPuff = async () => {
  const nome = document.getElementById("nome").value;
  const cor = document.getElementById("cor").value;
  const tecido = document.getElementById("tecido").value;
  const quantidade = parseInt(document.getElementById("quantidade").value);
  try {
    const docRef = await addDoc(collection(db, "estoque"), { nome, cor, tecido, quantidade });
    await addDoc(collection(db, "historico"), {
      nome,
      acao: "Cadastro",
      quantidade,
      timestamp: serverTimestamp()
    });
    alert("Puff cadastrado!");
    carregarEstoque();
    carregarHistorico();
  } catch (e) {
    alert("Erro ao cadastrar: " + e.message);
  }
};

async function carregarEstoque() {
  const lista = document.getElementById("listaEstoque");
  lista.innerHTML = "";
  const querySnapshot = await getDocs(collection(db, "estoque"));
  querySnapshot.forEach((docItem) => {
    const d = docItem.data();
    lista.innerHTML += \`
      <li>
        <strong>\${d.nome}</strong> - \${d.cor}, \${d.tecido} — <em>\${d.quantidade} unidades</em>
        <br/>
        <button onclick="alterarQuantidade('\${docItem.id}', \${d.quantidade}, 1)">+1</button>
        <button onclick="alterarQuantidade('\${docItem.id}', \${d.quantidade}, -1)">-1</button>
        <button onclick="removerPuff('\${docItem.id}', '\${d.nome}')">Remover</button>
      </li>
    \`;
  });
}

window.alterarQuantidade = async (id, atual, delta) => {
  const ref = doc(db, "estoque", id);
  const novoValor = atual + delta;
  await updateDoc(ref, { quantidade: novoValor });
  await addDoc(collection(db, "historico"), {
    nome: id,
    acao: delta > 0 ? "Entrada" : "Saída",
    quantidade: delta,
    timestamp: serverTimestamp()
  });
  carregarEstoque();
  carregarHistorico();
};

window.removerPuff = async (id, nome) => {
  if (confirm("Deseja remover este item do estoque?")) {
    await deleteDoc(doc(db, "estoque", id));
    await addDoc(collection(db, "historico"), {
      nome,
      acao: "Remoção",
      quantidade: 0,
      timestamp: serverTimestamp()
    });
    carregarEstoque();
    carregarHistorico();
  }
};

async function carregarHistorico() {
  const lista = document.getElementById("listaHistorico");
  lista.innerHTML = "";
  const q = query(collection(db, "historico"), orderBy("timestamp", "desc"));
  const snapshot = await getDocs(q);
  snapshot.forEach((docItem) => {
    const h = docItem.data();
    const data = h.timestamp?.toDate().toLocaleString("pt-BR") || "";
    lista.innerHTML += \`<li>[\${data}] \${h.acao} — \${h.nome} (\${h.quantidade})</li>\`;
  });
}

onAuthStateChanged(auth, (user) => {
  if (user) {
    renderSistema(user);
  } else {
    renderLogin();
  }
});