"""
Core MCP Server implementation for the Fintech Platform.
"""
import logging
import asyncio
from typing import Dict, Any, Optional, List, Callable

from fastapi import FastAPI, BackgroundTasks, Request
from mcp.server.fastmcp import FastMCP
from mcp.server.sse import SseServerTransport

from app.core.transport import EnhancedSSETransport

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
        self.capabilities: Dict[str, Any] = {}
        self.resources: Dict[str, Any] = {}
        self.tools: Dict[str, Any] = {}
        
        # Initialize MCP server
        self.mcp = FastMCP(
            server_name=server_name,
            server_version=server_version,
            description=description
        )
        
        # Configure enhanced SSE transport
        self.transport = EnhancedSSETransport()
        
        # Register SSE endpoint with FastAPI
        self._register_sse_endpoint()
        
        # Initialize server capabilities
        self._init_server_capabilities()
        
        logger.info(f"MCP Fintech Server '{server_name}' initialized")
    
    def _register_sse_endpoint(self) -> None:
        """Register the SSE endpoint with FastAPI using FastMCP's built-in functionality."""
        @self.app.get("/mcp/sse")
        async def sse_endpoint(request: Request):
            # Log connection for monitoring
            client_id = str(request.client.host) if request.client else "unknown"
            logger.info(f"New SSE connection from client: {client_id}")
            
            # Use FastMCP's built-in SSE functionality
            return await self.mcp.run_sse_async()
    
    def _init_server_capabilities(self) -> None:
        """Initialize server capabilities."""
        # Set server capabilities
        self.capabilities = {
            "supports_sse": True,
            "supports_websocket": False,  # Future enhancement
            "supports_polling": False,     # Future enhancement
            "max_message_size": 1024 * 1024,  # 1MB
            "supports_binary": False,
            "supports_compression": False,
            "supports_encryption": True,
            "supports_authentication": True,
            "supports_rate_limiting": True,
        }
        
        logger.info(f"Server capabilities initialized: {self.capabilities}")
    
    async def _monitor_client_connection(self, client_id: str) -> None:
        """Monitor client connection for activity and health."""
        try:
            # Simple monitoring loop
            while client_id in self.transport.get_active_connections():
                # Check last activity timestamp
                connections = self.transport.get_active_connections()
                if client_id in connections:
                    last_activity = connections[client_id].get("last_activity", 0)
                    # Future: Implement timeout logic
                
                # Sleep to avoid CPU spinning
                await asyncio.sleep(30)  # Check every 30 seconds
                
        except Exception as e:
            logger.error(f"Error monitoring client {client_id}: {str(e)}")
        finally:
            logger.info(f"Stopped monitoring client: {client_id}")
    
    def register_resource(self, uri: str, handler: Any) -> None:
        """
        Register a resource with the MCP server.
        
        Args:
            uri: URI of the resource
            handler: Resource handler
        """
        # The resource handler should already have the URI set during initialization
        self.mcp.add_resource(handler)
        # Store the resource handler in our own dictionary for easy access
        self.resources[uri] = handler
        logger.info(f"Registered resource: {uri}")
        
    def get_resource(self, uri: str) -> Optional[Any]:
        """
        Get a resource handler by URI.
        
        Args:
            uri: URI of the resource
            
        Returns:
            Resource handler or None if not found
        """
        return self.resources.get(uri)
    
    def register_tool(self, name: str, handler: Any, description: Optional[str] = None) -> None:
        """
        Register a tool with the MCP server.
        
        Args:
            name: Name of the tool
            handler: Tool handler function
            description: Description of the tool
        """
        self.mcp.add_tool(handler, name, description)
        # Store the tool handler in our own dictionary for easy access
        self.tools[name] = handler
        logger.info(f"Registered tool: {name}")
    
    async def get_server_info(self) -> Dict[str, Any]:
        """
        Get information about the MCP server.
        
        Returns:
            Dict containing server information
        """
        resources = await self.mcp.list_resources()
        tools = await self.mcp.list_tools()
        
        return {
            "name": self.server_name,
            "version": self.server_version,
            "description": self.description,
            "resources": resources,
            "tools": tools,
            "capabilities": self.capabilities,
            "active_connections": len(self.transport.get_active_connections())
        }
        
    def get_active_connections(self) -> Dict[str, Any]:
        """
        Get information about active client connections.
        
        Returns:
            Dict containing active connection information
        """
        return self.transport.get_active_connections()
    
    def broadcast_message(self, message: Dict[str, Any], exclude_clients: Optional[List[str]] = None) -> Dict[str, bool]:
        """
        Broadcast a message to all connected clients.
        
        Args:
            message: Message to broadcast
            exclude_clients: List of client IDs to exclude from broadcast
            
        Returns:
            Dict mapping client IDs to success status
        """
        exclude = exclude_clients or []
        results = {}
        
        for client_id in self.transport.get_active_connections():
            if client_id not in exclude:
                results[client_id] = self.transport.send_message(client_id, message)
                
        logger.info(f"Broadcast message to {len(results)} clients")
        return results

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
