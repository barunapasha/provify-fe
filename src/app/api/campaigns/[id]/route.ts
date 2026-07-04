import { NextRequest, NextResponse } from "next/server";
import { connection } from "@/lib/solana";
import { PublicKey } from "@solana/web3.js";
import { BorshAccountsCoder } from "@coral-xyz/anchor";
import { IDL } from "@/idl/provify_contract";

const PROGRAM_ID = new PublicKey(
  process.env.NEXT_PUBLIC_PROGRAM_ID ?? "7px9KgeAgyrx8juwhcHfhzRc6fbkMT1gdMUtQpaDue7W"
);

const coder = new BorshAccountsCoder(IDL as never);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    let campaignPubkey: PublicKey;
    try {
      campaignPubkey = new PublicKey(id);
    } catch {
      return NextResponse.json(
        { error: "Invalid campaign public key" },
        { status: 400 }
      );
    }

    const accountInfo = await connection.getAccountInfo(campaignPubkey);

    if (!accountInfo) {
      return NextResponse.json(
        { error: "Campaign not found" },
        { status: 404 }
      );
    }

    let campaignData;
    try {
      campaignData = coder.decode("Campaign", accountInfo.data);
    } catch (err) {
      console.error("Failed to deserialize campaign:", err);
      return NextResponse.json(
        { error: "Failed to deserialize campaign data" },
        { status: 500 }
      );
    }

    if (!campaignData) {
      return NextResponse.json(
        { error: "Failed to deserialize campaign data" },
        { status: 500 }
      );
    }

    const milestoneCount = campaignData.milestoneCount;
    const milestonePdas: PublicKey[] = [];
    for (let i = 0; i < milestoneCount; i++) {
      const [pda] = PublicKey.findProgramAddressSync(
        [
          Buffer.from("milestone"),
          campaignPubkey.toBuffer(),
          Buffer.from([i]),
        ],
        PROGRAM_ID
      );
      milestonePdas.push(pda);
    }

    const milestoneInfos = await connection.getMultipleAccountsInfo(milestonePdas);
    const milestones = milestoneInfos
      .map((info, idx) => {
        if (!info) return null;
        try {
          const mData = coder.decode("Milestone", info.data);
          if (!mData) return null;
          return {
            pubkey: milestonePdas[idx].toBase58(),
            campaign: mData.campaign.toBase58(),
            index: mData.index,
            title: mData.title,
            targetAmount: mData.targetAmount.toString(),
            releasedAmount: mData.releasedAmount.toString(),
            proofUri: mData.proofUri,
            status: mData.status,
            bump: mData.bump,
          };
        } catch (err) {
          console.error(`Failed to deserialize milestone at index ${idx}:`, err);
          return null;
        }
      })
      .filter(Boolean);

    const campaign = {
      pubkey: campaignPubkey.toBase58(),
      creator: campaignData.creator.toBase58(),
      title: campaignData.title,
      description: campaignData.description,
      imageUri: campaignData.imageUri,
      category: campaignData.category,
      targetAmount: campaignData.targetAmount.toString(),
      currentAmount: campaignData.currentAmount.toString(),
      deadline: campaignData.deadline.toString(),
      milestoneCount: campaignData.milestoneCount,
      donationCount: campaignData.donationCount.toString(),
      status: campaignData.status,
      bump: campaignData.bump,
      milestones,
    };

    return NextResponse.json({ campaign });
  } catch (error) {
    console.error("Error fetching campaign:", error);
    return NextResponse.json(
      { error: "Failed to fetch campaign" },
      { status: 500 }
    );
  }
}
