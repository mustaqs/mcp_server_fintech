"""
Resource handlers for the MCP Fintech Platform.
"""
import logging
import time
from typing import Dict, Any, List, Optional

from mcp import Resource

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
        # Initialize the base Resource class with required fields
        super().__init__(uri="system://info", name="Server Information")
        # Store server info as a regular attribute, not as a Pydantic field
        self._server_info = server_info
    
    async def get(self) -> Dict[str, Any]:
        """
        Get server information.
        
        Returns:
            Dictionary containing server information
        """
        logger.info("Server info resource accessed")
        return self._server_info


class HealthResource(Resource):
    """
    Resource handler for health status.
    
    This resource provides health information about various components
    of the system, including server, database, and external services.
    """
    
    def __init__(self):
        """Initialize the health resource."""
        # Initialize the base Resource class with required fields
        super().__init__(uri="system://health", name="Health Status")
        self.components = {
            "server": "healthy",
            "database": "unknown",
            "redis": "unknown",
            "mcp_transport": "healthy",
            "third_party_apis": {
                "plaid": "unknown",
                "stripe": "unknown",
                "alpaca": "unknown"
            },
            "last_checked": self._get_timestamp()
        }
    
    async def get(self) -> Dict[str, Any]:
        """
        Get health status of all components.
        
        Returns:
            Dictionary containing health status
        """
        logger.info("Health resource accessed")
        return self.get_health_status()
        
    def get_health_status(self) -> Dict[str, Any]:
        """
        Get the current health status of all components.
        
        Returns:
            Dictionary containing health status information
        """
        # Update timestamp
        self.components["last_checked"] = self._get_timestamp()
        
        # Determine overall status
        statuses = self._get_all_statuses()
        if all(s == "healthy" for s in statuses if s != "unknown"):
            overall_status = "healthy"
        elif any(s == "unhealthy" for s in statuses):
            overall_status = "unhealthy"
        else:
            overall_status = "degraded"
        
        return {
            "status": overall_status,
            "components": self.components,
            "timestamp": self._get_timestamp()
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
            if key == "last_checked":
                continue  # Skip timestamp
                
            if isinstance(value, dict):
                # Add nested components
                for _, nested_value in value.items():
                    if isinstance(nested_value, str):  # Ensure it's a status string
                        statuses.append(nested_value)
            elif isinstance(value, str):  # Ensure it's a status string
                statuses.append(value)
        
        return statuses
    
    def update_component_status(self, component: str, status: str, subcomponent: Optional[str] = None) -> None:
        """
        Update the status of a component.
        
        Args:
            component: Name of the component
            status: Status of the component (healthy, degraded, unhealthy)
            subcomponent: Optional subcomponent name
        """
        if status not in ["healthy", "degraded", "unhealthy", "unknown"]:
            logger.warning(f"Invalid status '{status}' for component '{component}'")
            return
        
        if subcomponent:
            # Handle nested components
            if component in self.components and isinstance(self.components[component], dict):
                self.components[component][subcomponent] = status
                logger.info(f"Updated health status for {component}.{subcomponent}: {status}")
            else:
                logger.warning(f"Component '{component}' does not exist or is not a dictionary")
        else:
            # Handle top-level components
            self.components[component] = status
            logger.info(f"Updated health status for {component}: {status}")
        
        # Update timestamp
        self.components["last_checked"] = self._get_timestamp()
        
    def _get_timestamp(self) -> int:
        """
        Get current timestamp in milliseconds.
        
        Returns:
            Current timestamp
        """
        return int(time.time() * 1000)
