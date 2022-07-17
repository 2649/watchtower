import Grid from "@mui/material/Grid";
import OutlinedInput from "@mui/material/OutlinedInput";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";

export interface multiSelectProps {
  values: string[];
  options?: string[];
  title: string;
  onChange: (event: any) => void;
}

export default function ({
  options,
  values,
  onChange,
  title,
}: multiSelectProps) {
  return (
    <FormControl sx={{ m: 1, width: "90%" }}>
      <InputLabel id="demo-multiple-name-label">{title}</InputLabel>
      <Select
        labelId={`${title}-name-label`}
        id={`${title}-name-label`}
        multiple
        value={values}
        onChange={onChange}
        input={<OutlinedInput label="Name" />}
      >
        {options?.map((name: string) => (
          <MenuItem key={name} value={name}>
            {name}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
