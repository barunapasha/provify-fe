"use client";

import { Box, Typography, Button } from "@mui/material";
import { Link } from "@/i18n/routing";

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  actionPath?: string;
}

export default function EmptyState({ title, description, actionLabel, actionPath }: EmptyStateProps) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        py: 12,
        px: 3,
        border: "1px dashed",
        borderColor: "divider",
        borderRadius: 4,
        backgroundColor: "background.default",
        gap: 2,
      }}
    >
      <Typography variant="h6" sx={{ fontWeight: 700 }}>
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 360 }}>
        {description}
      </Typography>
      {actionLabel && actionPath && (
        <Link href={actionPath} passHref style={{ textDecoration: "none" }}>
          <Button variant="contained" color="primary" sx={{ mt: 1 }}>
            {actionLabel}
          </Button>
        </Link>
      )}
    </Box>
  );
}
