from fastapi import APIRouter, HTTPException               # IMPORTS APIRouter FOR ROUTE HANDLING AND HTTPException FOR ERROR RESPONSES
from pydantic import BaseModel                             # IMPORTS BaseModel TO DEFINE REQUEST SCHEMA FOR INPUT VALIDATION
from MODELS.MODEL_LOADER import load_models_and_vectorizer # IMPORTS FUNCTION TO LOAD ALL TRAINED MODELS AND A SHARED TF-IDF VECTORIZER
from MODELS.PREDICTION import predict_news                 # IMPORTS THE FUNCTION THAT HANDLES TEXT CLASSIFICATION
from UTILS.LOGGER import logger                            # IMPORTS A CUSTOM LOGGER FOR TRACKING EVENTS AND ERRORS
from SERVICES.LLM_EXPLAINER import LLMExplainer            # IMPORTS THE LLM-BASED EXPLANATION GENERATOR CLASS

# DEFINES THE EXPECTED REQUEST BODY SCHEMA FOR THE /PREDICT ENDPOINT
class NewsInput(BaseModel):
    text: str                                               # FIELD TO RECEIVE THE NEWS ARTICLE TEXT
    model: str                                              # FIELD TO SPECIFY WHICH MODEL TO USE FOR PREDICTION

# LOADS ALL AVAILABLE MODELS AND A SHARED TF-IDF VECTORIZER AT APPLICATION STARTUP
models, vectorizer = load_models_and_vectorizer()           # RETURNS A DICTIONARY OF MODELS AND ONE SHARED VECTORIZER
llm_explainer = LLMExplainer()                              # INITIALIZES THE LLM EXPLAINER ONCE TO AVOID REPEATED LOADING

# CREATES A FASTAPI ROUTER INSTANCE UNDER THE TAG "PREDICTION"
router = APIRouter(tags=["PREDICTION"])

# DEFINES THE /PREDICT ENDPOINT THAT HANDLES TEXT CLASSIFICATION REQUESTS
@router.post("/PREDICT")
def get_prediction(data: NewsInput):
    try:
        # LOGS THE INCOMING REQUEST AND SPECIFIED MODEL NAME
        logger.info(f"PREDICTION REQUEST RECEIVED FOR MODEL: {data.model}")
        
        # VALIDATES IF THE REQUESTED MODEL EXISTS IN THE LOADED MODELS
        if data.model not in models:
            raise HTTPException(status_code=400, detail="MODEL NOT SUPPORTED")  # RETURNS A 400 ERROR IF MODEL IS INVALID
        
        model = models[data.model]  # RETRIEVES THE SELECTED MODEL FROM THE DICTIONARY

        # CALLS THE PREDICTION FUNCTION WITH TEXT INPUT, SELECTED MODEL, AND THE SHARED VECTORIZER
        result = predict_news(data.text, model, vectorizer)  # HANDLES BOTH TRADITIONAL ML AND DL MODELS (ASSUMED INTERNALLY)

        # GENERATES AN AI-BASED EXPLANATION USING THE LLM BASED ON THE PREDICTION RESULT
        explanation = llm_explainer.explain(data.text, result["PREDICTION"])
        result["EXPLANATION"] = explanation  # ADDS THE EXPLANATION TO THE RESPONSE PAYLOAD

        return result  # RETURNS THE FINAL PREDICTION OUTPUT INCLUDING THE EXPLANATION
    
    except HTTPException as he:
        raise he  # RETHROWS ANY EXPLICITLY RAISED HTTP EXCEPTIONS (E.G., INVALID MODEL)
    
    except Exception as e:
        # LOGS UNEXPECTED ERRORS DURING THE PREDICTION PROCESS
        logger.error(f"PREDICTION FAILED --> {e}")
        raise HTTPException(status_code=500, detail="PREDICTION ERROR")  # RETURNS A 500 ERROR FOR UNHANDLED FAILURES
