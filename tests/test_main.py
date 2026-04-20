import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock
from server.main import app

client = TestClient(app)

def test_health_check():
    """Verify the health check endpoint is operational."""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "pulsing", "service": "PulseStadium Backend"}

@patch("server.main.model")
def test_analyze_zones_success(mock_model):
    """Verify the AI analysis proxy for a successful scenario."""
    # Mock the Gemini response
    mock_response = MagicMock()
    mock_response.text = "Mock Playbook: Evacuate Gate A"
    mock_model.generate_content.return_value = mock_response

    zones = [{"id": "z1", "name": "Gate A", "occupancy": 900, "capacity": 1000}]
    response = client.post(
        "/api/ai/playbook",
        json=zones,
        headers={"Authorization": "Bearer test-token"}
    )
    
    assert response.status_code == 200
    assert "playbook" in response.json()["data"]
    assert "Evacuate Gate A" in response.json()["data"]["playbook"]

def test_playbook_invalid_data():
    """Verify the API handles malformed zone data correctly."""
    response = client.post(
        "/api/ai/playbook",
        json=[{"id": "missing-fields"}],
        headers={"Authorization": "Bearer test-token"}
    )
    assert response.status_code == 422 # Pydantic Validation Error
