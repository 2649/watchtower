import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { startOfToday } from "date-fns";
import queryOject, { queryOjectOptional } from "../types/queryType";

const initialState: { values: queryOject } = {
  values: {
    cameraNames: [],
    start: new Date().toISOString(),
    end: startOfToday().toISOString(),
    objects: [],
    highlighted: false,
    score: 0.7,
  },
};

export const querySlice = createSlice({
  name: "query",
  initialState,
  reducers: {
    updateQuery: (state, action: PayloadAction<queryOjectOptional>) => {
      state.values = { ...state.values, ...action.payload };
    },
  },
});

export const { updateQuery } = querySlice.actions;

export default querySlice.reducer;
