from fastapi import APIRouter, HTTPException               # IMPORTING APIRouter FOR CREATING ROUTES AND HTTPException FOR ERROR HANDLING
from pydantic import BaseModel                             # IMPORTING BaseModel FROM Pydantic TO DEFINE REQUEST BODY SCHEMAS
from MODELS.MODEL_LOADER import load_model_and_vectorizer  # IMPORTING THE FUNCTION TO LOAD MODEL AND VECTORIZER
from MODELS.PREDICTION import predict_news                 # IMPORTING THE FUNCTION THAT MAKES THE PREDICTION
from UTILS.LOGGER import logger                            # IMPORTING LOGGER FOR LOGGING MESSAGES

# DEFINE PREDICTION INPUT SCHEMA
class NewsInput(BaseModel):
    text: str  # DEFINING THE INPUT SCHEMA TO ACCEPT 'TEXT' AS THE PREDICTION INPUT

# LOAD MODELS ONCE AT STARTUP
model, vectorizer = load_model_and_vectorizer()  # LOADING THE MODEL AND VECTORIZER ONLY ONCE WHEN THE API STARTS

# CREATING A NEW ROUTER INSTANCE FOR THE PREDICTION ENDPOINT
router = APIRouter(tags=["PREDICTION"])  

# DEFINING THE PREDICTION ENDPOINT
@router.post("/PREDICT")
def get_prediction(data: NewsInput):
    try:
        logger.info("PREDICTION REQUEST RECEIVED")           # LOGGING THAT A PREDICTION REQUEST HAS BEEN RECEIVED
        result = predict_news(data.text, model, vectorizer)  # CALLING THE PREDICTION FUNCTION WITH THE INPUT TEXT AND LOADED MODEL
        return result  
    except Exception as e:
        logger.error(f"PREDICTION FAILED --> {e}")                          # LOGGING ERROR IF PREDICTION FAILS
        raise HTTPException(status_code=500, detail="PREDICTION ERROR")     # RAISING A 500 INTERNAL SERVER ERROR IF PREDICTION FAILS