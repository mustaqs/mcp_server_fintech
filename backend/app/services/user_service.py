"""
User service for the MCP Fintech Platform.

This module provides functions for user management and authentication operations.
"""
import uuid
from datetime import datetime
from typing import Dict, List, Optional, Tuple, Union

from sqlalchemy.orm import Session

from app.core.auth import get_password_hash, verify_password
from app.db.models.user import User
from app.schemas.user import UserCreate, UserUpdate


def get_user_by_id(db: Session, user_id: uuid.UUID) -> Optional[User]:
    """Get a user by ID."""
    return db.query(User).filter(User.id == user_id).first()


def get_user_by_email(db: Session, email: str) -> Optional[User]:
    """Get a user by email."""
    return db.query(User).filter(User.email == email).first()


def get_user_by_username(db: Session, username: str) -> Optional[User]:
    """Get a user by username."""
    return db.query(User).filter(User.username == username).first()


def get_users(
    db: Session, skip: int = 0, limit: int = 100, is_active: Optional[bool] = None
) -> List[User]:
    """Get a list of users."""
    query = db.query(User)
    
    if is_active is not None:
        query = query.filter(User.is_active == is_active)
    
    return query.offset(skip).limit(limit).all()


def create_user(db: Session, user_data: UserCreate) -> User:
    """Create a new user."""
    # Check if email already exists
    if get_user_by_email(db, user_data.email):
        raise ValueError("Email already registered")
    
    # Check if username already exists
    if get_user_by_username(db, user_data.username):
        raise ValueError("Username already taken")
    
    # Hash password
    hashed_password = get_password_hash(user_data.password)
    
    # Create user
    db_user = User(
        id=uuid.uuid4(),
        email=user_data.email,
        username=user_data.username,
        hashed_password=hashed_password,
        first_name=user_data.first_name,
        last_name=user_data.last_name,
        phone_number=user_data.phone_number,
        is_active=user_data.is_active,
        is_admin=user_data.is_admin,
        is_verified=False,
        roles=["user"],
    )
    
    # Add admin role if user is admin
    if user_data.is_admin:
        db_user.roles.append("admin")
    
    # Save to database
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    return db_user


def update_user(
    db: Session, user_id: uuid.UUID, user_data: UserUpdate
) -> Optional[User]:
    """Update an existing user."""
    # Get user
    db_user = get_user_by_id(db, user_id)
    if not db_user:
        return None
    
    # Check if email is being changed and already exists
    if user_data.email and user_data.email != db_user.email:
        existing_user = get_user_by_email(db, user_data.email)
        if existing_user:
            raise ValueError("Email already registered")
    
    # Check if username is being changed and already exists
    if user_data.username and user_data.username != db_user.username:
        existing_user = get_user_by_username(db, user_data.username)
        if existing_user:
            raise ValueError("Username already taken")
    
    # Update user fields
    update_data = user_data.dict(exclude_unset=True)
    
    # Handle password separately
    if "password" in update_data:
        hashed_password = get_password_hash(update_data.pop("password"))
        db_user.hashed_password = hashed_password
    
    # Handle admin role changes
    if "is_admin" in update_data and update_data["is_admin"] != db_user.is_admin:
        if update_data["is_admin"]:
            # Add admin role if not already present
            if "admin" not in db_user.roles:
                db_user.roles.append("admin")
        else:
            # Remove admin role if present
            if "admin" in db_user.roles:
                db_user.roles.remove("admin")
    
    # Update other fields
    for key, value in update_data.items():
        setattr(db_user, key, value)
    
    # Update timestamp
    db_user.updated_at = datetime.utcnow()
    
    # Save to database
    db.commit()
    db.refresh(db_user)
    
    return db_user


def delete_user(db: Session, user_id: uuid.UUID) -> bool:
    """Delete a user."""
    # Get user
    db_user = get_user_by_id(db, user_id)
    if not db_user:
        return False
    
    # Delete user
    db.delete(db_user)
    db.commit()
    
    return True


def verify_user(db: Session, user_id: uuid.UUID) -> Optional[User]:
    """Mark a user as verified."""
    # Get user
    db_user = get_user_by_id(db, user_id)
    if not db_user:
        return None
    
    # Mark as verified
    db_user.is_verified = True
    db_user.updated_at = datetime.utcnow()
    
    # Save to database
    db.commit()
    db.refresh(db_user)
    
    return db_user


def authenticate_user(
    db: Session, username_or_email: str, password: str
) -> Optional[User]:
    """Authenticate a user with username/email and password."""
    # Try to find user by username
    user = get_user_by_username(db, username_or_email)
    
    # If not found, try by email
    if not user:
        user = get_user_by_email(db, username_or_email)
    
    # If still not found or password is incorrect, return None
    if not user or not verify_password(password, user.hashed_password):
        return None
    
    # Update last login timestamp
    user.last_login_at = datetime.utcnow()
    db.commit()
    
    return user


def set_user_mfa(
    db: Session, user_id: uuid.UUID, totp_secret: str, enabled: bool = True
) -> Optional[User]:
    """Enable or disable MFA for a user."""
    # Get user
    db_user = get_user_by_id(db, user_id)
    if not db_user:
        return None
    
    # Set MFA settings
    db_user.totp_secret = totp_secret if enabled else None
    db_user.totp_enabled = enabled
    db_user.updated_at = datetime.utcnow()
    
    # Save to database
    db.commit()
    db.refresh(db_user)
    
    return db_user


def verify_totp(db: Session, user_id: uuid.UUID, totp_code: str) -> bool:
    """Verify a TOTP code for a user."""
    import pyotp
    
    # Get user
    db_user = get_user_by_id(db, user_id)
    if not db_user or not db_user.totp_enabled or not db_user.totp_secret:
        return False
    
    # Verify TOTP code
    totp = pyotp.TOTP(db_user.totp_secret)
    return totp.verify(totp_code)


def generate_totp_secret() -> Tuple[str, str]:
    """Generate a new TOTP secret and provisioning URI."""
    import pyotp
    
    # Generate secret
    secret = pyotp.random_base32()
    
    # Create TOTP object
    totp = pyotp.TOTP(secret)
    
    # Generate provisioning URI
    uri = totp.provisioning_uri(
        name="user",
        issuer_name="MCP Fintech Platform",
    )
    
    return secret, uri
