import pytest
from unittest.mock import patch, MagicMock
import uuid
import pyotp
import base64
import hashlib
import time
import random
import string

# Mock classes for MFA testing
class MockUser:
    def __init__(self, id=None, email=None, username=None, is_admin=False):
        self.id = id or str(uuid.uuid4())
        self.email = email or f"{username}@example.com"
        self.username = username or "user"
        self.is_admin = is_admin
        self.is_active = True
        self.is_verified = True
        self.mfa_enabled = False
        self.mfa_secret = None
        self.recovery_codes = []


class MockDB:
    def __init__(self, users=None):
        self.users = users or []
    
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


# MFA functions
def generate_mfa_secret():
    """Generate a random MFA secret."""
    return pyotp.random_base32()


def generate_mfa_qr_code_uri(secret, user_email, issuer_name="MCP Fintech"):
    """Generate a QR code URI for MFA setup."""
    totp = pyotp.TOTP(secret)
    return totp.provisioning_uri(name=user_email, issuer_name=issuer_name)


def verify_mfa_code(secret, code):
    """Verify an MFA code against a secret."""
    totp = pyotp.TOTP(secret)
    return totp.verify(code)


def generate_recovery_codes(count=10, length=10):
    """Generate recovery codes for MFA backup."""
    codes = []
    for _ in range(count):
        code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=length))
        code_hash = hashlib.sha256(code.encode()).hexdigest()
        codes.append({"code": code, "hash": code_hash, "used": False})
    return codes


def enable_mfa(user, code):
    """Enable MFA for a user."""
    if user.mfa_enabled:
        raise Exception("MFA is already enabled for this user")
    
    # Verify the code
    if not verify_mfa_code(user.mfa_secret, code):
        raise Exception("Invalid MFA code")
    
    # Generate recovery codes
    user.recovery_codes = generate_recovery_codes()
    
    # Enable MFA
    user.mfa_enabled = True
    
    return user


def disable_mfa(user, code=None, recovery_code=None):
    """Disable MFA for a user."""
    if not user.mfa_enabled:
        raise Exception("MFA is not enabled for this user")
    
    # Verify either the MFA code or recovery code
    is_verified = False
    
    if code:
        is_verified = verify_mfa_code(user.mfa_secret, code)
    
    if not is_verified and recovery_code:
        # Check recovery codes
        for rc in user.recovery_codes:
            if not rc["used"]:
                rc_hash = hashlib.sha256(recovery_code.encode()).hexdigest()
                if rc["hash"] == rc_hash:
                    rc["used"] = True
                    is_verified = True
                    break
    
    if not is_verified:
        raise Exception("Invalid MFA code or recovery code")
    
    # Disable MFA
    user.mfa_enabled = False
    user.mfa_secret = None
    user.recovery_codes = []
    
    return user


def verify_login_mfa(user, code=None, recovery_code=None):
    """Verify MFA during login."""
    if not user.mfa_enabled:
        return True  # MFA not required
    
    # Verify either the MFA code or recovery code
    is_verified = False
    
    if code:
        is_verified = verify_mfa_code(user.mfa_secret, code)
    
    if not is_verified and recovery_code:
        # Check recovery codes
        for rc in user.recovery_codes:
            if not rc["used"]:
                rc_hash = hashlib.sha256(recovery_code.encode()).hexdigest()
                if rc["hash"] == rc_hash:
                    rc["used"] = True
                    is_verified = True
                    break
    
    return is_verified


def setup_mfa(user):
    """Set up MFA for a user (initial step)."""
    # Generate a new secret
    secret = generate_mfa_secret()
    user.mfa_secret = secret
    
    # Generate QR code URI
    qr_uri = generate_mfa_qr_code_uri(secret, user.email)
    
    return {
        "secret": secret,
        "qr_uri": qr_uri,
    }


# Tests
def test_generate_mfa_secret():
    """Test generating an MFA secret."""
    # Act
    secret = generate_mfa_secret()
    
    # Assert
    assert secret is not None
    assert len(secret) > 0
    # Validate it's a valid base32 string
    try:
        base64.b32decode(secret, casefold=True)
        is_valid = True
    except Exception:
        is_valid = False
    
    assert is_valid is True


