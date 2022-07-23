import Fab from "@mui/material/Fab";
import Grid from "@mui/material/Grid";
import Switch from "@mui/material/Switch";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { queryParamsOptional } from "../types/queryParamsType";
import { useEffect } from "react";
import createDummyData from "../utils/dev_data";
import queryOject from "../types/queryType";
import { RootState } from "../app/store";
import { updateQuery } from "../features/querySlice";
import MultiSelect from "../elements/MultiSelect";
import DateTimePicker from "../elements/CustomDateTimePicker";
import FormControlLabel from "@mui/material/FormControlLabel";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import ButtonGroup from "@mui/material/ButtonGroup";
import {
  endOfDay,
  endOfYesterday,
  startOfDay,
  startOfYesterday,
  subDays,
  subHours,
} from "date-fns";
import Container from "@mui/system/Container";
import SearchIcon from "@mui/icons-material/Search";
import { fetchQparams, fetchResults } from "../utils/apiExecution";

export default function QuerySelector() {
  const dispatch = useAppDispatch();
  const queryParams: queryParamsOptional = useAppSelector(
    (state: RootState) => state.queryParams.values
  );
  const query: queryOject = useAppSelector(
    (state: RootState) => state.query.values
  );

  useEffect(() => {
    createDummyData(dispatch);

    fetchQparams(dispatch);
  }, [dispatch]);

  return (
    <Container sx={{ position: "sticky", top: 0, height: "25vh", overflow: "scroll" }}>
      <Grid container spacing={4}>
        <Grid item xs={6}>
          <MultiSelect
            values={query.cameraNames}
            options={queryParams.cameraNames}
            title={"Camera"}
            onChange={(event: any) =>
              dispatch(updateQuery({ cameraNames: event.target.value }))
            }
          />
        </Grid>
        <Grid item xs={6}>
          <MultiSelect
            values={query.objects}
            options={queryParams.objects}
            title={"Objects"}
            onChange={(event: any) =>
              dispatch(updateQuery({ objects: event.target.value }))
            }
          />
        </Grid>
        <Grid item xs={6}>
          <DateTimePicker
            value={query.start}
            title="Start date"
            onChange={(value: string) =>
              dispatch(updateQuery({ start: value }))
            }
          />
        </Grid>
        <Grid item xs={6}>
          <DateTimePicker
            value={query.end}
            title="End date"
            onChange={(value: string) => dispatch(updateQuery({ end: value }))}
          />
        </Grid>
        <Grid item xs={5}>
          <TextField
            label="score"
            inputProps={{ step: 0.1 }}
            type="number"
            value={query.score}
            onChange={(event: any) =>
              dispatch(
                updateQuery({
                  score: Math.max(Math.min(event.target.value, 1), 0),
                })
              )
            }
            InputLabelProps={{
              shrink: true,
            }}
          />
        </Grid>
        <Grid item xs={5}>
          <FormControlLabel
            control={
              <Switch
                checked={query.highlighted}
                onChange={() => {
                  dispatch(updateQuery({ highlighted: !query.highlighted }));
                }}
              />
            }
            label="Only show highlighted"
          />
        </Grid>

        <Grid item xs={2}>
          <Fab
            color="primary"
            aria-label="search"
            onClick={() => fetchResults(dispatch, query)}
          >
            <SearchIcon />
          </Fab>
        </Grid>

        <Grid item xs={12} sx={{ paddingTop: 3, paddingBottom: 3 }}>
          <ButtonGroup
            variant="contained"
            aria-label="fast-buttons-for-time-management"
            fullWidth
            size="small"
          >
            <Button
              onClick={() => {
                dispatch(
                  updateQuery({
                    start: subHours(new Date(), 1).toISOString(),
                    end: new Date().toISOString(),
                  })
                );
              }}
            >
              Last hour
            </Button>
            <Button
              onClick={() => {
                dispatch(
                  updateQuery({
                    start: subHours(new Date(), 12).toISOString(),
                    end: new Date().toISOString(),
                  })
                );
              }}
            >
              Last 12h
            </Button>
            <Button
              onClick={() => {
                dispatch(
                  updateQuery({
                    start: startOfDay(new Date()).toISOString(),
                    end: endOfDay(new Date()).toISOString(),
                  })
                );
              }}
            >
              This Day
            </Button>
            <Button
              onClick={() => {
                dispatch(
                  updateQuery({
                    start: startOfYesterday().toISOString(),
                    end: endOfYesterday().toISOString(),
                  })
                );
              }}
            >
              Last Day
            </Button>
            <Button
              onClick={() => {
                dispatch(
                  updateQuery({
                    start: subDays(new Date(), 7).toISOString(),
                    end: new Date().toISOString(),
                  })
                );
              }}
            >
              Last 7 days
            </Button>
            <Button
              onClick={() => {
                dispatch(
                  updateQuery({
                    start: subDays(new Date(), 30).toISOString(),
                    end: new Date().toISOString(),
                  })
                );
              }}
            >
              Last 30 days
            </Button>
          </ButtonGroup>
        </Grid>
      </Grid>
    </Container>
  );
}
