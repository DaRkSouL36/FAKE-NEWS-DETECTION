import joblib                                      # IMPORTING THE JOBLIB MODULE TO LOAD SAVED MODELS AND VECTORIZERS
from UTILS.SETTINGS import MODEL_PATH, TFIDF_PATH  # IMPORTING THE PATHS FOR MODEL AND TFIDF VECTORIZER FROM SETTINGS
from UTILS.LOGGER import logger                    # IMPORTING THE LOGGER FOR LOGGING MESSAGES

# FUNCTION TO LOAD THE MODEL AND THE VECTORIZER FROM THE SPECIFIED PATHS
def load_model_and_vectorizer():
    try:
        # ATTEMPTING TO LOAD THE SAVED MODEL USING THE MODEL_PATH
        model = joblib.load(MODEL_PATH)  
        
        # ATTEMPTING TO LOAD THE SAVED TF-IDF VECTORIZER USING THE TFIDF_PATH
        vectorizer = joblib.load(TFIDF_PATH)  
        
        logger.info("MODEL AND VECTORIZER LOADED SUCCESSFULLY.")  
        
        # RETURNING BOTH THE MODEL AND VECTORIZER
        return model, vectorizer  
    
    except Exception as e:
        # CATCHING EXCEPTIONS IF THERE IS AN ERROR IN LOADING THE MODEL OR VECTORIZER
        logger.error(f"ERROR LOADING MODEL/VECTORIZER --> {e}")     
        
        raise  