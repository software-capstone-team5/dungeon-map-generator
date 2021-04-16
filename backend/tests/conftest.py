import pytest
import backend
from unittest import mock

@pytest.fixture
def app():
    app = backend.create_app('.env.firebase')
    yield app

@pytest.fixture
def client(app):
    """A test client for the app."""
    return app.test_client()