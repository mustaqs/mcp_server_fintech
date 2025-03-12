"""
Core MCP Server implementation for the Fintech Platform.
"""
import logging
from typing import Dict, Any, Optional

from fastapi import FastAPI
from mcp.server.fastmcp import FastMCP
from mcp.transport.sse import SSETransport

logger = logging.getLogger(__name__)

class MCPFintech:
    """
    MCP Fintech Server implementation that integrates FastMCP with FastAPI.
    """
    
    def __init__(
        self, 
        app: FastAPI, 
        server_name: str = "Fintech MCP Server",
        server_version: str = "0.1.0",
        description: str = "MCP-compliant financial technology platform"
    ):
        """
        Initialize the MCP Fintech server.
        
        Args:
            app: FastAPI application instance
            server_name: Name of the MCP server
            server_version: Version of the MCP server
            description: Description of the MCP server
        """
        self.app = app
        self.server_name = server_name
        self.server_version = server_version
        self.description = description
        
        # Initialize MCP server
        self.mcp = FastMCP(
            server_name=server_name,
            server_version=server_version,
            description=description
        )
        
        # Configure SSE transport
        self.transport = SSETransport()
        self.mcp.add_transport(self.transport)
        
        # Register SSE endpoint with FastAPI
        self._register_sse_endpoint()
        
        logger.info(f"MCP Fintech Server '{server_name}' initialized")
    
    def _register_sse_endpoint(self) -> None:
        """Register the SSE endpoint with FastAPI."""
        @self.app.get("/mcp/sse/{client_id}")
        async def sse_endpoint(client_id: str):
            return self.transport.create_endpoint(client_id)
    
    def register_resource(self, uri: str, handler: Any) -> None:
        """
        Register a resource with the MCP server.
        
        Args:
            uri: URI of the resource
            handler: Resource handler
        """
        self.mcp.register_resource(uri, handler)
        logger.info(f"Registered resource: {uri}")
    
    def register_tool(self, name: str, handler: Any, description: Optional[str] = None) -> None:
        """
        Register a tool with the MCP server.
        
        Args:
            name: Name of the tool
            handler: Tool handler
            description: Description of the tool
        """
        self.mcp.register_tool(name, handler, description)
        logger.info(f"Registered tool: {name}")
    
    def get_server_info(self) -> Dict[str, Any]:
        """
        Get information about the MCP server.
        
        Returns:
            Dict containing server information
        """
        return {
            "name": self.server_name,
            "version": self.server_version,
            "description": self.description,
            "resources": self.mcp.get_resources(),
            "tools": self.mcp.get_tools()
        }

# Create a singleton instance
mcp_server: Optional[MCPFintech] = None

def init_mcp_server(
    app: FastAPI, 
    server_name: str = "Fintech MCP Server",
    server_version: str = "0.1.0",
    description: str = "MCP-compliant financial technology platform"
) -> MCPFintech:
    """
    Initialize the MCP server and return the instance.
    
    Args:
        app: FastAPI application instance
        server_name: Name of the MCP server
        server_version: Version of the MCP server
        description: Description of the MCP server
        
    Returns:
        MCPFintech instance
    """
    global mcp_server
    if mcp_server is None:
        mcp_server = MCPFintech(app, server_name, server_version, description)
    return mcp_server

def get_mcp_server() -> Optional[MCPFintech]:
    """
    Get the MCP server instance.
    
    Returns:
        MCPFintech instance or None if not initialized
    """
    return mcp_server
