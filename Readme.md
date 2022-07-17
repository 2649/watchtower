# Watchtower

This is a side projects, which captures IP camera video streams process them with a yolov6 and exposes an UI for a user to view the images.

The current state is development and it needs some refactoring before more features are developed

## Run it

1. You only need docker and docker-compose installed on you system
2. Start it with `bash startup.sh`
3. Shutdown it with `bash teardown.sh`

## Credits

For the CV part I mostly used the implementation from https://github.com/ibaiGorordo/ONNX-YOLOv6-Object-Detection. So leave him a star if you like it.
