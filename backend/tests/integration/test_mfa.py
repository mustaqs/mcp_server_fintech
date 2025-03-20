import pytest
from fastapi.testclient import TestClient
import uuid
import pyotp
from sqlalchemy.orm import Session
from unittest.mock import patch

from app.main import app
from app.db.models.user import User
from app.core.auth import create_access_token
from app.core.security import get_password_hash


@pytest.fixture
def client():
    """Create a test client for the FastAPI app."""
    return TestClient(app)


@pytest.fixture
def test_db(db_session):
    """Create a test database session."""
    yield db_session
    # Clean up after tests
    db_session.query(User).delete()
    db_session.commit()


@pytest.fixture
def test_user(test_db):
    """Create a test user in the database."""
    user = User(
        id=uuid.uuid4(),
        email="testuser@example.com",
        username="testuser",
        hashed_password=get_password_hash("password123"),
        is_active=True,
        is_verified=True,
    )
    test_db.add(user)
    test_db.commit()
    test_db.refresh(user)
    return user


@pytest.fixture
def mfa_user(test_db):
    """Create a test user with MFA enabled."""
    # Generate a secret key for TOTP
    totp_secret = pyotp.random_base32()
    
    user = User(
        id=uuid.uuid4(),
        email="mfa_user@example.com",
        username="mfa_user",
        hashed_password=get_password_hash("password123"),
        is_active=True,
        is_verified=True,
        mfa_enabled=True,
        mfa_secret=totp_secret,
    )
    test_db.add(user)
    test_db.commit()
    test_db.refresh(user)
    return user


@pytest.fixture
def user_token(test_user):
    """Create an access token for the test user."""
    return create_access_token(data={"sub": str(test_user.id), "scopes": ["user"]})


@pytest.fixture
def mfa_user_token(mfa_user):
    """Create an access token for the MFA user."""
    return create_access_token(data={"sub": str(mfa_user.id), "scopes": ["user"]})


def test_enable_mfa(client, test_user, user_token):
    """Test enabling MFA for a user."""
    response = client.post(
        "/api/auth/mfa/enable",
        headers={"Authorization": f"Bearer {user_token}"},
    )
    
    assert response.status_code == 200
    data = response.json()
    assert "secret" in data
    assert "qr_code" in data
    
    # Verify the secret is a valid TOTP secret
    secret = data["secret"]
    assert len(secret) == 32  # Base32 secret should be 32 characters
    
    # Generate a valid TOTP code using the secret
    totp = pyotp.TOTP(secret)
    valid_code = totp.now()
    
    # Verify the MFA setup with the valid code
    response = client.post(
        "/api/auth/mfa/verify",
        json={"code": valid_code},
        headers={"Authorization": f"Bearer {user_token}"},
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["mfa_enabled"] is True


def test_login_with_mfa(client, test_db, mfa_user):
    """Test the login flow with MFA."""
    # First, attempt to login with correct credentials
    response = client.post(
        "/api/auth/login",
        json={"email": "mfa_user@example.com", "password": "password123"},
    )
    
    assert response.status_code == 200
    data = response.json()
    assert "mfa_required" in data
    assert data["mfa_required"] is True
    assert "mfa_token" in data
    
    mfa_token = data["mfa_token"]
    
    # Generate a valid TOTP code
    totp = pyotp.TOTP(mfa_user.mfa_secret)
    valid_code = totp.now()
    
    # Complete MFA verification
    response = client.post(
        "/api/auth/mfa/validate",
        json={"mfa_token": mfa_token, "code": valid_code},
    )
    
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert "refresh_token" in data
    assert "user" in data
    assert data["user"]["email"] == "mfa_user@example.com"


def test_login_with_invalid_mfa_code(client, mfa_user):
    """Test login with an invalid MFA code."""
    # First, attempt to login with correct credentials
    response = client.post(
        "/api/auth/login",
        json={"email": "mfa_user@example.com", "password": "password123"},
    )
    
    assert response.status_code == 200
    data = response.json()
    assert "mfa_required" in data
    assert data["mfa_required"] is True
    assert "mfa_token" in data
    
    mfa_token = data["mfa_token"]
    
    # Use an invalid TOTP code
    invalid_code = "123456"  # Assuming this is not the current valid code
    
    # Attempt MFA verification with invalid code
    response = client.post(
        "/api/auth/mfa/validate",
        json={"mfa_token": mfa_token, "code": invalid_code},
    )
    
    assert response.status_code == 401
    assert "detail" in response.json()
    assert "Invalid MFA code" in response.json()["detail"]


def test_disable_mfa(client, test_db, mfa_user, mfa_user_token):
    """Test disabling MFA for a user."""
    response = client.post(
        "/api/auth/mfa/disable",
        headers={"Authorization": f"Bearer {mfa_user_token}"},
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["mfa_enabled"] is False
    
    # Verify MFA was disabled in the database
    test_db.refresh(mfa_user)
    assert mfa_user.mfa_enabled is False
    assert mfa_user.mfa_secret is None


def test_mfa_recovery_codes(client, mfa_user, mfa_user_token):
    """Test generating and using MFA recovery codes."""
    # Generate recovery codes
    response = client.post(
        "/api/auth/mfa/recovery-codes",
        headers={"Authorization": f"Bearer {mfa_user_token}"},
    )
    
    assert response.status_code == 200
    data = response.json()
    assert "recovery_codes" in data
    assert len(data["recovery_codes"]) > 0
    
    recovery_code = data["recovery_codes"][0]
    
    # First, attempt to login with correct credentials
    response = client.post(
        "/api/auth/login",
        json={"email": "mfa_user@example.com", "password": "password123"},
    )
    
    assert response.status_code == 200
    data = response.json()
    assert "mfa_required" in data
    assert "mfa_token" in data
    
    mfa_token = data["mfa_token"]
    
    # Use recovery code instead of TOTP
    response = client.post(
        "/api/auth/mfa/recover",
        json={"mfa_token": mfa_token, "recovery_code": recovery_code},
    )
    
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert "refresh_token" in data
    
    # Try to use the same recovery code again (should fail)
    response = client.post(
        "/api/auth/login",
        json={"email": "mfa_user@example.com", "password": "password123"},
    )
    
    mfa_token = response.json()["mfa_token"]
    
    response = client.post(
        "/api/auth/mfa/recover",
        json={"mfa_token": mfa_token, "recovery_code": recovery_code},
    )
    
    assert response.status_code == 401
    assert "detail" in response.json()
    assert "Invalid recovery code" in response.json()["detail"]
