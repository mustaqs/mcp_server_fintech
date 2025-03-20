import pytest
from fastapi.testclient import TestClient
import uuid
from unittest.mock import patch, MagicMock
from sqlalchemy.orm import Session
import base64
import json

from app.main import app
from app.db.models.user import User


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
def mock_saml_auth():
    """Mock the SAML authentication process."""
    with patch("app.core.sso.init_saml_auth") as mock_init_auth:
        mock_auth = MagicMock()
        mock_init_auth.return_value = mock_auth
        yield mock_auth


def test_saml_login_redirect(client, mock_saml_auth):
    """Test SAML login endpoint redirects to IdP."""
    # Mock the SAML auth to return a specific SSO URL
    mock_saml_auth.login.return_value = "https://idp.example.com/sso?SAMLRequest=encoded_request"
    
    response = client.get("/api/auth/saml/login")
    
    assert response.status_code == 307  # Temporary redirect
    assert response.headers["location"] == "https://idp.example.com/sso?SAMLRequest=encoded_request"


@patch("app.core.sso.process_saml_response")
def test_saml_acs_success(mock_process_saml, client, test_db, mock_saml_auth):
    """Test SAML assertion consumer service endpoint with successful authentication."""
    # Mock the SAML response processing
    mock_process_saml.return_value = ("mock_access_token", "mock_refresh_token")
    
    # Create a mock SAML response
    saml_response = base64.b64encode(b"<mock_saml_response>").decode("utf-8")
    
    response = client.post(
        "/api/auth/saml/acs",
        data={"SAMLResponse": saml_response},
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["access_token"] == "mock_access_token"
    assert data["refresh_token"] == "mock_refresh_token"
    
    # Verify process_saml_response was called with the correct parameters
    mock_process_saml.assert_called_once()
    call_args = mock_process_saml.call_args[0]
    assert isinstance(call_args[0], Session)  # db session
    assert call_args[1] == saml_response  # SAML response


@patch("app.core.sso.process_saml_response")
def test_saml_acs_failure(mock_process_saml, client, mock_saml_auth):
    """Test SAML assertion consumer service endpoint with failed authentication."""
    # Mock the SAML response processing to raise an exception
    from fastapi import HTTPException
    mock_process_saml.side_effect = HTTPException(
        status_code=401, detail="SAML authentication failed: Invalid signature"
    )
    
    # Create a mock SAML response
    saml_response = base64.b64encode(b"<mock_saml_response>").decode("utf-8")
    
    response = client.post(
        "/api/auth/saml/acs",
        data={"SAMLResponse": saml_response},
    )
    
    assert response.status_code == 401
    data = response.json()
    assert "detail" in data
    assert "SAML authentication failed" in data["detail"]


@patch("app.core.sso.process_saml_response")
def test_saml_user_creation(mock_process_saml, client, test_db):
    """Test that a new user is created when authenticating via SAML for the first time."""
    # Setup: ensure the user doesn't exist yet
    test_email = "saml_user@example.com"
    existing_user = test_db.query(User).filter(User.email == test_email).first()
    if existing_user:
        test_db.delete(existing_user)
        test_db.commit()
    
    # Mock the SAML response processing to create a new user
    user_id = str(uuid.uuid4())
    
    async def mock_process_side_effect(db, saml_response, request_data):
        # Create a new user as a side effect
        new_user = User(
            id=uuid.UUID(user_id),
            email=test_email,
            username="saml_user",
            is_active=True,
            is_verified=True,
            sso_provider="saml",
            sso_provider_user_id=test_email,
        )
        db.add(new_user)
        db.commit()
        
        return "mock_access_token", "mock_refresh_token"
    
    mock_process_saml.side_effect = mock_process_side_effect
    
    # Create a mock SAML response
    saml_response = base64.b64encode(b"<mock_saml_response>").decode("utf-8")
    
    response = client.post(
        "/api/auth/saml/acs",
        data={"SAMLResponse": saml_response},
    )
    
    assert response.status_code == 200
    
    # Verify the user was created
    new_user = test_db.query(User).filter(User.email == test_email).first()
    assert new_user is not None
    assert new_user.email == test_email
    assert new_user.sso_provider == "saml"
    assert new_user.is_verified is True


@patch("app.core.sso.process_saml_response")
def test_saml_user_update(mock_process_saml, client, test_db):
    """Test that an existing user is updated when authenticating via SAML."""
    # Setup: create a user that will be updated
    test_email = "existing_saml_user@example.com"
    user_id = uuid.uuid4()
    
    existing_user = User(
        id=user_id,
        email=test_email,
        username="existing_saml_user",
        is_active=True,
        is_verified=True,
    )
    test_db.add(existing_user)
    test_db.commit()
    
    # Mock the SAML response processing to update the existing user
    async def mock_process_side_effect(db, saml_response, request_data):
        # Update the existing user as a side effect
        user = db.query(User).filter(User.email == test_email).first()
        user.sso_provider = "saml"
        user.sso_provider_user_id = test_email
        user.first_name = "Updated"
        user.last_name = "User"
        db.commit()
        
        return "mock_access_token", "mock_refresh_token"
    
    mock_process_saml.side_effect = mock_process_side_effect
    
    # Create a mock SAML response
    saml_response = base64.b64encode(b"<mock_saml_response>").decode("utf-8")
    
    response = client.post(
        "/api/auth/saml/acs",
        data={"SAMLResponse": saml_response},
    )
    
    assert response.status_code == 200
    
    # Verify the user was updated
    updated_user = test_db.query(User).filter(User.email == test_email).first()
    assert updated_user is not None
    assert updated_user.sso_provider == "saml"
    assert updated_user.first_name == "Updated"
    assert updated_user.last_name == "User"


def test_saml_metadata(client):
    """Test the SAML metadata endpoint."""
    with patch("app.core.sso.SAML_SETTINGS") as mock_settings:
        # Mock the SAML settings
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
        
        with patch("app.core.sso.OneLogin_Saml2_Settings") as mock_saml_settings:
            mock_settings_instance = MagicMock()
            mock_settings_instance.get_sp_metadata.return_value = "<EntityDescriptor>Mock SAML Metadata</EntityDescriptor>"
            mock_saml_settings.return_value = mock_settings_instance
            
            response = client.get("/api/auth/saml/metadata")
            
            assert response.status_code == 200
            assert "text/xml" in response.headers["content-type"]
            assert "<EntityDescriptor>Mock SAML Metadata</EntityDescriptor>" in response.text
