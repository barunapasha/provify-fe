import { createHash } from "crypto";
import { NextResponse } from "next/server";
import { connection } from "@/lib/solana";
import { PublicKey } from "@solana/web3.js";
import { BorshAccountsCoder } from "@coral-xyz/anchor";
import { IDL } from "@/idl/provify_contract";
import { bs58 } from "@coral-xyz/anchor/dist/cjs/utils/bytes";

const PROGRAM_ID = new PublicKey(
  process.env.NEXT_PUBLIC_PROGRAM_ID ??
    "7px9KgeAgyrx8juwhcHfhzRc6fbkMT1gdMUtQpaDue7W",
);

const coder = new BorshAccountsCoder(IDL as never);

// Anchor account discriminator = first 8 bytes of sha256("account:<Name>")
function getAccountDiscriminator(accountName: string): Uint8Array {
  return createHash("sha256")
    .update(`account:${accountName}`)
    .digest()
    .subarray(0, 8);
}

// Derived from the account name in the IDL, so it stays correct if the
// struct is renamed or the IDL changes.
const CAMPAIGN_DISCRIMINATOR = getAccountDiscriminator("Campaign");

export async function GET() {
  try {
    const accounts = await connection.getProgramAccounts(PROGRAM_ID, {
      filters: [
        {
          memcmp: {
            offset: 0,
            // RPC expects the discriminator as a base58 string
            bytes: bs58.encode(CAMPAIGN_DISCRIMINATOR),
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
      { status: 500 },
    );
  }
}
