import os
import sys
import datetime
import logging
from tkinter import Image
from typing import List, Union
from fastapi import Depends, FastAPI, HTTPException, Query
from fastapi.staticfiles import StaticFiles
from starlette.responses import RedirectResponse

from .dependencies import get_db
from .tables import Base, Images, Objects, engine

logging.basicConfig(
    level=os.environ.get("WATCHTOWER_LOG_LVL", "INFO"),
    format="%(asctime)s | %(levelname)s | %(name)s | %(funcName)s | %(message)s",
    stream=sys.stdout,
    force=True,
)
logger = logging.getLogger(__name__)

app = FastAPI()


@app.on_event("startup")
async def startup_event():
    Base.metadata.create_all(bind=engine)


@app.get("/")
async def index():
    logger.info("Main HTML requested")
    return RedirectResponse(url="/index.html")


@app.get("/images")
def get_images(
    camera: Union[List[str], None] = Query(default=None),
    object: Union[List[str], None] = Query(default=None),
    highlighted: Union[bool, None] = None,
    start: Union[datetime.datetime, None] = None,
    end: Union[datetime.datetime, None] = None,
    max_items: Union[int, None] = 500,
    db=Depends(get_db),
):
    try:
        result = db.query(Images)
        if object:
            result = result.join(Objects.image).filter(Objects.class_name.in_(object))
        if camera:
            result = result.filter(Images.camera_name.in_(camera))
        if start:
            result = result.filter(Images.time >= start)
        if end:
            result = result.filter(Images.time <= end)
        if highlighted:
            result = result.filter(Images.highlight == highlighted)

        logger.info(f"Came up with this query: {result.statement}")
        result = result.order_by(Images.time.asc()).limit(max_items).all()
        logger.debug(f"This is fetched: {result}")

        response = []
        for row in result:
            response.append(
                {
                    "id": row.id,
                    "src": row.path,
                    "time": row.time,
                    "camera_name": row.camera_name,
                    "highlight": row.highlight,
                    "detections": [
                        {
                            "id": det.id,
                            "score": det.score,
                            "image_id": det.image_id,
                            "time": det.time,
                            "className": det.class_name,
                            "bbox": det.bbox,
                        }
                        for det in row.objects
                    ],
                }
            )
        logger.debug(f"Response: {response}")

        return response

    except Exception as e:
        logger.exception("Failed  GET images")
        raise HTTPException(500, str(e))


@app.put("/highlight/{imageid}")
def put_image(imageid: int, highlight: bool, db=Depends(get_db)):
    try:
        img: Images = db.query(Images).filter(Images.id == imageid).first()
        img.highlight = highlight
        db.commit()
        db.refresh(img)

    except Exception as e:
        logger.exception("Failed to update highlight")
        raise HTTPException(500, str(e))

    return {"value": img.highlight}


@app.get("/video")
def get_video(
    camera: str, start: datetime.datetime, end: datetime.datetime, db=Depends(get_db)
):
    pass


@app.get("/qparams")
def get_qparams(db=Depends(get_db)):
    try:
        camera_names = [
            img.camera_name for img in db.query(Images.camera_name).distinct().all()
        ]
        objects = [
            obj.class_name for obj in db.query(Objects.class_name).distinct().all()
        ]
        logger.debug(f"Got these qparams: {camera_names}, {objects}")
        return {"cameraNames": camera_names, "objects": objects}

    except Exception as e:
        logger.exception("Failed to get query params from DB")
        raise HTTPException(500, str(e))


if not bool(int(os.environ.get("WATCHTOWER_TEST_RUNNING", 0))):
    logger.info("Static files will be mounted")
    app.mount("/images", StaticFiles(directory="/images"), name="images")
    app.mount("/", StaticFiles(directory="/watchtower/build"), name="watchtower")
else:
    logger.critical("Static files are not mounted")
