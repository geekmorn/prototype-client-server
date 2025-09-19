import pytest
import asyncio
from typing import AsyncGenerator, Generator
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.pool import StaticPool
from httpx import AsyncClient, ASGITransport

from app.main import create_app
from app.db.session import Base, get_db_session
from app.core.config import get_settings
from app.models.user import User
from app.models.group import Group, GroupMember
from app.models.expense import Expense
from app.core.security import get_password_hash, create_access_token
from decimal import Decimal


# Test database URL - using in-memory SQLite for testing
TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"

# Create test engine
test_engine = create_async_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
    echo=False,
)

# Create test session factory
TestSessionLocal = async_sessionmaker(
    bind=test_engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


@pytest.fixture(scope="function")
async def db_session() -> AsyncGenerator[AsyncSession, None]:
    """Create a fresh database session for each test."""
    # Create all tables
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    # Create session
    async with TestSessionLocal() as session:
        yield session
    
    # Drop all tables after test
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


@pytest.fixture(scope="function")
async def client(db_session: AsyncSession) -> AsyncGenerator[AsyncClient, None]:
    """Create a test client with database session override."""
    app = create_app()
    
    # Override the database dependency
    async def override_get_db():
        yield db_session
    
    app.dependency_overrides[get_db_session] = override_get_db
    
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        yield ac


@pytest.fixture
async def test_user(db_session: AsyncSession) -> User:
    """Create a test user."""
    user = User(
        email="test@example.com",
        full_name="Test User",
        hashed_password=get_password_hash("testpassword123")
    )
    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)
    return user


@pytest.fixture
async def test_user2(db_session: AsyncSession) -> User:
    """Create a second test user."""
    user = User(
        email="test2@example.com",
        full_name="Test User 2",
        hashed_password=get_password_hash("testpassword123")
    )
    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)
    return user


@pytest.fixture
async def test_group(db_session: AsyncSession, test_user: User) -> Group:
    """Create a test group."""
    group = Group(
        name="Test Group",
        description="A test group",
        created_by_user_id=test_user.id
    )
    db_session.add(group)
    await db_session.commit()
    await db_session.refresh(group)
    
    # Add user as member
    member = GroupMember(group_id=group.id, user_id=test_user.id)
    db_session.add(member)
    await db_session.commit()
    
    return group


@pytest.fixture
async def test_expense(db_session: AsyncSession, test_group: Group, test_user: User) -> Expense:
    """Create a test expense."""
    expense = Expense(
        group_id=test_group.id,
        paid_by_user_id=test_user.id,
        amount=Decimal("25.50"),
        description="Test expense",
        category="Food"
    )
    db_session.add(expense)
    await db_session.commit()
    await db_session.refresh(expense)
    return expense


@pytest.fixture
def auth_headers(test_user: User) -> dict:
    """Create authorization headers for test user."""
    token = create_access_token(data={"sub": str(test_user.id)})
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def auth_headers_user2(test_user2: User) -> dict:
    """Create authorization headers for second test user."""
    token = create_access_token(data={"sub": str(test_user2.id)})
    return {"Authorization": f"Bearer {token}"}