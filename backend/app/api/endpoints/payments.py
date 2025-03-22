"""
API endpoints for payment operations.
"""
from typing import Any, List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Path, Query, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.db.models.user import User
from app.schemas.payment import (
    PaymentCreate,
    PaymentResponse,
    PaymentUpdate,
    RefundCreate,
    RefundResponse,
    PaymentMethodCreate,
    PaymentMethodResponse,
    PaymentMethodUpdate,
    PaymentIntentResponse,
)
from app.services import payment_transaction_service
from app.services.payment_service import PaymentError, PaymentProvider, PaymentStatus

router = APIRouter()


@router.post("/", response_model=PaymentResponse, status_code=status.HTTP_201_CREATED)
def create_payment(
    *,
    db: Session = Depends(get_db),
    payment_in: PaymentCreate,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Create a new payment.
    """
    try:
        payment = payment_transaction_service.create_payment(
            db=db, user_id=current_user.id, payment_data=payment_in
        )
        return payment
    except PaymentError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


@router.get("/", response_model=List[PaymentResponse])
def get_payments(
    *,
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Get user payments.
    """
    payments = payment_transaction_service.get_user_payments(
        db=db, user_id=current_user.id, skip=skip, limit=limit
    )
    return payments


@router.get("/{payment_id}", response_model=PaymentResponse)
def get_payment(
    *,
    db: Session = Depends(get_db),
    payment_id: UUID = Path(...),
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Get payment by ID.
    """
    payment = payment_transaction_service.get_payment_by_id(db=db, payment_id=payment_id)
    if not payment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payment not found",
        )
    
    # Check if payment belongs to user
    if payment.user_id != current_user.id and not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions",
        )
    
    return payment


@router.post("/{payment_id}/sync", response_model=PaymentResponse)
def sync_payment(
    *,
    db: Session = Depends(get_db),
    payment_id: UUID = Path(...),
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Sync payment status with provider.
    """
    payment = payment_transaction_service.get_payment_by_id(db=db, payment_id=payment_id)
    if not payment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payment not found",
        )
    
    # Check if payment belongs to user
    if payment.user_id != current_user.id and not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions",
        )
    
    try:
        updated_payment = payment_transaction_service.sync_payment_status(
            db=db, payment_id=payment_id
        )
        return updated_payment
    except PaymentError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


@router.post("/{payment_id}/cancel", response_model=PaymentResponse)
def cancel_payment(
    *,
    db: Session = Depends(get_db),
    payment_id: UUID = Path(...),
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Cancel a payment.
    """
    payment = payment_transaction_service.get_payment_by_id(db=db, payment_id=payment_id)
    if not payment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payment not found",
        )
    
    # Check if payment belongs to user
    if payment.user_id != current_user.id and not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions",
        )
    
    try:
        canceled_payment = payment_transaction_service.cancel_payment(
            db=db, payment_id=payment_id
        )
        return canceled_payment
    except PaymentError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


@router.post("/{payment_id}/refund", response_model=RefundResponse)
def refund_payment(
    *,
    db: Session = Depends(get_db),
    payment_id: UUID = Path(...),
    refund_in: RefundCreate,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Refund a payment.
    """
    # Ensure payment_id in path matches payment_id in body
    if payment_id != refund_in.payment_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Payment ID in path must match payment ID in body",
        )
    
    try:
        refund = payment_transaction_service.create_refund(
            db=db, refund_data=refund_in, user_id=current_user.id
        )
        return refund
    except PaymentError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


@router.get("/{payment_id}/refunds", response_model=List[RefundResponse])
def get_payment_refunds(
    *,
    db: Session = Depends(get_db),
    payment_id: UUID = Path(...),
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Get refunds for a payment.
    """
    payment = payment_transaction_service.get_payment_by_id(db=db, payment_id=payment_id)
    if not payment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payment not found",
        )
    
    # Check if payment belongs to user
    if payment.user_id != current_user.id and not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions",
        )
    
    refunds = payment_transaction_service.get_payment_refunds(
        db=db, payment_id=payment_id
    )
    return refunds


# Payment methods endpoints
@router.post("/methods", response_model=PaymentMethodResponse, status_code=status.HTTP_201_CREATED)
def create_payment_method(
    *,
    db: Session = Depends(get_db),
    method_in: PaymentMethodCreate,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Create a new payment method.
    """
    try:
        method = payment_transaction_service.create_payment_method(
            db=db,
            user_id=current_user.id,
            provider=method_in.provider,
            type=method_in.type,
            token=method_in.token,
            last_four=method_in.last_four,
            expiry_month=method_in.expiry_month,
            expiry_year=method_in.expiry_year,
            is_default=method_in.is_default,
            metadata=method_in.metadata,
        )
        return method
    except PaymentError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


@router.get("/methods", response_model=List[PaymentMethodResponse])
def get_payment_methods(
    *,
    db: Session = Depends(get_db),
    provider: Optional[PaymentProvider] = None,
    active_only: bool = True,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Get user payment methods.
    """
    methods = payment_transaction_service.get_user_payment_methods(
        db=db, user_id=current_user.id, provider=provider, active_only=active_only
    )
    return methods


@router.get("/methods/{method_id}", response_model=PaymentMethodResponse)
def get_payment_method(
    *,
    db: Session = Depends(get_db),
    method_id: UUID = Path(...),
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Get payment method by ID.
    """
    method = payment_transaction_service.get_payment_method_by_id(db=db, method_id=method_id)
    if not method:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payment method not found",
        )
    
    # Check if payment method belongs to user
    if method.user_id != current_user.id and not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions",
        )
    
    return method


@router.post("/methods/{method_id}/default", response_model=PaymentMethodResponse)
def set_default_payment_method(
    *,
    db: Session = Depends(get_db),
    method_id: UUID = Path(...),
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Set a payment method as default.
    """
    try:
        method = payment_transaction_service.set_default_payment_method(
            db=db, method_id=method_id, user_id=current_user.id
        )
        if not method:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Payment method not found",
            )
        return method
    except PaymentError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


@router.delete("/methods/{method_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_payment_method(
    *,
    db: Session = Depends(get_db),
    method_id: UUID = Path(...),
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Delete a payment method.
    """
    try:
        success = payment_transaction_service.delete_payment_method(
            db=db, method_id=method_id, user_id=current_user.id
        )
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Payment method not found",
            )
        return None
    except PaymentError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
