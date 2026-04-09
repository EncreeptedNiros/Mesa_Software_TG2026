from flask import current_app, flash, redirect, render_template, request, session, url_for
from services.api_client import MesaApiClient


class PageController:
    def __init__(self, api_client: MesaApiClient):
        self.api_client = api_client

    protected_templates = {
        "estatisticas": "Estatisticas/estatisticas.html",
        "estoque": "Estoque/estoque.html",
        "pedidos": "Pedidos/Pedidos.html",
        "comandas": "Comandas/comandas.html",
        "gestao": "Gestao/gestao.html",
    }

    def index(self):
        return render_template("index.html", **self._build_index_context())

    def temp(self):
        return render_template("Cardapio/cardapiotemp.html")

    def cardapio(self):
        numero_mesa = (request.args.get("mesa") or "").strip()
        return render_template(
            "Cardapio/cardapio.html",
            logged_in=bool(session.get("logged_in")),
            numero_mesa=numero_mesa,
        )

    def cardapio_por_mesa(self, numero_mesa: str):
        numero_mesa_normalizado = (numero_mesa or "").strip()
        return redirect(url_for("pages.cardapio", mesa=numero_mesa_normalizado))

    def protected_page(self, page_name: str):
        if not session.get("logged_in"):
            return redirect(url_for("pages.cardapio"))
        return render_template(self.protected_templates[page_name])

    def login(self, request):
        username = request.form["username"].strip()
        password = request.form["password"]

        if not username or not password:
            current_app.logger.warning("Login recusado no ServiceWA por campos vazios. usuario='%s'", username)
            return render_template(
                "index.html",
                **self._build_index_context(erro="Informe login e senha.", user=username or "Usuario"),
            )

        try:
            current_app.logger.info("Tentativa de login no ServiceWA. usuario='%s'", username)
            response = self.api_client.autenticar_usuario(username, password)
            dados_usuario = self.api_client.read_json_with_fallback(response)
            current_app.logger.info(
                "Resposta da API de login. usuario='%s' status=%s corpo=%s",
                username,
                response.status_code,
                dados_usuario,
            )

            if not response.ok:
                return render_template(
                    "index.html",
                    **self._build_index_context(
                        erro=dados_usuario.get("erro", "Credenciais invalidas"),
                        user=username,
                    ),
                )

            session["user_id"] = dados_usuario.get("id", dados_usuario.get("Id"))
            session["username"] = dados_usuario.get("nome", dados_usuario.get("Nome", username))
            session["user_login"] = dados_usuario.get("login", dados_usuario.get("Login", username))
            session["user_role"] = dados_usuario.get("perfil", dados_usuario.get("Perfil", "Operador"))
            session["logged_in"] = True
            current_app.logger.info("Login concluido no ServiceWA. usuario='%s' perfil='%s'", username, session["user_role"])
            return redirect(url_for("pages.index"))
        except Exception as error:
            current_app.logger.exception("Falha ao validar login no ServiceWA. usuario='%s' erro=%s", username, error)
            return render_template(
                "index.html",
                **self._build_index_context(
                    erro="Nao foi possivel validar o login no momento.",
                    user=username,
                ),
            )

    def sair(self):
        if not session.get("logged_in"):
            return redirect(url_for("pages.cardapio"))

        username = session.get("username", "Usuario")
        session.clear()
        flash(f"Ate mais, {username}!", "info")
        return redirect(url_for("pages.index"))

    def _build_index_context(self, erro=None, user=None):
        return {
            "user": user or session.get("username", "Usuario"),
            "erro": erro,
            "logged_in": bool(session.get("logged_in")),
            "user_role": session.get("user_role", ""),
            "user_login": session.get("user_login", ""),
        }
