"""
API endpoints for registering MCP resources.
"""
import logging
from fastapi import APIRouter, Depends, HTTPException

from app.core.mcp_server import get_mcp_server
from app.core.resources import ServerInfoResource, HealthResource

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/mcp", tags=["mcp"])

def register_mcp_resources():
    """
    Register all MCP resources with the server.
    
    This function should be called during application startup.
    """
    logger.info("Registering MCP resources")
    
    server = get_mcp_server()
    if not server:
        logger.error("MCP server not initialized")
        return
    
    # Register server info resource
    server_info = server.get_server_info()
    server.register_resource("system://info", ServerInfoResource(server_info))
    
    # Register health resource
    health_resource = HealthResource()
    server.register_resource("system://health", health_resource)
    
    logger.info("MCP resources registered successfully")
    
    return {
        "system://info": ServerInfoResource,
        "system://health": HealthResource
    }
