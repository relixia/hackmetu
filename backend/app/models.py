from pydantic import BaseModel

class AdminModel(BaseModel):
    username: str
    password: str

class PersonnelModel(BaseModel):
    name: str
    surname: str
    email: str
    password: str
    table_id: int

class TableModel(BaseModel):
    state: bool
    floor_id: int
    table_coord_id: int

class CoordinateModel(BaseModel):
    x: int
    y: int

class BuildingModel(BaseModel):
    floor_count: int

class FloorModel(BaseModel):
    building_id: int
    height: int
    width: int