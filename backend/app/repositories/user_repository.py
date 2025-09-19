from typing import Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_

from app.models.user import User
from app.schemas.user import UserCreate, UserUpdate
from app.core.security import get_password_hash


class UserRepository:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def get_by_id(self, user_id: int) -> Optional[User]:
        result = await self.session.execute(select(User).where(User.id == user_id))
        return result.scalar_one_or_none()

    async def get_by_email(self, email: str) -> Optional[User]:
        result = await self.session.execute(select(User).where(User.email == email))
        return result.scalar_one_or_none()

    async def create(self, data: UserCreate) -> User:
        hashed_password = get_password_hash(data.password)
        user = User(
            email=data.email, 
            full_name=data.full_name,
            hashed_password=hashed_password
        )
        self.session.add(user)
        await self.session.flush()
        await self.session.refresh(user)
        return user

    async def update(self, user_id: int, data: UserUpdate) -> Optional[User]:
        user = await self.get_by_id(user_id)
        if not user:
            return None
        
        update_data = data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(user, field, value)
        
        await self.session.flush()
        await self.session.refresh(user)
        return user

    async def get_all_users(self, name_search: Optional[str] = None) -> List[User]:
        query = select(User)
        
        if name_search:
            # Search in both full_name and email fields
            search_filter = or_(
                User.full_name.ilike(f"%{name_search}%"),
                User.email.ilike(f"%{name_search}%")
            )
            query = query.where(search_filter)
        
        result = await self.session.execute(query)
        return result.scalars().all()
