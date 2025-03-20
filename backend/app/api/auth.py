"""
Authentication endpoints for the MCP Fintech Platform.
"""
import secrets
import uuid
from datetime import datetime, timedelta
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Security, status
from fastapi.security import OAuth2PasswordRequestForm, SecurityScopes
from sqlalchemy.orm import Session

from app.core.auth import (
    authenticate_user,
    create_access_token,
    create_refresh_token,
    get_current_active_user,
    get_password_hash,
    get_user_scopes,
    verify_password,
)
from app.db.database import get_db
from app.db.models.api_key import APIKey
from app.db.models.user import User
from app.schemas.auth import (
    APIKeyCreate,
    APIKeyInfo,
    APIKeyResponse,
    Token,
    TokenRefresh,
)
from app.schemas.user import UserCreate, UserResponse
from app.services.user_service import create_user
from app.services.system_service import is_first_user, mark_first_admin_created

router = APIRouter(prefix="/api/auth", tags=["authentication"])


@router.post("/token", response_model=Token)
async def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    """
    OAuth2 compatible token login, get an access token for future requests.
    """
    # Authenticate user
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Check if user is active
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Inactive user",
        )
    
    # Get user scopes
    scopes = get_user_scopes(user)
    
    # Filter requested scopes
    requested_scopes = form_data.scopes if form_data.scopes else []
    authorized_scopes = [scope for scope in requested_scopes if scope in scopes]
    
    # Create access token
    access_token = create_access_token(
        data={"sub": str(user.id), "scopes": authorized_scopes},
    )
    
    # Create refresh token
    refresh_token = create_refresh_token(
        data={"sub": str(user.id), "scopes": authorized_scopes},
    )
    
    # Update last login timestamp
    user.last_login_at = datetime.utcnow()
    db.commit()
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "expires_in": 1800,  # 30 minutes in seconds
    }


@router.post("/refresh", response_model=Token)
async def refresh_token(
    refresh_token_data: TokenRefresh,
    db: Session = Depends(get_db),
):
    """
    Refresh access token using a refresh token.
    """
    from jose import jwt, JWTError
    from app.core.auth import SECRET_KEY, ALGORITHM
    
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        # Decode refresh token
        payload = jwt.decode(
            refresh_token_data.refresh_token, SECRET_KEY, algorithms=[ALGORITHM]
        )
        
        # Check token type
        if payload.get("token_type") != "refresh":
            raise credentials_exception
        
        # Extract user ID and scopes
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
            
        scopes = payload.get("scopes", [])
        
    except JWTError:
        raise credentials_exception
    
    # Get user from database
    user = db.query(User).filter(User.id == user_id).first()
    if user is None or not user.is_active:
        raise credentials_exception
    
    # Create new access token
    access_token = create_access_token(
        data={"sub": user_id, "scopes": scopes},
    )
    
    # Create new refresh token
    new_refresh_token = create_refresh_token(
        data={"sub": user_id, "scopes": scopes},
    )
    
    return {
        "access_token": access_token,
        "refresh_token": new_refresh_token,
        "token_type": "bearer",
        "expires_in": 1800,  # 30 minutes in seconds
    }


@router.post("/api-keys", response_model=APIKeyResponse)
async def create_api_key(
    api_key_data: APIKeyCreate,
    current_user: User = Security(get_current_active_user, scopes=["user"]),
    db: Session = Depends(get_db),
):
    """
    Create a new API key for the current user.
    """
    # Generate API key
    api_key = secrets.token_urlsafe(32)
    key_prefix = api_key[:8]
    
    # Hash API key for storage
    key_hash = get_password_hash(api_key)
    
    # Set expiration date if requested
    expires_at = None
    if api_key_data.expires_in_days:
        expires_at = datetime.utcnow() + timedelta(days=api_key_data.expires_in_days)
    
    # Create API key record
    db_api_key = APIKey(
        id=uuid.uuid4(),
        name=api_key_data.name,
        key_prefix=key_prefix,
        key_hash=key_hash,
        scopes=api_key_data.scopes,
        user_id=current_user.id,
        expires_at=expires_at,
    )
    
    # Save to database
    db.add(db_api_key)
    db.commit()
    db.refresh(db_api_key)
    
    # Return API key (only shown once)
    return {
        "id": db_api_key.id,
        "name": db_api_key.name,
        "key": api_key,  # Full key only returned once
        "scopes": db_api_key.scopes,
        "created_at": db_api_key.created_at.isoformat(),
        "expires_at": db_api_key.expires_at.isoformat() if db_api_key.expires_at else None,
    }


@router.get("/api-keys", response_model=List[APIKeyInfo])
async def list_api_keys(
    current_user: User = Security(get_current_active_user, scopes=["user"]),
    db: Session = Depends(get_db),
):
    """
    List all API keys for the current user.
    """
    api_keys = db.query(APIKey).filter(APIKey.user_id == current_user.id).all()
    
    return [
        {
            "id": key.id,
            "name": key.name,
            "scopes": key.scopes,
            "created_at": key.created_at.isoformat(),
            "expires_at": key.expires_at.isoformat() if key.expires_at else None,
            "last_used_at": key.last_used_at.isoformat() if key.last_used_at else None,
        }
        for key in api_keys
    ]


@router.delete("/api-keys/{api_key_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_api_key(
    api_key_id: uuid.UUID,
    current_user: User = Security(get_current_active_user, scopes=["user"]),
    db: Session = Depends(get_db),
):
    """
    Delete an API key.
    """
    # Find API key
    api_key = db.query(APIKey).filter(
        APIKey.id == api_key_id,
        APIKey.user_id == current_user.id,
    ).first()
    
    # Check if API key exists
    if not api_key:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="API key not found",
        )
    
    # Delete API key
    db.delete(api_key)
    db.commit()
    
    return None


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register_user(
    user_data: UserCreate,
    db: Session = Depends(get_db),
):
    """
    Register a new user account.
    
    This endpoint is public and does not require authentication.
    The first user to register will be created as an admin.
    """
    # Check if this is the first user (first-time setup)
    first_user = is_first_user(db)
    
    # Only allow admin status if this is the first user
    if not first_user:
        user_data.is_admin = False
    
    try:
        # Create the user
        user = create_user(db, user_data)
        
        # If this was the first user and they're an admin, mark first admin as created
        if first_user and user_data.is_admin:
            mark_first_admin_created()
            
        return user
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
