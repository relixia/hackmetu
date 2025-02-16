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

class ObjectModel(BaseModel):
    state: bool
    floor_id: int
    table_coord_id: int
    type: int

class CoordinateModel(BaseModel):
    x: int
    y: int

class BuildingModel(BaseModel):
    floor_count: int

class FloorModel(BaseModel):
    building_id: int
    length: int
    width: int
    capacity: int

class FeedbackModel(BaseModel):
    title : str
    content: str
    personnel_id: int