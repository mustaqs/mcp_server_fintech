"""
Payment transaction service for the MCP Fintech Platform.

This module provides functions for payment processing using the payment abstraction layer.
"""
import uuid
from datetime import datetime
from typing import Dict, List, Optional, Tuple, Union, Any

from sqlalchemy.orm import Session

from app.db.models.payment import Payment, Refund, PaymentMethod as PaymentMethodModel
from app.schemas.payment import PaymentCreate, PaymentUpdate, RefundCreate
from app.services.payment_service import (
    PaymentProvider as ProviderEnum,
    PaymentRequest,
    PaymentResponse as ProviderResponse,
    PaymentService,
    PaymentStatus,
    PaymentMethod,
    PaymentError,
    get_payment_service,
)


def create_payment(
    db: Session, user_id: uuid.UUID, payment_data: PaymentCreate
) -> Payment:
    """Create a new payment."""
    # Get payment service
    payment_service = get_payment_service()
    
    # Create payment request
    request = PaymentRequest(
        amount=payment_data.amount,
        currency=payment_data.currency,
        description=payment_data.description,
        metadata={
            **(payment_data.metadata or {}),
            "user_id": str(user_id),
            "return_url": payment_data.return_url,
            "cancel_url": payment_data.cancel_url,
        },
    )
    
    # Process payment with provider
    provider_response = payment_service.create_payment(
        request=request, provider_type=payment_data.provider
    )
    
    # Create payment record in database
    db_payment = Payment(
        id=uuid.uuid4(),
        external_id=provider_response.payment_id,
        user_id=user_id,
        amount=provider_response.amount,
        currency=provider_response.currency,
        status=provider_response.status,
        provider=payment_data.provider,
        method=payment_data.method,
        description=payment_data.description,
        metadata=payment_data.metadata,
        provider_response=provider_response.provider_response,
        is_test=payment_data.is_test,
    )
    
    # Save to database
    db.add(db_payment)
    db.commit()
    db.refresh(db_payment)
    
    return db_payment


def get_payment_by_id(db: Session, payment_id: uuid.UUID) -> Optional[Payment]:
    """Get a payment by ID."""
    return db.query(Payment).filter(Payment.id == payment_id).first()


def get_payment_by_external_id(db: Session, external_id: str) -> Optional[Payment]:
    """Get a payment by external ID."""
    return db.query(Payment).filter(Payment.external_id == external_id).first()


