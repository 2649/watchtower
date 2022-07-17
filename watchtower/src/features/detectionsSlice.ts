import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import imageObject from "../types/imageType";

const initialState: { values: imageObject[] } = {
  values: [],
};

export const detectionSlice = createSlice({
  name: "detection",
  initialState,
  reducers: {
    updateDetection: (state, action: PayloadAction<imageObject[]>) => {
      state.values = action.payload;
    },
    updateHighlightState: (state, action: PayloadAction<number>) => {
      state.values = state.values.map((el: imageObject, idx: number) =>
        idx === action.payload ? { ...el, highlight: !el.highlight } : el
      );
    },
  },
});

export const { updateDetection, updateHighlightState } = detectionSlice.actions;

export default detectionSlice.reducer;
