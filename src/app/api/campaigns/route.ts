import { NextResponse } from "next/server";
import { connection } from "@/lib/solana";
import { PublicKey } from "@solana/web3.js";
import { BorshAccountsCoder } from "@coral-xyz/anchor";
import { IDL } from "@/idl/provify_contract";

const PROGRAM_ID = new PublicKey(
  process.env.NEXT_PUBLIC_PROGRAM_ID ?? "7px9KgeAgyrx8juwhcHfhzRc6fbkMT1gdMUtQpaDue7W"
);

const coder = new BorshAccountsCoder(IDL as never);

// Campaign account 8-byte discriminator (from IDL), pre-encoded to base58.
// Filters RPC to return only Campaign accounts, skipping Milestone/Donation
// accounts so decoding never throws "Invalid account discriminator".
// (Discriminator bytes [50,40,49,11,157,220,229,192] -> base58 "9PayLifPYdD")
const CAMPAIGN_DISCRIMINATOR = "9PayLifPYdD";

export async function GET() {
  try {
    const accounts = await connection.getProgramAccounts(PROGRAM_ID, {
      filters: [
        {
          memcmp: {
            offset: 0,
            bytes: CAMPAIGN_DISCRIMINATOR,
          },
        },
      ],
    });

    const campaigns = accounts
      .map((account) => {
        try {
          const campaignData = coder.decode("Campaign", account.account.data);
          if (!campaignData) return null;
          return {
            pubkey: account.pubkey.toBase58(),
            creator: campaignData.creator.toBase58(),
            title: campaignData.title,
            description: campaignData.description,
            imageUri: campaignData.image_uri,
            category: campaignData.category,
            targetAmount: campaignData.target_amount.toString(),
            currentAmount: campaignData.current_amount.toString(),
            deadline: campaignData.deadline.toString(),
            milestoneCount: campaignData.milestone_count,
            donationCount: campaignData.donation_count.toString(),
            status: campaignData.status,
            bump: campaignData.bump,
          };
        } catch (err) {
          console.error("Failed to deserialize campaign:", err);
          return null;
        }
      })
      .filter(Boolean);

    return NextResponse.json({ campaigns });
  } catch (error) {
    console.error("Error fetching campaigns:", error);
    return NextResponse.json(
      { error: "Failed to fetch campaigns" },
      { status: 500 }
    );
  }
}
