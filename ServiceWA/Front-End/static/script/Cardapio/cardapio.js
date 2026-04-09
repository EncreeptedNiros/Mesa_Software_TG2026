// Vou organizar todas as variaveis globais aqui em cima
const overlay = document.getElementById("overlay");
const overlayConfirmacao = document.getElementById("overlay-confirmacao");
const overlayFinalizacao = document.getElementById("overlay-finalizacao");
const overlayPix = document.getElementById("overlay-pix");
const overlayPagamentoInformado = document.getElementById("overlay-pagamento-informado");
const overlayProduto = document.getElementById("overlay-produto");
const menuCategoriasToggle = document.getElementById("menu-categorias-toggle");
const navCategorias = document.getElementById("nav-categorias");
const usuarioLogado = window.usuarioLogado === true;
const numeroMesaUrl = (window.numeroMesaUrl || "").toString().trim();
const configuracaoPix = {
  chave: "pix@mesasoftware.com.br",
  favorecido: "Mesa Software",
  cidade: "Sao Paulo",
  descricao: "Pagamento Mesa Software"
};
let carrinho = [];
const metodosPagamento = usuarioLogado
  ? ["Pix", "Informe de pagamento"]
  : ["Pix"];
let produtosCarregados = [];
let promocoesCarregadas = [];
let categoriaSelecionada = "todos";
let produtoSelecionado = null;
let pagamentoEmAndamento = false;


//onload
function addMessage(text, type) {
  const chatBox = document.getElementById("chat-box");
  const messageDiv = document.createElement("div");
  messageDiv.classList.add("chat-message", type);
  messageDiv.textContent = text;
  chatBox.appendChild(messageDiv);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

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

async function getCardapio(delayMs = 2000) {
  console.log(`Aguardando ${delayMs}ms antes da requisição...`);
  
  // Aguarda o delay
  await delay(delayMs);
  
  const apiUrl = 'http://localhost:5080/api/produto/';
  console.log('Fazendo requisição para:', apiUrl);
  
  const requestOptions = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    mode: 'cors'
  };

  try {
    const response = await fetch(apiUrl, requestOptions);
    
    if (!response.ok) {
      throw new Error('Erro ao fazer a requisição: ' + response.statusText);
    }
    
    const data = await response.json();
    return data;
    
  } catch (error) {
    console.error('Erro ao fazer a requisição:', error);
    throw error;
  }
}

function criarProdutoCarrinho(produto) {
  return {
    id: produto.id,
    nome: produto.nome,
    preco: Number(produto.valorPromocional ?? produto.valor),
    quantidade: 1,
    total: Number(produto.valorPromocional ?? produto.valor),
    aditivos: "",
    observacoes: "",
    promocaoAplicada: produto.promocaoAplicada || null,
    chave: `${produto.id}::`
  };
}

function criarObjetoCompra() {
  return {
    produtos: carrinho.map(item => ({ ...item })),
    totalItens: carrinho.reduce((total, item) => total + item.quantidade, 0),
    valorTotal: carrinho.reduce((total, item) => total + item.total, 0)
  };
}

function obterMetodoPagamentoSelecionado() {
  const campoMetodoPagamento = document.getElementById("metodo-pagamento");
  return campoMetodoPagamento ? campoMetodoPagamento.value : "Nao informado";
}

