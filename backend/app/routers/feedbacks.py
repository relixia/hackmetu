from fastapi import APIRouter, Depends, HTTPException
from app.database import supabase
from app.models import FeedbackModel

router = APIRouter()

@router.get("/fetch-feedback/{feedback_id}")
async def fetch_feedback(feedback_id: int):
    try:
        feedback = supabase.table("Feedbacks").select('*').eq("id", feedback_id).execute()
        if not feedback.data:
            raise HTTPException(status_code=404, detail="Feedback not found")
        return feedback.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Supabase query failed: {str(e)}")

@router.get("/fetch-feedbacks")
async def fetch_feedbacks():
    try:
        feedbacks = supabase.table("Feedbacks").select('*').execute()
        return feedbacks.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Supabase query failed: {str(e)}")

@router.post("/create-feedback")
async def create_feedback(feedback: FeedbackModel):
    try:
        new_feedback = supabase.table("Feedbacks").insert(feedback.dict()).execute()
        return new_feedback.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Supabase query failed: {str(e)}")

@router.delete("/delete-feedback/{feedback_id}")
async def delete_feedback(feedback_id: int):
    try:
        feedback = supabase.table("Feedbacks").delete().eq("id", feedback_id).execute()
        if not feedback.data:
            raise HTTPException(status_code=404, detail="Feedback not found")
        return feedback.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Supabase query failed: {str(e)}")

