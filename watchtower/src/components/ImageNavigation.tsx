import Slider from "@mui/material/Slider";
import { Container } from "@mui/system";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { RootState } from "../app/store";
import { updateLocalCameraFilter, updateSelected } from "../features/viewSlice";
import Button from "@mui/material/Button";
import ButtonGroup from "@mui/material/ButtonGroup";

import KeyboardDoubleArrowRightIcon from "@mui/icons-material/KeyboardDoubleArrowRight";
import KeyboardDoubleArrowLeftIcon from "@mui/icons-material/KeyboardDoubleArrowLeft";
import KeyboardArrowRight from "@material-ui/icons/KeyboardArrowRight";
import KeyboardArrowLeft from "@material-ui/icons/KeyboardArrowLeft";
import MovieCreationIcon from "@mui/icons-material/MovieCreation";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import SkipNextIcon from "@mui/icons-material/SkipNext";
import SkipPreviousIcon from "@mui/icons-material/SkipPrevious";
import { updateSnackbar } from "../features/snackbarSlice";
import { useEffect, useState } from "react";

import imageObject from "../types/imageType";
import { updateQuery } from "../features/querySlice";
import { intervalToDuration, sub } from "date-fns/esm";
import { fetchResults } from "../utils/apiExecution";
import {
  updateSelectedByAmount,
  updateHighlighted,
} from "../utils/imageNavigationUtils";
import { cameraFilterObject } from "../types/localDetectionsFilter";

export default function ImageNavigation() {
  const detections = useAppSelector(
    (state: RootState) => state.detections.values
  );
  const selected = useAppSelector((state: RootState) => state.view.selected);
  const query = useAppSelector((state: RootState) => state.query.values);
  const queryParams = useAppSelector(
    (state: RootState) => state.queryParams.values
  );
  const dispatch = useAppDispatch();

  const [marks, setMarks] = useState<any>([]);
  const localFilter = useAppSelector((state: RootState) => state.view.filter);

  const skipButton = (forward: boolean) => {
    let startTime = query.start;
    let endTime = query.end;
    if (forward) {
      startTime = detections[detections.length - 1].time;
    } else {
      const startDate = new Date(detections[0].time);
      const timeInterval = intervalToDuration({
        start: startDate,
        end: new Date(detections[detections.length - 1].time),
      });

      startTime = sub(startDate, timeInterval).toISOString();
      endTime = detections[detections.length - 1].time;
    }
    dispatch(
      updateQuery({
        start: startTime,
        end: endTime,
      })
    );
    dispatch(updateSelected(0));
    fetchResults(dispatch, { ...query, start: startTime, end: endTime });
  };

  useEffect(() => {
    // Calculate marks
    try {
      // Per 200 width, we increment the divisor
      const divisor = Math.floor(
        detections.length / Math.floor(window.innerWidth / 200)
      );

      const splits = detections
        .map((el: imageObject, idx: number) => {
          if (
            (idx % divisor === 0 && idx && detections.length - idx > divisor) ||
            idx === detections.length - 1 ||
            idx === 0
          ) {
            const date = new Date(el?.time);
            return {
              value: idx,
              label: `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}(${date.getDate()}.${date.getMonth()})`,
            };
          } else {
            return false;
          }
        })
        .filter((el: any) => el !== false);

      setMarks(splits);

      dispatch(
        updateSnackbar({
          msg: `Found ${detections.length} images for your query`,
          time: 6000,
          level: detections.length > 0 ? "success" : "warning",
        })
      );
    } catch (error) {
      console.log(
        "Failed to create marks. Most likely due to premature generation"
      );
    }
  }, [detections, dispatch]);

  useEffect(() => {
    const availableCameras =
      query.camera_names.length === 0
        ? queryParams.camera_names
        : query.camera_names;
    if (availableCameras) {
      const notShownCameras = localFilter.cameras
        .filter((el: cameraFilterObject) => !el.show)
        .map((el: cameraFilterObject) => el.name);
      dispatch(
        updateLocalCameraFilter(
          availableCameras.map((el: string) => {
            return {
              name: el,
              show: !notShownCameras.includes(el),
            };
          })
        )
      );
    }
  }, [queryParams, detections]);

  const getValueText = (value: number) => {
    if (value !== undefined && detections.length > 0) {
      const date = new Date(detections[value]?.time);
      return `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}(${date.getDate()}.${date.getMonth()})`;
    } else {
      return value;
    }
  };

  return (
    <Container
      sx={{
        position: "fixed",
        bottom: 20,
        left: "50%",
        transform: "translateX(-50%)",
      }}
    >
      <Container sx={{ width: window.innerWidth * 0.8 }}>
        <Slider
          onChange={(event: any) => {
            dispatch(updateSelected(event.target.value));
          }}
          defaultValue={0}
          value={selected}
          aria-label="image-slider"
          valueLabelDisplay="on"
          valueLabelFormat={getValueText}
          min={0}
          max={detections.length - 1 > 0 ? detections.length - 1 : 0}
          marks={marks}
          key="image-nav-slider"
        />
      </Container>

      <ButtonGroup
        variant="contained"
        aria-label="fast-buttons-for-time-management"
        fullWidth
      >
        <Button
          size="large"
          onClick={() => skipButton(false)}
          startIcon={<SkipPreviousIcon />}
        />
        <Button
          size="large"
          onClick={() =>
            updateSelectedByAmount(
              -10,
              dispatch,
              selected,
              detections,
              localFilter
            )
          }
          startIcon={<KeyboardDoubleArrowLeftIcon />}
        />
        <Button
          size="large"
          onClick={() =>
            updateSelectedByAmount(
              -1,
              dispatch,
              selected,
              detections,
              localFilter
            )
          }
          startIcon={<KeyboardArrowLeft />}
        />
        <Button
          size="large"
          onClick={() =>
            updateSelectedByAmount(
              0,
              dispatch,
              selected,
              detections,
              localFilter
            )
          }
          startIcon={<MovieCreationIcon />}
        >
          {" "}
        </Button>
        <Button
          size="large"
          onClick={() =>
            updateHighlighted(dispatch, detections[selected], selected)
          }
          startIcon={
            detections[selected]?.highlight ? <StarIcon /> : <StarBorderIcon />
          }
        >
          {" "}
        </Button>

        <Button
          size="large"
          onClick={() =>
            updateSelectedByAmount(
              1,
              dispatch,
              selected,
              detections,
              localFilter
            )
          }
          startIcon={<KeyboardArrowRight />}
        />
        <Button
          size="large"
          onClick={() =>
            updateSelectedByAmount(
              10,
              dispatch,
              selected,
              detections,
              localFilter
            )
          }
          startIcon={<KeyboardDoubleArrowRightIcon />}
        />
        <Button
          size="large"
          onClick={() => skipButton(true)}
          startIcon={<SkipNextIcon />}
        />
      </ButtonGroup>
      <ButtonGroup
        variant="contained"
        aria-label="fast-buttons-for-time-management"
        fullWidth
      >
        {localFilter.cameras.map((camera: cameraFilterObject) => (
          <Button
            variant={camera.show ? "contained" : "outlined"}
            onClick={() => {
              dispatch(
                updateLocalCameraFilter(
                  localFilter.cameras.map((el: cameraFilterObject) =>
                    el.name === camera.name
                      ? { name: el.name, show: !el.show }
                      : el
                  )
                )
              );
            }}
          >
            {camera.name}
          </Button>
        ))}
      </ButtonGroup>
    </Container>
  );
}
