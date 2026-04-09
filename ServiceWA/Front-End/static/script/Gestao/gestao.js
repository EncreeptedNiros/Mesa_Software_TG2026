const produtoForm = document.getElementById("produto-form");
const produtosLista = document.getElementById("gestao-produtos-lista");
const produtoFormStatus = document.getElementById("produto-form-status");
const botaoAtualizarProdutos = document.getElementById("atualizar-produtos");
const promocaoForm = document.getElementById("promocao-form");
const promocoesLista = document.getElementById("gestao-promocoes-lista");
const promocaoFormStatus = document.getElementById("promocao-form-status");
const botaoAtualizarPromocoes = document.getElementById("atualizar-promocoes");
const usuarioForm = document.getElementById("usuario-form");
const usuariosLista = document.getElementById("gestao-usuarios-lista");
const usuarioFormStatus = document.getElementById("usuario-form-status");
const botaoAtualizarUsuarios = document.getElementById("atualizar-usuarios");
const botaoToggleProdutosCard = document.getElementById("toggle-produtos-card");
const produtosCardConteudo = document.getElementById("produtos-card-conteudo");
const botaoTogglePromocoesCard = document.getElementById("toggle-promocoes-card");
const promocoesCardConteudo = document.getElementById("promocoes-card-conteudo");
const botaoToggleUsuariosCard = document.getElementById("toggle-usuarios-card");
const usuariosCardConteudo = document.getElementById("usuarios-card-conteudo");
const apiProdutosUrl = "http://localhost:5080/api/produto";
const apiPromocoesProxyUrl = "/rotaparapuxartodasaspromocoesmasnaopodeterumnomeobvio";
const apiUsuariosProxyUrl = "/rotaparapuxartodososusuariosmasnaopodeterumnomeobvio";
const storageKeyProdutosCard = "gestao_produtos_card_retraido";
const storageKeyPromocoesCard = "gestao_promocoes_card_retraido";
const storageKeyUsuariosCard = "gestao_usuarios_card_retraido";

function definirStatusFormulario(texto, tipo = "") {
  if (!produtoFormStatus) {
    return;
  }

  produtoFormStatus.textContent = texto;
  produtoFormStatus.dataset.tipo = tipo;
}

function definirStatusPromocao(texto, tipo = "") {
  if (!promocaoFormStatus) {
    return;
  }

  promocaoFormStatus.textContent = texto;
  promocaoFormStatus.dataset.tipo = tipo;
}

function definirStatusUsuario(texto, tipo = "") {
  if (!usuarioFormStatus) {
    return;
  }

  usuarioFormStatus.textContent = texto;
  usuarioFormStatus.dataset.tipo = tipo;
}

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

function renderizarProdutos(produtos) {
  if (!produtosLista) {
    return;
  }

  if (!produtos.length) {
    produtosLista.innerHTML = `
      <div class="produto-card">
        <h4>Nenhum produto cadastrado</h4>
        <p class="produto-meta">Quando houver itens no cardapio, eles aparecerao aqui.</p>
      </div>
    `;
    return;
  }

  produtosLista.innerHTML = produtos.map(produto => `
    <article class="produto-card">
      <h4>${produto.nome}</h4>
      <p class="produto-meta">Categoria: ${produto.categoria}</p>
      <p class="produto-meta">Custo: R$ ${Number(produto.custo).toFixed(2)}</p>
      <p class="produto-meta">Valor: R$ ${Number(produto.valor).toFixed(2)}</p>
      <button type="button" onclick="removerProduto(${produto.id}, '${String(produto.nome).replace(/'/g, "\\'")}')">Remover produto</button>
    </article>
  `).join("");
}

function formatarDataPromocao(valor) {
  if (!valor) {
    return "Sem data";
  }

  const data = new Date(valor);

  if (Number.isNaN(data.getTime())) {
    return valor;
  }

  return data.toLocaleString("pt-BR");
}

function renderizarPromocoes(promocoes) {
  if (!promocoesLista) {
    return;
  }

  if (!promocoes.length) {
    promocoesLista.innerHTML = `
      <div class="produto-card">
        <h4>Nenhuma promocao cadastrada</h4>
        <p class="produto-meta">As promocoes criadas para o cardapio aparecerao aqui.</p>
      </div>
    `;
    return;
  }

  promocoesLista.innerHTML = promocoes.map(promocao => `
    <article class="produto-card">
      <h4>${promocao.nome}</h4>
      <p class="produto-meta">Desconto: ${Number(promocao.descontoPercentual).toFixed(2)}%</p>
      <p class="produto-meta">Inicio: ${formatarDataPromocao(promocao.dataInicio)}</p>
      <p class="produto-meta">Fim: ${formatarDataPromocao(promocao.dataFim)}</p>
      <p class="produto-meta">Produtos: ${(promocao.produtosIds || []).join(", ") || "Nao informado"}</p>
      ${promocao.descricao ? `<p class="produto-meta">${promocao.descricao}</p>` : ""}
      <button type="button" onclick="removerPromocao(${promocao.id}, '${String(promocao.nome).replace(/'/g, "\\'")}')">Remover promocao</button>
    </article>
  `).join("");
}

