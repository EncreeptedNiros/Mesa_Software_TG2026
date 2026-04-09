let comandasCarregadas = [];
let mostrarFechadas = false;
const overlayComanda = document.getElementById("overlay-comanda");

async function lerRespostaJsonSegura(response) {
  const texto = await response.text();

  if (!texto) {
    return {};
  }

  try {
    return JSON.parse(texto);
  } catch (error) {
    return { erro: texto };
  }
}

function obterComandasVisiveis() {
  return mostrarFechadas
    ? comandasCarregadas
    : comandasCarregadas.filter(comanda => !obterStatusComanda(comanda));
}

function atualizarTextoBotaoFechadas() {
  const botao = document.getElementById("btn-toggle-fechadas");

  if (!botao) {
    return;
  }

  botao.innerHTML = `<h2>${mostrarFechadas ? "Ocultar fechadas" : "Mostrar fechadas"}</h2>`;
}

function obterIdComanda(comanda) {
  return comanda.id ?? comanda.Id ?? 0;
}

function obterStatusComanda(comanda) {
  return Boolean(comanda.status ?? comanda.Status ?? false);
}

function formatarDataComanda(valor) {
  if (!valor) {
    return "Nao informada";
  }

  const data = new Date(valor);
  if (Number.isNaN(data.getTime())) {
    return valor;
  }

  return data.toLocaleString("pt-BR");
}

function formatarDataParaInput(valor) {
  const data = valor ? new Date(valor) : new Date();
  if (Number.isNaN(data.getTime())) {
    return "";
  }

  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, "0");
  const dia = String(data.getDate()).padStart(2, "0");
  const hora = String(data.getHours()).padStart(2, "0");
  const minuto = String(data.getMinutes()).padStart(2, "0");
  return `${ano}-${mes}-${dia}T${hora}:${minuto}`;
}

function abrirModalComanda() {
  const cliente = document.getElementById("comanda-cliente");
  const dataAbertura = document.getElementById("comanda-data-abertura");

  if (cliente) {
    cliente.value = "";
  }

  if (dataAbertura) {
    dataAbertura.value = formatarDataParaInput();
  }

  if (overlayComanda) {
    overlayComanda.classList.add("active");
  }
}

function fecharModalComanda() {
  if (overlayComanda) {
    overlayComanda.classList.remove("active");
  }
}

function renderizarComandas(comandas) {
  const container = document.getElementById("chat-box");

  if (!container) {
    return;
  }

  container.innerHTML = "";

  if (comandas.length === 0) {
    container.innerHTML = `
      <div class="chat-message">
        <h3>Nenhuma comanda encontrada</h3>
      </div>
    `;
    return;
  }

  comandas.forEach(comanda => {
    const id = obterIdComanda(comanda);
    const cliente = comanda.cliente || comanda.Cliente || "Cliente nao informado";
    const statusFechada = obterStatusComanda(comanda);
    const abertura = formatarDataComanda(comanda.datadeabertura || comanda.Datadeabertura || "");
    const fechamento = formatarDataComanda(comanda.datadefechamento || comanda.Datadefechamento || "");

    const div = document.createElement("div");
    div.classList.add("chat-message");
    div.innerHTML = `
      <h3>Comanda #${id}</h3>
      <p>Cliente: ${cliente}</p>
      <p>Status: ${statusFechada ? "Fechada" : "Aberta"}</p>
      <p>Data de abertura: ${abertura}</p>
      <p>Data de fechamento: ${statusFechada ? fechamento : "Em aberto"}</p>
      <div class="comanda-acoes">
        <button ${statusFechada ? "disabled" : ""} onclick="fecharComanda(${id})">
          ${statusFechada ? "Fechada" : "Fechar comanda"}
        </button>
      </div>
    `;

    container.appendChild(div);
  });
}

async function fecharComanda(comandaId) {
  try {
    const response = await fetch(`/atualizarstatuscomanda/${comandaId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        status: true,
        data_de_fechamento: new Date().toISOString()
      })
    });

    const resultado = await lerRespostaJsonSegura(response);

    if (!response.ok) {
      throw new Error(resultado.erro || "Nao foi possivel fechar a comanda.");
    }

    comandasCarregadas = comandasCarregadas.map(comanda =>
      obterIdComanda(comanda) === comandaId
        ? { ...comanda, status: true, Status: true, datadefechamento: new Date().toISOString(), Datadefechamento: new Date().toISOString() }
        : comanda
    );

    renderizarComandas(obterComandasVisiveis());
  } catch (error) {
    console.error("Erro ao fechar comanda:", error);
  }
}

async function criarComanda() {
  const cliente = (document.getElementById("comanda-cliente")?.value || "").trim();
  const dataAbertura = document.getElementById("comanda-data-abertura")?.value || "";

  if (!cliente) {
    return;
  }

  try {
    const response = await fetch("/criarcomanda", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        cliente,
        data_de_abertura: dataAbertura ? new Date(dataAbertura).toISOString() : new Date().toISOString(),
        data_de_fechamento: new Date().toISOString(),
        status: false
      })
    });

    const resultado = await lerRespostaJsonSegura(response);

    if (!response.ok) {
      throw new Error(resultado.erro || "Nao foi possivel criar a comanda.");
    }

    comandasCarregadas = [resultado, ...comandasCarregadas];
    fecharModalComanda();
    renderizarComandas(obterComandasVisiveis());
  } catch (error) {
    console.error("Erro ao criar comanda:", error);
  }
}

function alternarComandasFechadas() {
  mostrarFechadas = !mostrarFechadas;
  atualizarTextoBotaoFechadas();
  renderizarComandas(obterComandasVisiveis());
}

fetch("/rotaparapuxartodasascomandasmasnaopodeterumnomeobvio")
  .then(async response => {
    const resultado = await lerRespostaJsonSegura(response);

    if (!response.ok) {
      throw new Error(resultado.erro || "Nao foi possivel carregar as comandas.");
    }

    if (!Array.isArray(resultado)) {
      throw new Error(resultado.erro || "Resposta invalida ao carregar comandas.");
    }

    return resultado;
  })
  .then(comandas => {
    comandasCarregadas = comandas;
    atualizarTextoBotaoFechadas();
    renderizarComandas(obterComandasVisiveis());
  })
  .catch(error => {
    console.error("Erro ao carregar comandas:", error);
    const container = document.getElementById("chat-box");
    if (container) {
      container.innerHTML = `
        <div class="chat-message">
          <h3>Erro ao carregar comandas</h3>
          <p>${error.message || "Tente novamente em instantes."}</p>
        </div>
      `;
    }
  });

if (overlayComanda) {
  overlayComanda.addEventListener("click", function(e) {
    if (e.target === overlayComanda) {
      fecharModalComanda();
    }
  });
}
