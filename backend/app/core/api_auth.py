"""
API key authentication middleware for the MCP Fintech Platform.
"""
from datetime import datetime
from typing import Optional, List

from fastapi import Depends, HTTPException, Security, status
from fastapi.security import APIKeyHeader
from sqlalchemy.orm import Session

from app.core.auth import verify_password
from app.db.database import get_db
from app.db.models.api_key import APIKey
from app.db.models.user import User

# API key header
API_KEY_HEADER = APIKeyHeader(name="X-API-Key", auto_error=False)


async def get_api_key_user(
    api_key: str = Depends(API_KEY_HEADER),
    db: Session = Depends(get_db),
) -> Optional[User]:
    """
    Get user from API key.
    
    Args:
        api_key: API key from header
        db: Database session
        
    Returns:
        User: User associated with the API key
        
    Raises:
        HTTPException: If API key is invalid or expired
    """
    if not api_key:
        return None
    
    # Extract key prefix (first 8 characters)
    if len(api_key) < 8:
        return None
        
    key_prefix = api_key[:8]
    
    # Find API key in database
    db_api_key = db.query(APIKey).filter(
        APIKey.key_prefix == key_prefix,
        APIKey.is_active == True,
    ).first()
    
    if not db_api_key:
        return None
    
    # Check if API key is expired
    if db_api_key.is_expired:
        return None
    
    # Verify API key
    if not verify_password(api_key, db_api_key.key_hash):
        return None
    
    # Update last used timestamp
    db_api_key.update_last_used()
    db.commit()
    
    # Get user
    user = db.query(User).filter(User.id == db_api_key.user_id).first()
    
    if not user or not user.is_active:
        return None
    
    # Set API key scopes on user object for later use
    user.api_key_scopes = db_api_key.scopes
    
    return user


async def get_current_api_key_user(
    user: Optional[User] = Depends(get_api_key_user),
) -> User:
    """
    Get current user from API key.
    
    Args:
        user: User from API key
        
    Returns:
        User: User associated with the API key
        
    Raises:
        HTTPException: If API key is invalid or expired
    """
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or missing API key",
            headers={"WWW-Authenticate": "ApiKey"},
        )
    
    return user


async def validate_api_key_scope(
    required_scopes: List[str],
    user: User = Depends(get_current_api_key_user),
) -> User:
    """
    Validate API key scopes.
    
    Args:
        required_scopes: List of required scopes
        user: User from API key
        
    Returns:
        User: User associated with the API key
        
    Raises:
        HTTPException: If API key does not have required scopes
    """
    # Get API key scopes
    api_key_scopes = getattr(user, "api_key_scopes", [])
    
    # Check if API key has required scopes
    for scope in required_scopes:
        if scope not in api_key_scopes:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"API key does not have required scope: {scope}",
                headers={"WWW-Authenticate": "ApiKey"},
            )
    
    return user
