import pytest
from datetime import datetime
from decimal import Decimal
from app.models.expense import Expense


class TestExpenseModel:
    """Test cases for Expense model."""
    
    def test_expense_creation(self):
        """Test creating an expense with all required fields."""
        expense = Expense(
            group_id=1,
            paid_by_user_id=1,
            amount=Decimal("25.50"),
            description="Test expense",
            category="Food"
        )
        
        assert expense.group_id == 1
        assert expense.paid_by_user_id == 1
        assert expense.amount == Decimal("25.50")
        assert expense.description == "Test expense"
        assert expense.category == "Food"
        # Note: created_at and updated_at are set by the database, not the model constructor
    
    def test_expense_creation_with_optional_fields_none(self):
        """Test creating an expense with optional fields as None."""
        expense = Expense(
            group_id=1,
            paid_by_user_id=1,
            amount=Decimal("10.00")
        )
        
        assert expense.group_id == 1
        assert expense.paid_by_user_id == 1
        assert expense.amount == Decimal("10.00")
        assert expense.description is None
        assert expense.category is None
        assert expense.expense_metadata is None
    
    def test_expense_creation_with_metadata(self):
        """Test creating an expense with metadata."""
        expense = Expense(
            group_id=1,
            paid_by_user_id=1,
            amount=Decimal("15.75"),
            description="Test expense with metadata",
            category="Transport",
            expense_metadata='{"location": "NYC", "receipt_id": "12345"}'
        )
        
        assert expense.expense_metadata == '{"location": "NYC", "receipt_id": "12345"}'
    
    def test_expense_timestamps(self):
        """Test that timestamps are set correctly."""
        expense = Expense(
            group_id=1,
            paid_by_user_id=1,
            amount=Decimal("20.00")
        )
        
        # Timestamps are None until the object is saved to the database
        assert expense.created_at is None
        assert expense.updated_at is None
    
    def test_expense_relationships(self):
        """Test that expense relationships are properly defined."""
        expense = Expense(
            group_id=1,
            paid_by_user_id=1,
            amount=Decimal("30.00")
        )
        
        # Check that relationships are accessible
        assert hasattr(expense, 'group')
        assert hasattr(expense, 'paid_by_user')
    
    def test_expense_decimal_precision(self):
        """Test that decimal amounts maintain proper precision."""
        expense = Expense(
            group_id=1,
            paid_by_user_id=1,
            amount=Decimal("99.99")
        )
        
        assert expense.amount == Decimal("99.99")
        assert str(expense.amount) == "99.99"
    
    def test_expense_large_amount(self):
        """Test creating an expense with a large amount."""
        expense = Expense(
            group_id=1,
            paid_by_user_id=1,
            amount=Decimal("9999.99")
        )
        
        assert expense.amount == Decimal("9999.99")
