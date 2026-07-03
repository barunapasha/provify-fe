"use client";

import { Box, Paper, Typography, Button, Link } from "@mui/material";
import StatusBadge from "./StatusBadge";
import { Milestone } from "@/types/campaign";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";

interface MilestoneItemProps {
  milestone: Milestone;
}

export default function MilestoneItem({ milestone }: MilestoneItemProps) {
  const target = parseFloat(milestone.targetAmount) / LAMPORTS_PER_SOL;
  const released = parseFloat(milestone.releasedAmount) / LAMPORTS_PER_SOL;
  const statusStr = typeof milestone.status === "string" ? milestone.status : Object.keys(milestone.status)[0];

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 3,
        mb: 2,
        borderRadius: 4,
        borderColor: "divider",
        backgroundColor: "background.paper",
        display: "flex",
        flexDirection: { xs: "column", sm: "row" },
        justifyContent: "space-between",
        alignItems: { xs: "flex-start", sm: "center" },
        gap: 2,
      }}
    >
      <Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Milestone #{milestone.index + 1}: {milestone.title}
          </Typography>
          <StatusBadge status={milestone.status} />
        </Box>
        <Typography variant="body2" color="text.secondary">
          Target: <strong>{target.toLocaleString()} SOL</strong>
          {released > 0 && ` (Released: ${released.toLocaleString()} SOL)`}
        </Typography>
      </Box>

      <Box sx={{ display: "flex", alignItems: "center", gap: 2, width: { xs: "100%", sm: "auto" } }}>
        {milestone.proofUri && (
          <Link
            href={milestone.proofUri.replace("ipfs://", "https://gateway.pinata.cloud/ipfs/")}
            target="_blank"
            rel="noopener"
            sx={{ textDecoration: "none" }}
          >
            <Button
              variant="outlined"
              color="primary"
              size="small"
              startIcon={<InsertDriveFileIcon style={{ fontSize: 16 }} />}
              sx={{ py: 1, px: 2, borderRadius: 2 }}
            >
              View Proof
            </Button>
          </Link>
        )}
      </Box>
    </Paper>
  );
}
