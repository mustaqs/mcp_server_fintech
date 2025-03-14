"""
Test FastAPI application with MCP imports.
"""
from fastapi import FastAPI
from mcp.server.fastmcp import FastMCP

app = FastAPI()

# Create an MCP server instance
mcp_server = FastMCP(server_name="Test MCP Server")

@app.get("/")
async def root():
    return {"message": "MCP Server is running", "mcp_server": str(mcp_server)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8005)
