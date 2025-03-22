"""
Database models for banking integration.
"""
import uuid
from datetime import datetime
from typing import Dict, Any, Optional

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, String, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.db.database import Base


class PlaidItem(Base):
    """
    Model representing a Plaid Item (linked bank account).
    
    A Plaid Item represents a connection to a financial institution.
    Each Item can have multiple accounts.
    """
    __tablename__ = "plaid_items"

    # Primary key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    # User relationship
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    
    # Plaid specific fields
    item_id = Column(String, unique=True, nullable=False, index=True)
    access_token = Column(String, nullable=False)  # Encrypted in production
    institution_id = Column(String, nullable=True)
    institution_name = Column(String, nullable=True)
    
    # Status fields
    is_active = Column(Boolean, default=True)
    error = Column(JSON, nullable=True)
    
    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_sync_at = Column(DateTime, nullable=True)
    
    # Relationships
    user = relationship("User", back_populates="plaid_items")
    accounts = relationship("PlaidAccount", back_populates="item", cascade="all, delete-orphan")
    
    def __repr__(self) -> str:
        """String representation of the Plaid Item."""
        return f"<PlaidItem {self.institution_name} ({self.item_id})>"


class PlaidAccount(Base):
    """
    Model representing a Plaid Account.
    
    A Plaid Account represents a specific financial account at an institution,
    such as a checking account or credit card.
    """
    __tablename__ = "plaid_accounts"

    # Primary key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    # Plaid Item relationship
    item_id = Column(UUID(as_uuid=True), ForeignKey("plaid_items.id", ondelete="CASCADE"), nullable=False)
    
    # Plaid specific fields
    account_id = Column(String, unique=True, nullable=False, index=True)
    mask = Column(String, nullable=True)
    name = Column(String, nullable=False)
    official_name = Column(String, nullable=True)
    type = Column(String, nullable=False)  # e.g., 'depository', 'credit'
    subtype = Column(String, nullable=True)  # e.g., 'checking', 'savings'
    
    # Balance information
    available_balance = Column(String, nullable=True)
    current_balance = Column(String, nullable=True)
    limit_amount = Column(String, nullable=True)
    iso_currency_code = Column(String, nullable=True)
    
    # Status fields
    is_active = Column(Boolean, default=True)
    
    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_balance_update = Column(DateTime, nullable=True)
    
    # Relationships
    item = relationship("PlaidItem", back_populates="accounts")
    transactions = relationship("PlaidTransaction", back_populates="account", cascade="all, delete-orphan")
    
    def __repr__(self) -> str:
        """String representation of the Plaid Account."""
        return f"<PlaidAccount {self.name} ({self.mask})>"


class PlaidTransaction(Base):
    """
    Model representing a Plaid Transaction.
    
    A Plaid Transaction represents a financial transaction in a specific account.
    """
    __tablename__ = "plaid_transactions"

    # Primary key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    # Plaid Account relationship
    account_id = Column(UUID(as_uuid=True), ForeignKey("plaid_accounts.id", ondelete="CASCADE"), nullable=False)
    
    # Plaid specific fields
    transaction_id = Column(String, unique=True, nullable=False, index=True)
    amount = Column(String, nullable=False)
    date = Column(DateTime, nullable=False)
    name = Column(String, nullable=False)
    merchant_name = Column(String, nullable=True)
    payment_channel = Column(String, nullable=True)  # e.g., 'online', 'in store'
    primary_category = Column(String, nullable=True)
    detailed_category = Column(String, nullable=True)
    location = Column(JSON, nullable=True)
    payment_meta = Column(JSON, nullable=True)
    iso_currency_code = Column(String, nullable=True)
    
    # Status fields
    pending = Column(Boolean, default=False)
    
    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    account = relationship("PlaidAccount", back_populates="transactions")
    
    def __repr__(self) -> str:
        """String representation of the Plaid Transaction."""
        return f"<PlaidTransaction {self.name} ({self.amount})>"
