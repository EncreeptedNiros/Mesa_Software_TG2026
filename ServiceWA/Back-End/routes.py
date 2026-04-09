from flask import Blueprint, request

from controllers.order_controller import OrderController
from controllers.page_controller import PageController


def create_page_blueprint(controller: PageController) -> Blueprint:
    pages = Blueprint("pages", __name__)

    pages.add_url_rule("/", endpoint="index", view_func=controller.index, methods=["GET"])
    pages.add_url_rule("/temp", endpoint="temp", view_func=controller.temp, methods=["GET"])
    pages.add_url_rule("/cardapio", endpoint="cardapio", view_func=controller.cardapio, methods=["GET"])
    pages.add_url_rule(
        "/cardapio/mesa/<numero_mesa>",
        endpoint="cardapio_por_mesa",
        view_func=lambda numero_mesa: controller.cardapio_por_mesa(numero_mesa),
        methods=["GET"],
    )
    pages.add_url_rule(
        "/estatisticas",
        endpoint="estatisticas",
        view_func=lambda: controller.protected_page("estatisticas"),
        methods=["GET"],
    )
    pages.add_url_rule(
        "/estoque",
        endpoint="estoque",
        view_func=lambda: controller.protected_page("estoque"),
        methods=["GET"],
    )
    pages.add_url_rule(
        "/login",
        endpoint="login",
        view_func=lambda: controller.login(request),
        methods=["POST"],
    )
    pages.add_url_rule("/sair", endpoint="sair", view_func=controller.sair, methods=["GET"])
    pages.add_url_rule(
        "/pedidos",
        endpoint="pedidos",
        view_func=lambda: controller.protected_page("pedidos"),
        methods=["GET"],
    )
    pages.add_url_rule(
        "/comandas",
        endpoint="comandas",
        view_func=lambda: controller.protected_page("comandas"),
        methods=["GET"],
    )
    pages.add_url_rule(
        "/gestao",
        endpoint="gestao",
        view_func=lambda: controller.protected_page("gestao"),
        methods=["GET"],
    )

    return pages


def create_api_blueprint(controller: OrderController) -> Blueprint:
    api = Blueprint("api", __name__)

    api.add_url_rule(
        "/rotaparapuxartodososprodutosmasnaopodeterumnomeobvio",
        endpoint="listar_produtos",
        view_func=controller.listar_produtos,
        methods=["GET"],
    )
    api.add_url_rule(
        "/rotaparapuxartodosospedidosmasnaopodeterumnomeobvio",
        endpoint="listar_pedidos",
        view_func=controller.listar_pedidos,
        methods=["GET"],
    )
    api.add_url_rule(
        "/rotaparapuxartodasascomandasmasnaopodeterumnomeobvio",
        endpoint="listar_comandas",
        view_func=controller.listar_comandas,
        methods=["GET"],
    )
    api.add_url_rule(
        "/rotaparapuxartodasaspromocoesmasnaopodeterumnomeobvio",
        endpoint="listar_promocoes",
        view_func=controller.listar_promocoes,
        methods=["GET"],
    )
    api.add_url_rule(
        "/criarpromocao",
        endpoint="criar_promocao",
        view_func=controller.criar_promocao,
        methods=["POST"],
    )
    api.add_url_rule(
        "/removerpromocao/<int:promocao_id>",
        endpoint="remover_promocao",
        view_func=controller.remover_promocao,
        methods=["DELETE"],
    )
    api.add_url_rule(
        "/rotaparapuxartodososusuariosmasnaopodeterumnomeobvio",
        endpoint="listar_usuarios",
        view_func=controller.listar_usuarios,
        methods=["GET"],
    )
    api.add_url_rule(
        "/atualizarstatuspedido/<int:pedido_id>",
        endpoint="atualizar_status_pedido",
        view_func=controller.atualizar_status_pedido,
        methods=["PATCH"],
    )
    api.add_url_rule(
        "/atualizarstatuscomanda/<int:comanda_id>",
        endpoint="atualizar_status_comanda",
        view_func=controller.atualizar_status_comanda,
        methods=["PATCH"],
    )
    api.add_url_rule(
        "/criarcomanda",
        endpoint="criar_comanda",
        view_func=controller.criar_comanda,
        methods=["POST"],
    )
    api.add_url_rule(
        "/criarusuario",
        endpoint="criar_usuario",
        view_func=controller.criar_usuario,
        methods=["POST"],
    )
    api.add_url_rule(
        "/removerusuario/<int:usuario_id>",
        endpoint="remover_usuario",
        view_func=controller.remover_usuario,
        methods=["DELETE"],
    )
    api.add_url_rule(
        "/vamosverainda/<ids>",
        endpoint="buscar_produto",
        view_func=controller.buscar_produto,
        methods=["GET"],
    )
    api.add_url_rule(
        "/feinalizarcompra",
        endpoint="finalizar_compra",
        view_func=controller.finalizar_compra,
        methods=["POST"],
    )

    return api
