"""
Main FastAPI Application Entrypoint for Patient Clinical Decision Support System.
Provides RESTful APIs for NLP evidence extraction, ML diagnostic prediction, and 3D anatomical localization.
"""

from contextlib import asynccontextmanager
from typing import Dict, Any
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException

from backend.app.api.v1.analyze import router as analyze_router
from backend.app.services.clinical_adapter import get_clinical_service


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan manager.
    Pre-warms the ClinicalDiagnosisService (loads TF-IDF vectorizer, label encoder, and ML baseline)
    at startup so that the first API request executes with zero cold-start delay.
    """
    print("[FastAPI Startup] Initializing ClinicalDiagnosisService & ML Diagnostic Models...")
    service = get_clinical_service()
    print(f"[FastAPI Startup] Clinical model ready. Loaded {len(service.predictor.label_encoder.classes_)} pathologies.")
    yield
    print("[FastAPI Shutdown] Diagnostic service shutting down.")


app = FastAPI(
    title="Clinical Decision Support System API",
    description=(
        "Production-grade Clinical Decision Support System API powered by DDXPlus dataset, "
        "supervised clinical ML diagnostics, NLP evidence extraction, and 3D anatomical mapping."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# Enable CORS for frontend local development (Vite @ http://localhost:5173 or similar)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API v1 routes
app.include_router(analyze_router)


# Custom Exception Handlers for strictly matching API_CONTRACT.md error formats
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Formats Pydantic validation errors according to the API contract error schema."""
    details = []
    for err in exc.errors():
        field_name = " -> ".join(str(loc) for loc in err.get("loc", []))
        details.append({
            "field": field_name,
            "issue": err.get("msg", "Invalid parameter")
        })
    
    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,
        content={
            "error": {
                "code": "INVALID_INPUT",
                "message": "Input validation failed. Please provide valid symptom data.",
                "details": details
            }
        }
    )


@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    """Passes through or formats standard HTTP exceptions."""
    if isinstance(exc.detail, dict) and "error" in exc.detail:
        return JSONResponse(status_code=exc.status_code, content=exc.detail)
    
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": {
                "code": f"HTTP_{exc.status_code}",
                "message": str(exc.detail)
            }
        }
    )


@app.get("/health", tags=["System Health"])
async def health_check() -> Dict[str, Any]:
    """Health check probe for container and service monitoring."""
    service = get_clinical_service()
    return {
        "status": "healthy",
        "service": "Clinical Decision Support System",
        "version": "1.0.0",
        "classes_loaded": len(service.predictor.label_encoder.classes_),
        "features_loaded": service.predictor.feature_extractor.num_features
    }


@app.get("/", tags=["System Health"])
async def root() -> Dict[str, str]:
    """Root redirect / information endpoint."""
    return {
        "message": "Clinical Decision Support System API is running.",
        "documentation": "/docs",
        "analyze_endpoint": "/api/v1/analyze"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host="0.0.0.0", port=8000, reload=True)
