from flask import jsonify, request, session
from datetime import datetime

from services.api_client import MesaApiClient
from services.sales_service import SalesService


class OrderController:
    def __init__(self, api_client: MesaApiClient, sales_service: SalesService):
        self.api_client = api_client
        self.sales_service = sales_service

    def listar_produtos(self):
        return jsonify(self.api_client.listar_produtos())

    def listar_pedidos(self):
        return jsonify(self.api_client.listar_pedidos())

    def listar_comandas(self):
        try:
            return jsonify(self.api_client.listar_comandas())
        except Exception as error:
            return jsonify(
                {
                    "erro": f"Erro interno: {str(error)}",
                    "status": "error",
                }
            ), 500

    def listar_promocoes(self):
        return jsonify(self.api_client.listar_promocoes())

    def criar_promocao(self):
        try:
            dados = request.get_json() or {}
            payload = {
                "Nome": (dados.get("nome") or "").strip(),
                "Descricao": (dados.get("descricao") or "").strip(),
                "DescontoPercentual": float(dados.get("descontoPercentual") or 0),
                "DataInicio": dados.get("dataInicio") or "",
                "DataFim": dados.get("dataFim") or "",
                "ProdutosIds": [int(item) for item in (dados.get("produtosIds") or [])],
            }

            if not payload["Nome"]:
                return jsonify({"erro": "Nome da promocao e obrigatorio.", "status": "error"}), 400

            if not payload["DataInicio"] or not payload["DataFim"]:
                return jsonify({"erro": "As datas da promocao sao obrigatorias.", "status": "error"}), 400

            if not payload["ProdutosIds"]:
                return jsonify({"erro": "Informe ao menos um produto para a promocao.", "status": "error"}), 400

            response = self.api_client.criar_promocao(payload)
            retorno = self.api_client.read_json_with_fallback(response)
            return jsonify(retorno), response.status_code
        except Exception as error:
            return jsonify(
                {
                    "erro": f"Erro interno: {str(error)}",
                    "status": "error",
                }
            ), 500

    def remover_promocao(self, promocao_id: int):
        try:
            response = self.api_client.deletar_promocao(promocao_id)
            retorno = self.api_client.read_json_with_fallback(response)
            return jsonify(retorno), response.status_code
        except Exception as error:
            return jsonify(
                {
                    "erro": f"Erro interno: {str(error)}",
                    "status": "error",
                }
            ), 500

    def listar_usuarios(self):
        try:
            return jsonify(self.api_client.listar_usuarios())
        except Exception as error:
            return jsonify(
                {
                    "erro": f"Erro interno: {str(error)}",
                    "status": "error",
                }
            ), 500

    def atualizar_status_pedido(self, pedido_id: int):
        try:
            dados = request.get_json() or {}
            response = self.api_client.atualizar_status_pedido(
                pedido_id,
                bool(dados.get("status", True)),
            )
            payload = self.api_client.read_json_with_fallback(response)
            return jsonify(payload), response.status_code
        except Exception as error:
            return jsonify(
                {
                    "erro": f"Erro interno: {str(error)}",
                    "status": "error",
                }
            ), 500

    def atualizar_pedido(self, pedido_id: int):
        try:
            dados = request.get_json() or {}
            pedido_atual = self.api_client.get_pedido(pedido_id)

            if not pedido_atual:
                return jsonify({"erro": "Pedido nao encontrado.", "status": "error"}), 404

            produto = pedido_atual.get("produto", pedido_atual.get("Produto", {}))
            produto_id = produto.get("id", produto.get("Id"))

            if not produto_id:
                return jsonify({"erro": "Produto do pedido nao encontrado.", "status": "error"}), 400

            payload = {
                "Data_da_venda": dados.get(
                    "data_da_venda",
                    pedido_atual.get("data_da_venda", pedido_atual.get("Data_da_venda")),
                ),
                "ProdutoId": int(produto_id),
                "NumeroMesa": (dados.get("numero_mesa") or dados.get("numeroMesa") or "").strip(),
                "Observacoes": (dados.get("observacoes") or "").strip(),
                "Status": bool(dados.get("status", pedido_atual.get("status", pedido_atual.get("Status", False)))),
            }

            response = self.api_client.atualizar_pedido(pedido_id, payload)
            retorno = self.api_client.read_json_with_fallback(response)
            return jsonify(retorno), response.status_code
        except Exception as error:
            return jsonify(
                {
                    "erro": f"Erro interno: {str(error)}",
                    "status": "error",
                }
            ), 500

    def atualizar_status_comanda(self, comanda_id: int):
        try:
            dados = request.get_json() or {}
            status = bool(dados.get("status", True))
            comanda = self.api_client.get_comanda(comanda_id)
            payload = {
                "Id": comanda.get("id", comanda.get("Id", comanda_id)),
                "Cliente": comanda.get("cliente", comanda.get("Cliente", "")),
                "Datadeabertura": comanda.get("datadeabertura", comanda.get("Datadeabertura")),
                "Datadefechamento": dados.get(
                    "data_de_fechamento",
                    comanda.get("datadefechamento", comanda.get("Datadefechamento")),
                ),
                "Status": status,
            }
            response = self.api_client.atualizar_comanda(comanda_id, payload)
            retorno = self.api_client.read_json_with_fallback(response)
            return jsonify(retorno), response.status_code
        except Exception as error:
            return jsonify(
                {
                    "erro": f"Erro interno: {str(error)}",
                    "status": "error",
                }
            ), 500

    def criar_comanda(self):
        try:
            dados = request.get_json() or {}
            cliente = (dados.get("cliente") or "").strip()

            if not cliente:
                return jsonify(
                    {
                        "erro": "Cliente nao informado",
                        "status": "error",
                    }
                ), 400

            payload = {
                "Cliente": cliente,
                "Datadeabertura": dados.get("data_de_abertura") or datetime.now().isoformat(),
                "Datadefechamento": dados.get("data_de_fechamento") or datetime.now().isoformat(),
                "Status": bool(dados.get("status", False)),
            }

            response = self.api_client.criar_comanda(payload)
            retorno = self.api_client.read_json_with_fallback(response)
            return jsonify(retorno), response.status_code
        except Exception as error:
            return jsonify(
                {
                    "erro": f"Erro interno: {str(error)}",
                    "status": "error",
                }
            ), 500

    def criar_usuario(self):
        try:
            dados = request.get_json() or {}
            payload = {
                "Nome": (dados.get("nome") or "").strip(),
                "Login": (dados.get("login") or "").strip(),
                "Senha": (dados.get("senha") or "").strip(),
                "Perfil": (dados.get("perfil") or "Operador").strip() or "Operador",
                "Ativo": bool(dados.get("ativo", True)),
            }

            if not payload["Nome"] or not payload["Login"] or not payload["Senha"]:
                return jsonify(
                    {
                        "erro": "Nome, login e senha sao obrigatorios",
                        "status": "error",
                    }
                ), 400

            response = self.api_client.criar_usuario(payload)
            retorno = self.api_client.read_json_with_fallback(response)
            return jsonify(retorno), response.status_code
        except Exception as error:
            return jsonify(
                {
                    "erro": f"Erro interno: {str(error)}",
                    "status": "error",
                }
            ), 500

    def remover_usuario(self, usuario_id: int):
        try:
            response = self.api_client.deletar_usuario(usuario_id)
            retorno = self.api_client.read_json_with_fallback(response)
            return jsonify(retorno), response.status_code
        except Exception as error:
            return jsonify(
                {
                    "erro": f"Erro interno: {str(error)}",
                    "status": "error",
                }
            ), 500

    def buscar_produto(self, ids: str):
        return jsonify(self.api_client.get_produto(ids))

    def finalizar_compra(self):
        try:
            dados = request.get_json()
            metodo_de_pagamento = (
                dados.get("metodo_de_pagamento", "Nao informado") if dados else "Nao informado"
            )
            usuario_logado = bool(session.get("logged_in"))

            metodo_valido = metodo_de_pagamento == "Pix"
            if usuario_logado and metodo_de_pagamento.startswith("Informe de pagamento"):
                metodo_valido = True

            if not metodo_valido:
                return jsonify(
                    {
                        "erro": "Metodo de pagamento invalido para a sessao atual",
                        "status": "error",
                    }
                ), 400

            if not dados or ("produtos_ids" not in dados and "itens" not in dados):
                return jsonify(
                    {
                        "erro": "Lista de produtos nao fornecida",
                        "status": "error",
                    }
                ), 400

            itens = dados.get("itens") or []
            produtos_ids = dados.get("produtos_ids") or self.sales_service.expandir_produtos_ids_por_itens(itens)

            if not itens:
                itens = [{"id": produto_id, "quantidade": 1} for produto_id in produtos_ids]

            if not isinstance(produtos_ids, list):
                return jsonify(
                    {
                        "erro": "produtos_ids deve ser uma lista",
                        "status": "error",
                    }
                ), 400

            if len(produtos_ids) == 0:
                return jsonify(
                    {
                        "erro": "Lista de produtos vazia",
                        "status": "error",
                    }
                ), 400

            for id_produto in produtos_ids:
                if not isinstance(id_produto, int):
                    return jsonify(
                        {
                            "erro": f"ID {id_produto} nao e um numero inteiro valido",
                            "status": "error",
                        }
                    ), 400

            produtos = self.sales_service.buscar_produtos_por_ids(produtos_ids)
            produtos_por_id = {
                int(produto.get("id", produto.get("Id"))): produto
                for produto in produtos
            }

            venda = self.sales_service.gerar_payload_venda_api(
                produtos_ids,
                produtos,
                itens,
                metodo_de_pagamento=metodo_de_pagamento,
            )

            response_venda = self.api_client.criar_venda(venda)
            if not response_venda.ok:
                return jsonify(
                    {
                        "erro": "Erro ao enviar venda para a API",
                        "status": "error",
                        "detalhes": response_venda.text,
                    }
                ), response_venda.status_code

            venda_criada = response_venda.json()
            pedidos_criados = self.sales_service.gerar_pedidos_para_produtos_por_categoria(
                itens,
                produtos_por_id,
            )

            return jsonify(
                {
                    "status": "success",
                    "mensagem": "Compra finalizada com sucesso!",
                    "dados": {
                        "produtos_ids": produtos_ids,
                        "itens": itens,
                        "quantidade": len(produtos_ids),
                        "pedido_id": venda_criada.get("Id", 0),
                        "venda_enviada": venda,
                        "venda_criada": venda_criada,
                        "pedidos_criados": pedidos_criados,
                    },
                }
            ), 200

        except Exception as error:
            return jsonify(
                {
                    "erro": f"Erro interno: {str(error)}",
                    "status": "error",
                }
            ), 500
