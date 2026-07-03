"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { Box, Button, Container, Typography } from "@mui/material";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";

export default function WalletGuard({ children }: { children: React.ReactNode }) {
  const { connected } = useWallet();
  const { setVisible } = useWalletModal();

  if (!connected) {
    return (
      <Container maxWidth="sm">
        <Box
          sx={{
            py: 12,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            gap: 3,
          }}
        >
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              backgroundColor: "rgba(95, 60, 254, 0.05)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "primary.main",
            }}
          >
            <AccountBalanceWalletIcon sx={{ fontSize: 40 }} />
          </Box>
          <Box>
            <Typography variant="h4" gutterBottom>
              Wallet Connection Required
            </Typography>
            <Typography variant="body1" color="text.secondary">
              This action requires cryptographic signature. Connect your wallet to proceed.
            </Typography>
          </Box>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AccountBalanceWalletIcon />}
            onClick={() => setVisible(true)}
            size="large"
            sx={{ mt: 2 }}
          >
            Connect Wallet
          </Button>
        </Box>
      </Container>
    );
  }

  return <>{children}</>;
}
