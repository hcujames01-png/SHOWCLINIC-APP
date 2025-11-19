import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#D4AF37", // dorado elegante
    },
    secondary: {
      main: "#2E2E2E", // gris oscuro
    },
    background: {
      default: "#F5F5F5", // fondo claro
    },
  },
  typography: {
    fontFamily: "'Poppins', sans-serif",
    h4: {
      fontWeight: 600,
      color: "#2E2E2E",
    },
    h5: {
      fontWeight: 500,
      color: "#2E2E2E",
    },
  },
});

export default theme;

