"""
API Key model for the MCP Fintech Platform.
"""
import uuid
from datetime import datetime, timedelta
from typing import List, Optional

from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, ARRAY
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.db.database import Base


class APIKey(Base):
    """
    API Key model for developer authentication.
    
    This model stores API keys that can be used to authenticate API requests.
    """
    __tablename__ = "api_keys"
    
    # Primary key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    # API key details
    name = Column(String, nullable=False)
    key_prefix = Column(String(8), nullable=False)
    key_hash = Column(String, nullable=False)
    
    # Scopes and permissions
    scopes = Column(ARRAY(String), nullable=False, default=["api:read"])
    
    # Status
    is_active = Column(Boolean, default=True)
    
    # Ownership
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    user = relationship("User", back_populates="api_keys")
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime, nullable=True)
    last_used_at = Column(DateTime, nullable=True)
    
    def __repr__(self) -> str:
        """String representation of the API key."""
        return f"<APIKey {self.name} ({self.key_prefix}...)>"
    
    @property
    def is_expired(self) -> bool:
        """Check if the API key is expired."""
        if self.expires_at is None:
            return False
        return datetime.utcnow() > self.expires_at
    
    def update_last_used(self) -> None:
        """Update the last used timestamp."""
        self.last_used_at = datetime.utcnow()
