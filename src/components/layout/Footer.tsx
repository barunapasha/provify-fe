"use client";

import { Box, Container, Typography, Chip, Link as MuiLink } from "@mui/material";
import Link from "next/link";

export default function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        py: 6,
        mt: "auto",
        borderTop: "1px solid",
        borderColor: "divider",
        backgroundColor: "background.paper",
      }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            justifyContent: "space-between",
            alignItems: { xs: "flex-start", sm: "center" },
            gap: 3,
          }}
        >
          <Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 900,
                  letterSpacing: "-0.05em",
                  fontFamily: "var(--font-syne)",
                }}
              >
                PROVIFY.
              </Typography>
              <Chip
                label="DEVNET"
                size="small"
                sx={{
                  backgroundColor: "rgba(0, 240, 181, 0.1)",
                  color: "#00b084",
                  fontWeight: 800,
                  fontSize: "0.65rem",
                  borderRadius: 1,
                  fontFamily: "monospace",
                }}
              />
            </Box>
            <Typography variant="body2" color="text.secondary">
              Tamper-proof on-chain donation transparency ledger.
            </Typography>
          </Box>

          <Box sx={{ display: "flex", gap: 4 }}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, letterSpacing: "0.1em" }}>
                SYSTEM
              </Typography>
              <MuiLink
                href="https://explorer.solana.com/?cluster=devnet"
                target="_blank"
                rel="noopener"
                color="inherit"
                variant="body2"
                sx={{ textDecoration: "none", "&:hover": { color: "primary.main" } }}
              >
                Solana Explorer
              </MuiLink>
              <Link href="/verify/tx" passHref style={{ textDecoration: "none", color: "inherit" }}>
                <Typography variant="body2" sx={{ "&:hover": { color: "primary.main" } }}>
                  Tx Verifier
                </Typography>
              </Link>
            </Box>
          </Box>
        </Box>

        <Box sx={{ mt: 6, pt: 3, borderTop: "1px solid", borderColor: "divider", display: "flex", justifyContent: "space-between" }}>
          <Typography variant="caption" color="text.secondary">
            &copy; {new Date().getFullYear()} Provify. All rights reserved.
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Built on Solana
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
