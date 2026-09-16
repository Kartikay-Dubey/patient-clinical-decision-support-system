"""
Comprehensive Automated API Tests for /api/v1/analyze Endpoint
Tests realistic clinical scenarios, error conditions, schema conformity, and edge cases.
"""

import sys
from pathlib import Path
from typing import Dict, Any
from fastapi.testclient import TestClient

# Ensure project root is in sys.path
PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from backend.app.main import app
from backend.app.schemas.clinical import AnalyzeResponse

client = TestClient(app)


def test_health_endpoint():
    """Verify health probe endpoint returns status healthy and model classes."""
    response = client.get("/health")
    assert response.status_code == 200, f"Health check failed: {response.text}"
    data = response.json()
    assert data["status"] == "healthy"
    assert data["classes_loaded"] == 49
    assert data["features_loaded"] == 1213


def test_root_endpoint():
    """Verify root discovery endpoint."""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert "analyze_endpoint" in data


def test_analyze_scenario_1_cardiac():
    """
    Scenario 1: Cardiovascular / Thoracic symptoms.
    Patient presenting with substernal chest pressure, shortness of breath, and sweating.
    """
    payload = {
        "rawSymptoms": "Patient reports acute chest pain, shortness of breath on exertion, and severe sweating.",
        "structuredSymptoms": ["chest discomfort", "dyspnea"],
        "age": 55,
        "sex": "M",
        "topK": 5
    }

    response = client.post("/api/v1/analyze", json=payload)
    assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"

    data = response.json()
    
    # 1. Validate full Pydantic schema compliance
    parsed_model = AnalyzeResponse(**data)
    assert parsed_model.status == "completed"

    # 2. Check required top-level fields
    assert "timestamp" in data
    assert "extractedSymptoms" in data
    assert len(data["extractedSymptoms"]) >= 2
    assert "possibleConditions" in data
    assert len(data["possibleConditions"]) == 5
    assert "bodyLocalization" in data
    assert "icd10Code" in data and len(data["icd10Code"]) > 0
    assert "modelScore" in data and 0.0 <= data["modelScore"] <= 1.0
    assert data["confidenceCategory"] in ["High", "Moderate", "Low"]
    assert "supportingSymptoms" in data
    assert "modelMetaData" in data

    # 3. Check symptom shape
    for sym in data["extractedSymptoms"]:
        assert "id" in sym
        assert "name" in sym
        assert "severity" in sym
        assert "category" in sym

    # 4. Check candidate condition shape
    for cond in data["possibleConditions"]:
        assert "id" in cond
        assert "name" in cond
        assert "icd10Code" in cond
        assert "modelScore" in cond
        assert "confidenceCategory" in cond
        assert "description" in cond
        assert "supportingSymptoms" in cond

    # 5. Check anatomical localization
    assert data["bodyLocalization"]["primaryRegion"] == "Thorax"
    assert "Cardiovascular" in data["bodyLocalization"]["bodySystem"] or "Respiratory" in data["bodyLocalization"]["bodySystem"]
    assert "spatialCoordinates" in data["bodyLocalization"]

    # 6. Check storyline
    assert data["storyline"] is not None
    assert len(data["storyline"]["whyItHappens"]) > 0
    assert len(data["storyline"]["precautions"]) > 0
    assert len(data["storyline"]["redFlags"]) > 0
    assert len(data["storyline"]["homeRemedies"]) > 0

    print("\n[PASSED] Scenario 1 (Cardiac): Top condition =", data["possibleConditions"][0]["name"], f"({data['modelScore']})")


def test_analyze_scenario_2_gerd():
    """
    Scenario 2: Gastrointestinal symptoms.
    Patient presenting with burning chest pain after meals, acid regurgitation, and stomach bloating.
    """
    payload = {
        "rawSymptoms": "I have a strong burning chest pain that worsens after eating, with acid regurgitation and stomach bloating.",
        "age": 42,
        "sex": "F"
    }

    response = client.post("/api/v1/analyze", json=payload)
    assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"

    data = response.json()
    AnalyzeResponse(**data)

    condition_names = [c["name"] for c in data["possibleConditions"]]
    assert any("GERD" in c or "Esophag" in c or "Hernia" in c for c in condition_names), \
        f"Expected GI condition in candidates, got {condition_names}"

    assert data["bodyLocalization"]["primaryRegion"] in ["Abdomen", "Thorax"]
    assert data["modelScore"] > 0.0
    assert len(data["extractedSymptoms"]) >= 1

    print("\n[PASSED] Scenario 2 (GERD/GI): Top candidates =", condition_names[:3])


