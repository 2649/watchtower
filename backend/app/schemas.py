import datetime
from typing import List
from pydantic import BaseModel


class PydanticObjects(BaseModel):
    score: float
    image_id: int
    time: datetime.datetime
    class_name: str
    bbox: List[float]
    id: int

    class Config:
        orm = True


class PydanticDetection(BaseModel):
    path: str
    time: datetime.datetime
    camera_name: str
    highlight: bool
    id: int

    class Config:
        orm = True


class PydanticImagesReduxState(PydanticDetection):
    detections: List[PydanticObjects]
