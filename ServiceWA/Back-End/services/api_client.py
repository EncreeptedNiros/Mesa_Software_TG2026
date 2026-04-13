from json import JSONDecodeError

import requests


class MesaApiClient:
    def __init__(self, base_url: str):
        self.base_url = base_url.rstrip("/")

    def get_produto(self, produto_id) -> dict:
        response = requests.get(f"{self.base_url}/produto/{produto_id}", verify=False)
        response.raise_for_status()
        return response.json()

    def listar_produtos(self, skip: int = 0, take: int = 100) -> list:
        response = requests.get(
            f"{self.base_url}/produto/?skip={skip}&take={take}",
            verify=False,
        )
        response.raise_for_status()
        return response.json()

    def criar_produto(self, payload: dict):
        return requests.post(f"{self.base_url}/produto", json=payload, verify=False)

    def deletar_produto(self, produto_id: int):
        return requests.delete(f"{self.base_url}/produto/{produto_id}", verify=False)

    def listar_pedidos(self, skip: int = 0, take: int = 100) -> list:
        response = requests.get(
            f"{self.base_url}/pedido/?skip={skip}&take={take}",
            verify=False,
        )
        response.raise_for_status()
        return response.json()

    def get_pedido(self, pedido_id: int) -> dict:
        response = requests.get(f"{self.base_url}/pedido/{pedido_id}", verify=False)
        response.raise_for_status()
        return response.json()

    def listar_comandas(self, skip: int = 0, take: int = 100) -> list:
        response = requests.get(
            f"{self.base_url}/comanda/?skip={skip}&take={take}",
            verify=False,
        )
        response.raise_for_status()
        return response.json()

    def listar_promocoes(self, skip: int = 0, take: int = 100) -> list:
        response = requests.get(
            f"{self.base_url}/promocao/?skip={skip}&take={take}",
            verify=False,
        )
        response.raise_for_status()
        return response.json()

    def criar_promocao(self, payload: dict):
        return requests.post(f"{self.base_url}/promocao", json=payload, verify=False)

    def deletar_promocao(self, promocao_id: int):
        return requests.delete(f"{self.base_url}/promocao/{promocao_id}", verify=False)

    def listar_usuarios(self, skip: int = 0, take: int = 100) -> list:
        response = requests.get(
            f"{self.base_url}/usuario/?skip={skip}&take={take}",
            verify=False,
        )
        response.raise_for_status()
        return response.json()

    def atualizar_status_pedido(self, pedido_id: int, status: bool):
        return requests.patch(
            f"{self.base_url}/pedido/{pedido_id}/status",
            json={"Status": status},
            verify=False,
        )

    def atualizar_pedido(self, pedido_id: int, payload: dict):
        return requests.put(f"{self.base_url}/pedido/{pedido_id}", json=payload, verify=False)

    def criar_venda(self, payload: dict):
        return requests.post(f"{self.base_url}/Venda", json=payload, verify=False)

    def criar_pedido(self, payload: dict) -> dict:
        response = requests.post(f"{self.base_url}/Pedido", json=payload, verify=False)
        response.raise_for_status()
        return response.json()

    def get_comanda(self, comanda_id: int) -> dict:
        response = requests.get(f"{self.base_url}/comanda/{comanda_id}", verify=False)
        response.raise_for_status()
        return response.json()

    def atualizar_comanda(self, comanda_id: int, payload: dict):
        return requests.put(f"{self.base_url}/comanda/{comanda_id}", json=payload, verify=False)

    def criar_comanda(self, payload: dict):
        return requests.post(f"{self.base_url}/comanda", json=payload, verify=False)

    def criar_usuario(self, payload: dict):
        return requests.post(f"{self.base_url}/usuario", json=payload, verify=False)

    def deletar_usuario(self, usuario_id: int):
        return requests.delete(f"{self.base_url}/usuario/{usuario_id}", verify=False)

    def autenticar_usuario(self, login: str, senha: str):
        return requests.post(
            f"{self.base_url}/usuario/login",
            json={"Login": login, "Senha": senha},
            verify=False,
        )

    @staticmethod
    def read_json_with_fallback(response) -> dict:
        try:
            return response.json()
        except (ValueError, JSONDecodeError):
            texto = (response.text or "").strip()
            if not texto:
                return {}
            return {"raw_response": texto}
