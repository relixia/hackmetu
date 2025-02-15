# app/database.py
from supabase import create_client, Client
from fastapi import HTTPException
from app.config import SUPABASE_URL, SUPABASE_KEY

def get_supabase_client() -> Client:
    try:
        return create_client(SUPABASE_URL, SUPABASE_KEY)
    except Exception as e:
        print(f"[ERROR] Supabase Initialization Failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to initialize Supabase: {str(e)}")

# Initialize the Supabase client
supabase: Client = get_supabase_client()