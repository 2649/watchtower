import json
from typing import List
import cv2
import numpy as np
import onnxruntime

from .utils import xywh2xyxy, nms, draw_detections


class YOLOv6:
    def __init__(self, path, class_map, conf_thres=0.7, iou_thres=0.5):
        self.class_map = json.load(open(class_map))
        self.conf_threshold = conf_thres
        self.iou_threshold = iou_thres

        # Initialize model
        self.initialize_model(path)

    def __call__(self, image):
        return self.detect_objects(image)

    def initialize_model(self, path):
        sess_options = onnxruntime.SessionOptions()
        sess_options.graph_optimization_level = (
            onnxruntime.GraphOptimizationLevel.ORT_ENABLE_ALL
        )
        sess_options.execution_mode = onnxruntime.ExecutionMode.ORT_PARALLEL

        self.session = onnxruntime.InferenceSession(
            path,
            sess_options,
            providers=["OpenVINOExecutionProvider", "CPUExecutionProvider"],
            # provider_options=[{'device_type' : "CPU_32"}]
        )
        # Get model info
        self.get_input_details()
        self.get_output_details()

    def detect_objects(self, images: List[np.ndarray]):
        input_tensor = self.prepare_input(images)

        outputs = self.inference(input_tensor)

        outputs = self.process_output(outputs)

        return [
            [
                {
                    "class_name": self.class_map[class_id],
                    "score": float(score),
                    "bbox": [
                        box[0] / self.img_width,
                        box[1] / self.img_height,
                        (box[2] - box[0]) / self.img_width,
                        (box[3] - box[1]) / self.img_height,
                    ],
                }
                for box, score, class_id in zip(boxes, scores, class_ids)
            ]
            for boxes, scores, class_ids in outputs
        ]

    def prepare_input(self, images):
        self.img_height, self.img_width = images[0].shape[:2]
        image_list = []
        for image in images:
            input_img = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
            # Resize input image
            input_img = cv2.resize(input_img, (self.input_width, self.input_height))

            # Scale input pixel values to 0 to 1
            input_img = input_img / 255.0
            input_img = input_img.transpose(2, 0, 1)
            input_tensor = input_img[np.newaxis, :, :, :].astype(np.float32)
            image_list.append(input_tensor)

        return np.concatenate(image_list, axis=0)

    def inference(self, input_tensor):

        outputs = self.session.run(
            self.output_names, {self.input_names[0]: input_tensor}
        )[0]

        return outputs

    def process_output(self, outputs: List):
        output_list = []
        for output in outputs:
            predictions = np.squeeze(output)

            # Filter out object confidence scores below threshold
            obj_conf = predictions[:, 4]
            predictions = predictions[obj_conf > self.conf_threshold]
            obj_conf = obj_conf[obj_conf > self.conf_threshold]

            # Multiply class confidence with bounding box confidence
            predictions[:, 5:] *= obj_conf[:, np.newaxis]

            # Get the scores
            scores = np.max(predictions[:, 5:], axis=1)

            # Filter out the objects with a low score
            predictions = predictions[obj_conf > self.conf_threshold]
            scores = scores[scores > self.conf_threshold]

            # Get the class with the highest confidence
            class_ids = np.argmax(predictions[:, 5:], axis=1)

            # Get bounding boxes for each object
            boxes = self.extract_boxes(predictions)

            # Apply non-maxima suppression to suppress weak, overlapping bounding boxes
            indices = nms(boxes, scores, self.iou_threshold)

            output_list.append([boxes[indices], scores[indices], class_ids[indices]])

        return output_list

    def extract_boxes(self, predictions):
        # Extract boxes from predictions
        boxes = predictions[:, :4]

        # Scale boxes to original image dimensions
        boxes /= np.array(
            [self.input_width, self.input_height, self.input_width, self.input_height]
        )
        boxes *= np.array(
            [self.img_width, self.img_height, self.img_width, self.img_height]
        )

        # Convert boxes to xyxy format
        boxes = xywh2xyxy(boxes)

        return boxes

    def draw_detections(self, image, draw_scores=True, mask_alpha=0.4):
        return draw_detections(
            image, self.boxes, self.scores, self.class_ids, mask_alpha
        )

    def get_input_details(self):
        model_inputs = self.session.get_inputs()
        self.input_names = [model_inputs[i].name for i in range(len(model_inputs))]

        self.input_shape = model_inputs[0].shape
        self.input_height = self.input_shape[2]
        self.input_width = self.input_shape[3]

    def get_output_details(self):
        model_outputs = self.session.get_outputs()
        self.output_names = [model_outputs[i].name for i in range(len(model_outputs))]
