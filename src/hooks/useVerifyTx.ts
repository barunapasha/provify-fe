import { connection } from "@/lib/solana";
import { PROGRAM_ID } from "@/lib/program";
import { PublicKey } from "@solana/web3.js";
import { BorshInstructionCoder, BorshAccountsCoder, utils } from "@coral-xyz/anchor";
import { IDL } from "@/idl/provify_contract";
import useSWR from "swr";

const instructionCoder = new BorshInstructionCoder(IDL as never);
const accountsCoder = new BorshAccountsCoder(IDL as never);

export interface ProvifyTxResult {
  signature: string;
  type: "create_campaign" | "create_milestone" | "donate" | "submit_proof" | "request_disbursement" | "close_campaign";
  slot: number;
  timestamp: number;
  fee: number;
  raw: unknown;

  creator?: string;
  donor?: string;
  campaign?: string;
  amount?: string;
  title?: string;
  description?: string;
  imageUri?: string;
  category?: string;
  milestoneCount?: number;
  deadline?: string;
  milestone?: string;
  milestoneIndex?: number;
  milestoneTitle?: string;
  proofUri?: string;
}

function getHumanType(anchorName: string): ProvifyTxResult["type"] {
  const mapping: Record<string, ProvifyTxResult["type"]> = {
    createCampaign: "create_campaign",
    createMilestone: "create_milestone",
    donate: "donate",
    submitProof: "submit_proof",
    requestDisbursement: "request_disbursement",
    closeCampaign: "close_campaign",
  };
  return mapping[anchorName] || (anchorName as ProvifyTxResult["type"]);
}

function deriveMilestoneIndex(campaignPubkeyStr: string, milestonePubkeyStr: string): number {
  const campaignKey = new PublicKey(campaignPubkeyStr);
  const milestoneKey = new PublicKey(milestonePubkeyStr);
  for (let i = 0; i < 10; i++) {
    const [pda] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("milestone"),
        campaignKey.toBuffer(),
        Buffer.from([i]),
      ],
      PROGRAM_ID
    );
    if (pda.equals(milestoneKey)) {
      return i;
    }
  }
  return -1;
}

async function verifyTransaction(txSignature: string): Promise<ProvifyTxResult | null> {
  if (!txSignature) return null;

  const tx = await connection.getParsedTransaction(txSignature, {
    maxSupportedTransactionVersion: 0,
    commitment: "confirmed",
  });

  if (!tx) {
    throw new Error("Transaction not found");
  }

  const programIdStr = PROGRAM_ID.toBase58();
  const ix = tx.transaction.message.instructions.find(
    (instruction) => instruction.programId.toBase58() === programIdStr
  );

  if (!ix) {
    throw new Error("Not a Provify transaction");
  }

  if (!("data" in ix) || !("accounts" in ix)) {
    throw new Error("Transaction instructions are not partially decoded");
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let decoded: any;
  try {
    const decodedBuffer = Buffer.from(utils.bytes.bs58.decode(ix.data));
    decoded = instructionCoder.decode(decodedBuffer);
  } catch (err) {
    console.error("Failed to decode instruction data:", err);
    throw new Error("Failed to decode Provify instruction data");
  }

  if (!decoded) {
    throw new Error("Could not parse instruction data");
  }

  const type = decoded.name;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const accounts = ix.accounts.map((acc: any) => acc.toBase58 ? acc.toBase58() : acc.toString());

  const result: ProvifyTxResult = {
    signature: txSignature,
    type: getHumanType(type),
    slot: tx.slot,
    timestamp: tx.blockTime || 0,
    fee: tx.meta?.fee || 0,
    raw: tx,
  };

  if (type === "createCampaign") {
    result.creator = accounts[0];
    result.campaign = accounts[1];
    result.title = decoded.data.title;
    result.description = decoded.data.description;
    result.imageUri = decoded.data.imageUri;
    result.category = decoded.data.category;
    result.amount = decoded.data.targetAmount.toString();
    result.deadline = decoded.data.deadline.toString();
    result.milestoneCount = decoded.data.milestoneCount;
  } else if (type === "createMilestone") {
    result.creator = accounts[0];
    result.campaign = accounts[1];
    result.milestone = accounts[2];
    result.milestoneIndex = decoded.data.index;
    result.title = decoded.data.title;
    result.amount = decoded.data.targetAmount.toString();
  } else if (type === "donate") {
    result.donor = accounts[0];
    result.campaign = accounts[1];
    result.amount = decoded.data.amount.toString();
  } else if (type === "submitProof") {
    result.creator = accounts[0];
    result.campaign = accounts[1];
    const milestonePubkeyStr = accounts[2];
    result.proofUri = decoded.data.proofUri;
    result.milestoneIndex = deriveMilestoneIndex(accounts[1], milestonePubkeyStr);

    try {
      const mInfo = await connection.getAccountInfo(new PublicKey(milestonePubkeyStr));
      if (mInfo) {
        const mData = accountsCoder.decode("Milestone", mInfo.data);
        if (mData) {
          result.milestoneTitle = mData.title;
        }
      }
    } catch (e) {
      console.warn("Could not fetch milestone title:", e);
    }
  } else if (type === "requestDisbursement") {
    result.creator = accounts[0];
    result.campaign = accounts[1];
    const milestonePubkeyStr = accounts[2];
    result.milestoneIndex = deriveMilestoneIndex(accounts[1], milestonePubkeyStr);

    let amountLamports = "0";
    try {
      const mInfo = await connection.getAccountInfo(new PublicKey(milestonePubkeyStr));
      if (mInfo) {
        const mData = accountsCoder.decode("Milestone", mInfo.data);
        if (mData) {
          result.milestoneTitle = mData.title;
          amountLamports = mData.targetAmount.toString();
        }
      }
    } catch (e) {
      console.warn("Milestone account not found or closed:", e);
    }

    if (amountLamports === "0" && tx.meta) {
      const creatorAddress = accounts[0];
      const accountKeys = tx.transaction.message.accountKeys.map((k) =>
        typeof k === "string" ? k : k.pubkey.toBase58()
      );
      const creatorIdx = accountKeys.indexOf(creatorAddress);
      if (creatorIdx !== -1) {
        const preBalance = tx.meta.preBalances[creatorIdx];
        const postBalance = tx.meta.postBalances[creatorIdx];
        let diff = postBalance - preBalance;
        if (creatorIdx === 0) {
          diff += tx.meta.fee;
        }
        amountLamports = diff.toString();
      }
    }
    result.amount = amountLamports;
  } else if (type === "closeCampaign") {
    result.creator = accounts[0];
    result.campaign = accounts[1];
  }

  return result;
}

export function useVerifyTx(txSignature: string | null) {
  const { data, error, isLoading } = useSWR(
    txSignature ? `verify-tx-${txSignature}` : null,
    () => verifyTransaction(txSignature as string),
    {
      shouldRetryOnError: false,
      revalidateOnFocus: false,
    }
  );

  return {
    data: data || null,
    isLoading,
    error: error instanceof Error ? error.message : error ? String(error) : null,
  };
}
