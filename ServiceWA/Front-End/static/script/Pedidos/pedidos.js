function addMessage(text, type) {
  const chatBox = document.getElementById("chat-box");
  const messageDiv = document.createElement("div");
  messageDiv.classList.add("chat-message", type);
  messageDiv.textContent = text;
  chatBox.appendChild(messageDiv);
  chatBox.scrollTop = chatBox.scrollHeight;
}

let pedidosCarregados = [];
let mostrarConcluidos = false;

async function lerRespostaJsonSegura(response) {
    const texto = await response.text();

    if (!texto) {
        return {};
    }

    try {
        return JSON.parse(texto);
    } catch (error) {
        return {
            erro: texto
        };
    }
}

function obterPedidosVisiveis() {
    return mostrarConcluidos
        ? pedidosCarregados
        : pedidosCarregados.filter(pedido => !pedido.status);
}

function atualizarTextoBotaoConcluidos() {
    const botao = document.getElementById("btn-toggle-concluidos");

    if (!botao) {
        return;
    }

    botao.innerHTML = `<h2>${mostrarConcluidos ? "Ocultar concluidos" : "Mostrar concluidos"}</h2>`;
}

function obterIdPedido(pedido) {
    return pedido.id ?? pedido.Id ?? 0;
}

function obterObservacoesPedido(pedido) {
    return (pedido.observacoes || pedido.Observacoes || "").trim();
}

function obterNumeroMesaPedido(pedido) {
    return (pedido.numeroMesa || pedido.numero_mesa || pedido.NumeroMesa || "").toString().trim();
}

function montarObservacoesComMesa(observacoes, numeroMesa) {
    const observacoesBase = (observacoes || "")
        .replace(/(?:^|\s*\|\s*)Mesa\s+\S+/gi, "")
        .trim();

    return observacoesBase
        ? `Mesa ${numeroMesa} | ${observacoesBase}`
        : `Mesa ${numeroMesa}`;
}

function formatarHorarioPedido(valor) {
    if (!valor) {
        return "Horario nao informado";
    }

    const data = new Date(valor);

    if (Number.isNaN(data.getTime())) {
        return valor;
    }

    return data.toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit"
    });
}

function montarAnotacaoRapida(pedido, numeroMesa) {
    const nomeProduto = pedido.produto?.nome || pedido.produto?.Nome || "Produto sem nome";
    const observacoes = obterObservacoesPedido(pedido);
    const partes = [`Mesa ${numeroMesa}`, nomeProduto];

    if (observacoes) {
        partes.push(observacoes);
    }

    return partes.join(" | ");
}

async function copiarTexto(texto) {
    if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(texto);
        return true;
    }

    const campoTemporario = document.createElement("textarea");
    campoTemporario.value = texto;
    document.body.appendChild(campoTemporario);
    campoTemporario.select();
    const copiado = document.execCommand("copy");
    document.body.removeChild(campoTemporario);
    return copiado;
}

async function adicionarMesaNasAnotacoes(pedidoId) {
    const indicePedido = pedidosCarregados.findIndex(item => obterIdPedido(item) === pedidoId);
    const pedido = indicePedido === -1 ? null : pedidosCarregados[indicePedido];

    if (!pedido) {
        return;
    }

    const numeroMesa = window.prompt("Informe o numero da mesa para este pedido:");

    if (!numeroMesa) {
        return;
    }

    const numeroMesaNormalizado = numeroMesa.trim();
    const anotacao = montarAnotacaoRapida(pedido, numeroMesaNormalizado);
    const observacoesAtualizadas = montarObservacoesComMesa(
        obterObservacoesPedido(pedido),
        numeroMesaNormalizado
    );

    pedidosCarregados[indicePedido] = {
        ...pedido,
        numeroMesa: numeroMesaNormalizado,
        NumeroMesa: numeroMesaNormalizado,
        observacoes: observacoesAtualizadas,
        Observacoes: observacoesAtualizadas
    };

    try {
        const response = await fetch(`/atualizarpedido/${pedidoId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                data_da_venda: pedido.data_da_venda || pedido.dataDaVenda || pedido.Data_da_venda || "",
                numero_mesa: numeroMesaNormalizado,
                observacoes: observacoesAtualizadas,
                status: Boolean(pedido.status ?? pedido.Status)
            })
        });

        const resultado = await lerRespostaJsonSegura(response);

        if (!response.ok) {
            throw new Error(resultado.erro || "Nao foi possivel atualizar o pedido.");
        }

        pedidosCarregados[indicePedido] = resultado;
        renderizarPedidos(obterPedidosVisiveis());
        await copiarTexto(anotacao);
    } catch (error) {}
}

function renderizarPedidos(pedidos) {
    const container = document.getElementById("chat-box");
    container.innerHTML = "";

    if (pedidos.length === 0) {
        container.innerHTML = `
            <div class="chat-message">
                <h3>Nenhum pedido encontrado</h3>
            </div>
        `;
        return;
    }

    pedidos.forEach(pedido => {
        const nomeProduto = pedido.produto?.nome || "Produto sem nome";
        const statusPedido = pedido.status ? "Finalizado" : "Pendente";
        const horarioPedido = formatarHorarioPedido(pedido.data_da_venda || pedido.dataDaVenda || "");
        const pedidoId = obterIdPedido(pedido);
        const observacoes = obterObservacoesPedido(pedido);
        const numeroMesa = obterNumeroMesaPedido(pedido);

        const div = document.createElement("div");
        div.classList.add("chat-message");

        div.innerHTML = `
            <h3>${nomeProduto}</h3>
            <p>Status: ${statusPedido}</p>
            <p>Horario: ${horarioPedido}</p>
            ${numeroMesa ? `<p>Mesa: ${numeroMesa}</p>` : ""}
            ${observacoes ? `<p>Observacoes: ${observacoes}</p>` : ""}
            <div class="pedido-acoes">
                ${!pedido.status ? `
                    <button class="pedido-acao-secundaria" onclick="adicionarMesaNasAnotacoes(${pedidoId})">
                        Informar numero da mesa
                    </button>
                ` : ""}
                <button ${pedido.status ? "disabled" : ""} onclick="marcarPedidoComoConcluido(${pedidoId})">
                    ${pedido.status ? "Concluido" : "Marcar como concluido"}
                </button>
            </div>
        `;

        container.appendChild(div);
    });
}

async function marcarPedidoComoConcluido(pedidoId) {
    try {
        const response = await fetch(`/atualizarstatuspedido/${pedidoId}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ status: true })
        });

        const resultado = await lerRespostaJsonSegura(response);

        if (!response.ok) {
            throw new Error(resultado.erro || "Nao foi possivel atualizar o pedido.");
        }

        pedidosCarregados = pedidosCarregados.map(pedido =>
            obterIdPedido(pedido) === pedidoId ? { ...pedido, status: true } : pedido
        );

        renderizarPedidos(obterPedidosVisiveis());
    } catch (error) {}
}

function alternarPedidosConcluidos() {
    mostrarConcluidos = !mostrarConcluidos;
    atualizarTextoBotaoConcluidos();
    renderizarPedidos(obterPedidosVisiveis());
}

fetch("/rotaparapuxartodosospedidosmasnaopodeterumnomeobvio")
    .then(res => res.json())
    .then(pedidos => {
        pedidosCarregados = pedidos;
        atualizarTextoBotaoConcluidos();
        renderizarPedidos(obterPedidosVisiveis());
    });
