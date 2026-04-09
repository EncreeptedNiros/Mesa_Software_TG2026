const overlay = document.getElementById("overlay");
const chatBox = document.getElementById("chat-box");

function abrirModal() {
    if (!overlay) {
        return;
    }

    overlay.classList.add("active");
}

function fecharModal() {
    if (!overlay) {
        return;
    }

    overlay.classList.remove("active");
}

if (chatBox) {
    fetch("/rotaparapuxartodosospedidosmasnaopodeterumnomeobvio")
        .then(res => res.json())
        .then(pedidos => {
            chatBox.innerHTML = "";

            pedidos.forEach(pedido => {
                const div = document.createElement("div");
                div.classList.add("chat-message");

                div.innerHTML = `
                    <h3>${pedido.produto}</h3>
                    <button style="margin-right:5px;" data-id="${pedido.id}" onclick="addCarrinho(${pedido.id})"><h2>Adicionar</h2></button>
                `;

                chatBox.appendChild(div);
            });
        })
        .catch(error => {
            console.error("Erro ao carregar pedidos:", error);
        });
}
