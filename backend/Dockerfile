FROM python:3.8

WORKDIR /app

COPY requirements.txt __init__.py /app/

RUN pip install -r requirements.txt

COPY app /app/app
COPY watchtower /watchtower

CMD uvicorn app.app:app --host 0.0.0.0 --port 80