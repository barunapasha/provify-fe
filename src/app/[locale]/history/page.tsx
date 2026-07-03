"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import {
  Box,
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Skeleton,
} from "@mui/material";
import Link from "next/link";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { useWalletDonations } from "@/hooks/useWalletDonations";
import { useTranslations } from "next-intl";
import WalletGuard from "@/components/wallet/WalletGuard";
import TxBadge from "@/components/ui/TxBadge";
import EmptyState from "@/components/ui/EmptyState";

export default function HistoryPage() {
  return (
    <WalletGuard>
      <HistoryContent />
    </WalletGuard>
  );
}

function HistoryContent() {
  const t = useTranslations("history");
  const { publicKey } = useWallet();
  const { donations, isLoading } = useWalletDonations(publicKey?.toBase58() ?? null);

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      {/* Header */}
      <Box sx={{ mb: 5 }}>
        <Typography variant="h2" sx={{ fontSize: "2.4rem", mb: 1 }}>
          {t("title")}
        </Typography>
        {publicKey && (
          <Typography variant="body2" color="text.secondary" sx={{ fontFamily: "monospace" }}>
            {publicKey.toBase58().slice(0, 8)}...{publicKey.toBase58().slice(-8)}
          </Typography>
        )}
      </Box>

      {/* Table or empty state */}
      {isLoading ? (
        <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 2 }} />
      ) : donations.length === 0 ? (
        <EmptyState
          title={t("emptyTitle")}
          description={t("emptyDesc")}
          actionLabel={t("emptyAction")}
          actionPath="/campaigns"
        />
      ) : (
        <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2, borderColor: "divider" }}>
          <Table>
            <TableHead sx={{ backgroundColor: "#F9FAFC" }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>{t("campaignCol")}</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="right">
                  {t("amountCol")}
                </TableCell>
                <TableCell sx={{ fontWeight: 700 }}>{t("dateCol")}</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>{t("txCol")}</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="right">
                  {t("actionCol")}
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {donations.map((d) => {
                const amount = parseFloat(d.amount) / LAMPORTS_PER_SOL;
                const date = new Date(parseInt(d.timestamp) * 1000).toLocaleDateString();
                return (
                  <TableRow key={d.pubkey} hover>
                    <TableCell sx={{ fontWeight: 600 }}>{d.campaignTitle}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>
                      {amount.toLocaleString()} SOL
                    </TableCell>
                    <TableCell color="text.secondary">{date}</TableCell>
                    <TableCell>
                      <TxBadge txHash={d.pubkey} />
                    </TableCell>
                    <TableCell align="right">
                      <Link href={`/campaigns/${d.campaign}`} passHref>
                        <IconButton size="small" color="primary">
                          <ArrowForwardIcon fontSize="small" />
                        </IconButton>
                      </Link>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Container>
  );
}
