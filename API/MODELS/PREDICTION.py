# FUNCTION TO PREDICT THE NEWS AS "REAL" OR "FAKE" BASED ON THE INPUT TEXT
def predict_news(text, model, vectorizer):
    
    # TRANSFORMING THE INPUT TEXT USING THE VECTORIZER TO CONVERT IT INTO A FORMAT THAT CAN BE PASSED TO THE MODEL
    transformed = vectorizer.transform([text])
    
    # MAKING PREDICTION USING THE MODEL AND GETTING THE CLASS LABEL (1 = REAL, 0 = FAKE)
    prediction = model.predict(transformed)[0]  
    
    # GETTING THE CONFIDENCE PROBABILITY BASED ON MODEL TYPE (SKLEARN OR KERAS)
    if hasattr(model, "predict_proba"):
        # FOR SKLEARN MODELS: USE PREDICT_PROBA TO GET CLASS PROBABILITIES
        probability = model.predict_proba(transformed)[0].max()  
    else:
        # FOR KERAS/TENSORFLOW MODELS: USE PREDICT() AND EXTRACT PROBABILITY DIRECTLY
        # CONVERT SPARSE MATRIX TO DENSE ARRAY FOR KERAS COMPATIBILITY
        dense_data = transformed.toarray() if hasattr(transformed, "toarray") else transformed
        proba = model.predict(dense_data, verbose=0)[0][0] 
        probability = proba if prediction == 1 else 1 - proba  # CALCULATE CONFIDENCE BASED ON PREDICTED CLASS
    
    # RETURNING THE PREDICTION AND CONFIDENCE LEVEL (ROUNDED TO 4 DECIMAL PLACES)
    return {
        "PREDICTION": "REAL" if prediction == 1 else "FAKE",   # RETURNING THE PREDICTION AS "REAL" OR "FAKE"
        "CONFIDENCE": round(float(probability), 4)             # RETURNING THE CONFIDENCE LEVEL WITH 4 DECIMAL PLACES
    }
