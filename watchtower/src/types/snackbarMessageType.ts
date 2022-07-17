export default interface snackbarMessageType {
  msg: string;
  level: "info" | "success" | "error" | "warning" | null;
  time: number;
}
