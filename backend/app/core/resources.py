"""
Resource handlers for the MCP Fintech Platform.
"""
import logging
from typing import Dict, Any, List, Optional

from mcp.server.resource import Resource

logger = logging.getLogger(__name__)

class ServerInfoResource(Resource):
    """
    Resource handler for server information.
    
    This is a basic example of an MCP resource that provides information
    about the server and its capabilities.
    """
    
    def __init__(self, server_info: Dict[str, Any]):
        """
        Initialize the server info resource.
        
        Args:
            server_info: Dictionary containing server information
        """
        self.server_info = server_info
    
    async def get(self) -> Dict[str, Any]:
        """
        Get server information.
        
        Returns:
            Dictionary containing server information
        """
        logger.info("Server info resource accessed")
        return self.server_info


class HealthResource(Resource):
    """
    Resource handler for health status.
    
    This resource provides health information about various components
    of the system.
    """
    
    def __init__(self):
        """Initialize the health resource."""
        self.components = {
            "server": "healthy",
            "database": "unknown",
            "redis": "unknown",
            "third_party_apis": {
                "plaid": "unknown",
                "stripe": "unknown",
                "alpaca": "unknown"
            }
        }
    
    async def get(self) -> Dict[str, Any]:
        """
        Get health status of all components.
        
        Returns:
            Dictionary containing health status
        """
        logger.info("Health resource accessed")
        return {
            "status": "healthy" if all(s == "healthy" for s in self._get_all_statuses()) else "degraded",
            "components": self.components
        }
    
    def _get_all_statuses(self) -> List[str]:
        """
        Get a flat list of all component statuses.
        
        Returns:
            List of status strings
        """
        statuses = []
        
        # Add top-level components
        for key, value in self.components.items():
            if isinstance(value, dict):
                # Add nested components
                for _, nested_value in value.items():
                    statuses.append(nested_value)
            else:
                statuses.append(value)
        
        return statuses
    
    def update_component_status(self, component: str, status: str, subcomponent: Optional[str] = None) -> None:
        """
        Update the status of a component.
        
        Args:
            component: Name of the component
            status: New status (healthy, degraded, unhealthy)
            subcomponent: Optional subcomponent name
        """
        if subcomponent and component in self.components and isinstance(self.components[component], dict):
            if subcomponent in self.components[component]:
                self.components[component][subcomponent] = status
        elif component in self.components:
            self.components[component] = status
