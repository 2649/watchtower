import { getQueryParams, getImages } from "./apiCalls";
import { updateQueryParams } from "../features/queryParamSlice";
import { updateSnackbar } from "../features/snackbarSlice";
import { updateDetection } from "../features/detectionsSlice";
import queryOject from "../types/queryType";
import { updateQuery } from "../features/querySlice";

export const fetchQparams = (dispatch: any) => {
  getQueryParams()
    .then((resp) => {
      console.log("Received query params");
      dispatch(updateQueryParams(resp.data));
      // Add person as default query if exist
      if (
        resp.data.objects.filter((el: string) => el === "person").length === 1
      ) {
        dispatch(updateQuery({ objects: ["person"] }));
      }
    })
    .catch((resp) => {
      console.log("Failed to GET query params");
      dispatch(
        updateSnackbar({
          msg: `Failed to get query params - ${resp.message}`,
          time: 6000,
          level: "error",
        })
      );
    });
};

export const fetchResults = (dispatch: any, query: queryOject) => {
  getImages(query)
    .then((resp) => {
      console.log("Received data for images");
      dispatch(updateDetection(resp.data));
    })
    .catch((resp) => {
      console.log("Failed to get images");
      dispatch(
        updateSnackbar({
          msg: `Failed to retrieve images: ${resp.message}`,
          time: 6000,
          level: "error",
        })
      );
    });
};
