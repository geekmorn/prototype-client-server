from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.user_repository import UserRepository
from app.schemas.user import UserCreate, UserRead
from app.models.user import User


class UserService:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session
        self.repo = UserRepository(session)

    async def create_user(self, data: UserCreate) -> UserRead:
        existing = await self.repo.get_by_email(data.email)
        if existing:
            raise ValueError("Email already exists")
        user: User = await self.repo.create(data)
        await self.session.commit()
        return UserRead.model_validate(user)

    async def get_user(self, user_id: int) -> Optional[UserRead]:
        user = await self.repo.get_by_id(user_id)
        if not user:
            return None
        return UserRead.model_validate(user)
