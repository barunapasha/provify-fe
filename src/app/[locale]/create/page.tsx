"use client";

import { useState, use } from "react";
import { useRouter } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import {
  Box,
  Container,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Button,
  Card,
  CardContent,
  TextField,
  MenuItem,
  InputAdornment,
  IconButton,
  List,
  ListItem,
  LinearProgress,
  CircularProgress,
  Alert,
  Divider,
  Grid,
  Dialog,
  DialogContent,
  Stack,
  Chip,
} from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import WalletGuard from "@/components/wallet/WalletGuard";
import { useCreateCampaign, MilestoneInput } from "@/hooks/useCreateCampaign";
import { useWallet } from "@solana/wallet-adapter-react";

const CATEGORIES = ["Kesehatan", "Pendidikan", "Bencana", "Sosial", "Lainnya"];

export default function CreateCampaignPage() {
  return (
    <WalletGuard>
      <CreateCampaignForm />
    </WalletGuard>
  );
}

function CreateCampaignForm() {
  const t = useTranslations("create");
  const router = useRouter();
  const wallet = useWallet();
  const { createCampaign, status, currentMilestone, totalMilestones, txHash, campaignPda, error: deployError } = useCreateCampaign();

  const [activeStep, setActiveStep] = useState(0);

  // Step 1: Details
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [deadline, setDeadline] = useState("");

  // Step 2: Milestones
  const [milestones, setMilestones] = useState<MilestoneInput[]>([
    { title: "", targetAmountSol: 0 },
  ]);

  // Step 3: Cover Image
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUri, setImageUri] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Local UI Validation
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleNext = () => {
    if (validateStep()) {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const validateStep = () => {
    const newErrors: Record<string, string> = {};

    if (activeStep === 0) {
      if (!title.trim()) newErrors.title = "Title is required";
      if (title.length > 100) newErrors.title = "Title must be 100 characters or less";
      if (!description.trim()) newErrors.description = "Description is required";
      if (description.length > 500) newErrors.description = "Description must be 500 characters or less";
      if (!category) newErrors.category = "Category is required";

      const target = parseFloat(targetAmount);
      if (isNaN(target) || target < 0.1) {
        newErrors.targetAmount = t("minAmountError");
      }

      if (!deadline) {
        newErrors.deadline = "Deadline is required";
      } else {
        const deadlineDate = new Date(deadline);
        if (deadlineDate.getTime() <= Date.now()) {
          newErrors.deadline = t("futureDateError");
        }
      }
    }

    if (activeStep === 1) {
      // Validate milestones
      let hasMilestoneError = false;
      milestones.forEach((m, idx) => {
        if (!m.title.trim()) {
          newErrors[`m-title-${idx}`] = "Milestone title is required";
          hasMilestoneError = true;
        }
        if (m.title.length > 100) {
          newErrors[`m-title-${idx}`] = "Milestone title must be 100 characters or less";
          hasMilestoneError = true;
        }
        if (m.targetAmountSol <= 0) {
          newErrors[`m-amount-${idx}`] = "Amount must be greater than 0";
          hasMilestoneError = true;
        }
      });

      if (!hasMilestoneError) {
        const sum = milestones.reduce((acc, curr) => acc + curr.targetAmountSol, 0);
        const target = parseFloat(targetAmount);
        // Compare with a small tolerance for floating point precision issues
        if (Math.abs(sum - target) > 0.0001) {
          newErrors.milestonesSum = t("sumMismatchError", { sum: sum.toFixed(3), target: target.toFixed(3) });
        }
      }
    }

    if (activeStep === 2) {
      if (!imageUri) {
        newErrors.image = "Cover image is required";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Milestone actions
  const handleAddMilestone = () => {
    if (milestones.length < 5) {
      setMilestones([...milestones, { title: "", targetAmountSol: 0 }]);
    }
  };

  const handleRemoveMilestone = (index: number) => {
    if (milestones.length > 1) {
      const updated = milestones.filter((_, i) => i !== index);
      setMilestones(updated);
    }
  };

  const handleMilestoneChange = (
    index: number,
    field: keyof MilestoneInput,
    value: string
  ) => {
    const updated = milestones.map((m, i) => {
      if (i === index) {
        return {
          ...m,
          [field]: field === "targetAmountSol" ? parseFloat(value) || 0 : value,
        };
      }
      return m;
    });
    setMilestones(updated);
  };

  // Image Upload Action
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageFile(file);
    setIsUploading(true);
    setUploadError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload image to IPFS");
      }

      const data = await response.json();
      setImageUri(data.uri);
    } catch (err: any) {
      console.error(err);
      setUploadError(t("uploadError"));
    } finally {
      setIsUploading(false);
    }
  };

  // Deploy Action
  const handleDeploy = async () => {
    try {
      const deadlineDate = new Date(deadline);
      const deadlineUnix = Math.floor(deadlineDate.getTime() / 1000);
      const target = parseFloat(targetAmount);

      await createCampaign(
        title,
        description,
        imageUri,
        category,
        target,
        deadlineUnix,
        milestones
      );
    } catch (err) {
      console.error("Deployment failed:", err);
    }
  };

  const steps = [
    t("stepDetails"),
    t("stepMilestones"),
    t("stepImage"),
    t("stepPreview"),
  ];

  const milestonesSum = milestones.reduce((acc, curr) => acc + curr.targetAmountSol, 0);
  const targetVal = parseFloat(targetAmount) || 0;

  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      {/* Title */}
      <Box sx={{ mb: 6, textAlign: "center" }}>
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

      {/* Stepper */}
      <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 6 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {/* Form Content */}
      <Card variant="outlined" sx={{ borderRadius: 4, borderColor: "divider", mb: 4 }}>
        <CardContent sx={{ p: 4 }}>
          {/* Step 1: Details */}
          {activeStep === 0 && (
            <Stack spacing={3}>
              <TextField
                label={t("campaignTitle")}
                placeholder={t("campaignTitlePlaceholder")}
                fullWidth
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                error={!!errors.title}
                helperText={errors.title || `${title.length}/100`}
                inputProps={{ maxLength: 100 }}
              />

              <TextField
                label={t("description")}
                placeholder={t("descriptionPlaceholder")}
                fullWidth
                multiline
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                error={!!errors.description}
                helperText={errors.description || `${description.length}/500`}
                inputProps={{ maxLength: 500 }}
              />

              <Grid container spacing={3}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    select
                    label={t("category")}
                    fullWidth
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    error={!!errors.category}
                    helperText={errors.category}
                  >
                    {CATEGORIES.map((cat) => (
                      <MenuItem key={cat} value={cat}>
                        {cat}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label={t("targetAmount")}
                    type="number"
                    fullWidth
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(e.target.value)}
                    error={!!errors.targetAmount}
                    helperText={errors.targetAmount}
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">SOL</InputAdornment>
                        ),
                      },
                    }}
                  />
                </Grid>
              </Grid>

              <TextField
                label={t("deadline")}
                type="date"
                fullWidth
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                error={!!errors.deadline}
                helperText={errors.deadline}
                slotProps={{
                  inputLabel: {
                    shrink: true,
                  },
                }}
              />
            </Stack>
          )}

          {/* Step 2: Milestones */}
          {activeStep === 1 && (
            <Stack spacing={3}>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>
                  {t("milestonesTitle")}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  {t("milestonesDesc")}
                </Typography>
              </Box>

              {/* Running total tracker */}
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    Total Allocated: {milestonesSum.toFixed(3)} / {targetVal.toFixed(3)} SOL
                  </Typography>
                  <Typography
                    variant="body2"
                    color={
                      Math.abs(milestonesSum - targetVal) < 0.0001
                        ? "success.main"
                        : "error.main"
                    }
                    sx={{ fontWeight: 700 }}
                  >
                    {Math.abs(milestonesSum - targetVal) < 0.0001
                      ? "Sum matches ✓"
                      : `${(targetVal - milestonesSum).toFixed(3)} SOL remaining`}
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={Math.min(100, (milestonesSum / (targetVal || 1)) * 100)}
                  color={
                    Math.abs(milestonesSum - targetVal) < 0.0001
                      ? "success"
                      : milestonesSum > targetVal
                      ? "error"
                      : "primary"
                  }
                  sx={{ height: 8, borderRadius: 1 }}
                />
              </Box>

              {errors.milestonesSum && (
                <Alert severity="error" sx={{ borderRadius: 2 }}>
                  {errors.milestonesSum}
                </Alert>
              )}

              {/* Milestones list */}
              <List disablePadding>
                {milestones.map((milestone, idx) => (
                  <ListItem
                    key={idx}
                    disableGutters
                    sx={{
                      display: "flex",
                      flexDirection: { xs: "column", sm: "row" },
                      gap: 2,
                      alignItems: "flex-start",
                      mb: 2,
                      p: 2.5,
                      border: "1px solid",
                      borderColor: "divider",
                      borderRadius: 3,
                    }}
                  >
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, mt: 1, minWidth: 90 }}>
                      {t("milestoneLabel", { index: idx + 1 })}
                    </Typography>

                    <Grid container spacing={2} sx={{ width: "100%", flexGrow: 1 }}>
                      <Grid size={{ xs: 12, sm: 8 }}>
                        <TextField
                          label={t("milestoneTitleLabel")}
                          placeholder={t("milestoneTitlePlaceholder")}
                          fullWidth
                          value={milestone.title}
                          onChange={(e) => handleMilestoneChange(idx, "title", e.target.value)}
                          error={!!errors[`m-title-${idx}`]}
                          helperText={errors[`m-title-${idx}`]}
                          inputProps={{ maxLength: 100 }}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 4 }}>
                        <TextField
                          label={t("milestoneAmountLabel")}
                          type="number"
                          fullWidth
                          value={milestone.targetAmountSol || ""}
                          onChange={(e) => handleMilestoneChange(idx, "targetAmountSol", e.target.value)}
                          error={!!errors[`m-amount-${idx}`]}
                          helperText={errors[`m-amount-${idx}`]}
                          slotProps={{
                            input: {
                              startAdornment: (
                                <InputAdornment position="start">SOL</InputAdornment>
                              ),
                            },
                          }}
                        />
                      </Grid>
                    </Grid>

                    {milestones.length > 1 && (
                      <IconButton
                        color="error"
                        onClick={() => handleRemoveMilestone(idx)}
                        sx={{ mt: { xs: 0, sm: 1 }, alignSelf: { xs: "flex-end", sm: "auto" } }}
                      >
                        <DeleteOutlineIcon />
                      </IconButton>
                    )}
                  </ListItem>
                ))}
              </List>

              {/* Add milestone button */}
              {milestones.length < 5 && (
                <Button
                  variant="outlined"
                  color="primary"
                  startIcon={<AddCircleOutlineIcon />}
                  onClick={handleAddMilestone}
                  sx={{ py: 1.5, borderRadius: 2, textTransform: "none" }}
                >
                  {t("addMilestone")}
                </Button>
              )}
            </Stack>
          )}

          {/* Step 3: Cover Image */}
          {activeStep === 2 && (
            <Stack spacing={3} sx={{ alignItems: "center", textAlign: "center" }}>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>
                  {t("imageTitle")}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t("imageDesc")}
                </Typography>
              </Box>

              {uploadError && (
                <Alert severity="error" sx={{ width: "100%", borderRadius: 2 }}>
                  {uploadError}
                </Alert>
              )}

              {errors.image && (
                <Alert severity="error" sx={{ width: "100%", borderRadius: 2 }}>
                  {errors.image}
                </Alert>
              )}

              {imageUri ? (
                <Box sx={{ width: "100%", maxWidth: 400 }}>
                  <Box
                    component="img"
                    src={imageUri.replace("ipfs://", "https://gateway.pinata.cloud/ipfs/")}
                    alt="Cover preview"
                    sx={{
                      width: "100%",
                      height: 220,
                      objectFit: "cover",
                      borderRadius: 4,
                      border: "1px solid",
                      borderColor: "divider",
                      mb: 2,
                    }}
                  />
                  <Typography variant="caption" color="text.secondary" sx={{ wordBreak: "break-all", display: "block" }}>
                    IPFS: {imageUri}
                  </Typography>
                  <Button
                    component="label"
                    variant="text"
                    color="primary"
                    startIcon={<CloudUploadIcon />}
                    sx={{ mt: 1 }}
                  >
                    Change Image
                    <input type="file" accept="image/*" hidden onChange={handleImageChange} />
                  </Button>
                </Box>
              ) : (
                <Box
                  sx={{
                    width: "100%",
                    height: 240,
                    border: "2px dashed",
                    borderColor: errors.image ? "error.main" : "divider",
                    borderRadius: 4,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 2,
                    backgroundColor: "background.default",
                    p: 4,
                  }}
                >
                  {isUploading ? (
                    <Stack spacing={2} sx={{ alignItems: "center" }}>
                      <CircularProgress size={40} />
                      <Typography variant="body2" color="text.secondary">
                        Uploading to IPFS...
                      </Typography>
                    </Stack>
                  ) : (
                    <>
                      <CloudUploadIcon sx={{ fontSize: 48, color: "text.secondary" }} />
                      <Button component="label" variant="contained" color="primary">
                        {t("uploadBtn")}
                        <input type="file" accept="image/*" hidden onChange={handleImageChange} />
                      </Button>
                      <Typography variant="caption" color="text.secondary">
                        PNG, JPG, or WEBP up to 5MB
                      </Typography>
                    </>
                  )}
                </Box>
              )}
            </Stack>
          )}

          {/* Step 4: Preview & Deploy */}
          {activeStep === 3 && (
            <Stack spacing={4}>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>
                  {t("previewTitle")}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t("previewDesc")}
                </Typography>
              </Box>

              <Grid container spacing={4}>
                {/* Campaign cover */}
                <Grid size={{ xs: 12, md: 5 }}>
                  <Box
                    component="img"
                    src={imageUri.replace("ipfs://", "https://gateway.pinata.cloud/ipfs/")}
                    alt={title}
                    sx={{
                      width: "100%",
                      height: 240,
                      objectFit: "cover",
                      borderRadius: 4,
                      border: "1px solid",
                      borderColor: "divider",
                    }}
                  />
                </Grid>

                {/* Details */}
                <Grid size={{ xs: 12, md: 7 }}>
                  <Stack spacing={2}>
                    <Box>
                      <Chip
                        label={category}
                        size="small"
                        sx={{ fontWeight: 700, borderRadius: 1 }}
                      />
                    </Box>
                    <Typography variant="h4" sx={{ fontWeight: 900 }}>
                      {title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: "pre-line" }}>
                      {description}
                    </Typography>
                    <Divider />
                    <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                      <Typography variant="body2" color="text.secondary">
                        Target Pendanaan:
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 800 }}>
                        {targetVal.toLocaleString()} SOL
                      </Typography>
                    </Box>
                    <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                      <Typography variant="body2" color="text.secondary">
                        Batas Waktu:
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 800 }}>
                        {new Date(deadline).toLocaleDateString()}
                      </Typography>
                    </Box>
                  </Stack>
                </Grid>
              </Grid>

              <Divider />

              {/* Milestones Preview */}
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 2 }}>
                  Milestone Anggaran ({milestones.length})
                </Typography>
                <Stack spacing={2}>
                  {milestones.map((m, idx) => (
                    <Box
                      key={idx}
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        p: 2,
                        border: "1px solid",
                        borderColor: "divider",
                        borderRadius: 2,
                        backgroundColor: "background.default",
                      }}
                    >
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        M{idx + 1}: {m.title}
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 800 }}>
                        {m.targetAmountSol} SOL
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              </Box>

              <Button
                variant="contained"
                color="primary"
                size="large"
                fullWidth
                onClick={handleDeploy}
                sx={{ py: 2, borderRadius: 3, fontWeight: 700 }}
              >
                {t("deployBtn")}
              </Button>
            </Stack>
          )}
        </CardContent>
      </Card>

      {/* Nav Buttons */}
      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
        <Button
          variant="text"
          color="inherit"
          onClick={handleBack}
          disabled={activeStep === 0}
          sx={{ fontWeight: 700 }}
        >
          {t("back")}
        </Button>
        {activeStep < 3 && (
          <Button
            variant="contained"
            color="primary"
            onClick={handleNext}
            sx={{ px: 4, py: 1.2, borderRadius: 2, fontWeight: 700 }}
          >
            {t("next")}
          </Button>
        )}
      </Box>

      {/* Deployment Status Dialog */}
      <Dialog
        open={status !== "idle"}
        maxWidth="xs"
        fullWidth
        slotProps={{
          paper: {
            sx: { borderRadius: 4, p: 3 },
          },
        }}
      >
        <DialogContent>
          <Stack spacing={4} sx={{ alignItems: "center", textAlign: "center" }}>
            {status === "creating_campaign" && (
              <>
                <CircularProgress size={50} />
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>
                    {t("creatingCampaign")}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Please approve the transaction in Phantom Wallet...
                  </Typography>
                </Box>
              </>
            )}

            {status === "creating_milestones" && (
              <>
                <CircularProgress size={50} />
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>
                    {t("creatingMilestones", { current: currentMilestone, total: totalMilestones })}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Deploying milestones sequentially. Please approve each transaction in your wallet...
                  </Typography>
                </Box>
              </>
            )}

            {status === "success" && (
              <>
                <CheckCircleIcon sx={{ fontSize: 60, color: "success.main" }} />
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>
                    {t("deploySuccess")}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Your transparent crowdfunding campaign is now live on Solana.
                  </Typography>
                  {campaignPda && (
                    <Typography variant="caption" color="primary.main" sx={{ fontFamily: "monospace", display: "block", wordBreak: "break-all" }}>
                      PDA: {campaignPda}
                    </Typography>
                  )}
                </Box>
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  onClick={() => router.push("/dashboard")}
                  sx={{ py: 1.5, borderRadius: 2 }}
                >
                  {t("viewDashboard")}
                </Button>
              </>
            )}

            {status === "error" && (
              <>
                <ErrorIcon sx={{ fontSize: 60, color: "error.main" }} />
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>
                    Deployment Failed
                  </Typography>
                  <Typography variant="body2" color="error.main" sx={{ wordBreak: "break-all" }}>
                    {deployError || "Transaction rejected or network error."}
                  </Typography>
                </Box>
                <Button
                  variant="outlined"
                  color="primary"
                  fullWidth
                  onClick={() => handleDeploy()}
                  sx={{ py: 1.5, borderRadius: 2 }}
                >
                  Try Again
                </Button>
              </>
            )}
          </Stack>
        </DialogContent>
      </Dialog>
    </Container>
  );
}
