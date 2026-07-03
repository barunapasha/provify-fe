import useSWR from "swr";
import { Campaign } from "@/types/campaign";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useCampaign(id: string) {
  const { data, error, isLoading, mutate } = useSWR(
    id ? `/api/campaigns/${id}` : null,
    fetcher
  );

  return {
    campaign: (data?.campaign as Campaign) || null,
    isLoading,
    isError: error,
    mutate,
  };
}
