from fastapi import APIRouter, HTTPException, BackgroundTasks
from app.database import supabase
from app.models import AdminModel

router = APIRouter()

@router.get("/fetch-admin/{admin_id}")
async def fetch_admin(admin_id: int):
    try:
        admin = supabase.table("Admins").select('*').eq("id", admin_id).execute()
        if not admin.data:
            raise HTTPException(status_code=404, detail="Admin not found")
        return admin.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Supabase query failed: {str(e)}")

@router.get("/fetch-admins")
async def fetch_admins():
    try:
        admins = supabase.table("Admins").select('*').execute()
        return admins.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Supabase query failed: {str(e)}")

@router.post("/create-admin")
async def create_admin(admin: AdminModel):
    try:
        new_admin = supabase.table("Admins").insert(admin.dict()).execute()
        return new_admin.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Supabase query failed: {str(e)}")

@router.delete("/delete-admin/{admin_id}")
async def delete_admin(admin_id: int):
    try:
        admin = supabase.table("Admins").delete().eq("id", admin_id).execute()
        if not admin.data:
            raise HTTPException(status_code=404, detail="Admin not found")
        return admin.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Supabase query failed: {str(e)}")

@router.put("/update-admin/{admin_id}")
async def update_admin(admin_id: int, admin: AdminModel):
    try:
        updated_admin = supabase.table("Admins").update(admin.dict()).eq("id", admin_id).execute()
        if not updated_admin.data:
            raise HTTPException(status_code=404, detail="Admin not found")
        return updated_admin.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Supabase query failed: {str(e)}")