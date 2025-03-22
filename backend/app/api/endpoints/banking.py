"""
API endpoints for banking operations.
"""
from datetime import datetime, timedelta
import logging
from typing import Any, Dict, List, Optional, Union
from uuid import UUID

# Configure logging
logger = logging.getLogger(__name__)

from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.core.config import settings
from app.db.models.user import User
from app.schemas.banking import (
    LinkTokenCreate, LinkTokenResponse,
    ExchangeTokenRequest, ExchangeTokenResponse,
    PlaidItem, PlaidAccount, PlaidTransaction,
    TransactionSyncRequest, TransactionSyncResponse,
    WebhookResponse
)
from app.services.banking_service import get_banking_service
from app.services.plaid_service import get_plaid_service

router = APIRouter()


@router.post("/link/token", response_model=LinkTokenResponse)
def create_link_token(
    *,
    db: Session = Depends(get_db),
    request: LinkTokenCreate,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Create a Plaid Link token for account linking.
    
    This token is used to initialize the Plaid Link flow in the frontend.
    """
    try:
        plaid_service = get_plaid_service()
        link_token = plaid_service.create_link_token(
            user=current_user,
            redirect_uri=request.redirect_uri,
        )
        return link_token
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e),
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating link token: {str(e)}",
        )


@router.post("/link/exchange", response_model=ExchangeTokenResponse)
def exchange_public_token(
    *,
    db: Session = Depends(get_db),
    request: ExchangeTokenRequest,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Exchange a public token for an access token and item ID.
    
    This endpoint should be called after a user successfully links their account
    through the Plaid Link flow. It stores the access token securely in the database.
    """
    try:
        banking_service = get_banking_service(db)
        result = banking_service.link_account(
            user_id=current_user.id,
            public_token=request.public_token
        )
        
        return ExchangeTokenResponse(
            success=result["success"],
            item_id=result.get("item_id", ""),
            message=result["message"]
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e),
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error exchanging public token: {str(e)}",
        )


@router.get("/items", response_model=List[PlaidItem])
def get_user_plaid_items(
    *,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Get all Plaid Items (linked bank accounts) for the current user.
    """
    try:
        banking_service = get_banking_service(db)
        items = banking_service.get_user_plaid_items(user_id=current_user.id)
        return items
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error getting Plaid items: {str(e)}",
        )


@router.get("/items/{item_id}", response_model=PlaidItem)
def get_plaid_item(
    *,
    db: Session = Depends(get_db),
    item_id: UUID,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Get a specific Plaid Item by ID.
    """
    try:
        banking_service = get_banking_service(db)
        item = banking_service.get_plaid_item(item_id=item_id)
        
        if not item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Plaid item not found",
            )
            
        # Check if the item belongs to the current user
        if item.user_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to access this Plaid item",
            )
            
        return item
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error getting Plaid item: {str(e)}",
        )


@router.get("/items/{item_id}/accounts", response_model=List[PlaidAccount])
def get_item_accounts(
    *,
    db: Session = Depends(get_db),
    item_id: UUID,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Get all accounts for a specific Plaid Item.
    """
    try:
        banking_service = get_banking_service(db)
        
        # Check if the item exists and belongs to the current user
        item = banking_service.get_plaid_item(item_id=item_id)
        if not item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Plaid item not found",
            )
            
        if item.user_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to access this Plaid item",
            )
        
        accounts = banking_service.get_item_accounts(item_id=item_id)
        return accounts
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error getting accounts: {str(e)}",
        )


@router.post("/items/{item_id}/sync", response_model=Dict[str, Any])
def sync_item_accounts(
    *,
    db: Session = Depends(get_db),
    item_id: UUID,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Sync accounts for a specific Plaid Item.
    
    This updates the account information and balances from Plaid.
    """
    try:
        banking_service = get_banking_service(db)
        
        # Check if the item exists and belongs to the current user
        item = banking_service.get_plaid_item(item_id=item_id)
        if not item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Plaid item not found",
            )
            
        if item.user_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to access this Plaid item",
            )
        
        result = banking_service.sync_accounts(item_id=item_id)
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error syncing accounts: {str(e)}",
        )


