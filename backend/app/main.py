from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI
from app.config import ALLOWED_ORIGINS
from app.database import supabase
from .routers import admins, personnels, objects, buildings, floors

app = FastAPI()
app.include_router(admins.router)
app.include_router(personnels.router)
app.include_router(objects.router)
app.include_router(buildings.router)
app.include_router(floors.router)


app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

