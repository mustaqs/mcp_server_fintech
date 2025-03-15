"""
Combined authentication middleware for the MCP Fintech Platform.

This module provides a combined authentication dependency that can handle
both JWT token and API key authentication.
"""
from typing import Optional, List

from fastapi import Depends, HTTPException, Security, status
from fastapi.security import SecurityScopes
from sqlalchemy.orm import Session

from app.core.auth import get_current_user
from app.core.api_auth import get_api_key_user
from app.db.database import get_db
from app.db.models.user import User


async def get_current_user_from_all_auth_methods(
    security_scopes: SecurityScopes,
    db: Session = Depends(get_db),
    jwt_user: Optional[User] = Depends(get_current_user),
    api_key_user: Optional[User] = Depends(get_api_key_user),
) -> User:
    """
    Get the current user from all authentication methods.
    
    This dependency tries to authenticate the user using JWT token first,
    and if that fails, it tries to authenticate using API key.
    
    Args:
        security_scopes: Security scopes
        db: Database session
        jwt_user: User from JWT token
        api_key_user: User from API key
        
    Returns:
        User: Authenticated user
        
    Raises:
        HTTPException: If authentication fails
    """
    # If JWT authentication succeeded, use that user
    if jwt_user:
        # Check if JWT user has required scopes
        for scope in security_scopes.scopes:
            if scope not in getattr(jwt_user, "scopes", []):
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Not enough permissions",
                    headers={"WWW-Authenticate": f'Bearer scope="{security_scopes.scope_str}"'},
                )
        
        return jwt_user
    
    # If API key authentication succeeded, use that user
    if api_key_user:
        # Check if API key user has required scopes
        api_key_scopes = getattr(api_key_user, "api_key_scopes", [])
        
        for scope in security_scopes.scopes:
            # Map JWT scopes to API key scopes
            api_scope = f"api:{scope}" if not scope.startswith("api:") else scope
            
            if api_scope not in api_key_scopes:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="API key does not have required permissions",
                    headers={"WWW-Authenticate": "ApiKey"},
                )
        
        return api_key_user
    
    # If no authentication method succeeded, raise error
    authenticate_value = f'Bearer scope="{security_scopes.scope_str}"' if security_scopes.scopes else "Bearer"
    
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Not authenticated",
        headers={"WWW-Authenticate": authenticate_value},
    )


def get_auth_user(scopes: List[str] = None):
    """
    Get authenticated user with specified scopes.
    
    This is a convenience function to create a dependency with specific scopes.
    
    Args:
        scopes: List of required scopes
        
    Returns:
        Dependency: Dependency that returns the authenticated user
    """
    if scopes is None:
        scopes = []
    
    return Security(get_current_user_from_all_auth_methods, scopes=scopes)
