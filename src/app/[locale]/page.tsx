"use client";

import {
  Box,
  Container,
  Typography,
  Grid,
  Button,
  Card,
  CardContent,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Skeleton,
  Stack,
} from "@mui/material";
import { Link } from "@/i18n/routing";
import useSWR from "swr";
import { useTranslations } from "next-intl";
import CampaignCard from "@/components/ui/CampaignCard";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { Campaign } from "@/types/campaign";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import AddBoxIcon from "@mui/icons-material/AddBox";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import LibraryBooksIcon from "@mui/icons-material/LibraryBooks";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function Home() {
  const t = useTranslations("hero");
  const { data, isLoading } = useSWR("/api/campaigns", fetcher);

  const campaigns: Campaign[] = data?.campaigns || [];

  // Compute stats
  const totalCampaigns = campaigns.length;

  const totalSolLamports = campaigns.reduce(
    (acc, curr) => acc + (parseFloat(curr.currentAmount) || 0),
    0
  );
  const totalSol = totalSolLamports / LAMPORTS_PER_SOL;

  const totalDonors = campaigns.reduce(
    (acc, curr) => acc + (parseInt(curr.donationCount) || 0),
    0
  );

  // Get 3 most funded active campaigns
  const featured = campaigns
    .filter((c) => "active" in c.status)
    .sort((a, b) => (parseFloat(b.currentAmount) || 0) - (parseFloat(a.currentAmount) || 0))
    .slice(0, 3);

  const steps = [
    {
      label: t("howStep1Title"),
      description: t("howStep1Desc"),
      icon: <AddBoxIcon sx={{ color: "primary.main" }} />,
    },
    {
      label: t("howStep2Title"),
      description: t("howStep2Desc"),
      icon: <AccountBalanceWalletIcon sx={{ color: "primary.main" }} />,
    },
    {
      label: t("howStep3Title"),
      description: t("howStep3Desc"),
      icon: <LibraryBooksIcon sx={{ color: "primary.main" }} />,
    },
    {
      label: t("howStep4Title"),
      description: t("howStep4Desc"),
      icon: <CheckCircleIcon sx={{ color: "primary.main" }} />,
    },
  ];

  return (
    <Box sx={{ pb: 10 }}>
      {/* Hero Section */}
      <Box
        sx={{
          py: { xs: 10, md: 14 },
          borderBottom: "1px solid",
          borderColor: "divider",
          backgroundColor: "#FFFFFF",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={6} sx={{ alignItems: "center" }}>
            <Grid size={{ xs: 12, md: 7 }}>
              <Stack spacing={4}>
                <Typography
                  variant="h1"
                  sx={{
                    fontSize: { xs: "3.2rem", sm: "4.2rem", md: "4.8rem" },
                    lineHeight: 0.95,
                    color: "text.primary",
                  }}
                >
                  {t("title")}
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ fontSize: "1.15rem", maxWidth: 540 }}>
                  {t("subtitle")}
                </Typography>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
                  <Link href="/campaigns" passHref style={{ textDecoration: "none" }}>
                    <Button variant="contained" color="primary" size="large" endIcon={<ArrowForwardIcon />}>
                      {t("ctaExplore")}
                    </Button>
                  </Link>
                  <Link href="/create" passHref style={{ textDecoration: "none" }}>
                    <Button variant="outlined" color="primary" size="large">
                      {t("ctaCreate")}
                    </Button>
                  </Link>
                </Box>
              </Stack>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Stats Section */}
      <Container maxWidth="lg" sx={{ mt: -6, position: "relative", zIndex: 2 }}>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Card sx={{ borderLeft: "4px solid", borderLeftColor: "primary.main" }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase" }}>
                  {t("statsCampaigns")}
                </Typography>
                {isLoading ? (
                  <Skeleton width={100} height={48} sx={{ mt: 1 }} />
                ) : (
                  <Typography variant="h3" sx={{ mt: 1, fontWeight: 800, fontFamily: "var(--font-syne)" }}>
                    {totalCampaigns}
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Card sx={{ borderLeft: "4px solid", borderLeftColor: "secondary.main" }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase" }}>
                  {t("statsSol")}
                </Typography>
                {isLoading ? (
                  <Skeleton width={140} height={48} sx={{ mt: 1 }} />
                ) : (
                  <Typography variant="h3" sx={{ mt: 1, fontWeight: 800, fontFamily: "var(--font-syne)" }}>
                    {totalSol.toLocaleString()} SOL
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Card sx={{ borderLeft: "4px solid", borderLeftColor: "text.primary" }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase" }}>
                  {t("statsDonors")}
                </Typography>
                {isLoading ? (
                  <Skeleton width={100} height={48} sx={{ mt: 1 }} />
                ) : (
                  <Typography variant="h3" sx={{ mt: 1, fontWeight: 800, fontFamily: "var(--font-syne)" }}>
                    {totalDonors}
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>

      {/* Featured Section */}
      <Container maxWidth="lg" sx={{ mt: 10 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", mb: 4 }}>
          <Box>
            <Typography variant="h2" sx={{ fontSize: "2rem", mb: 1 }}>
              {t("featuredTitle")}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t("featuredSubtitle")}
            </Typography>
          </Box>
          <Link href="/campaigns" passHref style={{ textDecoration: "none" }}>
            <Button color="primary" endIcon={<ArrowForwardIcon />}>
              {t("viewAll")}
            </Button>
          </Link>
        </Box>

        {isLoading ? (
          <Grid container spacing={3}>
            {[1, 2, 3].map((i) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={i}>
                <Card sx={{ height: 350 }}>
                  <Skeleton variant="rectangular" height={180} />
                  <CardContent>
                    <Skeleton width="40%" height={24} sx={{ mb: 1 }} />
                    <Skeleton width="90%" height={32} sx={{ mb: 2 }} />
                    <Skeleton width="100%" height={16} />
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : campaigns.length === 0 ? (
          <Box sx={{ py: 6, textAlign: "center", border: "1px dashed", borderColor: "divider", borderRadius: 4 }}>
            <Typography color="text.secondary">No campaigns found on-chain.</Typography>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {featured.map((campaign) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={campaign.pubkey}>
                <CampaignCard campaign={campaign} />
              </Grid>
            ))}
          </Grid>
        )}
      </Container>

      {/* How It Works Section */}
      <Container maxWidth="lg" sx={{ mt: 12 }}>
        <Box sx={{ textAlign: "center", mb: 8 }}>
          <Typography variant="h2" sx={{ fontSize: "2rem", mb: 2 }}>
            {t("howTitle")}
          </Typography>
        </Box>

        <Box sx={{ maxWidth: 800, mx: "auto" }}>
          <Stepper orientation="vertical" connector={null}>
            {steps.map((step, index) => (
              <Step active key={step.label}>
                <StepLabel
                  icon={
                    <Box
                      sx={{
                        width: 44,
                        height: 44,
                        borderRadius: 1, // Sharp box
                        backgroundColor: "rgba(95, 60, 254, 0.05)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        border: "1px solid rgba(95, 60, 254, 0.15)",
                      }}
                    >
                      {step.icon}
                    </Box>
                  }
                >
                  <Typography variant="h6" sx={{ ml: 2, fontWeight: 700 }}>
                    {step.label}
                  </Typography>
                </StepLabel>
                <StepContent sx={{ borderLeft: "2px dashed", borderColor: "divider", ml: "21px", pl: 4, pb: 4 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ maxW: 500 }}>
                    {step.description}
                  </Typography>
                </StepContent>
              </Step>
            ))}
          </Stepper>
        </Box>
      </Container>
    </Box>
  );
}
