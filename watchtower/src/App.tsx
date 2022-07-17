import QuerySelector from "./components/QuerySelector";
import ImageNavigation from "./components/ImageNavigation";
import ImageDisplay from "./components/ImageDisplay";
import Snackbar from "./components/CustomSnackbarSnackbar";
import { createTheme, ThemeProvider } from "@mui/material/styles";

const theme = createTheme({
  spacing: 4,
  components: {},
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <div className="App">
        <QuerySelector />
        <ImageDisplay />
        <ImageNavigation />
        <Snackbar />
      </div>
    </ThemeProvider>
  );
}

export default App;
