import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#5F3CFE", // Electric Violet
      contrastText: "#FFFFFF",
    },
    secondary: {
      main: "#00F0B5", // Radioactive Green
      contrastText: "#0E0E12",
    },
    background: {
      default: "#F9FAFC", // Off-white grid baseline
      paper: "#FFFFFF",
    },
    text: {
      primary: "#0E0E12", // Rich Charcoal
      secondary: "#5C5C70",
    },
    divider: "#E2E2EC",
  },
  typography: {
    fontFamily: "var(--font-plus-jakarta-sans), sans-serif",
    h1: {
      fontFamily: "var(--font-syne), sans-serif",
      fontWeight: 800,
      letterSpacing: "-0.04em",
      textTransform: "uppercase",
    },
    h2: {
      fontFamily: "var(--font-syne), sans-serif",
      fontWeight: 800,
      letterSpacing: "-0.03em",
      textTransform: "uppercase",
    },
    h3: {
      fontFamily: "var(--font-syne), sans-serif",
      fontWeight: 700,
      letterSpacing: "-0.02em",
    },
    h4: {
      fontFamily: "var(--font-syne), sans-serif",
      fontWeight: 700,
      letterSpacing: "-0.01em",
    },
    h5: {
      fontFamily: "var(--font-plus-jakarta-sans), sans-serif",
      fontWeight: 700,
      letterSpacing: "-0.01em",
    },
    h6: {
      fontFamily: "var(--font-plus-jakarta-sans), sans-serif",
      fontWeight: 600,
    },
    subtitle1: {
      fontFamily: "var(--font-plus-jakarta-sans), sans-serif",
      fontWeight: 500,
    },
    body1: {
      fontSize: "0.95rem",
      lineHeight: 1.6,
    },
    button: {
      fontWeight: 700,
      textTransform: "none",
      letterSpacing: "0.02em",
    },
  },
  shape: {
    borderRadius: 8, // Sharp, industrial feel (not overly rounded)
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 4, // More angular
          padding: "10px 22px",
          boxShadow: "none",
          border: "2px solid transparent",
          "&:hover": {
            boxShadow: "none",
          },
        },
        contained: {
          backgroundColor: "#0E0E12",
          color: "#FFFFFF",
          "&:hover": {
            backgroundColor: "#5F3CFE",
          },
        },
        outlined: {
          borderColor: "#0E0E12",
          color: "#0E0E12",
          "&:hover": {
            borderColor: "#5F3CFE",
            backgroundColor: "rgba(95, 60, 254, 0.04)",
            color: "#5F3CFE",
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          border: "1px solid #E2E2EC",
          boxShadow: "0px 4px 12px rgba(14, 14, 18, 0.03)",
          overflow: "visible",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: "none",
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          height: 6,
          borderRadius: 3,
          backgroundColor: "#E2E2EC",
        },
      },
    },
  },
});
