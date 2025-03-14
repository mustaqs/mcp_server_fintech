"""
Test script to verify MCP imports.
"""
try:
    from mcp.server.fastmcp import FastMCP
    print("Successfully imported FastMCP from mcp.server.fastmcp")
    print(f"FastMCP class: {FastMCP}")
except ImportError as e:
    print(f"Import error: {e}")

try:
    from mcp.server import FastMCP
    print("Successfully imported FastMCP from mcp.server")
    print(f"FastMCP class: {FastMCP}")
except ImportError as e:
    print(f"Import error: {e}")

try:
    from mcp.server.sse import SseServerTransport
    print("Successfully imported SseServerTransport from mcp.server.sse")
    print(f"SseServerTransport class: {SseServerTransport}")
except ImportError as e:
    print(f"Import error: {e}")
