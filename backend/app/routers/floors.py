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
async def create_floor(floor_data: dict):
    try:
        floors = floor_data.get("floors", [])
        total_square_meters = floor_data.get("totalSquareMeters")

        # Ensure floors data is provided
        if not floors:
            raise HTTPException(status_code=400, detail="No floors data provided")

        # Step 1: Insert the building with the given floor_count
        building_data = {"floor_count": len(floors)}
        new_building = supabase.table("Buildings").insert(building_data).execute()

        if not new_building.data:
            raise HTTPException(status_code=500, detail="Failed to create building")

        building_id = new_building.data[0]['id']

        # Step 2: Insert each floor and link it to the building_id
        for index, floor in enumerate(floors):
            floor_data_with_building_id = {
                **floor,
                "building_id": building_id,
                "length": floor.get("length", 0),  # Ensure length is included
                "width": floor.get("width", 0),     # Ensure width is included
            }

            # Get the current highest floor number for the given building_id
            existing_floors = supabase.table("Floors").select("number").eq("building_id", building_id).execute()
            highest_floor_number = max([f["number"] for f in existing_floors.data], default=0)

            # Set the new floor number (the next available number)
            floor_data_with_building_id["number"] = highest_floor_number + 1

            # Insert the floor with the new "number"
            new_floor = supabase.table("Floors").insert(floor_data_with_building_id).execute()

            if not new_floor.data:
                raise HTTPException(status_code=500, detail=f"Failed to create floor {index + 1}")

        return {"message": "Building and Floors created successfully", "totalSquareMeters": total_square_meters}

    except HTTPException as http_err:
        raise http_err  # Rethrow HTTP exceptions

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
