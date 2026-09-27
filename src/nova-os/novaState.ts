import { NovaEnvironment, NovaSessionState, NovaUserProfile } from './novaTypes';

const STORAGE_KEYS = {
  SESSION: 'nova_os_last_session',
  RECENT_COMMANDS: 'nova_os_recent_command_ids',
  PROFILE: 'nova_os_user_profile',
} as const;

export const NovaStateManager = {
  recordActivity(environment: NovaEnvironment, route: string, title: string) {
    if (typeof window === 'undefined') return;
    try {
      const state: NovaSessionState = {
        lastEnvironment: environment,
        lastRoute: route,
        lastTitle: title,
        lastTimestamp: Date.now(),
      };
      localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(state));
    } catch {}
  },

  getLastSession(): NovaSessionState | null {
    if (typeof window === 'undefined') return null;
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.SESSION);
      if (!raw) return null;
      return JSON.parse(raw) as NovaSessionState;
    } catch {
      return null;
    }
  },

  recordCommandExecution(commandId: string) {
    if (typeof window === 'undefined') return;
    try {
      const recent = this.getRecentCommandIds();
      const filtered = recent.filter((id) => id !== commandId);
      const updated = [commandId, ...filtered].slice(0, 5);
      localStorage.setItem(STORAGE_KEYS.RECENT_COMMANDS, JSON.stringify(updated));
    } catch {}
  },

  getRecentCommandIds(): string[] {
    if (typeof window === 'undefined') return [];
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.RECENT_COMMANDS);
      if (!raw) return [];
      return JSON.parse(raw) as string[];
    } catch {
      return [];
    }
  },

  getUserProfile(): NovaUserProfile {
    if (typeof window === 'undefined') {
      return { level: 12, xp: 3450, title: 'Sovereign Architect' };
    }
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.PROFILE);
      if (raw) return JSON.parse(raw);
    } catch {}
    return { level: 12, xp: 3450, title: 'Sovereign Architect' };
  },
};
