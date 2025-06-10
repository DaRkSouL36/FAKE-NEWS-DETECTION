class FeedbackService:
    # INITIALIZE THE FEEDBACK SERVICE WITH A SUPABASE CLIENT INSTANCE
    def __init__(self, supabase_client):
        self.supabase = supabase_client

    # METHOD TO SUBMIT FEEDBACK DATA TO THE "FEEDBACK" TABLE IN SUPABASE
    def submit_feedback(self, feedback_data: dict):
        # INSERT THE FEEDBACK DATA DICTIONARY INTO THE "FEEDBACK" TABLE AND EXECUTE THE QUERY
        response = self.supabase.table("FEEDBACK").insert(feedback_data).execute()
        # RETURN THE RESPONSE FROM SUPABASE AFTER INSERTION
        return response
