"""
Single Sign-On (SSO) utilities for the MCP Fintech Platform.

This module provides functions for SAML and OAuth2.0/OpenID Connect authentication.
"""
import os
import uuid
from datetime import datetime
from typing import Dict, Optional, Tuple, Any

import httpx
from fastapi import HTTPException, status
from onelogin.saml2.auth import OneLogin_Saml2_Auth
from onelogin.saml2.settings import OneLogin_Saml2_Settings
from sqlalchemy.orm import Session

from app.db.models.user import User
from app.core.auth import create_access_token, create_refresh_token, get_user_scopes


# SAML Configuration
SAML_SETTINGS = {
    "strict": True,
    "debug": False,
    "sp": {
        "entityId": os.getenv("SAML_SP_ENTITY_ID", "https://mcp-server.example.com/metadata"),
        "assertionConsumerService": {
            "url": os.getenv("SAML_SP_ACS_URL", "https://mcp-server.example.com/api/auth/saml/acs"),
            "binding": "urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST",
        },
        "singleLogoutService": {
            "url": os.getenv("SAML_SP_SLO_URL", "https://mcp-server.example.com/api/auth/saml/slo"),
            "binding": "urn:oasis:names:tc:SAML:2.0:bindings:HTTP-Redirect",
        },
        "NameIDFormat": "urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress",
        "x509cert": os.getenv("SAML_SP_CERT", ""),
        "privateKey": os.getenv("SAML_SP_KEY", ""),
    },
    "idp": {
        "entityId": os.getenv("SAML_IDP_ENTITY_ID", ""),
        "singleSignOnService": {
            "url": os.getenv("SAML_IDP_SSO_URL", ""),
            "binding": "urn:oasis:names:tc:SAML:2.0:bindings:HTTP-Redirect",
        },
        "singleLogoutService": {
            "url": os.getenv("SAML_IDP_SLO_URL", ""),
            "binding": "urn:oasis:names:tc:SAML:2.0:bindings:HTTP-Redirect",
        },
        "x509cert": os.getenv("SAML_IDP_CERT", ""),
    },
    "security": {
        "nameIdEncrypted": False,
        "authnRequestsSigned": True,
        "logoutRequestSigned": True,
        "logoutResponseSigned": True,
        "signMetadata": True,
        "wantMessagesSigned": True,
        "wantAssertionsSigned": True,
        "wantNameId": True,
        "wantNameIdEncrypted": False,
        "wantAssertionsEncrypted": False,
        "allowSingleLabelDomains": False,
        "signatureAlgorithm": "http://www.w3.org/2001/04/xmldsig-more#rsa-sha256",
        "digestAlgorithm": "http://www.w3.org/2001/04/xmlenc#sha256",
    },
}

# OAuth2.0/OpenID Connect Configuration
OAUTH_PROVIDERS = {
    "google": {
        "client_id": os.getenv("GOOGLE_CLIENT_ID", ""),
        "client_secret": os.getenv("GOOGLE_CLIENT_SECRET", ""),
        "authorize_url": "https://accounts.google.com/o/oauth2/auth",
        "token_url": "https://oauth2.googleapis.com/token",
        "userinfo_url": "https://openidconnect.googleapis.com/v1/userinfo",
        "redirect_uri": os.getenv("GOOGLE_REDIRECT_URI", "https://mcp-server.example.com/api/auth/oauth/callback/google"),
        "scope": "openid email profile",
    },
    "microsoft": {
        "client_id": os.getenv("MICROSOFT_CLIENT_ID", ""),
        "client_secret": os.getenv("MICROSOFT_CLIENT_SECRET", ""),
        "authorize_url": "https://login.microsoftonline.com/common/oauth2/v2.0/authorize",
        "token_url": "https://login.microsoftonline.com/common/oauth2/v2.0/token",
        "userinfo_url": "https://graph.microsoft.com/oidc/userinfo",
        "redirect_uri": os.getenv("MICROSOFT_REDIRECT_URI", "https://mcp-server.example.com/api/auth/oauth/callback/microsoft"),
        "scope": "openid email profile",
    },
}


def init_saml_auth(req: Dict[str, Any]) -> OneLogin_Saml2_Auth:
    """Initialize SAML authentication."""
    auth = OneLogin_Saml2_Auth(req, SAML_SETTINGS)
    return auth


