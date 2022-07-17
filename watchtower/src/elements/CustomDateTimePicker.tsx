import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import TextField from "@mui/material/TextField";

export interface dateTimePickerProps {
  value: Date | string;
  onChange: (event: string) => void;
  title: string;
}

export default function CustomDateTimePicker({
  value,
  onChange,
  title,
}: dateTimePickerProps) {
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <DateTimePicker
        label={title}
        // Redux stores dates as string, thus we cast it to Date here
        value={new Date(value)}
        // We expect dates as string in redux. Thus we cast it on change here at the lowest level
        onChange={(el) => el?.toString && onChange(el.toISOString())}
        renderInput={(params) => (
          <TextField {...params} sx={{ width: "90%" }} />
        )}
      />
    </LocalizationProvider>
  );
}
