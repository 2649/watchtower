import QuerySelector from "./components/QuerySelector";
import ImageNavigation from "./components/ImageNavigation";
import ImageDisplay from "./components/ImageDisplay";
import Snackbar from "./components/CustomSnackbar";
import { createTheme, ThemeProvider } from "@mui/material/styles";

const theme = createTheme({
  spacing: 4,
  components: {},
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <div>
        <QuerySelector />
        <ImageDisplay />
        <ImageNavigation />
        <Snackbar />
      </div>
    </ThemeProvider>
  );
}

export default App;
