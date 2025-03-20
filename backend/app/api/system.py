"""
System management endpoints for the MCP Fintech Platform.
"""
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.services.system_service import is_first_user

router = APIRouter(prefix="/api/system", tags=["system"])


@router.get("/first-time-setup", status_code=status.HTTP_200_OK)
async def check_first_time_setup(db: Session = Depends(get_db)):
    """
    Check if this is a first-time setup (no users exist in the system).
    
    This endpoint is used by the frontend to determine whether to show
    the admin checkbox during registration.
    """
    return {"isFirstTimeSetup": is_first_user(db)}
