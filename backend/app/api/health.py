"""
Health check endpoints for the MCP Fintech Platform.

These endpoints provide health status information for various components of the system.
"""
import logging
from typing import Dict, Any, Optional

from fastapi import APIRouter, Depends, HTTPException, status

from app.core.mcp_server import get_mcp_server
from app.core.resources import HealthResource

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/health", tags=["health"])


@router.get("/", summary="Get overall health status")
async def get_health_status() -> Dict[str, Any]:
    """
    Get the overall health status of the system.
    
    Returns:
        Dictionary containing health status information for all components
    """
    server = get_mcp_server()
    if not server:
        logger.error("MCP server not initialized")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Server not initialized"
        )
    
    # Get health resource from MCP server
    health_resource = server.mcp.get_resource_handler("system://health")
    if not health_resource:
        logger.error("Health resource not found")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Health resource not found"
        )
    
    # Get health status from resource
    health_status = await health_resource.get()
    return health_status


@router.get("/components/{component}", summary="Get component health status")
async def get_component_health(component: str, subcomponent: Optional[str] = None) -> Dict[str, Any]:
    """
    Get the health status of a specific component.
    
    Args:
        component: Name of the component
        subcomponent: Optional subcomponent name
    
    Returns:
        Dictionary containing health status information for the component
    """
    server = get_mcp_server()
    if not server:
        logger.error("MCP server not initialized")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Server not initialized"
        )
    
    # Get health resource from MCP server
    health_resource = server.mcp.get_resource_handler("system://health")
    if not health_resource:
        logger.error("Health resource not found")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Health resource not found"
        )
    
    # Get health status from resource
    health_status = await health_resource.get()
    
    # Extract component status
    components = health_status.get("components", {})
    if component not in components:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Component '{component}' not found"
        )
    
    component_status = components[component]
    
    # Handle subcomponent
    if subcomponent and isinstance(component_status, dict):
        if subcomponent not in component_status:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Subcomponent '{subcomponent}' not found in component '{component}'"
            )
        return {
            "component": component,
            "subcomponent": subcomponent,
            "status": component_status[subcomponent],
            "timestamp": health_status.get("timestamp")
        }
    
    # Return component status
    result = {
        "component": component,
        "status": component_status if not isinstance(component_status, dict) else "composite",
        "timestamp": health_status.get("timestamp")
    }
    
    # Include subcomponents if available
    if isinstance(component_status, dict):
        result["subcomponents"] = component_status
    
    return result


@router.put("/components/{component}", summary="Update component health status")
async def update_component_health(
    component: str, 
    status: str,
    subcomponent: Optional[str] = None
) -> Dict[str, Any]:
    """
    Update the health status of a component.
    
    Args:
        component: Name of the component
        status: New status (healthy, degraded, unhealthy, unknown)
        subcomponent: Optional subcomponent name
    
    Returns:
        Dictionary containing updated health status
    """
    if status not in ["healthy", "degraded", "unhealthy", "unknown"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid status '{status}'. Must be one of: healthy, degraded, unhealthy, unknown"
        )
    
    server = get_mcp_server()
    if not server:
        logger.error("MCP server not initialized")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Server not initialized"
        )
    
    # Get health resource from MCP server
    health_resource = server.mcp.get_resource_handler("system://health")
    if not health_resource:
        logger.error("Health resource not found")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Health resource not found"
        )
    
    # Update component status
    health_resource.update_component_status(component, status, subcomponent)
    
    # Get updated health status
    health_status = await health_resource.get()
    
    return {
        "message": f"Health status updated for {component}" + (f".{subcomponent}" if subcomponent else ""),
        "status": status,
        "health": health_status
    }
