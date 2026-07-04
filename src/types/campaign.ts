export type CampaignStatus = { active: Record<string, never> } | { completed: Record<string, never> } | { closed: Record<string, never> };
export type MilestoneStatus = { pending: Record<string, never> } | { proofSubmitted: Record<string, never> } | { released: Record<string, never> };

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
