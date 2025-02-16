from fastapi import APIRouter, HTTPException, BackgroundTasks
from app.database import supabase
from app.models import ObjectModel, UpdateItemCoordinatesRequest, CreateItemRequest, UpdateObjectModel

router = APIRouter()

@router.get("/fetch-object/{object_id}")
async def fetch_object(object_id: int):
    try:
        object = supabase.table("Objects").select('*').eq("id", object_id).execute()
        if not object.data:
            raise HTTPException(status_code=404, detail="object not found")
        return object.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Supabase query failed: {str(e)}")

@router.get("/fetch-objects/")
async def fetch_objects(floor_id: int = None, building_id: int = None):
    try:
        query = supabase.table("Objects").select('*')

        # Apply floor_id filter
        if floor_id:
            query = query.eq("floor_id", floor_id)

        # If building_id is provided, filter floors to get the corresponding floors
        if building_id:
            floors = supabase.table("Floors").select("id").eq("building_id", building_id).execute()
            floor_ids = [floor["id"] for floor in floors.data]
            query = query.in_("floor_id", floor_ids)

        objects = query.execute()

        return objects.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Supabase query failed: {str(e)}")


@router.post("/create-object/")
async def create_object(object: ObjectModel):
    try:
        new_object = supabase.table("Objects").insert(object.dict()).execute()
        return new_object.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Supabase query failed: {str(e)}")

@router.delete("/delete-object/{object_id}")
async def delete_object(object_id: int):
    try:
        object = supabase.table("Objects").delete().eq("id", object_id).execute()
        if not object.data:
            raise HTTPException(status_code=404, detail="object not found")
        return object.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Supabase query failed: {str(e)}")

@router.put("/update-object/{object_id}")
async def update_object(object_id: int, object: ObjectModel):
    try:
        updated_object = supabase.table("Objects").update(object.dict()).eq("id", object_id).execute()
        if not updated_object.data:
            raise HTTPException(status_code=404, detail="object not found")
        return updated_object.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Supabase query failed: {str(e)}")

@router.post("/create-item/")
async def create_item(request: CreateItemRequest):
    # Logic to create the item using the request data
    state = request.state
    floor_id = request.floor_id
    o_type = request.o_type
    x_coor = request.x_coor
    y_coor = request.y_coor

    return {"message": "Item created successfully!"}


@router.post("/update-item-coordinates/")
async def update_item_coordinates(item: UpdateItemCoordinatesRequest):
    try:
        # Query the "Objects" table to find the item by id
        object = supabase.table("Objects").select('*').eq("id", item.item_id).execute()
        
        if not object.data:
            raise HTTPException(status_code=404, detail="Item not found")
        
        # Update the coordinates of the found object
        updated_object = supabase.table("Objects").update({
            "x_coor": item.x_coor,
            "y_coor": item.y_coor
        }).eq("id", item.item_id).execute()

        return {"message": "Item coordinates updated successfully!"}

    except Exception as e:
        print(f"Error occurred: {str(e)}")  # Log the error for debugging
        raise HTTPException(status_code=500, detail=f"Supabase query failed: {str(e)}")

@router.get("/fetch-placed-objects/{floor_id}")
async def fetch_placed_objects(floor_id: int):
    try:
        objects = supabase.table("Objects").select('*').eq("floor_id", floor_id).execute()
        return objects.data if objects.data else []
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Supabase query failed: {str(e)}")
    
@router.put("/update-object/{object_id}")
async def update_object(object_id: int, object: UpdateObjectModel):
    try:
        updated_object = (
            supabase.table("Objects")
            .update(object.dict(exclude_unset=True))  # Update only provided fields
            .eq("id", object_id)
            .execute()
        )
        if not updated_object.data:
            raise HTTPException(status_code=404, detail="Object not found")
        return updated_object.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Supabase query failed: {str(e)}")

@router.post("/create-or-update-object/")
async def create_or_update_object(object: ObjectModel):
    try:
        # Check if object already exists for the given floor and coordinates
        existing_object = (
            supabase.table("Objects")
            .select('*')
            .eq("floor_id", object.floor_id)
            .eq("x_coor", object.x_coor)
            .eq("y_coor", object.y_coor)
            .execute()
        )

        # If object exists, update it
        if existing_object.data:
            updated_object = (
                supabase.table("Objects")
                .update(object.dict(exclude_none=True))
                .eq("id", existing_object.data[0]["id"])
                .execute()
            )
            return {"message": "Object updated successfully!", "data": updated_object.data[0]}

        # Otherwise, create a new object
        new_object = (
            supabase.table("Objects")
            .insert(object.dict())
            .execute()
        )
        return {"message": "Object created successfully!", "data": new_object.data[0]}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Supabase query failed: {str(e)}")