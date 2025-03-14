"""
Database configuration for the MCP Fintech Platform.
"""
import os
from typing import Dict, Any

# Database configuration
DATABASE_CONFIG = {
    "development": {
        "dialect": "postgresql",
        "driver": "psycopg2",
        "username": os.getenv("DB_USER", "postgres"),
        "password": os.getenv("DB_PASSWORD", "postgres"),
        "host": os.getenv("DB_HOST", "localhost"),
        "port": os.getenv("DB_PORT", "5432"),
        "database": os.getenv("DB_NAME", "mcp_fintech_dev"),
        "pool_size": 5,
        "max_overflow": 10,
        "echo": True,
    },
    "test": {
        "dialect": "postgresql",
        "driver": "psycopg2",
        "username": os.getenv("TEST_DB_USER", "postgres"),
        "password": os.getenv("TEST_DB_PASSWORD", "postgres"),
        "host": os.getenv("TEST_DB_HOST", "localhost"),
        "port": os.getenv("TEST_DB_PORT", "5432"),
        "database": os.getenv("TEST_DB_NAME", "mcp_fintech_test"),
        "pool_size": 5,
        "max_overflow": 10,
        "echo": True,
    },
    "production": {
        "dialect": "postgresql",
        "driver": "psycopg2",
        "username": os.getenv("PROD_DB_USER", ""),
        "password": os.getenv("PROD_DB_PASSWORD", ""),
        "host": os.getenv("PROD_DB_HOST", ""),
        "port": os.getenv("PROD_DB_PORT", "5432"),
        "database": os.getenv("PROD_DB_NAME", "mcp_fintech_prod"),
        "pool_size": 10,
        "max_overflow": 20,
        "echo": False,
    },
}

def get_database_url(env: str = "development") -> str:
    """
    Get the database URL for the specified environment.
    
    Args:
        env: Environment name (development, test, production)
        
    Returns:
        Database URL string
    """
    config = DATABASE_CONFIG.get(env, DATABASE_CONFIG["development"])
    
    # Format: dialect+driver://username:password@host:port/database
    return (
        f"{config['dialect']}+{config['driver']}://"
        f"{config['username']}:{config['password']}@"
        f"{config['host']}:{config['port']}/"
        f"{config['database']}"
    )

def get_database_config(env: str = "development") -> Dict[str, Any]:
    """
    Get the database configuration for the specified environment.
    
    Args:
        env: Environment name (development, test, production)
        
    Returns:
        Database configuration dictionary
    """
    return DATABASE_CONFIG.get(env, DATABASE_CONFIG["development"])
