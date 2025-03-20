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
    """Create a regular test user in the database."""
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


def test_admin_users_list(client, admin_token):
    """Test that admins can list all users."""
    response = client.get(
        "/api/users",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    
    assert response.status_code == 200
    users = response.json()
    assert isinstance(users, list)
    assert len(users) >= 2  # At least test_user and test_admin


def test_regular_user_cannot_list_users(client, user_token):
    """Test that regular users cannot list all users."""
    response = client.get(
        "/api/users",
        headers={"Authorization": f"Bearer {user_token}"},
    )
    
    assert response.status_code == 403
    assert "detail" in response.json()
    assert "Not enough permissions" in response.json()["detail"]


def test_admin_can_promote_user(client, test_db, test_user, admin_token):
    """Test that admins can promote regular users to admin."""
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


def test_regular_user_cannot_promote(client, test_db, test_user, user_token, test_admin):
    """Test that regular users cannot promote other users."""
    response = client.post(
        f"/api/users/{test_admin.id}/promote",
        json={"is_admin": True},
        headers={"Authorization": f"Bearer {user_token}"},
    )
    
    assert response.status_code == 403
    assert "detail" in response.json()
    assert "Not enough permissions" in response.json()["detail"]
    
    # Verify admin status was not changed
    test_db.refresh(test_admin)
    assert test_admin.is_admin is True


def test_admin_can_view_sensitive_endpoints(client, admin_token):
    """Test that admins can access sensitive endpoints."""
    # Test access to system settings
    response = client.get(
        "/api/admin/settings",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    
    # Even if the endpoint doesn't exist, we should get a 404, not a 403
    assert response.status_code != 403
    
    # Test access to user management
    response = client.get(
        "/api/admin/users",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    
    # Even if the endpoint doesn't exist, we should get a 404, not a 403
    assert response.status_code != 403


def test_regular_user_cannot_access_admin_endpoints(client, user_token):
    """Test that regular users cannot access admin endpoints."""
    # Test access to system settings
    response = client.get(
        "/api/admin/settings",
        headers={"Authorization": f"Bearer {user_token}"},
    )
    
    assert response.status_code == 403
    assert "detail" in response.json()
    
    # Test access to user management
    response = client.get(
        "/api/admin/users",
        headers={"Authorization": f"Bearer {user_token}"},
    )
    
    assert response.status_code == 403
    assert "detail" in response.json()


def test_first_user_can_be_admin(client, test_db):
    """Test that the first user to register can choose to be an admin."""
    # Clear all users to simulate first-time setup
    test_db.query(User).delete()
    test_db.commit()
    
    # Register the first user with admin flag
    response = client.post(
        "/api/auth/register",
        json={
            "email": "firstadmin@example.com",
            "username": "firstadmin",
            "password": "adminpass123",
            "first_name": "First",
            "last_name": "Admin",
            "is_admin": True,
        },
    )
    
    assert response.status_code == 201
    data = response.json()
    assert "user" in data
    assert data["user"]["is_admin"] is True
    
    # Verify user was created as admin in the database
    user = test_db.query(User).filter(User.email == "firstadmin@example.com").first()
    assert user is not None
    assert user.is_admin is True


def test_subsequent_users_cannot_self_promote(client, test_db, test_admin):
    """Test that subsequent users cannot self-promote to admin."""
    # Register a second user with admin flag
    response = client.post(
        "/api/auth/register",
        json={
            "email": "wannabeadmin@example.com",
            "username": "wannabeadmin",
            "password": "password123",
            "first_name": "Wannabe",
            "last_name": "Admin",
            "is_admin": True,  # This should be ignored
        },
    )
    
    assert response.status_code == 201
    data = response.json()
    assert "user" in data
    assert data["user"]["is_admin"] is False  # Should not be admin
    
    # Verify user was created as non-admin in the database
    user = test_db.query(User).filter(User.email == "wannabeadmin@example.com").first()
    assert user is not None
    assert user.is_admin is False
