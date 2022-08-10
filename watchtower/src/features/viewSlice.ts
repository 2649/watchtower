import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  localDetectionsFilterObject,
  cameraFilterObject,
} from "../types/localDetectionsFilter";

const initialState: { selected: number; filter: localDetectionsFilterObject } =
  {
    selected: 0,
    filter: { cameras: [] },
  };

export const viewSlice = createSlice({
  name: "detection",
  initialState,
  reducers: {
    updateSelected: (state, action: PayloadAction<number>) => {
      state.selected = action.payload;
    },
    updateSelectedByOne: (state, action: PayloadAction<number>) => {
      state.selected += action.payload;
    },
    updateLocalCameraFilter: (state, action: PayloadAction<any>) => {
      state.filter.cameras = action.payload;
    },
  },
});

export const { updateSelected, updateSelectedByOne, updateLocalCameraFilter } =
  viewSlice.actions;

export default viewSlice.reducer;
