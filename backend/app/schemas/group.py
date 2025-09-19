from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime
from typing import Optional, List


class GroupBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = Field(None, max_length=500)


class GroupCreate(GroupBase):
    pass


class GroupUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = Field(None, max_length=500)


class GroupRead(GroupBase):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    created_by_user_id: int
    created_at: datetime
    updated_at: datetime


class GroupMemberCreate(BaseModel):
    user_id: int


class GroupMemberRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    group_id: int
    user_id: int
    joined_at: datetime
    user: "UserRead"


class GroupWithMembers(GroupRead):
    members: List[GroupMemberRead]


# Update forward references
from app.schemas.user import UserRead
GroupMemberRead.model_rebuild()
