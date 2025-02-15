from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from app.database import supabase
from app.models import FloorModel

router = APIRouter()

@router.get("/fetch-floor/{floor_id}")
async def fetch_floor(floor_id: int):
    try:
        floor = supabase.table("Floors").select('*').eq("id", floor_id).execute()
        if not floor.data:
            raise HTTPException(status_code=404, detail="Floor not found")
        return floor.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Supabase query failed: {str(e)}")

@router.get("/fetch-floors")
async def fetch_floors():
    try:
        floors = supabase.table("Floors").select('*').execute()
        return floors.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Supabase query failed: {str(e)}")

@router.post("/create-floor")
async def create_floor(floor: FloorModel):
    try:
        new_floor = supabase.table("Floors").insert(floor.dict()).execute()
        return new_floor.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Supabase query failed: {str(e)}")

@router.delete("/delete-floor/{floor_id}")
async def delete_floor(floor_id: int):
    try:
        floor = supabase.table("Floors").delete().eq("id", floor_id).execute()
        if not floor.data:
            raise HTTPException(status_code=404, detail="Floor not found")
        return floor.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Supabase query failed: {str(e)}")

@router.put("/update-floor/{floor_id}")
async def update_floor(floor_id: int, floor: FloorModel):
    try:
        updated_floor = supabase.table("Floors").update(floor.dict()).eq("id", floor_id).execute()
        if not updated_floor.data:
            raise HTTPException(status_code=404, detail="Floor not found")
        return updated_floor.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Supabase query failed: {str(e)}")
