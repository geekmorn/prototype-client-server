import asyncio
import os

import asyncpg


async def wait_for_db() -> None:
    host = os.environ.get("DATABASE_HOST", "localhost")
    port = int(os.environ.get("DATABASE_PORT", "5432"))
    user = os.environ.get("DATABASE_USER", "appuser")
    password = os.environ.get("DATABASE_PASSWORD", "apppassword")
    database = os.environ.get("DATABASE_NAME", "appdb")

    for attempt in range(60):  # up to ~60 seconds
        try:
            conn = await asyncpg.connect(
                host=host, port=port, user=user, password=password, database=database
            )
            await conn.close()
            return
        except Exception:
            await asyncio.sleep(1)

    raise RuntimeError("Database is not ready after waiting")


if __name__ == "__main__":
    asyncio.run(wait_for_db())


