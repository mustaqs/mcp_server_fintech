"""
Plaid & ACH payment provider implementation for the MCP Fintech Platform.
"""
from datetime import datetime
from typing import Any, Dict, Optional

import plaid
from plaid.api import plaid_api
from plaid.model.payment_initiation_payment_create_request import PaymentInitiationPaymentCreateRequest
from plaid.model.payment_initiation_payment_get_request import PaymentInitiationPaymentGetRequest
from plaid.model.products import Products
from plaid.model.country_code import CountryCode
from plaid.model.recipient_bacs_nullable import RecipientBACSNullable
from plaid.model.payment_amount import PaymentAmount
from plaid.model.payment_amount_currency import PaymentAmountCurrency

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


class PlaidACHPaymentProvider(PaymentProviderBase):
    """Plaid & ACH payment provider implementation."""
    
    def initialize(self, config: Dict[str, Any]) -> None:
        """Initialize the Plaid client with API credentials."""
        try:
            client_id = config.get("client_id")
            secret = config.get("secret")
            environment = config.get("environment", "sandbox")
            
            if not client_id or not secret:
                raise PaymentError("Plaid client_id and secret are required")
            
            # Configure Plaid client
            configuration = plaid.Configuration(
                host=self._get_plaid_environment(environment),
                api_key={
                    "clientId": client_id,
                    "secret": secret,
                }
            )
            
            api_client = plaid.ApiClient(configuration)
            self.client = plaid_api.PlaidApi(api_client)
            
            # Store ACH-specific configuration
            self.ach_config = {
                "account_id": config.get("ach_account_id"),
                "routing_number": config.get("ach_routing_number"),
                "account_name": config.get("ach_account_name", "MCP Fintech"),
            }
            
            if not self.ach_config["account_id"] or not self.ach_config["routing_number"]:
                raise PaymentError("ACH account_id and routing_number are required")
        except Exception as e:
            raise PaymentError(f"Failed to initialize Plaid & ACH: {str(e)}")
    
    def _get_plaid_environment(self, environment: str) -> str:
        """Get the Plaid API URL based on environment."""
        env_map = {
            "sandbox": plaid.Environment.Sandbox,
            "development": plaid.Environment.Development,
            "production": plaid.Environment.Production,
        }
        return env_map.get(environment.lower(), plaid.Environment.Sandbox)
    
    def create_payment(self, request: PaymentRequest) -> PaymentResponse:
        """Create a new payment with Plaid & ACH."""
        try:
            # Create payment amount object
            payment_amount = PaymentAmount(
                currency=PaymentAmountCurrency(request.currency.upper()),
                value=request.amount,
            )
            
            # Create payment recipient (using metadata for recipient details)
            recipient_id = request.metadata.get("recipient_id")
            
            if not recipient_id:
                raise PaymentProviderError(
                    provider=ProviderEnum.PLAID,
                    message="Recipient ID is required for Plaid payments",
                    code="missing_recipient",
                )
            
            # Create payment
            create_request = PaymentInitiationPaymentCreateRequest(
                recipient_id=recipient_id,
                reference=request.description or "Payment via MCP Fintech",
                amount=payment_amount,
            )
            
            payment_response = self.client.payment_initiation_payment_create(create_request)
            payment_id = payment_response["payment_id"]
            
            now = datetime.utcnow().isoformat()
            
            return PaymentResponse(
                payment_id=payment_id,
                status=self._map_plaid_status(payment_response["status"]),
                amount=request.amount,
                currency=request.currency,
                provider=ProviderEnum.PLAID,
                provider_response=payment_response.to_dict(),
                created_at=now,
                updated_at=now,
            )
        except plaid.ApiException as e:
            raise PaymentProviderError(
                provider=ProviderEnum.PLAID,
                message=str(e),
                code=str(e.status),
            )
    
    def get_payment(self, payment_id: str) -> PaymentResponse:
        """Get payment details from Plaid."""
        try:
            get_request = PaymentInitiationPaymentGetRequest(payment_id=payment_id)
            payment_response = self.client.payment_initiation_payment_get(get_request)
            
            return PaymentResponse(
                payment_id=payment_id,
                status=self._map_plaid_status(payment_response["status"]),
                amount=payment_response["amount"]["value"],
                currency=payment_response["amount"]["currency"],
                provider=ProviderEnum.PLAID,
                provider_response=payment_response.to_dict(),
                created_at=payment_response.get("created", datetime.utcnow().isoformat()),
                updated_at=payment_response.get("last_status_update", datetime.utcnow().isoformat()),
            )
        except plaid.ApiException as e:
            raise PaymentProviderError(
                provider=ProviderEnum.PLAID,
                message=str(e),
                code=str(e.status),
            )
    
    def cancel_payment(self, payment_id: str) -> PaymentResponse:
        """Cancel a payment in Plaid."""
        # Plaid doesn't support direct cancellation of payments via API
        # We can only check if it's in a cancellable state
        payment = self.get_payment(payment_id)
        
        if payment.status not in [PaymentStatus.PENDING, PaymentStatus.PROCESSING]:
            raise PaymentProviderError(
                provider=ProviderEnum.PLAID,
                message=f"Cannot cancel payment in {payment.status} state",
                code="invalid_state",
            )
        
        # For ACH payments, we would need to implement a custom cancellation process
        # This would typically involve contacting the ACH network or your bank
        # For this implementation, we'll just return the current payment status
        return payment
    
    def refund_payment(
        self, payment_id: str, amount: Optional[float] = None
    ) -> PaymentResponse:
        """Refund a payment in Plaid & ACH."""
        # Plaid doesn't have a direct refund API
        # For ACH refunds, we would need to initiate a new ACH transfer in the opposite direction
        # This would typically be handled through your bank or ACH processor
        
        # Get the current payment
        payment = self.get_payment(payment_id)
        
        if payment.status != PaymentStatus.COMPLETED:
            raise PaymentProviderError(
                provider=ProviderEnum.PLAID,
                message="Cannot refund an uncompleted payment",
                code="invalid_state",
            )
        
        # For a real implementation, we would create a new ACH transfer here
        # For this implementation, we'll just update the status
        payment.status = PaymentStatus.REFUNDED
        payment.updated_at = datetime.utcnow().isoformat()
        
        return payment
    
    def _map_plaid_status(self, plaid_status: str) -> PaymentStatus:
        """Map Plaid payment status to our internal status."""
        status_map = {
            "PAYMENT_STATUS_INPUT_NEEDED": PaymentStatus.PENDING,
            "PAYMENT_STATUS_PROCESSING": PaymentStatus.PROCESSING,
            "PAYMENT_STATUS_INITIATED": PaymentStatus.PROCESSING,
            "PAYMENT_STATUS_COMPLETED": PaymentStatus.COMPLETED,
            "PAYMENT_STATUS_EXECUTED": PaymentStatus.COMPLETED,
            "PAYMENT_STATUS_REJECTED": PaymentStatus.FAILED,
            "PAYMENT_STATUS_CANCELLED": PaymentStatus.CANCELED,
            "PAYMENT_STATUS_FAILED": PaymentStatus.FAILED,
        }
        return status_map.get(plaid_status, PaymentStatus.FAILED)
