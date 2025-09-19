from typing import Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from sqlalchemy.orm import selectinload

from app.models.group import Group, GroupMember
from app.models.user import User
from app.schemas.group import GroupCreate, GroupUpdate, GroupMemberCreate


class GroupRepository:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def create(self, data: GroupCreate, created_by_user_id: int) -> Group:
        group = Group(
            name=data.name,
            description=data.description,
            created_by_user_id=created_by_user_id
        )
        self.session.add(group)
        await self.session.flush()
        await self.session.refresh(group)
        return group

    async def get_by_id(self, group_id: int) -> Optional[Group]:
        result = await self.session.execute(
            select(Group)
            .where(Group.id == group_id)
            .options(selectinload(Group.members).selectinload(GroupMember.user))
        )
        return result.scalar_one_or_none()

    async def get_user_groups(self, user_id: int) -> List[Group]:
        result = await self.session.execute(
            select(Group)
            .join(GroupMember)
            .where(GroupMember.user_id == user_id)
            .options(selectinload(Group.members).selectinload(GroupMember.user))
        )
        return result.scalars().all()

    async def update(self, group_id: int, data: GroupUpdate) -> Optional[Group]:
        group = await self.get_by_id(group_id)
        if not group:
            return None
        
        update_data = data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(group, field, value)
        
        await self.session.flush()
        await self.session.refresh(group)
        return group

    async def delete(self, group_id: int) -> bool:
        group = await self.get_by_id(group_id)
        if not group:
            return False
        
        await self.session.delete(group)
        await self.session.flush()
        return True

    async def add_member(self, group_id: int, data: GroupMemberCreate) -> Optional[GroupMember]:
        # Check if user exists
        user = await self.session.execute(select(User).where(User.id == data.user_id))
        if not user.scalar_one_or_none():
            return None
        
        # Check if user is already a member
        existing_member = await self.session.execute(
            select(GroupMember).where(
                and_(GroupMember.group_id == group_id, GroupMember.user_id == data.user_id)
            )
        )
        if existing_member.scalar_one_or_none():
            return None
        
        member = GroupMember(group_id=group_id, user_id=data.user_id)
        self.session.add(member)
        await self.session.flush()
        await self.session.refresh(member)
        return member

    async def remove_member(self, group_id: int, user_id: int) -> bool:
        member = await self.session.execute(
            select(GroupMember).where(
                and_(GroupMember.group_id == group_id, GroupMember.user_id == user_id)
            )
        )
        member = member.scalar_one_or_none()
        
        if not member:
            return False
        
        await self.session.delete(member)
        await self.session.flush()
        return True

    async def is_member(self, group_id: int, user_id: int) -> bool:
        result = await self.session.execute(
            select(GroupMember).where(
                and_(GroupMember.group_id == group_id, GroupMember.user_id == user_id)
            )
        )
        return result.scalar_one_or_none() is not None

    async def get_group_with_members(self, group_id: int) -> Optional[Group]:
        result = await self.session.execute(
            select(Group)
            .where(Group.id == group_id)
            .options(selectinload(Group.members).selectinload(GroupMember.user))
        )
        return result.scalar_one_or_none()
