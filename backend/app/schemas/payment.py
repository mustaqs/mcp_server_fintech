"""
Payment schemas for the MCP Fintech Platform.
"""
from datetime import datetime
from typing import Any, Dict, List, Optional, Union
from uuid import UUID

from pydantic import BaseModel, Field, validator

from app.services.payment_service import PaymentMethod, PaymentProvider, PaymentStatus


class PaymentBase(BaseModel):
    """Base schema for payment operations."""
    amount: float = Field(..., gt=0)
    currency: str = Field(..., min_length=3, max_length=3)
    description: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None


class PaymentCreate(PaymentBase):
    """Schema for creating a new payment."""
    provider: PaymentProvider
    method: Optional[PaymentMethod] = None
    return_url: Optional[str] = None
    cancel_url: Optional[str] = None
    is_test: Optional[bool] = False

    @validator('currency')
    def currency_uppercase(cls, v):
        return v.upper()


class PaymentUpdate(BaseModel):
    """Schema for updating a payment."""
    status: Optional[PaymentStatus] = None
    metadata: Optional[Dict[str, Any]] = None
    provider_response: Optional[Dict[str, Any]] = None
    error_message: Optional[str] = None
    error_code: Optional[str] = None


class PaymentResponse(PaymentBase):
    """Schema for payment response."""
    id: UUID
    external_id: str
    user_id: UUID
    status: PaymentStatus
    provider: PaymentProvider
    method: Optional[PaymentMethod] = None
    error_message: Optional[str] = None
    error_code: Optional[str] = None
    is_test: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True


class RefundBase(BaseModel):
    """Base schema for refund operations."""
    amount: Optional[float] = None  # If None, full refund
    reason: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None


class RefundCreate(RefundBase):
    """Schema for creating a new refund."""
    payment_id: UUID


class RefundUpdate(BaseModel):
    """Schema for updating a refund."""
    status: Optional[PaymentStatus] = None
    metadata: Optional[Dict[str, Any]] = None
    provider_response: Optional[Dict[str, Any]] = None
    error_message: Optional[str] = None
    error_code: Optional[str] = None


class RefundResponse(RefundBase):
    """Schema for refund response."""
    id: UUID
    payment_id: UUID
    external_id: str
    amount: float
    currency: str
    status: PaymentStatus
    error_message: Optional[str] = None
    error_code: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True


class PaymentMethodBase(BaseModel):
    """Base schema for payment method operations."""
    provider: PaymentProvider
    type: PaymentMethod
    is_default: Optional[bool] = False
    metadata: Optional[Dict[str, Any]] = None


class PaymentMethodCreate(PaymentMethodBase):
    """Schema for creating a new payment method."""
    token: str
    last_four: Optional[str] = None
    expiry_month: Optional[str] = None
    expiry_year: Optional[str] = None


class PaymentMethodUpdate(BaseModel):
    """Schema for updating a payment method."""
    is_default: Optional[bool] = None
    is_active: Optional[bool] = None
    metadata: Optional[Dict[str, Any]] = None


class PaymentMethodResponse(PaymentMethodBase):
    """Schema for payment method response."""
    id: UUID
    user_id: UUID
    last_four: Optional[str] = None
    expiry_month: Optional[str] = None
    expiry_year: Optional[str] = None
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True


class PaymentIntentResponse(BaseModel):
    """Schema for payment intent response."""
    client_secret: str
    payment_id: UUID
    provider: PaymentProvider
    amount: float
    currency: str
    status: PaymentStatus
    requires_action: bool = False
    next_action: Optional[Dict[str, Any]] = None
    redirect_url: Optional[str] = None
