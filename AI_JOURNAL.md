## AI Tools Used

### 1. GPT Chat Assistant

- **Purpose**: High-level architectural guidance and problem-solving
- **Usage**: Initial project planning and complex problem resolution
- **Effectiveness**: Excellent for conceptual understanding and architectural patterns

### 2. Cursor AI Agent

- **Purpose**: Code generation, implementation, and real-time development assistance
- **Usage**: Writing actual code, implementing features, debugging, and refactoring
- **Effectiveness**: Highly effective for code generation but required significant manual intervention for complex architecture

## Key Challenges and AI Interaction Patterns

### Challenge 1: Project Architecture Setup

**The Problem**: Getting the AI agent to properly understand and implement a clean, modular architecture with proper separation of concerns.

**AI Interaction**:

- Initial prompts were too generic and resulted in basic, non-production-ready code
- Had to iterate multiple times with increasingly specific requirements
- The agent struggled with understanding the full scope of "production-ready" architecture

**Resolution**:

- Broke down the architecture into specific, detailed requirements
- Provided explicit examples of desired patterns (Repository pattern, Service layer, etc.)
- Manually corrected and refined the generated code structure

### Challenge 2: Docker Configuration

**The Problem**: Setting up proper Docker containerization with database dependencies and environment variable management.

**AI Interaction**:

- Agent initially generated basic Dockerfiles without proper dependency management
- Required multiple iterations to get the docker-compose.yml configuration correct
- Environment variable handling needed significant manual adjustment

**Resolution**:

- Provided specific Docker best practices in prompts
- Manually configured the health checks and service dependencies
- Created proper environment variable inheritance patterns

### Challenge 3: Database Integration and Migrations

**The Problem**: Implementing proper database models, relationships, and migration system with Alembic.

**AI Interaction**:

- Agent generated basic models but struggled with complex relationships
- Migration files required manual intervention for proper foreign key constraints
- Database connection pooling and async patterns needed refinement

**Resolution**:

- Provided specific SQLAlchemy patterns and relationship examples
- Manually configured the migration scripts
- Implemented proper async database session management

## Example Prompts Used

### Initial Architecture Setup Prompt

```
Set up a new backend project in a clean directory using Python and the latest stable version of FastAPI.

Requirements:

Project structure should be modular and production-ready.

Separate layers:

Database layer (SQL connection, ORM, migrations).

Repository/DAO layer (data access abstractions).

Service/business logic layer.

API layer (FastAPI routes for frontend communication).

Database connection must be secure and configurable (via environment variables, .env support).

Use best practices for dependency injection, error handling, and project structure.

Prepare for future extension (e.g., authentication, logging, caching).

Keep everything in a clean backend directory, following a maintainable structure.

Deliver:

Directory and file structure.

Example code for DB connection, repository, service, and API route.
```

### Docker Configuration Prompt

```
Create a Dockerfile for the backend:

Use an official Python image.

Install dependencies.

Set working directory and entrypoint for FastAPI.

Create a docker-compose.yml:

Services:

backend (FastAPI)

db (PostgreSQL, latest stable)

Configure environment variables for DB connection (username, password, DB name).

Make sure backend waits for DB to be ready before starting.

Expose necessary ports (backend + PostgreSQL).

Adapt the backend for PostgreSQL communication:

Use SQLAlchemy or async SQLAlchemy (Databases or SQLModel).

Pull DB credentials from environment variables.

Include connection pooling and secure setup.

Provide instructions to build and run containers via docker-compose.

Keep the project structure modular and maintainable.

Deliverables:

Dockerfile for backend

docker-compose.yml

Updated backend DB configuration and example model/service integration
```

### Frontend Integration Prompt

```
Create a React TypeScript frontend for the expense tracker application.

Requirements:

Use Material-UI for components and styling.

Implement user authentication (login/signup).

Create pages for:
- Dashboard with expense overview
- Groups management
- Individual group expense tracking
- User profile

Use React Router for navigation.

Implement proper state management with React Query for API calls.

Create reusable components for forms and data display.

Ensure responsive design.

Integrate with the FastAPI backend endpoints.

Use TypeScript for type safety.

Deliver:

Complete React application structure.

Authentication context and protected routes.

API service layer for backend communication.

Responsive UI components.

Type definitions for all data models.
```
