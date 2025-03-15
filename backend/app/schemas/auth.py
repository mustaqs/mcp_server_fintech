"""
Authentication schemas for the MCP Fintech Platform.
"""
from typing import List, Optional
from uuid import UUID

from pydantic import BaseModel, Field


class Token(BaseModel):
    """Schema for authentication token response."""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int = 1800  # 30 minutes in seconds


class TokenData(BaseModel):
    """Schema for decoded token data."""
    user_id: Optional[UUID] = None
    scopes: List[str] = []


class TokenRefresh(BaseModel):
    """Schema for token refresh request."""
    refresh_token: str


class APIKey(BaseModel):
    """Schema for API key."""
    id: UUID
    name: str
    key: str
    scopes: List[str]
    user_id: UUID
    created_at: str
    expires_at: Optional[str] = None
    last_used_at: Optional[str] = None


class APIKeyCreate(BaseModel):
    """Schema for creating a new API key."""
    name: str = Field(..., min_length=1, max_length=100)
    scopes: List[str] = ["api:read"]
    expires_in_days: Optional[int] = None


class APIKeyResponse(BaseModel):
    """Schema for API key response."""
    id: UUID
    name: str
    key: str  # Only shown once when created
    scopes: List[str]
    created_at: str
    expires_at: Optional[str] = None


class APIKeyInfo(BaseModel):
    """Schema for API key information (without the actual key)."""
    id: UUID
    name: str
    scopes: List[str]
    created_at: str
    expires_at: Optional[str] = None
    last_used_at: Optional[str] = None
