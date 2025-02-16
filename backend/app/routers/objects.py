from fastapi import APIRouter, HTTPException, BackgroundTasks
from app.database import supabase
from app.models import ObjectModel

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

@router.get("/fetch-objects")
async def fetch_objects():
    try:
        objects = supabase.table("Objects").select('*').execute()
        return objects.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Supabase query failed: {str(e)}")

@router.post("/create-object")
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