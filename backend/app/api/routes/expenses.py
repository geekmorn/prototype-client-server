from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_session, get_current_user
from app.schemas.expense import ExpenseCreate, ExpenseUpdate, ExpenseRead, ExpenseSummary, BalanceSummary
from app.services.expense_service import ExpenseService
from app.models.user import User

router = APIRouter(prefix="/expenses", tags=["expenses"])


@router.post("/", response_model=ExpenseRead, status_code=status.HTTP_201_CREATED)
async def create_expense(
    payload: ExpenseCreate,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
) -> ExpenseRead:
    service = ExpenseService(session)
    try:
        return await service.create_expense(payload, current_user.id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.get("/", response_model=list[ExpenseRead])
async def get_all_expenses(
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
    limit: int = Query(100, ge=1, le=1000),
    offset: int = Query(0, ge=0)
) -> list[ExpenseRead]:
    """Get all expenses for the current user across all groups they're a member of"""
    service = ExpenseService(session)
    return await service.get_user_expenses(current_user.id, limit, offset)


@router.get("/{expense_id}", response_model=ExpenseRead)
async def get_expense(
    expense_id: int,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
) -> ExpenseRead:
    service = ExpenseService(session)
    expense = await service.get_expense(expense_id)
    if not expense:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Expense not found")
    return expense


@router.put("/{expense_id}", response_model=ExpenseRead)
async def update_expense(
    expense_id: int,
    payload: ExpenseUpdate,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
) -> ExpenseRead:
    service = ExpenseService(session)
    try:
        updated_expense = await service.update_expense(expense_id, payload, current_user.id)
        if not updated_expense:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Expense not found")
        return updated_expense
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.delete("/{expense_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_expense(
    expense_id: int,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
):
    service = ExpenseService(session)
    try:
        success = await service.delete_expense(expense_id, current_user.id)
        if not success:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Expense not found")
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.get("/groups/{group_id}", response_model=list[ExpenseRead])
async def get_group_expenses(
    group_id: int,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
    limit: int = Query(100, ge=1, le=1000),
    offset: int = Query(0, ge=0)
) -> list[ExpenseRead]:
    service = ExpenseService(session)
    try:
        return await service.get_group_expenses(group_id, current_user.id, limit, offset)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.get("/groups/{group_id}/summary", response_model=ExpenseSummary)
async def get_group_expense_summary(
    group_id: int,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
) -> ExpenseSummary:
    service = ExpenseService(session)
    try:
        return await service.get_group_expense_summary(group_id, current_user.id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.get("/groups/{group_id}/balance", response_model=BalanceSummary)
async def get_group_balance_summary(
    group_id: int,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
) -> BalanceSummary:
    service = ExpenseService(session)
    try:
        return await service.get_group_balance_summary(group_id, current_user.id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
