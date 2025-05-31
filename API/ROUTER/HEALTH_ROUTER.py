from fastapi import APIRouter                          # IMPORTING APIRouter TO DEFINE ROUTES FOR THE API
import datetime                                        # IMPORTING DATETIME MODULE TO GET THE CURRENT UTC TIME

# CREATING A NEW ROUTER INSTANCE FOR THE "HEALTH" ENDPOINT
router = APIRouter(tags=["HEALTH"])                    # CREATING A ROUTER WITH A TAG OF "HEALTH"

# DEFINING THE HEALTH CHECK ENDPOINT
@router.get("/HEALTH")
def health_check():
    # RETURNING THE HEALTH STATUS AND ADDITIONAL DETAILS
    return {
        "STATUS": "OK",                                # API STATUS IS OK
        "TIMESTAMP": datetime.datetime.utcnow(),       # CURRENT UTC TIMESTAMP
        "VERSION": "1.0"                               # API VERSION
    }