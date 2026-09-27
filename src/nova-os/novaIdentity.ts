import { createClient, SupabaseClient, Session } from '@supabase/supabase-js';
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
  // Check process.env (Next.js & Node)
  if (typeof process !== 'undefined' && process.env) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
    if (url && key && url.startsWith('https://')) {
      return { url, key };
    }
  }
  // Check Vite import.meta
  try {
    // @ts-ignore
    const metaUrl = import.meta.env?.VITE_SUPABASE_URL || import.meta.env?.NEXT_PUBLIC_SUPABASE_URL;
    // @ts-ignore
    const metaKey = import.meta.env?.VITE_SUPABASE_ANON_KEY || import.meta.env?.NEXT_PUBLIC_SUPABASE_ANON_KEY;
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
        detectSessionInUrl: true,
      },
    });
    return cachedClient;
  }
  return null;
};

export class NovaIdentityService {
  static isConfigured(): boolean {
    return getNovaSupabaseClient() !== null;
  }

  /**
   * Universal Google OAuth 2.0 PKCE Sign In
   */
  static async signInWithGoogle(redirectTo?: string): Promise<{ error?: any; url?: string }> {
    const client = getNovaSupabaseClient();
    if (!client) {
      console.warn('[NOVA ID] Supabase credentials unconfigured in environment.');
      return { error: new Error('Supabase client is not configured') };
    }
    const redirect = redirectTo || (typeof window !== 'undefined' ? window.location.origin : '');
    const { data, error } = await client.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirect,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });
    return { error, url: data?.url };
  }

  /**
   * Global Sign Out
   */
  static async signOut(): Promise<void> {
    const client = getNovaSupabaseClient();
    if (client) {
      await client.auth.signOut();
    }
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('nova_auth_cached_user');
    }
  }

  /**
   * Subscribe to Auth Session changes with real-time profile resolution
   */
  static onAuthStateChange(
    callback: (event: string, session: Session | null, profile: NovaUserProfile | null) => void
  ): () => void {
    const client = getNovaSupabaseClient();
    if (!client) {
      return () => {};
    }

    const { data: { subscription } } = client.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const profile = await this.getUserProfile();
        callback(event, session, profile);
      } else {
        callback(event, null, null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }

  /**
   * Get Current Authenticated User Profile
   */
  static async getUserProfile(): Promise<NovaUserProfile | null> {
    const client = getNovaSupabaseClient();
    if (!client) return null;

    const { data: { session } } = await client.auth.getSession();
    if (!session?.user) return null;

    try {
      const { data, error } = await client
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (data && !error) {
        return {
          id: data.id,
          email: data.email,
          displayName: data.display_name,
          avatarUrl: data.avatar_url,
          walletAddress: data.wallet_address,
          tierRank: data.tier_rank || 'Novice Observer',
        };
      }
    } catch {
      // Fallback
    }

    return {
      id: session.user.id,
      email: session.user.email,
      displayName: session.user.user_metadata?.full_name || session.user.user_metadata?.name || session.user.email?.split('@')[0],
      avatarUrl: session.user.user_metadata?.avatar_url,
      tierRank: 'Novice Observer',
    };
  }

  /**
   * Get Aggregated User Stats (Authoritative Global XP, Level, True Consecutive Streak)
   */
  static async getUserStats(): Promise<NovaUserStats | null> {
    const client = getNovaSupabaseClient();
    if (!client) return null;

    const { data: { session } } = await client.auth.getSession();
    if (!session?.user) return null;

    try {
      const { data, error } = await client
        .from('nova_user_stats')
        .select('*')
        .eq('user_id', session.user.id)
        .single();

      if (data && !error) {
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
    } catch {
      // Fallback
    }
    return null;
  }

  /**
   * Award XP Event via Server-Side Trusted RPC with Idempotency Key
   */
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

  /**
   * Record Pointer-Based Continuity ("Continue Where You Left Off")
   */
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
        artifactId: record.artifactId,
        metadata: record.metadata || {},
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id, target_environment' });

    return !error;
  }

  /**
   * Get Active Continuities for Current User
   */
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
