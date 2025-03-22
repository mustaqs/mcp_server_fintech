"""
Payment models for the MCP Fintech Platform.
"""
import uuid
from datetime import datetime
from typing import Dict, Any, List, Optional

from sqlalchemy import Column, String, Float, DateTime, ForeignKey, JSON, Enum, Boolean
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.db.database import Base
from app.services.payment_service import PaymentStatus, PaymentMethod, PaymentProvider


class Payment(Base):
    """Payment model for tracking payments across different providers."""
    
    __tablename__ = "payments"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    external_id = Column(String, unique=True, index=True, nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    amount = Column(Float, nullable=False)
    currency = Column(String, nullable=False)
    status = Column(Enum(PaymentStatus), nullable=False, default=PaymentStatus.PENDING)
    provider = Column(Enum(PaymentProvider), nullable=False)
    method = Column(Enum(PaymentMethod), nullable=True)
    description = Column(String, nullable=True)
    payment_metadata = Column(JSON, nullable=True)
    provider_response = Column(JSON, nullable=True)
    error_message = Column(String, nullable=True)
    error_code = Column(String, nullable=True)
    is_test = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relationships
    user = relationship("User", back_populates="payments")
    refunds = relationship("Refund", back_populates="payment")
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert payment to dictionary."""
        return {
            "id": str(self.id),
            "external_id": self.external_id,
            "user_id": str(self.user_id),
            "amount": self.amount,
            "currency": self.currency,
            "status": self.status.value,
            "provider": self.provider.value,
            "method": self.method.value if self.method else None,
            "description": self.description,
            "metadata": self.metadata,
            "error_message": self.error_message,
            "error_code": self.error_code,
            "is_test": self.is_test,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
        }


class Refund(Base):
    """Refund model for tracking payment refunds."""
    
    __tablename__ = "refunds"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    payment_id = Column(UUID(as_uuid=True), ForeignKey("payments.id"), nullable=False)
    external_id = Column(String, unique=True, index=True, nullable=False)
    amount = Column(Float, nullable=False)
    currency = Column(String, nullable=False)
    status = Column(Enum(PaymentStatus), nullable=False, default=PaymentStatus.PROCESSING)
    reason = Column(String, nullable=True)
    payment_metadata = Column(JSON, nullable=True)
    provider_response = Column(JSON, nullable=True)
    error_message = Column(String, nullable=True)
    error_code = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relationships
    payment = relationship("Payment", back_populates="refunds")
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert refund to dictionary."""
        return {
            "id": str(self.id),
            "payment_id": str(self.payment_id),
            "external_id": self.external_id,
            "amount": self.amount,
            "currency": self.currency,
            "status": self.status.value,
            "reason": self.reason,
            "metadata": self.metadata,
            "error_message": self.error_message,
            "error_code": self.error_code,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
        }


class PaymentMethod(Base):
    """Payment method model for storing user payment methods."""
    
    __tablename__ = "payment_methods"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    provider = Column(Enum(PaymentProvider), nullable=False)
    type = Column(Enum(PaymentMethod), nullable=False)
    token = Column(String, nullable=True)  # Provider-specific token
    last_four = Column(String, nullable=True)  # Last 4 digits of card or account
    expiry_month = Column(String, nullable=True)  # For cards
    expiry_year = Column(String, nullable=True)  # For cards
    is_default = Column(Boolean, default=False)
    payment_metadata = Column(JSON, nullable=True)  # Additional provider-specific data
    provider_response = Column(JSON, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relationships
    user = relationship("User", back_populates="payment_methods")
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert payment method to dictionary."""
        return {
            "id": str(self.id),
            "user_id": str(self.user_id),
            "provider": self.provider.value,
            "type": self.type.value,
            "last_four": self.last_four,
            "expiry_month": self.expiry_month,
            "expiry_year": self.expiry_year,
            "is_default": self.is_default,
            "is_active": self.is_active,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
        }
