import { useEffect, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { RootState } from "../app/store";
import detectionObject from "../types/detectionType";
import { updateSelectedByOne } from "../features/viewSlice";

export default function ImageDisplay() {
  const dispatch = useAppDispatch();
  const selected = useAppSelector((state: RootState) => state.view.selected);
  const detections = useAppSelector(
    (state: RootState) => state.detections.values
  );

  const canvasWidth = window.innerWidth * 0.9;
  const canvasHeight = window.innerHeight * 0.70;
  const [imageSize, setImageSize] = useState<number[] | null>(null);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  const imageCanvas = useRef<HTMLCanvasElement>(
    document.createElement("canvas")
  );

  useEffect(() => {
    if (
      detections.length > 0 &&
      selected !== undefined &&
      imageCanvas !== null
    ) {
      const img = new Image();
      img.onload = (event: any) => {
        let newResizeSize;
        newResizeSize = [
          event?.currentTarget?.width *
          (canvasHeight / event?.currentTarget?.height),
          canvasHeight,
        ];
        if (newResizeSize[0] > canvasWidth) {
          newResizeSize = [
            canvasWidth,
            event?.currentTarget?.height *
            (canvasWidth / event?.currentTarget?.width),
          ];
        }

        const ctx = imageCanvas?.current.getContext("2d");
        ctx?.clearRect(
          0,
          0,
          imageCanvas.current.width,
          imageCanvas.current.height
        );
        ctx?.drawImage(img, 0, 0, newResizeSize[0], newResizeSize[1]);
        setImageSize(newResizeSize);
      };
      img.src = detections[selected]?.src;
    } else {
      if (imageCanvas !== null) {
        const ctx = imageCanvas?.current.getContext("2d");
        ctx?.clearRect(
          0,
          0,
          imageCanvas.current.width,
          imageCanvas.current.height
        );
      }
    }
  }, [selected, detections, canvasWidth, canvasHeight]);

  useEffect(() => {
    if (
      imageSize !== null &&
      detections.length > 0 &&
      selected !== undefined &&
      imageCanvas !== null
    ) {
      const ctx = imageCanvas.current?.getContext("2d");
      //@ts-ignore
      ctx.lineWidth = 2;
      //@ts-ignore
      ctx.font = "16px serif";
      //@ts-ignore
      ctx.strokeStyle = "#CB4C4E";

      detections[selected]?.detections.forEach((object: detectionObject) => {
        ctx?.beginPath();

        ctx?.rect(
          object.bbox[0] * imageSize[0],
          object.bbox[1] * imageSize[1],
          object.bbox[2] * imageSize[0],
          object.bbox[3] * imageSize[1]
        );
        //@ts-ignore
        ctx.fillStyle = "#520202";
        ctx?.fillRect(
          object.bbox[0] * imageSize[0],
          (object.bbox[1] + object.bbox[3]) * imageSize[1],
          object.bbox[2] * imageSize[0],
          -24
        );
        ctx?.stroke();
        //@ts-ignore
        ctx.fillStyle = "#fff";
        ctx?.fillText(
          `${object.className}(${Math.round(object.score * 100)}%)`,
          object.bbox[0] * imageSize[0],
          (object.bbox[1] + object.bbox[3]) * imageSize[1] - 5,
          object.bbox[0] * imageSize[0]
        );
      });
    } else {
      if (imageCanvas !== null) {
        const ctx = imageCanvas?.current.getContext("2d");
        ctx?.clearRect(
          0,
          0,
          imageCanvas.current.width,
          imageCanvas.current.height
        );
      }
    }
  }, [selected, detections, imageSize]);

  function handleTouchStart(e: any) {
    setTouchStart(e.targetTouches[0].clientX);
  }

  function handleTouchMove(e: any) {
    setTouchEnd(e.targetTouches[0].clientX);
  }

  function handleTouchEnd() {
    if (touchStart - touchEnd > 75) {
      dispatch(updateSelectedByOne(1));
    }

    if (touchStart - touchEnd < -75) {
      dispatch(updateSelectedByOne(-1));
    }
  }

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{
        paddingTop: 12,
        width: canvasWidth,
        height: canvasHeight,
        position: "relative",
        marginRight: "auto",
        marginLeft: "auto",
        cursor: "pointer",
      }}
    >
      <canvas
        ref={imageCanvas}
        width={canvasWidth}
        height={canvasHeight}
        style={{
          position: "absolute",


        }}
      />
      <canvas
        ref={imageCanvas}
        width={canvasWidth}
        height={canvasHeight}
        style={{
          position: "absolute",

        }}
      />
    </div>
  );
}
