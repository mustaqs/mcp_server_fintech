"""
System service for the MCP Fintech Platform.

This module provides functions for system-wide operations and configurations.
"""
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.models.user import User
from app.services.user_service import get_users


def is_first_user(db: Session) -> bool:
    """
    Check if this is the first user being created in the system.
    
    Args:
        db: Database session
        
    Returns:
        bool: True if no users exist in the system, False otherwise
    """
    # If we've already created the first admin, return False
    if settings.FIRST_ADMIN_CREATED:
        return False
    
    # Check if any users exist in the database
    users = get_users(db, limit=1)
    return len(users) == 0


def mark_first_admin_created() -> None:
    """
    Mark that the first admin user has been created.
    
    This prevents additional users from being created as admins during registration.
    """
    settings.FIRST_ADMIN_CREATED = True
