from fastapi import APIRouter, HTTPException, BackgroundTasks
from app.database import supabase
from app.models import TableModel

router = APIRouter()

@router.get("/fetch-table/{table_id}")
async def fetch_table(table_id: int):
    try:
        table = supabase.table("Tables").select('*').eq("id", table_id).execute()
        if not table.data:
            raise HTTPException(status_code=404, detail="Table not found")
        return table.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Supabase query failed: {str(e)}")

@router.get("/fetch-tables")
async def fetch_tables():
    try:
        tables = supabase.table("Tables").select('*').execute()
        return tables.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Supabase query failed: {str(e)}")

@router.post("/create-table")
async def create_table(table: TableModel):
    try:
        new_table = supabase.table("Tables").insert(table.dict()).execute()
        return new_table.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Supabase query failed: {str(e)}")

@router.delete("/delete-table/{table_id}")
async def delete_table(table_id: int):
    try:
        table = supabase.table("Tables").delete().eq("id", table_id).execute()
        if not table.data:
            raise HTTPException(status_code=404, detail="Table not found")
        return table.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Supabase query failed: {str(e)}")

@router.put("/update-table/{table_id}")
async def update_table(table_id: int, table: TableModel):
    try:
        updated_table = supabase.table("Tables").update(table.dict()).eq("id", table_id).execute()
        if not updated_table.data:
            raise HTTPException(status_code=404, detail="Table not found")
        return updated_table.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Supabase query failed: {str(e)}")