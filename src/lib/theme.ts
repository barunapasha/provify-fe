import { createTheme } from "@mui/material/styles";

const commonTypography = {
  fontFamily: "var(--font-plus-jakarta-sans), sans-serif",
  h1: {
    fontFamily: "var(--font-syne), sans-serif",
    fontWeight: 800,
    letterSpacing: "-0.04em",
    textTransform: "uppercase" as const,
  },
  h2: {
    fontFamily: "var(--font-syne), sans-serif",
    fontWeight: 800,
    letterSpacing: "-0.03em",
    textTransform: "uppercase" as const,
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
    textTransform: "none" as const,
    letterSpacing: "0.02em",
  },
};

const commonComponents = {
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
      },
    },
  },
};

export const lightTheme = createTheme({
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
  typography: commonTypography,
  shape: {
    borderRadius: 8,
  },
  components: {
    ...commonComponents,
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          padding: "10px 22px",
          boxShadow: "none",
          "&:hover": {
            boxShadow: "none",
          },
        },
        contained: {
          backgroundColor: "#0E0E12",
          color: "#FFFFFF",
          border: "2px solid transparent",
          "&:hover": {
            backgroundColor: "#5F3CFE",
          },
        },
        outlined: {
          border: "2px solid #0E0E12",
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
    MuiLinearProgress: {
      styleOverrides: {
        ...commonComponents.MuiLinearProgress.styleOverrides,
        root: {
          ...commonComponents.MuiLinearProgress.styleOverrides.root,
          backgroundColor: "#E2E2EC",
        },
      },
    },
  },
});

export const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#5F3CFE",
      contrastText: "#FFFFFF",
    },
    secondary: {
      main: "#00F0B5",
      contrastText: "#0E0E12",
    },
    background: {
      default: "#0E0E12", // Rich Charcoal from palette
      paper: "#16161E",   // Lighter card background
    },
    text: {
      primary: "#F9FAFC",   // Off-white
      secondary: "#A0A0B0", // Muted gray
    },
    divider: "#2A2A35",
  },
  typography: commonTypography,
  shape: {
    borderRadius: 8,
  },
  components: {
    ...commonComponents,
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          padding: "10px 22px",
          boxShadow: "none",
          "&:hover": {
            boxShadow: "none",
          },
        },
        contained: {
          backgroundColor: "#F9FAFC",
          color: "#0E0E12",
          border: "2px solid transparent",
          "&:hover": {
            backgroundColor: "#5F3CFE",
            color: "#FFFFFF",
          },
        },
        outlined: {
          border: "2px solid #F9FAFC",
          color: "#F9FAFC",
          "&:hover": {
            borderColor: "#5F3CFE",
            backgroundColor: "rgba(95, 60, 254, 0.08)",
            color: "#5F3CFE",
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          border: "1px solid #2A2A35",
          boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.2)",
          overflow: "visible",
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        ...commonComponents.MuiLinearProgress.styleOverrides,
        root: {
          ...commonComponents.MuiLinearProgress.styleOverrides.root,
          backgroundColor: "#2A2A35",
        },
      },
    },
  },
});
