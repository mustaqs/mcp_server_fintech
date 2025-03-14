"""
Main application entry point for the MCP Fintech Platform.
"""
import logging
import os
from fastapi import FastAPI, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.mcp_server import init_mcp_server, get_mcp_server
from app.api.mcp_resources import register_mcp_resources
from app.api import api_router

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

# Create FastAPI application
app = FastAPI(
    title="MCP Fintech Platform",
    description="A comprehensive financial technology platform with MCP compliance",
    version="0.1.0",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize MCP server
mcp_server = init_mcp_server(
    app=app,
    server_name=os.getenv("MCP_SERVER_NAME", "Fintech MCP Server"),
    server_version=os.getenv("MCP_SERVER_VERSION", "0.1.0"),
    description="MCP-compliant financial technology platform"
)

# Include API routers
app.include_router(api_router, prefix="")

# Add a simple root endpoint
@app.get("/")
async def root():
    """Root endpoint for the API."""
    return {
        "name": "MCP Fintech Platform",
        "version": app.version,
        "status": "online",
        "docs_url": "/docs"
    }

# Register startup event
@app.on_event("startup")
async def startup_event():
    """Initialize components on application startup."""
    logger.info("Application starting up")
    
    # Register MCP resources
    await register_mcp_resources()
    
    # Set initial health status
    server = get_mcp_server()
    if server:
        # Get the health resource directly from our server instance
        # since FastMCP doesn't have a get_resource_handler method
        from app.core.resources import HealthResource
        health_resource = server.get_resource("system://health")
        if health_resource and isinstance(health_resource, HealthResource):
            # Set initial health status for components
            health_resource.update_component_status("server", "healthy")
            health_resource.update_component_status("mcp_transport", "healthy")
            
            # Database status will be updated when connection is established
            # Redis status will be updated when connection is established
            
            logger.info("Health status initialized")
    
    logger.info("Application startup complete")

# Legacy health check endpoint - redirects to new API endpoint
@app.get("/health")
async def legacy_health_check():
    """Legacy health check endpoint."""
    server = get_mcp_server()
    if not server:
        return {"status": "unhealthy", "message": "MCP server not initialized"}
        
    return {
        "status": "healthy",
        "version": app.version,
        "message": "Use /api/health for detailed health information"
    }

@app.get("/mcp/info")
async def mcp_info():
    """Get information about the MCP server."""
    server = get_mcp_server()
    if server:
        return server.get_server_info()
    return JSONResponse(
        status_code=503,
        content={"error": "MCP server not initialized"}
    )

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Global exception handler for all routes."""
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"error": "Internal server error", "detail": str(exc)}
    )

# API routes will be included here as we implement more features

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
