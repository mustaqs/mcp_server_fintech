"""
API endpoints for the MCP Fintech Platform.
"""
from fastapi import APIRouter

from app.api import health
from app.api import mcp_resources
from app.api import auth
from app.api import sso

api_router = APIRouter()

# Include health check endpoints
api_router.include_router(health.router)

# Include MCP resources router
api_router.include_router(mcp_resources.router)

# Include authentication routers
api_router.include_router(auth.router)
api_router.include_router(sso.router)

# Include other API routers as they are developed
# api_router.include_router(users.router)
# api_router.include_router(accounts.router)
# api_router.include_router(transactions.router)
