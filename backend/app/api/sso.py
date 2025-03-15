"""
Single Sign-On (SSO) endpoints for the MCP Fintech Platform.
"""
from typing import Dict, Optional

from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.responses import RedirectResponse, HTMLResponse
from sqlalchemy.orm import Session

from app.core.sso import (
    get_oauth_authorization_url,
    init_saml_auth,
    prepare_flask_request,
    process_oauth_callback,
    process_saml_response,
)
from app.db.database import get_db
from app.schemas.auth import Token

router = APIRouter(prefix="/api/auth", tags=["sso"])


@router.get("/saml/login")
async def saml_login(request: Request):
    """
    Initiate SAML login flow.
    """
    # Prepare request for SAML library
    req = prepare_flask_request({
        'scheme': request.url.scheme,
        'host': request.url.netloc,
        'root_path': request.scope.get('root_path', ''),
        'port': request.url.port,
        'query_params': dict(request.query_params),
    })
    
    # Initialize SAML auth
    auth = init_saml_auth(req)
    
    # Get login URL
    login_url = auth.login()
    
    # Redirect to IdP
    return RedirectResponse(url=login_url)


@router.post("/saml/acs", response_model=Token)
async def saml_assertion_consumer_service(
    request: Request,
    db: Session = Depends(get_db),
):
    """
    SAML Assertion Consumer Service (ACS) endpoint.
    
    This endpoint receives and processes SAML responses from the IdP.
    """
    # Get form data
    form_data = await request.form()
    saml_response = form_data.get("SAMLResponse")
    
    if not saml_response:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Missing SAMLResponse",
        )
    
    # Prepare request data
    request_data = {
        'scheme': request.url.scheme,
        'host': request.url.netloc,
        'root_path': request.scope.get('root_path', ''),
        'port': request.url.port,
        'form_data': dict(form_data),
    }
    
    # Process SAML response
    access_token, refresh_token = await process_saml_response(
        db, saml_response, request_data
    )
    
    # Return HTML with tokens
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <title>Login Successful</title>
        <script>
            // Store tokens in localStorage
            localStorage.setItem('access_token', '{access_token}');
            localStorage.setItem('refresh_token', '{refresh_token}');
            
            // Redirect to application
            window.location.href = '/';
        </script>
    </head>
    <body>
        <h1>Login Successful</h1>
        <p>You will be redirected to the application...</p>
    </body>
    </html>
    """
    
    return HTMLResponse(content=html_content)


@router.get("/saml/metadata")
async def saml_metadata():
    """
    SAML Service Provider (SP) metadata endpoint.
    
    This endpoint provides metadata for the IdP to configure the SP.
    """
    from onelogin.saml2.settings import OneLogin_Saml2_Settings
    from app.core.sso import SAML_SETTINGS
    
    settings = OneLogin_Saml2_Settings(
        custom_base_path=None,
        sp_validation_only=True,
        settings=SAML_SETTINGS,
    )
    
    metadata = settings.get_sp_metadata()
    errors = settings.validate_metadata(metadata)
    
    if errors:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Invalid metadata: {', '.join(errors)}",
        )
    
    return HTMLResponse(content=metadata, media_type="text/xml")


@router.get("/oauth/{provider}")
async def oauth_login(provider: str):
    """
    Initiate OAuth2.0/OpenID Connect login flow.
    """
    # Get authorization URL
    try:
        authorization_url = await get_oauth_authorization_url(provider)
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get authorization URL: {str(e)}",
        )
    
    # Redirect to authorization URL
    return RedirectResponse(url=authorization_url)


@router.get("/oauth/callback/{provider}", response_model=Token)
async def oauth_callback(
    provider: str,
    code: str,
    state: Optional[str] = None,
    db: Session = Depends(get_db),
):
    """
    OAuth2.0/OpenID Connect callback endpoint.
    
    This endpoint receives and processes OAuth callbacks from the provider.
    """
    # Process OAuth callback
    try:
        access_token, refresh_token = await process_oauth_callback(
            db, provider, code, state
        )
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process OAuth callback: {str(e)}",
        )
    
    # Return HTML with tokens
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <title>Login Successful</title>
        <script>
            // Store tokens in localStorage
            localStorage.setItem('access_token', '{access_token}');
            localStorage.setItem('refresh_token', '{refresh_token}');
            
            // Redirect to application
            window.location.href = '/';
        </script>
    </head>
    <body>
        <h1>Login Successful</h1>
        <p>You will be redirected to the application...</p>
    </body>
    </html>
    """
    
    return HTMLResponse(content=html_content)
