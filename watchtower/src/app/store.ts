import { configureStore, ThunkAction, Action } from "@reduxjs/toolkit";
import detectionReducer from "../features/detectionsSlice";
import queryParamsReducer from "../features/queryParamSlice";
import queryReducer from "../features/querySlice";
import snackbarReducer from "../features/snackbarSlice";
import viewReducer from "../features/viewSlice";

export const store = configureStore({
  reducer: {
    detections: detectionReducer,
    queryParams: queryParamsReducer,
    query: queryReducer,
    snackbar: snackbarReducer,
    view: viewReducer,
  },
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
