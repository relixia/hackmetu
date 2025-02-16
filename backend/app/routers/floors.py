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

@router.get("/fetch-floors-with-personnels/{building_id}")
async def fetch_floors_with_personnels(building_id: int):
    """
    Fetch floors by building_id, then attach occupantCount, capacity, area, 
    tableCoordinates, and user list from the Personnels table.
    """
    try:
        # 1. Get all floors for the given building_id
        floors_response = supabase.table("Floors").select("*").eq("building_id", building_id).execute()
        floors_data = floors_response.data

        if not floors_data:
            raise HTTPException(status_code=404, detail="No floors found for this building.")

        # 2. For each floor, fetch personnels and build the structure
        result = []
        for f in floors_data:
            floor_id_db = f["id"]           # The actual ID in the Floors table
            floor_number = f["number"]      # We'll treat 'number' as the front-end ID
            length = f.get("length", 0)
            width = f.get("width", 0)
            area = length * width
            capacity = area

            # 2a. Fetch all personnels for this floor
            personnel_response = supabase.table("Personnels").select("*").eq("floor_id", floor_id_db).execute()
            personnel_data = personnel_response.data

            # 2b. occupantCount is just how many personnels we have
            occupant_count = len(personnel_data)

            # 2c. Build tableCoordinates from x_coor, y_coor
            table_coords = []
            user_list = []
            for p in personnel_data:
                x_coor = p.get("x_coor", 0)
                y_coor = p.get("y_coor", 0)
                table_coords.append({"x": x_coor, "z": y_coor})

                # For the user list, combine name + surname (or adapt as you like)
                full_name = f"{p.get('name', '')} {p.get('surname', '')}".strip()
                user_list.append(full_name)

            # 2d. Build the final object for the front-end
            floor_obj = {
                "id": floor_number,               # from the 'number' column
                "name": f"Floor {floor_number}",  # or any naming convention you prefer
                "area": area,
                "occupantCount": occupant_count,
                "capacity": capacity,
                "tableCoordinates": table_coords,
                "users": user_list
            }
            result.append(floor_obj)

        return result

    except Exception as e:
        logging.error(f"Error in fetch_floors_with_personnels: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Supabase query failed: {str(e)}")