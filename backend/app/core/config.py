from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


import sys
print(sys.prefix)
class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file_encoding="utf-8",
        case_sensitive=False,
    )

    app_name: str = "Fast Prototype API"
    app_env: str = "development"
    debug: bool = True
    database_url: str | None = None
    database_host: str = "localhost"
    database_port: int = 5432
    database_user: str  # Required - must be set via environment variable
    database_password: str  # Required - must be set via environment variable
    database_name: str  # Required - must be set via environment variable
    database_sslmode: str = "disable"
    alembic_script_location: str = "alembic"
    
    # JWT settings
    secret_key: str  # Required - must be set via environment variable
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30


@lru_cache
def get_settings() -> Settings:
    settings = Settings()

    if not settings.database_url:
        user = settings.database_user
        password = settings.database_password
        host = settings.database_host
        port = settings.database_port
        name = settings.database_name
        settings.database_url = (
            f"postgresql+asyncpg://{user}:{password}@{host}:{port}/{name}"
        )

    return settings
