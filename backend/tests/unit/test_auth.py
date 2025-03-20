import pytest
from unittest.mock import patch, MagicMock
from datetime import datetime, timedelta
from jose import jwt
from fastapi import HTTPException

from app.core.auth import (
    create_access_token,
    create_refresh_token,
    verify_token,
    get_user_scopes,
)
from app.db.models.user import User


def test_create_access_token():
    """Test creating an access token."""
    # Arrange
    user_id = "test-user-id"
    scopes = ["user"]
    
    # Act
    token = create_access_token(data={"sub": user_id, "scopes": scopes})
    
    # Assert
    assert token is not None
    assert isinstance(token, str)


def test_create_refresh_token():
    """Test creating a refresh token."""
    # Arrange
    user_id = "test-user-id"
    scopes = ["user"]
    
    # Act
    token = create_refresh_token(data={"sub": user_id, "scopes": scopes})
    
    # Assert
    assert token is not None
    assert isinstance(token, str)


def test_verify_token_valid():
    """Test verifying a valid token."""
    # Arrange
    user_id = "test-user-id"
    scopes = ["user"]
    token = create_access_token(data={"sub": user_id, "scopes": scopes})
    
    # Act
    payload = verify_token(token)
    
    # Assert
    assert payload is not None
    assert payload["sub"] == user_id
    assert payload["scopes"] == scopes


def test_verify_token_expired():
    """Test verifying an expired token."""
    # Arrange
    user_id = "test-user-id"
    scopes = ["user"]
    
    # Create a token that's already expired
    expires_delta = timedelta(minutes=-10)  # Expired 10 minutes ago
    expire = datetime.utcnow() + expires_delta
    
    from app.core.config import settings
    
    to_encode = {
        "sub": user_id,
        "scopes": scopes,
        "exp": expire,
    }
    encoded_jwt = jwt.encode(
        to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM
    )
    
    # Act & Assert
    with pytest.raises(HTTPException) as exc_info:
        verify_token(encoded_jwt)
    
    assert exc_info.value.status_code == 401
    assert "Token has expired" in exc_info.value.detail


def test_verify_token_invalid():
    """Test verifying an invalid token."""
    # Arrange
    invalid_token = "invalid.token.string"
    
    # Act & Assert
    with pytest.raises(HTTPException) as exc_info:
        verify_token(invalid_token)
    
    assert exc_info.value.status_code == 401
    assert "Could not validate credentials" in exc_info.value.detail


def test_get_user_scopes_regular_user():
    """Test getting scopes for a regular user."""
    # Arrange
    user = User(
        id="test-user-id",
        email="test@example.com",
        username="testuser",
        is_admin=False,
    )
    
    # Act
    scopes = get_user_scopes(user)
    
    # Assert
    assert "user" in scopes
    assert "admin" not in scopes


def test_get_user_scopes_admin_user():
    """Test getting scopes for an admin user."""
    # Arrange
    user = User(
        id="test-admin-id",
        email="admin@example.com",
        username="adminuser",
        is_admin=True,
    )
    
    # Act
    scopes = get_user_scopes(user)
    
    # Assert
    assert "user" in scopes
    assert "admin" in scopes
