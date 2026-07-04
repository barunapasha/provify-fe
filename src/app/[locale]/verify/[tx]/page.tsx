"use client";

import { use, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Divider,
  Stack,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Snackbar,
  Grid,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import InfoIcon from "@mui/icons-material/Info";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { useVerifyTx } from "@/hooks/useVerifyTx";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

export default function VerifyTxPage({
  params,
}: {
  params: Promise<{ tx: string }>;
}) {
  const { tx } = use(params);
  return <VerifyTxContent txSignature={tx} />;
}

function VerifyTxContent({ txSignature }: { txSignature: string }) {
  const t = useTranslations("verify");
  const { data, isLoading, error } = useVerifyTx(txSignature);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const handleCopyLink = () => {
    const url = `${window.location.origin}/verify/${txSignature}`;
    navigator.clipboard.writeText(url);
    setSnackbarOpen(true);
  };

  if (isLoading) {
    return <LoadingSpinner message={t("loading")} />;
  }

  if (error) {
    const isNotProvify = error.includes("Not a Provify transaction");
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Box sx={{ mb: 4 }}>
          <Link href="/verify" passHref style={{ textDecoration: "none", color: "inherit" }}>
            <Button startIcon={<ArrowBackIcon />} sx={{ fontWeight: 700, textTransform: "none" }}>
              Verifier
            </Button>
          </Link>
        </Box>
        {isNotProvify ? (
          <Alert
            severity="warning"
            sx={{ borderRadius: 3, p: 3 }}
            action={
              <Button
                color="inherit"
                size="small"
                startIcon={<OpenInNewIcon />}
                href={`https://explorer.solana.com/tx/${txSignature}?cluster=custom&customUrl=http%3A%2F%2Flocalhost%3A8899`}
                target="_blank"
                rel="noopener"
              >
                Explorer
              </Button>
            }
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>
              Non-Provify Transaction
            </Typography>
            <Typography variant="body2">{t("notProvify")}</Typography>
          </Alert>
        ) : (
          <Alert severity="error" sx={{ borderRadius: 3, p: 3 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>
              Transaction Verification Failed
            </Typography>
            <Typography variant="body2">{t("notFound")}</Typography>
          </Alert>
        )}
      </Container>
    );
  }

  if (!data) return null;

  const isLocalhost = process.env.NEXT_PUBLIC_SOLANA_RPC?.includes("localhost") || process.env.NEXT_PUBLIC_SOLANA_RPC?.includes("127.0.0.1");
  const explorerUrl = isLocalhost
    ? `https://explorer.solana.com/tx/${txSignature}?cluster=custom&customUrl=http%3A%2F%2Flocalhost%3A8899`
    : `https://explorer.solana.com/tx/${txSignature}?cluster=devnet`;

  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      {/* Back button */}
      <Box sx={{ mb: 4 }}>
        <Link href="/verify" passHref style={{ textDecoration: "none", color: "inherit" }}>
          <Button startIcon={<ArrowBackIcon />} sx={{ fontWeight: 700, textTransform: "none" }}>
            Verifier
          </Button>
        </Link>
      </Box>

      {/* Main Verification Card */}
      <Card variant="outlined" sx={{ borderRadius: 4, borderColor: "divider", mb: 4, overflow: "hidden" }}>
        <Box
          sx={{
            p: 4,
            display: "flex",
            alignItems: "center",
            gap: 2.5,
            borderBottom: "1px solid",
            borderColor: "divider",
            backgroundColor:
              data.type === "donate"
                ? "rgba(0, 240, 181, 0.04)"
                : data.type === "submit_proof"
                ? "rgba(0, 150, 255, 0.04)"
                : "rgba(95, 60, 254, 0.04)",
            color:
              data.type === "donate"
                ? "#00b084"
                : data.type === "submit_proof"
                ? "#007BFF"
                : "primary.main",
          }}
        >
          <CheckCircleIcon sx={{ fontSize: 36 }} />
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 900, fontFamily: "var(--font-plus-jakarta-sans)" }}>
              {data.type === "donate" && t("statusDonate")}
              {data.type === "create_campaign" && t("statusCreateCampaign")}
              {data.type === "create_milestone" && t("statusCreateMilestone")}
              {data.type === "submit_proof" && t("statusSubmitProof")}
              {data.type === "request_disbursement" && t("statusRequestDisbursement")}
              {data.type === "close_campaign" && t("statusCloseCampaign")}
            </Typography>
            <Typography variant="caption" sx={{ fontFamily: "monospace", display: "block", color: "text.secondary", mt: 0.5 }}>
              Sig: {txSignature.slice(0, 12)}...{txSignature.slice(-12)}
            </Typography>
          </Box>
        </Box>

        <CardContent sx={{ p: 4 }}>
          {/* Card Body specific to Tx type */}
          <Stack spacing={3}>
            {data.type === "donate" && (
              <>
                <DetailRow label={t("donor")} value={data.donor || ""} isAddress />
                <DetailRow label={t("campaign")} value={data.campaign || ""} isAddress />
                <DetailRow
                  label={t("amount")}
                  value={`${(parseFloat(data.amount || "0") / LAMPORTS_PER_SOL).toLocaleString()} SOL`}
                  isAmount
                />
              </>
            )}

            {data.type === "create_campaign" && (
              <>
                <DetailRow label={t("creator")} value={data.creator || ""} isAddress />
                <DetailRow label={t("campaign")} value={data.campaign || ""} isAddress />
                <DetailRow label="Title" value={data.title || ""} />
                <DetailRow label="Description" value={data.description || ""} />
                <DetailRow label="Category" value={data.category || ""} />
                <DetailRow
                  label="Target Goal"
                  value={`${(parseFloat(data.amount || "0") / LAMPORTS_PER_SOL).toLocaleString()} SOL`}
                  isAmount
                />
                <DetailRow label="Milestone Count" value={String(data.milestoneCount || 0)} />
                <DetailRow label="Deadline" value={new Date(parseInt(data.deadline || "0") * 1000).toLocaleDateString()} />
              </>
            )}

            {data.type === "create_milestone" && (
              <>
                <DetailRow label={t("creator")} value={data.creator || ""} isAddress />
                <DetailRow label={t("campaign")} value={data.campaign || ""} isAddress />
                <DetailRow label={t("milestone")} value={data.milestone || ""} isAddress />
                <DetailRow label="Milestone Index" value={String((data.milestoneIndex ?? 0) + 1)} />
                <DetailRow label="Milestone Title" value={data.title || ""} />
                <DetailRow
                  label="Allocated Amount"
                  value={`${(parseFloat(data.amount || "0") / LAMPORTS_PER_SOL).toLocaleString()} SOL`}
                  isAmount
                />
              </>
            )}

            {data.type === "submit_proof" && (
              <>
                <DetailRow label={t("creator")} value={data.creator || ""} isAddress />
                <DetailRow label={t("campaign")} value={data.campaign || ""} isAddress />
                <DetailRow label={t("milestone")} value={`Milestone #${(data.milestoneIndex ?? 0) + 1} ${data.milestoneTitle ? `(${data.milestoneTitle})` : ""}`} />
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, display: "block", mb: 1 }}>
                    {t("proofUri")}
                  </Typography>
                  {data.proofUri && (
                    <Button
                      variant="outlined"
                      color="primary"
                      startIcon={<InsertDriveFileIcon />}
                      href={data.proofUri.replace("ipfs://", "https://gateway.pinata.cloud/ipfs/")}
                      target="_blank"
                      rel="noopener"
                      sx={{ textTransform: "none", borderRadius: 2, fontWeight: 700 }}
                    >
                      {t("viewProof")}
                    </Button>
                  )}
                </Box>
              </>
            )}

            {data.type === "request_disbursement" && (
              <>
                <DetailRow label={t("creator")} value={data.creator || ""} isAddress />
                <DetailRow label={t("campaign")} value={data.campaign || ""} isAddress />
                <DetailRow label={t("milestone")} value={`Milestone #${(data.milestoneIndex ?? 0) + 1} ${data.milestoneTitle ? `(${data.milestoneTitle})` : ""}`} />
                <DetailRow
                  label="Funds Released"
                  value={`${(parseFloat(data.amount || "0") / LAMPORTS_PER_SOL).toLocaleString()} SOL`}
                  isAmount
                />
                <DetailRow label={t("recipient")} value={data.creator || ""} isAddress />
              </>
            )}

            {data.type === "close_campaign" && (
              <>
                <DetailRow label={t("creator")} value={data.creator || ""} isAddress />
                <DetailRow label={t("campaign")} value={data.campaign || ""} isAddress />
                <Alert
                  severity="info"
                  icon={<InfoIcon />}
                  sx={{ borderRadius: 2, p: 2, mt: 2 }}
                >
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>
                    {t("closedLabel")}
                  </Typography>
                  <Typography variant="body2">{t("closedDesc")}</Typography>
                </Alert>
              </>
            )}

            <Divider />

            {/* General Metadata */}
            <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
              {t("txDetails")}
            </Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 6 }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                  {t("slot")}
                </Typography>
                <Typography variant="body2">{data.slot}</Typography>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                  {t("timestamp")}
                </Typography>
                <Typography variant="body2">
                  {new Date(data.timestamp * 1000).toLocaleString()}
                </Typography>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                  {t("fee")}
                </Typography>
                <Typography variant="body2">
                  {(data.fee / LAMPORTS_PER_SOL).toFixed(6)} SOL
                </Typography>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                  {t("status")}
                </Typography>
                <Typography variant="body2" color="success.main" sx={{ fontWeight: 700 }}>
                  {t("finalized")}
                </Typography>
              </Grid>
            </Grid>

            {/* Actions */}
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mt: 2 }}>
              <Button
                variant="contained"
                startIcon={<ContentCopyIcon />}
                onClick={handleCopyLink}
                sx={{ borderRadius: 2, py: 1.2, fontWeight: 700, textTransform: "none", flexGrow: 1 }}
              >
                {t("copyLink")}
              </Button>
              <Button
                variant="outlined"
                startIcon={<OpenInNewIcon />}
                href={explorerUrl}
                target="_blank"
                rel="noopener"
                sx={{
                  borderRadius: 2,
                  py: 1.2,
                  fontWeight: 700,
                  textTransform: "none",
                  borderColor: "divider",
                  color: "text.primary",
                  "&:hover": { borderColor: "text.primary" },
                }}
              >
                {t("viewExplorer")}
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      {/* Raw Data Toggle */}
      <Accordion variant="outlined" sx={{ borderRadius: 4, borderColor: "divider", overflow: "hidden" }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
              {t("rawTitle")}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {t("rawDesc")}
            </Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails sx={{ p: 0 }}>
          <Box
            component="pre"
            sx={{
              p: 3,
              m: 0,
              backgroundColor: "#F9FAFC",
              borderTop: "1px solid",
              borderColor: "divider",
              overflowX: "auto",
              fontFamily: "monospace",
              fontSize: "0.8rem",
            }}
          >
            {JSON.stringify(data.raw, null, 2)}
          </Box>
        </AccordionDetails>
      </Accordion>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        message={t("linkCopied")}
      />
    </Container>
  );
}

function DetailRow({
  label,
  value,
  isAddress,
  isAmount,
}: {
  label: string;
  value: string;
  isAddress?: boolean;
  isAmount?: boolean;
}) {
  return (
    <Box>
      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, display: "block", mb: 0.5 }}>
        {label}
      </Typography>
      {isAddress ? (
        <Typography
          variant="body2"
          sx={{
            fontFamily: "monospace",
            wordBreak: "break-all",
            fontWeight: 600,
            p: 1.5,
            borderRadius: 1.5,
            border: "1px solid",
            borderColor: "divider",
            backgroundColor: "#F9FAFC",
          }}
        >
          {value}
        </Typography>
      ) : (
        <Typography
          variant="body1"
          sx={{
            fontWeight: isAmount ? 800 : 500,
            color: isAmount ? "primary.main" : "text.primary",
          }}
        >
          {value}
        </Typography>
      )}
    </Box>
  );
}