@router.get("/accounts/{account_id}", response_model=PlaidAccount)
def get_account(
    *,
    db: Session = Depends(get_db),
    account_id: UUID,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Get a specific Plaid Account by ID.
    """
    try:
        banking_service = get_banking_service(db)
        account = banking_service.get_plaid_account(account_id=account_id)
        
        if not account:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Account not found",
            )
            
        # Check if the account belongs to the current user
        item = banking_service.get_plaid_item(item_id=account.item_id)
        if item.user_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to access this account",
            )
            
        return account
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error getting account: {str(e)}",
        )


@router.get("/accounts/{account_id}/transactions", response_model=List[PlaidTransaction])
def get_account_transactions(
    *,
    db: Session = Depends(get_db),
    account_id: UUID,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Get transactions for a specific account.
    """
    try:
        banking_service = get_banking_service(db)
        
        # Check if the account exists
        account = banking_service.get_plaid_account(account_id=account_id)
        if not account:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Account not found",
            )
            
        # Check if the account belongs to the current user
        item = banking_service.get_plaid_item(item_id=account.item_id)
        if item.user_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to access this account",
            )
            
        transactions = banking_service.get_account_transactions(account_id=account_id)
        return transactions
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error getting transactions: {str(e)}",
        )


@router.post("/items/{item_id}/transactions/sync", response_model=Dict[str, Any])
def sync_item_transactions(
    *,
    db: Session = Depends(get_db),
    item_id: UUID,
    days: int = Query(30, ge=1, le=90),
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Sync transactions for a specific Plaid Item.
    
    This fetches transactions from Plaid and stores them in the database.
    """
    try:
        banking_service = get_banking_service(db)
        
        # Check if the item exists and belongs to the current user
        item = banking_service.get_plaid_item(item_id=item_id)
        if not item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Plaid item not found",
            )
            
        if item.user_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to access this Plaid item",
            )
        
        result = banking_service.sync_transactions(item_id=item_id, days=days)
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error syncing transactions: {str(e)}",
        )


@router.delete("/items/{item_id}", response_model=Dict[str, Any])
def delete_plaid_item(
    *,
    db: Session = Depends(get_db),
    item_id: UUID,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Delete a Plaid Item.
    
    This removes the item and all associated accounts and transactions from the database.
    """


@router.post("/webhook", response_model=WebhookResponse)
async def handle_plaid_webhook(
    *,
    db: Session = Depends(get_db),
    request: Request,
) -> Any:
    """
    Handle webhooks from Plaid.
    
    This endpoint receives real-time updates from Plaid about transactions,
    item status, and other events. It processes these events and updates
    the database accordingly.
    
    Note: This endpoint is not authenticated as it is called directly by Plaid.
    Webhook verification should be implemented for production environments.
    """
    try:
        # Get the webhook payload
        webhook_data = await request.json()
        
        # Log the webhook for debugging
        logger.info(f"Received Plaid webhook: {webhook_data}")
        
        # TODO: In production, verify the webhook signature
        # This would use the Plaid webhook verification process
        # https://plaid.com/docs/api/webhooks/webhook-verification/
        
        # Process the webhook
        banking_service = get_banking_service(db)
        result = banking_service.process_webhook(webhook_data)
        
        return WebhookResponse(
            success=result["success"],
            message=result["message"]
        )
    except ValueError as e:
        logger.error(f"Webhook validation error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
    except Exception as e:
        logger.error(f"Error processing webhook: {str(e)}")
        # Return a 200 status even for errors to prevent Plaid from retrying
        # Log the error but don't expose details in the response
        return WebhookResponse(
            success=False,
            message="Webhook received but processing failed"
        )
    try:
        banking_service = get_banking_service(db)
        
        # Check if the item exists and belongs to the current user
        item = banking_service.get_plaid_item(item_id=item_id)
        if not item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Plaid item not found",
            )
            
        if item.user_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to access this Plaid item",
            )
        
        success = banking_service.delete_plaid_item(item_id=item_id)
        
        if success:
            return {"success": True, "message": "Plaid item deleted successfully"}
        else:
            return {"success": False, "message": "Failed to delete Plaid item"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error deleting Plaid item: {str(e)}",
        )