def test_generate_mfa_qr_code_uri():
    """Test generating a QR code URI for MFA setup."""
    # Arrange
    secret = generate_mfa_secret()
    email = "test@example.com"
    issuer = "Test Issuer"
    
    # Act
    uri = generate_mfa_qr_code_uri(secret, email, issuer)
    
    # Assert
    assert uri is not None
    assert secret in uri
    # Email is URL encoded in the URI (@ becomes %40)
    assert "test%40example.com" in uri
    # Check for issuer in the URL parameters (not in the path which might be encoded)
    assert "issuer=Test%20Issuer" in uri
    assert uri.startswith("otpauth://totp/")


def test_verify_mfa_code_valid():
    """Test verifying a valid MFA code."""
    # Arrange
    secret = generate_mfa_secret()
    totp = pyotp.TOTP(secret)
    code = totp.now()
    
    # Act
    is_valid = verify_mfa_code(secret, code)
    
    # Assert
    assert is_valid is True


def test_verify_mfa_code_invalid():
    """Test verifying an invalid MFA code."""
    # Arrange
    secret = generate_mfa_secret()
    invalid_code = "123456"  # Assuming this is not the current code
    
    # Act
    is_valid = verify_mfa_code(secret, invalid_code)
    
    # Assert
    assert is_valid is False


def test_generate_recovery_codes():
    """Test generating recovery codes."""
    # Arrange
    count = 5
    length = 8
    
    # Act
    codes = generate_recovery_codes(count, length)
    
    # Assert
    assert len(codes) == count
    for code_data in codes:
        assert len(code_data["code"]) == length
        assert "hash" in code_data
        assert code_data["used"] is False


def test_setup_mfa():
    """Test setting up MFA for a user."""
    # Arrange
    user = MockUser(username="test_user")
    
    # Act
    result = setup_mfa(user)
    
    # Assert
    assert "secret" in result
    assert "qr_uri" in result
    assert user.mfa_secret == result["secret"]
    assert user.mfa_enabled is False  # Not enabled yet


def test_enable_mfa_success():
    """Test successfully enabling MFA."""
    # Arrange
    user = MockUser(username="test_user")
    setup_result = setup_mfa(user)
    
    # Generate a valid code
    totp = pyotp.TOTP(user.mfa_secret)
    valid_code = totp.now()
    
    # Act
    updated_user = enable_mfa(user, valid_code)
    
    # Assert
    assert updated_user.mfa_enabled is True
    assert len(updated_user.recovery_codes) > 0
    assert all(not rc["used"] for rc in updated_user.recovery_codes)


def test_enable_mfa_invalid_code():
    """Test enabling MFA with an invalid code."""
    # Arrange
    user = MockUser(username="test_user")
    setup_result = setup_mfa(user)
    
    # Use an invalid code
    invalid_code = "000000"
    
    # Act & Assert
    with pytest.raises(Exception) as exc_info:
        enable_mfa(user, invalid_code)
    
    assert "Invalid MFA code" in str(exc_info.value)
    assert user.mfa_enabled is False


def test_enable_mfa_already_enabled():
    """Test enabling MFA when it's already enabled."""
    # Arrange
    user = MockUser(username="test_user")
    user.mfa_enabled = True
    
    # Act & Assert
    with pytest.raises(Exception) as exc_info:
        enable_mfa(user, "123456")
    
    assert "MFA is already enabled" in str(exc_info.value)


def test_disable_mfa_with_code():
    """Test disabling MFA with a valid code."""
    # Arrange
    user = MockUser(username="test_user")
    setup_result = setup_mfa(user)
    
    # Enable MFA first
    totp = pyotp.TOTP(user.mfa_secret)
    valid_code = totp.now()
    user = enable_mfa(user, valid_code)
    
    # Get a new valid code
    valid_code = totp.now()
    
    # Act
    updated_user = disable_mfa(user, code=valid_code)
    
    # Assert
    assert updated_user.mfa_enabled is False
    assert updated_user.mfa_secret is None
    assert updated_user.recovery_codes == []


