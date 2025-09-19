from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String, DateTime
from datetime import datetime
from app.db.session import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True, index=True, autoincrement=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    full_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    hashed_password: Mapped[str] = mapped_column(String(255))
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    group_memberships: Mapped[list["GroupMember"]] = relationship("GroupMember", back_populates="user", cascade="all, delete-orphan")
    expenses_paid: Mapped[list["Expense"]] = relationship("Expense", foreign_keys="Expense.paid_by_user_id", back_populates="paid_by_user")
