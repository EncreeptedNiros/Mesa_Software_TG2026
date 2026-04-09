from dataclasses import asdict, dataclass


@dataclass
class ProdutoVenda:
    Id: int
    Nome: str
    Categoria: str
    Custo: float
    Valor: float
    Receita: str
    ImagemUrl: str

    @classmethod
    def from_api(cls, produto: dict) -> "ProdutoVenda":
        return cls(
            Id=produto.get("id", produto.get("Id", 0)),
            Nome=produto.get("nome", produto.get("Nome", "")),
            Categoria=produto.get("categoria", produto.get("Categoria", "")),
            Custo=float(produto.get("custo", produto.get("Custo", 0))),
            Valor=float(produto.get("valor", produto.get("Valor", 0))),
            Receita=produto.get("receita", produto.get("Receita", "")),
            ImagemUrl=produto.get("imagem_url", produto.get("ImagemUrl", "")),
        )

    def to_dict(self) -> dict:
        return asdict(self)


@dataclass
class VendaPayload:
    Id: int
    data_da_venda: str
    Valor: float
    Metodo_de_pagamento: str
    Lista_de_produtos: list

    def to_dict(self) -> dict:
        return asdict(self)
