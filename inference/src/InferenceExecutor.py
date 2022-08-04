from abc import abstractmethod
from multiprocessing.sharedctypes import Value
import os
import time
import signal
import datetime
import pathlib
import cv2
import sys
from numpy import ndarray
import requests
from sqlalchemy import insert
from typing import List
import logging
import requests


from .tables import Base, engine, Images, Objects

logging.basicConfig(
    level=os.environ.get("WATCHTOWER_LOG_LVL", "INFO"),
    format="%(asctime)s | %(levelname)s | %(name)s | %(funcName)s | %(message)s",
    stream=sys.stdout,
    force=True,
)
logger = logging.getLogger(__name__)


class ExecutionClass:

    def __init__(self) -> None:

        # System interrupt handle
        self.running = True
        signal.signal(signal.SIGINT, self.handle_int)
        logger.info("Init of SIGINT call")

        # Camera and DB
        self.base_path = os.environ["WATCHTOWER_STORAGE_PATH"]
        self.SQLALCHEMY_DATABASE_URL = os.environ["WATCHTOWER_SQL_CONNECTION"]
        self.cam_ip = os.environ["WATCHTOWER_CAM_IP"]
        self.cam_name = os.environ["WATCHTOWER_CAMERA_NAME"]

        # Model
        self.model_name = os.environ["WATCHTOWER_MODEL_NAME"].lower()
        self.model_path = os.environ["WATCHTOWER_MODEL_PATH"]
        self.class_map_path = os.environ["WATCHTOWER_CLASS_MAP_PATH"]
        self.batch_size = int(os.environ["WATCHTOWER_BATCH_SIZE"])
        self.inference_confidence = float(os.environ.get("WATCHTOWER_CONFIDENCE", 0.3))
        if self.batch_size == 1:
            self.num_images_to_hit_db = 5
        else:
            self.num_images_to_hit_db = self.batch_size

        # Recording params
        self.jpg_compression = int(os.environ.get("WATCHTOWER_JPG_COMPRESSION", 80))
        self.fps = int(os.environ.get("WATCHTOWER_FPS", 1))
        self.fps_in_hz = 1 / self.fps

        logger.info("Retrieved all environment variables")

        # Init data variables
        self.image_list: List[dict] = []
        self.image_array_list: List[ndarray] = []
        self.object_list: List[List[dict]] = []

        # Will be initialized by prepare_execution and prepare_db
        self.cap = None
        self.model = None
        self.model_server = None
        self.engine = None
        self.Base = None
        self.print_config()
        logger.info("End of init")

    @abstractmethod
    def load_model(self):
        pass

    @abstractmethod
    def inference(self):
        pass

    # Utils and loader
    def print_config(self):
        logger.info(f"Parameter: base_path: {self.base_path}")
        logger.info(f"Parameter: cam_ip: {self.cam_ip}")
        logger.info(f"Parameter: cam_name: {self.cam_name}")
        logger.info(f"Parameter: model_name: {self.model_name}")
        logger.info(f"Parameter: model_path: {self.model_path}")
        logger.info(f"Parameter: class_map_path: {self.class_map_path}")
        logger.info(f"Parameter: batch_size: {self.batch_size}")
        logger.info(f"Parameter: inference_confidence: {self.inference_confidence}")
        logger.info(f"Parameter: jpg_compression: {self.jpg_compression}")
        logger.info(f"Parameter: fps: {self.fps}")

    def handle_int(self, sig, frame):
        logger.info("SIGINT received")
        self.running = False
        sys.exit(0)

    def prepare_execution(self):
        logger.info("Init of video stream")
        self.cap = cv2.VideoCapture(self.cam_ip)
        self.load_model()
        logger.info("Init of model")

    def prepare_db(self):
        logger.info("DB will be prepared")
        self.Base = Base
        self.engine = engine

        self.Base.metadata.create_all(bind=engine)
        logger.info("All tables are created")

    # Worker fuwatchtower-desktopnctions
    def insert_in_db(self):
        if len(self.image_list) > 0:
            with self.engine.begin() as conn:
                result = conn.execute(
                    insert(Images).returning(Images.id, Images.time),
                    self.image_list,
                )

                insert_objects = []
                for idx, row in enumerate(result):
                    logger.debug(f"Processing idx: {idx} and row: {row}")
                    logger.debug(f"We access this object list now: {self.object_list}")
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
        cv2.imwrite(
            current_path, frame, [int(cv2.IMWRITE_JPEG_QUALITY), self.jpg_compression]
        )

        self.image_list.append(
            {
                "path": current_path,
                "time": current_time,
                "camera_name": self.cam_name,
            }
        )

        # Inference
        self.image_array_list.append(frame)
        self.inference_eventually()

    def inference_eventually(self):
        if self.image_array_list.__len__() == self.batch_size:
            start_time = time.time()
            logger.debug("Started inference")
            objects = self.inference()
            logger.debug(f"Inference results: {objects}")
            self.object_list = objects
            logger.debug(f"This is the object list: {objects}")
            self.image_array_list = []

            logger.info(f"Time for inference: {time.time() - start_time}")

    def dump_eventually(self):
        if len(self.object_list) == self.batch_size:
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
                        start_time = time.time()
                        ret, frame = self.cap.read()
                        if ret:
                            self.process_frame(frame)
                            if self.batch_size > 1:
                                self.dump_eventually()
                            time.sleep(0.001)
                        else:
                            failed_img_retrieval += 1
                            if failed_img_retrieval > 30:
                                raise ConnectionError(
                                    "Failed to retrieve one of 30 last frames"
                                )

                        # Handle FPS offset
                        time_for_frame = time.time() - start_time
                        if time_for_frame > self.fps_in_hz:
                            logger.warning(
                                f"Time for processing was {time_for_frame}, but {self.fps_in_hz} is needed"
                            )
                        else:
                            logger.debug(
                                f"Time for processing was {time_for_frame}, but only {self.fps_in_hz} is needed. Sleep for {self.fps_in_hz - time_for_frame - .05}"
                            )
                            time.sleep(self.fps_in_hz - time_for_frame - 0.05)

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
                    logger.exception("Failed to release connections")


class ExecutionClassYoloV6(ExecutionClass):
    def load_model(self):
        logger.info(f"Loading the model with model name: {self.model_name}")

        logger.info("Loading YOLOv6")
        from .models.YOLOv6 import YOLOv6

        logger.info("Imported YOLOv6 successfully")
        self.model = YOLOv6(
            self.model_path,
            self.class_map_path,
            float(self.inference_confidence),
        )

    def inference(self):
        return self.model.detect_objects(self.image_array_list)


class ExecutionClassWeb(ExecutionClass):
    def load_model(self):
        logger.info(f"Loading the model with model name: {self.model_name}")
        # We use a requests session, bc it automatically sets keep-alive
        self.model_server = requests.Session()

    def inference(self):
        resp = self.model_server.get(self.model_path)
        if resp.status_code == 200:
            return resp.json()
        else:
            logger.warning(
                f"Failed to execute inference: {resp.status_code} with error msg: {resp.text}"
            )