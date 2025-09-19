from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.user_repository import UserRepository
from app.schemas.user import UserCreate, UserRead, UserUpdate, UserLogin, Token
from app.models.user import User
from app.core.security import verify_password, create_access_token
from datetime import timedelta
from app.core.config import get_settings

settings = get_settings()


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

    async def update_user(self, user_id: int, data: UserUpdate) -> Optional[UserRead]:
        user = await self.repo.update(user_id, data)
        if not user:
            return None
        await self.session.commit()
        return UserRead.model_validate(user)

    async def authenticate_user(self, login_data: UserLogin) -> Optional[Token]:
        user = await self.repo.get_by_email(login_data.email)
        if not user or not verify_password(login_data.password, user.hashed_password):
            return None
        
        access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
        access_token = create_access_token(
            data={"sub": str(user.id)}, expires_delta=access_token_expires
        )
        return Token(access_token=access_token, token_type="bearer")
