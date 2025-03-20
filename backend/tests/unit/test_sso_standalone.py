import pytest
from unittest.mock import patch, MagicMock
import uuid
from datetime import datetime

# Mock classes and functions for SAML testing
class MockSAMLAuth:
    def __init__(self, is_authenticated=True, nameid=None, attributes=None, errors=None):
        self._is_authenticated = is_authenticated
        self._nameid = nameid or "test@example.com"
        self._attributes = attributes or {
            "firstName": ["Test"],
            "lastName": ["User"],
            "email": ["test@example.com"]
        }
        self._errors = errors or []
        self._last_error_reason = "No error" if not errors else "Authentication failed"
    
    def process_response(self):
        pass
    
    def is_authenticated(self):
        return self._is_authenticated
    
    def get_errors(self):
        return self._errors
    
    def get_last_error_reason(self):
        return self._last_error_reason
    
    def get_nameid(self):
        return self._nameid
    
    def get_attributes(self):
        return self._attributes
    
    def login(self):
        return "https://idp.example.com/sso?SAMLRequest=encoded_request"


class MockUser:
    def __init__(self, id=None, email=None, username=None, is_admin=False):
        self.id = id or str(uuid.uuid4())
        self.email = email or "test@example.com"
        self.username = username or "testuser"
        self.is_admin = is_admin
        self.is_active = True
        self.is_verified = True
        self.sso_provider = None
        self.sso_provider_user_id = None
        self.first_name = None
        self.last_name = None


def prepare_flask_request(request_data):
    """Prepare a Flask-like request from FastAPI request data."""
    scheme = request_data.get("scheme", "http")
    host = request_data.get("host", "localhost")
    port = request_data.get("port", "80")
    
    flask_request = {
        "https": "on" if scheme == "https" else "off",
        "http_host": host,
        "server_port": port,
        "script_name": request_data.get("root_path", ""),
        "get_data": request_data.get("query_params", {}),
        "post_data": request_data.get("form_data", {}),
        "query_string": request_data.get("query_string", ""),
    }
    
    return flask_request


def init_saml_auth(req):
    """Initialize SAML authentication with mock."""
    return MockSAMLAuth()


async def process_saml_response(db, saml_response, request_data):
    """Process SAML response and authenticate user."""
    # Prepare request and initialize auth
    req = prepare_flask_request(request_data)
    auth = init_saml_auth(req)
    
    # Process the SAML response
    auth.process_response()
    
    # Check if authenticated
    if not auth.is_authenticated():
        errors = auth.get_errors()
        error_reason = auth.get_last_error_reason()
        raise Exception(f"SAML authentication failed: {', '.join(errors)}. Reason: {error_reason}")
    
    # Get user information from SAML response
    nameid = auth.get_nameid()
    if not nameid:
        raise Exception("SAML response does not contain NameID")
    
    # Get attributes
    attributes = auth.get_attributes()
    
    # Check if user exists in database
    user = None
    for u in db:
        if u.email == nameid:
            user = u
            break
    
    # Create new user if not exists
    if not user:
        user = MockUser(
            email=nameid,
            username=nameid.split('@')[0]
        )
        db.append(user)
    
    # Update user with SAML attributes
    user.is_active = True
    user.is_verified = True
    user.sso_provider = "saml"
    user.sso_provider_user_id = nameid
    
    if "firstName" in attributes and attributes["firstName"]:
        user.first_name = attributes["firstName"][0]
    
    if "lastName" in attributes and attributes["lastName"]:
        user.last_name = attributes["lastName"][0]
    
    # Create tokens
    access_token = f"mock_access_token_for_{nameid}"
    refresh_token = f"mock_refresh_token_for_{nameid}"
    
    return access_token, refresh_token


