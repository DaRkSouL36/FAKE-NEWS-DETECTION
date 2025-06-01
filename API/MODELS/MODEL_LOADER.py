import joblib                                              # IMPORTING THE JOBLIB MODULE TO LOAD SAVED MODELS AND VECTORIZERS
from tensorflow.keras.models import load_model             # IMPORTING KERAS load_model TO LOAD DEEP LEARNING MODELS
from UTILS.SETTINGS import MODEL_PATHS, TFIDF_PATH         # IMPORTING THE DICTIONARY OF MODEL PATHS AND THE SINGLE TF-IDF VECTORIZER PATH
from UTILS.LOGGER import logger                            # IMPORTING THE LOGGER FOR LOGGING MESSAGES

# FUNCTION TO LOAD MULTIPLE MODELS AND A SINGLE TF-IDF VECTORIZER FROM THE SPECIFIED PATHS
def load_models_and_vectorizer():
    models = {}                                            # INITIALIZING AN EMPTY DICTIONARY TO STORE LOADED MODELS
    try:
        # ITERATING THROUGH THE MODEL_PATHS DICTIONARY TO LOAD EACH MODEL
        for model_name, path in MODEL_PATHS.items():
            if path.endswith(".pkl"):
                models[model_name] = joblib.load(path)     # LOADING MACHINE LEARNING MODELS SAVED IN .PKL FORMAT
            elif path.endswith(".h5"):
                models[model_name] = load_model(path)      # LOADING DEEP LEARNING MODELS SAVED IN .H5 FORMAT
        
        vectorizer = joblib.load(TFIDF_PATH)               # LOADING THE SHARED TF-IDF VECTORIZER FROM THE SPECIFIED PATH

        logger.info("ALL MODELS AND SHARED VECTORIZER LOADED SUCCESSFULLY.")  # LOGGING SUCCESS MESSAGE
        
        return models, vectorizer                          # RETURNING THE DICTIONARY OF MODELS AND THE SINGLE VECTORIZER
    
    except Exception as e:
        # CATCHING EXCEPTIONS IF THERE IS AN ERROR WHILE LOADING ANY MODEL OR THE VECTORIZER
        logger.error(f"ERROR LOADING MODELS/VECTORIZER --> {e}")      
        
        raise                                              # RE-RAISING THE EXCEPTION TO BE HANDLED BY THE CALLER
