# Expense Tracker - Full Stack Application

A modern full-stack expense tracking application built with FastAPI and React. This application allows users to manage groups, track expenses, and split bills among group members.

## 🏗️ Architecture

This project follows a clean architecture pattern with clear separation of concerns:

- **Backend**: FastAPI-based REST API with PostgreSQL database
- **Frontend**: React SPA with Material-UI components
- **Database**: PostgreSQL with Alembic migrations
- **Containerization**: Docker and Docker Compose for easy deployment

## 🛠️ Technologies Used

### Backend

- **FastAPI** (0.115.0) - Modern, fast web framework for building APIs
- **SQLAlchemy** (2.0.36) - SQL toolkit and ORM
- **Alembic** (1.13.3) - Database migration tool
- **PostgreSQL** - Primary database
- **Pydantic** (2.9.2) - Data validation using Python type annotations
- **Passlib** (1.7.4) - Password hashing utilities
- **Python-JOSE** (3.3.0) - JWT token handling
- **Uvicorn** (0.30.6) - ASGI server
- **Pytest** (8.3.4) - Testing framework

### Frontend

- **React** (19.1.1) - Frontend library
- **TypeScript** (4.9.5) - Type-safe JavaScript
- **Material-UI** (7.3.2) - React component library
- **React Router** (7.9.1) - Client-side routing
- **TanStack Query** (5.89.0) - Data fetching and caching
- **Axios** (1.12.2) - HTTP client
- **Tailwind CSS** (3.4.17) - Utility-first CSS framework

### DevOps & Infrastructure

- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration
- **Nginx** - Web server for frontend
- **PostgreSQL** - Database server

## 🚀 Quick Start

### Prerequisites

- Docker and Docker Compose
- Node.js 18+ (for local development)
- Python 3.12+ (for local development)

### Running with Docker (Recommended)

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd prototype-client-server
   ```

2. **Set up environment variables**
   Create a `.env` file in the root directory with the following content:

   ```bash
   # Database Configuration
   POSTGRES_USER=appuser
   POSTGRES_PASSWORD=apppassword
   POSTGRES_DB=appdb

   # Backend Configuration
   DATABASE_USER=appuser
   DATABASE_PASSWORD=apppassword
   DATABASE_NAME=appdb
   SECRET_KEY=your-secret-key-here

   # Frontend Configuration
   REACT_APP_API_URL=http://localhost:8000
   ```

   **Note**: For local development, you can also copy the example files:

   - Backend: `cp backend/.env.example backend/.env`
   - Frontend: `cp frontend/.env.example frontend/.env`

3. **Start all services**

   ```bash
   docker-compose up --build
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs

## 🔧 Development Setup

### Running Backend Separately

1. **Navigate to backend directory**

   ```bash
   cd backend
   ```

2. **Create virtual environment**

   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**

   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables**
   Copy the example environment file and modify as needed:

   ```bash
   cp .env.example .env
   ```

   Then edit the `.env` file with your specific values, especially the `SECRET_KEY`.

5. **Start PostgreSQL database**

   ```bash
   docker-compose up db -d
   ```

6. **Run database migrations**

   ```bash
   python run_migrations.py
   ```

7. **Start the development server**
   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

### Running Frontend Separately

1. **Navigate to frontend directory**

   ```bash
   cd frontend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**
   Copy the example environment file:

   ```bash
   cp .env.example .env
   ```

   The default configuration should work for local development.

4. **Start the development server**
   ```bash
   npm start
   ```

The frontend will be available at http://localhost:3000

## 🐳 Docker Commands

### Build and run all services

```bash
docker-compose up --build
```

### Run in detached mode

```bash
docker-compose up -d
```

### Stop all services

```bash
docker-compose down
```

### Stop and remove volumes

```bash
docker-compose down -v
```

### View logs

```bash
# All services
docker-compose logs

# Specific service
docker-compose logs backend
docker-compose logs frontend
docker-compose logs db
```

### Rebuild specific service

```bash
docker-compose up --build backend
```

## 🧪 Testing

### Backend Tests

```bash
cd backend
python -m pytest
```

## 🔄 Database Migrations

### Create a new migration

```bash
cd backend
alembic revision --autogenerate -m "Description of changes"
```

### Apply migrations

```bash
cd backend
alembic upgrade head
```

### Rollback migration

```bash
cd backend
alembic downgrade -1
```

## 🚀 Deployment

### Production Environment Variables

For production deployment, ensure you set secure values for:

- `SECRET_KEY` - Use a strong, random secret key
- `DATABASE_PASSWORD` - Use a strong database password
- `DEBUG=false` - Disable debug mode
- `APP_ENV=production` - Set environment to production

### Docker Production Build

```bash
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up --build
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.
