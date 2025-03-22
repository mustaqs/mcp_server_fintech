"""
Pydantic schemas for banking operations.
"""
from datetime import datetime
from typing import Any, Dict, List, Optional, Union
from uuid import UUID

from pydantic import BaseModel, Field


# Base schemas
class PlaidItemBase(BaseModel):
    """Base schema for Plaid Item."""
    institution_id: Optional[str] = None
    institution_name: Optional[str] = None
    is_active: bool = True


class PlaidAccountBase(BaseModel):
    """Base schema for Plaid Account."""
    mask: Optional[str] = None
    name: str
    official_name: Optional[str] = None
    type: str
    subtype: Optional[str] = None
    available_balance: Optional[str] = None
    current_balance: Optional[str] = None
    limit_amount: Optional[str] = None
    iso_currency_code: Optional[str] = None
    is_active: bool = True


class PlaidTransactionBase(BaseModel):
    """Base schema for Plaid Transaction."""
    amount: str
    date: datetime
    name: str
    merchant_name: Optional[str] = None
    payment_channel: Optional[str] = None
    primary_category: Optional[str] = None
    detailed_category: Optional[str] = None
    location: Optional[Dict[str, Any]] = None
    payment_meta: Optional[Dict[str, Any]] = None
    iso_currency_code: Optional[str] = None
    pending: bool = False


# Create schemas
class PlaidItemCreate(PlaidItemBase):
    """Schema for creating a Plaid Item."""
    user_id: UUID
    item_id: str
    access_token: str


class PlaidAccountCreate(PlaidAccountBase):
    """Schema for creating a Plaid Account."""
    item_id: UUID
    account_id: str


class PlaidTransactionCreate(PlaidTransactionBase):
    """Schema for creating a Plaid Transaction."""
    account_id: UUID
    transaction_id: str


# Update schemas
class PlaidItemUpdate(PlaidItemBase):
    """Schema for updating a Plaid Item."""
    error: Optional[Dict[str, Any]] = None
    is_active: Optional[bool] = None
    last_sync_at: Optional[datetime] = None


class PlaidAccountUpdate(PlaidAccountBase):
    """Schema for updating a Plaid Account."""
    available_balance: Optional[str] = None
    current_balance: Optional[str] = None
    limit_amount: Optional[str] = None
    is_active: Optional[bool] = None
    last_balance_update: Optional[datetime] = None


class PlaidTransactionUpdate(PlaidTransactionBase):
    """Schema for updating a Plaid Transaction."""
    amount: Optional[str] = None
    date: Optional[datetime] = None
    name: Optional[str] = None
    pending: Optional[bool] = None


# Response schemas
class PlaidTransaction(PlaidTransactionBase):
    """Schema for Plaid Transaction response."""
    id: UUID
    account_id: UUID
    transaction_id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        """Pydantic config."""
        orm_mode = True


class PlaidAccount(PlaidAccountBase):
    """Schema for Plaid Account response."""
    id: UUID
    item_id: UUID
    account_id: str
    created_at: datetime
    updated_at: datetime
    last_balance_update: Optional[datetime] = None
    transactions: List[PlaidTransaction] = []

    class Config:
        """Pydantic config."""
        orm_mode = True


class PlaidItem(PlaidItemBase):
    """Schema for Plaid Item response."""
    id: UUID
    user_id: UUID
    item_id: str
    created_at: datetime
    updated_at: datetime
    last_sync_at: Optional[datetime] = None
    accounts: List[PlaidAccount] = []

    class Config:
        """Pydantic config."""
        orm_mode = True


# Link token schemas
class LinkTokenCreate(BaseModel):
    """Schema for creating a Link token."""
    redirect_uri: Optional[str] = None


class LinkTokenResponse(BaseModel):
    """Schema for Link token response."""
    link_token: str
    expiration: str


# Exchange token schemas
class ExchangeTokenRequest(BaseModel):
    """Schema for exchanging a public token."""
    public_token: str


class ExchangeTokenResponse(BaseModel):
    """Schema for exchange token response."""
    success: bool
    item_id: str
    message: str


# Transaction sync schemas
class TransactionSyncRequest(BaseModel):
    """Schema for syncing transactions."""
    access_token: str
    cursor: Optional[str] = None


class TransactionSyncResponse(BaseModel):
    """Schema for transaction sync response."""
    added: List[Dict[str, Any]]
    modified: List[Dict[str, Any]]
    removed: List[Dict[str, Any]]
    next_cursor: str
    has_more: bool


# Webhook schemas
class WebhookResponse(BaseModel):
    """Schema for webhook response."""
    success: bool
    message: str
