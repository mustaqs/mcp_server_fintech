"""
Test imports within the backend directory.
"""
import sys
print("Python path:")
for path in sys.path:
    print(f"  {path}")
print()

try:
    from mcp.server.fastmcp import FastMCP
    print("Successfully imported FastMCP from mcp.server.fastmcp")
    print(f"FastMCP class: {FastMCP}")
except ImportError as e:
    print(f"Import error: {e}")

try:
    import mcp
    print(f"MCP package location: {mcp.__file__}")
    
    import mcp.server
    print(f"MCP server package location: {mcp.server.__file__}")
    print(f"MCP server contents: {dir(mcp.server)}")
    
    if hasattr(mcp.server, 'fastmcp'):
        print(f"MCP server.fastmcp package location: {mcp.server.fastmcp.__file__}")
    else:
        print("mcp.server.fastmcp is not available as an attribute")
        
    # Try to import directly
    import mcp.server.fastmcp
    print(f"Direct import of mcp.server.fastmcp successful: {mcp.server.fastmcp.__file__}")
except ImportError as e:
    print(f"Import error: {e}")
except AttributeError as e:
    print(f"Attribute error: {e}")
