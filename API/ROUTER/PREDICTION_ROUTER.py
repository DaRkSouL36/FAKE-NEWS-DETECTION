from fastapi import APIRouter, HTTPException               # IMPORTS APIRouter AND HTTPException FOR ROUTE HANDLING AND ERROR RESPONSES
from pydantic import BaseModel                             # IMPORTS BaseModel FOR REQUEST INPUT VALIDATION
from MODELS.MODEL_LOADER import load_models_and_vectorizer # IMPORTS FUNCTION TO LOAD ML MODELS AND VECTORIZER
from MODELS.PREDICTION import predict_news                 # IMPORTS NEWS CLASSIFICATION FUNCTION
from UTILS.LOGGER import logger                            # IMPORTS CUSTOM LOGGER FOR EVENT TRACKING
from SERVICES.LLM_EXPLAINER import LLMExplainer            # IMPORTS LLM-BASED EXPLANATION GENERATOR

# DEFINES THE REQUEST BODY STRUCTURE FOR THE /PREDICT ENDPOINT
class NewsInput(BaseModel):
    text: str                                               # FIELD FOR NEWS ARTICLE TEXT INPUT
    model: str                                              # FIELD TO SPECIFY ML MODEL SELECTION

# LOADS ALL TRAINED MODELS AND SHARED VECTORIZER DURING APPLICATION STARTUP
models, vectorizer = load_models_and_vectorizer()           # RETURNS DICTIONARY OF MODELS AND TF-IDF VECTORIZER
llm_explainer = LLMExplainer()                              # INITIALIZES LLM EXPLAINER SINGLETON

# CREATES FASTAPI ROUTER INSTANCE FOR PREDICTION-RELATED ENDPOINTS
router = APIRouter(tags=["PREDICTION"])                     # GROUPS ROUTES UNDER "PREDICTION" TAG IN SWAGGER UI

# DEFINES THE /PREDICT ENDPOINT FOR NEWS VERACITY ANALYSIS
@router.post("/PREDICT")
def analyze_news(data: NewsInput):
    """
    HANDLES NEWS ARTICLE CLASSIFICATION AND EXPLANATION GENERATION.
    
    PROCESS FLOW:
    1. VALIDATE MODEL SELECTION
    2. CLASSIFY ARTICLE USING SELECTED MODEL
    3. GENERATE AI EXPLANATION
    4. RETURN STRUCTURED RESPONSE
    """
    try:
        # LOGS INCOMING REQUEST DETAILS FOR AUDITING
        logger.info(f"PREDICTION REQUEST RECEIVED FOR MODEL: {data.model}")
        
        # VALIDATES IF REQUESTED MODEL EXISTS IN LOADED MODELS
        if data.model not in models:
            raise HTTPException(status_code=400, detail="MODEL NOT SUPPORTED")  # REJECTS INVALID MODEL REQUESTS
        
        model = models[data.model]                          # RETRIEVES SELECTED MODEL FROM LOADED MODELS

        # EXECUTES NEWS CLASSIFICATION WITH SELECTED MODEL AND VECTORIZER
        result = predict_news(data.text, model, vectorizer) # RETURNS PREDICTION AND CONFIDENCE
        
        # VALIDATES PRESENCE OF PREDICTION KEY IN RESULT
        if "PREDICTION" not in result:
            raise HTTPException(500, detail="CLASSIFICATION FAILED")  # HANDLES MALFORMED CLASSIFICATION OUTPUT
        
        # ENSURES PREDICTION VALUE IS VALID ('REAL'/'FAKE')
        if result["PREDICTION"] not in ["REAL", "FAKE"]:
            raise HTTPException(500, detail="INVALID PREDICTION LABEL")  # PREVENTS INCONSISTENT EXPLANATIONS
        
        # GENERATES HUMAN-READABLE EXPLANATION USING LLM
        explanation = llm_explainer.explain(data.text, result["PREDICTION"])
        
        # FALLBACK FOR EMPTY LLM OUTPUT
        if not explanation.strip():
            logger.error("LLM EXPLANATION EMPTY")
            explanation = "AI EXPLANATION UNAVAILABLE!"
        
        # ENSURES EXPLANATION CONTAINS STANDARD DISCLAIMER
        if "(SOURCE:" not in explanation:
            explanation += " (SOURCE: AI FACT-CHECKING SYSTEM)"
        
        # ADDS EXPLANATION TO FINAL RESPONSE PAYLOAD
        result["EXPLANATION"] = explanation
        logger.info(f"FULL RESPONSE: {result}")             # LOGS COMPLETE RESPONSE FOR DEBUGGING
        
        return result                                       # RETURNS STRUCTURED JSON RESPONSE
    
    except HTTPException as he:
        raise he                                            # PROPAGATES CONTROLLED HTTP ERRORS
    
    except Exception as e:
        # LOGS UNEXPECTED ERRORS WITH STACK TRACE
        logger.error(f"PREDICTION FAILED: {str(e)}", exc_info=True)
        raise HTTPException(500, detail="PREDICTION ERROR") from e  # RETURNS GENERIC ERROR TO CLIENT
