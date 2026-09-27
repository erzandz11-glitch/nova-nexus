export type NovaEnvironment = 'platform' | 'mind' | 'producer' | 'artlabs' | 'community';

export type CommandGroup = 'Resume' | 'Quick Actions' | 'Navigate' | 'Faculties & Courses' | 'Tools & Studios' | 'Market & Assets' | 'Syndicate & Alpha';

export interface NovaCommand {
  id: string;
  label: string;
  subtitle?: string;
  group: CommandGroup;
  environment: NovaEnvironment;
  shortcut?: string;
  iconName?: string;
  url?: string;
  badge?: string;
  action?: () => void;
  keywords?: string[];
}

export interface NovaSessionState {
  lastEnvironment: NovaEnvironment;
  lastRoute: string;
  lastTitle: string;
  lastTimestamp: number;
}

export interface NovaUserProfile {
  level: number;
  xp: number;
  title: string;
  walletAddress?: string;
}
