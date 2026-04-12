from datetime import datetime

from models import ProdutoVenda, VendaPayload
from services.api_client import MesaApiClient


class SalesService:
    categorias_sem_pedido = {
        "tabacaria",
        "bebidas",
        "refrigerantes",
        "energeticos",
        "refrigerantes e energeticos",
        "refrigerantes/energeticos",
        "refrigerantes_energeticos",
        "cervejas",
        "cerveja",
        "vinhos",
        "destilados",
    }

    def __init__(self, api_client: MesaApiClient):
        self.api_client = api_client

    def gerar_objeto_venda(
        self,
        produtos: list,
        metodo_de_pagamento: str = "Nao informado",
        venda_id: int = 0,
    ) -> dict:
        produtos_venda = [ProdutoVenda.from_api(produto).to_dict() for produto in produtos]
        valor_total = sum(produto["Valor"] for produto in produtos_venda)
        venda = VendaPayload(
            Id=venda_id,
            data_da_venda=datetime.now().isoformat(),
            Valor=valor_total,
            Metodo_de_pagamento=metodo_de_pagamento,
            Lista_de_produtos=produtos_venda,
        )
        return venda.to_dict()

    def buscar_produtos_por_ids(self, produtos_ids: list[int]) -> list[dict]:
        return [self.api_client.get_produto(produto_id) for produto_id in produtos_ids]

    def calcular_valor_total(self, produtos: list[dict]) -> float:
        return sum(float(produto.get("valor", produto.get("Valor", 0))) for produto in produtos)

    def calcular_valor_total_por_itens(self, itens: list[dict], produtos: list[dict]) -> float:
        if itens:
            return sum(
                float(item.get("preco", item.get("valor", 0))) * int(item.get("quantidade", 1))
                for item in itens
            )
        return self.calcular_valor_total(produtos)

    def expandir_produtos_ids_por_itens(self, itens: list[dict]) -> list[int]:
        produtos_ids = []
        for item in itens:
            quantidade = int(item.get("quantidade", 1))
            produtos_ids.extend([int(item["id"])] * quantidade)
        return produtos_ids

    def montar_lista_de_produtos_texto_por_itens(self, itens: list[dict]) -> str:
        partes = []
        for item in itens:
            descricao = f'{item.get("nome", "Produto")} x{int(item.get("quantidade", 1))}'
            detalhes = []
            if item.get("aditivos"):
                detalhes.append(f'Aditivos: {item["aditivos"]}')
            if item.get("observacoes"):
                detalhes.append(f'Obs: {item["observacoes"]}')
            if detalhes:
                descricao = f'{descricao} ({", ".join(detalhes)})'
            partes.append(descricao)
        return ", ".join(partes)

    def gerar_payload_venda_api(
        self,
        produtos_ids: list[int],
        produtos: list[dict],
        itens: list[dict],
        metodo_de_pagamento: str = "Nao informado",
    ) -> dict:
        return {
            "data_da_venda": datetime.now().isoformat(),
            "Valor": self.calcular_valor_total_por_itens(itens, produtos),
            "Metodo_de_pagamento": metodo_de_pagamento,
            "Lista_de_produtos_texto": self.montar_lista_de_produtos_texto_por_itens(itens),
            "produtos_ids": produtos_ids,
        }

    def montar_observacoes_pedido(self, item: dict) -> str:
        observacoes = self.remover_marcador_mesa(item.get("observacoes"))
        detalhes = []
        if item.get("aditivos"):
            detalhes.append(f'Aditivos: {item["aditivos"]}')
        if observacoes:
            detalhes.append(f"Obs: {observacoes}")
        return " | ".join(detalhes)

    def extrair_numero_mesa(self, observacoes: str) -> str:
        texto = (observacoes or "").strip()
        if not texto:
            return ""

        import re

        correspondencia = re.search(r"(?:^|\|\s*)Mesa\s+([^|]+)", texto, re.IGNORECASE)
        return (correspondencia.group(1) if correspondencia else "").strip()

    def remover_marcador_mesa(self, observacoes: str) -> str:
        texto = (observacoes or "").strip()
        if not texto:
            return ""

        import re

        return re.sub(r"(?:^|\s*\|\s*)Mesa\s+[^|]+", "", texto, flags=re.IGNORECASE).strip(" |")

    def normalizar_categoria(self, categoria: str) -> str:
        return (categoria or "").strip().lower()

    def categoria_gera_pedido(self, categoria: str) -> bool:
        return self.normalizar_categoria(categoria) not in self.categorias_sem_pedido

    def gerar_pedidos_para_produtos_por_categoria(
        self,
        itens: list[dict],
        produtos_por_id: dict[int, dict],
    ) -> list[dict]:
        pedidos_criados = []
        for item in itens:
            produto = produtos_por_id.get(int(item["id"]))
            if not produto:
                continue
            categoria = produto.get("categoria", produto.get("Categoria", ""))
            if not self.categoria_gera_pedido(categoria):
                continue
            quantidade = int(item.get("quantidade", 1))
            for _ in range(quantidade):
                payload_pedido = {
                    "Data_da_venda": datetime.now().isoformat(),
                    "ProdutoId": produto.get("id", produto.get("Id")),
                    "NumeroMesa": self.extrair_numero_mesa(item.get("observacoes")),
                    "Observacoes": self.montar_observacoes_pedido(item),
                    "Status": False,
                }
                pedidos_criados.append(self.api_client.criar_pedido(payload_pedido))
        return pedidos_criados
