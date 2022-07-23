import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import TextField from "@mui/material/TextField";
import { MuiTextFieldProps } from "@mui/x-date-pickers/internals";

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

  const renderInput = (props: MuiTextFieldProps) => {
    return <TextField {...props} sx={{ width: "90%" }} />
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <DateTimePicker
        label={title}
        ampm={false}
        renderInput={renderInput}
        // Redux stores dates as string, thus we cast it to Date here
        value={new Date(value)}
        // We expect dates as string in redux. Thus we cast it on change here at the lowest level
        onChange={(el) => el?.toString && onChange(el.toISOString())}
        inputFormat="hh:mm - dd.MM"
      />
    </LocalizationProvider>
  );
}
