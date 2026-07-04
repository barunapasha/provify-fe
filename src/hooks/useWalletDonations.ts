import useSWR from "swr";
import { connection } from "@/lib/solana";
import { PROGRAM_ID } from "@/lib/program";
import { PublicKey } from "@solana/web3.js";
import { BorshAccountsCoder } from "@coral-xyz/anchor";
import { IDL } from "@/idl/provify_contract";
import { DonationWithCampaign } from "@/types/campaign";

const coder = new BorshAccountsCoder(IDL as never);

// Layout Donation account (after 8-byte discriminator):
//   campaign (Pubkey, 32 bytes) -> offset 8
//   donor    (Pubkey, 32 bytes) -> offset 40
//   amount   (u64, 8 bytes)      -> offset 72
//   timestamp(i64, 8 bytes)      -> offset 80
//   bump     (u8, 1 byte)        -> offset 88
// Total size: 89 bytes
const DONOR_OFFSET = 40;
const DONATION_ACCOUNT_SIZE = 89;

async function fetchWalletDonations(
  walletAddress: string
): Promise<DonationWithCampaign[]> {
  if (!walletAddress) return [];

  const donorPubkey = new PublicKey(walletAddress);

  const accounts = await connection.getProgramAccounts(PROGRAM_ID, {
    filters: [
      { dataSize: DONATION_ACCOUNT_SIZE },
      {
        memcmp: {
          offset: DONOR_OFFSET,
          bytes: donorPubkey.toBase58(),
        },
      },
    ],
  });

  const decoded = accounts
    .map((account) => {
      try {
        const d = coder.decode("Donation", account.account.data);
        if (!d) return null;
        return {
          pubkey: account.pubkey.toBase58(),
          campaign: d.campaign.toBase58(),
          donor: d.donor.toBase58(),
          amount: d.amount.toString(),
          timestamp: d.timestamp.toString(),
          bump: d.bump,
        } as DonationWithCampaign;
      } catch (err) {
        console.error("Failed to decode donation account:", err);
        return null;
      }
    })
    .filter((d): d is DonationWithCampaign => d !== null)
    .sort((a, b) => parseInt(b.timestamp) - parseInt(a.timestamp));

  // Batch fetch campaign titles for each unique campaign
  const uniqueCampaigns = Array.from(new Set(decoded.map((d) => d.campaign)));
  const campaignPubkeys = uniqueCampaigns.map((c) => new PublicKey(c));

  const titleMap: Record<string, string> = {};
  if (campaignPubkeys.length > 0) {
    const infos = await connection.getMultipleAccountsInfo(campaignPubkeys);
    uniqueCampaigns.forEach((pubkeyStr, idx) => {
      const info = infos[idx];
      if (!info) return;
      try {
        const cData = coder.decode("Campaign", info.data);
        if (cData) {
          titleMap[pubkeyStr] = cData.title;
        }
      } catch (err) {
        console.error("Failed to decode campaign for history:", err);
      }
    });
  }

  return decoded.map((d) => ({
    ...d,
    campaignTitle: titleMap[d.campaign] || "Unknown Campaign",
  }));
}

export function useWalletDonations(walletAddress: string | null) {
  const { data, error, isLoading, mutate } = useSWR(
    walletAddress ? `wallet-donations-${walletAddress}` : null,
    () => fetchWalletDonations(walletAddress as string)
  );

  return {
    donations: data || [],
    isLoading,
    isError: error,
    mutate,
  };
}
