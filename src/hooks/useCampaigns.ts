import useSWR from "swr";
import { Campaign } from "@/types/campaign";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useCampaigns() {
  const { data, error, isLoading, mutate } = useSWR("/api/campaigns", fetcher);

  return {
    campaigns: (data?.campaigns as Campaign[]) || [],
    isLoading,
    isError: error,
    mutate,
  };
}
