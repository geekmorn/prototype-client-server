from __future__ import annotations
import asyncio
import sys
from pathlib import Path
from logging.config import fileConfig
from sqlalchemy import pool
from sqlalchemy.engine import Connection
from sqlalchemy.ext.asyncio import create_async_engine
from alembic import context
import os

# Add the project root to the Python path for imports
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))

config = context.config

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

from app.db.session import Base  # noqa: E402
from app.models.user import User  # noqa: F401, E402
from app.models.group import Group, GroupMember  # noqa: F401, E402
from app.models.expense import Expense  # noqa: F401, E402

target_metadata = Base.metadata

# Get database URL from environment variables
DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    # Build from parts to mirror app settings
    host = os.getenv("DATABASE_HOST", "localhost")
    port = os.getenv("DATABASE_PORT", "5432")
    user = os.getenv("DATABASE_USER")
    password = os.getenv("DATABASE_PASSWORD")
    name = os.getenv("DATABASE_NAME")
    
    if not all([user, password, name]):
        raise ValueError("DATABASE_USER, DATABASE_PASSWORD, and DATABASE_NAME environment variables must be set")
    sslmode = os.getenv("DATABASE_SSLMODE", "disable")
    
    # For asyncpg, we don't include sslmode in URL - SSL is configured differently
    DATABASE_URL = f"postgresql+asyncpg://{user}:{password}@{host}:{port}/{name}"


def run_migrations_offline() -> None:
    url = DATABASE_URL
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        compare_type=True,
    )

    with context.begin_transaction():
        context.run_migrations()


def do_run_migrations(connection: Connection) -> None:
    context.configure(connection=connection, target_metadata=target_metadata, compare_type=True)

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    connectable = create_async_engine(DATABASE_URL, poolclass=pool.NullPool)

    async def run_async_migrations() -> None:
        async with connectable.connect() as connection:
            await connection.run_sync(do_run_migrations)

    asyncio.run(run_async_migrations())


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