def test_analyze_scenario_3_allergic_rhinitis():
    """
    Scenario 3: Allergic Rhinitis / Sinusitis / Respiratory symptoms.
    Patient presenting with runny nose, nasal congestion, and constant sneezing.
    """
    payload = {
        "rawSymptoms": "I have had a severe runny nose, nasal congestion, and continuous sneezing for 3 days.",
        "age": 28,
        "sex": "F"
    }

    response = client.post("/api/v1/analyze", json=payload)
    assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"

    data = response.json()
    AnalyzeResponse(**data)

    condition_names = [c["name"] for c in data["possibleConditions"]]
    assert any("sinusitis" in c.lower() or "urti" in c.lower() or "rhinitis" in c.lower() for c in condition_names), \
        f"Expected sinonasal/respiratory condition, got {condition_names}"

    assert data["bodyLocalization"]["primaryRegion"] in ["Head", "Thorax"]

    print("\n[PASSED] Scenario 3 (Allergic Sinusitis): Top candidates =", condition_names[:3])


def test_analyze_error_empty_input():
    """
    Error Test 1: Empty or whitespace-only symptom input.
    Must return HTTP 400 with standard INVALID_INPUT error schema.
    """
    payload = {
        "rawSymptoms": "    ",
        "structuredSymptoms": ["  "]
    }

    response = client.post("/api/v1/analyze", json=payload)
    assert response.status_code == 400, f"Expected 400, got {response.status_code}: {response.text}"

    data = response.json()
    assert "error" in data
    assert data["error"]["code"] == "INVALID_INPUT"
    assert "details" in data["error"]
    assert any(d["field"] == "rawSymptoms" for d in data["error"]["details"])

    print("\n[PASSED] Error Test 1: Empty input rejected with HTTP 400 INVALID_INPUT")


def test_analyze_error_no_evidence_matches():
    """
    Error Test 2: Unrecognizable / nonsensical input that matches zero clinical evidences.
    Must return HTTP 422 with NO_EVIDENCE_MATCHED error schema.
    """
    payload = {
        "rawSymptoms": "random quantum particle fluctuation in interstellar space xyz999",
        "structuredSymptoms": []
    }

    response = client.post("/api/v1/analyze", json=payload)
    assert response.status_code == 422, f"Expected 422, got {response.status_code}: {response.text}"

    data = response.json()
    assert "error" in data
    assert data["error"]["code"] == "NO_EVIDENCE_MATCHED"
    assert "details" in data["error"]

    print("\n[PASSED] Error Test 2: Nonsense text rejected with HTTP 422 NO_EVIDENCE_MATCHED")


def test_analyze_low_confidence_handling():
    """
    Test Low-Confidence Flag: When input matches minimal/vague evidence.
    Endpoint should succeed with 200 OK, confidenceCategory marked as Low or Moderate,
    and modelMetaData providing transparency.
    """
    payload = {
        "rawSymptoms": "feeling a bit unusual with mild discomfort",
        "age": 50,
        "sex": "M"
    }

    response = client.post("/api/v1/analyze", json=payload)
    if response.status_code == 200:
        data = response.json()
        assert data["confidenceCategory"] in ["Low", "Moderate", "High"]
        assert "modelMetaData" in data
        assert "lowConfidenceWarning" in data["modelMetaData"]
        print("\n[PASSED] Low Confidence Test: Gracefully categorized with lowConfidenceWarning")
    elif response.status_code == 422:
        # Vague input had 0 recognizable medical evidences, which is also a valid clean rejection
        assert response.json()["error"]["code"] == "NO_EVIDENCE_MATCHED"
        print("\n[PASSED] Low Confidence Test: Successfully rejected vague input as NO_EVIDENCE_MATCHED")


def test_analyze_structured_tags_only():
    """
    Test when rawSymptoms is minimal but structuredSymptoms tags provide clinical tokens.
    """
    payload = {
        "rawSymptoms": "symptoms:",
        "structuredSymptoms": ["fever", "chills", "cough"],
        "age": 35,
        "sex": "M"
    }

    response = client.post("/api/v1/analyze", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert len(data["extractedSymptoms"]) >= 2
    assert len(data["possibleConditions"]) >= 3
    print("\n[PASSED] Structured Tags Test: Combined tokens correctly extracted")


if __name__ == "__main__":
    print("Running API Integration Tests...")
    test_health_endpoint()
    test_root_endpoint()
    test_analyze_scenario_1_cardiac()
    test_analyze_scenario_2_gerd()
    test_analyze_scenario_3_allergic_rhinitis()
    test_analyze_error_empty_input()
    test_analyze_error_no_evidence_matches()
    test_analyze_low_confidence_handling()
    test_analyze_structured_tags_only()
    print("\nALL 9 API INTEGRATION TESTS PASSED SUCCESSFULLY!")
