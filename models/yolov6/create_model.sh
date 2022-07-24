#!/bin/bash
set -e

# Example usage
# bash create_model.sh yolov6s 640 352

cd "$(dirname "$0")"

docker build -t yolo6_builder .

# $1: ["yolov6s", "yolov6t", "yolov6n"]
# $2: min:32, max:4096, step:32
# $3: min:32, max:4096, step:32
touch $(pwd)/$1.onnx


docker run -v $(pwd)/$1.onnx:/app/YOLOv6/$1.onnx yolo6_builder deploy/ONNX/export_onnx.py --batch-size 1 --simplify --weights $1.pt --img $2 $3