import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { NovaEnvironment } from './novaTypes';

export interface NovaUserProfile {
  id: string;
  email?: string;
  displayName?: string;
  avatarUrl?: string;
  walletAddress?: string;
  tierRank?: string;
}

export interface NovaUserStats {
  userId: string;
  displayName?: string;
  avatarUrl?: string;
  totalXp: number;
  globalLevel: number;
  streakDays: number;
  lastActiveAt?: string;
}

export interface NovaContinuityRecord {
  id?: string;
  userId?: string;
  sourceEnvironment: NovaEnvironment;
  targetEnvironment: NovaEnvironment;
  title: string;
  route: string;
  artifactType: string;
  artifactId: string;
  metadata?: Record<string, any>;
  updatedAt?: string;
}

const getSupabaseCredentials = () => {
  try {
    // @ts-ignore
    const metaUrl = import.meta.env?.VITE_SUPABASE_URL || process.env?.NEXT_PUBLIC_SUPABASE_URL;
    // @ts-ignore
    const metaKey = import.meta.env?.VITE_SUPABASE_ANON_KEY || process.env?.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (metaUrl && metaKey && metaUrl.startsWith('https://')) {
      return { url: metaUrl, key: metaKey };
    }
  } catch {
    // Fallback
  }
  return null;
};

let cachedClient: SupabaseClient | null = null;

export const getNovaSupabaseClient = (): SupabaseClient | null => {
  if (cachedClient) return cachedClient;
  const creds = getSupabaseCredentials();
  if (creds) {
    cachedClient = createClient(creds.url, creds.key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
    return cachedClient;
  }
  return null;
};

export class NovaIdentityService {
  static async signInWithGoogle(redirectTo?: string): Promise<{ error?: any }> {
    const client = getNovaSupabaseClient();
    if (!client) {
      console.warn('[NOVA ID] Supabase unconfigured, falling back to local simulation');
      return {};
    }
    const redirect = redirectTo || (typeof window !== 'undefined' ? window.location.origin : '');
    const { error } = await client.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirect,
      },
    });
    return { error };
  }

  static async signOut(): Promise<void> {
    const client = getNovaSupabaseClient();
    if (client) {
      await client.auth.signOut();
    }
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('nova_auth_cached_user');
    }
  }

  static async getUserProfile(): Promise<NovaUserProfile | null> {
    const client = getNovaSupabaseClient();
    if (!client) return null;

    const { data: { session } } = await client.auth.getSession();
    if (!session?.user) return null;

    const { data } = await client
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();

    if (data) {
      return {
        id: data.id,
        email: data.email,
        displayName: data.display_name,
        avatarUrl: data.avatar_url,
        walletAddress: data.wallet_address,
        tierRank: data.tier_rank,
      };
    }
    return {
      id: session.user.id,
      email: session.user.email,
      displayName: session.user.user_metadata?.full_name || session.user.email,
      avatarUrl: session.user.user_metadata?.avatar_url,
    };
  }

  static async getUserStats(): Promise<NovaUserStats | null> {
    const client = getNovaSupabaseClient();
    if (!client) return null;

    const { data: { session } } = await client.auth.getSession();
    if (!session?.user) return null;

    const { data } = await client
      .from('nova_user_stats')
      .select('*')
      .eq('user_id', session.user.id)
      .single();

    if (data) {
      return {
        userId: data.user_id,
        displayName: data.display_name,
        avatarUrl: data.avatar_url,
        totalXp: data.total_xp || 0,
        globalLevel: data.global_level || 1,
        streakDays: data.streak_days || 0,
        lastActiveAt: data.last_active_at,
      };
    }
    return null;
  }

  static async awardXP(
    actionType: string,
    environment: NovaEnvironment,
    idempotencyKey: string,
    amount: number,
    metadata: Record<string, any> = {}
  ): Promise<{ success: boolean; awardedXp?: number }> {
    const client = getNovaSupabaseClient();
    if (!client) {
      return { success: true, awardedXp: amount };
    }

    const { data, error } = await client.rpc('award_xp_event', {
      p_action_type: actionType,
      p_environment: environment,
      p_idempotency_key: idempotencyKey,
      p_amount: amount,
      p_metadata: metadata,
    });

    if (error) {
      console.error('[NOVA XP] Error awarding XP:', error);
      return { success: false };
    }
    return { success: true, awardedXp: data?.awarded_xp || amount };
  }

  static async saveContinuity(
    record: NovaContinuityRecord
  ): Promise<boolean> {
    const client = getNovaSupabaseClient();
    if (!client) return false;

    const { data: { session } } = await client.auth.getSession();
    if (!session?.user) return false;

    const { error } = await client
      .from('nova_continuities')
      .upsert({
        user_id: session.user.id,
        source_environment: record.sourceEnvironment,
        target_environment: record.targetEnvironment,
        title: record.title,
        route: record.route,
        artifact_type: record.artifactType,
        artifact_id: record.artifactId,
        metadata: record.metadata || {},
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id, target_environment' });

    return !error;
  }

  static async getContinuities(): Promise<NovaContinuityRecord[]> {
    const client = getNovaSupabaseClient();
    if (!client) return [];

    const { data: { session } } = await client.auth.getSession();
    if (!session?.user) return [];

    const { data } = await client
      .from('nova_continuities')
      .select('*')
      .eq('user_id', session.user.id)
      .order('updated_at', { ascending: false });

    return (data || []).map((item) => ({
      id: item.id,
      userId: item.user_id,
      sourceEnvironment: item.source_environment as NovaEnvironment,
      targetEnvironment: item.target_environment as NovaEnvironment,
      title: item.title,
      route: item.route,
      artifactType: item.artifact_type,
      artifactId: item.artifact_id,
      metadata: item.metadata,
      updatedAt: item.updated_at,
    }));
  }
}
