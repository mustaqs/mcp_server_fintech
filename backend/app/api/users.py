"""
User management endpoints for the MCP Fintech Platform.
"""
import uuid
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Security, status
from sqlalchemy.orm import Session

from app.core.combined_auth import get_auth_user
from app.db.database import get_db
from app.db.models.user import User
from app.schemas.user import UserCreate, UserResponse, UserUpdate
from app.services.user_service import (
    create_user,
    delete_user,
    get_user_by_id,
    get_users,
    update_user,
    verify_user,
)

router = APIRouter(prefix="/api/users", tags=["users"])


@router.post("/", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def create_new_user(
    user_data: UserCreate,
    db: Session = Depends(get_db),
    current_user: User = Security(get_auth_user, scopes=["admin"]),
):
    """
    Create a new user.
    
    Requires admin privileges.
    """
    try:
        user = create_user(db, user_data)
        return user
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


@router.get("/", response_model=List[UserResponse])
async def read_users(
    skip: int = 0,
    limit: int = 100,
    is_active: Optional[bool] = None,
    db: Session = Depends(get_db),
    current_user: User = Security(get_auth_user, scopes=["admin"]),
):
    """
    Get a list of users.
    
    Requires admin privileges.
    """
    users = get_users(db, skip=skip, limit=limit, is_active=is_active)
    return users


@router.get("/me", response_model=UserResponse)
async def read_current_user(
    current_user: User = Security(get_auth_user, scopes=["user"]),
):
    """
    Get the current authenticated user.
    """
    return current_user


@router.put("/me", response_model=UserResponse)
async def update_current_user(
    user_data: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Security(get_auth_user, scopes=["user"]),
):
    """
    Update the current authenticated user.
    """
    # Prevent user from changing their own admin status
    if user_data.is_admin is not None:
        user_data.is_admin = current_user.is_admin
    
    try:
        updated_user = update_user(db, current_user.id, user_data)
        if not updated_user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found",
            )
        return updated_user
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


@router.get("/{user_id}", response_model=UserResponse)
async def read_user(
    user_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Security(get_auth_user, scopes=["admin"]),
):
    """
    Get a specific user by ID.
    
    Requires admin privileges.
    """
    user = get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    return user


@router.put("/{user_id}", response_model=UserResponse)
async def update_user_by_id(
    user_id: uuid.UUID,
    user_data: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Security(get_auth_user, scopes=["admin"]),
):
    """
    Update a specific user by ID.
    
    Requires admin privileges.
    """
    try:
        updated_user = update_user(db, user_id, user_data)
        if not updated_user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found",
            )
        return updated_user
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user_by_id(
    user_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Security(get_auth_user, scopes=["admin"]),
):
    """
    Delete a specific user by ID.
    
    Requires admin privileges.
    """
    # Prevent user from deleting themselves
    if user_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete yourself",
        )
    
    success = delete_user(db, user_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    
    return None


@router.post("/{user_id}/verify", response_model=UserResponse)
async def verify_user_by_id(
    user_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Security(get_auth_user, scopes=["admin"]),
):
    """
    Mark a user as verified.
    
    Requires admin privileges.
    """
    verified_user = verify_user(db, user_id)
    if not verified_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    return verified_user
