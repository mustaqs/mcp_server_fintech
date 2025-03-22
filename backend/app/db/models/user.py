"""
User model for the MCP Fintech Platform.
"""
import uuid
from datetime import datetime
from typing import List, Optional

from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, ARRAY
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship

from app.db.database import Base


class User(Base):
    """
    User model representing a customer of the fintech platform.
    
    This model stores basic user information and authentication details.
    """
    __tablename__ = "users"
    
    # Primary key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    # Authentication fields
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    
    # Profile information
    first_name = Column(String, nullable=True)
    last_name = Column(String, nullable=True)
    phone_number = Column(String, nullable=True)
    
    # Account status
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    is_admin = Column(Boolean, default=False)
    
    # Role-based access control
    roles = Column(ARRAY(String), default=["user"])
    permissions = Column(JSONB, default={})
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_login_at = Column(DateTime, nullable=True)
    
    # Authentication details
    totp_secret = Column(String, nullable=True)  # For MFA
    totp_enabled = Column(Boolean, default=False)
    sso_provider = Column(String, nullable=True)  # For SSO integration
    sso_provider_user_id = Column(String, nullable=True)
    
    # Relationships
    accounts = relationship("Account", back_populates="user", cascade="all, delete-orphan")
    api_keys = relationship("APIKey", back_populates="user", cascade="all, delete-orphan")
    payments = relationship("Payment", back_populates="user")
    payment_methods = relationship("PaymentMethod", back_populates="user")
    plaid_items = relationship("PlaidItem", back_populates="user", cascade="all, delete-orphan")

    def __repr__(self) -> str:
        """String representation of the user."""
        return f"<User {self.username} ({self.email})>"
