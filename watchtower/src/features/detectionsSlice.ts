import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import ImageObject from "../types/imageType";

const initialState: { values: ImageObject[] } = {
  values: [],
};

export const detectionSlice = createSlice({
  name: "detection",
  initialState,
  reducers: {
    updateDetection: (state, action: PayloadAction<ImageObject[]>) => {
      state.values = action.payload;
    },
    updateHighlightState: (state, action: PayloadAction<number>) => {
      state.values = state.values.map((el: ImageObject, idx: number) =>
        idx === action.payload ? { ...el, highlight: !el.highlight } : el
      );
    },
  },
});

export const { updateDetection, updateHighlightState } = detectionSlice.actions;

export default detectionSlice.reducer;
