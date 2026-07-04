import useSWR from "swr";
import { connection } from "@/lib/solana";
import { PROGRAM_ID } from "@/lib/program";
import { PublicKey } from "@solana/web3.js";
import { BorshAccountsCoder } from "@coral-xyz/anchor";
import { IDL } from "@/idl/provify_contract";
import { Donation } from "@/types/campaign";

const coder = new BorshAccountsCoder(IDL as never);

async function fetchDonations(campaignId: string) {
  if (!campaignId) return [];

  const campaignPubkey = new PublicKey(campaignId);

  const accounts = await connection.getProgramAccounts(PROGRAM_ID, {
    filters: [
      {
        memcmp: {
          offset: 8, // after discriminator
          bytes: campaignPubkey.toBase58(),
        },
      },
    ],
  });

  return accounts
    .map((account) => {
      try {
        const donationData = coder.decode("Donation", account.account.data);
        if (!donationData) return null;
        return {
          pubkey: account.pubkey.toBase58(),
          campaign: donationData.campaign.toBase58(),
          donor: donationData.donor.toBase58(),
          amount: donationData.amount.toString(),
          timestamp: donationData.timestamp.toString(),
          bump: donationData.bump,
        } as Donation;
      } catch (err) {
        console.error("Failed to decode donation account:", err);
        return null;
      }
    })
    .filter((d): d is Donation => d !== null)
    .sort((a, b) => parseInt(b.timestamp) - parseInt(a.timestamp));
}

export function useDonations(campaignId: string) {
  const { data, error, isLoading, mutate } = useSWR(
    campaignId ? `donations-${campaignId}` : null,
    () => fetchDonations(campaignId)
  );

  return {
    donations: data || [],
    isLoading,
    isError: error,
    mutate,
  };
}
