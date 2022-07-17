import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const initialState: { selected: number } = {
  selected: 0,
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
  },
});

export const { updateSelected, updateSelectedByOne } = viewSlice.actions;

export default viewSlice.reducer;