def get_user_payments(
    db: Session, user_id: uuid.UUID, skip: int = 0, limit: int = 100
) -> List[Payment]:
    """Get payments for a specific user."""
    return (
        db.query(Payment)
        .filter(Payment.user_id == user_id)
        .order_by(Payment.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )


def update_payment_status(
    db: Session, payment_id: uuid.UUID, status: PaymentStatus, 
    provider_response: Optional[Dict[str, Any]] = None,
    error_message: Optional[str] = None,
    error_code: Optional[str] = None
) -> Optional[Payment]:
    """Update payment status."""
    db_payment = get_payment_by_id(db, payment_id)
    if not db_payment:
        return None
    
    # Update payment
    db_payment.status = status
    db_payment.updated_at = datetime.utcnow()
    
    if provider_response:
        db_payment.provider_response = provider_response
    
    if error_message:
        db_payment.error_message = error_message
    
    if error_code:
        db_payment.error_code = error_code
    
    # Save to database
    db.commit()
    db.refresh(db_payment)
    
    return db_payment


def sync_payment_status(db: Session, payment_id: uuid.UUID) -> Optional[Payment]:
    """Sync payment status with provider."""
    # Get payment
    db_payment = get_payment_by_id(db, payment_id)
    if not db_payment:
        return None
    
    # Get payment service
    payment_service = get_payment_service()
    
    try:
        # Get payment status from provider
        provider_response = payment_service.get_payment(
            payment_id=db_payment.external_id,
            provider_type=db_payment.provider
        )
        
        # Update payment status
        db_payment.status = provider_response.status
        db_payment.provider_response = provider_response.provider_response
        db_payment.updated_at = datetime.utcnow()
        
        # Save to database
        db.commit()
        db.refresh(db_payment)
        
        return db_payment
    except PaymentError as e:
        # Update payment with error
        db_payment.error_message = str(e)
        db_payment.error_code = getattr(e, "code", None)
        db_payment.updated_at = datetime.utcnow()
        
        # Save to database
        db.commit()
        db.refresh(db_payment)
        
        return db_payment


def cancel_payment(db: Session, payment_id: uuid.UUID) -> Optional[Payment]:
    """Cancel a payment."""
    # Get payment
    db_payment = get_payment_by_id(db, payment_id)
    if not db_payment:
        return None
    
    # Check if payment can be canceled
    if db_payment.status not in [PaymentStatus.PENDING, PaymentStatus.PROCESSING]:
        raise PaymentError(f"Cannot cancel payment in {db_payment.status} state")
    
    # Get payment service
    payment_service = get_payment_service()
    
    try:
        # Cancel payment with provider
        provider_response = payment_service.cancel_payment(
            payment_id=db_payment.external_id,
            provider_type=db_payment.provider
        )
        
        # Update payment
        db_payment.status = PaymentStatus.CANCELED
        db_payment.provider_response = provider_response.provider_response
        db_payment.updated_at = datetime.utcnow()
        
        # Save to database
        db.commit()
        db.refresh(db_payment)
        
        return db_payment
    except PaymentError as e:
        # Update payment with error
        db_payment.error_message = str(e)
        db_payment.error_code = getattr(e, "code", None)
        db_payment.updated_at = datetime.utcnow()
        
        # Save to database
        db.commit()
        db.refresh(db_payment)
        
        raise


def create_refund(
    db: Session, refund_data: RefundCreate, user_id: uuid.UUID
) -> Refund:
    """Create a refund for a payment."""
    # Get payment
    db_payment = get_payment_by_id(db, refund_data.payment_id)
    if not db_payment:
        raise PaymentError("Payment not found")
    
    # Check if payment belongs to user
    if db_payment.user_id != user_id:
        raise PaymentError("Payment does not belong to user")
    
    # Check if payment can be refunded
    if db_payment.status != PaymentStatus.COMPLETED:
        raise PaymentError(f"Cannot refund payment in {db_payment.status} state")
    
    # Get payment service
    payment_service = get_payment_service()
    
    # Determine refund amount
    refund_amount = refund_data.amount if refund_data.amount is not None else db_payment.amount
    
    try:
        # Process refund with provider
        provider_response = payment_service.refund_payment(
            payment_id=db_payment.external_id,
            amount=refund_amount,
            provider_type=db_payment.provider
        )
        
        # Create refund record
        db_refund = Refund(
            id=uuid.uuid4(),
            payment_id=db_payment.id,
            external_id=provider_response.payment_id,  # Some providers return the same ID
            amount=refund_amount,
            currency=db_payment.currency,
            status=PaymentStatus.PROCESSING,
            reason=refund_data.reason,
            metadata=refund_data.metadata,
            provider_response=provider_response.provider_response,
        )
        
        # Update payment status
        db_payment.status = PaymentStatus.REFUNDED
        db_payment.updated_at = datetime.utcnow()
        
        # Save to database
        db.add(db_refund)
        db.commit()
        db.refresh(db_refund)
        
        return db_refund
    except PaymentError as e:
        # Update payment with error
        db_payment.error_message = str(e)
        db_payment.error_code = getattr(e, "code", None)
        db_payment.updated_at = datetime.utcnow()
        
        # Save to database
        db.commit()
        db.refresh(db_payment)
        
        raise


def get_refund_by_id(db: Session, refund_id: uuid.UUID) -> Optional[Refund]:
    """Get a refund by ID."""
    return db.query(Refund).filter(Refund.id == refund_id).first()


def get_payment_refunds(
    db: Session, payment_id: uuid.UUID
) -> List[Refund]:
    """Get refunds for a specific payment."""
    return (
        db.query(Refund)
        .filter(Refund.payment_id == payment_id)
        .order_by(Refund.created_at.desc())
        .all()
    )


def create_payment_method(
    db: Session, user_id: uuid.UUID, provider: ProviderEnum, 
    type: PaymentMethod, token: str, last_four: Optional[str] = None,
    expiry_month: Optional[str] = None, expiry_year: Optional[str] = None,
    is_default: bool = False, metadata: Optional[Dict[str, Any]] = None
) -> PaymentMethodModel:
    """Create a new payment method for a user."""
    # If setting as default, unset any existing default
    if is_default:
        existing_defaults = (
            db.query(PaymentMethodModel)
            .filter(
                PaymentMethodModel.user_id == user_id,
                PaymentMethodModel.is_default == True,
                PaymentMethodModel.provider == provider,
                PaymentMethodModel.type == type
            )
            .all()
        )
        
        for method in existing_defaults:
            method.is_default = False
    
    # Create payment method
    db_method = PaymentMethodModel(
        id=uuid.uuid4(),
        user_id=user_id,
        provider=provider,
        type=type,
        token=token,
        last_four=last_four,
        expiry_month=expiry_month,
        expiry_year=expiry_year,
        is_default=is_default,
        metadata=metadata or {},
    )
    
    # Save to database
    db.add(db_method)
    db.commit()
    db.refresh(db_method)
    
    return db_method


def get_payment_method_by_id(
    db: Session, method_id: uuid.UUID
) -> Optional[PaymentMethodModel]:
    """Get a payment method by ID."""
    return db.query(PaymentMethodModel).filter(PaymentMethodModel.id == method_id).first()


def get_user_payment_methods(
    db: Session, user_id: uuid.UUID, provider: Optional[ProviderEnum] = None,
    active_only: bool = True
) -> List[PaymentMethodModel]:
    """Get payment methods for a specific user."""
    query = db.query(PaymentMethodModel).filter(PaymentMethodModel.user_id == user_id)
    
    if provider:
        query = query.filter(PaymentMethodModel.provider == provider)
    
    if active_only:
        query = query.filter(PaymentMethodModel.is_active == True)
    
    return query.order_by(PaymentMethodModel.is_default.desc(), PaymentMethodModel.created_at.desc()).all()


def get_default_payment_method(
    db: Session, user_id: uuid.UUID, provider: ProviderEnum, 
    type: Optional[PaymentMethod] = None
) -> Optional[PaymentMethodModel]:
    """Get the default payment method for a user and provider."""
    query = (
        db.query(PaymentMethodModel)
        .filter(
            PaymentMethodModel.user_id == user_id,
            PaymentMethodModel.provider == provider,
            PaymentMethodModel.is_default == True,
            PaymentMethodModel.is_active == True
        )
    )
    
    if type:
        query = query.filter(PaymentMethodModel.type == type)
    
    return query.first()


def set_default_payment_method(
    db: Session, method_id: uuid.UUID, user_id: uuid.UUID
) -> Optional[PaymentMethodModel]:
    """Set a payment method as default."""
    # Get payment method
    db_method = get_payment_method_by_id(db, method_id)
    if not db_method:
        return None
    
    # Check if payment method belongs to user
    if db_method.user_id != user_id:
        raise PaymentError("Payment method does not belong to user")
    
    # Unset any existing default
    existing_defaults = (
        db.query(PaymentMethodModel)
        .filter(
            PaymentMethodModel.user_id == user_id,
            PaymentMethodModel.is_default == True,
            PaymentMethodModel.provider == db_method.provider,
            PaymentMethodModel.type == db_method.type
        )
        .all()
    )
    
    for method in existing_defaults:
        method.is_default = False
    
    # Set as default
    db_method.is_default = True
    db_method.updated_at = datetime.utcnow()
    
    # Save to database
    db.commit()
    db.refresh(db_method)
    
    return db_method


def delete_payment_method(
    db: Session, method_id: uuid.UUID, user_id: uuid.UUID
) -> bool:
    """Delete a payment method."""
    # Get payment method
    db_method = get_payment_method_by_id(db, method_id)
    if not db_method:
        return False
    
    # Check if payment method belongs to user
    if db_method.user_id != user_id:
        raise PaymentError("Payment method does not belong to user")
    
    # Soft delete (mark as inactive)
    db_method.is_active = False
    db_method.updated_at = datetime.utcnow()
    
    # Save to database
    db.commit()
    
    return True
