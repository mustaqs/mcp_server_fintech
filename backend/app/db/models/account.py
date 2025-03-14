"""
Account model for the MCP Fintech Platform.
"""
import uuid
from datetime import datetime
from enum import Enum, auto
from typing import List, Optional

from sqlalchemy import Column, String, Float, Boolean, DateTime, ForeignKey, Enum as SQLAlchemyEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.db.database import Base


class AccountType(str, Enum):
    """Enum for account types."""
    CHECKING = "checking"
    SAVINGS = "savings"
    INVESTMENT = "investment"
    CREDIT = "credit"
    LOAN = "loan"


class AccountStatus(str, Enum):
    """Enum for account status."""
    ACTIVE = "active"
    INACTIVE = "inactive"
    PENDING = "pending"
    CLOSED = "closed"
    FROZEN = "frozen"


class Account(Base):
    """
    Account model representing a financial account in the platform.
    
    This could be a checking account, savings account, investment account, etc.
    """
    __tablename__ = "accounts"
    
    # Primary key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    # Account information
    account_number = Column(String, unique=True, index=True, nullable=False)
    account_name = Column(String, nullable=False)
    account_type = Column(SQLAlchemyEnum(AccountType), nullable=False)
    status = Column(SQLAlchemyEnum(AccountStatus), default=AccountStatus.PENDING)
    
    # Financial information
    balance = Column(Float, default=0.0)
    available_balance = Column(Float, default=0.0)
    currency = Column(String, default="USD")
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_activity_at = Column(DateTime, nullable=True)
    
    # Relationships
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    user = relationship("User", back_populates="accounts")
    transactions = relationship("Transaction", back_populates="account", cascade="all, delete-orphan")
    
    def __repr__(self) -> str:
        """String representation of the account."""
        return f"<Account {self.account_number} ({self.account_type.value})>"
