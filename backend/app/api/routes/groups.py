from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_session, get_current_user
from app.schemas.group import GroupCreate, GroupUpdate, GroupRead, GroupWithMembers, GroupMemberCreate
from app.services.group_service import GroupService
from app.models.user import User

router = APIRouter(prefix="/groups", tags=["groups"])


@router.post("/", response_model=GroupWithMembers, status_code=status.HTTP_201_CREATED)
async def create_group(
    payload: GroupCreate,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
) -> GroupWithMembers:
    service = GroupService(session)
    try:
        return await service.create_group(payload, current_user.id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.get("/", response_model=list[GroupRead])
async def get_user_groups(
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
) -> list[GroupRead]:
    service = GroupService(session)
    return await service.get_user_groups(current_user.id)


@router.get("/{group_id}", response_model=GroupWithMembers)
async def get_group(
    group_id: int,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
) -> GroupWithMembers:
    service = GroupService(session)
    group = await service.get_group(group_id)
    if not group:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Group not found")
    return group


@router.put("/{group_id}", response_model=GroupRead)
async def update_group(
    group_id: int,
    payload: GroupUpdate,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
) -> GroupRead:
    service = GroupService(session)
    try:
        updated_group = await service.update_group(group_id, payload, current_user.id)
        if not updated_group:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Group not found")
        return updated_group
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.delete("/{group_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_group(
    group_id: int,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
):
    service = GroupService(session)
    try:
        success = await service.delete_group(group_id, current_user.id)
        if not success:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Group not found")
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.post("/{group_id}/members", response_model=dict)
async def add_member(
    group_id: int,
    payload: GroupMemberCreate,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
) -> dict:
    service = GroupService(session)
    try:
        member = await service.add_member(group_id, payload, current_user.id)
        if not member:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="User already a member or user not found")
        return {"message": "Member added successfully"}
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.delete("/{group_id}/members/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_member(
    group_id: int,
    user_id: int,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
):
    service = GroupService(session)
    try:
        success = await service.remove_member(group_id, user_id, current_user.id)
        if not success:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Member not found")
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
