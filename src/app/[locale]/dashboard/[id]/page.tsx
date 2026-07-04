"use client";

import { use, useState, useEffect } from "react";
import { useRouter } from "@/i18n/routing";
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
  Paper,
  Divider,
  Stack,
  List,
  ListItem,
  ListItemText,
  Alert,
  Skeleton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import VisibilityIcon from "@mui/icons-material/Visibility";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import WalletGuard from "@/components/wallet/WalletGuard";
import { useCampaign } from "@/hooks/useCampaign";
import { useDonations } from "@/hooks/useDonations";
import { useManageCampaign } from "@/hooks/useManageCampaign";
import StatusBadge from "@/components/ui/StatusBadge";
import EmptyState from "@/components/ui/EmptyState";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

export default function ManageCampaignPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  return (
    <WalletGuard>
      <ManageCampaignContent campaignId={id} />
    </WalletGuard>
  );
}

function ManageCampaignContent({ campaignId }: { campaignId: string }) {
  const t = useTranslations("dashboard");
  const router = useRouter();
  const wallet = useWallet();

  const { campaign, isLoading: isCampaignLoading, mutate: mutateCampaign } = useCampaign(campaignId);
  const { donations, isLoading: isDonationsLoading } = useDonations(campaignId);
  const { submitProof, requestDisbursement, closeCampaign, isLoading: isActionLoading } = useManageCampaign();

  // Dialog states
  const [proofDialogOpen, setProofDialogOpen] = useState(false);
  const [activeMilestoneIdx, setActiveMilestoneIdx] = useState<number | null>(null);
  const [proofUri, setProofUri] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const [disburseDialogOpen, setDisburseDialogOpen] = useState(false);
  const [closeDialogOpen, setCloseDialogOpen] = useState(false);
  const [confirmTitle, setConfirmTitle] = useState("");

  // Redirect if not the creator
  useEffect(() => {
    if (campaign && wallet.publicKey && campaign.creator !== wallet.publicKey.toBase58()) {
      router.push(`/campaigns/${campaignId}`);
    }
  }, [campaign, wallet.publicKey, campaignId, router]);

  if (isCampaignLoading) {
    return <LoadingSpinner message="Loading management details..." />;
  }

  if (!campaign) {
    return (
      <Container maxWidth="md" sx={{ py: 10 }}>
        <EmptyState
          title="Campaign Not Found"
          description="We couldn't locate this campaign on-chain."
          actionLabel="Back to Dashboard"
          actionPath="/dashboard"
        />
      </Container>
    );
  }

  const currentSol = parseFloat(campaign.currentAmount) / LAMPORTS_PER_SOL;
  const targetSol = parseFloat(campaign.targetAmount) / LAMPORTS_PER_SOL;

  // Calculate released amount
  const releasedSol = campaign.milestones
    ? campaign.milestones.reduce(
        (acc, curr) => acc + (curr.status.released ? parseFloat(curr.targetAmount) : 0),
        0
      ) / LAMPORTS_PER_SOL
    : 0;

  const escrowSol = Math.max(0, currentSol - releasedSol);

  const deadlineDate = new Date(parseInt(campaign.deadline) * 1000);
  const daysLeft = Math.max(0, Math.ceil((deadlineDate.getTime() - Date.now()) / (1000 * 3600 * 24)));

  // Milestone Actions Handlers
  const handleOpenProofDialog = (index: number) => {
    setActiveMilestoneIdx(index);
    setProofUri("");
    setUploadError(null);
    setActionError(null);
    setProofDialogOpen(true);
  };

  const handleProofFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Upload failed");
      const data = await response.json();
      setProofUri(data.uri);
    } catch (err) {
      console.error(err);
      setUploadError("Failed to upload proof to IPFS");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmitProof = async () => {
    if (activeMilestoneIdx === null || !proofUri) return;
    setActionError(null);

    try {
      await submitProof(campaignId, activeMilestoneIdx, proofUri);
      setProofDialogOpen(false);
      mutateCampaign();
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : "Failed to submit proof");
    }
  };

  const handleOpenDisburseDialog = (index: number) => {
    setActiveMilestoneIdx(index);
    setActionError(null);
    setDisburseDialogOpen(true);
  };

  const handleConfirmDisburse = async () => {
    if (activeMilestoneIdx === null) return;
    setActionError(null);

    try {
      await requestDisbursement(campaignId, activeMilestoneIdx, campaign.milestoneCount);
      setDisburseDialogOpen(false);
      mutateCampaign();
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : "Failed to request disbursement");
    }
  };

  const handleCloseCampaign = async () => {
    if (confirmTitle !== campaign.title) return;
    setActionError(null);

    try {
      await closeCampaign(campaignId);
      setCloseDialogOpen(false);
      mutateCampaign();
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : "Failed to close campaign");
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      {/* Back navigation */}
      <Box sx={{ mb: 4 }}>
        <Link href="/dashboard" passHref style={{ textDecoration: "none", color: "inherit" }}>
          <Button startIcon={<ArrowBackIcon />} sx={{ fontWeight: 700, textTransform: "none" }}>
            {t("backToDashboard")}
          </Button>
        </Link>
      </Box>

      {/* Campaign Header */}
      <Card variant="outlined" sx={{ borderRadius: 4, borderColor: "divider", mb: 4 }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, justifyContent: "space-between", alignItems: { xs: "flex-start", sm: "center" }, gap: 2, mb: 3 }}>
            <Box>
              <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", mb: 1 }}>
                <Typography variant="h4" sx={{ fontWeight: 900, fontFamily: "var(--font-plus-jakarta-sans)" }}>
                  {campaign.title}
                </Typography>
                <StatusBadge status={campaign.status} />
              </Stack>
              <Typography variant="caption" color="text.secondary" sx={{ fontFamily: "monospace", wordBreak: "break-all" }}>
                PDA: {campaign.pubkey}
              </Typography>
            </Box>

            <Link href={`/campaigns/${campaignId}`} passHref style={{ textDecoration: "none" }}>
              <Button variant="outlined" startIcon={<VisibilityIcon />} sx={{ borderRadius: 2, textTransform: "none", fontWeight: 700 }}>
                {t("btnView")}
              </Button>
            </Link>
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Escrow balance stats */}
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, sm: 3 }}>
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                  {t("escrowBalance")}
                </Typography>
                <Typography variant="h5" color="primary.main" sx={{ fontWeight: 800, mt: 0.5 }}>
                  {escrowSol.toLocaleString()} SOL
                </Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 3 }}>
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                  Total Raised
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 800, mt: 0.5 }}>
                  {currentSol.toLocaleString()} SOL
                </Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 3 }}>
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                  Target Goal
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 800, mt: 0.5 }}>
                  {targetSol.toLocaleString()} SOL
                </Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 3 }}>
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                  Time Remaining
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 800, mt: 0.5 }}>
                  {daysLeft > 0 ? `${daysLeft} days` : "Ended"}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Grid container spacing={4}>
        {/* Milestone management */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Card variant="outlined" sx={{ borderRadius: 4, borderColor: "divider", mb: 4 }}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>
                {t("disbursementTitle")}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                {t("disbursementDesc")}
              </Typography>

              <List disablePadding>
                {campaign.milestones?.map((m, idx) => {
                  const mAmount = parseFloat(m.targetAmount) / LAMPORTS_PER_SOL;

                  return (
                    <Paper
                      variant="outlined"
                      key={m.pubkey}
                      sx={{
                        p: 3,
                        mb: 2,
                        borderRadius: 3,
                        borderColor: "divider",
                        backgroundColor: m.status.released
                          ? "rgba(0, 240, 181, 0.02)"
                          : "background.paper",
                      }}
                    >
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 2 }}>
                        <Box>
                          <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 0.5 }}>
                            Milestone {idx + 1}: {m.title}
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 700, color: "text.secondary" }}>
                            Amount: {mAmount.toLocaleString()} SOL
                          </Typography>
                          {m.proofUri && (
                            <MuiLink
                              href={m.proofUri.replace("ipfs://", "https://gateway.pinata.cloud/ipfs/")}
                              target="_blank"
                              rel="noopener"
                              variant="body2"
                              sx={{ display: "block", mt: 1, textDecoration: "none", color: "primary.main", fontWeight: 700 }}
                            >
                              View Spending Proof (IPFS)
                            </MuiLink>
                          )}
                        </Box>

                        <Box sx={{ textAlign: { xs: "left", sm: "right" }, minWidth: 120 }}>
                          <Box sx={{ mb: 1.5 }}>
                            <Typography variant="caption" color="text.secondary" sx={{ display: "block", fontWeight: 700 }}>
                              STATUS
                            </Typography>
                            {m.status.pending && (
                              <Chip label={t("pending")} color="warning" size="small" sx={{ borderRadius: 1, fontWeight: 700 }} />
                            )}
                            {m.status.proofSubmitted && (
                              <Chip label={t("proofSubmitted")} color="info" size="small" sx={{ borderRadius: 1, fontWeight: 700 }} />
                            )}
                            {m.status.released && (
                              <Chip label={t("released")} color="success" size="small" sx={{ borderRadius: 1, fontWeight: 700 }} />
                            )}
                          </Box>

                          {/* Action Buttons based on status */}
                          {m.status.pending && (
                            <Button
                              variant="outlined"
                              size="small"
                              onClick={() => handleOpenProofDialog(m.index)}
                              sx={{ borderRadius: 1.5, textTransform: "none", fontWeight: 700 }}
                            >
                              {t("btnUploadProof")}
                            </Button>
                          )}

                          {m.status.proofSubmitted && (
                            <Button
                              variant="contained"
                              color="primary"
                              size="small"
                              onClick={() => handleOpenDisburseDialog(m.index)}
                              sx={{ borderRadius: 1.5, textTransform: "none", fontWeight: 700 }}
                            >
                              {t("btnRequestDisburse")}
                            </Button>
                          )}

                          {m.status.released && (
                            <Stack direction="row" spacing={0.5} sx={{ alignItems: "center", justifyContent: { xs: "flex-start", sm: "flex-end" } }}>
                              <CheckCircleIcon color="success" fontSize="small" />
                              <Typography variant="body2" color="success.main" sx={{ fontWeight: 700 }}>
                                Released
                              </Typography>
                            </Stack>
                          )}
                        </Box>
                      </Box>
                    </Paper>
                  );
                })}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Side columns: Donations + Danger Zone */}
        <Grid size={{ xs: 12, md: 4 }}>
          {/* Donations activity */}
          <Card variant="outlined" sx={{ borderRadius: 4, borderColor: "divider", mb: 4 }}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h6" sx={{ fontWeight: 800, mb: 3 }}>
                {t("recentDonations")}
              </Typography>

              {isDonationsLoading ? (
                <Stack spacing={2}>
                  {[1, 2].map((i) => (
                    <Skeleton key={i} height={40} />
                  ))}
                </Stack>
              ) : donations.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  {t("noDonations")}
                </Typography>
              ) : (
                <List disablePadding>
                  {donations.slice(0, 10).map((d) => {
                    const amount = parseFloat(d.amount) / LAMPORTS_PER_SOL;
                    const date = new Date(parseInt(d.timestamp) * 1000).toLocaleDateString();
                    return (
                      <ListItem
                        key={d.pubkey}
                        disableGutters
                        sx={{
                          py: 1.5,
                          borderBottom: "1px solid",
                          borderColor: "divider",
                          "&:last-child": { borderBottom: "none" },
                        }}
                      >
                        <ListItemText
                          primary={
                            <Typography variant="body2" sx={{ fontWeight: 700 }}>
                              {amount} SOL
                            </Typography>
                          }
                          secondary={
                            <Typography variant="caption" color="text.secondary" sx={{ fontFamily: "monospace" }}>
                              {d.donor.slice(0, 4)}...{d.donor.slice(-4)} · {date}
                            </Typography>
                          }
                        />
                      </ListItem>
                    );
                  })}
                </List>
              )}
            </CardContent>
          </Card>

          {/* Danger zone */}
          <Card variant="outlined" sx={{ borderRadius: 4, borderColor: "error.light", overflow: "hidden" }}>
            <Box sx={{ backgroundColor: "rgba(239, 83, 80, 0.04)", p: 3, borderBottom: "1px solid", borderColor: "error.light" }}>
              <Stack direction="row" spacing={1} sx={{ alignItems: "center", color: "error.main" }}>
                <WarningAmberIcon />
                <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                  {t("closeCampaignTitle")}
                </Typography>
              </Stack>
            </Box>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
                {t("closeCampaignDesc")}
              </Typography>
              <Button
                variant="outlined"
                color="error"
                fullWidth
                disabled={"closed" in campaign.status}
                onClick={() => {
                  setActionError(null);
                  setConfirmTitle("");
                  setCloseDialogOpen(true);
                }}
                sx={{ py: 1, borderRadius: 2, textTransform: "none", fontWeight: 700 }}
              >
                {"closed" in campaign.status ? "Campaign Closed" : t("closeBtn")}
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Proof Upload Dialog */}
      <Dialog
        open={proofDialogOpen}
        onClose={() => !isActionLoading && setProofDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        slotProps={{
          paper: {
            sx: { borderRadius: 4, p: 3 },
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 800, p: 0, mb: 1 }}>
          {t("proofDialogTitle")}
        </DialogTitle>
        <DialogContent sx={{ p: 0, my: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {t("proofDialogDesc")}
          </Typography>

          {uploadError && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{uploadError}</Alert>}
          {actionError && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{actionError}</Alert>}

          {proofUri ? (
            <Box sx={{ border: "1px solid", borderColor: "divider", borderRadius: 3, p: 2, textAlign: "center" }}>
              <CheckCircleIcon color="success" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>
                {t("uploadSuccess")}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ wordBreak: "break-all", display: "block" }}>
                IPFS: {proofUri}
              </Typography>
            </Box>
          ) : (
            <Box
              sx={{
                border: "2px dashed",
                borderColor: "divider",
                borderRadius: 3,
                p: 4,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 2,
                backgroundColor: "background.default",
              }}
            >
              {isUploading ? (
                <Stack spacing={2} sx={{ alignItems: "center" }}>
                  <CircularProgress size={30} />
                  <Typography variant="body2" color="text.secondary">
                    Uploading file to IPFS...
                  </Typography>
                </Stack>
              ) : (
                <>
                  <CloudUploadIcon sx={{ fontSize: 40, color: "text.secondary" }} />
                  <Button component="label" variant="contained" size="small">
                    {t("uploadProofBtn")}
                    <input type="file" accept="image/*,application/pdf" hidden onChange={handleProofFileChange} />
                  </Button>
                  <Typography variant="caption" color="text.secondary">
                    PDF or Image up to 10MB
                  </Typography>
                </>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 0, gap: 1.5 }}>
          <Button
            variant="text"
            color="inherit"
            disabled={isActionLoading}
            onClick={() => setProofDialogOpen(false)}
            sx={{ fontWeight: 700 }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="primary"
            disabled={!proofUri || isActionLoading}
            onClick={handleSubmitProof}
            startIcon={isActionLoading && <CircularProgress size={16} color="inherit" />}
            sx={{ px: 3, borderRadius: 2, fontWeight: 700 }}
          >
            {t("submitProofBtn")}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Disbursement Dialog */}
      <Dialog
        open={disburseDialogOpen}
        onClose={() => !isActionLoading && setDisburseDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        slotProps={{
          paper: {
            sx: { borderRadius: 4, p: 3 },
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 800, p: 0, mb: 1 }}>
          {t("disburseDialogTitle")}
        </DialogTitle>
        <DialogContent sx={{ p: 0, my: 2 }}>
          {activeMilestoneIdx !== null && campaign.milestones && (
            <Typography variant="body2" color="text.secondary">
              {t("disburseDialogDesc", {
                amount: (parseFloat(campaign.milestones[activeMilestoneIdx].targetAmount) / LAMPORTS_PER_SOL).toFixed(3),
              })}
            </Typography>
          )}
          {actionError && <Alert severity="error" sx={{ mt: 2, borderRadius: 2 }}>{actionError}</Alert>}
        </DialogContent>
        <DialogActions sx={{ p: 0, gap: 1.5 }}>
          <Button
            variant="text"
            color="inherit"
            disabled={isActionLoading}
            onClick={() => setDisburseDialogOpen(false)}
            sx={{ fontWeight: 700 }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="primary"
            disabled={isActionLoading}
            onClick={handleConfirmDisburse}
            startIcon={isActionLoading && <CircularProgress size={16} color="inherit" />}
            sx={{ px: 3, borderRadius: 2, fontWeight: 700 }}
          >
            {t("confirmDisburseBtn")}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Close Campaign Dialog */}
      <Dialog
        open={closeDialogOpen}
        onClose={() => !isActionLoading && setCloseDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        slotProps={{
          paper: {
            sx: { borderRadius: 4, p: 3 },
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 800, p: 0, mb: 1 }}>
          {t("closeDialogTitle")}
        </DialogTitle>
        <DialogContent sx={{ p: 0, my: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {t("closeDialogDesc")}
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 700, mb: 2, color: "text.primary", p: 1, border: "1px solid", borderColor: "divider", borderRadius: 1.5, backgroundColor: "background.default", textAlign: "center" }}>
            {campaign.title}
          </Typography>

          <TextField
            fullWidth
            placeholder="Type campaign title exactly"
            value={confirmTitle}
            onChange={(e) => setConfirmTitle(e.target.value)}
            disabled={isActionLoading}
          />

          {actionError && <Alert severity="error" sx={{ mt: 2, borderRadius: 2 }}>{actionError}</Alert>}
        </DialogContent>
        <DialogActions sx={{ p: 0, gap: 1.5 }}>
          <Button
            variant="text"
            color="inherit"
            disabled={isActionLoading}
            onClick={() => setCloseDialogOpen(false)}
            sx={{ fontWeight: 700 }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            disabled={confirmTitle !== campaign.title || isActionLoading}
            onClick={handleCloseCampaign}
            startIcon={isActionLoading && <CircularProgress size={16} color="inherit" />}
            sx={{ px: 3, borderRadius: 2, fontWeight: 700 }}
          >
            {t("confirmCloseBtn")}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

// Custom Material UI Link style override
import { Link as MuiLink, Chip } from "@mui/material";