function renderizarUsuarios(usuarios) {
  if (!usuariosLista) {
    return;
  }

  if (!usuarios.length) {
    usuariosLista.innerHTML = `
      <div class="produto-card">
        <h4>Nenhum usuario cadastrado</h4>
        <p class="produto-meta">Os usuarios criados para acesso ao sistema aparecerao aqui.</p>
      </div>
    `;
    return;
  }

  usuariosLista.innerHTML = usuarios.map(usuario => `
    <article class="produto-card">
      <h4>${usuario.nome}</h4>
      <p class="produto-meta">Login: ${usuario.login}</p>
      <p class="produto-meta">Perfil: ${usuario.perfil}</p>
      <p class="produto-meta">Status: ${usuario.ativo ? "Ativo" : "Inativo"}</p>
      <button type="button" onclick="removerUsuario(${usuario.id}, '${String(usuario.nome).replace(/'/g, "\\'")}')">Remover usuario</button>
    </article>
  `).join("");
}

async function carregarProdutos() {
  definirStatusFormulario("Carregando produtos...", "info");

  try {
    const response = await fetch(`${apiProdutosUrl}?skip=0&take=100`);
    const produtos = await lerRespostaJsonSegura(response);

    if (!response.ok) {
      throw new Error(produtos.erro || "Nao foi possivel carregar os produtos.");
    }

    renderizarProdutos(produtos);
    definirStatusFormulario("Lista atualizada.", "success");
  } catch (error) {
    definirStatusFormulario(error.message || "Erro ao carregar produtos.", "error");
  }
}

async function carregarPromocoes() {
  definirStatusPromocao("Carregando promocoes...", "info");

  try {
    const response = await fetch(apiPromocoesProxyUrl);
    const promocoes = await lerRespostaJsonSegura(response);

    if (!response.ok) {
      throw new Error(promocoes.erro || "Nao foi possivel carregar as promocoes.");
    }

    renderizarPromocoes(promocoes);
    definirStatusPromocao("Lista atualizada.", "success");
  } catch (error) {
    definirStatusPromocao(error.message || "Erro ao carregar promocoes.", "error");
  }
}

async function carregarUsuarios() {
  definirStatusUsuario("Carregando usuarios...", "info");

  try {
    const response = await fetch(apiUsuariosProxyUrl);
    const usuarios = await lerRespostaJsonSegura(response);

    if (!response.ok) {
      throw new Error(usuarios.erro || "Nao foi possivel carregar os usuarios.");
    }

    renderizarUsuarios(usuarios);
    definirStatusUsuario("Lista atualizada.", "success");
  } catch (error) {
    definirStatusUsuario(error.message || "Erro ao carregar usuarios.", "error");
  }
}

async function removerProduto(id, nome) {
  const confirmar = window.confirm(`Deseja remover o produto "${nome}" do cardapio?`);

  if (!confirmar) {
    return;
  }

  definirStatusFormulario(`Removendo ${nome}...`, "info");

  try {
    const response = await fetch(`${apiProdutosUrl}/${id}`, {
      method: "DELETE"
    });
    const resultado = await lerRespostaJsonSegura(response);

    if (!response.ok) {
      throw new Error(resultado.erro || "Nao foi possivel remover o produto.");
    }

    definirStatusFormulario(resultado.mensagem || "Produto removido com sucesso.", "success");
    await carregarProdutos();
  } catch (error) {
    definirStatusFormulario(error.message || "Erro ao remover produto.", "error");
  }
}

async function removerPromocao(id, nome) {
  const confirmar = window.confirm(`Deseja remover a promocao "${nome}"?`);

  if (!confirmar) {
    return;
  }

  definirStatusPromocao(`Removendo ${nome}...`, "info");

  try {
    const response = await fetch(`/removerpromocao/${id}`, {
      method: "DELETE"
    });
    const resultado = await lerRespostaJsonSegura(response);

    if (!response.ok) {
      throw new Error(resultado.erro || "Nao foi possivel remover a promocao.");
    }

    definirStatusPromocao(resultado.mensagem || "Promocao removida com sucesso.", "success");
    await carregarPromocoes();
  } catch (error) {
    definirStatusPromocao(error.message || "Erro ao remover promocao.", "error");
  }
}

