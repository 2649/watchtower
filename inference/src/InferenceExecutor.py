import os
import time
import signal
import datetime
import pathlib
import cv2
import sys
from sqlalchemy import insert
from typing import List
import logging

from .tables import Base, engine, Images, Objects
from .YOLOv6 import YOLOv6

logging.basicConfig(
    level=os.environ.get("WATCHTOWER:LOG_LVL", "INFO"),
    format="%(asctime)s | %(levelname)s | %(name)s | %(funcName)s | %(message)s",
    stream=sys.stdout,
    force=True,
)
logger = logging.getLogger(__name__)


class ExecutionClass:
    NUM_PROCESS_TO_HIT_DB = 5

    def __init__(self) -> None:

        self.running = True
        signal.signal(signal.SIGINT, self.handle_int)
        logger.info("Init of SIGINT call")

        self.base_path = os.environ["WATCHTOWER_STORAGE_PATH"]
        self.SQLALCHEMY_DATABASE_URL = os.environ["WATCHTOWER_SQL_CONNECTION"]
        self.cam_ip = os.environ["WATCHTOWER_CAM_IP"]
        self.cam_name = os.environ["WATCHTOWER_CAMERA_NAME"]
        self.model_path = os.environ["WATCHTOWER_MODEL_PATH"]
        self.inference_confidence = os.environ.get("WATCHTOWER_CONFIDENCE", 0.3)
        logger.info("Retrieved all environment variables")

        self.image_list: List[dict] = []
        self.object_list: List[List[dict]] = []

        # Will be initialized by prepare_execution and prepare_db
        self.cap = None
        self.model = None
        self.engine = None
        self.Base = None
        logger.info("End of init")

    def handle_int(self, sig, frame):
        logger.info("SIGINT received")
        self.running = False
        sys.exit(0)

    def prepare_execution(self):
        logger.info("Init of video stream")
        self.cap = cv2.VideoCapture(self.cam_ip)
        logger.info("Init of model")
        self.model = YOLOv6(
            self.model_path,
            float(self.inference_confidence),
        )

    def prepare_db(self):
        logger.info("DB will be prepared")
        self.Base = Base
        self.engine = engine

        self.Base.metadata.create_all(bind=engine)
        logger.info("All tables are created")

    def insert_in_db(self):
        if len(self.image_list) > 0:
            with self.engine.begin() as conn:
                result = conn.execute(
                    insert(Images).returning(Images.id, Images.time),
                    self.image_list,
                )

                insert_objects = []
                for idx, row in enumerate(result):
                    for obj in self.object_list[idx]:
                        obj["image_id"] = row.id
                        obj["time"] = row.time
                        insert_objects.append(obj)

                if len(insert_objects) > 0:
                    conn.execute(insert(Objects), insert_objects)
            logger.info(f"Just pushed {len(self.image_list)} images to DB")
            self.image_list = []
            self.object_list = []

    def process_frame(self, frame):
        current_time = datetime.datetime.now()
        current_path_dir = f"{self.base_path}/{self.cam_name}/{current_time.date()}-{current_time.hour}"
        current_path = os.path.join(current_path_dir, f"{current_time.timestamp()}.jpg")
        pathlib.Path(current_path_dir).mkdir(exist_ok=True, parents=True)
        # Write
        cv2.imwrite(current_path, frame)

        # Inference
        objects = self.model.detect_objects(frame)

        self.image_list.append(
            {
                "path": current_path,
                "time": current_time,
                "camera_name": self.cam_name,
            }
        )
        self.object_list.append(objects)

    def dump_eventually(self):
        if self.NUM_PROCESS_TO_HIT_DB < len(self.image_list):
            self.insert_in_db()

    def run(self):
        logger.info("Start of endless run")
        while self.running:
            try:
                self.prepare_execution()
                self.prepare_db()
                failed_img_retrieval = 0
                logger.info("Preparation finished")
                while self.running:
                    try:
                        ret, frame = self.cap.read()
                        if ret:
                            self.process_frame(frame)
                            self.dump_eventually()
                            time.sleep(0.01)
                        else:
                            self.insert_in_db()
                            failed_img_retrieval += 1
                            if failed_img_retrieval > 30:
                                raise ConnectionError(
                                    "Failed to retrieve one of 30 last frames"
                                )
                    except KeyboardInterrupt:
                        self.running = False
                        try:
                            self.cap.release()
                        except:
                            pass
            except KeyboardInterrupt:
                self.running = False
            except Exception as e:
                logger.exception(
                    "Failed main loop with not handled error. Sleep and restart"
                )
                time.sleep(4)
            finally:
                try:
                    self.cap.release()
                    self.engine.dispose()
                except:
                    pass
