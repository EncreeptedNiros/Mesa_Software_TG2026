import os
from pathlib import Path


class AppConfig:
    BASE_DIR = Path(__file__).resolve().parent
    FRONTEND_DIR = BASE_DIR.parent / "Front-End"

    SECRET_KEY = os.getenv("FLASK_SECRET_KEY", "desenvolvimento-chave-temporaria")
    TEMPLATE_FOLDER = str(FRONTEND_DIR / "templates")
    STATIC_FOLDER = str(FRONTEND_DIR / "static")
    API_BASE_URL = os.getenv("SERVICEWA_API_BASE_URL", "http://mesaapi:5080/api")
