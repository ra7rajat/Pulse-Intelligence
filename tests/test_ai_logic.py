import pytest
from server.main import analyze_zones_internal, ZoneRequest

def test_analyze_zones_internal_critical_threshold():
    """Verify that zones exceeding 90% occupancy are identified as CRITICAL."""
    # Mapping to ZoneRequest model
    zone = ZoneRequest(id="z1", name="North Stand", occupancy=950, capacity=1000)
    result = analyze_zones_internal([zone])
    assert result[0].status == "CRITICAL"

def test_analyze_zones_internal_moderate_threshold():
    """Verify that zones between 50% and 90% occupancy are tagged as MODERATE."""
    zone = ZoneRequest(id="z2", name="South Stand", occupancy=600, capacity=1000)
    result = analyze_zones_internal([zone])
    assert result[0].status == "MODERATE"

def test_analyze_zones_internal_clear_threshold():
    """Verify that zones below 50% occupancy remain CLEAR."""
    zone = ZoneRequest(id="z3", name="Executive Boxes", occupancy=100, capacity=1000)
    result = analyze_zones_internal([zone])
    assert result[0].status == "CLEAR"
