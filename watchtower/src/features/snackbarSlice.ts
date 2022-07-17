import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import snackbarMessageType from "../types/snackbarMessageType";

const initialState: { value: snackbarMessageType } = {
  value: {
    msg: "",
    level: null,
    time: 0,
  },
};

export const snackbarSlice = createSlice({
  name: "query",
  initialState,
  reducers: {
    updateSnackbar: (state, action: PayloadAction<snackbarMessageType>) => {
      state.value = action.payload;
    },
  },
});

export const { updateSnackbar } = snackbarSlice.actions;

export default snackbarSlice.reducer;
