"""
Script to check Python path and module availability.
"""
import sys
import os
import importlib.util

def check_module(module_name):
    """Check if a module can be imported and print its location."""
    try:
        spec = importlib.util.find_spec(module_name)
        if spec is None:
            print(f"Module {module_name} not found")
        else:
            print(f"Module {module_name} found at {spec.origin}")
            
            # Try to import it
            module = importlib.import_module(module_name)
            print(f"Successfully imported {module_name}")
            if hasattr(module, '__path__'):
                print(f"Module path: {module.__path__}")
            return module
    except ImportError as e:
        print(f"Import error for {module_name}: {e}")
    return None

# Print Python path
print("Python path:")
for path in sys.path:
    print(f"  {path}")
print()

# Check MCP modules
print("Checking MCP modules:")
mcp = check_module("mcp")
if mcp:
    print(f"MCP version: {getattr(mcp, '__version__', 'unknown')}")
    print()

print("Checking MCP server module:")
mcp_server = check_module("mcp.server")
if mcp_server:
    print(f"MCP server contents: {dir(mcp_server)}")
    print()

print("Checking MCP server.fastmcp module:")
fastmcp = check_module("mcp.server.fastmcp")
if fastmcp:
    print(f"FastMCP module contents: {dir(fastmcp)}")
    print(f"FastMCP class available: {'FastMCP' in dir(fastmcp)}")
    print()

# Check if we're running inside the backend directory
backend_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "backend")
print(f"Backend directory: {backend_dir}")
print(f"Current directory: {os.getcwd()}")
print(f"Backend directory in Python path: {backend_dir in sys.path}")
print()
