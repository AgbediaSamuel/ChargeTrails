from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.app.api.routes import products as products_routes
from backend.app.api.routes import receipts as receipts_routes
from backend.app.core.config import get_cors_origins


def create_app() -> FastAPI:
    app = FastAPI()

    app.add_middleware(
        CORSMiddleware,
        allow_origins=get_cors_origins(),
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(receipts_routes.router)
    app.include_router(products_routes.router)

    return app


app = create_app()
