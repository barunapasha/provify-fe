"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/routing";
import { Fab, Tooltip } from "@mui/material";

export default function LanguageSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  const handleToggle = () => {
    const nextLocale = locale === "id" ? "en" : "id";
    router.replace(pathname, { locale: nextLocale });
  };

  const flag = locale === "id" ? "🇮🇩" : "🇺🇸";
  const title = locale === "id" ? "Switch to English" : "Ubah ke Bahasa Indonesia";

  return (
    <Tooltip title={title} placement="left" arrow>
      <Fab
        onClick={handleToggle}
        sx={{
          position: "fixed",
          bottom: 24,
          right: 24,
          zIndex: 1100,
          width: 56,
          height: 56,
          fontSize: "1.8rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "background.paper",
          color: "text.primary",
          border: "1px solid",
          borderColor: "divider",
          boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.08)",
          "&:hover": {
            backgroundColor: "background.default",
            transform: "scale(1.05)",
          },
          transition: "transform 0.2s, background-color 0.2s",
        }}
      >
        {flag}
      </Fab>
    </Tooltip>
  );
}
