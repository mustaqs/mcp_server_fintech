"""
Database connection module for the MCP Fintech Platform.
"""
import logging
import os
from typing import Optional

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session

from app.db.config import get_database_url, get_database_config

# Configure logging
logger = logging.getLogger(__name__)

# Get the current environment
ENVIRONMENT = os.getenv("ENVIRONMENT", "development")

# Get database configuration
db_config = get_database_config(ENVIRONMENT)
DATABASE_URL = get_database_url(ENVIRONMENT)

# Create SQLAlchemy engine
engine = create_engine(
    DATABASE_URL,
    pool_size=db_config["pool_size"],
    max_overflow=db_config["max_overflow"],
    echo=db_config["echo"],
)

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create base class for declarative models
Base = declarative_base()

def get_db() -> Session:
    """
    Get a database session.
    
    This function should be used as a dependency in FastAPI endpoints.
    It creates a new database session for each request and closes it
    when the request is finished.
    
    Returns:
        Database session
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db() -> None:
    """
    Initialize the database.
    
    This function creates all tables defined in the models.
    It should be called during application startup.
    """
    try:
        # Import all models to ensure they are registered with the Base
        from app.db import models  # noqa
        
        # Create all tables
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables created successfully")
    except Exception as e:
        logger.error(f"Error initializing database: {e}")
        raise
