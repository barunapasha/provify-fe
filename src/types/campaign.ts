export type CampaignStatus =
  | { active: Record<string, never> }
  | { completed: Record<string, never> }
  | { closed: Record<string, never> };
export type MilestoneStatus =
  | { pending: Record<string, never> }
  | { proofSubmitted: Record<string, never> }
  | { released: Record<string, never> };

export interface Campaign {
  pubkey: string;
  creator: string;
  title: string;
  description: string;
  imageUri: string;
  category: string;
  targetAmount: string;
  currentAmount: string;
  deadline: string;
  milestoneCount: number;
  donationCount: string;
  status: CampaignStatus;
  bump: number;
  milestones?: Milestone[];
}

export interface Milestone {
  pubkey: string;
  campaign: string;
  index: number;
  title: string;
  targetAmount: string;
  releasedAmount: string;
  proofUri: string;
  status: MilestoneStatus;
  bump: number;
}

export interface Donation {
  pubkey: string;
  campaign: string;
  donor: string;
  amount: string;
  timestamp: string;
  bump: number;
}

export interface DonationWithCampaign extends Donation {
  campaignTitle: string;
}

/**
 * Effective campaign status for display:
 * an Active campaign whose deadline passed or whose target was reached
 * is treated as done, even if the on-chain state hasn't been updated yet
 * (the contract evaluates lazily).
 */
export function effectiveCampaignStatus(
  campaign: Pick<
    Campaign,
    "status" | "deadline" | "targetAmount" | "currentAmount"
  >,
): "Active" | "Completed" | "Closed" {
  if ("Active" in campaign.status) {
    const nowSec = Math.floor(Date.now() / 1000);
    if (nowSec >= parseInt(campaign.deadline)) return "Closed";
    if (BigInt(campaign.currentAmount) >= BigInt(campaign.targetAmount))
      return "Completed";
  }
  return "Active" in campaign.status
    ? "Active"
    : "Completed" in campaign.status
      ? "Completed"
      : "Closed";
}

export function isCampaignDonatable(
  campaign: Pick<
    Campaign,
    "status" | "deadline" | "targetAmount" | "currentAmount"
  >,
): boolean {
  return effectiveCampaignStatus(campaign) === "Active";
}
