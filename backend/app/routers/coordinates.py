from fastapi import APIRouter, HTTPException, BackgroundTasks
from app.database import supabase
from app.models import CoordinateModel

router = APIRouter()

@router.get("/fetch-coordinate/{coordinate_id}")
async def fetch_coordinate(coordinate_id: int):
    try:
        coordinate = supabase.table("Coordinates").select('*').eq("id", coordinate_id).execute()
        if not coordinate.data:
            raise HTTPException(status_code=404, detail="Coordinate not found")
        return coordinate.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Supabase query failed: {str(e)}")

@router.get("/fetch-coordinates")
async def fetch_coordinates():
    try:
        coordinates = supabase.table("Coordinates").select('*').execute()
        return coordinates.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Supabase query failed: {str(e)}")

@router.post("/create-coordinate")
async def create_coordinate(coordinate: CoordinateModel):
    try:
        new_coordinate = supabase.table("Coordinates").insert(coordinate.dict()).execute()
        return new_coordinate.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Supabase query failed: {str(e)}")

@router.delete("/delete-coordinate/{coordinate_id}")
async def delete_coordinate(coordinate_id: int):
    try:
        coordinate = supabase.table("Coordinates").delete().eq("id", coordinate_id).execute()
        if not coordinate.data:
            raise HTTPException(status_code=404, detail="Coordinate not found")
        return coordinate.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Supabase query failed: {str(e)}")

@router.put("/update-coordinate/{coordinate_id}")
async def update_coordinate(coordinate_id: int, coordinate: CoordinateModel):
    try:
        updated_coordinate = supabase.table("Coordinates").update(coordinate.dict()).eq("id", coordinate_id).execute()
        if not updated_coordinate.data:
            raise HTTPException(status_code=404, detail="Coordinate not found")
        return updated_coordinate.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Supabase query failed: {str(e)}")
