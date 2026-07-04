"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Skeleton,
  Stack,
  CardMedia,
  Chip,
} from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import CampaignIcon from "@mui/icons-material/Campaign";
import SettingsIcon from "@mui/icons-material/Settings";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import WalletGuard from "@/components/wallet/WalletGuard";
import { useCreatorCampaigns } from "@/hooks/useCreatorCampaigns";
import EmptyState from "@/components/ui/EmptyState";
import ProgressBar from "@/components/ui/ProgressBar";
import StatusBadge from "@/components/ui/StatusBadge";

export default function CreatorDashboardPage() {
  return (
    <WalletGuard>
      <DashboardContent />
    </WalletGuard>
  );
}

function DashboardContent() {
  const t = useTranslations("dashboard");
  const { publicKey } = useWallet();
  const { campaigns, isLoading } = useCreatorCampaigns(publicKey?.toBase58() ?? null);
  // eslint-disable-next-line react-hooks/purity
  const now = Date.now();

  // Compute stats
  const totalCampaigns = campaigns.length;
  const totalRaisedLamports = campaigns.reduce(
    (acc, curr) => acc + (parseFloat(curr.currentAmount) || 0),
    0
  );
  const totalRaisedSol = totalRaisedLamports / LAMPORTS_PER_SOL;

  const activeCampaigns = campaigns.filter((c) => "active" in c.status).length;

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      {/* Header */}
      <Box sx={{ mb: 6 }}>
        <Typography
          variant="h1"
          sx={{
            fontSize: { xs: "2.2rem", md: "2.8rem" },
            fontWeight: 900,
            letterSpacing: "-0.05em",
            mb: 1,
            fontFamily: "var(--font-syne)",
          }}
        >
          {t("title")}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {t("subtitle")}
        </Typography>
      </Box>

      {/* Stats row */}
      <Grid container spacing={3} sx={{ mb: 6 }}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card variant="outlined" sx={{ borderRadius: 3, borderColor: "divider" }}>
            <CardContent sx={{ p: 3, display: "flex", alignItems: "center", gap: 2.5 }}>
              <Box
                sx={{
                  width: 50,
                  height: 50,
                  borderRadius: 2,
                  backgroundColor: "rgba(95, 60, 254, 0.05)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "primary.main",
                }}
              >
                <DashboardIcon />
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                  {t("statsCampaigns")}
                </Typography>
                {isLoading ? (
                  <Skeleton width={60} height={32} />
                ) : (
                  <Typography variant="h4" sx={{ fontWeight: 800 }}>
                    {totalCampaigns}
                  </Typography>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 4 }}>
          <Card variant="outlined" sx={{ borderRadius: 3, borderColor: "divider" }}>
            <CardContent sx={{ p: 3, display: "flex", alignItems: "center", gap: 2.5 }}>
              <Box
                sx={{
                  width: 50,
                  height: 50,
                  borderRadius: 2,
                  backgroundColor: "rgba(0, 240, 181, 0.05)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#00b084",
                }}
              >
                <AccountBalanceWalletIcon />
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                  {t("statsSOL")}
                </Typography>
                {isLoading ? (
                  <Skeleton width={100} height={32} />
                ) : (
                  <Typography variant="h4" sx={{ fontWeight: 800 }}>
                    {totalRaisedSol.toLocaleString()} SOL
                  </Typography>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 4 }}>
          <Card variant="outlined" sx={{ borderRadius: 3, borderColor: "divider" }}>
            <CardContent sx={{ p: 3, display: "flex", alignItems: "center", gap: 2.5 }}>
              <Box
                sx={{
                  width: 50,
                  height: 50,
                  borderRadius: 2,
                  backgroundColor: "rgba(95, 60, 254, 0.05)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "primary.main",
                }}
              >
                <CampaignIcon />
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                  {t("statsMilestones")}
                </Typography>
                {isLoading ? (
                  <Skeleton width={60} height={32} />
                ) : (
                  <Typography variant="h4" sx={{ fontWeight: 800 }}>
                    {activeCampaigns}
                  </Typography>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Campaign List */}
      {isLoading ? (
        <Grid container spacing={3}>
          {[1, 2].map((i) => (
            <Grid size={{ xs: 12, md: 6 }} key={i}>
              <Card variant="outlined" sx={{ height: 260, borderRadius: 4, display: "flex" }}>
                <Skeleton variant="rectangular" width="40%" height="100%" />
                <CardContent sx={{ flexGrow: 1, p: 3 }}>
                  <Skeleton width="30%" height={24} sx={{ mb: 1 }} />
                  <Skeleton width="80%" height={32} sx={{ mb: 2 }} />
                  <Skeleton width="100%" height={20} sx={{ mb: 1 }} />
                  <Skeleton width="100%" height={10} sx={{ mt: 3 }} />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : campaigns.length === 0 ? (
        <EmptyState
          title={t("emptyTitle")}
          description={t("emptyDesc")}
          actionLabel={t("emptyAction")}
          actionPath="/create"
        />
      ) : (
        <Grid container spacing={3}>
          {campaigns.map((campaign) => {
            const current = parseFloat(campaign.currentAmount) / LAMPORTS_PER_SOL;
            const target = parseFloat(campaign.targetAmount) / LAMPORTS_PER_SOL;
            const deadlineDate = new Date(parseInt(campaign.deadline) * 1000);
            const daysLeft = Math.max(0, Math.ceil((deadlineDate.getTime() - now) / (1000 * 3600 * 24)));

            return (
              <Grid size={{ xs: 12, md: 6 }} key={campaign.pubkey}>
                <Card
                  variant="outlined"
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: { xs: "column", sm: "row" },
                    borderRadius: 4,
                    borderColor: "divider",
                    overflow: "hidden",
                  }}
                >
                  <CardMedia
                    component="img"
                    image={campaign.imageUri.replace("ipfs://", "https://gateway.pinata.cloud/ipfs/") || "/placeholder.jpg"}
                    alt={campaign.title}
                    sx={{
                      width: { xs: "100%", sm: "40%" },
                      height: { xs: 200, sm: "100%" },
                      objectFit: "cover",
                    }}
                  />
                  <CardContent sx={{ flexGrow: 1, p: 3, display: "flex", flexDirection: "column" }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                      <Chip
                        label={campaign.category}
                        size="small"
                        sx={{ fontWeight: 700, borderRadius: 1 }}
                      />
                      <StatusBadge status={campaign.status} />
                    </Box>

                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 800,
                        fontFamily: "var(--font-plus-jakarta-sans)",
                        lineHeight: 1.3,
                        mb: 1.5,
                      }}
                    >
                      {campaign.title}
                    </Typography>

                    <Box sx={{ mb: 3 }}>
                      <ProgressBar current={current} target={target} />
                      <Box sx={{ display: "flex", justifyContent: "space-between", mt: 1 }}>
                        <Typography variant="caption" color="text.secondary">
                          Raised: <strong>{current.toLocaleString()} SOL</strong>
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {daysLeft > 0 ? `${daysLeft} days left` : "Ended"}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Action buttons */}
                    <Stack direction="row" spacing={1.5} sx={{ mt: "auto" }}>
                      <Link href={`/dashboard/${campaign.pubkey}`} passHref style={{ textDecoration: "none", flexGrow: 1 }}>
                        <Button
                          variant="contained"
                          color="primary"
                          fullWidth
                          size="small"
                          startIcon={<SettingsIcon />}
                          sx={{ py: 1, borderRadius: 2, textTransform: "none", fontWeight: 700 }}
                        >
                          {t("btnManage")}
                        </Button>
                      </Link>
                      <Link href={`/campaigns/${campaign.pubkey}`} passHref style={{ textDecoration: "none" }}>
                        <Button
                          variant="outlined"
                          color="inherit"
                          size="small"
                          sx={{
                            py: 1,
                            borderRadius: 2,
                            textTransform: "none",
                            borderColor: "divider",
                            "&:hover": { borderColor: "text.primary" },
                          }}
                        >
                          <VisibilityIcon fontSize="small" />
                        </Button>
                      </Link>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}
    </Container>
  );
}
