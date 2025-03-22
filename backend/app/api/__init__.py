"""
API endpoints for the MCP Fintech Platform.
"""
from fastapi import APIRouter

from app.api import health
from app.api import mcp_resources
from app.api import auth
from app.api import sso
from app.api import system
from app.api.endpoints import payments
from app.api.endpoints import banking

api_router = APIRouter()

# Include health check endpoints
api_router.include_router(health.router)

# Include MCP resources router
api_router.include_router(mcp_resources.router)

# Include authentication routers
api_router.include_router(auth.router)
api_router.include_router(sso.router)

# Include system management router
api_router.include_router(system.router)
api_router.include_router(payments.router, prefix="/payments", tags=["payments"])
api_router.include_router(banking.router, prefix="/banking", tags=["banking"])
# Include other API routers as they are developed
# api_router.include_router(users.router)
# api_router.include_router(accounts.router)
# api_router.include_router(transactions.router)
