"""
FastAPI Endpoint for Patient Clinical Symptom Analysis
Endpoint: POST /api/v1/analyze
"""

from fastapi import APIRouter, HTTPException, status
from backend.app.schemas.clinical import (
    AnalyzeRequest,
    AnalyzeResponse,
    ErrorResponse
)
from backend.app.services.clinical_adapter import process_clinical_analysis

router = APIRouter(prefix="/api/v1", tags=["Clinical Analysis"])


@router.post(
    "/analyze",
    response_model=AnalyzeResponse,
    status_code=status.HTTP_200_OK,
    summary="Analyze Free-Form Patient Symptoms",
    description=(
        "Converts free-form patient symptom text into structured DDXPlus evidence tokens, "
        "runs supervised baseline ML model inference, and returns ranked differential diagnosis candidates, "
        "ICD-10 codes, anatomical localizations, and patient storylines."
    ),
    responses={
        200: {
            "description": "Successful diagnostic analysis",
            "model": AnalyzeResponse
        },
        400: {
            "description": "Invalid input (e.g. empty symptom text)",
            "model": ErrorResponse
        },
        422: {
            "description": "No recognized clinical evidence could be extracted",
            "model": ErrorResponse
        },
        500: {
            "description": "Internal model inference failure",
            "model": ErrorResponse
        }
    }
)
async def analyze_symptoms(request: AnalyzeRequest) -> AnalyzeResponse:
    """
    Primary endpoint for symptom analysis and clinical decision support.
    """
    return process_clinical_analysis(request)
