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
    gender: int
    x_coor: int
    y_coor: int

# Define the request model for the updated coordinates
class UpdateCoordinatesRequest(BaseModel):
    personnel_id: int
    x_coor: int
    y_coor: int

class ObjectModel(BaseModel):
    state: bool
    floor_id: int
    o_type: int
    x_coor: int
    y_coor: int

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