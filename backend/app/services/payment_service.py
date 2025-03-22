"""
Payment service for the MCP Fintech Platform.

This module provides a generic payment abstraction layer for handling
different payment providers (Stripe, PayPal, Plaid & ACH).
"""
from abc import ABC, abstractmethod
from enum import Enum
from typing import Any, Dict, List, Optional, Union
from uuid import UUID

from sqlalchemy.orm import Session

from app.db.models.user import User


class PaymentStatus(str, Enum):
    """Payment status enum."""
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"
    REFUNDED = "refunded"
    CANCELED = "canceled"


class PaymentMethod(str, Enum):
    """Payment method enum."""
    CREDIT_CARD = "credit_card"
    DEBIT_CARD = "debit_card"
    BANK_TRANSFER = "bank_transfer"
    DIGITAL_WALLET = "digital_wallet"
    OTHER = "other"


class PaymentProvider(str, Enum):
    """Payment provider enum."""
    STRIPE = "stripe"
    PAYPAL = "paypal"
    PLAID = "plaid"
    ACH = "ach"


class PaymentError(Exception):
    """Base exception for payment-related errors."""
    pass


class PaymentProviderError(PaymentError):
    """Exception for payment provider-specific errors."""
    def __init__(self, provider: PaymentProvider, message: str, code: Optional[str] = None):
        self.provider = provider
        self.code = code
        super().__init__(f"{provider.value} error: {message} (code: {code})")


class PaymentRequest:
    """Base payment request model."""
    def __init__(
        self,
        amount: float,
        currency: str,
        description: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None,
    ):
        self.amount = amount
        self.currency = currency
        self.description = description
        self.metadata = metadata or {}


class PaymentResponse:
    """Base payment response model."""
    def __init__(
        self,
        payment_id: str,
        status: PaymentStatus,
        amount: float,
        currency: str,
        provider: PaymentProvider,
        provider_response: Dict[str, Any],
        created_at: str,
        updated_at: str,
    ):
        self.payment_id = payment_id
        self.status = status
        self.amount = amount
        self.currency = currency
        self.provider = provider
        self.provider_response = provider_response
        self.created_at = created_at
        self.updated_at = updated_at


class PaymentProviderBase(ABC):
    """Abstract base class for payment providers."""
    
    @abstractmethod
    def initialize(self, config: Dict[str, Any]) -> None:
        """Initialize the payment provider with configuration."""
        pass
    
    @abstractmethod
    def create_payment(self, request: PaymentRequest) -> PaymentResponse:
        """Create a new payment."""
        pass
    
    @abstractmethod
    def get_payment(self, payment_id: str) -> PaymentResponse:
        """Get payment details by ID."""
        pass
    
    @abstractmethod
    def cancel_payment(self, payment_id: str) -> PaymentResponse:
        """Cancel a payment."""
        pass
    
    @abstractmethod
    def refund_payment(
        self, payment_id: str, amount: Optional[float] = None
    ) -> PaymentResponse:
        """Refund a payment, partially or fully."""
        pass


class PaymentService:
    """Payment service that abstracts away provider-specific details."""
    
    def __init__(self):
        self.providers: Dict[PaymentProvider, PaymentProviderBase] = {}
        self.default_provider: Optional[PaymentProviderBase] = None
    
    def register_provider(
        self, provider_type: PaymentProvider, provider: PaymentProviderBase, 
        config: Dict[str, Any], set_as_default: bool = False
    ) -> None:
        """Register a payment provider with the service."""
        provider.initialize(config)
        self.providers[provider_type] = provider
        
        if set_as_default or self.default_provider is None:
            self.default_provider = provider_type
    
    def get_provider(self, provider_type: Optional[PaymentProvider] = None) -> PaymentProviderBase:
        """Get a specific payment provider or the default one."""
        if provider_type is None:
            if self.default_provider is None:
                raise PaymentError("No default payment provider configured")
            provider_type = self.default_provider
        
        if provider_type not in self.providers:
            raise PaymentError(f"Payment provider {provider_type.value} not registered")
        
        return self.providers[provider_type]
    
    def create_payment(
        self, request: PaymentRequest, provider_type: Optional[PaymentProvider] = None
    ) -> PaymentResponse:
        """Create a new payment using the specified or default provider."""
        provider = self.get_provider(provider_type)
        return provider.create_payment(request)
    
    def get_payment(
        self, payment_id: str, provider_type: Optional[PaymentProvider] = None
    ) -> PaymentResponse:
        """Get payment details by ID using the specified or default provider."""
        provider = self.get_provider(provider_type)
        return provider.get_payment(payment_id)
    
    def cancel_payment(
        self, payment_id: str, provider_type: Optional[PaymentProvider] = None
    ) -> PaymentResponse:
        """Cancel a payment using the specified or default provider."""
        provider = self.get_provider(provider_type)
        return provider.cancel_payment(payment_id)
    
    def refund_payment(
        self, payment_id: str, amount: Optional[float] = None,
        provider_type: Optional[PaymentProvider] = None
    ) -> PaymentResponse:
        """Refund a payment using the specified or default provider."""
        provider = self.get_provider(provider_type)
        return provider.refund_payment(payment_id, amount)


# Global payment service instance
payment_service = PaymentService()


def get_payment_service() -> PaymentService:
    """Get the global payment service instance."""
    return payment_service
