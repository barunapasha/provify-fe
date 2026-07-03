"use client";

import { Chip } from "@mui/material";
import { CampaignStatus, MilestoneStatus } from "@/types/campaign";

interface StatusBadgeProps {
  status: CampaignStatus | MilestoneStatus;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  let label = "";
  let color: "default" | "primary" | "secondary" | "success" | "warning" | "info" = "default";
  let bg = "";
  let text = "";

  const statusStr = typeof status === "string" ? status : Object.keys(status)[0];

  switch (statusStr.toLowerCase()) {
    case "active":
      label = "Active";
      bg = "rgba(95, 60, 254, 0.08)";
      text = "#5F3CFE";
      break;
    case "completed":
      label = "Completed";
      bg = "rgba(0, 240, 181, 0.1)";
      text = "#00b084";
      break;
    case "closed":
      label = "Closed";
      bg = "#F1F1F6";
      text = "#5C5C70";
      break;
    case "pending":
      label = "Pending";
      bg = "#F1F1F6";
      text = "#5C5C70";
      break;
    case "proofsubmitted":
      label = "Proof Submitted";
      bg = "rgba(0, 150, 255, 0.08)";
      text = "#007BFF";
      break;
    case "released":
      label = "Released";
      bg = "rgba(0, 240, 181, 0.1)";
      text = "#00b084";
      break;
    default:
      label = statusStr;
      bg = "#F1F1F6";
      text = "#5C5C70";
  }

  return (
    <Chip
      label={label}
      size="small"
      sx={{
        backgroundColor: bg,
        color: text,
        fontWeight: 800,
        fontSize: "0.7rem",
        borderRadius: 1, // Sharp
        fontFamily: "var(--font-plus-jakarta-sans)",
        letterSpacing: "0.02em",
        height: 24,
      }}
    />
  );
}
