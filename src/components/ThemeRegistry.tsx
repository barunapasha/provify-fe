"use client";

import { createContext, useContext, useState } from "react";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v16-appRouter";
import { lightTheme, darkTheme } from "@/lib/theme";

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
          {children}
        </ThemeProvider>
      </ThemeModeContext.Provider>
    </AppRouterCacheProvider>
  );
}
