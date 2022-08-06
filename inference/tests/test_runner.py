import tempfile
import numpy as np
from PIL import Image
from datetime import datetime
import psycopg2
import time
import os
import pytest
from testcontainers.compose import DockerCompose
from sqlalchemy.engine import Engine
from sqlalchemy import text


@pytest.fixture(scope="function")
def create_temp_dir():
    with tempfile.TemporaryDirectory() as tmp_dir:
        os.environ["WATCHTOWER_STORAGE_PATH"] = tmp_dir
        yield


@pytest.fixture(scope="session")
def get_test_img():
    img_path = f"{os.path.dirname(__file__)}/20220423_143238.jpg"
    img = Image.open(img_path)
    yield np.array(img)


@pytest.fixture(scope="session")
def create_test_env():
    with DockerCompose(
        os.path.dirname(os.path.abspath(__file__)),
        compose_file_name="docker-compose.yaml",
        pull=True,
    ):
        for _ in range(60):
            try:
                psycopg2.connect("postgresql://test:test@localhost:5432/postgres")
                break
            except psycopg2.OperationalError:
                time.sleep(0.5)

        yield


@pytest.fixture(scope="function")
def create_environ():
    os.environ["WATCHTOWER_CAM_IP"] = "http://ffmpeg"
    os.environ["WATCHTOWER_MODEL_PATH"] = (
        os.path.dirname(__file__) + "/yolov6s_640_352_simplified.onnx"
    )
    os.environ["WATCHTOWER_CLASS_MAP_PATH"] = (
        os.path.dirname(__file__) + "/class_map.json"
    )
    os.environ["WATCHTOWER_MODEL_NAME"] = "yolov6"
    os.environ["WATCHTOWER_BATCH_SIZE"] = "1"
    os.environ["WATCHTOWER_CONFIDENCE"] = ".3"
    os.environ["WATCHTOWER_CAMERA_NAME"] = "test"
    os.environ["WATCHTOWER_LOG_LVL"] = "DEBUG"
    os.environ["WATCHTOWER_STORAGE_PATH"] = tempfile.gettempdir()

    os.environ[
        "WATCHTOWER_SQL_CONNECTION"
    ] = "postgresql://test:test@localhost:5432/postgres"


@pytest.fixture(scope="function")
def get_batched_model():
    os.environ["WATCHTOWER_MODEL_PATH"] = (
        os.path.dirname(__file__) + "/yolov6_cctv_640_640_bs_6.onnx"
    )
    os.environ["WATCHTOWER_BATCH_SIZE"] = "6"


def test_class_creation(create_environ):
    from ..src.InferenceExecutor import ExecutionClassYoloV6

    exec_class = ExecutionClassYoloV6()


def test_db_connection(create_environ, create_test_env):
    from ..src.InferenceExecutor import ExecutionClassYoloV6

    exec_class = ExecutionClassYoloV6()

    exec_class.prepare_db()
    exec_class.config.num_images_to_hit_db = 3

    assert isinstance(exec_class.engine, Engine)

    exec_class.image_list = [
        {
            "path": "/test",
            "inferred": True,
            "time": datetime.now(),
            "camera_name": "test",
        },
        {
            "path": "/test",
            "inferred": True,
            "time": datetime.now(),
            "camera_name": "test",
        },
        {
            "path": "/test",
            "inferred": True,
            "time": datetime.now(),
            "camera_name": "test",
        },
    ]

    exec_class.object_list = [
        [
            {
                "score": 0.9,
                "class_name": "test",
                "bbox": [0.1, 0.2, 0.1, 0.2],
            }
        ],
        [
            {
                "score": 0.9,
                "class_name": "test",
                "bbox": [0.1, 0.2, 0.1, 0.2],
            }
        ],
        [
            {
                "score": 0.9,
                "class_name": "test",
                "bbox": [0.1, 0.2, 0.1, 0.2],
            },
            {
                "score": 0.9,
                "class_name": "test",
                "bbox": [0.1, 0.2, 0.1, 0.2],
            },
        ],
    ]

    exec_class.insert_in_db()

    with exec_class.engine.connect() as conn:
        result = conn.execute(text("SELECT * FROM images"))
        assert len(result.fetchall()) >= 3
        result = conn.execute(text("SELECT * FROM objects"))
        assert len(result.fetchall()) >= 3


def test_inference(create_environ, create_test_env, get_test_img, create_temp_dir):
    from ..src.InferenceExecutor import ExecutionClassYoloV6

    exec_class = ExecutionClassYoloV6()
    exec_class.config.num_images_to_hit_db = 1
    exec_class.prepare_execution()

    exec_class.process_frame(get_test_img)

    assert len(exec_class.image_list) == 1
    assert os.path.isfile(exec_class.image_list[0]["path"])

    exec_class.image_list[0]["time"]
    exec_class.image_list[0]["camera_name"]

    exec_class.prepare_db()
    exec_class.insert_in_db()

    assert len(exec_class.image_list) == 0
    assert len(exec_class.object_list) == 0


def test_inference_wo_objects(create_environ, create_test_env, create_temp_dir):
    from ..src.InferenceExecutor import ExecutionClassYoloV6

    exec_class = ExecutionClassYoloV6()
    exec_class.config.num_images_to_hit_db = 1
    exec_class.prepare_execution()

    exec_class.process_frame(np.zeros([1280, 720, 3], dtype=np.uint8))

    assert len(exec_class.image_list) == 1
    assert os.path.isfile(exec_class.image_list[0]["path"])

    exec_class.image_list[0]["time"]
    exec_class.image_list[0]["camera_name"]

    exec_class.prepare_db()
    exec_class.insert_in_db()

    assert len(exec_class.image_list) == 0
    assert len(exec_class.object_list) == 0


def test_batch_inference(
    create_environ, create_test_env, create_temp_dir, get_batched_model
):
    from ..src.InferenceExecutor import ExecutionClassYoloV6

    exec_class = ExecutionClassYoloV6()
    exec_class.prepare_execution()
    exec_class.prepare_db()

    for _ in range(10):
        exec_class.process_frame(np.zeros([1280, 720, 3], dtype=np.uint8))
        exec_class.insert_in_db()

    assert len(exec_class.image_list) == 10 - int(os.environ["WATCHTOWER_BATCH_SIZE"])
    assert len(exec_class.object_list) == 0
    assert os.path.isfile(exec_class.image_list[0]["path"])

    exec_class.image_list[0]["time"]
    exec_class.image_list[0]["camera_name"]
