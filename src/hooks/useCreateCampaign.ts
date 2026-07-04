import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { connection } from "@/lib/solana";
import { getProgram, PROGRAM_ID } from "@/lib/program";
import { PublicKey } from "@solana/web3.js";
import { BN } from "@coral-xyz/anchor";

export interface MilestoneInput {
  title: string;
  targetAmountSol: number;
}

export type CreateCampaignStatus =
  | "idle"
  | "creating_campaign"
  | "creating_milestones"
  | "success"
  | "error";

export function useCreateCampaign() {
  const wallet = useWallet();
  const [status, setStatus] = useState<CreateCampaignStatus>("idle");
  const [currentMilestone, setCurrentMilestone] = useState<number>(0);
  const [totalMilestones, setTotalMilestones] = useState<number>(0);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [campaignPda, setCampaignPda] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const createCampaign = async (
    title: string,
    description: string,
    imageUri: string,
    category: string,
    targetAmountSol: number,
    deadlineUnix: number,
    milestones: MilestoneInput[]
  ): Promise<string> => {
    if (!wallet.publicKey || !wallet.signTransaction) {
      throw new Error("Wallet not connected");
    }

    setStatus("creating_campaign");
    setError(null);
    setTxHash(null);
    setCampaignPda(null);
    setCurrentMilestone(0);
    setTotalMilestones(milestones.length);

    try {
      const creatorPubkey = wallet.publicKey;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const program = getProgram(connection, wallet as any);

      // Convert target amount to lamports
      const targetAmountLamports = new BN(Math.round(targetAmountSol * 1_000_000_000));

      // Derive Campaign PDA: seeds = [b"campaign", creator, title]
      const [campaignPdaKey] = PublicKey.findProgramAddressSync(
        [
          Buffer.from("campaign"),
          creatorPubkey.toBuffer(),
          Buffer.from(title),
        ],
        PROGRAM_ID
      );

      // 1. Create Campaign
      const campaignSignature = await program.methods
        .createCampaign(
          title,
          description,
          imageUri,
          category,
          targetAmountLamports,
          new BN(deadlineUnix),
          milestones.length
        )
        .accounts({
          creator: creatorPubkey,
          campaign: campaignPdaKey,
        })
        .rpc();

      // Confirm campaign creation
      const latestBlockhash = await connection.getLatestBlockhash();
      await connection.confirmTransaction(
        {
          signature: campaignSignature,
          ...latestBlockhash,
        },
        "confirmed"
      );

      setTxHash(campaignSignature);
      setCampaignPda(campaignPdaKey.toBase58());
      setStatus("creating_milestones");

      // 2. Create Milestones sequentially
      for (let i = 0; i < milestones.length; i++) {
        setCurrentMilestone(i + 1);
        const milestone = milestones[i];
        const milestoneTargetLamports = new BN(Math.round(milestone.targetAmountSol * 1_000_000_000));

        // Derive Milestone PDA: seeds = [b"milestone", campaign, index]
        const [milestonePdaKey] = PublicKey.findProgramAddressSync(
          [
            Buffer.from("milestone"),
            campaignPdaKey.toBuffer(),
            Buffer.from([i]),
          ],
          PROGRAM_ID
        );

        const milestoneSignature = await program.methods
          .createMilestone(i, milestone.title, milestoneTargetLamports)
          .accounts({
            creator: creatorPubkey,
            campaign: campaignPdaKey,
            milestone: milestonePdaKey,
          })
          .rpc();

        // Confirm milestone creation
        const blockhash = await connection.getLatestBlockhash();
        await connection.confirmTransaction(
          {
            signature: milestoneSignature,
            ...blockhash,
          },
          "confirmed"
        );
      }

      setStatus("success");
      return campaignPdaKey.toBase58();
    } catch (err: unknown) {
      console.error("Campaign creation failed:", err);
      const errorMsg = err instanceof Error ? err.message : "Transaction failed";
      setError(errorMsg);
      setStatus("error");
      throw err;
    }
  };

  return {
    createCampaign,
    status,
    currentMilestone,
    totalMilestones,
    txHash,
    campaignPda,
    error,
    clearState: () => {
      setStatus("idle");
      setCurrentMilestone(0);
      setTotalMilestones(0);
      setTxHash(null);
      setCampaignPda(null);
      setError(null);
    },
  };
}
