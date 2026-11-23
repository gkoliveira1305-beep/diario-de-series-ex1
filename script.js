const SUPABASE_URL = "https://uhmbqbpftxuzbzxzdmgb.supabase.co";
const CHAVE = "sb_publishable_wvXJTEU6dxBROmX8oijm_A_SohuPw8W";

const url = SUPABASE_URL + "/rest/v1/series";
const opcoes = { headers: { apikey: CHAVE } };

const aviso = document.getElementById("status");
const lista = document.getElementById("lista");
const form = document.getElementById("form");
const campoTitulo = document.getElementById("titulo");
const campoNota = document.getElementById("nota");
const campoStatus = document.getElementById("statusSerie");
const filtroStatus = document.getElementById("filtroStatus");
const filtroOrdem = document.getElementById("filtroOrdem");

// Desenha a lista na tela de forma segura (R1, R3, R8)
function desenhar(series) {
  lista.innerHTML = "";
  series.forEach(function (t) {
    const li = document.createElement("li");
    
    // Conteúdo seguro com textContent (R8)
    li.textContent = `${t.titulo} — Nota: ${t.nota} — Status: ${t.status} `;

    // Botão Excluir (R3)
    const btnExcluir = document.createElement("button");
    btnExcluir.textContent = "Excluir";
    btnExcluir.addEventListener("click", async function () {
      await excluir(t.id);
    });

    li.append(btnExcluir);
    lista.append(li);
  });
  aviso.textContent = series.length + " série(s)";
}

// Monta a URL dinâmica combinando select, filtros e ordenação (R4, R5, R6)
function montarUrl() {
  const partes = ["select=*"];

  const statusSelecionado = filtroStatus.value;
  if (statusSelecionado !== "todas") {
    partes.push(`status=eq.${statusSelecionado}`);
  }

  const ordemSelecionada = filtroOrdem.value;
  partes.push(`order=${ordemSelecionada}`);

  return url + "?" + partes.join("&");
}

// Ler dados do Supabase (GET com tratamento de erro R1, R7)
async function carregar() {
  try {
    const endpoint = montarUrl();
    const resposta = await fetch(endpoint, opcoes);
    if (!resposta.ok) {
      throw new Error("Erro " + resposta.status);
    }
    const series = await resposta.json();
    desenhar(series);
  } catch (erro) {
    aviso.textContent = "Falhou: " + erro.message;
  }
}

// Cadastrar nova série (POST com R2, R7)
form.addEventListener("submit", async function (event) {
  event.preventDefault();
  try {
    const resposta = await fetch(url, {
      method: "POST",
      headers: {
        apikey: CHAVE,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        titulo: campoTitulo.value,
        nota: Number(campoNota.value),
        status: campoStatus.value
      }),
    });
    if (!resposta.ok) {
      throw new Error("Erro " + resposta.status);
    }
    form.reset();
    await carregar();
  } catch (erro) {
    aviso.textContent = "Falhou: " + erro.message;
  }
});

// Excluir série por ID (DELETE com R3, R7)
async function excluir(id) {
  try {
    const resposta = await fetch(url + "?id=eq." + id, {
      method: "DELETE",
      headers: {
        apikey: CHAVE
      }
    });
    if (!resposta.ok) {
      throw new Error("Erro " + resposta.status);
    }
    await carregar();
  } catch (erro) {
    aviso.textContent = "Falhou: " + erro.message;
  }
}

// Eventos para disparar o filtro e a ordenação em tempo real (R4, R5)
filtroStatus.addEventListener("change", carregar);
filtroOrdem.addEventListener("change", carregar);

// Executa ao carregar a página
carregar();