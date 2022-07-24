FROM python:3.7


WORKDIR /app

RUN git clone https://github.com/2649/YOLOv6.git &&\
    pip3 install -r YOLOv6/requirements.txt &&\
    pip3 install onnx>=1.10.0 &&\
    pip3 install onnxruntime

WORKDIR /app/YOLOv6/

RUN wget https://github.com/meituan/YOLOv6/releases/download/0.1.0/yolov6s.pt &&\
    wget https://github.com/meituan/YOLOv6/releases/download/0.1.0/yolov6t.pt &&\
    wget https://github.com/meituan/YOLOv6/releases/download/0.1.0/yolov6n.pt

ENTRYPOINT ["python3"]