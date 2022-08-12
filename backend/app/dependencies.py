import sqlalchemy.orm as orm
from .tables import SessionLocal


def get_db() -> orm.Session:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
