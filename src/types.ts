export type MemberRank = 'The Board' | 'Architects' | 'Members';

export type UserStatus = 'online' | 'in-deal-room' | 'idle' | 'offline';

export interface User {
  id: string;
  name: string;
  handle: string;
  avatarBg: string;
  initials: string;
  rank: MemberRank;
  roleTitle: string;
  status: UserStatus;
  weeklyRevenue: number;
  totalVolume: number;
  passId: string;
  tier: 'Sovereign Black Card' | 'Platinum Architect' | 'Gold Founder';
  dealsClosed: number;
  location: string;
  bio: string;
  verifiedAudit: boolean;
  streakWeeks?: number;
  walletAddress?: string;
}

export interface Channel {
  id: string;
  name: string;
  symbol: string;
  description: string;
  category: 'Syndicate Core' | 'Alpha & Intelligence' | 'High-Ticket War Room';
  unreadCount?: number;
  isRestricted?: boolean;
}

export interface Attachment {
  type: 'metric' | 'deal-note' | 'brief';
  title: string;
  subtitle?: string;
  metricValue?: string;
  metricLabel?: string;
  metricChange?: string;
  tag?: string;
}

export interface Message {
  id: string;
  channelId: string;
  author: User;
  title?: string;
  content: string;
  timestamp: string;
  boosts: number;
  hasBoosted?: boolean;
  isPinned?: boolean;
  repliesCount?: number;
  attachment?: Attachment;
}

export interface LeaderboardEntry {
  rank: number;
  user: User;
  weeklyRevenue: number;
  previousRank: number;
  growthDelta: number;
  dealsClosed: number;
  niche: 'AI & Automation' | 'Creator Commerce' | 'Private Equity' | 'SaaS & Enterprise';
  streakWeeks: number;
  statusText: string;
  auditBadge: 'Verified On-Chain' | 'Audited Escrow' | 'Accredited Partner';
  historyChart?: number[];
  aiTokensMetric?: string;
}

export interface EscrowTransaction {
  id: string;
  timestamp: string;
  amount: number;
  sender: string;
  recipient: string;
  dealType: 'Secondary Tranche' | 'OTC Buyout' | 'Cohort Retainer' | 'AI Cluster Allocation';
  txHash: string;
  nodeLocation: string;
  status: 'Settled' | 'Confirming';
}

export interface SyndicateNotification {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
  type: 'deal' | 'rank' | 'boost' | 'escrow';
}

export interface OTCDeal {
  id: string;
  title: string;
  targetCompany: string;
  totalAllocation: number;
  minTicket: number;
  filledAmount: number;
  expectedYield: string;
  leadSponsor: User;
  termMonths: number;
  status: 'Open' | 'Oversubscribed' | 'Settled';
  niche: string;
}
