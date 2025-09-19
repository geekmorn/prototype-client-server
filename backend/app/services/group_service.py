from typing import Optional, List
from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.group_repository import GroupRepository
from app.repositories.user_repository import UserRepository
from app.schemas.group import GroupCreate, GroupUpdate, GroupRead, GroupMemberCreate, GroupWithMembers
from app.models.group import Group, GroupMember


class GroupService:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session
        self.repo = GroupRepository(session)
        self.user_repo = UserRepository(session)

    async def create_group(self, data: GroupCreate, created_by_user_id: int) -> GroupRead:
        group: Group = await self.repo.create(data, created_by_user_id)
        await self.session.commit()
        
        # Add creator as a member
        await self.repo.add_member(group.id, GroupMemberCreate(user_id=created_by_user_id))
        await self.session.commit()
        
        # Refresh to get the updated group with members
        group = await self.repo.get_by_id(group.id)
        return GroupWithMembers.model_validate(group)

    async def get_group(self, group_id: int) -> Optional[GroupWithMembers]:
        group = await self.repo.get_by_id(group_id)
        if not group:
            return None
        return GroupWithMembers.model_validate(group)

    async def get_user_groups(self, user_id: int) -> List[GroupRead]:
        groups = await self.repo.get_user_groups(user_id)
        return [GroupRead.model_validate(group) for group in groups]

    async def update_group(self, group_id: int, data: GroupUpdate, user_id: int) -> Optional[GroupRead]:
        # Check if user is a member of the group
        if not await self.repo.is_member(group_id, user_id):
            raise ValueError("You are not a member of this group")
        
        group = await self.repo.update(group_id, data)
        if not group:
            return None
        await self.session.commit()
        return GroupRead.model_validate(group)

    async def delete_group(self, group_id: int, user_id: int) -> bool:
        # Check if user is the creator of the group
        group = await self.repo.get_by_id(group_id)
        if not group or group.created_by_user_id != user_id:
            raise ValueError("You can only delete groups you created")
        
        success = await self.repo.delete(group_id)
        if success:
            await self.session.commit()
        return success

    async def add_member(self, group_id: int, data: GroupMemberCreate, added_by_user_id: int) -> Optional[GroupMember]:
        # Check if the user adding members is a member of the group
        if not await self.repo.is_member(group_id, added_by_user_id):
            raise ValueError("You must be a member of the group to add other members")
        
        # Check if the user to be added exists
        user = await self.user_repo.get_by_id(data.user_id)
        if not user:
            raise ValueError("User not found")
        
        member = await self.repo.add_member(group_id, data)
        if member:
            await self.session.commit()
        return member

    async def remove_member(self, group_id: int, user_id_to_remove: int, removed_by_user_id: int) -> bool:
        # Check if the user removing members is a member of the group
        if not await self.repo.is_member(group_id, removed_by_user_id):
            raise ValueError("You must be a member of the group to remove other members")
        
        # Users can remove themselves or the creator can remove anyone
        group = await self.repo.get_by_id(group_id)
        if (user_id_to_remove != removed_by_user_id and 
            group and group.created_by_user_id != removed_by_user_id):
            raise ValueError("You can only remove yourself or be the group creator to remove others")
        
        success = await self.repo.remove_member(group_id, user_id_to_remove)
        if success:
            await self.session.commit()
        return success
