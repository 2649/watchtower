import imageObject from "../types/imageType";
import { putHighlight } from "./apiCalls";
import { updateSnackbar } from "../features/snackbarSlice";
import { updateHighlightState } from "../features/detectionsSlice";
import {
  localDetectionsFilterObject,
  cameraFilterObject,
} from "../types/localDetectionsFilter";
import { updateSelected } from "../features/viewSlice";

const clip = (value: number, min: number, max: number) => {
  return Math.min(max, Math.max(value, min));
};

export const updateSelectedByAmount = (
  amount: number = 1,
  dispatch: any,
  selected: number,
  detections: imageObject[],
  filter: localDetectionsFilterObject
) => {
  console.log("Move by amount: ", amount);
  let newSelected = clip(selected + amount, 0, detections.length - 1);
  console.log("New staged value: ", newSelected);

  // We create lookup to access the local filter with O(1). Theoretically we can cache this value as it only
  // changes, if new data is fetched. However, we expect a maximum array size of 10 or so for normal use. Thus,
  // we leave it as is, to reduce redux state size / complexity
  let lookup: any = {};
  filter.cameras.forEach((el: cameraFilterObject) => {
    lookup[el.name] = el.show;
  });
  console.log("Lookup dict used: ", lookup);

  // Estimate the sign of the increment
  let incrementDirection = amount / Math.abs(amount);
  let timesDirectionChanged = 0;
  console.log("Increment direction: ", incrementDirection);
  // Begin loop
  while (!lookup[detections[newSelected].camera_name]) {
    console.log("While loop step with value: ", newSelected);
    if (newSelected === detections.length - 1 || newSelected === 0) {
      incrementDirection = incrementDirection * -1;
      timesDirectionChanged += 1;
      console.log(
        "Change increment direction: ",
        incrementDirection,
        "time direction changed: ",
        timesDirectionChanged
      );
    } else {
      newSelected = clip(
        newSelected + incrementDirection,
        0,
        detections.length - 1
      );
    }
    if (timesDirectionChanged === 2) break;
  }
  console.log("Will dispatch: ", newSelected);
  dispatch(updateSelected(newSelected));
};

export const updateHighlighted = (
  dispatch: any,
  detection: imageObject,
  selected: number
) => {
  putHighlight(detection)
    .then((resp: any) => {
      console.log("Successfully update highlight");
      dispatch(updateHighlightState(selected));
    })
    .catch((resp: any) => {
      console.log("Failed to update highlighted");
      dispatch(
        updateSnackbar({
          msg: "Failed to update highlight",
          time: 6000,
          level: "error",
        })
      );
    });
};
