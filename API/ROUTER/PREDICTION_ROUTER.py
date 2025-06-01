from fastapi import APIRouter, HTTPException                                 # IMPORTING APIRouter FOR ROUTING AND HTTPException FOR HANDLING HTTP ERRORS
from pydantic import BaseModel                                               # IMPORTING BaseModel FROM Pydantic TO DEFINE THE INPUT DATA SCHEMA
from MODELS.MODEL_LOADER import load_models_and_vectorizer                   # IMPORTING THE UPDATED FUNCTION TO LOAD MULTIPLE MODELS AND SINGLE VECTORIZER
from MODELS.PREDICTION import predict_news                                   # IMPORTING THE FUNCTION RESPONSIBLE FOR MAKING PREDICTIONS
from UTILS.LOGGER import logger                                              # IMPORTING LOGGER FOR LOGGING EVENTS AND ERRORS

# DEFINING THE INPUT SCHEMA FOR THE PREDICTION ENDPOINT
class NewsInput(BaseModel):
    text: str                                                                # DEFINING A FIELD TO ACCEPT THE INPUT TEXT
    model: str                                                               # DEFINING A FIELD TO SPECIFY WHICH MODEL TO USE FOR PREDICTION

# LOADING ALL AVAILABLE MODELS AND THE SHARED TF-IDF VECTORIZER AT API STARTUP
models, vectorizer = load_models_and_vectorizer()                            # STORING MODELS IN A DICTIONARY AND A SINGLE SHARED TF-IDF VECTORIZER

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
        
        model = models[data.model]                                           # RETRIEVING THE SPECIFIED MODEL

        # CALLING THE PREDICTION FUNCTION WITH INPUT TEXT, MODEL, AND THE SHARED VECTORIZER
        result = predict_news(data.text, model, vectorizer)                 # NOTE: DL MODELS MAY HANDLE RAW TEXT WITHOUT TF-IDF; HANDLING ASSUMED INSIDE predict_news()
        return result                                                        # RETURNING THE PREDICTION RESULT
        
    except HTTPException as he:
        raise he                                                             # RAISING THE HTTP ERROR IF IT WAS MANUALLY TRIGGERED ABOVE
    
    except Exception as e:
        logger.error(f"PREDICTION FAILED --> {e}")                           # LOGGING UNEXPECTED ERRORS DURING PREDICTION
        raise HTTPException(status_code=500, detail="PREDICTION ERROR")     # RAISING A 500 ERROR FOR INTERNAL FAILURES
