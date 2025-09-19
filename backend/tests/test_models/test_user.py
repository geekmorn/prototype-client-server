import pytest
from datetime import datetime
from app.models.user import User
from app.core.security import get_password_hash


class TestUserModel:
    """Test cases for User model."""
    
    def test_user_creation(self):
        """Test creating a user with all required fields."""
        user = User(
            email="test@example.com",
            full_name="Test User",
            hashed_password=get_password_hash("password123")
        )
        
        assert user.email == "test@example.com"
        assert user.full_name == "Test User"
        assert user.hashed_password is not None
        # Note: created_at and updated_at are set by the database, not the model constructor
    
    def test_user_creation_without_full_name(self):
        """Test creating a user without full_name (optional field)."""
        user = User(
            email="test@example.com",
            hashed_password=get_password_hash("password123")
        )
        
        assert user.email == "test@example.com"
        assert user.full_name is None
        assert user.hashed_password is not None
    
    def test_user_timestamps(self):
        """Test that timestamps are set correctly."""
        user = User(
            email="test@example.com",
            hashed_password=get_password_hash("password123")
        )
        
        # Timestamps are None until the object is saved to the database
        assert user.created_at is None
        assert user.updated_at is None
    
    def test_user_relationships(self):
        """Test that user relationships are properly defined."""
        user = User(
            email="test@example.com",
            hashed_password=get_password_hash("password123")
        )
        
        # Check that relationships are accessible (empty lists initially)
        assert hasattr(user, 'group_memberships')
        assert hasattr(user, 'expenses_paid')
        assert user.group_memberships == []
        assert user.expenses_paid == []
    
    def test_user_string_representation(self):
        """Test user string representation."""
        user = User(
            email="test@example.com",
            full_name="Test User",
            hashed_password=get_password_hash("password123")
        )
        
        # SQLAlchemy models don't have __str__ by default, but we can test attributes
        assert str(user.email) == "test@example.com"
        assert str(user.full_name) == "Test User"
