"""
Transport implementations for the MCP Fintech Platform.

This module provides custom transport implementations and extensions
for the MCP server to enable real-time communication.
"""
import logging
from typing import Dict, Any, Optional, Callable, Awaitable

from fastapi import Request
from fastapi.responses import StreamingResponse
from mcp.server.sse import SseServerTransport as BaseSSETransport

logger = logging.getLogger(__name__)

class EnhancedSSETransport(BaseSSETransport):
    """
    Enhanced Server-Sent Events (SSE) transport for MCP.
    
    This extends the base SSE transport with additional functionality
    specific to the fintech platform, such as connection tracking,
    authentication integration, and improved error handling.
    """
    
    def __init__(self, endpoint: str = "/mcp/sse"):
        """Initialize the enhanced SSE transport.
        
        Args:
            endpoint: The endpoint path for the SSE connection
        """
        super().__init__(endpoint=endpoint)
        self.active_connections: Dict[str, Any] = {}
        self.connection_handlers: Dict[str, Callable] = {}
        logger.info(f"Enhanced SSE Transport initialized with endpoint: {endpoint}")
    
    def create_endpoint(self, client_id: str) -> StreamingResponse:
        """
        Create an SSE endpoint for a client.
        
        Args:
            client_id: Unique identifier for the client
            
        Returns:
            StreamingResponse: FastAPI streaming response for SSE
        """
        logger.info(f"Creating SSE endpoint for client: {client_id}")
        response = super().create_endpoint(client_id)
        
        # Track active connection
        self.active_connections[client_id] = {
            "connected_at": self._get_current_timestamp(),
            "last_activity": self._get_current_timestamp(),
            "message_count": 0
        }
        
        # Execute any registered connection handlers
        if client_id in self.connection_handlers:
            self.connection_handlers[client_id]()
            
        return response
    
    def register_connection_handler(self, client_id: str, handler: Callable) -> None:
        """
        Register a handler to be called when a client connects.
        
        Args:
            client_id: Unique identifier for the client
            handler: Callable to be executed when the client connects
        """
        self.connection_handlers[client_id] = handler
        logger.debug(f"Registered connection handler for client: {client_id}")
    
    def send_message(self, client_id: str, message: Dict[str, Any]) -> bool:
        """
        Send a message to a client.
        
        Args:
            client_id: Unique identifier for the client
            message: Message to send
            
        Returns:
            bool: True if the message was sent successfully, False otherwise
        """
        result = super().send_message(client_id, message)
        
        if result and client_id in self.active_connections:
            # Update connection tracking
            self.active_connections[client_id]["last_activity"] = self._get_current_timestamp()
            self.active_connections[client_id]["message_count"] += 1
            
        return result
    
    def get_active_connections(self) -> Dict[str, Any]:
        """
        Get information about all active connections.
        
        Returns:
            Dict containing information about active connections
        """
        return self.active_connections
    
    def _get_current_timestamp(self) -> int:
        """
        Get the current timestamp in milliseconds.
        
        Returns:
            int: Current timestamp
        """
        import time
        return int(time.time() * 1000)
