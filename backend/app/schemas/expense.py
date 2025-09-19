from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, Dict, Any
from decimal import Decimal


class ExpenseBase(BaseModel):
    amount: Decimal = Field(..., gt=0, decimal_places=2)
    description: Optional[str] = Field(None, max_length=500)
    category: Optional[str] = Field(None, max_length=100)
    metadata: Optional[Dict[str, Any]] = None


class ExpenseCreate(ExpenseBase):
    group_id: int


class ExpenseUpdate(BaseModel):
    amount: Optional[Decimal] = Field(None, gt=0, decimal_places=2)
    description: Optional[str] = Field(None, max_length=500)
    category: Optional[str] = Field(None, max_length=100)
    metadata: Optional[Dict[str, Any]] = None


class ExpenseRead(ExpenseBase):
    id: int
    group_id: int
    paid_by_user_id: int
    created_at: datetime
    updated_at: datetime
    paid_by_user: "UserRead"

    class Config:
        from_attributes = True


class ExpenseSummary(BaseModel):
    total_amount: Decimal
    expense_count: int
    by_category: Dict[str, Decimal]
    by_user: Dict[str, Decimal]


# Update forward references
from app.schemas.user import UserRead
ExpenseRead.model_rebuild()
