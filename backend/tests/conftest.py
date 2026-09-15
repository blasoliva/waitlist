import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.store import reset_store


@pytest.fixture(autouse=True)
def _reset_store():
    """Every test starts from the same seed data, independent of others."""
    reset_store()
    yield
    reset_store()


@pytest.fixture
def client():
    return TestClient(app)
