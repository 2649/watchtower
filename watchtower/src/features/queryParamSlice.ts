import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { queryParamsOptional } from "../types/queryParamsType";

const initialState: { values: queryParamsOptional } = { values: {} };

export const queryParamsSlice = createSlice({
  name: "queryParams",
  initialState,
  reducers: {
    updateQueryParams: (state, action: PayloadAction<queryParamsOptional>) => {
      state.values = { ...state.values, ...action.payload };
    },
  },
});

export const { updateQueryParams } = queryParamsSlice.actions;

export default queryParamsSlice.reducer;
