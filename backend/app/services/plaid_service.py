"""
Plaid service for the MCP Fintech Platform.

This module provides functions for interacting with the Plaid API
for banking integration features beyond basic payments.
"""
import logging
import os
from datetime import datetime
from typing import Any, Dict, List, Optional, Union
from uuid import UUID

import plaid
from plaid.api import plaid_api
from plaid.model.country_code import CountryCode
from plaid.model.depository_account_subtype import DepositoryAccountSubtype
from plaid.model.depository_account_subtypes import DepositoryAccountSubtypes
from plaid.model.depository_filter import DepositoryFilter
from plaid.model.item_public_token_exchange_request import ItemPublicTokenExchangeRequest
from plaid.model.link_token_create_request import LinkTokenCreateRequest
from plaid.model.link_token_create_request_user import LinkTokenCreateRequestUser
from plaid.model.products import Products
from plaid.model.transactions_get_request import TransactionsGetRequest
from plaid.model.transactions_get_request_options import TransactionsGetRequestOptions
from sqlalchemy.orm import Session

from app.db.models.user import User

# Configure logging
logger = logging.getLogger(__name__)


class PlaidService:
    """Service for interacting with the Plaid API."""

    def __init__(self):
        """Initialize the Plaid client."""
        self.client = None
        self.environment = os.getenv("PLAID_ENVIRONMENT", "sandbox")
        self.client_id = os.getenv("PLAID_CLIENT_ID")
        self.secret = os.getenv("PLAID_SECRET")
        self.products = [
            Products("transactions"),
            Products("auth"),
            Products("balance"),
        ]
        self.country_codes = [CountryCode("US")]
        self.webhook_url = os.getenv("PLAID_WEBHOOK_URL")

        # Initialize the client
        self._initialize_client()

    def _initialize_client(self) -> None:
        """Initialize the Plaid client with API credentials."""
        if not self.client_id or not self.secret:
            logger.warning("Plaid credentials not configured")
            return

        try:
            # Configure Plaid client
            configuration = plaid.Configuration(
                host=self._get_plaid_environment(),
                api_key={
                    "clientId": self.client_id,
                    "secret": self.secret,
                }
            )

            api_client = plaid.ApiClient(configuration)
            self.client = plaid_api.PlaidApi(api_client)
            logger.info("Plaid client initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize Plaid client: {str(e)}")
            raise

    def _get_plaid_environment(self) -> str:
        """Get the Plaid API URL based on environment."""
        env_map = {
            "sandbox": plaid.Environment.Sandbox,
            "development": plaid.Environment.Development,
            "production": plaid.Environment.Production,
        }
        return env_map.get(self.environment.lower(), plaid.Environment.Sandbox)

    def create_link_token(self, user: User, redirect_uri: Optional[str] = None) -> Dict[str, Any]:
        """
        Create a Plaid Link token for account linking.
        
        Args:
            user: The user to create the link token for
            redirect_uri: Optional redirect URI for OAuth flows
            
        Returns:
            Dictionary containing the link token and expiration
        """
        if not self.client:
            raise ValueError("Plaid client not initialized")

        try:
            # Create a link token for the given user
            request = LinkTokenCreateRequest(
                user=LinkTokenCreateRequestUser(
                    client_user_id=str(user.id)
                ),
                client_name="MCP Fintech Platform",
                products=self.products,
                country_codes=self.country_codes,
                language="en",
                webhook=self.webhook_url,
                redirect_uri=redirect_uri,
            )

            response = self.client.link_token_create(request)
            return {
                "link_token": response["link_token"],
                "expiration": response["expiration"],
            }
        except plaid.ApiException as e:
            logger.error(f"Error creating Plaid link token: {str(e)}")
            raise

    def exchange_public_token(self, public_token: str) -> Dict[str, Any]:
        """
        Exchange a public token for an access token and item ID.
        
        Args:
            public_token: The public token to exchange
            
        Returns:
            Dictionary containing the access token and item ID
        """
        if not self.client:
            raise ValueError("Plaid client not initialized")

        try:
            request = ItemPublicTokenExchangeRequest(
                public_token=public_token
            )
            response = self.client.item_public_token_exchange(request)
            
            return {
                "access_token": response["access_token"],
                "item_id": response["item_id"],
            }
        except plaid.ApiException as e:
            logger.error(f"Error exchanging public token: {str(e)}")
            raise

    def get_accounts(self, access_token: str) -> List[Dict[str, Any]]:
        """
        Get accounts for a user.
        
        Args:
            access_token: The access token for the user
            
        Returns:
            List of accounts
        """
        if not self.client:
            raise ValueError("Plaid client not initialized")

        try:
            response = self.client.accounts_get({"access_token": access_token})
            return response["accounts"]
        except plaid.ApiException as e:
            logger.error(f"Error getting accounts: {str(e)}")
            raise

    def get_account_balances(self, access_token: str, account_ids: Optional[List[str]] = None) -> List[Dict[str, Any]]:
        """
        Get account balances.
        
        Args:
            access_token: The access token for the user
            account_ids: Optional list of account IDs to filter by
            
        Returns:
            List of accounts with balance information
        """
        if not self.client:
            raise ValueError("Plaid client not initialized")

        try:
            request = {"access_token": access_token}
            if account_ids:
                request["options"] = {"account_ids": account_ids}
                
            response = self.client.accounts_balance_get(request)
            return response["accounts"]
        except plaid.ApiException as e:
            logger.error(f"Error getting account balances: {str(e)}")
            raise

    def get_transactions(
        self, 
        access_token: str, 
        start_date: str, 
        end_date: str,
        account_ids: Optional[List[str]] = None,
        count: int = 100,
        offset: int = 0
    ) -> Dict[str, Any]:
        """
        Get transactions for a user.
        
        Args:
            access_token: The access token for the user
            start_date: Start date in YYYY-MM-DD format
            end_date: End date in YYYY-MM-DD format
            account_ids: Optional list of account IDs to filter by
            count: Number of transactions to fetch
            offset: Offset for pagination
            
        Returns:
            Dictionary containing transactions and account information
        """
        if not self.client:
            raise ValueError("Plaid client not initialized")

        try:
            options = TransactionsGetRequestOptions(
                count=count,
                offset=offset,
            )
            
            if account_ids:
                options.account_ids = account_ids
                
            request = TransactionsGetRequest(
                access_token=access_token,
                start_date=start_date,
                end_date=end_date,
                options=options
            )
            
            response = self.client.transactions_get(request)
            return {
                "accounts": response["accounts"],
                "transactions": response["transactions"],
                "total_transactions": response["total_transactions"],
            }
        except plaid.ApiException as e:
            logger.error(f"Error getting transactions: {str(e)}")
            raise

    def sync_transactions(
        self,
        access_token: str,
        cursor: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Sync transactions for a user using the transactions/sync endpoint.
        
        Args:
            access_token: The access token for the user
            cursor: Optional cursor for pagination
            
        Returns:
            Dictionary containing added, modified, and removed transactions
        """
        if not self.client:
            raise ValueError("Plaid client not initialized")

        try:
            request = {
                "access_token": access_token,
            }
            
            if cursor:
                request["cursor"] = cursor
                
            response = self.client.transactions_sync(request)
            return {
                "added": response["added"],
                "modified": response["modified"],
                "removed": response["removed"],
                "next_cursor": response["next_cursor"],
                "has_more": response["has_more"],
            }
        except plaid.ApiException as e:
            logger.error(f"Error syncing transactions: {str(e)}")
            raise

    def get_institution(self, institution_id: str) -> Dict[str, Any]:
        """
        Get details about a financial institution.
        
        Args:
            institution_id: The institution ID
            
        Returns:
            Institution details
        """
        if not self.client:
            raise ValueError("Plaid client not initialized")

        try:
            response = self.client.institutions_get_by_id(
                {"institution_id": institution_id, "country_codes": self.country_codes}
            )
            return response["institution"]
        except plaid.ApiException as e:
            logger.error(f"Error getting institution: {str(e)}")
            raise
            
    def handle_webhook(self, webhook_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Process a webhook event from Plaid.
        
        Args:
            webhook_data: The webhook payload from Plaid
            
        Returns:
            Dictionary with processed webhook information
        """
        if not webhook_data:
            raise ValueError("Empty webhook data received")
            
        webhook_type = webhook_data.get("webhook_type")
        webhook_code = webhook_data.get("webhook_code")
        item_id = webhook_data.get("item_id")
        
        if not all([webhook_type, webhook_code, item_id]):
            raise ValueError("Invalid webhook data: missing required fields")
            
        logger.info(f"Processing Plaid webhook: {webhook_type}/{webhook_code} for item {item_id}")
        
        result = {
            "webhook_type": webhook_type,
            "webhook_code": webhook_code,
            "item_id": item_id,
            "requires_action": False,
            "action": None,
        }
        
        # Handle different webhook types
        if webhook_type == "TRANSACTIONS":
            return self._handle_transactions_webhook(webhook_code, webhook_data, result)
        elif webhook_type == "ITEM":
            return self._handle_item_webhook(webhook_code, webhook_data, result)
        elif webhook_type == "AUTH":
            return self._handle_auth_webhook(webhook_code, webhook_data, result)
        
        # Default case - just return the basic info
        return result
    
    def _handle_transactions_webhook(self, webhook_code: str, webhook_data: Dict[str, Any], result: Dict[str, Any]) -> Dict[str, Any]:
        """
        Handle transaction-related webhooks.
        """
        if webhook_code == "INITIAL_UPDATE":
            result["message"] = "Initial transaction pull finished"
            result["requires_action"] = True
            result["action"] = "sync_transactions"
        elif webhook_code == "HISTORICAL_UPDATE":
            result["message"] = "Historical transaction pull finished"
            result["requires_action"] = True
            result["action"] = "sync_transactions"
        elif webhook_code == "DEFAULT_UPDATE":
            result["message"] = "New transactions available"
            result["requires_action"] = True
            result["action"] = "sync_transactions"
        elif webhook_code == "TRANSACTIONS_REMOVED":
            result["message"] = "Transactions removed"
            result["requires_action"] = True
            result["action"] = "sync_transactions"
            result["removed_transactions"] = webhook_data.get("removed_transactions", [])
        
        return result
    
    def _handle_item_webhook(self, webhook_code: str, webhook_data: Dict[str, Any], result: Dict[str, Any]) -> Dict[str, Any]:
        """
        Handle item-related webhooks.
        """
        if webhook_code == "ERROR":
            result["message"] = "Item error occurred"
            result["requires_action"] = True
            result["action"] = "update_item_error"
            result["error"] = webhook_data.get("error", {})
        elif webhook_code == "PENDING_EXPIRATION":
            result["message"] = "Access token is expiring soon"
            result["requires_action"] = True
            result["action"] = "notify_user"
            result["days_available"] = webhook_data.get("consent_expiration_time", 0)
        elif webhook_code == "USER_PERMISSION_REVOKED":
            result["message"] = "User revoked access"
            result["requires_action"] = True
            result["action"] = "remove_item"
        
        return result
    
    def _handle_auth_webhook(self, webhook_code: str, webhook_data: Dict[str, Any], result: Dict[str, Any]) -> Dict[str, Any]:
        """
        Handle auth-related webhooks.
        """
        if webhook_code == "AUTOMATICALLY_VERIFIED":
            result["message"] = "Microdeposits automatically verified"
            result["requires_action"] = True
            result["action"] = "update_account_status"
        elif webhook_code == "VERIFICATION_EXPIRED":
            result["message"] = "Microdeposits verification expired"
            result["requires_action"] = True
            result["action"] = "notify_user"
        
        return result


# Global Plaid service instance
plaid_service = PlaidService()


def get_plaid_service() -> PlaidService:
    """Get the global Plaid service instance."""
    return plaid_service