function renderizarCarrinho() {
  const container = document.getElementById("modal");
  const compra = criarObjetoCompra();

  if (!container) {
    return;
  }

  if (carrinho.length === 0) {
    container.innerHTML = `
      <button class="btn-fechar" onclick="fecharModal()">X</button>
      <h2>Revisao do Pedido</h2>
      <div class="chat-message">
        <p>Seu carrinho esta vazio.</p>
      </div>
      <button class="btn-principal" onclick="fecharModal()">Continuar comprando</button>
    `;
    return;
  }

  const conteudoCarrinho = carrinho.map((item, index) => `
    <div class="chat-message">
      <h3>${item.nome}</h3>
      <p>Preco: R$ ${item.preco.toFixed(2)}</p>
      <p>Quantidade: ${item.quantidade}</p>
      ${item.aditivos ? `<p>Aditivos: ${item.aditivos}</p>` : ""}
      ${item.observacoes ? `<p>Observacoes: ${item.observacoes}</p>` : ""}
      <p>Total: R$ ${item.total.toFixed(2)}</p>
      <button data-index="${index}" onclick="removerDoCarrinho(${index})"><h2>Remover</h2></button>
    </div>
  `).join("");

  const opcoesMetodoPagamento = metodosPagamento.map(metodo => `
    <option value="${metodo}">${metodo}</option>
  `).join("");

  container.innerHTML = `
    <button class="btn-fechar" onclick="fecharModal()">X</button>
    <h2>Revisao do Pedido</h2>
    ${conteudoCarrinho}
    <div class="resumo-carrinho">
      <p>Itens: ${compra.totalItens}</p>
      <p>Total da compra: R$ ${compra.valorTotal.toFixed(2)}</p>
    </div>
    <label class="campo-pagamento" for="metodo-pagamento">Metodo de pagamento</label>
    <select id="metodo-pagamento" class="input-pagamento">
      ${opcoesMetodoPagamento}
    </select>
    <button class="btn-principal" onclick="iniciarFluxoPagamento()">Finalizar compra</button>
  `;
}

function abrirModalConfirmacao(produto) {
  const mensagem = document.getElementById("mensagem-confirmacao-carrinho");

  if (mensagem) {
    mensagem.textContent = `${produto.nome} foi adicionado ao carrinho.`;
  }

  if (overlayConfirmacao) {
    overlayConfirmacao.classList.add("active");
  }
}

function fecharModalConfirmacao() {
  if (overlayConfirmacao) {
    overlayConfirmacao.classList.remove("active");
  }
}

function abrirModalFinalizacao(mensagem = "Seu pedido foi enviado com sucesso.") {
  const mensagemFinalizacao = document.getElementById("mensagem-finalizacao-compra");

  if (mensagemFinalizacao) {
    mensagemFinalizacao.textContent = mensagem;
  }

  if (overlayFinalizacao) {
    overlayFinalizacao.classList.add("active");
  }
}

function fecharModalFinalizacao() {
  if (overlayFinalizacao) {
    overlayFinalizacao.classList.remove("active");
  }
}

