FROM python:3.8

WORKDIR /app

COPY requirements.txt __init__.py /app/

ENV PIP_EXTRA_INDEX_URL=https://www.piwheels.org/simple

RUN pip install -r requirements.txt &&\
    pip install gunicorn

COPY app /app/app
COPY watchtower /watchtower

CMD gunicorn app.app:app -w 3 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:80