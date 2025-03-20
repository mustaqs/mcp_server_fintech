import pytest
from unittest.mock import patch, MagicMock
import uuid
from datetime import datetime
from fastapi import HTTPException

from app.core.sso import (
    prepare_flask_request,
    init_saml_auth,
    process_saml_response,
)
from app.db.models.user import User


@pytest.fixture
def mock_saml_settings():
    """Fixture for mocked SAML settings."""
    with patch("app.core.sso.SAML_SETTINGS") as mock_settings:
        mock_settings.return_value = {
            "strict": True,
            "debug": True,
            "sp": {
                "entityId": "https://test-sp.example.com/metadata",
                "assertionConsumerService": {
                    "url": "https://test-sp.example.com/api/auth/saml/acs",
                    "binding": "urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST",
                },
            },
            "idp": {
                "entityId": "https://test-idp.example.com/metadata",
                "singleSignOnService": {
                    "url": "https://test-idp.example.com/sso",
                    "binding": "urn:oasis:names:tc:SAML:2.0:bindings:HTTP-Redirect",
                },
                "x509cert": "MOCK_CERT",
            },
        }
        yield mock_settings


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


@patch("app.core.sso.OneLogin_Saml2_Auth")
def test_init_saml_auth(mock_auth_class, mock_saml_settings):
    """Test initializing SAML authentication."""
    # Arrange
    mock_auth = MagicMock()
    mock_auth_class.return_value = mock_auth
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
    mock_auth_class.assert_called_once()
    assert auth == mock_auth


@patch("app.core.sso.init_saml_auth")
@patch("app.core.sso.prepare_flask_request")
@patch("app.core.sso.create_access_token")
@patch("app.core.sso.create_refresh_token")
@patch("app.core.sso.get_user_scopes")
async def test_process_saml_response_success(
    mock_get_user_scopes,
    mock_create_refresh_token,
    mock_create_access_token,
    mock_prepare_flask_request,
    mock_init_saml_auth,
):
    """Test successful SAML response processing."""
    # Arrange
    mock_db = MagicMock()
    mock_saml_response = "mock_saml_response"
    mock_request_data = {
        "scheme": "https",
        "host": "example.com",
        "form_data": {"SAMLResponse": mock_saml_response},
    }
    
    # Mock prepare_flask_request
    mock_flask_req = {"post_data": {"SAMLResponse": mock_saml_response}}
    mock_prepare_flask_request.return_value = mock_flask_req
    
    # Mock SAML auth
    mock_auth = MagicMock()
    mock_auth.is_authenticated.return_value = True
    mock_auth.get_attributes.return_value = {
        "firstName": ["John"],
        "lastName": ["Doe"],
    }
    mock_auth.get_nameid.return_value = "john.doe@example.com"
    mock_init_saml_auth.return_value = mock_auth
    
    # Mock user
    mock_user = MagicMock(spec=User)
    mock_user.id = uuid.uuid4()
    mock_user.email = "john.doe@example.com"
    mock_db.query.return_value.filter.return_value.first.return_value = mock_user
    
    # Mock tokens
    mock_get_user_scopes.return_value = ["user"]
    mock_create_access_token.return_value = "mock_access_token"
    mock_create_refresh_token.return_value = "mock_refresh_token"
    
    # Act
    access_token, refresh_token = await process_saml_response(
        mock_db, mock_saml_response, mock_request_data
    )
    
    # Assert
    mock_prepare_flask_request.assert_called_once_with(mock_request_data)
    mock_init_saml_auth.assert_called_once_with(mock_flask_req)
    mock_auth.process_response.assert_called_once()
    mock_auth.is_authenticated.assert_called_once()
    mock_auth.get_attributes.assert_called_once()
    mock_auth.get_nameid.assert_called_once()
    
    # Verify user was updated
    assert mock_user.is_active is True
    assert mock_user.is_verified is True
    assert mock_user.sso_provider == "saml"
    assert mock_user.sso_provider_user_id == "john.doe@example.com"
    
    # Verify tokens
    assert access_token == "mock_access_token"
    assert refresh_token == "mock_refresh_token"


