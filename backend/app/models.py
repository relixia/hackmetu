from pydantic import BaseModel
from typing import Optional

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
    x_coor: Optional[int] = None  # Optional, as some personnel might not have assigned coordinates
    y_coor: Optional[int] = None


class CreateItemRequest(BaseModel):
    state: bool        # State of the object (active/inactive)
    floor_id: int      # The floor where the object is located
    o_type: int        # Type of object (you can define the types elsewhere in your application)
    x_coor: int        # X coordinate for the object
    y_coor: int        # Y coordinate for the object


# Define the request model for the updated coordinates
class UpdateCoordinatesRequest(BaseModel):
    personnel_id: int
    x_coor: int
    y_coor: int

class UpdateItemCoordinatesRequest(BaseModel):
    item_id: int  # Use id instead of name
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

class UpdateObjectModel(BaseModel):
    x_coor: Optional[int] = None
    y_coor: Optional[int] = None

class FeedbackModel(BaseModel):
    title : str
    content: str
    personnel_id: int