def test_disable_mfa_with_recovery_code():
    """Test disabling MFA with a recovery code."""
    # Arrange
    user = MockUser(username="test_user")
    setup_result = setup_mfa(user)
    
    # Enable MFA first
    totp = pyotp.TOTP(user.mfa_secret)
    valid_code = totp.now()
    user = enable_mfa(user, valid_code)
    
    # Get a recovery code
    recovery_code = user.recovery_codes[0]["code"]
    
    # Act
    updated_user = disable_mfa(user, recovery_code=recovery_code)
    
    # Assert
    assert updated_user.mfa_enabled is False
    assert updated_user.mfa_secret is None
    assert updated_user.recovery_codes == []


def test_disable_mfa_invalid_codes():
    """Test disabling MFA with invalid codes."""
    # Arrange
    user = MockUser(username="test_user")
    setup_result = setup_mfa(user)
    
    # Enable MFA first
    totp = pyotp.TOTP(user.mfa_secret)
    valid_code = totp.now()
    user = enable_mfa(user, valid_code)
    
    # Use invalid codes
    invalid_code = "000000"
    invalid_recovery = "INVALID123"
    
    # Act & Assert
    with pytest.raises(Exception) as exc_info:
        disable_mfa(user, code=invalid_code, recovery_code=invalid_recovery)
    
    assert "Invalid MFA code or recovery code" in str(exc_info.value)
    assert user.mfa_enabled is True  # Still enabled


def test_disable_mfa_not_enabled():
    """Test disabling MFA when it's not enabled."""
    # Arrange
    user = MockUser(username="test_user")
    
    # Act & Assert
    with pytest.raises(Exception) as exc_info:
        disable_mfa(user, code="123456")
    
    assert "MFA is not enabled" in str(exc_info.value)


def test_verify_login_mfa_not_enabled():
    """Test verifying login MFA when MFA is not enabled."""
    # Arrange
    user = MockUser(username="test_user")
    
    # Act
    is_verified = verify_login_mfa(user)
    
    # Assert
    assert is_verified is True  # Always true when MFA not enabled


def test_verify_login_mfa_with_valid_code():
    """Test verifying login MFA with a valid code."""
    # Arrange
    user = MockUser(username="test_user")
    setup_result = setup_mfa(user)
    
    # Enable MFA
    totp = pyotp.TOTP(user.mfa_secret)
    valid_code = totp.now()
    user = enable_mfa(user, valid_code)
    
    # Get a new valid code
    valid_code = totp.now()
    
    # Act
    is_verified = verify_login_mfa(user, code=valid_code)
    
    # Assert
    assert is_verified is True


def test_verify_login_mfa_with_recovery_code():
    """Test verifying login MFA with a recovery code."""
    # Arrange
    user = MockUser(username="test_user")
    setup_result = setup_mfa(user)
    
    # Enable MFA
    totp = pyotp.TOTP(user.mfa_secret)
    valid_code = totp.now()
    user = enable_mfa(user, valid_code)
    
    # Get a recovery code
    recovery_code = user.recovery_codes[0]["code"]
    
    # Act
    is_verified = verify_login_mfa(user, recovery_code=recovery_code)
    
    # Assert
    assert is_verified is True
    assert user.recovery_codes[0]["used"] is True  # Recovery code should be marked as used


def test_verify_login_mfa_invalid_codes():
    """Test verifying login MFA with invalid codes."""
    # Arrange
    user = MockUser(username="test_user")
    setup_result = setup_mfa(user)
    
    # Enable MFA
    totp = pyotp.TOTP(user.mfa_secret)
    valid_code = totp.now()
    user = enable_mfa(user, valid_code)
    
    # Use invalid codes
    invalid_code = "000000"
    invalid_recovery = "INVALID123"
    
    # Act
    is_verified = verify_login_mfa(user, code=invalid_code, recovery_code=invalid_recovery)
    
    # Assert
    assert is_verified is False
