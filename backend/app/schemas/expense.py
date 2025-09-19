from pydantic import BaseModel, Field, field_validator, ConfigDict
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
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    group_id: int
    paid_by_user_id: int
    created_at: datetime
    updated_at: datetime
    paid_by_user: "UserRead"

    @field_validator('metadata', mode='before')
    @classmethod
    def parse_metadata(cls, v):
        # If the value is already a dict, return it
        if isinstance(v, dict):
            return v
        
        # If the value is a string (JSON), parse it
        if isinstance(v, str):
            import json
            try:
                return json.loads(v)
            except (json.JSONDecodeError, TypeError):
                return None
        
        # If the value is None, return None
        if v is None:
            return None
            
        # For any other type, return None
        return None


class ExpenseSummary(BaseModel):
    total_amount: Decimal
    expense_count: int
    by_category: Dict[str, Decimal]
    by_user: Dict[str, Decimal]


class BalanceSummary(BaseModel):
    group_id: int
    group_name: str
    total_expenses: Decimal
    member_count: int
    equal_share: Decimal
    balances: Dict[str, Decimal]  # user_id -> balance (positive = owed to them, negative = they owe)
    net_balances: Dict[str, Decimal]  # user_id -> net balance after settling


# Update forward references
from app.schemas.user import UserRead
ExpenseRead.model_rebuild()
