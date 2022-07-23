import Snackbar from "@mui/material/Snackbar";
import { RootState } from "../app/store";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { updateSnackbar } from "../features/snackbarSlice";
import Alert from "@mui/material/Alert";

export default function CustomSnackbar() {
  const snackbarState = useAppSelector(
    (state: RootState) => state.snackbar.value
  );
  const dispatch = useAppDispatch();

  const handleClose = () => {
    dispatch(updateSnackbar({ msg: "null", time: 0, level: null }));
  };
  console.log(snackbarState.level);
  return (
    <Snackbar
      open={snackbarState.level !== null}
      onClose={handleClose}
      autoHideDuration={snackbarState.time}
      anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
    >
      <Alert
        severity={snackbarState.level !== null ? snackbarState.level : "info"}
        onClose={handleClose}
      >
        {snackbarState.msg}
      </Alert>
    </Snackbar>
  );
}
