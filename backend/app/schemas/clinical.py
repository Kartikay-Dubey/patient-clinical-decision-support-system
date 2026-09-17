"""
Pydantic Schemas for Clinical Decision Support System API
Adheres strictly to the contract defined in frontend/API_CONTRACT.md.
"""

from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class SpatialCoordinates(BaseModel):
    x: float = 0.0
    y: float = 1.0
    z: float = 0.0


class BodyLocalization(BaseModel):
    primaryRegion: str = Field(
        ...,
        description="Main anatomical zone (Thorax, Head, Abdomen, Pelvis, Upper Limb, Lower Limb, Spine)"
    )
    secondaryRegions: List[str] = Field(
        default_factory=list,
        description="Secondary affected anatomical zones"
    )
    bodySystem: str = Field(
        ...,
        description="Physiological system classification (e.g., Cardiovascular / Respiratory)"
    )
    targetOrgan: Optional[str] = Field(
        None,
        description="Specific organ estimate (e.g., Heart / Lungs)"
    )
    spatialCoordinates: SpatialCoordinates = Field(
        default_factory=SpatialCoordinates,
        description="Spatial coordinates for 3D human body visualization"
    )


class ExtractedSymptom(BaseModel):
    id: str = Field(..., description="Unique symptom token ID")
    name: str = Field(..., description="Normalized display name of symptom")
    severity: str = Field("mild", description="Symptom severity (mild / moderate / severe)")
    category: str = Field("general", description="Physiological system category")
    matched_phrase: Optional[str] = Field(None, description="Original text fragment matched")
    confidence_score: Optional[float] = Field(None, description="Confidence score of NLP extraction")


class PossibleCondition(BaseModel):
    id: str = Field(..., description="Unique condition identifier")
    name: str = Field(..., description="Clinical condition name (non-diagnostic title)")
    icd10Code: str = Field(..., description="ICD-10 clinical classification code")
    modelScore: float = Field(..., description="Predicted probability (0.00 - 1.00)")
    confidenceCategory: str = Field(..., description="Confidence tier: High, Moderate, or Low")
    description: str = Field(..., description="Clinical summary and pathobiology of the condition")
    supportingSymptoms: List[str] = Field(
        default_factory=list,
        description="Extracted symptoms that support this candidate condition"
    )
    severity: Optional[int] = Field(None, description="DDXPlus clinical urgency level (1=emergency to 5=minor)")


class HomeRemedy(BaseModel):
    title: str
    instructions: str
    icon: Optional[str] = "sparkles"


class Storyline(BaseModel):
    patientOverview: str
    whyItHappens: List[str]
    precautions: List[str]
    redFlags: List[str]
    homeRemedies: List[HomeRemedy]
    careTimeline: Optional[str] = None


class ModelMetaData(BaseModel):
    version: str = "1.0.0"
    inferenceTimeMs: int = 0
    disclaimer: str = (
        "This analysis provides probabilistic clinical decision support only "
        "and does not constitute a confirmed diagnosis."
    )
    modelType: Optional[str] = "LogisticRegressionBaseline"
    totalFeatures: Optional[int] = 1213
    totalClasses: Optional[int] = 49
    lowConfidenceWarning: Optional[bool] = False


class AnalyzeRequest(BaseModel):
    rawSymptoms: str = Field(
        ...,
        description="Free-form clinical narrative provided by the patient"
    )
    structuredSymptoms: Optional[List[str]] = Field(
        default_factory=list,
        description="Optional list of tags or structured symptom tokens"
    )
    patientDemographics: Optional[Dict[str, Any]] = Field(
        None,
        description="Optional demographic details (age, sex)"
    )
    age: Optional[int] = Field(45, ge=0, le=120, description="Patient age in years")
    sex: Optional[str] = Field("M", description="Patient biological sex ('M' or 'F')")
    topK: Optional[int] = Field(5, ge=1, le=20, description="Number of candidate conditions to return")

    def model_post_init(self, __context: Any) -> None:
        if self.patientDemographics and isinstance(self.patientDemographics, dict):
            if "age" in self.patientDemographics and self.patientDemographics["age"] is not None:
                self.age = int(self.patientDemographics["age"])
            if "sex" in self.patientDemographics and self.patientDemographics["sex"]:
                self.sex = str(self.patientDemographics["sex"])


class AnalyzeResponse(BaseModel):
    status: str = Field("completed", description="Operational status of the request")
    timestamp: str = Field(..., description="ISO 8601 UTC timestamp of the analysis")
    extractedSymptoms: List[ExtractedSymptom] = Field(
        ...,
        description="Structured symptoms extracted via NLP evidence matcher"
    )
    bodyLocalization: BodyLocalization = Field(
        ...,
        description="Anatomical localization for 3D body viewer"
    )
    possibleConditions: List[PossibleCondition] = Field(
        ...,
        description="Ranked candidate conditions from ML diagnostic model"
    )
    icd10Code: str = Field(
        ...,
        description="ICD-10 code of top-ranked condition"
    )
    modelScore: float = Field(
        ...,
        description="Confidence score of top-ranked condition (0.00 - 1.00)"
    )
    confidenceCategory: str = Field(
        ...,
        description="Confidence category of top-ranked condition (High / Moderate / Low)"
    )
    supportingSymptoms: List[str] = Field(
        default_factory=list,
        description="Key supporting symptoms for top-ranked condition"
    )
    modelMetaData: ModelMetaData = Field(
        ...,
        description="Inference timing and model provenance metadata"
    )
    storyline: Optional[Storyline] = Field(
        None,
        description="Narrative patient overview, clinical rationale, red flags, and home remedies"
    )


class ErrorDetail(BaseModel):
    field: Optional[str] = None
    issue: str


class ErrorObject(BaseModel):
    code: str
    message: str
    details: Optional[List[ErrorDetail]] = None


class ErrorResponse(BaseModel):
    error: ErrorObject