async function removerUsuario(id, nome) {
  const confirmar = window.confirm(`Deseja remover o usuario "${nome}"?`);

  if (!confirmar) {
    return;
  }

  definirStatusUsuario(`Removendo ${nome}...`, "info");

  try {
    const response = await fetch(`/removerusuario/${id}`, {
      method: "DELETE"
    });
    const resultado = await lerRespostaJsonSegura(response);

    if (!response.ok) {
      throw new Error(resultado.erro || "Nao foi possivel remover o usuario.");
    }

    definirStatusUsuario(resultado.mensagem || "Usuario removido com sucesso.", "success");
    await carregarUsuarios();
  } catch (error) {
    definirStatusUsuario(error.message || "Erro ao remover usuario.", "error");
  }
}

function obterListaProdutosPromocao(valor) {
  return valor
    .split(",")
    .map(item => Number(item.trim()))
    .filter(item => Number.isInteger(item) && item > 0);
}

function lerArquivoComoDataUrl(arquivo) {
  return new Promise((resolve, reject) => {
    if (!arquivo) {
      resolve("");
      return;
    }

    const leitor = new FileReader();
    leitor.onload = () => resolve(typeof leitor.result === "string" ? leitor.result : "");
    leitor.onerror = () => reject(new Error("Nao foi possivel ler a imagem selecionada."));
    leitor.readAsDataURL(arquivo);
  });
}

function alternarCardProdutos() {
  if (!produtosCardConteudo || !botaoToggleProdutosCard) {
    return;
  }

  const retraido = produtosCardConteudo.classList.toggle("retraido");
  botaoToggleProdutosCard.textContent = retraido ? "Expandir" : "Retrair";
  localStorage.setItem(storageKeyProdutosCard, retraido ? "true" : "false");
}

function aplicarEstadoSalvoDoCardProdutos() {
  if (!produtosCardConteudo || !botaoToggleProdutosCard) {
    return;
  }

  const retraidoSalvo = localStorage.getItem(storageKeyProdutosCard) === "true";
  produtosCardConteudo.classList.toggle("retraido", retraidoSalvo);
  botaoToggleProdutosCard.textContent = retraidoSalvo ? "Expandir" : "Retrair";
}

function alternarCardPromocoes() {
  if (!promocoesCardConteudo || !botaoTogglePromocoesCard) {
    return;
  }

  const retraido = promocoesCardConteudo.classList.toggle("retraido");
  botaoTogglePromocoesCard.textContent = retraido ? "Expandir" : "Retrair";
  localStorage.setItem(storageKeyPromocoesCard, retraido ? "true" : "false");
}

function aplicarEstadoSalvoDoCardPromocoes() {
  if (!promocoesCardConteudo || !botaoTogglePromocoesCard) {
    return;
  }

  const retraidoSalvo = localStorage.getItem(storageKeyPromocoesCard) === "true";
  promocoesCardConteudo.classList.toggle("retraido", retraidoSalvo);
  botaoTogglePromocoesCard.textContent = retraidoSalvo ? "Expandir" : "Retrair";
}

function alternarCardUsuarios() {
  if (!usuariosCardConteudo || !botaoToggleUsuariosCard) {
    return;
  }

  const retraido = usuariosCardConteudo.classList.toggle("retraido");
  botaoToggleUsuariosCard.textContent = retraido ? "Expandir" : "Retrair";
  localStorage.setItem(storageKeyUsuariosCard, retraido ? "true" : "false");
}

function aplicarEstadoSalvoDoCardUsuarios() {
  if (!usuariosCardConteudo || !botaoToggleUsuariosCard) {
    return;
  }

  const retraidoSalvo = localStorage.getItem(storageKeyUsuariosCard) === "true";
  usuariosCardConteudo.classList.toggle("retraido", retraidoSalvo);
  botaoToggleUsuariosCard.textContent = retraidoSalvo ? "Expandir" : "Retrair";
}

