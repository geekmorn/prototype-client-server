import pytest
from datetime import datetime
from app.models.group import Group, GroupMember
from app.models.user import User
from app.core.security import get_password_hash


class TestGroupModel:
    """Test cases for Group model."""
    
    def test_group_creation(self):
        """Test creating a group with all required fields."""
        group = Group(
            name="Test Group",
            description="A test group",
            created_by_user_id=1
        )
        
        assert group.name == "Test Group"
        assert group.description == "A test group"
        assert group.created_by_user_id == 1
        # Note: created_at and updated_at are set by the database, not the model constructor
    
    def test_group_creation_without_description(self):
        """Test creating a group without description (optional field)."""
        group = Group(
            name="Test Group",
            created_by_user_id=1
        )
        
        assert group.name == "Test Group"
        assert group.description is None
        assert group.created_by_user_id == 1
    
    def test_group_timestamps(self):
        """Test that timestamps are set correctly."""
        group = Group(
            name="Test Group",
            created_by_user_id=1
        )
        
        # Timestamps are None until the object is saved to the database
        assert group.created_at is None
        assert group.updated_at is None
    
    def test_group_relationships(self):
        """Test that group relationships are properly defined."""
        group = Group(
            name="Test Group",
            created_by_user_id=1
        )
        
        # Check that relationships are accessible (empty lists initially)
        assert hasattr(group, 'created_by_user')
        assert hasattr(group, 'members')
        assert hasattr(group, 'expenses')
        assert group.members == []
        assert group.expenses == []


class TestGroupMemberModel:
    """Test cases for GroupMember model."""
    
    def test_group_member_creation(self):
        """Test creating a group member."""
        member = GroupMember(
            group_id=1,
            user_id=1
        )
        
        assert member.group_id == 1
        assert member.user_id == 1
        # Note: joined_at is set by the database, not the model constructor
    
    def test_group_member_timestamps(self):
        """Test that joined_at timestamp is set correctly."""
        member = GroupMember(
            group_id=1,
            user_id=1
        )
        
        # joined_at is None until the object is saved to the database
        assert member.joined_at is None
    
    def test_group_member_relationships(self):
        """Test that group member relationships are properly defined."""
        member = GroupMember(
            group_id=1,
            user_id=1
        )
        
        # Check that relationships are accessible
        assert hasattr(member, 'group')
        assert hasattr(member, 'user')