def prepare_flask_request(request_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Prepare request data for SAML library (which expects Flask-like request format).
    """
    # Log the incoming request data for debugging
    print(f"SAML Request Data: {request_data}")
    
    # Determine if HTTPS is being used
    is_https = request_data.get('scheme', 'http') == 'https'
    
    # Get the server port, defaulting to standard ports if not specified
    port = request_data.get('port')
    if port is None:
        port = '443' if is_https else '80'
    
    # Prepare the request in the format expected by OneLogin SAML library
    flask_request = {
        'https': 'on' if is_https else 'off',
        'http_host': request_data.get('host', ''),
        'script_name': request_data.get('root_path', ''),
        'server_port': port,
        'get_data': request_data.get('query_params', {}),
        'post_data': request_data.get('form_data', {}),
    }
    
    # Add query string if available
    if 'query_string' in request_data:
        flask_request['query_string'] = request_data['query_string']
    
    print(f"Prepared Flask Request: {flask_request}")
    return flask_request


async def process_saml_response(
    db: Session, saml_response: str, request_data: Dict[str, Any]
) -> Tuple[str, str]:
    """
    Process SAML response and authenticate user.
    
    Returns:
        Tuple[str, str]: Access token and refresh token
    """
    try:
        # Log the SAML response (for debugging only, remove in production)
        print(f"Received SAML Response: {saml_response[:100]}...")
        
        # Prepare request for SAML library
        req = prepare_flask_request(request_data)
        
        # Initialize SAML auth
        auth = init_saml_auth(req)
        
        # Process response - make sure form_data contains SAMLResponse
        if 'form_data' in request_data and 'SAMLResponse' not in request_data['form_data']:
            request_data['form_data']['SAMLResponse'] = saml_response
        
        # Process the SAML response
        auth.process_response()
        
        # Check if authenticated
        if not auth.is_authenticated():
            errors = auth.get_errors()
            reason = auth.get_last_error_reason()
            print(f"SAML Authentication Failed - Errors: {errors}, Reason: {reason}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=f"SAML authentication failed: {', '.join(errors)}. Reason: {reason}",
            )
        # Get user attributes and log them for debugging
        attributes = auth.get_attributes()
        name_id = auth.get_nameid()
        
        print(f"SAML Attributes: {attributes}")
        print(f"SAML NameID: {name_id}")
        
        if not name_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No user identifier (NameID) found in SAML response",
            )
            
        # Find or create user
        user = db.query(User).filter(User.email == name_id).first()
        
        if not user:
            # Create new user
            user = User(
                id=uuid.uuid4(),
                email=name_id,
                username=name_id.split('@')[0],
                hashed_password="",  # No password for SSO users
                first_name=attributes.get('firstName', [None])[0],
                last_name=attributes.get('lastName', [None])[0],
                is_active=True,
                is_verified=True,
                sso_provider="saml",
                sso_provider_user_id=name_id,
            )
            db.add(user)
            db.commit()
            db.refresh(user)
        else:
            # Update existing user
            user.is_active = True
            user.is_verified = True
            user.sso_provider = "saml"
            user.sso_provider_user_id = name_id
            user.last_login_at = datetime.utcnow()
            db.commit()
        
        # Get user scopes
        scopes = get_user_scopes(user)
        
        # Create tokens
        access_token = create_access_token(
            data={"sub": str(user.id), "scopes": scopes},
        )
        
        refresh_token = create_refresh_token(
            data={"sub": str(user.id), "scopes": scopes},
        )
        
        print(f"SAML Authentication Successful for user: {user.email}")
        return access_token, refresh_token
        
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        print(f"Error processing SAML request: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing SAML request: {str(e)}",
        )
    # This code is unreachable - it's now handled inside the try block
    pass


async def get_oauth_authorization_url(provider: str) -> str:
    """
    Get OAuth2.0 authorization URL for the specified provider.
    """
    if provider not in OAUTH_PROVIDERS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported OAuth provider: {provider}",
        )
    
    provider_config = OAUTH_PROVIDERS[provider]
    
    # Generate state parameter for CSRF protection
    state = uuid.uuid4().hex
    
    # Build authorization URL
    params = {
        "client_id": provider_config["client_id"],
        "redirect_uri": provider_config["redirect_uri"],
        "response_type": "code",
        "scope": provider_config["scope"],
        "state": state,
    }
    
    # Add provider-specific parameters
    if provider == "microsoft":
        params["response_mode"] = "query"
    
    # Build query string
    query_string = "&".join([f"{k}={v}" for k, v in params.items()])
    
    return f"{provider_config['authorize_url']}?{query_string}"


async def process_oauth_callback(
    db: Session, provider: str, code: str, state: Optional[str] = None
) -> Tuple[str, str]:
    """
    Process OAuth2.0 callback and authenticate user.
    
    Returns:
        Tuple[str, str]: Access token and refresh token
    """
    if provider not in OAUTH_PROVIDERS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported OAuth provider: {provider}",
        )
    
    provider_config = OAUTH_PROVIDERS[provider]
    
    # Exchange authorization code for tokens
    async with httpx.AsyncClient() as client:
        # Request access token
        token_response = await client.post(
            provider_config["token_url"],
            data={
                "client_id": provider_config["client_id"],
                "client_secret": provider_config["client_secret"],
                "code": code,
                "redirect_uri": provider_config["redirect_uri"],
                "grant_type": "authorization_code",
            },
        )
        
        if token_response.status_code != 200:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=f"Failed to exchange authorization code: {token_response.text}",
            )
        
        token_data = token_response.json()
        
        # Get user info
        userinfo_response = await client.get(
            provider_config["userinfo_url"],
            headers={"Authorization": f"Bearer {token_data['access_token']}"},
        )
        
        if userinfo_response.status_code != 200:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=f"Failed to get user info: {userinfo_response.text}",
            )
        
        userinfo = userinfo_response.json()
    
    # Extract user data
    email = userinfo.get("email")
    if not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email not provided by OAuth provider",
        )
    
    # Find or create user
    user = db.query(User).filter(User.email == email).first()
    
    if not user:
        # Create new user
        user = User(
            id=uuid.uuid4(),
            email=email,
            username=email.split('@')[0],
            hashed_password="",  # No password for OAuth users
            first_name=userinfo.get("given_name"),
            last_name=userinfo.get("family_name"),
            is_active=True,
            is_verified=True,
            sso_provider=provider,
            sso_provider_user_id=userinfo.get("sub"),
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    else:
        # Update existing user
        user.is_active = True
        user.is_verified = True
        user.sso_provider = provider
        user.sso_provider_user_id = userinfo.get("sub")
        user.last_login_at = datetime.utcnow()
        db.commit()
    
    # Get user scopes
    scopes = get_user_scopes(user)
    
    # Create tokens
    access_token = create_access_token(
        data={"sub": str(user.id), "scopes": scopes},
    )
    
    refresh_token = create_refresh_token(
        data={"sub": str(user.id), "scopes": scopes},
    )
    
    return access_token, refresh_token
