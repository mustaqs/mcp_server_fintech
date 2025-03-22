"""
PayPal payment provider implementation for the MCP Fintech Platform.
"""
from datetime import datetime
from typing import Any, Dict, Optional

import requests

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


class PayPalPaymentProvider(PaymentProviderBase):
    """PayPal payment provider implementation."""
    
    def initialize(self, config: Dict[str, Any]) -> None:
        """Initialize the PayPal client with API credentials."""
        try:
            self.client_id = config.get("client_id")
            self.client_secret = config.get("client_secret")
            self.environment = config.get("environment", "sandbox")
            
            if not self.client_id or not self.client_secret:
                raise PaymentError("PayPal client_id and client_secret are required")
            
            # Set API base URL based on environment
            if self.environment == "production":
                self.api_base_url = "https://api.paypal.com"
            else:
                self.api_base_url = "https://api.sandbox.paypal.com"
            
            # Get initial access token
            self._refresh_access_token()
        except Exception as e:
            raise PaymentError(f"Failed to initialize PayPal: {str(e)}")
    
    def _refresh_access_token(self) -> None:
        """Get a new access token from PayPal."""
        try:
            response = requests.post(
                f"{self.api_base_url}/v1/oauth2/token",
                auth=(self.client_id, self.client_secret),
                data={"grant_type": "client_credentials"},
                headers={"Accept": "application/json", "Accept-Language": "en_US"},
            )
            response.raise_for_status()
            token_data = response.json()
            self.access_token = token_data["access_token"]
            self.token_expires_at = datetime.utcnow().timestamp() + token_data["expires_in"]
        except requests.RequestException as e:
            raise PaymentProviderError(
                provider=ProviderEnum.PAYPAL,
                message=f"Failed to get access token: {str(e)}",
                code="token_error",
            )
    
    def _ensure_valid_token(self) -> None:
        """Ensure the access token is valid, refresh if needed."""
        if datetime.utcnow().timestamp() >= self.token_expires_at:
            self._refresh_access_token()
    
    def create_payment(self, request: PaymentRequest) -> PaymentResponse:
        """Create a new payment with PayPal."""
        try:
            self._ensure_valid_token()
            
            # Create PayPal order
            payload = {
                "intent": "CAPTURE",
                "purchase_units": [
                    {
                        "amount": {
                            "currency_code": request.currency.upper(),
                            "value": str(request.amount),
                        },
                        "description": request.description or "Payment via MCP Fintech",
                    }
                ],
                "application_context": {
                    "return_url": request.metadata.get("return_url", "https://example.com/return"),
                    "cancel_url": request.metadata.get("cancel_url", "https://example.com/cancel"),
                },
            }
            
            response = requests.post(
                f"{self.api_base_url}/v2/checkout/orders",
                json=payload,
                headers={
                    "Content-Type": "application/json",
                    "Authorization": f"Bearer {self.access_token}",
                },
            )
            response.raise_for_status()
            order_data = response.json()
            
            now = datetime.utcnow().isoformat()
            
            return PaymentResponse(
                payment_id=order_data["id"],
                status=self._map_paypal_status(order_data["status"]),
                amount=float(order_data["purchase_units"][0]["amount"]["value"]),
                currency=order_data["purchase_units"][0]["amount"]["currency_code"],
                provider=ProviderEnum.PAYPAL,
                provider_response=order_data,
                created_at=now,
                updated_at=now,
            )
        except requests.RequestException as e:
            raise PaymentProviderError(
                provider=ProviderEnum.PAYPAL,
                message=str(e),
                code="api_error",
            )
    
    def get_payment(self, payment_id: str) -> PaymentResponse:
        """Get payment details from PayPal."""
        try:
            self._ensure_valid_token()
            
            response = requests.get(
                f"{self.api_base_url}/v2/checkout/orders/{payment_id}",
                headers={"Authorization": f"Bearer {self.access_token}"},
            )
            response.raise_for_status()
            order_data = response.json()
            
            return PaymentResponse(
                payment_id=order_data["id"],
                status=self._map_paypal_status(order_data["status"]),
                amount=float(order_data["purchase_units"][0]["amount"]["value"]),
                currency=order_data["purchase_units"][0]["amount"]["currency_code"],
                provider=ProviderEnum.PAYPAL,
                provider_response=order_data,
                created_at=order_data.get("create_time", datetime.utcnow().isoformat()),
                updated_at=order_data.get("update_time", datetime.utcnow().isoformat()),
            )
        except requests.RequestException as e:
            raise PaymentProviderError(
                provider=ProviderEnum.PAYPAL,
                message=str(e),
                code="api_error",
            )
    
    def cancel_payment(self, payment_id: str) -> PaymentResponse:
        """Cancel a payment in PayPal."""
        # Get the current payment status first
        payment = self.get_payment(payment_id)
        
        # PayPal doesn't have a direct cancel API for orders
        # We can only cancel orders in CREATED state
        if payment.status != PaymentStatus.PENDING:
            raise PaymentProviderError(
                provider=ProviderEnum.PAYPAL,
                message=f"Cannot cancel payment in {payment.status} state",
                code="invalid_state",
            )
        
        return payment
    
    def refund_payment(
        self, payment_id: str, amount: Optional[float] = None
    ) -> PaymentResponse:
        """Refund a payment in PayPal."""
        try:
            self._ensure_valid_token()
            
            # Get capture ID from the order
            order_response = requests.get(
                f"{self.api_base_url}/v2/checkout/orders/{payment_id}",
                headers={"Authorization": f"Bearer {self.access_token}"},
            )
            order_response.raise_for_status()
            order_data = order_response.json()
            
            # Check if order is completed and has captures
            if order_data["status"] != "COMPLETED":
                raise PaymentProviderError(
                    provider=ProviderEnum.PAYPAL,
                    message="Cannot refund an uncompleted payment",
                    code="invalid_state",
                )
            
            # Get capture ID from the order
            capture_id = None
            for purchase_unit in order_data["purchase_units"]:
                if "payments" in purchase_unit and "captures" in purchase_unit["payments"]:
                    capture_id = purchase_unit["payments"]["captures"][0]["id"]
                    break
            
            if not capture_id:
                raise PaymentProviderError(
                    provider=ProviderEnum.PAYPAL,
                    message="No capture found for this payment",
                    code="no_capture",
                )
            
            # Create refund payload
            refund_payload = {}
            if amount is not None:
                refund_payload["amount"] = {
                    "value": str(amount),
                    "currency_code": order_data["purchase_units"][0]["amount"]["currency_code"],
                }
            
            # Process refund
            refund_response = requests.post(
                f"{self.api_base_url}/v2/payments/captures/{capture_id}/refund",
                json=refund_payload,
                headers={
                    "Content-Type": "application/json",
                    "Authorization": f"Bearer {self.access_token}",
                },
            )
            refund_response.raise_for_status()
            refund_data = refund_response.json()
            
            # Get updated order
            updated_order = self.get_payment(payment_id)
            updated_order.provider_response["refund"] = refund_data
            updated_order.status = PaymentStatus.REFUNDED
            
            return updated_order
        except requests.RequestException as e:
            raise PaymentProviderError(
                provider=ProviderEnum.PAYPAL,
                message=str(e),
                code="api_error",
            )
    
    def _map_paypal_status(self, paypal_status: str) -> PaymentStatus:
        """Map PayPal payment status to our internal status."""
        status_map = {
            "CREATED": PaymentStatus.PENDING,
            "SAVED": PaymentStatus.PENDING,
            "APPROVED": PaymentStatus.PROCESSING,
            "VOIDED": PaymentStatus.CANCELED,
            "COMPLETED": PaymentStatus.COMPLETED,
            "PAYER_ACTION_REQUIRED": PaymentStatus.PENDING,
        }
        return status_map.get(paypal_status, PaymentStatus.FAILED)
