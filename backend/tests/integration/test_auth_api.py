import pytest
from fastapi.testclient import TestClient
import uuid
from sqlalchemy.orm import Session

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
def test_admin(test_db):
    """Create a test admin user in the database."""
    admin = User(
        id=uuid.uuid4(),
        email="admin@example.com",
        username="admin",
        hashed_password=get_password_hash("adminpass"),
        is_active=True,
        is_verified=True,
        is_admin=True,
    )
    test_db.add(admin)
    test_db.commit()
    test_db.refresh(admin)
    return admin


@pytest.fixture
def user_token(test_user):
    """Create an access token for the test user."""
    return create_access_token(data={"sub": str(test_user.id), "scopes": ["user"]})


@pytest.fixture
def admin_token(test_admin):
    """Create an access token for the test admin."""
    return create_access_token(data={"sub": str(test_admin.id), "scopes": ["user", "admin"]})


def test_login_success(client, test_user):
    """Test successful login."""
    response = client.post(
        "/api/auth/login",
        json={"email": "testuser@example.com", "password": "password123"},
    )
    
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert "refresh_token" in data
    assert "user" in data
    assert data["user"]["email"] == "testuser@example.com"


def test_login_invalid_credentials(client, test_user):
    """Test login with invalid credentials."""
    response = client.post(
        "/api/auth/login",
        json={"email": "testuser@example.com", "password": "wrongpassword"},
    )
    
    assert response.status_code == 401
    assert "detail" in response.json()


def test_register_success(client, test_db):
    """Test successful user registration."""
    response = client.post(
        "/api/auth/register",
        json={
            "email": "newuser@example.com",
            "username": "newuser",
            "password": "newpassword123",
            "first_name": "New",
            "last_name": "User",
        },
    )
    
    assert response.status_code == 201
    data = response.json()
    assert "access_token" in data
    assert "refresh_token" in data
    assert "user" in data
    assert data["user"]["email"] == "newuser@example.com"
    
    # Verify user was created in the database
    user = test_db.query(User).filter(User.email == "newuser@example.com").first()
    assert user is not None
    assert user.username == "newuser"
    assert user.is_active is True
    assert user.is_verified is False  # Email verification required


def test_register_duplicate_email(client, test_user):
    """Test registration with an existing email."""
    response = client.post(
        "/api/auth/register",
        json={
            "email": "testuser@example.com",  # Same as test_user
            "username": "differentuser",
            "password": "password123",
            "first_name": "Different",
            "last_name": "User",
        },
    )
    
    assert response.status_code == 400
    assert "detail" in response.json()


def test_refresh_token(client, test_user):
    """Test refreshing access token."""
    # First login to get a refresh token
    login_response = client.post(
        "/api/auth/login",
        json={"email": "testuser@example.com", "password": "password123"},
    )
    
    refresh_token = login_response.json()["refresh_token"]
    
    # Now use the refresh token to get a new access token
    response = client.post(
        "/api/auth/refresh",
        json={"refresh_token": refresh_token},
    )
    
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert "refresh_token" in data


def test_get_current_user(client, user_token):
    """Test getting the current user profile."""
    response = client.get(
        "/api/users/me",
        headers={"Authorization": f"Bearer {user_token}"},
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "testuser@example.com"
    assert data["username"] == "testuser"


def test_unauthorized_access(client):
    """Test accessing a protected endpoint without authentication."""
    response = client.get("/api/users/me")
    
    assert response.status_code == 401
    assert "detail" in response.json()


def test_admin_access(client, admin_token):
    """Test accessing an admin-only endpoint with admin credentials."""
    response = client.get(
        "/api/users",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    
    assert response.status_code == 200
    users = response.json()
    assert isinstance(users, list)
    assert len(users) >= 2  # At least test_user and test_admin


def test_non_admin_access(client, user_token):
    """Test accessing an admin-only endpoint with non-admin credentials."""
    response = client.get(
        "/api/users",
        headers={"Authorization": f"Bearer {user_token}"},
    )
    
    assert response.status_code == 403
    assert "detail" in response.json()


def test_promote_user(client, test_db, test_user, admin_token):
    """Test promoting a user to admin."""
    response = client.post(
        f"/api/users/{test_user.id}/promote",
        json={"is_admin": True},
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["is_admin"] is True
    
    # Verify user was updated in the database
    test_db.refresh(test_user)
    assert test_user.is_admin is True


def test_verify_email(client, test_db, test_user):
    """Test email verification."""
    # Create a verification token
    from app.core.auth import create_email_verification_token
    token = create_email_verification_token(test_user.email)
    
    # Simulate a user that needs verification
    test_user.is_verified = False
    test_db.commit()
    
    response = client.get(f"/api/auth/verify-email/{token}")
    
    assert response.status_code == 200
    assert "message" in response.json()
    
    # Verify user status was updated
    test_db.refresh(test_user)
    assert test_user.is_verified is True


def test_forgot_password(client, test_user):
    """Test forgot password flow."""
    response = client.post(
        "/api/auth/forgot-password",
        json={"email": "testuser@example.com"},
    )
    
    assert response.status_code == 200
    assert "message" in response.json()


def test_reset_password(client, test_db, test_user):
    """Test password reset."""
    # Create a password reset token
    from app.core.auth import create_password_reset_token
    token = create_password_reset_token(test_user.email)
    
    # Old password hash
    old_password_hash = test_user.hashed_password
    
    response = client.post(
        "/api/auth/reset-password",
        json={"token": token, "new_password": "newpassword456"},
    )
    
    assert response.status_code == 200
    assert "message" in response.json()
    
    # Verify password was updated
    test_db.refresh(test_user)
    assert test_user.hashed_password != old_password_hash
    
    # Verify can login with new password
    login_response = client.post(
        "/api/auth/login",
        json={"email": "testuser@example.com", "password": "newpassword456"},
    )
    
    assert login_response.status_code == 200
