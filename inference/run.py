import os
from src.InferenceExecutor import ExecutionClassWoInference, ExecutionClassYoloV6

available_models = ["yolov6", "none"]

if "__main__" == __name__:
    model_name = os.environ["WATCHTOWER_MODEL_NAME"].lower()
    if model_name == "yolov6":
        exec_class = ExecutionClassYoloV6()
        exec_class.run()
    if model_name == "none":
        exec_class = ExecutionClassWoInference()
        exec_class.run()
    else:
        raise ValueError(f"{model_name} not found. Please use one of {available_models}")
