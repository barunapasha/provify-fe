"use client";

import { use, useState } from "react";
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  TextField,
  InputAdornment,
  Alert,
  CircularProgress,
  Stack,
} from "@mui/material";
import { Link } from "@/i18n/routing";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { useCampaign } from "@/hooks/useCampaign";
import { useDonate } from "@/hooks/useDonate";
import { useTranslations } from "next-intl";
import WalletGuard from "@/components/wallet/WalletGuard";
import TxBadge from "@/components/ui/TxBadge";
import ProgressBar from "@/components/ui/ProgressBar";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

const MIN_SOL = 0.001;

export default function DonatePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <WalletGuard>
      <DonateForm id={id} />
    </WalletGuard>
  );
}

function DonateForm({ id }: { id: string }) {
  const t = useTranslations("donate");
  const { campaign, isLoading } = useCampaign(id);
  const { donate, isLoading: txLoading, txHash, error } = useDonate(id, campaign?.donationCount ?? "0");

  const [amount, setAmount] = useState("");

  const stats = campaign
    ? {
        current: parseFloat(campaign.currentAmount) / LAMPORTS_PER_SOL,
        target: parseFloat(campaign.targetAmount) / LAMPORTS_PER_SOL,
        daysLeft: Math.max(
          0,
          Math.ceil(
            (new Date(parseInt(campaign.deadline) * 1000).getTime() -
              // eslint-disable-next-line react-hooks/purity
              Date.now()) /
              (1000 * 3600 * 24)
          )
        ),
      }
    : null;

  const numAmount = parseFloat(amount) || 0;
  const valid = numAmount >= MIN_SOL;
  const isActive = campaign ? "active" in campaign.status : false;
  const canDonate = valid && isActive && stats != null && stats.daysLeft > 0;

  const handleDonate = async () => {
    if (!canDonate) return;
    try {
      await donate(numAmount);
      setAmount("");
    } catch {}
  };

  if (isLoading) {
    return (
      <Container maxWidth="sm" sx={{ py: 10 }}>
        <LoadingSpinner message={t("loading")} />
      </Container>
    );
  }

  if (!campaign) {
    return (
      <Container maxWidth="sm" sx={{ py: 10, textAlign: "center" }}>
        <Typography variant="h5" sx={{ mb: 2 }}>
          {t("notFound")}
        </Typography>
        <Link href="/campaigns" passHref style={{ textDecoration: "none" }}>
          <Button variant="contained">{t("backToCampaigns")}</Button>
        </Link>
      </Container>
    );
  }

  return (
    <Box sx={{ pb: 10 }}>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 3 }}>
        <Link href={`/campaigns/${id}`} passHref style={{ textDecoration: "none" }}>
          <Button startIcon={<ArrowBackIcon />} color="inherit" sx={{ fontWeight: 600 }}>
            {t("back")}
          </Button>
        </Link>
      </Container>

      <Container maxWidth="md">
        <Paper variant="outlined" sx={{ p: 4, borderRadius: 3, borderColor: "divider", mb: 4 }}>
          <Typography variant="overline" color="text.secondary">
            {t("donatingTo")}
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 800, mb: 2 }}>
            {campaign.title}
          </Typography>
          {stats && <ProgressBar current={stats.current} target={stats.target} />}
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            {t("daysLeft")}: {stats?.daysLeft ?? 0}
          </Typography>
        </Paper>

        {txHash ? (
          <Paper variant="outlined" sx={{ p: 5, borderRadius: 3, borderColor: "divider", textAlign: "center" }}>
            <Alert severity="success" sx={{ mb: 3, justifyContent: "center" }}>
              {t("success")}
            </Alert>
            <Stack direction="row" spacing={2} sx={{ mb: 4, justifyContent: "center", alignItems: "center" }}>
              <Typography variant="body2" color="text.secondary">
                {t("txHash")}:
              </Typography>
              <TxBadge txHash={txHash} />
            </Stack>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ justifyContent: "center" }}>
              <Link href={`/campaigns/${id}`} passHref style={{ textDecoration: "none" }}>
                <Button variant="contained">{t("viewCampaign")}</Button>
              </Link>
              <Link href={`/verify/${txHash}`} passHref style={{ textDecoration: "none" }}>
                <Button variant="outlined">{t("verifyTx")}</Button>
              </Link>
            </Stack>
          </Paper>
        ) : (
          <Paper variant="outlined" sx={{ p: 5, borderRadius: 3, borderColor: "divider" }}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 700 }}>
              {t("enterAmount")}
            </Typography>

            <TextField
              fullWidth
              type="number"
              size="medium"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              disabled={txLoading}
              error={amount !== "" && !valid}
              helperText={
                amount !== "" && !valid
                  ? t("minError")
                  : `${t("lamports")}: ${Math.round(numAmount * LAMPORTS_PER_SOL)}`
              }
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <Typography sx={{ fontWeight: 700 }}>SOL</Typography>
                    </InputAdornment>
                  ),
                },
              }}
            />

            <Box sx={{ mt: 3, p: 2, backgroundColor: "#F9FAFC", borderRadius: 2 }}>
              <PreviewRow label={t("amount")} value={`${numAmount || 0} SOL`} />
              <PreviewRow label={t("networkFee")} value="~0.000005 SOL" muted />
              <PreviewRow label={t("total")} value={`${(numAmount + 0.000005).toFixed(6)} SOL`} bold />
            </Box>

            {error && (
              <Alert severity="error" sx={{ mt: 3 }}>
                {t("errorPrefix")}: {error}
              </Alert>
            )}
            {!isActive && (
              <Alert severity="error" sx={{ mt: 3 }}>
                {t("notActive")}
              </Alert>
            )}

            <Button
              fullWidth
              variant="contained"
              size="large"
              onClick={handleDonate}
              disabled={!canDonate || txLoading}
              startIcon={txLoading ? <CircularProgress size={20} color="inherit" /> : null}
              sx={{ mt: 4 }}
            >
              {txLoading ? t("confirming") : `${t("donateBtn")} ${numAmount > 0 ? numAmount : ""} SOL`}
            </Button>
          </Paper>
        )}
      </Container>
    </Box>
  );
}

function PreviewRow({
  label,
  value,
  muted,
  bold,
}: {
  label: string;
  value: string;
  muted?: boolean;
  bold?: boolean;
}) {
  return (
    <Stack direction="row" sx={{ py: 0.5, justifyContent: "space-between" }}>
      <Typography variant="body2" color={muted ? "text.secondary" : "text.primary"}>
        {label}
      </Typography>
      <Typography variant="body2" sx={{ fontWeight: bold ? 800 : 400, fontFamily: bold ? undefined : "monospace" }}>
        {value}
      </Typography>
    </Stack>
  );
}
