import pytest
from fastapi.testclient import TestClient
from main import app, AgenticPlaybook
from unittest.mock import patch

client = TestClient(app)

def test_health_check():
    """Verify backend heartbeat is operational"""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "pulsing"

@pytest.mark.asyncio
async def test_agentic_playbook_mock_fallback():
    """Verifies the Agentic Playbook gracefully functions in isolated offline CI mode"""
    # Create mock zone data
    zones = [
        {"id": "test_1", "name": "Test Zone", "occupancy": 9500, "capacity": 10000, "status": "CLEAR"}
    ]
    
    # We clear cache to ensure execution
    AgenticPlaybook._cache.clear()
    
    # Using the dependencies override to bypass the Firebase JWT security for strictly local test isolation
    response = client.post("/api/ai/playbook", json=zones, headers={"Authorization": "Bearer TEST_TOKEN"})
    
    assert response.status_code == 200
    data = response.json()["data"]
    
    assert "prediction" in data
    assert "playbook" in data
    assert "Simulation Mode" in data["prediction"] # Ensuring mock fallback successfully activated without real keys
