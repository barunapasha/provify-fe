import { useCampaigns } from "./useCampaigns";

export function useCreatorCampaigns(creatorAddress: string | null) {
  const { campaigns, isLoading, isError, mutate } = useCampaigns();

  const creatorCampaigns = creatorAddress
    ? campaigns.filter((c) => c.creator === creatorAddress)
    : [];

  return {
    campaigns: creatorCampaigns,
    isLoading,
    isError,
    mutate,
  };
}