@patch("app.core.sso.init_saml_auth")
@patch("app.core.sso.prepare_flask_request")
async def test_process_saml_response_not_authenticated(
    mock_prepare_flask_request, mock_init_saml_auth
):
    """Test SAML response processing when user is not authenticated."""
    # Arrange
    mock_db = MagicMock()
    mock_saml_response = "mock_saml_response"
    mock_request_data = {
        "scheme": "https",
        "host": "example.com",
        "form_data": {"SAMLResponse": mock_saml_response},
    }
    
    # Mock prepare_flask_request
    mock_flask_req = {"post_data": {"SAMLResponse": mock_saml_response}}
    mock_prepare_flask_request.return_value = mock_flask_req
    
    # Mock SAML auth
    mock_auth = MagicMock()
    mock_auth.is_authenticated.return_value = False
    mock_auth.get_errors.return_value = ["Authentication failed"]
    mock_auth.get_last_error_reason.return_value = "Invalid credentials"
    mock_init_saml_auth.return_value = mock_auth
    
    # Act & Assert
    with pytest.raises(HTTPException) as exc_info:
        await process_saml_response(mock_db, mock_saml_response, mock_request_data)
    
    assert exc_info.value.status_code == 401
    assert "SAML authentication failed" in exc_info.value.detail
    
    mock_prepare_flask_request.assert_called_once_with(mock_request_data)
    mock_init_saml_auth.assert_called_once_with(mock_flask_req)
    mock_auth.process_response.assert_called_once()
    mock_auth.is_authenticated.assert_called_once()
    mock_auth.get_errors.assert_called_once()
    mock_auth.get_last_error_reason.assert_called_once()


@patch("app.core.sso.init_saml_auth")
@patch("app.core.sso.prepare_flask_request")
@patch("app.core.sso.create_access_token")
@patch("app.core.sso.create_refresh_token")
@patch("app.core.sso.get_user_scopes")
async def test_process_saml_response_new_user(
    mock_get_user_scopes,
    mock_create_refresh_token,
    mock_create_access_token,
    mock_prepare_flask_request,
    mock_init_saml_auth,
):
    """Test SAML response processing for a new user."""
    # Arrange
    mock_db = MagicMock()
    mock_saml_response = "mock_saml_response"
    mock_request_data = {
        "scheme": "https",
        "host": "example.com",
        "form_data": {"SAMLResponse": mock_saml_response},
    }
    
    # Mock prepare_flask_request
    mock_flask_req = {"post_data": {"SAMLResponse": mock_saml_response}}
    mock_prepare_flask_request.return_value = mock_flask_req
    
    # Mock SAML auth
    mock_auth = MagicMock()
    mock_auth.is_authenticated.return_value = True
    mock_auth.get_attributes.return_value = {
        "firstName": ["Jane"],
        "lastName": ["Smith"],
    }
    mock_auth.get_nameid.return_value = "jane.smith@example.com"
    mock_init_saml_auth.return_value = mock_auth
    
    # Mock user query to return None (new user)
    mock_db.query.return_value.filter.return_value.first.return_value = None
    
    # Mock tokens
    mock_get_user_scopes.return_value = ["user"]
    mock_create_access_token.return_value = "mock_access_token"
    mock_create_refresh_token.return_value = "mock_refresh_token"
    
    # Act
    access_token, refresh_token = await process_saml_response(
        mock_db, mock_saml_response, mock_request_data
    )
    
    # Assert
    mock_prepare_flask_request.assert_called_once_with(mock_request_data)
    mock_init_saml_auth.assert_called_once_with(mock_flask_req)
    mock_auth.process_response.assert_called_once()
    mock_auth.is_authenticated.assert_called_once()
    mock_auth.get_attributes.assert_called_once()
    mock_auth.get_nameid.assert_called_once()
    
    # Verify new user was created
    mock_db.add.assert_called_once()
    mock_db.commit.assert_called_once()
    mock_db.refresh.assert_called_once()
    
    # Verify tokens
    assert access_token == "mock_access_token"
    assert refresh_token == "mock_refresh_token"
