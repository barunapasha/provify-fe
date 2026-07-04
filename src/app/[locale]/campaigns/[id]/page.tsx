"use client";

import { use, useMemo } from "react";
import {
  Box,
  Container,
  Typography,
  Grid,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Stack,
  Chip,
  Skeleton,
} from "@mui/material";
import { Link } from "@/i18n/routing";
import { useWallet } from "@solana/wallet-adapter-react";
import { useCampaign } from "@/hooks/useCampaign";
import { useDonations } from "@/hooks/useDonations";
import { useTranslations } from "next-intl";
import ProgressBar from "@/components/ui/ProgressBar";
import StatusBadge from "@/components/ui/StatusBadge";
import MilestoneItem from "@/components/ui/MilestoneItem";
import TxBadge from "@/components/ui/TxBadge";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import EmptyState from "@/components/ui/EmptyState";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import LaunchIcon from "@mui/icons-material/Launch";

export default function CampaignDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const t = useTranslations("detail");
  const { publicKey } = useWallet();

  const { campaign, isLoading: campaignLoading } = useCampaign(id);
  const { donations, isLoading: donationsLoading } = useDonations(id);

  const isCreator = useMemo(() => {
    if (!publicKey || !campaign) return false;
    return publicKey.toBase58() === campaign.creator;
  }, [publicKey, campaign]);

  const stats = useMemo(() => {
    if (!campaign) return { current: 0, target: 0, daysLeft: 0 };
    const current = parseFloat(campaign.currentAmount) / LAMPORTS_PER_SOL;
    const target = parseFloat(campaign.targetAmount) / LAMPORTS_PER_SOL;
    const deadlineDate = new Date(parseInt(campaign.deadline) * 1000);
    const daysLeft = Math.max(0, Math.ceil((deadlineDate.getTime() - Date.now()) / (1000 * 3600 * 24)));
    return { current, target, daysLeft };
  }, [campaign]);

  if (campaignLoading) {
    return (
      <Container maxWidth="md" sx={{ py: 10 }}>
        <LoadingSpinner message="Loading campaign details from Solana..." />
      </Container>
    );
  }

  if (!campaign) {
    return (
      <Container maxWidth="md" sx={{ py: 10 }}>
        <EmptyState
          title="Campaign Not Found"
          description="We couldn't find the requested campaign on-chain. It may not exist or the transaction is still confirming."
          actionLabel="Go back to campaigns"
          actionPath="/campaigns"
        />
      </Container>
    );
  }

  return (
    <Box sx={{ pb: 10 }}>
      {/* Back Button */}
      <Container maxWidth="lg" sx={{ mt: 4, mb: 3 }}>
        <Link href="/campaigns" passHref style={{ textDecoration: "none" }}>
          <Button startIcon={<ArrowBackIcon />} color="inherit" sx={{ fontWeight: 600 }}>
            Back to Campaigns
          </Button>
        </Link>
      </Container>

      {/* Hero Image */}
      <Box
        sx={{
          width: "100%",
          height: 360,
          position: "relative",
          borderBottom: "1px solid",
          borderColor: "divider",
          backgroundColor: "#FFFFFF",
        }}
      >
        <Box
          component="img"
          src={campaign.imageUri.replace("ipfs://", "https://gateway.pinata.cloud/ipfs/")}
          alt={campaign.title}
          sx={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
        <Box
          sx={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "100%",
            background: "linear-gradient(to top, rgba(14, 14, 18, 0.7) 0%, rgba(14, 14, 18, 0) 60%)",
            display: "flex",
            alignItems: "flex-end",
            p: 4,
          }}
        >
          <Container maxWidth="lg">
            <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 2, mb: 1 }}>
              <Chip
                label={campaign.category}
                size="small"
                sx={{
                  backgroundColor: "secondary.main",
                  color: "secondary.contrastText",
                  fontWeight: 800,
                  fontSize: "0.7rem",
                  borderRadius: 1,
                }}
              />
              <StatusBadge status={campaign.status} />
            </Box>
            <Typography
              variant="h3"
              sx={{
                color: "#FFFFFF",
                fontWeight: 900,
                fontSize: { xs: "2rem", sm: "2.5rem", md: "3rem" },
                lineHeight: 1.1,
                fontFamily: "var(--font-syne)",
                textTransform: "uppercase",
              }}
            >
              {campaign.title}
            </Typography>
          </Container>
        </Box>
      </Box>

      {/* Main Content */}
      <Container maxWidth="lg" sx={{ mt: 5 }}>
        <Grid container spacing={5}>
          {/* Left Column (Info, Milestones, History) */}
          <Grid size={{ xs: 12, md: 8 }}>
            <Stack spacing={5}>
              {/* Description */}
              <Box>
                <Typography variant="h5" sx={{ mb: 2, fontWeight: 700 }}>
                  About the Campaign
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ whiteSpace: "pre-line" }}>
                  {campaign.description}
                </Typography>
              </Box>

              {/* Creator Card */}
              <Paper variant="outlined" sx={{ p: 3, borderRadius: 2, borderColor: "divider", backgroundColor: "background.paper" }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", display: "block", mb: 1 }}>
                  {t("creator")}
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 1 }}>
                  <Typography variant="body2" sx={{ fontFamily: "monospace", wordBreak: "break-all", fontWeight: 600 }}>
                    {campaign.creator}
                  </Typography>
                  <Link
                    href={`https://explorer.solana.com/address/${campaign.creator}?cluster=devnet`}
                    target="_blank"
                    rel="noopener"
                    style={{ textDecoration: "none" }}
                  >
                    <Button size="small" endIcon={<LaunchIcon style={{ fontSize: 14 }} />}>
                      View Wallet
                    </Button>
                  </Link>
                </Box>
              </Paper>

              {/* Milestones */}
              <Box>
                <Typography variant="h5" sx={{ mb: 3, fontWeight: 700 }}>
                  {t("milestones")}
                </Typography>
                {campaign.milestones && campaign.milestones.length > 0 ? (
                  campaign.milestones.map((milestone) => (
                    <MilestoneItem key={milestone.pubkey} milestone={milestone} />
                  ))
                ) : (
                  <Typography color="text.secondary">No milestones registered for this campaign.</Typography>
                )}
              </Box>

              {/* Donation History */}
              <Box>
                <Typography variant="h5" sx={{ mb: 3, fontWeight: 700 }}>
                  {t("donations")}
                </Typography>
                {donationsLoading ? (
                  <Skeleton variant="rectangular" height={150} sx={{ borderRadius: 2 }} />
                ) : donations.length === 0 ? (
                  <Paper variant="outlined" sx={{ p: 4, textAlign: "center", borderRadius: 2, borderColor: "divider" }}>
                    <Typography color="text.secondary">{t("noDonations")}</Typography>
                  </Paper>
                ) : (
                  <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2, borderColor: "divider" }}>
                    <Table>
                      <TableHead sx={{ backgroundColor: "#F9FAFC" }}>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 700 }}>{t("donorCol")}</TableCell>
                          <TableCell sx={{ fontWeight: 700 }} align="right">
                            {t("amountCol")}
                          </TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>{t("dateCol")}</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>{t("txCol")}</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {donations.slice(0, 10).map((d) => {
                          const amount = parseFloat(d.amount) / LAMPORTS_PER_SOL;
                          const date = new Date(parseInt(d.timestamp) * 1000).toLocaleDateString();
                          return (
                            <TableRow key={d.pubkey}>
                              <TableCell sx={{ fontFamily: "monospace" }}>
                                {d.donor.slice(0, 4)}...{d.donor.slice(-4)}
                              </TableCell>
                              <TableCell align="right" sx={{ fontWeight: 700 }}>
                                {amount.toLocaleString()} SOL
                              </TableCell>
                              <TableCell color="text.secondary">{date}</TableCell>
                              <TableCell>
                                <TxBadge txHash={d.pubkey} />
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </Box>
            </Stack>
          </Grid>

          {/* Right Column (Escrow and Sticky Actions) */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Box
              sx={{
                position: "sticky",
                top: 90,
                display: "flex",
                flexDirection: "column",
                gap: 3,
              }}
            >
              {/* Escrow Card */}
              <Paper
                variant="outlined"
                sx={{
                  p: 4,
                  borderRadius: 3,
                  borderColor: "divider",
                  backgroundColor: "background.paper",
                }}
              >
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
                  Campaign Escrow
                </Typography>
                <ProgressBar current={stats.current} target={stats.target} />

                <Grid container spacing={2} sx={{ mt: 3, mb: 4 }}>
                  <Grid size={{ xs: 6 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 0.5 }}>
                      {t("donors")}
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      {campaign.donationCount}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 0.5 }}>
                      {t("daysLeft")}
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      {stats.daysLeft > 0 ? stats.daysLeft : t("ended")}
                    </Typography>
                  </Grid>
                </Grid>

                <Stack spacing={2}>
                  {isCreator ? (
                    <Link href={`/dashboard/${campaign.pubkey}`} passHref style={{ textDecoration: "none" }}>
                      <Button variant="contained" color="primary" fullWidth size="large">
                        {t("btnManage")}
                      </Button>
                    </Link>
                  ) : (
                    <Link href={`/donate/${campaign.pubkey}`} passHref style={{ textDecoration: "none" }}>
                      <Button
                        variant="contained"
                        color="primary"
                        fullWidth
                        size="large"
                        startIcon={<AccountBalanceWalletIcon />}
                        disabled={stats.daysLeft <= 0 || !("active" in campaign.status)}
                      >
                        {t("btnDonate")}
                      </Button>
                    </Link>
                  )}
                  <Link
                    href={`https://explorer.solana.com/address/${campaign.pubkey}?cluster=devnet`}
                    target="_blank"
                    rel="noopener"
                    style={{ textDecoration: "none" }}
                  >
                    <Button variant="outlined" color="primary" fullWidth size="large">
                      {t("btnVerify")}
                    </Button>
                  </Link>
                </Stack>
              </Paper>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
