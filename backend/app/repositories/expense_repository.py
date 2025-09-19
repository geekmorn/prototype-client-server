from typing import Optional, List, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, func
from sqlalchemy.orm import selectinload
from decimal import Decimal
import json

from app.models.expense import Expense
from app.models.group import Group
from app.models.user import User
from app.schemas.expense import ExpenseCreate, ExpenseUpdate


class ExpenseRepository:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def create(self, data: ExpenseCreate, paid_by_user_id: int) -> Expense:
        metadata_json = json.dumps(data.metadata) if data.metadata else None
        
        expense = Expense(
            group_id=data.group_id,
            paid_by_user_id=paid_by_user_id,
            amount=data.amount,
            description=data.description,
            category=data.category,
            expense_metadata=metadata_json
        )
        self.session.add(expense)
        await self.session.flush()
        await self.session.refresh(expense)
        return expense

    async def get_by_id(self, expense_id: int) -> Optional[Expense]:
        result = await self.session.execute(
            select(Expense)
            .where(Expense.id == expense_id)
            .options(selectinload(Expense.paid_by_user))
        )
        return result.scalar_one_or_none()

    async def get_group_expenses(self, group_id: int, limit: int = 100, offset: int = 0) -> List[Expense]:
        result = await self.session.execute(
            select(Expense)
            .where(Expense.group_id == group_id)
            .options(selectinload(Expense.paid_by_user))
            .order_by(Expense.created_at.desc())
            .limit(limit)
            .offset(offset)
        )
        return result.scalars().all()

    async def update(self, expense_id: int, data: ExpenseUpdate) -> Optional[Expense]:
        expense = await self.get_by_id(expense_id)
        if not expense:
            return None
        
        update_data = data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            if field == "metadata":
                setattr(expense, "expense_metadata", json.dumps(value) if value else None)
            else:
                setattr(expense, field, value)
        
        await self.session.flush()
        await self.session.refresh(expense)
        return expense

    async def delete(self, expense_id: int) -> bool:
        expense = await self.get_by_id(expense_id)
        if not expense:
            return False
        
        await self.session.delete(expense)
        await self.session.flush()
        return True

    async def get_group_expense_summary(self, group_id: int) -> Dict[str, Any]:
        # Get total amount and count
        total_result = await self.session.execute(
            select(
                func.sum(Expense.amount).label('total_amount'),
                func.count(Expense.id).label('expense_count')
            ).where(Expense.group_id == group_id)
        )
        total_data = total_result.first()
        
        # Get expenses by category
        category_result = await self.session.execute(
            select(
                Expense.category.label('category'),
                func.sum(Expense.amount).label('amount')
            )
            .where(and_(Expense.group_id == group_id, Expense.category.isnot(None)))
            .group_by(Expense.category)
        )
        by_category = {row.category: row.amount for row in category_result}
        
        # Get expenses by user
        user_result = await self.session.execute(
            select(
                User.full_name.label('user_name'),
                User.email.label('user_email'),
                func.sum(Expense.amount).label('amount')
            )
            .join(Expense, Expense.paid_by_user_id == User.id)
            .where(Expense.group_id == group_id)
            .group_by(User.id, User.full_name, User.email)
        )
        by_user = {}
        for row in user_result:
            user_display = row.user_name or row.user_email
            by_user[user_display] = row.amount
        
        return {
            "total_amount": total_data.total_amount or Decimal('0'),
            "expense_count": total_data.expense_count or 0,
            "by_category": by_category,
            "by_user": by_user
        }
