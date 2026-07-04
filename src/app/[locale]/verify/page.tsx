"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Stack,
  Alert,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

export default function VerifySearchPage() {
  const t = useTranslations("verify");
  const router = useRouter();
  const [signature, setSignature] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanSig = signature.trim();

    if (!cleanSig) {
      setError(t("inputPlaceholder"));
      return;
    }

    // Solana transaction signatures are 88 base58 characters
    if (cleanSig.length !== 88) {
      setError(t("invalidSig"));
      return;
    }

    setError(null);
    router.push(`/verify/${cleanSig}`);
  };

  return (
    <Container maxWidth="sm" sx={{ py: 12 }}>
      <Card variant="outlined" sx={{ borderRadius: 4, borderColor: "divider", p: 2 }}>
        <CardContent>
          <Box sx={{ textAlign: "center", mb: 5 }}>
            <Box
              sx={{
                width: 60,
                height: 60,
                borderRadius: "50%",
                backgroundColor: "rgba(95, 60, 254, 0.05)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "primary.main",
                mx: "auto",
                mb: 2,
              }}
            >
              <SearchIcon sx={{ fontSize: 30 }} />
            </Box>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 900,
                letterSpacing: "-0.04em",
                fontFamily: "var(--font-syne)",
                mb: 1,
              }}
            >
              {t("title")}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t("subtitle")}
            </Typography>
          </Box>

          <form onSubmit={handleSubmit}>
            <Stack spacing={3}>
              {error && <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>}
              <TextField
                fullWidth
                label={t("inputLabel")}
                placeholder={t("inputPlaceholder")}
                value={signature}
                onChange={(e) => setSignature(e.target.value)}
                error={!!error}
              />
              <Button
                type="submit"
                variant="contained"
                color="primary"
                size="large"
                fullWidth
                sx={{ py: 1.5, borderRadius: 2, fontWeight: 700, textTransform: "none" }}
              >
                {t("btnVerify")}
              </Button>
            </Stack>
          </form>
        </CardContent>
      </Card>
    </Container>
  );
}
