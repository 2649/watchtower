import datetime
from typing import List, Optional, Union
from pydantic import BaseModel

# GET images
class PydanticGetObjects(BaseModel):
    id: int
    score: float
    image_id: int
    time: datetime.datetime
    className: str
    bbox: List[float]


class PydanticGetImages(BaseModel):
    id: int
    src: str
    time: datetime.datetime
    camera_name: str
    highlight: Union[str, None]
    detections: Optional[List[PydanticGetObjects]]


# PTU highlight
class PydanticPutHighlight(BaseModel):
    value: bool


# GET qparams
class PydanticGetQParams(BaseModel):
    cameraNames: List[str]
    objects: List[str]


class PydanticWorkloadGet(BaseModel):
    id: int
    path: str
    time: datetime.datetime

    class Config:
        orm = True
    
class PydanticWorkloadPost(BaseModel):
    score: float
    image_id: int
    time: datetime.datetime
    class_name: str
    bbox: List[float]
