import pytest
from unittest.mock import MagicMock

# Mock session for database tests
@pytest.fixture
def db_session():
    """Create a mock database session for testing."""
    session = MagicMock()
    return session
