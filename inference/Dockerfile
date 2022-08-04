FROM python:3.9

WORKDIR /app

COPY requirements.txt __init__.py run.py ./

COPY __init__.py __init__.py

RUN apt-get update &&\
    apt-get install ffmpeg libsm6 libxext6  -y &&\
    /usr/local/bin/python -m pip install --upgrade pip &&\
    pip install -r requirements.txt &&\
    wget https://olivewheels.blob.core.windows.net/repo/onnxruntime_olive-0.4.0-py3-none-any.whl &&\
    pip install onnxruntime_olive-0.4.0-py3-none-any.whl

COPY src/ /app/src

CMD [ "python",  "run.py" ]