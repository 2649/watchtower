import React, { useEffect, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { RootState } from "../app/store";
import detectionObject from "../types/detectionType";
import Fab from "@mui/material/Fab";
import CropSquareIcon from "@mui/icons-material/CropSquare";
import CropFreeIcon from "@mui/icons-material/CropFree";
import {
  updateSelectedByAmount,
  updateHighlighted,
} from "../utils/imageNavigationUtils";

export default function ImageDisplay() {
  const selected = useAppSelector((state: RootState) => state.view.selected);
  const localFilter = useAppSelector((state: RootState) => state.view.filter);
  const detections = useAppSelector(
    (state: RootState) => state.detections.values
  );

  const canvasWidth = window.innerWidth * 0.9;
  const canvasHeight = window.innerHeight * 0.7;
  const [imageSize, setImageSize] = useState<number[] | null>(null);
  const [showAnnots, setShowAnnots] = useState<boolean>(true);

  const dispatch = useAppDispatch();

  const imageCanvas = useRef<HTMLCanvasElement>(
    document.createElement("canvas")
  );

  // Draw image
  useEffect(() => {
    const img = new Image();
    if (
      detections.length > 0 &&
      selected !== undefined &&
      imageCanvas !== null
    ) {
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
    return () => {
      img.src = "";
    };
  }, [selected, detections, canvasWidth, canvasHeight, showAnnots]);

  // Draw annotations
  useEffect(() => {
    if (
      imageSize !== null &&
      detections.length > 0 &&
      selected !== undefined &&
      imageCanvas !== null &&
      showAnnots
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
    }
  }, [selected, detections, imageSize, showAnnots]);

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === "ArrowRight") {
      updateSelectedByAmount(1, dispatch, selected, detections, localFilter);
    } else if (event.key === "ArrowLeft") {
      updateSelectedByAmount(-1, dispatch, selected, detections, localFilter);
    } else if (event.key === "PageUp") {
      updateSelectedByAmount(10, dispatch, selected, detections, localFilter);
    } else if (event.key === "PageDown") {
      updateSelectedByAmount(-10, dispatch, selected, detections, localFilter);
    } else if (event.key === " ") {
      updateHighlighted(dispatch, detections[selected], selected);
    }
  };

  return (
    <div
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
      <Fab
        color="primary"
        sx={{ position: "absolute", top: 16, right: 8 }}
        onClick={() => setShowAnnots(!showAnnots)}
      >
        {showAnnots ? <CropSquareIcon /> : <CropFreeIcon />}
      </Fab>
      <canvas
        ref={imageCanvas}
        width={canvasWidth}
        height={canvasHeight}
        style={{
          position: "absolute",
        }}
        onKeyDown={handleKeyPress}
        contentEditable
      />
    </div>
  );
}
