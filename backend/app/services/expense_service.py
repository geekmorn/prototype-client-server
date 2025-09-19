from typing import Optional, List
from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.expense_repository import ExpenseRepository
from app.repositories.group_repository import GroupRepository
from app.schemas.expense import ExpenseCreate, ExpenseUpdate, ExpenseRead, ExpenseSummary, BalanceSummary
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
        
        # Convert the expense to a dict and handle metadata conversion
        expense_dict = {
            'id': expense.id,
            'group_id': expense.group_id,
            'paid_by_user_id': expense.paid_by_user_id,
            'amount': expense.amount,
            'description': expense.description,
            'category': expense.category,
            'created_at': expense.created_at,
            'updated_at': expense.updated_at,
            'paid_by_user': expense.paid_by_user,
            'metadata': None
        }
        
        # Parse metadata from JSON string
        if expense.expense_metadata:
            import json
            try:
                expense_dict['metadata'] = json.loads(expense.expense_metadata)
            except (json.JSONDecodeError, TypeError):
                expense_dict['metadata'] = None
        
        return ExpenseRead.model_validate(expense_dict)

    async def get_expense(self, expense_id: int) -> Optional[ExpenseRead]:
        expense = await self.repo.get_by_id(expense_id)
        if not expense:
            return None
        return ExpenseRead.model_validate(expense)

    async def get_user_expenses(self, user_id: int, limit: int = 100, offset: int = 0) -> List[ExpenseRead]:
        """Get all expenses for a user across all groups they're a member of"""
        expenses = await self.repo.get_user_expenses(user_id, limit, offset)
        return [ExpenseRead.model_validate(expense) for expense in expenses]

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

    async def get_group_balance_summary(self, group_id: int, user_id: int) -> BalanceSummary:
        # Check if user is a member of the group
        if not await self.group_repo.is_member(group_id, user_id):
            raise ValueError("You must be a member of the group to view balance summary")
        
        # Get group info and members
        group = await self.group_repo.get_group_with_members(group_id)
        if not group:
            raise ValueError("Group not found")
        
        # Get all expenses for the group
        expenses = await self.repo.get_group_expenses(group_id, limit=1000, offset=0)
        
        # Calculate balances
        member_count = len(group.members)
        if member_count == 0:
            return BalanceSummary(
                group_id=group_id,
                group_name=group.name,
                total_expenses=0,
                member_count=0,
                equal_share=0,
                balances={},
                net_balances={}
            )
        
        total_expenses = sum(expense.amount for expense in expenses)
        equal_share = total_expenses / member_count if member_count > 0 else 0
        
        # Initialize balances for each member
        balances = {}
        for member in group.members:
            balances[str(member.user_id)] = 0
        
        # Calculate what each member paid vs what they should pay
        for expense in expenses:
            paid_by_user_id = str(expense.paid_by_user_id)
            if paid_by_user_id in balances:
                balances[paid_by_user_id] += expense.amount
        
        # Calculate net balances (what each member owes/is owed)
        net_balances = {}
        for member in group.members:
            user_id_str = str(member.user_id)
            paid_amount = balances.get(user_id_str, 0)
            should_pay = equal_share
            net_balance = paid_amount - should_pay
            net_balances[user_id_str] = net_balance
        
        return BalanceSummary(
            group_id=group_id,
            group_name=group.name,
            total_expenses=total_expenses,
            member_count=member_count,
            equal_share=equal_share,
            balances=balances,
            net_balances=net_balances
        )
