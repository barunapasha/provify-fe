"use client";

import { Card, CardContent, CardMedia, Typography, Box, Chip } from "@mui/material";
import { Link } from "@/i18n/routing";
import ProgressBar from "./ProgressBar";
import StatusBadge from "./StatusBadge";
import { Campaign } from "@/types/campaign";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";

interface CampaignCardProps {
  campaign: Campaign;
}

export default function CampaignCard({ campaign }: CampaignCardProps) {
  const current = parseFloat(campaign.currentAmount) / LAMPORTS_PER_SOL;
  const target = parseFloat(campaign.targetAmount) / LAMPORTS_PER_SOL;
  const deadlineDate = new Date(parseInt(campaign.deadline) * 1000);
  const daysLeft = Math.max(0, Math.ceil((deadlineDate.getTime() - Date.now()) / (1000 * 3600 * 24)));

  return (
    <Link href={`/campaigns/${campaign.pubkey}`} passHref style={{ textDecoration: "none" }}>
      <Card
        sx={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          cursor: "pointer",
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 4,
          backgroundColor: "background.paper",
          transition: "transform 0.2s, box-shadow 0.2s",
          "&:hover": {
            transform: "translateY(-4px)",
            boxShadow: "0px 12px 24px rgba(14, 14, 18, 0.08)",
          },
        }}
      >
        <CardMedia
          component="img"
          height="180"
          image={campaign.imageUri.replace("ipfs://", "https://gateway.pinata.cloud/ipfs/") || "/placeholder.jpg"}
          alt={campaign.title}
          sx={{ borderTopLeftRadius: 4, borderTopRightRadius: 4, objectFit: "cover" }}
        />
        <CardContent sx={{ flexGrow: 1, display: "flex", flexDirection: "column", p: 3 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
            <Chip
              label={campaign.category}
              size="small"
              sx={{
                fontWeight: 700,
                fontSize: "0.65rem",
                borderRadius: 1,
                backgroundColor: "rgba(14, 14, 18, 0.05)",
                color: "text.primary",
              }}
            />
            <StatusBadge status={campaign.status} />
          </Box>

          <Typography
            variant="h6"
            sx={{
              fontWeight: 800,
              fontFamily: "var(--font-plus-jakarta-sans)",
              lineHeight: 1.3,
              mb: 1,
              height: 48,
              overflow: "hidden",
              textOverflow: "ellipsis",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
            }}
          >
            {campaign.title}
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mb: 3,
              height: 40,
              overflow: "hidden",
              textOverflow: "ellipsis",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
            }}
          >
            {campaign.description}
          </Typography>

          <Box sx={{ mt: "auto" }}>
            <ProgressBar current={current} target={target} />
            <Box sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}>
              <Typography variant="caption" color="text.secondary">
                Donors: <strong>{campaign.donationCount}</strong>
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {daysLeft > 0 ? `${daysLeft} days left` : "Ended"}
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Link>
  );
}
