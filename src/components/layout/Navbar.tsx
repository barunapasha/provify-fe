"use client";

import { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Container,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import { Link, usePathname } from "@/i18n/routing";
import ConnectButton from "../wallet/ConnectButton";
import { useThemeMode } from "../ThemeRegistry";

const navItems = [
  { label: "Campaigns", path: "/campaigns" },
  { label: "Create", path: "/create" },
  { label: "Dashboard", path: "/dashboard" },
  { label: "History", path: "/history" },
];

export default function Navbar() {
  const { mode, toggleThemeMode } = useThemeMode();
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const isActive = (path: string) => {
    return pathname?.includes(path);
  };

  const isDark = mode === "dark";

  return (
    <AppBar
      position="sticky"
      color="default"
      sx={{
        borderBottom: "1px solid",
        borderColor: isDark ? "rgba(42, 42, 53, 0.5)" : "divider",
        backgroundColor: isDark ? "rgba(22, 22, 30, 0.75)" : "background.paper",
        backdropFilter: isDark ? "blur(12px)" : "none",
        WebkitBackdropFilter: isDark ? "blur(12px)" : "none",
      }}
      elevation={0}
    >
      <Container maxWidth="lg">
        <Toolbar disableGutters sx={{ justifyContent: "space-between", height: 70 }}>
          <Link href="/" passHref style={{ textDecoration: "none" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 900,
                  letterSpacing: "-0.05em",
                  color: "text.primary",
                  fontFamily: "var(--font-syne)",
                }}
              >
                PROVIFY.
              </Typography>
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  backgroundColor: "primary.main",
                  borderRadius: "50%",
                }}
              />
            </Box>
          </Link>

          <Box sx={{ display: { xs: "none", md: "flex" }, alignItems: "center", gap: 3 }}>
            {navItems.map((item) => (
              <Link key={item.path} href={item.path} passHref style={{ textDecoration: "none" }}>
                <Button
                  sx={{
                    color: isActive(item.path) ? "primary.main" : "text.primary",
                    fontWeight: isActive(item.path) ? 800 : 600,
                    fontSize: "0.95rem",
                    position: "relative",
                    "&::after": isActive(item.path)
                      ? {
                          content: '""',
                          position: "absolute",
                          bottom: -2,
                          left: 22,
                          right: 22,
                          height: "2px",
                          backgroundColor: "primary.main",
                        }
                      : {},
                  }}
                >
                  {item.label}
                </Button>
              </Link>
            ))}
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <IconButton onClick={toggleThemeMode} color="inherit" sx={{ color: "text.primary" }}>
              {mode === "light" ? <DarkModeIcon /> : <LightModeIcon />}
            </IconButton>
            <ConnectButton />
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ display: { md: "none" }, color: "text.primary" }}
            >
              <MenuIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </Container>

      <Drawer
        anchor="right"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        slotProps={{
          paper: {
            sx: {
              width: "100%",
              maxWidth: 300,
              backgroundColor: "background.paper",
              borderLeft: "1px solid",
              borderColor: "divider",
            },
          },
        }}
      >
        <Box sx={{ p: 2, display: "flex", justifyContent: "flex-end" }}>
          <IconButton onClick={handleDrawerToggle}>
            <CloseIcon />
          </IconButton>
        </Box>
        <List sx={{ px: 2 }}>
          {navItems.map((item) => (
            <ListItem key={item.path} disablePadding sx={{ mb: 1 }}>
              <Link href={item.path} passHref style={{ textDecoration: "none", width: "100%" }}>
                <ListItemButton
                  onClick={handleDrawerToggle}
                  sx={{
                    borderRadius: 1,
                    backgroundColor: isActive(item.path) ? "rgba(95, 60, 254, 0.04)" : "transparent",
                    color: isActive(item.path) ? "primary.main" : "text.primary",
                  }}
                >
                  <ListItemText
                    primary={item.label}
                    slotProps={{
                      primary: {
                        sx: {
                          fontWeight: isActive(item.path) ? 700 : 600,
                          fontFamily: "var(--font-plus-jakarta-sans)",
                        },
                      },
                    }}
                  />
                </ListItemButton>
              </Link>
            </ListItem>
          ))}
        </List>
      </Drawer>
    </AppBar>
  );
}
