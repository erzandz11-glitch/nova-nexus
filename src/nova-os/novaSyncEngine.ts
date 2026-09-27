/**
 * NOVA OS — Universal Sync Engine & React Hooks
 * Authoritative XP, Level Aggregator, and Cross-Platform Continuity
 */

import { useState, useEffect, useCallback } from 'react';
import { NovaIdentityService, NovaUserProfile, NovaUserStats, NovaContinuityRecord } from './novaIdentity';
import { NovaEnvironment } from './novaTypes';

export interface NovaSyncState {
  user: NovaUserProfile | null;
  stats: NovaUserStats | null;
  continuities: NovaContinuityRecord[];
  isLoading: boolean;
  isGuest: boolean;
  awardXP: (actionType: string, amount: number, metadata?: Record<string, any>) => Promise<boolean>;
  recordContinuity: (targetEnv: NovaEnvironment, title: string, route: string, artifactType: string, artifactId: string, metadata?: Record<string, any>) => Promise<boolean>;
  refreshStats: () => Promise<void>;
}

export function useNovaSync(currentEnv: NovaEnvironment): NovaSyncState {
  const [user, setUser] = useState<NovaUserProfile | null>(null);
  const [stats, setStats] = useState<NovaUserStats | null>(null);
  const [continuities, setContinuities] = useState<NovaContinuityRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshStats = useCallback(async () => {
    try {
      const [u, s, c] = await Promise.all([
        NovaIdentityService.getUserProfile(),
        NovaIdentityService.getUserStats(),
        NovaIdentityService.getContinuities(),
      ]);
      setUser(u);
      setStats(s);
      setContinuities(c);
    } catch (e) {
      console.warn('[NOVA Sync] Error refreshing stats:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshStats();

    // Listen to real-time auth changes
    const unsubscribe = NovaIdentityService.onAuthStateChange(() => {
      refreshStats();
    });

    return unsubscribe;
  }, [refreshStats]);

  const awardXP = useCallback(async (
    actionType: string,
    amount: number,
    metadata: Record<string, any> = {}
  ): Promise<boolean> => {
    const idempotencyKey = `${currentEnv}_${actionType}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const result = await NovaIdentityService.awardXP(actionType, currentEnv, idempotencyKey, amount, metadata);
    if (result.success) {
      // Optimistic or fresh update
      refreshStats();
      return true;
    }
    return false;
  }, [currentEnv, refreshStats]);

  const recordContinuity = useCallback(async (
    targetEnv: NovaEnvironment,
    title: string,
    route: string,
    artifactType: string,
    artifactId: string,
    metadata: Record<string, any> = {}
  ): Promise<boolean> => {
    const success = await NovaIdentityService.saveContinuity({
      sourceEnvironment: currentEnv,
      targetEnvironment: targetEnv,
      title,
      route,
      artifactType,
      artifactId,
      metadata,
    });
    if (success) {
      refreshStats();
    }
    return success;
  }, [currentEnv, refreshStats]);

  return {
    user,
    stats,
    continuities,
    isLoading,
    isGuest: !user,
    awardXP,
    recordContinuity,
    refreshStats,
  };
}
