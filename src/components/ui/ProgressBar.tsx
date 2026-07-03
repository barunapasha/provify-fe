"use client";

import { Box, LinearProgress, Typography } from "@mui/material";

interface ProgressBarProps {
  current: number;
  target: number;
}

export default function ProgressBar({ current, target }: ProgressBarProps) {
  const percentage = target > 0 ? Math.min(Math.round((current / target) * 100), 100) : 0;

  return (
    <Box sx={{ width: "100%", my: 1 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
        <Typography variant="body2" color="text.primary" sx={{ fontWeight: 700 }}>
          {current.toLocaleString()} SOL raised
        </Typography>
        <Typography variant="body2" color="primary.main" sx={{ fontWeight: 700 }}>
          {percentage}% of {target.toLocaleString()} SOL
        </Typography>
      </Box>
      <LinearProgress
        variant="determinate"
        value={percentage}
        sx={{
          height: 8,
          borderRadius: 0, // Sharp edge
          backgroundColor: "#E2E2EC",
          "& .MuiLinearProgress-bar": {
            backgroundColor: percentage >= 100 ? "secondary.main" : "primary.main",
            borderRadius: 0,
          },
        }}
      />
    </Box>
  );
}
