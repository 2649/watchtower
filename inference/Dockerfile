FROM python:3.9

WORKDIR /app

COPY requirements.txt __init__.py run.py ./

COPY __init__.py __init__.py

RUN apt-get update &&\
    apt-get install ffmpeg libsm6 libxext6  -y &&\
    pip install -r requirements.txt

COPY src/ /app/src

CMD [ "python",  "run.py" ]