import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { connection } from "@/lib/solana";
import { getProgram, PROGRAM_ID } from "@/lib/program";
import { PublicKey, SystemProgram } from "@solana/web3.js";

export function useManageCampaign() {
  const wallet = useWallet();
  const [isLoading, setIsLoading] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const checkWallet = () => {
    if (!wallet.publicKey || !wallet.signTransaction) {
      throw new Error("Wallet not connected");
    }
    return wallet.publicKey;
  };

  const submitProof = async (
    campaignId: string,
    milestoneIndex: number,
    proofUri: string
  ): Promise<string> => {
    const creatorPubkey = checkWallet();
    setIsLoading(true);
    setError(null);
    setTxHash(null);

    try {
      const campaignPubkey = new PublicKey(campaignId);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const program = getProgram(connection, wallet as any);

      // Derive Milestone PDA: seeds = [b"milestone", campaign, index]
      const [milestonePda] = PublicKey.findProgramAddressSync(
        [
          Buffer.from("milestone"),
          campaignPubkey.toBuffer(),
          Buffer.from([milestoneIndex]),
        ],
        PROGRAM_ID
      );

      const signature = await program.methods
        .submitProof(proofUri)
        .accounts({
          creator: creatorPubkey,
          campaign: campaignPubkey,
          milestone: milestonePda,
        })
        .rpc();

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
      console.error("Submit proof failed:", err);
      const errorMsg = err instanceof Error ? err.message : "Submit proof failed";
      setError(errorMsg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const requestDisbursement = async (
    campaignId: string,
    milestoneIndex: number,
    milestoneCount: number
  ): Promise<string> => {
    const creatorPubkey = checkWallet();
    setIsLoading(true);
    setError(null);
    setTxHash(null);

    try {
      const campaignPubkey = new PublicKey(campaignId);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const program = getProgram(connection, wallet as any);

      // Derive target Milestone PDA
      const [milestonePda] = PublicKey.findProgramAddressSync(
        [
          Buffer.from("milestone"),
          campaignPubkey.toBuffer(),
          Buffer.from([milestoneIndex]),
        ],
        PROGRAM_ID
      );

      // Derive all other milestone PDAs to pass as remaining accounts
      const remainingAccounts = [];
      for (let i = 0; i < milestoneCount; i++) {
        if (i !== milestoneIndex) {
          const [otherMilestonePda] = PublicKey.findProgramAddressSync(
            [
              Buffer.from("milestone"),
              campaignPubkey.toBuffer(),
              Buffer.from([i]),
            ],
            PROGRAM_ID
          );
          remainingAccounts.push({
            pubkey: otherMilestonePda,
            isWritable: false,
            isSigner: false,
          });
        }
      }

      const signature = await program.methods
        .requestDisbursement()
        .accounts({
          creator: creatorPubkey,
          campaign: campaignPubkey,
          milestone: milestonePda,
          systemProgram: SystemProgram.programId,
        })
        .remainingAccounts(remainingAccounts)
        .rpc();

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
      console.error("Disbursement request failed:", err);
      const errorMsg = err instanceof Error ? err.message : "Disbursement request failed";
      setError(errorMsg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const closeCampaign = async (campaignId: string): Promise<string> => {
    const creatorPubkey = checkWallet();
    setIsLoading(true);
    setError(null);
    setTxHash(null);

    try {
      const campaignPubkey = new PublicKey(campaignId);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const program = getProgram(connection, wallet as any);

      const signature = await program.methods
        .closeCampaign()
        .accounts({
          creator: creatorPubkey,
          campaign: campaignPubkey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

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
      console.error("Close campaign failed:", err);
      const errorMsg = err instanceof Error ? err.message : "Close campaign failed";
      setError(errorMsg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    submitProof,
    requestDisbursement,
    closeCampaign,
    isLoading,
    txHash,
    error,
    clearState: () => {
      setError(null);
      setTxHash(null);
    },
  };
}
