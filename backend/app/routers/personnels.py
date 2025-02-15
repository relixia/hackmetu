from fastapi import APIRouter, HTTPException, BackgroundTasks
from app.database import supabase
from app.models import PersonnelModel

router = APIRouter()

@router.get("/fetch-personnel/{personnel_id}")
async def fetch_personnel(personnel_id: int):
    try:
        personnel = supabase.table("Personnels").select('*').eq("id", personnel_id).execute()
        if not personnel.data:
            raise HTTPException(status_code=404, detail="Personnel not found")
        return personnel.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Supabase query failed: {str(e)}")

@router.get("/fetch-personnels")
async def fetch_personnels():
    try:
        personnels = supabase.table("Personnels").select('*').execute()
        return personnels.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Supabase query failed: {str(e)}")

@router.post("/create-personnel")
async def create_personnel(personnel: PersonnelModel):
    try:
        new_personnel = supabase.table("Personnels").insert(personnel.dict()).execute()
        return new_personnel.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Supabase query failed: {str(e)}")
    
@router.delete("/delete-personnel/{personnel_id}")
async def delete_personnel(personnel_id: int):
    try:
        personnel = supabase.table("Personnels").delete().eq("id", personnel_id).execute()
        if not personnel.data:
            raise HTTPException(status_code=404, detail="Personnel not found")
        return personnel.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Supabase query failed: {str(e)}")

@router.put("/update-personnel/{personnel_id}")
async def update_personnel(personnel_id: int, personnel: PersonnelModel):
    try:
        updated_personnel = supabase.table("Personnels").update(personnel.dict()).eq("id", personnel_id).execute()
        if not updated_personnel.data:
            raise HTTPException(status_code=404, detail="Personnel not found")
        return updated_personnel.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Supabase query failed: {str(e)}")
