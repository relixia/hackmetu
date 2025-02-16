from fastapi import APIRouter, HTTPException
from app.database import supabase
from app.models import PersonnelModel
from pydantic import BaseModel

router = APIRouter()

class UpdateCoordinatesRequest(BaseModel):
    personnel_id: int
    x_coor: int
    y_coor: int

# Fetch Personnel (existing)
@router.get("/fetch-personnel/{personnel_id}")
async def fetch_personnel(personnel_id: int):
    try:
        personnel = supabase.table("Personnels").select('*').eq("id", personnel_id).execute()
        if not personnel.data:
            raise HTTPException(status_code=404, detail="Personnel not found")
        return personnel.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Supabase query failed: {str(e)}")

@router.get("/fetch-unplaced-users")
async def fetch_unplaced_users():
    try:
        # Fetch unplaced users
        personnel = supabase.table("Personnels").select('*').is_('x_coor', None).is_('y_coor', None).execute()
        
        # If no unplaced users, return an empty list
        if not personnel.data:
            return []  # Return an empty array instead of raising an exception
        
        return personnel.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Supabase query failed: {str(e)}")


# Create Personnel (existing)
@router.post("/create-personnel")
async def create_personnel(personnel: PersonnelModel):
    try:
        new_personnel = supabase.table("Personnels").insert(personnel.dict()).execute()
        return new_personnel.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Supabase query failed: {str(e)}")

# Delete Personnel (existing)
@router.delete("/delete-personnel/{personnel_id}")
async def delete_personnel(personnel_id: int):
    try:
        personnel = supabase.table("Personnels").delete().eq("id", personnel_id).execute()
        if not personnel.data:
            raise HTTPException(status_code=404, detail="Personnel not found")
        return personnel.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Supabase query failed: {str(e)}")

# Update Personnel (existing)
@router.put("/update-personnel/{personnel_id}")
async def update_personnel(personnel_id: int, personnel: PersonnelModel):
    try:
        updated_personnel = supabase.table("Personnels").update(personnel.dict()).eq("id", personnel_id).execute()
        if not updated_personnel.data:
            raise HTTPException(status_code=404, detail="Personnel not found")
        return updated_personnel.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Supabase query failed: {str(e)}")

# Authorize Personnel (existing)
@router.get("/authorize-personnel/{email}/{password}")
async def authorize_personnel(email: str, password: str):
    try:
        personnel = supabase.table("Personnels").select('*').eq("email", email).eq("password", password).execute()
        if not personnel.data:
            raise HTTPException(status_code=404, detail="Personnel not found")
        return personnel.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Supabase query failed: {str(e)}")

# Update Personnel Coordinates (Modified to use Supabase)
@router.post("/update-personnel-coordinates/")
async def update_personnel_coordinates_endpoint(request: UpdateCoordinatesRequest):
    try:
        # Update the personnel's coordinates using Supabase
        updated_personnel = supabase.table("Personnels").update({
            "x_coor": request.x_coor,
            "y_coor": request.y_coor
        }).eq("id", request.personnel_id).execute()

        if not updated_personnel.data:
            raise HTTPException(status_code=404, detail="Personnel not found")
        
        return {"message": "Coordinates updated successfully"}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Supabase query failed: {str(e)}")