# Tests
def test_prepare_flask_request():
    """Test preparing a Flask-like request from FastAPI request data."""
    # Arrange
    request_data = {
        "scheme": "https",
        "host": "example.com",
        "root_path": "/api",
        "port": "443",
        "query_params": {"param1": "value1"},
        "form_data": {"SAMLResponse": "mock_response"},
        "query_string": "param1=value1",
    }
    
    # Act
    flask_request = prepare_flask_request(request_data)
    
    # Assert
    assert flask_request["https"] == "on"
    assert flask_request["http_host"] == "example.com"
    assert flask_request["script_name"] == "/api"
    assert flask_request["server_port"] == "443"
    assert flask_request["get_data"] == {"param1": "value1"}
    assert flask_request["post_data"] == {"SAMLResponse": "mock_response"}
    assert flask_request["query_string"] == "param1=value1"


def test_init_saml_auth():
    """Test initializing SAML authentication."""
    # Arrange
    req = {
        "https": "on",
        "http_host": "example.com",
        "script_name": "/api",
        "server_port": "443",
        "get_data": {},
        "post_data": {},
    }
    
    # Act
    auth = init_saml_auth(req)
    
    # Assert
    assert isinstance(auth, MockSAMLAuth)
    assert auth.is_authenticated() is True


@pytest.mark.asyncio
async def test_process_saml_response_success():
    """Test successful SAML response processing."""
    # Arrange
    mock_db = []  # Mock database as a list
    mock_saml_response = "mock_saml_response"
    mock_request_data = {
        "scheme": "https",
        "host": "example.com",
        "form_data": {"SAMLResponse": mock_saml_response},
    }
    
    # Act
    access_token, refresh_token = await process_saml_response(
        mock_db, mock_saml_response, mock_request_data
    )
    
    # Assert
    assert access_token == "mock_access_token_for_test@example.com"
    assert refresh_token == "mock_refresh_token_for_test@example.com"
    
    # Verify user was created
    assert len(mock_db) == 1
    assert mock_db[0].email == "test@example.com"
    assert mock_db[0].is_active is True
    assert mock_db[0].is_verified is True
    assert mock_db[0].sso_provider == "saml"
    assert mock_db[0].sso_provider_user_id == "test@example.com"


@pytest.mark.asyncio
async def test_process_saml_response_not_authenticated():
    """Test SAML response processing when user is not authenticated."""
    # Arrange
    mock_db = []  # Mock database as a list
    mock_saml_response = "mock_saml_response"
    mock_request_data = {
        "scheme": "https",
        "host": "example.com",
        "form_data": {"SAMLResponse": mock_saml_response},
    }
    
    # Mock SAML auth to return not authenticated
    with patch("test_sso_standalone.init_saml_auth") as mock_init_auth:
        mock_auth = MockSAMLAuth(
            is_authenticated=False,
            errors=["Authentication failed"],
        )
        mock_init_auth.return_value = mock_auth
        
        # Act & Assert
        with pytest.raises(Exception) as exc_info:
            await process_saml_response(mock_db, mock_saml_response, mock_request_data)
        
        assert "SAML authentication failed" in str(exc_info.value)


@pytest.mark.asyncio
async def test_process_saml_response_existing_user():
    """Test SAML response processing for an existing user."""
    # Arrange
    existing_user = MockUser(
        email="test@example.com",
        username="existing_user",
    )
    mock_db = [existing_user]  # Mock database with existing user
    
    mock_saml_response = "mock_saml_response"
    mock_request_data = {
        "scheme": "https",
        "host": "example.com",
        "form_data": {"SAMLResponse": mock_saml_response},
    }
    
    # Act
    access_token, refresh_token = await process_saml_response(
        mock_db, mock_saml_response, mock_request_data
    )
    
    # Assert
    assert access_token == "mock_access_token_for_test@example.com"
    assert refresh_token == "mock_refresh_token_for_test@example.com"
    
    # Verify user was updated
    assert len(mock_db) == 1  # No new user created
    assert mock_db[0].email == "test@example.com"
    assert mock_db[0].is_active is True
    assert mock_db[0].is_verified is True
    assert mock_db[0].sso_provider == "saml"
    assert mock_db[0].sso_provider_user_id == "test@example.com"
    assert mock_db[0].first_name == "Test"
    assert mock_db[0].last_name == "User"
