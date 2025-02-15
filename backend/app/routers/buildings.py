from fastapi import APIRouter, HTTPException, BackgroundTasks
from app.database import supabase
from app.models import BuildingModel

router = APIRouter()

@router.get("/fetch-building/{building_id}")
async def fetch_building(building_id: int):
    try:
        building = supabase.table("Buildings").select('*').eq("id", building_id).execute()
        if not building.data:
            raise HTTPException(status_code=404, detail="Building not found")
        return building.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Supabase query failed: {str(e)}")

@router.get("/fetch-buildings")
async def fetch_buildings():
    try:
        buildings = supabase.table("Buildings").select('*').execute()
        return buildings.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Supabase query failed: {str(e)}")

@router.post("/create-building")
async def create_building(building: BuildingModel):
    try:
        new_building = supabase.table("Buildings").insert(building.dict()).execute()
        return new_building.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Supabase query failed: {str(e)}")

@router.delete("/delete-building/{building_id}")
async def delete_building(building_id: int):
    try:
        building = supabase.table("Buildings").delete().eq("id", building_id).execute()
        if not building.data:
            raise HTTPException(status_code=404, detail="Building not found")
        return building.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Supabase query failed: {str(e)}")

@router.put("/update-building/{building_id}")
async def update_building(building_id: int, building: BuildingModel):
    try:
        updated_building = supabase.table("Buildings").update(building.dict()).eq("id", building_id).execute()
        if not updated_building.data:
            raise HTTPException(status_code=404, detail="Building not found")
        return updated_building.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Supabase query failed: {str(e)}")

