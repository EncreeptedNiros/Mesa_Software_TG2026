import logging

from flask import Flask

from config import AppConfig
from controllers.order_controller import OrderController
from controllers.page_controller import PageController
from routes import create_api_blueprint, create_page_blueprint
from services.api_client import MesaApiClient
from services.sales_service import SalesService


class AppFactory:
    @staticmethod
    def create_app() -> Flask:
        app = Flask(
            __name__,
            template_folder=AppConfig.TEMPLATE_FOLDER,
            static_folder=AppConfig.STATIC_FOLDER,
        )
        app.secret_key = AppConfig.SECRET_KEY
        app.logger.setLevel(logging.INFO)

        api_client = MesaApiClient(AppConfig.API_BASE_URL)
        sales_service = SalesService(api_client)
        page_controller = PageController(api_client)
        order_controller = OrderController(api_client, sales_service)

        app.register_blueprint(create_page_blueprint(page_controller))
        app.register_blueprint(create_api_blueprint(order_controller))

        return app
