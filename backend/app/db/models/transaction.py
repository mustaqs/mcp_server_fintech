"""
Transaction model for the MCP Fintech Platform.
"""
import uuid
from datetime import datetime
from enum import Enum, auto
from typing import Optional

from sqlalchemy import Column, String, Float, DateTime, ForeignKey, Enum as SQLAlchemyEnum, Text
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship

from app.db.database import Base


class TransactionType(str, Enum):
    """Enum for transaction types."""
    DEPOSIT = "deposit"
    WITHDRAWAL = "withdrawal"
    TRANSFER = "transfer"
    PAYMENT = "payment"
    FEE = "fee"
    INTEREST = "interest"
    REFUND = "refund"
    ADJUSTMENT = "adjustment"


class TransactionStatus(str, Enum):
    """Enum for transaction status."""
    PENDING = "pending"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"
    REVERSED = "reversed"


class Transaction(Base):
    """
    Transaction model representing a financial transaction in the platform.
    
    This includes deposits, withdrawals, transfers, payments, etc.
    """
    __tablename__ = "transactions"
    
    # Primary key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    # Transaction information
    transaction_reference = Column(String, unique=True, index=True, nullable=False)
    transaction_type = Column(SQLAlchemyEnum(TransactionType), nullable=False)
    status = Column(SQLAlchemyEnum(TransactionStatus), default=TransactionStatus.PENDING)
    
    # Financial information
    amount = Column(Float, nullable=False)
    currency = Column(String, default="USD")
    fee_amount = Column(Float, default=0.0)
    
    # Transaction details
    description = Column(String, nullable=True)
    notes = Column(Text, nullable=True)
    transaction_metadata = Column(JSONB, nullable=True)  # For storing additional transaction data
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    processed_at = Column(DateTime, nullable=True)
    
    # Relationships
    account_id = Column(UUID(as_uuid=True), ForeignKey("accounts.id"), nullable=False)
    account = relationship("Account", back_populates="transactions")
    
    # For transfers, we can optionally track the destination account
    destination_account_id = Column(UUID(as_uuid=True), ForeignKey("accounts.id"), nullable=True)
    
    def __repr__(self) -> str:
        """String representation of the transaction."""
        return f"<Transaction {self.transaction_reference} ({self.transaction_type.value})>"
