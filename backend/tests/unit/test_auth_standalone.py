import pytest
from unittest.mock import patch, MagicMock
import jwt
from datetime import datetime, timedelta
import uuid

# Test constants
SECRET_KEY = "test_secret_key"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
REFRESH_TOKEN_EXPIRE_DAYS = 7


def create_access_token(data: dict, expires_delta: timedelta = None):
    """Create a JWT access token."""
    to_encode = data.copy()
    
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def create_refresh_token(data: dict):
    """Create a JWT refresh token."""
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def verify_token(token: str):
    """Verify a JWT token."""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise Exception("Token has expired")
    except jwt.InvalidTokenError:
        raise Exception("Could not validate credentials")


class MockUser:
    """Mock User class for testing."""
    def __init__(self, id, email, username, is_admin=False):
        self.id = id
        self.email = email
        self.username = username
        self.is_admin = is_admin


def get_user_scopes(user):
    """Get scopes for a user based on their role."""
    scopes = ["user"]
    if user.is_admin:
        scopes.append("admin")
    return scopes


# Tests
def test_create_access_token():
    """Test creating an access token."""
    # Arrange
    user_id = str(uuid.uuid4())
    scopes = ["user"]
    
    # Act
    token = create_access_token(data={"sub": user_id, "scopes": scopes})
    
    # Assert
    assert token is not None
    assert isinstance(token, str)
    
    # Verify token can be decoded
    payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    assert payload["sub"] == user_id
    assert payload["scopes"] == scopes
    assert "exp" in payload


def test_create_refresh_token():
    """Test creating a refresh token."""
    # Arrange
    user_id = str(uuid.uuid4())
    scopes = ["user"]
    
    # Act
    token = create_refresh_token(data={"sub": user_id, "scopes": scopes})
    
    # Assert
    assert token is not None
    assert isinstance(token, str)
    
    # Verify token can be decoded
    payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    assert payload["sub"] == user_id
    assert payload["scopes"] == scopes
    assert "exp" in payload


def test_verify_token_valid():
    """Test verifying a valid token."""
    # Arrange
    user_id = str(uuid.uuid4())
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
    user_id = str(uuid.uuid4())
    scopes = ["user"]
    
    # Create a token that's already expired
    expires_delta = timedelta(minutes=-10)  # Expired 10 minutes ago
    expire = datetime.utcnow() + expires_delta
    
    to_encode = {
        "sub": user_id,
        "scopes": scopes,
        "exp": expire,
    }
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    
    # Act & Assert
    with pytest.raises(Exception) as exc_info:
        verify_token(encoded_jwt)
    
    assert "Token has expired" in str(exc_info.value)


def test_verify_token_invalid():
    """Test verifying an invalid token."""
    # Arrange
    invalid_token = "invalid.token.string"
    
    # Act & Assert
    with pytest.raises(Exception) as exc_info:
        verify_token(invalid_token)
    
    assert "Could not validate credentials" in str(exc_info.value)


def test_get_user_scopes_regular_user():
    """Test getting scopes for a regular user."""
    # Arrange
    user = MockUser(
        id=str(uuid.uuid4()),
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
    user = MockUser(
        id=str(uuid.uuid4()),
        email="admin@example.com",
        username="adminuser",
        is_admin=True,
    )
    
    # Act
    scopes = get_user_scopes(user)
    
    # Assert
    assert "user" in scopes
    assert "admin" in scopes
