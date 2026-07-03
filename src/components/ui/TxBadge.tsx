"use client";

import { Chip, Link } from "@mui/material";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";

interface TxBadgeProps {
  txHash: string;
}

export default function TxBadge({ txHash }: TxBadgeProps) {
  const truncated = `${txHash.slice(0, 6)}...${txHash.slice(-6)}`;
  const explorerUrl = `https://explorer.solana.com/tx/${txHash}?cluster=devnet`;

  return (
    <Link href={explorerUrl} target="_blank" rel="noopener" sx={{ textDecoration: "none" }}>
      <Chip
        label={truncated}
        size="small"
        icon={<OpenInNewIcon style={{ fontSize: 12, color: "#5F3CFE" }} />}
        clickable
        sx={{
          backgroundColor: "rgba(95, 60, 254, 0.05)",
          color: "#5F3CFE",
          fontWeight: 600,
          fontFamily: "monospace",
          fontSize: "0.75rem",
          borderRadius: 1,
          border: "1px solid rgba(95, 60, 254, 0.15)",
          height: 24,
          "& .MuiChip-icon": {
            order: 1, // Move icon to the right
            marginRight: "4px",
            marginLeft: "0px",
          },
        }}
      />
    </Link>
  );
}
