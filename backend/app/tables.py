from sqlalchemy import create_engine
from sqlalchemy import Column, TEXT, FLOAT, ForeignKey, BOOLEAN
from sqlalchemy.dialects.postgresql import ARRAY, BIGINT, TIMESTAMP
from sqlalchemy.orm import relationship, sessionmaker
from sqlalchemy.ext.declarative import declarative_base
import os

SQLALCHEMY_DATABASE_URL = os.environ["WATCHTOWER_SQL_CONNECTION"]

engine = create_engine(SQLALCHEMY_DATABASE_URL)
Base = declarative_base()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Images(Base):
    __tablename__ = "images"

    id = Column(BIGINT, primary_key=True)
    path = Column(TEXT)
    time = Column(TIMESTAMP, index=True)
    camera_name = Column(TEXT)
    highlight = Column(BOOLEAN, nullable=True)
    inferred = Column(BOOLEAN, nullable=False)

    objects = relationship("Objects", back_populates="image")


class Objects(Base):
    __tablename__ = "objects"

    id = Column(BIGINT, primary_key=True)
    score = Column(FLOAT)
    image_id = Column(BIGINT, ForeignKey("images.id"))
    time = Column(TIMESTAMP, index=True)
    class_name = Column(TEXT)
    bbox = Column(ARRAY(FLOAT), nullable=False)

    image = relationship("Images", back_populates="objects")
