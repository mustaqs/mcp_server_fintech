"""
Stripe payment provider implementation for the MCP Fintech Platform.
"""
from datetime import datetime
from typing import Any, Dict, Optional

import stripe
from stripe.error import StripeError

from app.services.payment_service import (
    PaymentError,
    PaymentMethod,
    PaymentProviderBase,
    PaymentProviderError,
    PaymentProvider,
    PaymentRequest,
    PaymentResponse,
    PaymentStatus,
)


class StripePaymentProvider(PaymentProviderBase):
    """Stripe payment provider implementation."""
    
    def initialize(self, config: Dict[str, Any]) -> None:
        """Initialize the Stripe client with API keys."""
        try:
            api_key = config.get("api_key")
            if not api_key:
                raise PaymentError("Stripe API key is required")
            
            stripe.api_key = api_key
            self.webhook_secret = config.get("webhook_secret")
            
            # Optional configuration
            stripe.api_version = config.get("api_version", "2023-10-16")
            self.default_currency = config.get("default_currency", "USD")
        except Exception as e:
            raise PaymentError(f"Failed to initialize Stripe: {str(e)}")
    
    def create_payment(self, request: PaymentRequest) -> PaymentResponse:
        """Create a new payment intent with Stripe."""
        try:
            # Create a payment intent
            payment_intent = stripe.PaymentIntent.create(
                amount=int(request.amount * 100),  # Convert to cents
                currency=request.currency.lower(),
                description=request.description,
                metadata=request.metadata,
            )
            
            now = datetime.utcnow().isoformat()
            
            return PaymentResponse(
                payment_id=payment_intent.id,
                status=self._map_stripe_status(payment_intent.status),
                amount=payment_intent.amount / 100,  # Convert from cents
                currency=payment_intent.currency,
                provider=ProviderEnum.STRIPE,
                provider_response=payment_intent,
                created_at=now,
                updated_at=now,
            )
        except StripeError as e:
            raise PaymentProviderError(
                provider=ProviderEnum.STRIPE,
                message=str(e),
                code=getattr(e, "code", None),
            )
    
    def get_payment(self, payment_id: str) -> PaymentResponse:
        """Get payment details from Stripe."""
        try:
            payment_intent = stripe.PaymentIntent.retrieve(payment_id)
            
            return PaymentResponse(
                payment_id=payment_intent.id,
                status=self._map_stripe_status(payment_intent.status),
                amount=payment_intent.amount / 100,  # Convert from cents
                currency=payment_intent.currency,
                provider=ProviderEnum.STRIPE,
                provider_response=payment_intent,
                created_at=datetime.fromtimestamp(payment_intent.created).isoformat(),
                updated_at=datetime.utcnow().isoformat(),
            )
        except StripeError as e:
            raise PaymentProviderError(
                provider=ProviderEnum.STRIPE,
                message=str(e),
                code=getattr(e, "code", None),
            )
    
    def cancel_payment(self, payment_id: str) -> PaymentResponse:
        """Cancel a payment intent in Stripe."""
        try:
            payment_intent = stripe.PaymentIntent.cancel(payment_id)
            
            return PaymentResponse(
                payment_id=payment_intent.id,
                status=self._map_stripe_status(payment_intent.status),
                amount=payment_intent.amount / 100,  # Convert from cents
                currency=payment_intent.currency,
                provider=ProviderEnum.STRIPE,
                provider_response=payment_intent,
                created_at=datetime.fromtimestamp(payment_intent.created).isoformat(),
                updated_at=datetime.utcnow().isoformat(),
            )
        except StripeError as e:
            raise PaymentProviderError(
                provider=ProviderEnum.STRIPE,
                message=str(e),
                code=getattr(e, "code", None),
            )
    
    def refund_payment(
        self, payment_id: str, amount: Optional[float] = None
    ) -> PaymentResponse:
        """Refund a payment in Stripe."""
        try:
            refund_params = {"payment_intent": payment_id}
            
            if amount is not None:
                refund_params["amount"] = int(amount * 100)  # Convert to cents
            
            refund = stripe.Refund.create(**refund_params)
            payment_intent = stripe.PaymentIntent.retrieve(payment_id)
            
            return PaymentResponse(
                payment_id=payment_intent.id,
                status=self._map_stripe_status(payment_intent.status),
                amount=payment_intent.amount / 100,  # Convert from cents
                currency=payment_intent.currency,
                provider=ProviderEnum.STRIPE,
                provider_response={
                    "payment_intent": payment_intent,
                    "refund": refund,
                },
                created_at=datetime.fromtimestamp(payment_intent.created).isoformat(),
                updated_at=datetime.utcnow().isoformat(),
            )
        except StripeError as e:
            raise PaymentProviderError(
                provider=ProviderEnum.STRIPE,
                message=str(e),
                code=getattr(e, "code", None),
            )
    
    def _map_stripe_status(self, stripe_status: str) -> PaymentStatus:
        """Map Stripe payment status to our internal status."""
        status_map = {
            "requires_payment_method": PaymentStatus.PENDING,
            "requires_confirmation": PaymentStatus.PENDING,
            "requires_action": PaymentStatus.PENDING,
            "processing": PaymentStatus.PROCESSING,
            "requires_capture": PaymentStatus.PROCESSING,
            "succeeded": PaymentStatus.COMPLETED,
            "canceled": PaymentStatus.CANCELED,
        }
        return status_map.get(stripe_status, PaymentStatus.FAILED)
