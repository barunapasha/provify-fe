"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { Button } from "@mui/material";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";

/**
 * Truncate a Solana public key for display.
 * e.g. "7px9KgeA...Due7W"
 */
function truncateAddress(address: string): string {
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
}

export default function ConnectButton() {
  const { publicKey, connected, disconnect } = useWallet();
  const { setVisible } = useWalletModal();

  if (connected && publicKey) {
    return (
      <Button
        variant="outlined"
        color="primary"
        startIcon={<AccountBalanceWalletIcon />}
        onClick={disconnect}
        sx={{
          borderRadius: 2,
          textTransform: "none",
          fontWeight: 600,
          fontFamily: "monospace",
        }}
      >
        {truncateAddress(publicKey.toBase58())}
      </Button>
    );
  }

  return (
    <Button
      variant="contained"
      color="primary"
      startIcon={<AccountBalanceWalletIcon />}
      onClick={() => setVisible(true)}
      sx={{
        borderRadius: 2,
        textTransform: "none",
        fontWeight: 600,
      }}
    >
      Connect Wallet
    </Button>
  );
}
