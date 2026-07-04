import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { connection } from "@/lib/solana";
import { getProgram, PROGRAM_ID } from "@/lib/program";
import { PublicKey } from "@solana/web3.js";
import { BN } from "@coral-xyz/anchor";

export function useDonate(campaignId: string, currentDonationCount: string) {
  const wallet = useWallet();
  const [isLoading, setIsLoading] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const donate = async (amountSol: number) => {
    if (!wallet.publicKey || !wallet.signTransaction) {
      throw new Error("Wallet not connected");
    }

    setIsLoading(true);
    setError(null);
    setTxHash(null);

    try {
      const campaignPubkey = new PublicKey(campaignId);
      const donorPubkey = wallet.publicKey;

      // Convert amount to lamports (as a BN)
      // Round to prevent floating point conversion issues
      const amountLamports = new BN(Math.round(amountSol * 1_000_000_000));

      // Derive donation PDA: ["donation", campaign, donor, count]
      const countBN = new BN(currentDonationCount);
      const countBuffer = countBN.toArrayLike(Buffer, "le", 8);
      const donationSeed = Buffer.from("donation");

      const [donationPda] = PublicKey.findProgramAddressSync(
        [
          donationSeed,
          campaignPubkey.toBuffer(),
          donorPubkey.toBuffer(),
          countBuffer,
        ],
        PROGRAM_ID
      );

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const program = getProgram(connection, wallet as any);

      const signature = await program.methods
        .donate(amountLamports)
        .accounts({
          donor: donorPubkey,
          campaign: campaignPubkey,
          donation: donationPda,
        })
        .rpc();

      // Wait for confirmation
      const latestBlockhash = await connection.getLatestBlockhash();
      await connection.confirmTransaction(
        {
          signature,
          ...latestBlockhash,
        },
        "confirmed"
      );

      setTxHash(signature);
      return signature;
    } catch (err: unknown) {
      console.error("Donation failed:", err);
      const errorMsg = err instanceof Error ? err.message : "Transaction failed";
      setError(errorMsg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    donate,
    isLoading,
    txHash,
    error,
    clearState: () => {
      setTxHash(null);
      setError(null);
    },
  };
}
