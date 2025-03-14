"""
Account schemas for the MCP Fintech Platform.
"""
import uuid
from datetime import datetime
from typing import Optional, List

from pydantic import BaseModel, Field, validator

from app.db.models.account import AccountType, AccountStatus


class AccountBase(BaseModel):
    """Base schema for account data."""
    account_name: str
    account_type: AccountType
    currency: str = "USD"


class AccountCreate(AccountBase):
    """Schema for creating a new account."""
    user_id: uuid.UUID
    account_number: Optional[str] = None  # Can be auto-generated if not provided
    
    @validator('account_number')
    def validate_account_number(cls, v):
        """Validate account number format if provided."""
        if v is not None and len(v) < 8:
            raise ValueError('Account number must be at least 8 characters long')
        return v


class AccountUpdate(BaseModel):
    """Schema for updating an existing account."""
    account_name: Optional[str] = None
    status: Optional[AccountStatus] = None
    
    class Config:
        """Pydantic config."""
        use_enum_values = True


class AccountResponse(AccountBase):
    """Schema for account data returned in API responses."""
    id: uuid.UUID
    user_id: uuid.UUID
    account_number: str
    status: AccountStatus
    balance: float
    available_balance: float
    created_at: datetime
    updated_at: datetime
    last_activity_at: Optional[datetime] = None
    
    class Config:
        """Pydantic config."""
        orm_mode = True
        from_attributes = True
        use_enum_values = True
