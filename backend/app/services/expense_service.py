from typing import Optional, List
from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.expense_repository import ExpenseRepository
from app.repositories.group_repository import GroupRepository
from app.schemas.expense import ExpenseCreate, ExpenseUpdate, ExpenseRead, ExpenseSummary
from app.models.expense import Expense


class ExpenseService:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session
        self.repo = ExpenseRepository(session)
        self.group_repo = GroupRepository(session)

    async def create_expense(self, data: ExpenseCreate, paid_by_user_id: int) -> ExpenseRead:
        # Check if user is a member of the group
        if not await self.group_repo.is_member(data.group_id, paid_by_user_id):
            raise ValueError("You must be a member of the group to add expenses")
        
        expense: Expense = await self.repo.create(data, paid_by_user_id)
        await self.session.commit()
        return ExpenseRead.model_validate(expense)

    async def get_expense(self, expense_id: int) -> Optional[ExpenseRead]:
        expense = await self.repo.get_by_id(expense_id)
        if not expense:
            return None
        return ExpenseRead.model_validate(expense)

    async def get_group_expenses(self, group_id: int, user_id: int, limit: int = 100, offset: int = 0) -> List[ExpenseRead]:
        # Check if user is a member of the group
        if not await self.group_repo.is_member(group_id, user_id):
            raise ValueError("You must be a member of the group to view expenses")
        
        expenses = await self.repo.get_group_expenses(group_id, limit, offset)
        return [ExpenseRead.model_validate(expense) for expense in expenses]

    async def update_expense(self, expense_id: int, data: ExpenseUpdate, user_id: int) -> Optional[ExpenseRead]:
        expense = await self.repo.get_by_id(expense_id)
        if not expense:
            return None
        
        # Only the user who paid can update the expense
        if expense.paid_by_user_id != user_id:
            raise ValueError("You can only update expenses you paid for")
        
        updated_expense = await self.repo.update(expense_id, data)
        if updated_expense:
            await self.session.commit()
        return ExpenseRead.model_validate(updated_expense) if updated_expense else None

    async def delete_expense(self, expense_id: int, user_id: int) -> bool:
        expense = await self.repo.get_by_id(expense_id)
        if not expense:
            return False
        
        # Only the user who paid can delete the expense
        if expense.paid_by_user_id != user_id:
            raise ValueError("You can only delete expenses you paid for")
        
        success = await self.repo.delete(expense_id)
        if success:
            await self.session.commit()
        return success

    async def get_group_expense_summary(self, group_id: int, user_id: int) -> ExpenseSummary:
        # Check if user is a member of the group
        if not await self.group_repo.is_member(group_id, user_id):
            raise ValueError("You must be a member of the group to view expense summary")
        
        summary_data = await self.repo.get_group_expense_summary(group_id)
        return ExpenseSummary(**summary_data)
