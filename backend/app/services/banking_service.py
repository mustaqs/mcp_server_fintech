"""
Banking service for the MCP Fintech Platform.

This module provides functions for managing banking data in the database.
"""
import logging
from datetime import datetime
from typing import Any, Dict, List, Optional, Union
from uuid import UUID

from sqlalchemy.orm import Session

from app.db.models.banking import PlaidItem, PlaidAccount, PlaidTransaction
from app.db.models.user import User
from app.schemas.banking import (
    PlaidItemCreate, PlaidItemUpdate,
    PlaidAccountCreate, PlaidAccountUpdate,
    PlaidTransactionCreate, PlaidTransactionUpdate
)
from app.services.plaid_service import get_plaid_service

# Configure logging
logger = logging.getLogger(__name__)


class BankingService:
    """Service for managing banking data in the database."""

    def __init__(self, db: Session):
        """
        Initialize the banking service.
        
        Args:
            db: Database session
        """
        self.db = db
        self.plaid_service = get_plaid_service()

    # Plaid Item operations
    def create_plaid_item(self, item_data: PlaidItemCreate) -> PlaidItem:
        """
        Create a new Plaid Item.
        
        Args:
            item_data: Plaid Item data
            
        Returns:
            Created Plaid Item
        """
        db_item = PlaidItem(**item_data.dict())
        self.db.add(db_item)
        self.db.commit()
        self.db.refresh(db_item)
        return db_item

    def get_plaid_item(self, item_id: UUID) -> Optional[PlaidItem]:
        """
        Get a Plaid Item by ID.
        
        Args:
            item_id: Plaid Item ID
            
        Returns:
            Plaid Item if found, None otherwise
        """
        return self.db.query(PlaidItem).filter(PlaidItem.id == item_id).first()

    def get_plaid_item_by_item_id(self, plaid_item_id: str) -> Optional[PlaidItem]:
        """
        Get a Plaid Item by Plaid Item ID.
        
        Args:
            plaid_item_id: Plaid Item ID from Plaid
            
        Returns:
            Plaid Item if found, None otherwise
        """
        return self.db.query(PlaidItem).filter(PlaidItem.item_id == plaid_item_id).first()

    def get_user_plaid_items(self, user_id: UUID) -> List[PlaidItem]:
        """
        Get all Plaid Items for a user.
        
        Args:
            user_id: User ID
            
        Returns:
            List of Plaid Items
        """
        return self.db.query(PlaidItem).filter(PlaidItem.user_id == user_id).all()

    def update_plaid_item(self, item_id: UUID, item_data: PlaidItemUpdate) -> Optional[PlaidItem]:
        """
        Update a Plaid Item.
        
        Args:
            item_id: Plaid Item ID
            item_data: Plaid Item update data
            
        Returns:
            Updated Plaid Item if found, None otherwise
        """
        db_item = self.get_plaid_item(item_id)
        if not db_item:
            return None
            
        update_data = item_data.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_item, field, value)
            
        self.db.commit()
        self.db.refresh(db_item)
        return db_item

    def delete_plaid_item(self, item_id: UUID) -> bool:
        """
        Delete a Plaid Item.
        
        Args:
            item_id: Plaid Item ID
            
        Returns:
            True if deleted, False otherwise
        """
        db_item = self.get_plaid_item(item_id)
        if not db_item:
            return False
            
        self.db.delete(db_item)
        self.db.commit()
        return True

    # Plaid Account operations
    def create_plaid_account(self, account_data: PlaidAccountCreate) -> PlaidAccount:
        """
        Create a new Plaid Account.
        
        Args:
            account_data: Plaid Account data
            
        Returns:
            Created Plaid Account
        """
        db_account = PlaidAccount(**account_data.dict())
        self.db.add(db_account)
        self.db.commit()
        self.db.refresh(db_account)
        return db_account

    def get_plaid_account(self, account_id: UUID) -> Optional[PlaidAccount]:
        """
        Get a Plaid Account by ID.
        
        Args:
            account_id: Plaid Account ID
            
        Returns:
            Plaid Account if found, None otherwise
        """
        return self.db.query(PlaidAccount).filter(PlaidAccount.id == account_id).first()

    def get_plaid_account_by_account_id(self, plaid_account_id: str) -> Optional[PlaidAccount]:
        """
        Get a Plaid Account by Plaid Account ID.
        
        Args:
            plaid_account_id: Plaid Account ID from Plaid
            
        Returns:
            Plaid Account if found, None otherwise
        """
        return self.db.query(PlaidAccount).filter(PlaidAccount.account_id == plaid_account_id).first()

    def get_item_accounts(self, item_id: UUID) -> List[PlaidAccount]:
        """
        Get all Plaid Accounts for a Plaid Item.
        
        Args:
            item_id: Plaid Item ID
            
        Returns:
            List of Plaid Accounts
        """
        return self.db.query(PlaidAccount).filter(PlaidAccount.item_id == item_id).all()

    def update_plaid_account(self, account_id: UUID, account_data: PlaidAccountUpdate) -> Optional[PlaidAccount]:
        """
        Update a Plaid Account.
        
        Args:
            account_id: Plaid Account ID
            account_data: Plaid Account update data
            
        Returns:
            Updated Plaid Account if found, None otherwise
        """
        db_account = self.get_plaid_account(account_id)
        if not db_account:
            return None
            
        update_data = account_data.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_account, field, value)
            
        self.db.commit()
        self.db.refresh(db_account)
        return db_account

    def delete_plaid_account(self, account_id: UUID) -> bool:
        """
        Delete a Plaid Account.
        
        Args:
            account_id: Plaid Account ID
            
        Returns:
            True if deleted, False otherwise
        """
        db_account = self.get_plaid_account(account_id)
        if not db_account:
            return False
            
        self.db.delete(db_account)
        self.db.commit()
        return True

    # Plaid Transaction operations
    def create_plaid_transaction(self, transaction_data: PlaidTransactionCreate) -> PlaidTransaction:
        """
        Create a new Plaid Transaction.
        
        Args:
            transaction_data: Plaid Transaction data
            
        Returns:
            Created Plaid Transaction
        """
        db_transaction = PlaidTransaction(**transaction_data.dict())
        self.db.add(db_transaction)
        self.db.commit()
        self.db.refresh(db_transaction)
        return db_transaction

    def get_plaid_transaction(self, transaction_id: UUID) -> Optional[PlaidTransaction]:
        """
        Get a Plaid Transaction by ID.
        
        Args:
            transaction_id: Plaid Transaction ID
            
        Returns:
            Plaid Transaction if found, None otherwise
        """
        return self.db.query(PlaidTransaction).filter(PlaidTransaction.id == transaction_id).first()

    def get_plaid_transaction_by_transaction_id(self, plaid_transaction_id: str) -> Optional[PlaidTransaction]:
        """
        Get a Plaid Transaction by Plaid Transaction ID.
        
        Args:
            plaid_transaction_id: Plaid Transaction ID from Plaid
            
        Returns:
            Plaid Transaction if found, None otherwise
        """
        return self.db.query(PlaidTransaction).filter(
            PlaidTransaction.transaction_id == plaid_transaction_id
        ).first()

    def get_account_transactions(self, account_id: UUID) -> List[PlaidTransaction]:
        """
        Get all Plaid Transactions for a Plaid Account.
        
        Args:
            account_id: Plaid Account ID
            
        Returns:
            List of Plaid Transactions
        """
        return self.db.query(PlaidTransaction).filter(
            PlaidTransaction.account_id == account_id
        ).order_by(PlaidTransaction.date.desc()).all()

    def update_plaid_transaction(
        self, transaction_id: UUID, transaction_data: PlaidTransactionUpdate
    ) -> Optional[PlaidTransaction]:
        """
        Update a Plaid Transaction.
        
        Args:
            transaction_id: Plaid Transaction ID
            transaction_data: Plaid Transaction update data
            
        Returns:
            Updated Plaid Transaction if found, None otherwise
        """
        db_transaction = self.get_plaid_transaction(transaction_id)
        if not db_transaction:
            return None
            
        update_data = transaction_data.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_transaction, field, value)
            
        self.db.commit()
        self.db.refresh(db_transaction)
        return db_transaction

    def delete_plaid_transaction(self, transaction_id: UUID) -> bool:
        """
        Delete a Plaid Transaction.
        
        Args:
            transaction_id: Plaid Transaction ID
            
        Returns:
            True if deleted, False otherwise
        """
        db_transaction = self.get_plaid_transaction(transaction_id)
        if not db_transaction:
            return False
            
        self.db.delete(db_transaction)
        self.db.commit()
        return True

    # Integration operations
    def link_account(self, user_id: UUID, public_token: str) -> Dict[str, Any]:
        """
        Link a bank account using a Plaid public token.
        
        Args:
            user_id: User ID
            public_token: Plaid public token
            
        Returns:
            Dictionary with link status information
        """
        try:
            # Exchange the public token for an access token
            exchange_response = self.plaid_service.exchange_public_token(public_token)
            
            # Get the access token and item ID
            access_token = exchange_response["access_token"]
            item_id = exchange_response["item_id"]
            
            # Check if the item already exists
            existing_item = self.get_plaid_item_by_item_id(item_id)
            if existing_item:
                return {
                    "success": False,
                    "message": "This account is already linked",
                    "item_id": str(existing_item.id),
                }
                
            # Get institution information
            institution_id = None
            institution_name = None
            
            try:
                # Get accounts to retrieve institution information
                accounts = self.plaid_service.get_accounts(access_token)
                if accounts and len(accounts) > 0:
                    institution_id = accounts[0].get("institution_id")
                    if institution_id:
                        institution = self.plaid_service.get_institution(institution_id)
                        institution_name = institution.get("name")
            except Exception as e:
                logger.warning(f"Failed to get institution info: {str(e)}")
                
            # Create the Plaid Item
            item_data = PlaidItemCreate(
                user_id=user_id,
                item_id=item_id,
                access_token=access_token,
                institution_id=institution_id,
                institution_name=institution_name,
            )
            
            db_item = self.create_plaid_item(item_data)
            
            # Fetch and store accounts
            self.sync_accounts(db_item.id)
            
            return {
                "success": True,
                "message": "Account linked successfully",
                "item_id": str(db_item.id),
            }
        except Exception as e:
            logger.error(f"Error linking account: {str(e)}")
            return {
                "success": False,
                "message": f"Error linking account: {str(e)}",
            }

    def sync_accounts(self, item_id: UUID) -> Dict[str, Any]:
        """
        Sync accounts for a Plaid Item.
        
        Args:
            item_id: Plaid Item ID
            
        Returns:
            Dictionary with sync status information
        """
        try:
            # Get the Plaid Item
            db_item = self.get_plaid_item(item_id)
            if not db_item:
                return {
                    "success": False,
                    "message": "Plaid Item not found",
                }
                
            # Get accounts from Plaid
            accounts = self.plaid_service.get_accounts(db_item.access_token)
            
            # Track created and updated accounts
            created_accounts = []
            updated_accounts = []
            
            # Process each account
            for account in accounts:
                plaid_account_id = account.get("account_id")
                
                # Check if the account already exists
                existing_account = self.get_plaid_account_by_account_id(plaid_account_id)
                
                if existing_account:
                    # Update existing account
                    account_data = PlaidAccountUpdate(
                        name=account.get("name"),
                        mask=account.get("mask"),
                        official_name=account.get("official_name"),
                        type=account.get("type"),
                        subtype=account.get("subtype"),
                        available_balance=str(account.get("balances", {}).get("available", 0)),
                        current_balance=str(account.get("balances", {}).get("current", 0)),
                        limit_amount=str(account.get("balances", {}).get("limit", 0)),
                        iso_currency_code=account.get("balances", {}).get("iso_currency_code"),
                        last_balance_update=datetime.utcnow(),
                    )
                    
                    updated_account = self.update_plaid_account(existing_account.id, account_data)
                    updated_accounts.append(updated_account)
                else:
                    # Create new account
                    account_data = PlaidAccountCreate(
                        item_id=db_item.id,
                        account_id=plaid_account_id,
                        name=account.get("name"),
                        mask=account.get("mask"),
                        official_name=account.get("official_name"),
                        type=account.get("type"),
                        subtype=account.get("subtype"),
                        available_balance=str(account.get("balances", {}).get("available", 0)),
                        current_balance=str(account.get("balances", {}).get("current", 0)),
                        limit_amount=str(account.get("balances", {}).get("limit", 0)),
                        iso_currency_code=account.get("balances", {}).get("iso_currency_code"),
                    )
                    
                    created_account = self.create_plaid_account(account_data)
                    created_accounts.append(created_account)
                    
            # Update the Plaid Item
            self.update_plaid_item(
                db_item.id,
                PlaidItemUpdate(last_sync_at=datetime.utcnow())
            )
            
            return {
                "success": True,
                "message": "Accounts synced successfully",
                "created": len(created_accounts),
                "updated": len(updated_accounts),
            }
        except Exception as e:
            logger.error(f"Error syncing accounts: {str(e)}")
            return {
                "success": False,
                "message": f"Error syncing accounts: {str(e)}",
            }

    def sync_transactions(self, item_id: UUID, days: int = 30) -> Dict[str, Any]:
        """
        Sync transactions for a Plaid Item.
        
        Args:
            item_id: Plaid Item ID
            days: Number of days of transactions to sync
            
        Returns:
            Dictionary with sync status information
        """
        try:
            # Get the Plaid Item
            db_item = self.get_plaid_item(item_id)
            if not db_item:
                return {
                    "success": False,
                    "message": "Plaid Item not found",
                }
                
            # Get accounts for this item
            db_accounts = self.get_item_accounts(db_item.id)
            if not db_accounts:
                return {
                    "success": False,
                    "message": "No accounts found for this item",
                }
                
            # Calculate date range
            end_date = datetime.utcnow().strftime("%Y-%m-%d")
            start_date = (datetime.utcnow() - datetime.timedelta(days=days)).strftime("%Y-%m-%d")
            
            # Get transactions from Plaid
            transactions_response = self.plaid_service.get_transactions(
                db_item.access_token,
                start_date=start_date,
                end_date=end_date,
            )
            
            # Track created and updated transactions
            created_transactions = []
            updated_transactions = []
            
            # Process each transaction
            for transaction in transactions_response.get("transactions", []):
                plaid_transaction_id = transaction.get("transaction_id")
                plaid_account_id = transaction.get("account_id")
                
                # Find the corresponding account
                db_account = next(
                    (a for a in db_accounts if a.account_id == plaid_account_id),
                    None
                )
                
                if not db_account:
                    logger.warning(f"Account not found for transaction: {plaid_transaction_id}")
                    continue
                    
                # Check if the transaction already exists
                existing_transaction = self.get_plaid_transaction_by_transaction_id(plaid_transaction_id)
                
                if existing_transaction:
                    # Update existing transaction
                    transaction_data = PlaidTransactionUpdate(
                        amount=str(transaction.get("amount")),
                        date=datetime.strptime(transaction.get("date"), "%Y-%m-%d"),
                        name=transaction.get("name"),
                        merchant_name=transaction.get("merchant_name"),
                        payment_channel=transaction.get("payment_channel"),
                        primary_category=transaction.get("category", [""])[0] if transaction.get("category") else None,
                        detailed_category=transaction.get("category_id"),
                        location=transaction.get("location"),
                        payment_meta=transaction.get("payment_meta"),
                        iso_currency_code=transaction.get("iso_currency_code"),
                        pending=transaction.get("pending", False),
                    )
                    
                    updated_transaction = self.update_plaid_transaction(
                        existing_transaction.id,
                        transaction_data
                    )
                    updated_transactions.append(updated_transaction)
                else:
                    # Create new transaction
                    transaction_data = PlaidTransactionCreate(
                        account_id=db_account.id,
                        transaction_id=plaid_transaction_id,
                        amount=str(transaction.get("amount")),
                        date=datetime.strptime(transaction.get("date"), "%Y-%m-%d"),
                        name=transaction.get("name"),
                        merchant_name=transaction.get("merchant_name"),
                        payment_channel=transaction.get("payment_channel"),
                        primary_category=transaction.get("category", [""])[0] if transaction.get("category") else None,
                        detailed_category=transaction.get("category_id"),
                        location=transaction.get("location"),
                        payment_meta=transaction.get("payment_meta"),
                        iso_currency_code=transaction.get("iso_currency_code"),
                        pending=transaction.get("pending", False),
                    )
                    
                    created_transaction = self.create_plaid_transaction(transaction_data)
                    created_transactions.append(created_transaction)
                    
            # Update the Plaid Item
            self.update_plaid_item(
                db_item.id,
                PlaidItemUpdate(last_sync_at=datetime.utcnow())
            )
            
            return {
                "success": True,
                "message": "Transactions synced successfully",
                "created": len(created_transactions),
                "updated": len(updated_transactions),
            }
        except Exception as e:
            logger.error(f"Error syncing transactions: {str(e)}")
            return {
                "success": False,
                "message": f"Error syncing transactions: {str(e)}",
            }


    def process_webhook(self, webhook_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Process a webhook event from Plaid and update the database accordingly.
        
        Args:
            webhook_data: The webhook payload from Plaid
            
        Returns:
            Dictionary with processing result
        """
        try:
            # Use the Plaid service to interpret the webhook
            webhook_result = self.plaid_service.handle_webhook(webhook_data)
            
            # If no action is required, just return the result
            if not webhook_result.get("requires_action"):
                return {
                    "success": True,
                    "message": "Webhook processed, no action required",
                    "webhook_result": webhook_result
                }
                
            # Get the Plaid Item from the database
            plaid_item_id = webhook_result.get("item_id")
            db_item = self.get_plaid_item_by_item_id(plaid_item_id)
            
            if not db_item:
                return {
                    "success": False,
                    "message": f"Plaid Item not found: {plaid_item_id}",
                    "webhook_result": webhook_result
                }
                
            # Process the webhook based on the required action
            action = webhook_result.get("action")
            
            if action == "sync_transactions":
                # Sync transactions for this item
                sync_result = self.sync_item_transactions(db_item.id)
                return {
                    "success": sync_result.get("success", False),
                    "message": sync_result.get("message", "Transaction sync completed"),
                    "webhook_result": webhook_result,
                    "sync_result": sync_result
                }
                
            elif action == "update_item_error":
                # Update the item with the error information
                error_data = webhook_result.get("error", {})
                update_data = PlaidItemUpdate(
                    error=error_data,
                    is_active=False if error_data.get("error_code") in ["ITEM_LOGIN_REQUIRED", "INVALID_CREDENTIALS"] else True
                )
                
                self.update_plaid_item(db_item.id, update_data)
                return {
                    "success": True,
                    "message": "Item error updated",
                    "webhook_result": webhook_result
                }
                
            elif action == "remove_item":
                # User revoked access, delete the item
                self.delete_plaid_item(db_item.id)
                return {
                    "success": True,
                    "message": "Item removed due to user permission revocation",
                    "webhook_result": webhook_result
                }
                
            elif action == "update_account_status":
                # Update account status (e.g., for microdeposit verification)
                accounts = self.get_item_accounts(db_item.id)
                for account in accounts:
                    self.update_plaid_account(
                        account.id,
                        PlaidAccountUpdate(is_active=True)
                    )
                    
                return {
                    "success": True,
                    "message": "Account status updated",
                    "webhook_result": webhook_result
                }
                
            elif action == "notify_user":
                # This would typically trigger a notification to the user
                # For now, we'll just log it and return success
                logger.info(f"User notification required: {webhook_result.get('message')}")
                return {
                    "success": True,
                    "message": "User notification logged",
                    "webhook_result": webhook_result
                }
                
            # Default case - unknown action
            return {
                "success": False,
                "message": f"Unknown action required: {action}",
                "webhook_result": webhook_result
            }
            
        except Exception as e:
            logger.error(f"Error processing webhook: {str(e)}")
            return {
                "success": False,
                "message": f"Error processing webhook: {str(e)}",
                "webhook_data": webhook_data
            }


def get_banking_service(db: Session) -> BankingService:
    """
    Get a banking service instance.
    
    Args:
        db: Database session
        
    Returns:
        Banking service instance
    """
    return BankingService(db)
