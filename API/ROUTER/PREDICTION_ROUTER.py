from fastapi import APIRouter, HTTPException                                 # IMPORTING APIRouter FOR ROUTING AND HTTPException FOR HANDLING HTTP ERRORS
from pydantic import BaseModel                                               # IMPORTING BaseModel FROM Pydantic TO DEFINE THE INPUT DATA SCHEMA
from MODELS.MODEL_LOADER import load_models_and_vectorizers                  # IMPORTING THE FUNCTION TO LOAD MULTIPLE MODELS AND THEIR VECTORIZERS
from MODELS.PREDICTION import predict_news                                   # IMPORTING THE FUNCTION RESPONSIBLE FOR MAKING PREDICTIONS
from UTILS.LOGGER import logger                                              # IMPORTING LOGGER FOR LOGGING EVENTS AND ERRORS

# DEFINING THE INPUT SCHEMA FOR THE PREDICTION ENDPOINT
class NewsInput(BaseModel):
    text: str                                                                # DEFINING A FIELD TO ACCEPT THE INPUT TEXT
    model: str                                                               # DEFINING A FIELD TO SPECIFY WHICH MODEL TO USE FOR PREDICTION

# LOADING ALL AVAILABLE MODELS AND TF-IDF VECTORIZERS AT API STARTUP
models, vectorizers = load_models_and_vectorizers()                          # STORING MODELS AND VECTORIZERS IN DICTIONARIES FOR LATER ACCESS

# CREATING A NEW ROUTER INSTANCE FOR HANDLING PREDICTION REQUESTS
router = APIRouter(tags=["PREDICTION"])

# DEFINING THE ENDPOINT FOR MAKING PREDICTIONS
@router.post("/PREDICT")
def get_prediction(data: NewsInput):
    try:
        logger.info(f"PREDICTION REQUEST RECEIVED FOR MODEL: {data.model}")  # LOGGING THAT A PREDICTION REQUEST HAS BEEN RECEIVED FOR A SPECIFIC MODEL
        
        # CHECKING IF THE REQUESTED MODEL IS AVAILABLE
        if data.model not in models:
            raise HTTPException(status_code=400, detail="MODEL NOT SUPPORTED")  # RAISING AN ERROR IF THE REQUESTED MODEL IS NOT FOUND
        
        # RETRIEVING THE SPECIFIED MODEL AND ITS CORRESPONDING VECTORIZER
        model = models[data.model]
        vectorizer = vectorizers[data.model]
        
        result = predict_news(data.text, model, vectorizer)                  # CALLING THE PREDICTION FUNCTION WITH INPUT TEXT, MODEL, AND VECTORIZER
        return result                                                        # RETURNING THE PREDICTION RESULT
        
    except HTTPException as he:
        raise he                                                             # RAISING THE HTTP ERROR IF IT WAS MANUALLY TRIGGERED ABOVE
    
    except Exception as e:
        logger.error(f"PREDICTION FAILED --> {e}")                           # LOGGING UNEXPECTED ERRORS DURING PREDICTION
        raise HTTPException(status_code=500, detail="PREDICTION ERROR")      # RAISING A 500 ERROR FOR INTERNAL FAILURES
