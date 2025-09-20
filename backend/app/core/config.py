from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field, field_validator


import sys
print(sys.prefix)
class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=(".env",),
        env_file_encoding="utf-8",
        case_sensitive=False,
    )

    app_name: str = "Fast Prototype API"
    app_env: str = "development"
    debug: bool = True

    # Server
    backend_host: str = "0.0.0.0"
    backend_port: int = 8000

    # CORS
    cors_allow_origins: list[str] = Field(
        default_factory=lambda: [
            "http://localhost:3000",
            "http://127.0.0.1:3000",
        ]
    )

    # Database
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

    @field_validator("cors_allow_origins", mode="before")
    @classmethod
    def _parse_cors_origins(cls, value):  # type: ignore[no-untyped-def]
        if value is None or value == "":
            return []
        if isinstance(value, str):
            # Accept comma-separated values
            return [v.strip() for v in value.split(",") if v.strip()]
        return value


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
