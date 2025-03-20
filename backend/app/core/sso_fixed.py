"""
Single Sign-On (SSO) utilities for the MCP Fintech Platform.

This module provides functions for SAML and OAuth2.0/OpenID Connect authentication.
"""
import os
import uuid
import base64
from datetime import datetime
from typing import Dict, Optional, Tuple, Any

import httpx
from fastapi import HTTPException, status
from onelogin.saml2.auth import OneLogin_Saml2_Auth
from onelogin.saml2.settings import OneLogin_Saml2_Settings
from sqlalchemy.orm import Session

from app.db.models.user import User
from app.core.auth import create_access_token, create_refresh_token, get_user_scopes
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("saml_auth")

# SAML Configuration
SAML_SETTINGS = {
    "strict": True,
    "debug": True,  # Enable debug for troubleshooting
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

# OAuth2.0/OpenID Connect Configuration (unchanged)
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
    try:
        auth = OneLogin_Saml2_Auth(req, SAML_SETTINGS)
        return auth
    except Exception as e:
        logger.error(f"Error initializing SAML auth: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error initializing SAML authentication: {str(e)}",
        )


def prepare_flask_request(request_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Prepare request data for SAML library (which expects Flask-like request format).
    """
    try:
        # Log the incoming request data for debugging
        logger.info(f"SAML Request Data: {request_data}")
        
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
        
        logger.info(f"Prepared Flask Request: {flask_request}")
        return flask_request
    except Exception as e:
        logger.error(f"Error preparing Flask request: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error preparing SAML request: {str(e)}",
        )


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
        logger.info(f"Received SAML Response: {saml_response[:100]}...")
        
        # Prepare request for SAML library
        req = prepare_flask_request(request_data)
        
        # Make sure form_data contains SAMLResponse
        if 'form_data' in req and 'SAMLResponse' not in req['post_data']:
            req['post_data']['SAMLResponse'] = saml_response
        
        # Initialize SAML auth
        auth = init_saml_auth(req)
        
        # Process the SAML response
        auth.process_response()
        
        # Check for errors
        errors = auth.get_errors()
        if errors:
            reason = auth.get_last_error_reason()
            logger.error(f"SAML Authentication Failed - Errors: {errors}, Reason: {reason}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=f"SAML authentication failed: {', '.join(errors)}. Reason: {reason}",
            )
        
        # Check if authenticated
        if not auth.is_authenticated():
            logger.error("SAML Authentication Failed - Not authenticated")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="SAML authentication failed: Not authenticated",
            )
        
        # Get user attributes and log them for debugging
        attributes = auth.get_attributes()
        name_id = auth.get_nameid()
        logger.info(f"SAML Attributes: {attributes}")
        logger.info(f"SAML NameID: {name_id}")
        
        if not name_id:
            logger.error("No user identifier (NameID) found in SAML response")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No user identifier (NameID) found in SAML response",
            )
        
        # Find or create user
        user = db.query(User).filter(User.email == name_id).first()
        
        if not user:
            # Create new user
            logger.info(f"Creating new user for SAML login: {name_id}")
            
            # Extract first and last name from attributes
            first_name = None
            last_name = None
            
            # Try different attribute names that IdPs might use
            for first_name_attr in ['firstName', 'FirstName', 'givenName', 'given_name', 'first_name']:
                if first_name_attr in attributes and attributes[first_name_attr]:
                    first_name = attributes[first_name_attr][0]
                    break
            
            for last_name_attr in ['lastName', 'LastName', 'surname', 'sn', 'last_name']:
                if last_name_attr in attributes and attributes[last_name_attr]:
                    last_name = attributes[last_name_attr][0]
                    break
            
            user = User(
                id=uuid.uuid4(),
                email=name_id,
                username=name_id.split('@')[0],
                hashed_password="",  # No password for SSO users
                first_name=first_name,
                last_name=last_name,
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
            logger.info(f"Updating existing user for SAML login: {name_id}")
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
        
        logger.info(f"SAML Authentication Successful for user: {user.email}")
        return access_token, refresh_token
        
    except HTTPException:
        # Re-raise HTTP exceptions as they already have the correct format
        raise
    except Exception as e:
        logger.error(f"SAML Processing Error: {str(e)}")
        import traceback
        logger.error(traceback.format_exc())
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing SAML response: {str(e)}",
        )


# The rest of the file remains unchanged
