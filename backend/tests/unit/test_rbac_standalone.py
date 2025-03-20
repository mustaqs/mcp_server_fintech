import pytest
from unittest.mock import patch, MagicMock
import uuid

# Mock classes for RBAC testing
class MockUser:
    def __init__(self, id=None, email=None, username=None, is_admin=False):
        self.id = id or str(uuid.uuid4())
        self.email = email or f"{username}@example.com"
        self.username = username or "user"
        self.is_admin = is_admin
        self.is_active = True
        self.is_verified = True


class MockDB:
    def __init__(self, users=None):
        self.users = users or []
        self.first_admin_created = False
    
    def add_user(self, user):
        self.users.append(user)
        return user
    
    def get_user_by_id(self, user_id):
        for user in self.users:
            if user.id == user_id:
                return user
        return None
    
    def get_user_by_email(self, email):
        for user in self.users:
            if user.email == email:
                return user
        return None
    
    def set_first_admin_created(self, value):
        self.first_admin_created = value
    
    def is_first_admin_created(self):
        return self.first_admin_created


# Mock functions for RBAC
def check_admin_access(user):
    """Check if a user has admin access."""
    if not user:
        return False
    return user.is_admin


def promote_user(db, user_id, current_user):
    """Promote a user to admin."""
    # Check if current user is admin
    if not check_admin_access(current_user):
        raise Exception("Only admins can promote users")
    
    # Get the user to promote
    user = db.get_user_by_id(user_id)
    if not user:
        raise Exception("User not found")
    
    # Prevent self-promotion
    if user.id == current_user.id:
        raise Exception("Users cannot promote themselves")
    
    # Promote the user
    user.is_admin = True
    return user


def handle_first_admin_setup(db, user, is_admin_requested):
    """Handle first-time admin setup."""
    # Check if first admin has been created
    if not db.is_first_admin_created():
        # If user requests admin role and no admin exists yet
        if is_admin_requested:
            user.is_admin = True
            db.set_first_admin_created(True)
    return user


# Tests
def test_check_admin_access_admin_user():
    """Test checking admin access for an admin user."""
    # Arrange
    admin_user = MockUser(username="admin", is_admin=True)
    
    # Act
    has_access = check_admin_access(admin_user)
    
    # Assert
    assert has_access is True


def test_check_admin_access_regular_user():
    """Test checking admin access for a regular user."""
    # Arrange
    regular_user = MockUser(username="regular")
    
    # Act
    has_access = check_admin_access(regular_user)
    
    # Assert
    assert has_access is False


def test_check_admin_access_no_user():
    """Test checking admin access with no user."""
    # Act
    has_access = check_admin_access(None)
    
    # Assert
    assert has_access is False


def test_promote_user_success():
    """Test successfully promoting a user to admin."""
    # Arrange
    admin_user = MockUser(username="admin", is_admin=True)
    regular_user = MockUser(username="regular")
    
    db = MockDB(users=[admin_user, regular_user])
    
    # Act
    promoted_user = promote_user(db, regular_user.id, admin_user)
    
    # Assert
    assert promoted_user.is_admin is True
    assert promoted_user.id == regular_user.id


def test_promote_user_not_admin():
    """Test promoting a user when current user is not admin."""
    # Arrange
    regular_user1 = MockUser(username="regular1")
    regular_user2 = MockUser(username="regular2")
    
    db = MockDB(users=[regular_user1, regular_user2])
    
    # Act & Assert
    with pytest.raises(Exception) as exc_info:
        promote_user(db, regular_user2.id, regular_user1)
    
    assert "Only admins can promote users" in str(exc_info.value)
    assert regular_user2.is_admin is False


def test_promote_user_self_promotion():
    """Test user trying to promote themselves."""
    # Arrange
    admin_user = MockUser(username="admin", is_admin=True)
    
    db = MockDB(users=[admin_user])
    
    # Act & Assert
    with pytest.raises(Exception) as exc_info:
        promote_user(db, admin_user.id, admin_user)
    
    assert "Users cannot promote themselves" in str(exc_info.value)


def test_promote_user_not_found():
    """Test promoting a user that doesn't exist."""
    # Arrange
    admin_user = MockUser(username="admin", is_admin=True)
    
    db = MockDB(users=[admin_user])
    
    # Act & Assert
    with pytest.raises(Exception) as exc_info:
        promote_user(db, "non-existent-id", admin_user)
    
    assert "User not found" in str(exc_info.value)


def test_first_admin_setup_first_user_requests_admin():
    """Test first-time admin setup when first user requests admin role."""
    # Arrange
    user = MockUser(username="first_user")
    db = MockDB()  # Empty DB, no admins yet
    
    # Act
    result_user = handle_first_admin_setup(db, user, True)
    
    # Assert
    assert result_user.is_admin is True
    assert db.is_first_admin_created() is True


def test_first_admin_setup_first_user_no_admin_request():
    """Test first-time admin setup when first user doesn't request admin role."""
    # Arrange
    user = MockUser(username="first_user")
    db = MockDB()  # Empty DB, no admins yet
    
    # Act
    result_user = handle_first_admin_setup(db, user, False)
    
    # Assert
    assert result_user.is_admin is False
    assert db.is_first_admin_created() is False


def test_first_admin_setup_admin_already_exists():
    """Test first-time admin setup when admin already exists."""
    # Arrange
    user = MockUser(username="second_user")
    db = MockDB()
    db.set_first_admin_created(True)  # Admin already exists
    
    # Act
    result_user = handle_first_admin_setup(db, user, True)
    
    # Assert
    assert result_user.is_admin is False  # Should not be promoted
    assert db.is_first_admin_created() is True
