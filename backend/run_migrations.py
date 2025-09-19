import asyncio
import os
import sys
from pathlib import Path

project_root = Path(__file__).parent
sys.path.insert(0, str(project_root))

from sqlalchemy.ext.asyncio import create_async_engine
from app.db.session import Base
from app.models.user import User

async def run_migrations():
    database_url = os.getenv("DATABASE_URL")
    if not database_url:
        host = os.getenv("DATABASE_HOST", "localhost")
        port = os.getenv("DATABASE_PORT", "5432")
        user = os.getenv("DATABASE_USER", "appuser")
        password = os.getenv("DATABASE_PASSWORD", "apppassword")
        name = os.getenv("DATABASE_NAME", "appdb")
        database_url = f"postgresql+asyncpg://{user}:{password}@{host}:{port}/{name}"
    
    engine = create_async_engine(database_url)
    
    try:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        print("✅ Database migrations completed successfully")
    except Exception as e:
        print(f"❌ Migration failed: {e}")
        sys.exit(1)
    finally:
        await engine.dispose()

if __name__ == "__main__":
    asyncio.run(run_migrations())
