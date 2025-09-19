## Backend (FastAPI) - Fast Prototype

### Requirements
- Python 3.11+
- Virtualenv

### Setup
```bash
cd /home/user/Projects/fast-prototype/backend
cp .env.example .env
python3 -m venv .venv
source .venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
```

### Database (PostgreSQL via Docker)
- In Docker, DB settings are provided via env parts and composed automatically.
- Environment variables:
  - `DATABASE_HOST` (default `db` in Docker)
  - `DATABASE_PORT` (default `5432`)
  - `DATABASE_USER` (default `appuser`)
  - `DATABASE_PASSWORD` (default `apppassword`)
  - `DATABASE_NAME` (default `appdb`)
  - `DATABASE_SSLMODE` (default `disable`)
  - Or set `DATABASE_URL` directly (takes precedence).

### Alembic (migrations)
Initialize once (already scaffolded here, but if needed):
```bash
alembic revision --autogenerate -m "init users"
alembic upgrade head
```

### Run locally (without Docker)
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### Docker & docker-compose
Build and run the full stack (API + PostgreSQL):
```bash
cd /home/user/Projects/fast-prototype
docker compose up --build
```

Override credentials/DB name as needed:
```bash
POSTGRES_USER=myuser POSTGRES_PASSWORD=mypassword POSTGRES_DB=mydb \
docker compose up --build
```

This waits for the DB to be healthy before starting the API. API will be at `http://localhost:8000` and PostgreSQL at `localhost:5432`.

### Example endpoints
- POST `/users/` with body `{ "email": "a@b.com", "full_name": "Alice" }`
- GET `/users/{id}`

### Project structure
```text
backend/
  app/
    api/
      deps.py
      routes/
        users.py
    core/
      config.py
    db/
      session.py
    models/
      __init__.py
      user.py
    repositories/
      user_repository.py
    schemas/
      user.py
    services/
      user_service.py
    main.py
  alembic/
    env.py
    script.py.mako
    versions/
  .env.example
  requirements.txt
  README.md
```

### Notes
- Uses Pydantic Settings for `.env`.
- Async SQLAlchemy 2.0 pattern, repository/service layers.
- Ready for extension (auth, logging, caching) via new modules under `core/` and middlewares.
