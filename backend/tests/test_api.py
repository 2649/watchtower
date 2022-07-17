import datetime
from fastapi.testclient import TestClient
from testcontainers.compose import DockerCompose
import os
import psycopg2
import time
import pytest
from sqlalchemy import insert

image_list = [
    {
        "path": "/test",
        "time": datetime.datetime.now() - datetime.timedelta(days=1),
        "camera_name": "test",
    },
    {"path": "/test", "time": datetime.datetime.now(), "camera_name": "test"},
    {"path": "/test", "time": datetime.datetime.now(), "camera_name": "test1"},
    {"path": "/test", "time": datetime.datetime.now(), "camera_name": "test3"},
]

object_list = [
    [
        {
            "score": 0.9,
            "class_name": "person",
            "bbox": [0.1, 0.2, 0.1, 0.2],
        }
    ],
    [
        {
            "score": 0.9,
            "class_name": "dog",
            "bbox": [0.1, 0.2, 0.1, 0.2],
        }
    ],
    [
        {
            "score": 0.9,
            "class_name": "person",
            "bbox": [0.1, 0.2, 0.1, 0.2],
        },
        {
            "score": 0.9,
            "class_name": "car",
            "bbox": [0.1, 0.2, 0.1, 0.2],
        },
    ],
    [],
]


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
        os.environ[
            "WATCHTOWER_SQL_CONNECTION"
        ] = "postgresql://test:test@localhost:5432/postgres"
        os.environ["WATCHTOWER_LOG_LVL"] = "DEBUG"
        os.environ["WATCHTOWER_TEST_RUNNING"] = "1"

        from ..app.tables import Images, Objects, Base, SessionLocal, engine

        Base.metadata.create_all(bind=engine)

        with engine.begin() as conn:
            result = conn.execute(
                insert(Images).returning(Images.id, Images.time),
                image_list,
            )

            insert_objects = []
            for idx, row in enumerate(result):
                for obj in object_list[idx]:
                    obj["image_id"] = row.id
                    obj["time"] = row.time
                    insert_objects.append(obj)

            if len(insert_objects) > 0:
                conn.execute(insert(Objects), insert_objects)

        yield


def test_image_get(create_test_env):
    from ..app.app import app

    client = TestClient(app)
    resp = client.get("/images")
    assert resp.status_code == 200

    # Expect only 2 items
    resp = client.get("/images?camera=test")
    assert resp.status_code == 200
    assert len(resp.json()) == 2

    # Expect 3 items
    resp = client.get("/images?camera=test&camera=test1")
    assert resp.status_code == 200
    assert len(resp.json()) == 3

    # Except 2 items
    resp = client.get("/images?object=person")
    assert resp.status_code == 200
    assert len(resp.json()) == 2

    # Except 1 items
    resp = client.get("/images?object=dog")
    assert resp.status_code == 200
    assert len(resp.json()) == 1

    # Except 3 items
    resp = client.get("/images?object=dog&object=person")
    assert resp.status_code == 200
    assert len(resp.json()) == 3


def test_params_get(create_test_env):
    from ..app.app import app

    client = TestClient(app)

    resp = client.get("/qparams")

    assert resp.status_code == 200


def test_params_get(create_test_env):
    from ..app.app import app

    client = TestClient(app)

    resp = client.put("/highlight/1?highlight=true")

    assert resp.status_code == 200
