import pytest
from unittest.mock import AsyncMock, patch, MagicMock
from app.repositories.group_repository import GroupRepository
from app.repositories.user_repository import UserRepository
from app.schemas.group import GroupCreate, GroupUpdate, GroupMemberCreate
from app.schemas.user import UserCreate
from app.models.group import Group, GroupMember
from app.models.user import User


class TestGroupRepositoryWorking:
    """Test cases for GroupRepository using proper mocks."""
    
    @pytest.mark.asyncio
    async def test_create_group(self):
        """Test creating a new group."""
        mock_session = AsyncMock()
        mock_session.add = MagicMock()
        mock_session.flush = AsyncMock()
        mock_session.refresh = AsyncMock()
        
        repo = GroupRepository(mock_session)
        group_data = GroupCreate(
            name="Test Group",
            description="A test group"
        )
        
        result = await repo.create(group_data, created_by_user_id=1)
        
        assert result.name == "Test Group"
        assert result.description == "A test group"
        assert result.created_by_user_id == 1
        mock_session.add.assert_called_once()
        mock_session.flush.assert_called_once()
        mock_session.refresh.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_create_group_without_description(self):
        """Test creating a group without description."""
        mock_session = AsyncMock()
        mock_session.add = MagicMock()
        mock_session.flush = AsyncMock()
        mock_session.refresh = AsyncMock()
        
        repo = GroupRepository(mock_session)
        group_data = GroupCreate(name="Test Group")
        
        result = await repo.create(group_data, created_by_user_id=1)
        
        assert result.name == "Test Group"
        assert result.description is None
        assert result.created_by_user_id == 1
    
    @pytest.mark.asyncio
    async def test_get_by_id_existing_group(self):
        """Test getting an existing group by ID."""
        mock_session = AsyncMock()
        mock_group = Group(
            id=1,
            name="Test Group",
            description="A test group",
            created_by_user_id=1
        )
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = mock_group
        mock_session.execute.return_value = mock_result
        
        repo = GroupRepository(mock_session)
        result = await repo.get_by_id(1)
        
        assert result == mock_group
        mock_session.execute.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_get_by_id_nonexistent_group(self):
        """Test getting a non-existent group by ID."""
        mock_session = AsyncMock()
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = None
        mock_session.execute.return_value = mock_result
        
        repo = GroupRepository(mock_session)
        result = await repo.get_by_id(999)
        
        assert result is None
        mock_session.execute.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_get_user_groups(self):
        """Test getting groups for a user."""
        mock_session = AsyncMock()
        mock_groups = [
            Group(id=1, name="Group 1", created_by_user_id=1),
            Group(id=2, name="Group 2", created_by_user_id=1)
        ]
        mock_result = MagicMock()
        mock_result.scalars.return_value.all.return_value = mock_groups
        mock_session.execute.return_value = mock_result
        
        repo = GroupRepository(mock_session)
        result = await repo.get_user_groups(1)
        
        assert len(result) == 2
        assert result[0].name == "Group 1"
        assert result[1].name == "Group 2"
        mock_session.execute.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_update_group_existing(self):
        """Test updating an existing group."""
        mock_session = AsyncMock()
        mock_group = Group(
            id=1,
            name="Test Group",
            description="A test group",
            created_by_user_id=1
        )
        
        # Mock get_by_id
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = mock_group
        mock_session.execute.return_value = mock_result
        
        repo = GroupRepository(mock_session)
        update_data = GroupUpdate(
            name="Updated Group",
            description="Updated description"
        )
        
        result = await repo.update(1, update_data)
        
        assert result == mock_group
        assert result.name == "Updated Group"
        assert result.description == "Updated description"
        mock_session.flush.assert_called_once()
        mock_session.refresh.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_update_group_nonexistent(self):
        """Test updating a non-existent group."""
        mock_session = AsyncMock()
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = None
        mock_session.execute.return_value = mock_result
        
        repo = GroupRepository(mock_session)
        update_data = GroupUpdate(name="Updated Group")
        
        result = await repo.update(999, update_data)
        
        assert result is None
        mock_session.execute.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_delete_group_existing(self):
        """Test deleting an existing group."""
        mock_session = AsyncMock()
        mock_group = Group(
            id=1,
            name="Test Group",
            created_by_user_id=1
        )
        
        # Mock get_by_id
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = mock_group
        mock_session.execute.return_value = mock_result
        mock_session.delete = AsyncMock()
        mock_session.flush = AsyncMock()
        
        repo = GroupRepository(mock_session)
        result = await repo.delete(1)
        
        assert result is True
        mock_session.delete.assert_called_once_with(mock_group)
        mock_session.flush.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_delete_group_nonexistent(self):
        """Test deleting a non-existent group."""
        mock_session = AsyncMock()
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = None
        mock_session.execute.return_value = mock_result
        
        repo = GroupRepository(mock_session)
        result = await repo.delete(999)
        
        assert result is False
        mock_session.execute.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_add_member_success(self):
        """Test successfully adding a member to a group."""
        mock_session = AsyncMock()
        mock_user = User(id=2, email="user2@example.com", full_name="User 2")
        mock_member = GroupMember(id=1, group_id=1, user_id=2)
        
        # Mock user exists check
        mock_user_result = MagicMock()
        mock_user_result.scalar_one_or_none.return_value = mock_user
        
        # Mock member doesn't exist check
        mock_member_result = MagicMock()
        mock_member_result.scalar_one_or_none.return_value = None
        
        # Set up execute to return different results for different calls
        mock_session.execute.side_effect = [mock_user_result, mock_member_result]
        
        mock_session.add = MagicMock()
        mock_session.flush = AsyncMock()
        mock_session.refresh = AsyncMock()
        
        repo = GroupRepository(mock_session)
        member_data = GroupMemberCreate(user_id=2)
        
        result = await repo.add_member(1, member_data)
        
        # The result should be a GroupMember object with the correct attributes
        assert result is not None
        assert result.group_id == 1
        assert result.user_id == 2
        mock_session.add.assert_called_once()
        mock_session.flush.assert_called_once()
        mock_session.refresh.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_add_member_user_not_found(self):
        """Test adding a non-existent user to a group."""
        mock_session = AsyncMock()
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = None
        mock_session.execute.return_value = mock_result
        
        repo = GroupRepository(mock_session)
        member_data = GroupMemberCreate(user_id=999)
        
        result = await repo.add_member(1, member_data)
        
        assert result is None
        mock_session.execute.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_add_member_already_exists(self):
        """Test adding a user who is already a member."""
        mock_session = AsyncMock()
        mock_user = User(id=2, email="user2@example.com", full_name="User 2")
        mock_existing_member = GroupMember(id=1, group_id=1, user_id=2)
        
        # Mock user exists check
        mock_user_result = MagicMock()
        mock_user_result.scalar_one_or_none.return_value = mock_user
        
        # Mock member already exists check
        mock_member_result = MagicMock()
        mock_member_result.scalar_one_or_none.return_value = mock_existing_member
        
        # Set up execute to return different results for different calls
        mock_session.execute.side_effect = [mock_user_result, mock_member_result]
        
        repo = GroupRepository(mock_session)
        member_data = GroupMemberCreate(user_id=2)
        
        result = await repo.add_member(1, member_data)
        
        assert result is None
        assert mock_session.execute.call_count == 2
    
    @pytest.mark.asyncio
    async def test_remove_member_success(self):
        """Test successfully removing a member from a group."""
        mock_session = AsyncMock()
        mock_member = GroupMember(id=1, group_id=1, user_id=2)
        
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = mock_member
        mock_session.execute.return_value = mock_result
        mock_session.delete = AsyncMock()
        mock_session.flush = AsyncMock()
        
        repo = GroupRepository(mock_session)
        result = await repo.remove_member(1, 2)
        
        assert result is True
        mock_session.delete.assert_called_once_with(mock_member)
        mock_session.flush.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_remove_member_not_found(self):
        """Test removing a member who is not in the group."""
        mock_session = AsyncMock()
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = None
        mock_session.execute.return_value = mock_result
        
        repo = GroupRepository(mock_session)
        result = await repo.remove_member(1, 999)
        
        assert result is False
        mock_session.execute.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_is_member_true(self):
        """Test checking if a user is a member of a group."""
        mock_session = AsyncMock()
        mock_member = GroupMember(id=1, group_id=1, user_id=2)
        
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = mock_member
        mock_session.execute.return_value = mock_result
        
        repo = GroupRepository(mock_session)
        result = await repo.is_member(1, 2)
        
        assert result is True
        mock_session.execute.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_is_member_false(self):
        """Test checking if a user is not a member of a group."""
        mock_session = AsyncMock()
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = None
        mock_session.execute.return_value = mock_result
        
        repo = GroupRepository(mock_session)
        result = await repo.is_member(1, 999)
        
        assert result is False
        mock_session.execute.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_get_group_with_members(self):
        """Test getting a group with its members."""
        mock_session = AsyncMock()
        mock_group = Group(
            id=1,
            name="Test Group",
            members=[
                GroupMember(id=1, group_id=1, user_id=1, user=User(id=1, email="user1@example.com")),
                GroupMember(id=2, group_id=1, user_id=2, user=User(id=2, email="user2@example.com"))
            ]
        )
        
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = mock_group
        mock_session.execute.return_value = mock_result
        
        repo = GroupRepository(mock_session)
        result = await repo.get_group_with_members(1)
        
        assert result == mock_group
        assert len(result.members) == 2
        mock_session.execute.assert_called_once()