if (produtoForm) {
  produtoForm.addEventListener("submit", async event => {
    event.preventDefault();

    definirStatusFormulario("Salvando produto...", "info");

    try {
      const arquivoImagem = document.getElementById("produto-imagem")?.files?.[0] || null;
      const payload = {
        nome: document.getElementById("produto-nome")?.value?.trim() || "",
        categoria: document.getElementById("produto-categoria")?.value?.trim() || "",
        custo: Number(document.getElementById("produto-custo")?.value || 0),
        valor: Number(document.getElementById("produto-valor")?.value || 0),
        receita: document.getElementById("produto-receita")?.value?.trim() || "",
        imagemUrl: await lerArquivoComoDataUrl(arquivoImagem)
      };

      const response = await fetch(apiProdutosUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });
      const resultado = await lerRespostaJsonSegura(response);

      if (!response.ok) {
        throw new Error(resultado.erro || "Nao foi possivel adicionar o produto.");
      }

      produtoForm.reset();
      definirStatusFormulario(`Produto "${resultado.nome}" adicionado com sucesso.`, "success");
      await carregarProdutos();
    } catch (error) {
      definirStatusFormulario(error.message || "Erro ao adicionar produto.", "error");
    }
  });
}

if (promocaoForm) {
  promocaoForm.addEventListener("submit", async event => {
    event.preventDefault();

    const payload = {
      nome: document.getElementById("promocao-nome")?.value?.trim() || "",
      descricao: document.getElementById("promocao-descricao")?.value?.trim() || "",
      descontoPercentual: Number(document.getElementById("promocao-desconto")?.value || 0),
      dataInicio: document.getElementById("promocao-data-inicio")?.value || "",
      dataFim: document.getElementById("promocao-data-fim")?.value || "",
      produtosIds: obterListaProdutosPromocao(document.getElementById("promocao-produtos")?.value || "")
    };

    definirStatusPromocao("Salvando promocao...", "info");

    try {
      const response = await fetch("/criarpromocao", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });
      const resultado = await lerRespostaJsonSegura(response);

      if (!response.ok) {
        throw new Error(resultado.erro || "Nao foi possivel adicionar a promocao.");
      }

      promocaoForm.reset();
      definirStatusPromocao(`Promocao "${resultado.nome}" adicionada com sucesso.`, "success");
      await carregarPromocoes();
    } catch (error) {
      definirStatusPromocao(error.message || "Erro ao adicionar promocao.", "error");
    }
  });
}

if (usuarioForm) {
  usuarioForm.addEventListener("submit", async event => {
    event.preventDefault();

    const payload = {
      nome: document.getElementById("usuario-nome")?.value?.trim() || "",
      login: document.getElementById("usuario-login")?.value?.trim() || "",
      senha: document.getElementById("usuario-senha")?.value || "",
      perfil: document.getElementById("usuario-perfil")?.value || "Operador",
      ativo: Boolean(document.getElementById("usuario-ativo")?.checked)
    };

    definirStatusUsuario("Salvando usuario...", "info");

    try {
      const response = await fetch("/criarusuario", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });
      const resultado = await lerRespostaJsonSegura(response);

      if (!response.ok) {
        throw new Error(resultado.erro || "Nao foi possivel adicionar o usuario.");
      }

      usuarioForm.reset();
      const campoAtivo = document.getElementById("usuario-ativo");
      const campoPerfil = document.getElementById("usuario-perfil");
      if (campoAtivo) {
        campoAtivo.checked = true;
      }
      if (campoPerfil) {
        campoPerfil.value = "Operador";
      }
      definirStatusUsuario(`Usuario "${resultado.nome}" adicionado com sucesso.`, "success");
      await carregarUsuarios();
    } catch (error) {
      definirStatusUsuario(error.message || "Erro ao adicionar usuario.", "error");
    }
  });
}

if (botaoAtualizarProdutos) {
  botaoAtualizarProdutos.addEventListener("click", carregarProdutos);
}

if (botaoAtualizarPromocoes) {
  botaoAtualizarPromocoes.addEventListener("click", carregarPromocoes);
}

if (botaoAtualizarUsuarios) {
  botaoAtualizarUsuarios.addEventListener("click", carregarUsuarios);
}

if (botaoToggleProdutosCard) {
  botaoToggleProdutosCard.addEventListener("click", alternarCardProdutos);
}

if (botaoTogglePromocoesCard) {
  botaoTogglePromocoesCard.addEventListener("click", alternarCardPromocoes);
}

if (botaoToggleUsuariosCard) {
  botaoToggleUsuariosCard.addEventListener("click", alternarCardUsuarios);
}

window.removerProduto = removerProduto;
window.removerPromocao = removerPromocao;
window.removerUsuario = removerUsuario;

aplicarEstadoSalvoDoCardProdutos();
aplicarEstadoSalvoDoCardPromocoes();
aplicarEstadoSalvoDoCardUsuarios();
carregarProdutos();
carregarPromocoes();
carregarUsuarios();
