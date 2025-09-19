import uvicorn
from fastapi import FastAPI

from app.core.config import get_settings
from app.api.routes import users as users_routes, groups as groups_routes, expenses as expenses_routes


def create_app() -> FastAPI:
    settings = get_settings()
    app = FastAPI(title=settings.app_name, debug=settings.debug)

    app.include_router(users_routes.router)
    app.include_router(groups_routes.router)
    app.include_router(expenses_routes.router)
    return app


app = create_app()


if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
