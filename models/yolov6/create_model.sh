#!/bin/bash
set -e

# Example usage
# bash create_model.sh yolov6s 640 352
# bash create_model.sh yolov6s 640 352 own.pt

cd "$(dirname "$0")"

if [[ "$(docker images -f 'reference=yolo6_builder' -q)" = "" ]];
    then 
        docker build -t yolo6_builder . ;
    else echo "Docker already exists" ;
    fi

# $1: ["yolov6s", "yolov6t", "yolov6n"]
# $2: min:32, max:4096, step:32
# $3: min:32, max:4096, step:32

if [[ $1 = "yolov6s" || $1 = "yolov6t" || $1 = "yolov6n" ]];
    then 
    touch $(pwd)/$1.onnx &&\
    docker run -v $(pwd)/$1.onnx:/app/YOLOv6/$1.onnx yolo6_builder deploy/ONNX/export_onnx.py --batch-size 1 --simplify --weights $1.pt --img $2 $3;
    else
    touch $(pwd)/$1.onnx &&\
    docker run -v $(pwd)/$1.pt:/app/YOLOv6/$1.pt -v $(pwd)/$1.onnx:/app/YOLOv6/$1.onnx yolo6_builder deploy/ONNX/export_onnx.py --batch-size 1 --simplify --weights $1.pt --img $2 $3; fi