"""
Transaction schemas for the MCP Fintech Platform.
"""
import uuid
import json
from datetime import datetime
from typing import Optional, Dict, Any

from pydantic import BaseModel, Field, validator

from app.db.models.transaction import TransactionType, TransactionStatus


class TransactionBase(BaseModel):
    """Base schema for transaction data."""
    transaction_type: TransactionType
    amount: float
    currency: str = "USD"
    description: Optional[str] = None
    notes: Optional[str] = None
    transaction_metadata: Optional[Dict[str, Any]] = None


class TransactionCreate(TransactionBase):
    """Schema for creating a new transaction."""
    account_id: uuid.UUID
    destination_account_id: Optional[uuid.UUID] = None
    transaction_reference: Optional[str] = None  # Can be auto-generated if not provided
    fee_amount: float = 0.0
    
    @validator('amount')
    def validate_amount(cls, v):
        """Validate transaction amount."""
        if v <= 0:
            raise ValueError('Transaction amount must be greater than zero')
        return v


class TransactionUpdate(BaseModel):
    """Schema for updating an existing transaction."""
    status: Optional[TransactionStatus] = None
    notes: Optional[str] = None
    transaction_metadata: Optional[Dict[str, Any]] = None
    
    class Config:
        """Pydantic config."""
        use_enum_values = True


class TransactionResponse(TransactionBase):
    """Schema for transaction data returned in API responses."""
    id: uuid.UUID
    account_id: uuid.UUID
    destination_account_id: Optional[uuid.UUID] = None
    transaction_reference: str
    status: TransactionStatus
    fee_amount: float
    created_at: datetime
    updated_at: datetime
    processed_at: Optional[datetime] = None
    
    class Config:
        """Pydantic config."""
        orm_mode = True
        from_attributes = True
        use_enum_values = True
        
        @classmethod
        def schema_extra(cls, schema: Dict[str, Any]) -> None:
            """Add example to schema."""
            schema["example"] = {
                "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
                "account_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
                "transaction_reference": "TRX123456789",
                "transaction_type": "deposit",
                "status": "completed",
                "amount": 100.50,
                "currency": "USD",
                "fee_amount": 0.0,
                "description": "Salary deposit",
                "created_at": "2025-03-14T14:30:00Z",
                "updated_at": "2025-03-14T14:30:00Z",
                "processed_at": "2025-03-14T14:30:00Z"
            }
