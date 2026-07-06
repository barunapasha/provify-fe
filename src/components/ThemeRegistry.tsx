"use client";

import { createContext, useContext, useState } from "react";
import { ThemeProvider, CssBaseline, Box } from "@mui/material";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v16-appRouter";
import { lightTheme, darkTheme } from "@/lib/theme";
import Silk from "./ui/Silk";

type ThemeMode = "light" | "dark";

interface ThemeModeContextProps {
  mode: ThemeMode;
  toggleThemeMode: () => void;
}

const ThemeModeContext = createContext<ThemeModeContextProps | undefined>(undefined);

export function useThemeMode() {
  const context = useContext(ThemeModeContext);
  if (!context) {
    throw new Error("useThemeMode must be used within a ThemeRegistry");
  }
  return context;
}

export default function ThemeRegistry({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mode, setMode] = useState<ThemeMode>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("theme-mode") as ThemeMode;
      return saved || "light";
    }
    return "light";
  });

  const toggleThemeMode = () => {
    const nextMode = mode === "light" ? "dark" : "light";
    setMode(nextMode);
    localStorage.setItem("theme-mode", nextMode);
  };

  const activeTheme = mode === "light" ? lightTheme : darkTheme;

  return (
    <AppRouterCacheProvider options={{ enableCssLayer: true }}>
      <ThemeModeContext.Provider value={{ mode, toggleThemeMode }}>
        <ThemeProvider theme={activeTheme}>
          <CssBaseline />
          <Box sx={{ position: "relative", minHeight: "100vh", backgroundColor: "background.default" }}>
            {mode === "dark" && (
              <Box
                sx={{
                  position: "fixed",
                  top: 0,
                  left: 0,
                  width: "100vw",
                  height: "100vh",
                  zIndex: 0,
                  pointerEvents: "none",
                }}
              >
                <Silk speed={2} scale={0.7} color="#1c183a" noiseIntensity={0.8} />
              </Box>
            )}
            <Box sx={{ position: "relative", zIndex: 1, backgroundColor: "transparent" }}>
              {children}
            </Box>
          </Box>
        </ThemeProvider>
      </ThemeModeContext.Provider>
    </AppRouterCacheProvider>
  );
}
