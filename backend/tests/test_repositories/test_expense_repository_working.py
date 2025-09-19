import pytest
from unittest.mock import AsyncMock, patch, MagicMock
from decimal import Decimal
from app.repositories.expense_repository import ExpenseRepository
from app.schemas.expense import ExpenseCreate, ExpenseUpdate
from app.models.expense import Expense
from app.models.user import User


class TestExpenseRepositoryWorking:
    """Test cases for ExpenseRepository using proper mocks."""
    
    @pytest.mark.asyncio
    async def test_create_expense(self):
        """Test creating a new expense."""
        mock_session = AsyncMock()
        mock_session.add = MagicMock()
        mock_session.flush = AsyncMock()
        mock_session.refresh = AsyncMock()
        
        repo = ExpenseRepository(mock_session)
        expense_data = ExpenseCreate(
            group_id=1,
            amount=Decimal("25.50"),
            description="Test expense",
            category="Food",
            metadata={"location": "NYC"}
        )
        
        result = await repo.create(expense_data, paid_by_user_id=1)
        
        assert result.group_id == 1
        assert result.paid_by_user_id == 1
        assert result.amount == Decimal("25.50")
        assert result.description == "Test expense"
        assert result.category == "Food"
        assert result.expense_metadata == '{"location": "NYC"}'
        mock_session.add.assert_called_once()
        mock_session.flush.assert_called_once()
        # refresh is called twice - once for the expense and once for the relationship
        assert mock_session.refresh.call_count == 2
    
    @pytest.mark.asyncio
    async def test_create_expense_without_optional_fields(self):
        """Test creating an expense without optional fields."""
        mock_session = AsyncMock()
        mock_session.add = MagicMock()
        mock_session.flush = AsyncMock()
        mock_session.refresh = AsyncMock()
        
        repo = ExpenseRepository(mock_session)
        expense_data = ExpenseCreate(
            group_id=1,
            amount=Decimal("10.00")
        )
        
        result = await repo.create(expense_data, paid_by_user_id=1)
        
        assert result.group_id == 1
        assert result.paid_by_user_id == 1
        assert result.amount == Decimal("10.00")
        assert result.description is None
        assert result.category is None
        assert result.expense_metadata is None
    
    @pytest.mark.asyncio
    async def test_get_by_id_existing_expense(self):
        """Test getting an existing expense by ID."""
        mock_session = AsyncMock()
        mock_expense = Expense(
            id=1,
            group_id=1,
            paid_by_user_id=1,
            amount=Decimal("25.50"),
            description="Test expense",
            paid_by_user=User(id=1, email="test@example.com")
        )
        
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = mock_expense
        mock_session.execute.return_value = mock_result
        
        repo = ExpenseRepository(mock_session)
        result = await repo.get_by_id(1)
        
        assert result == mock_expense
        mock_session.execute.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_get_by_id_nonexistent_expense(self):
        """Test getting a non-existent expense by ID."""
        mock_session = AsyncMock()
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = None
        mock_session.execute.return_value = mock_result
        
        repo = ExpenseRepository(mock_session)
        result = await repo.get_by_id(999)
        
        assert result is None
        mock_session.execute.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_get_group_expenses(self):
        """Test getting expenses for a group."""
        mock_session = AsyncMock()
        mock_expenses = [
            Expense(id=1, group_id=1, paid_by_user_id=1, amount=Decimal("25.50"), paid_by_user=User(id=1)),
            Expense(id=2, group_id=1, paid_by_user_id=1, amount=Decimal("15.00"), paid_by_user=User(id=1))
        ]
        
        mock_result = MagicMock()
        mock_result.scalars.return_value.all.return_value = mock_expenses
        mock_session.execute.return_value = mock_result
        
        repo = ExpenseRepository(mock_session)
        result = await repo.get_group_expenses(1)
        
        assert len(result) == 2
        assert result[0].amount == Decimal("25.50")
        assert result[1].amount == Decimal("15.00")
        mock_session.execute.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_get_group_expenses_with_limit_and_offset(self):
        """Test getting group expenses with limit and offset."""
        mock_session = AsyncMock()
        mock_expenses = [
            Expense(id=1, group_id=1, paid_by_user_id=1, amount=Decimal("25.50")),
            Expense(id=2, group_id=1, paid_by_user_id=1, amount=Decimal("15.00"))
        ]
        
        mock_result = MagicMock()
        mock_result.scalars.return_value.all.return_value = mock_expenses
        mock_session.execute.return_value = mock_result
        
        repo = ExpenseRepository(mock_session)
        result = await repo.get_group_expenses(1, limit=2, offset=1)
        
        assert len(result) == 2
        mock_session.execute.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_update_expense_existing(self):
        """Test updating an existing expense."""
        mock_session = AsyncMock()
        mock_expense = Expense(
            id=1,
            group_id=1,
            paid_by_user_id=1,
            amount=Decimal("25.50"),
            description="Test expense"
        )
        
        # Mock get_by_id
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = mock_expense
        mock_session.execute.return_value = mock_result
        
        repo = ExpenseRepository(mock_session)
        update_data = ExpenseUpdate(
            amount=Decimal("30.00"),
            description="Updated expense",
            metadata={"updated": True}
        )
        
        result = await repo.update(1, update_data)
        
        assert result == mock_expense
        assert result.amount == Decimal("30.00")
        assert result.description == "Updated expense"
        assert result.expense_metadata == '{"updated": true}'
        mock_session.flush.assert_called_once()
        mock_session.refresh.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_update_expense_nonexistent(self):
        """Test updating a non-existent expense."""
        mock_session = AsyncMock()
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = None
        mock_session.execute.return_value = mock_result
        
        repo = ExpenseRepository(mock_session)
        update_data = ExpenseUpdate(amount=Decimal("30.00"))
        
        result = await repo.update(999, update_data)
        
        assert result is None
        mock_session.execute.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_delete_expense_existing(self):
        """Test deleting an existing expense."""
        mock_session = AsyncMock()
        mock_expense = Expense(
            id=1,
            group_id=1,
            paid_by_user_id=1,
            amount=Decimal("25.50")
        )
        
        # Mock get_by_id
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = mock_expense
        mock_session.execute.return_value = mock_result
        mock_session.delete = AsyncMock()
        mock_session.flush = AsyncMock()
        
        repo = ExpenseRepository(mock_session)
        result = await repo.delete(1)
        
        assert result is True
        mock_session.delete.assert_called_once_with(mock_expense)
        mock_session.flush.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_delete_expense_nonexistent(self):
        """Test deleting a non-existent expense."""
        mock_session = AsyncMock()
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = None
        mock_session.execute.return_value = mock_result
        
        repo = ExpenseRepository(mock_session)
        result = await repo.delete(999)
        
        assert result is False
        mock_session.execute.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_get_group_expense_summary(self):
        """Test getting expense summary for a group."""
        mock_session = AsyncMock()
        
        # Mock total result
        mock_total_result = MagicMock()
        mock_total_result.first.return_value = MagicMock(total_amount=Decimal("50.50"), expense_count=3)
        
        # Mock category result
        mock_category_result = MagicMock()
        mock_category_result.__iter__ = lambda self: iter([
            MagicMock(category="Food", amount=Decimal("35.50")),
            MagicMock(category="Transport", amount=Decimal("15.00"))
        ])
        
        # Mock user result
        mock_user_result = MagicMock()
        mock_user_result.__iter__ = lambda self: iter([
            MagicMock(user_name="User 1", user_email="user1@example.com", amount=Decimal("25.50")),
            MagicMock(user_name="User 2", user_email="user2@example.com", amount=Decimal("25.00"))
        ])
        
        # Set up execute to return different results for different calls
        mock_session.execute.side_effect = [mock_total_result, mock_category_result, mock_user_result]
        
        repo = ExpenseRepository(mock_session)
        result = await repo.get_group_expense_summary(1)
        
        assert result["total_amount"] == Decimal("50.50")
        assert result["expense_count"] == 3
        assert result["by_category"]["Food"] == Decimal("35.50")
        assert result["by_category"]["Transport"] == Decimal("15.00")
        assert len(result["by_user"]) == 2
        assert mock_session.execute.call_count == 3
