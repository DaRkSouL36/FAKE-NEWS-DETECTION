from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, conint
from supabase import create_client, Client
from dotenv import load_dotenv
from pathlib import Path
import os

# IMPORT FEEDBACK SERVICE
from SERVICES.FEEDBACK_SERVICE import FeedbackService

# LOAD ENVIRONMENT VARIABLES FROM .env FILE
dotenv_path = Path(__file__).parent.parent / "UTILS" / ".env"
load_dotenv(dotenv_path=dotenv_path)

# LOAD SUPABASE URL AND KEY FROM ENVIRONMENT VARIABLES FOR SECURITY
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

# INITIALIZE SUPABASE CLIENT
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# INITIALIZE FEEDBACK SERVICE WITH SUPABASE CLIENT
feedback_service = FeedbackService(supabase)

# DATA MODEL FOR FEEDBACK
class FeedbackRequest(BaseModel):
    rating: conint(ge=1, le=5)  
    liked_feedback: str
    improvement_feedback: str


# ROUTER SETUP
router = APIRouter(prefix="/feedback", tags=["FEEDBACK"])


@router.post(
    "/submit", summary="SUBMIT USER FEEDBACK", status_code=status.HTTP_201_CREATED
)
async def submit_feedback(feedback: FeedbackRequest):
    """
    STORES USER FEEDBACK IN THE SUPABASE DATABASE.
    - RATING: SATISFACTION SCORE (1-5)
    - LIKED_FEEDBACK: WHAT THE USER LIKED
    - IMPROVEMENT_FEEDBACK: SUGGESTED IMPROVEMENTS
    """
    try:
        feedback_data = {
            "rating": feedback.rating,
            "liked_feedback": feedback.liked_feedback,
            "improvement_feedback": feedback.improvement_feedback,
        }

        # USE THE FEEDBACK SERVICE TO SUBMIT FEEDBACK
        response = feedback_service.submit_feedback(feedback_data)

        if not response.data:
            print("ERROR: FAILED TO STORE FEEDBACK IN DATABASE.")
            raise HTTPException(status_code=500, detail="FAILED TO STORE FEEDBACK")

        print("SUCCESS: FEEDBACK SUBMITTED.")
        return {"STATUS": "SUCCESS", "MESSAGE": "FEEDBACK SUBMITTED!"}

    except Exception as e:
        print(f"ERROR: SUPABASE EXCEPTION OCCURRED - {str(e)}")
        raise HTTPException(status_code=500, detail=f"SUPABASE ERROR: {str(e)}")