function abrirModalPix(codigoPix, valorTotal) {
  const qrCode = document.getElementById("pix-qrcode");
  const campoCodigo = document.getElementById("pix-codigo-copiavel");
  const valor = document.getElementById("pix-valor-total");
  const mesaInfo = document.getElementById("pix-mesa-info");

  if (qrCode) {
    qrCode.src = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(codigoPix)}`;
  }

  if (campoCodigo) {
    campoCodigo.value = codigoPix;
  }

  if (valor) {
    valor.textContent = `Total: R$ ${valorTotal.toFixed(2)}`;
  }

  if (mesaInfo) {
    mesaInfo.textContent = numeroMesaUrl ? `Mesa vinculada: ${numeroMesaUrl}` : "";
  }

  if (overlayPix) {
    overlayPix.classList.add("active");
  }
}

function fecharModalPix() {
  if (overlayPix) {
    overlayPix.classList.remove("active");
  }
}

function abrirModalPagamentoInformado() {
  document
    .querySelectorAll('input[name="forma-pagamento-informado"]')
    .forEach(campo => {
      campo.checked = false;
    });

  if (overlayPagamentoInformado) {
    overlayPagamentoInformado.classList.add("active");
  }
}

function fecharModalPagamentoInformado() {
  if (overlayPagamentoInformado) {
    overlayPagamentoInformado.classList.remove("active");
  }
}

function abrirCarrinhoPelaConfirmacao() {
  fecharModalConfirmacao();
  abrirModal();
}

function abrirModalProduto(produto) {
  produtoSelecionado = produto;

  const nome = document.getElementById("produto-modal-nome");
  const preco = document.getElementById("produto-modal-preco");
  const quantidade = document.getElementById("produto-quantidade");
  const aditivos = document.getElementById("produto-aditivos");
  const observacoes = document.getElementById("produto-observacoes");

  if (nome) {
    nome.textContent = produto.nome;
  }

  if (preco) {
    const valorAtual = Number(produto.valorPromocional ?? produto.valor);
    const valorOriginal = Number(produto.valorOriginal ?? produto.valor);

    if (produto.promocaoAplicada && valorAtual < valorOriginal) {
      preco.innerHTML = `R$ ${valorAtual.toFixed(2)} <span style="text-decoration: line-through; opacity: 0.7; margin-left: 8px;">R$ ${valorOriginal.toFixed(2)}</span>`;
    } else {
      preco.textContent = `R$ ${valorAtual.toFixed(2)}`;
    }
  }

  if (quantidade) {
    quantidade.value = 1;
  }

  if (aditivos) {
    aditivos.value = "";
  }

  if (observacoes) {
    observacoes.value = "";
  }

  if (overlayProduto) {
    overlayProduto.classList.add("active");
  }
}

function fecharModalProduto() {
  if (overlayProduto) {
    overlayProduto.classList.remove("active");
  }
}

function gerarChaveCarrinho(id, aditivos, observacoes) {
  return `${id}::${(aditivos || "").trim().toLowerCase()}::${(observacoes || "").trim().toLowerCase()}`;
}

function formatarTextoPix(valor) {
  return String(valor.length).padStart(2, "0") + valor;
}

function montarCampoPix(id, valor) {
  const texto = String(valor);
  return `${id}${formatarTextoPix(texto)}${texto}`;
}

function normalizarPixTexto(valor, limite) {
  return (valor || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9 ]/g, "")
    .toUpperCase()
    .slice(0, limite);
}

function calcularCrc16Pix(valor) {
  let resultado = 0xffff;

  for (let i = 0; i < valor.length; i += 1) {
    resultado ^= valor.charCodeAt(i) << 8;

    for (let j = 0; j < 8; j += 1) {
      if ((resultado & 0x8000) !== 0) {
        resultado = (resultado << 1) ^ 0x1021;
      } else {
        resultado <<= 1;
      }

      resultado &= 0xffff;
    }
  }

  return resultado.toString(16).toUpperCase().padStart(4, "0");
}

function gerarCodigoPix(valorTotal) {
  const nomeRecebedor = normalizarPixTexto(configuracaoPix.favorecido, 25) || "MESA SOFTWARE";
  const cidadeRecebedor = normalizarPixTexto(configuracaoPix.cidade, 15) || "SAO PAULO";
  const descricao = normalizarPixTexto(configuracaoPix.descricao, 40);
  const txid = normalizarPixTexto(`MESA${numeroMesaUrl || "GERAL"}`, 25) || "MESA";

  const contaPix = [
    montarCampoPix("00", "BR.GOV.BCB.PIX"),
    montarCampoPix("01", configuracaoPix.chave),
    descricao ? montarCampoPix("02", descricao) : ""
  ].join("");

  const payloadSemCrc = [
    montarCampoPix("00", "01"),
    montarCampoPix("26", contaPix),
    montarCampoPix("52", "0000"),
    montarCampoPix("53", "986"),
    montarCampoPix("54", valorTotal.toFixed(2)),
    montarCampoPix("58", "BR"),
    montarCampoPix("59", nomeRecebedor),
    montarCampoPix("60", cidadeRecebedor),
    montarCampoPix("62", montarCampoPix("05", txid)),
    "6304"
  ].join("");

  return `${payloadSemCrc}${calcularCrc16Pix(payloadSemCrc)}`;
}

function montarObservacoesComMesa(observacoes, numeroMesa) {
  if (!numeroMesa) {
    return (observacoes || "").trim();
  }

  const observacoesBase = (observacoes || "")
    .replace(/(?:^|\s*\|\s*)Mesa\s+\S+/gi, "")
    .trim();

  return observacoesBase
    ? `Mesa ${numeroMesa} | ${observacoesBase}`
    : `Mesa ${numeroMesa}`;
}

function confirmarAdicionarAoCarrinho() {
  if (!produtoSelecionado) {
    return;
  }

  const quantidadeCampo = document.getElementById("produto-quantidade");
  const aditivosCampo = document.getElementById("produto-aditivos");
  const observacoesCampo = document.getElementById("produto-observacoes");

  const quantidade = Math.max(1, Number(quantidadeCampo?.value || 1));
  const aditivos = (aditivosCampo?.value || "").trim();
  const observacoes = montarObservacoesComMesa(
    (observacoesCampo?.value || "").trim(),
    numeroMesaUrl
  );
  const chave = gerarChaveCarrinho(produtoSelecionado.id, aditivos, observacoes);
  const itemExistente = carrinho.find(item => item.chave === chave);

  if (itemExistente) {
    itemExistente.quantidade += quantidade;
    itemExistente.total = itemExistente.preco * itemExistente.quantidade;
  } else {
    carrinho.push({
      id: produtoSelecionado.id,
      nome: produtoSelecionado.nome,
      preco: Number(produtoSelecionado.valorPromocional ?? produtoSelecionado.valor),
      quantidade,
      total: Number(produtoSelecionado.valorPromocional ?? produtoSelecionado.valor) * quantidade,
      aditivos,
      observacoes,
      promocaoAplicada: produtoSelecionado.promocaoAplicada || null,
      chave
    });
  }

  renderizarCarrinho();
  fecharModalProduto();
  abrirModalConfirmacao({
    nome: produtoSelecionado.nome
  });
}

function iniciarFluxoPagamento() {
  const compra = criarObjetoCompra();
  const metodoPagamento = obterMetodoPagamentoSelecionado();

  if (compra.produtos.length === 0) {
    addMessage("Adicione pelo menos um item antes de finalizar a compra.", "warning");
    return;
  }

  if (metodoPagamento === "Pix") {
    abrirModalPix(gerarCodigoPix(compra.valorTotal), compra.valorTotal);
    return;
  }

  if (metodoPagamento === "Informe de pagamento") {
    abrirModalPagamentoInformado();
    return;
  }

  finalizarcompra({ metodoPagamento });
}

async function copiarCodigoPix() {
  const campoCodigo = document.getElementById("pix-codigo-copiavel");

  if (!campoCodigo?.value) {
    return;
  }

  try {
    await copiarTexto(campoCodigo.value);
    addMessage("Codigo Pix copiado com sucesso.", "success");
  } catch (error) {
    addMessage("Nao foi possivel copiar o codigo Pix.", "error");
  }
}

function confirmarPagamentoPix() {
  fecharModalPix();
  finalizarcompra({ metodoPagamento: "Pix" });
}

function confirmarPagamentoInformado() {
  const formaSelecionada = document.querySelector('input[name="forma-pagamento-informado"]:checked');

  if (!formaSelecionada) {
    addMessage("Selecione a forma de pagamento informado.", "warning");
    return;
  }

  fecharModalPagamentoInformado();
  finalizarcompra({
    metodoPagamento: `Informe de pagamento - ${formaSelecionada.value}`
  });
}

function normalizarCategoria(categoria) {
  return (categoria || "").toString().trim().toLowerCase();
}

function resolverCategoriaDoBotao(botao) {
  const categoriaDeclarada = botao.dataset.categoria;

  if (categoriaDeclarada) {
    return categoriaDeclarada;
  }

  const textoBotao = normalizarCategoria(botao.textContent)
    .replace("ç", "c")
    .replace("õ", "o");

  const mapaCategorias = {
    "todos": "todos",
    "bebidas": "bebidas",
    "cervejas": "cervejas",
    "drinks": "drinks",
    "rosh": "rosh",
    "porcoes": "porcoes",
    "tabacaria": "tabacaria"
  };

  return mapaCategorias[textoBotao] || "todos";
}

function renderizarProdutos(produtos) {
  const container = document.getElementById("chat-box");

  if (!container) {
    return;
  }

  container.innerHTML = "";

  if (produtos.length === 0) {
    container.innerHTML = `
      <div class="chat-message">
        <h3>Nenhum produto encontrado</h3>
        <p>Selecione outra categoria para visualizar mais itens.</p>
      </div>
    `;
    return;
  }

  produtos.forEach(produto => {
    const div = document.createElement("div");
    let image = "" + (produto.imagem_url || produto.imagemUrl || "");
    const valorOriginal = Number(produto.valorOriginal ?? produto.valor);
    const valorAtual = Number(produto.valorPromocional ?? produto.valor);
    const possuiPromocao = Boolean(produto.promocaoAplicada) && valorAtual < valorOriginal;

    if (image === "") {
      image = "/static/css/Cardapio/prods_img/hq720.jpg";
    }

    div.classList.add("chat-message", "produto-card");

    div.innerHTML = `
      <div class="produto-card-lateral">
        <div class="produto-card-imagem-wrap">
          <img class="produto-card-imagem" src="${image}" alt="${produto.nome}">
        </div>
        <button style="margin-right:5px;" data-id="${produto.id}" onclick="addCarrinho(${produto.id})"><h2>Adicionar</h2></button>
      </div>
      <div class="produto-card-conteudo">
        <span class="produto-card-categoria">${produto.categoria}</span>
        <h3>${produto.nome}</h3>
        <div class="produto-card-precos">
          <p class="produto-card-preco">R$ ${valorAtual.toFixed(2)}</p>
          ${possuiPromocao ? `<p class="produto-card-promocao">De <span>R$ ${valorOriginal.toFixed(2)}</span> por ${produto.promocaoAplicada.nome}</p>` : ""}
        </div>
      </div>
    `;

    container.appendChild(div);
  });
}

function converterTextoDataParaComparacao(valor) {
  if (!valor) {
    return null;
  }

  const data = new Date(valor);
  return Number.isNaN(data.getTime()) ? null : data;
}

function normalizarPromocao(promocao) {
  return {
    id: promocao.id ?? promocao.Id,
    nome: promocao.nome ?? promocao.Nome ?? "Promocao",
    descricao: promocao.descricao ?? promocao.Descricao ?? "",
    descontoPercentual: Number(promocao.descontoPercentual ?? promocao.DescontoPercentual ?? 0),
    dataInicio: promocao.dataInicio ?? promocao.DataInicio ?? "",
    dataFim: promocao.dataFim ?? promocao.DataFim ?? "",
    produtosIds: promocao.produtosIds ?? promocao.ProdutosIds ?? []
  };
}

function obterPromocoesAtivasDoProduto(produtoId) {
  const agora = new Date();

  return promocoesCarregadas.filter(promocao => {
    const inicio = converterTextoDataParaComparacao(promocao.dataInicio);
    const fim = converterTextoDataParaComparacao(promocao.dataFim);
    const produtoNaPromocao = (promocao.produtosIds || []).map(Number).includes(Number(produtoId));
    const dentroDoPeriodo = (!inicio || inicio <= agora) && (!fim || fim >= agora);

    return produtoNaPromocao && dentroDoPeriodo;
  });
}

function aplicarPromocaoAoProduto(produto) {
  const promocoesAtivas = obterPromocoesAtivasDoProduto(produto.id);

  if (!promocoesAtivas.length) {
    return {
      ...produto,
      valorOriginal: Number(produto.valor),
      valorPromocional: Number(produto.valor),
      promocaoAplicada: null
    };
  }

  const melhorPromocao = promocoesAtivas.reduce((anterior, atual) =>
    atual.descontoPercentual > anterior.descontoPercentual ? atual : anterior
  );

  const valorOriginal = Number(produto.valor);
  const valorPromocional = Number((valorOriginal * (1 - (melhorPromocao.descontoPercentual / 100))).toFixed(2));

  return {
    ...produto,
    valorOriginal,
    valorPromocional,
    promocaoAplicada: melhorPromocao
  };
}

function filtrarProdutosPorCategoria(categoria) {
  categoriaSelecionada = categoria;

  const produtosFiltrados = categoria === "todos"
    ? produtosCarregados
    : produtosCarregados.filter(produto => {
        const categoriaProduto = normalizarCategoria(produto.categoria);

        if (categoria === "bebidas") {
          return [
            "bebidas",
            "refrigerantes",
            "energeticos",
            "refrigerantes e energeticos",
            "refrigerantes/energeticos"
          ].includes(categoriaProduto);
        }

        if (categoria === "drinks") {
          return [
            "drinks",
            "drink",
            "drinks alcoolicos",
            "drinks alcoólicos"
          ].includes(categoriaProduto);
        }

        return categoriaProduto === categoria;
      });

  document.querySelectorAll(".nav-categoria").forEach(botao => {
    botao.classList.toggle("categoria-ativa", resolverCategoriaDoBotao(botao) === categoria);
  });

  renderizarProdutos(produtosFiltrados);
  fecharMenuCategoriasSeMobile();
}

function alternarMenuCategorias() {
  if (!menuCategoriasToggle || !navCategorias) {
    return;
  }

  const menuAberto = navCategorias.classList.toggle("menu-aberto");
  menuCategoriasToggle.classList.toggle("ativo", menuAberto);
  menuCategoriasToggle.setAttribute("aria-expanded", menuAberto ? "true" : "false");
}

function fecharMenuCategoriasSeMobile() {
  if (!menuCategoriasToggle || !navCategorias || window.innerWidth > 720) {
    return;
  }

  navCategorias.classList.remove("menu-aberto");
  menuCategoriasToggle.classList.remove("ativo");
  menuCategoriasToggle.setAttribute("aria-expanded", "false");
}

function configurarFiltroCategorias() {
  const navContainer = document.querySelector(".nav-container");
  const botoesCategoria = Array.from(document.querySelectorAll(".nav-categoria"));

  if (navContainer && !botoesCategoria.some(botao => resolverCategoriaDoBotao(botao) === "todos")) {
    const botaoTodos = document.createElement("div");
    botaoTodos.classList.add("nav-categoria");
    botaoTodos.dataset.categoria = "todos";
    botaoTodos.textContent = "Todos";
    navContainer.appendChild(botaoTodos);
  }

  document.querySelectorAll(".nav-categoria").forEach(botao => {
    botao.dataset.categoria = resolverCategoriaDoBotao(botao);
    botao.addEventListener("click", () => {
      filtrarProdutosPorCategoria(botao.dataset.categoria || "todos");
    });
  });

  if (menuCategoriasToggle) {
    menuCategoriasToggle.addEventListener("click", alternarMenuCategorias);
  }

  window.addEventListener("resize", () => {
    if (window.innerWidth > 720 && navCategorias && menuCategoriasToggle) {
      navCategorias.classList.remove("menu-aberto");
      menuCategoriasToggle.classList.remove("ativo");
      menuCategoriasToggle.setAttribute("aria-expanded", "false");
    }
  });
}

//funcao de adicionar no carrinho
function addCarrinho(ids) {
  const vamosverainda = "vamosverainda/" + ids;

  fetch(vamosverainda)
    .then(res => res.json())
    .then(produto => {
      abrirModalProduto(produto);
    });
}

function removerDoCarrinho(index) {
  if (index === -1) {
    return;
  }

  if (carrinho[index].quantidade > 1) {
    carrinho[index].quantidade -= 1;
    carrinho[index].total = carrinho[index].preco * carrinho[index].quantidade;
  } else {
    carrinho.splice(index, 1);
  }

  renderizarCarrinho();
}

//visualizar carrinho
function abrirModal() {
    overlay.classList.add("active");
}

//botoes do modal do carrinho
function fecharModal() {
    overlay.classList.remove("active");
}

async function finalizarcompra(opcoes = {})
{
    if (pagamentoEmAndamento) {
        return {
            status: "error",
            erro: "Pagamento em andamento."
        };
    }

    const compra = criarObjetoCompra();
    const metodoPagamento = opcoes.metodoPagamento || obterMetodoPagamentoSelecionado();

    if (compra.produtos.length === 0) {
        addMessage("Adicione pelo menos um item antes de finalizar a compra.", "warning");
        return {
            status: "error",
            erro: "Carrinho vazio."
        };
    }

    const produtosIds = compra.produtos.flatMap(item => Array(item.quantidade).fill(item.id));
    const itens = compra.produtos.map(item => ({
        id: item.id,
        nome: item.nome,
        quantidade: item.quantidade,
        preco: item.preco,
        aditivos: item.aditivos || "",
        observacoes: item.observacoes || ""
    }));

    try {
        pagamentoEmAndamento = true;
        const response = await fetch("/feinalizarcompra", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                itens,
                produtos_ids: produtosIds,
                metodo_de_pagamento: metodoPagamento
            })
        });

        const resultado = await lerRespostaJsonSegura(response);

        if (!response.ok) {
            throw new Error(resultado.erro || "Erro ao finalizar compra.");
        }

        carrinho = [];
        renderizarCarrinho();
        fecharModal();
        abrirModalFinalizacao("Compra finalizada com sucesso!");
        console.log("Compra finalizada com sucesso:", resultado);
        return resultado;
    } catch (error) {
        console.error("Erro ao enviar compra:", error);
        addMessage(error.message || "Nao foi possivel finalizar a compra.", "error");
        return {
            status: "error",
            erro: error.message
        };
    } finally {
        pagamentoEmAndamento = false;
    }
}

/* Fecha ao clicar fora do modal */
if (overlay) {
  overlay.addEventListener("click", function(e) {
      if (e.target === overlay) {
          fecharModal();
      }
  });
}

if (overlayConfirmacao) {
  overlayConfirmacao.addEventListener("click", function(e) {
    if (e.target === overlayConfirmacao) {
      fecharModalConfirmacao();
    }
  });
}

if (overlayFinalizacao) {
  overlayFinalizacao.addEventListener("click", function(e) {
    if (e.target === overlayFinalizacao) {
      fecharModalFinalizacao();
    }
  });
}

if (overlayProduto) {
  overlayProduto.addEventListener("click", function(e) {
    if (e.target === overlayProduto) {
      fecharModalProduto();
    }
  });
}

if (overlayPix) {
  overlayPix.addEventListener("click", function(e) {
    if (e.target === overlayPix) {
      fecharModalPix();
    }
  });
}

if (overlayPagamentoInformado) {
  overlayPagamentoInformado.addEventListener("click", function(e) {
    if (e.target === overlayPagamentoInformado) {
      fecharModalPagamentoInformado();
    }
  });
}



configurarFiltroCategorias();

fetch("/rotaparapuxartodososprodutosmasnaopodeterumnomeobvio")
    .then(async res => {
      const produtos = await res.json();
      const promocoesResponse = await fetch("/rotaparapuxartodasaspromocoesmasnaopodeterumnomeobvio");
      const promocoes = await promocoesResponse.json();
      promocoesCarregadas = (promocoes || []).map(normalizarPromocao);

      produtosCarregados = produtos.map(produto => aplicarPromocaoAoProduto({
        ...produto,
        categoria: normalizarCategoria(produto.categoria),
        valor: Number(produto.valor)
      }));

      filtrarProdutosPorCategoria(categoriaSelecionada);
    })
    .catch(error => {
        console.error("Erro ao carregar produtos:", error);
        addMessage("Erro ao carregar cardápio.", "error");
    });
