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

# Register startup event
@app.on_event("startup")
async def startup_event():
    """Initialize components on application startup."""
    logger.info("Application starting up")
    # Register MCP resources
    register_mcp_resources()
    logger.info("Application startup complete")

@app.get("/")
async def root():
    """Root endpoint for health check."""
    return {"status": "healthy", "service": "MCP Fintech Platform"}

@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "version": app.version,
        "mcp_status": "connected"
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
