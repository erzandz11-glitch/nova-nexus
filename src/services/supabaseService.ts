import { supabase, isSupabaseConfigured } from './supabaseClient';
import { Message, User } from '../types';

export interface SupabaseMessageRow {
  id: string;
  channel_id: string;
  author_id: string;
  author_name: string;
  author_handle: string;
  author_avatar_bg: string;
  author_initials: string;
  author_rank: string;
  author_tier: string;
  author_pass_id: string;
  title: string | null;
  content: string;
  boosts: number;
  is_pinned: boolean;
  attachment: any | null;
  created_at: string;
}

const buildUserFromRow = (row: SupabaseMessageRow): User => {
  const rank = (row.author_rank === 'The Board' || row.author_rank === 'Architects')
    ? row.author_rank
    : 'Members';

  const tier = (row.author_tier === 'Sovereign Black Card' || row.author_tier === 'Platinum Architect')
    ? row.author_tier
    : 'Gold Founder';

  return {
    id: row.author_id,
    name: row.author_name,
    handle: row.author_handle,
    roleTitle: `${rank} · ${tier}`,
    avatarBg: row.author_avatar_bg || 'from-amber-600 to-amber-950',
    initials: row.author_initials || row.author_name.slice(0, 2).toUpperCase(),
    rank,
    tier,
    passId: row.author_pass_id || 'NOVA-0042-BLACK',
    status: 'online',
    weeklyRevenue: 120000,
    totalVolume: 850000,
    dealsClosed: 4,
    location: 'Zurich / Dubai Node',
    bio: 'Sovereign Syndicate Member. Cryptographic multi-sig verified.',
    verifiedAudit: true,
  };
};

export const supabaseService = {
  isConfigured: isSupabaseConfigured,

  /**
   * Fetch recent dispatches for a specific channel
   */
  async fetchMessages(channelId: string): Promise<Message[] | null> {
    if (!supabase) return null;

    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('channel_id', channelId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.warn('Supabase fetchMessages error:', error.message);
        return null;
      }

      if (!data) return [];

      return data.map((row: SupabaseMessageRow) => ({
        id: row.id,
        channelId: row.channel_id,
        author: buildUserFromRow(row),
        title: row.title || undefined,
        content: row.content,
        timestamp: new Date(row.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' UTC',
        boosts: row.boosts || 1,
        hasBoosted: false,
        isPinned: row.is_pinned || false,
        attachment: row.attachment || undefined,
        repliesCount: 0,
      }));
    } catch (err) {
      console.warn('Supabase service exception:', err);
      return null;
    }
  },

  /**
   * Broadcast a new dispatch message to Supabase
   */
  async sendDispatch(
    message: Message
  ): Promise<boolean> {
    if (!supabase) return false;

    try {
      const { error } = await supabase.from('messages').insert({
        id: message.id,
        channel_id: message.channelId,
        author_id: message.author.id,
        author_name: message.author.name,
        author_handle: message.author.handle,
        author_avatar_bg: message.author.avatarBg,
        author_initials: message.author.initials,
        author_rank: message.author.rank,
        author_tier: message.author.tier,
        author_pass_id: message.author.passId,
        title: message.title || null,
        content: message.content,
        boosts: message.boosts || 1,
        is_pinned: message.isPinned || false,
        attachment: message.attachment || null,
      });

      if (error) {
        console.warn('Supabase sendDispatch error:', error.message);
        return false;
      }

      return true;
    } catch (err) {
      console.warn('Supabase sendDispatch exception:', err);
      return false;
    }
  },

  /**
   * Subscribe to real-time dispatches across all users
   */
  subscribeToDispatches(
    onNewMessage: (msg: Message) => void
  ) {
    const client = supabase;
    if (!client) return () => {};

    const channel = client
      .channel('public:messages')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
          const row = payload.new as SupabaseMessageRow;
          const newMsg: Message = {
            id: row.id,
            channelId: row.channel_id,
            author: buildUserFromRow(row),
            title: row.title || undefined,
            content: row.content,
            timestamp: 'Just now',
            boosts: row.boosts || 1,
            hasBoosted: false,
            isPinned: row.is_pinned || false,
            attachment: row.attachment || undefined,
            repliesCount: 0,
          };
          onNewMessage(newMsg);
        }
      )
      .subscribe();

    return () => {
      client.removeChannel(channel);
    };
  },

  /**
   * Increment Boost on a message in Supabase
   */
  async boostMessage(messageId: string): Promise<void> {
    if (!supabase) return;
    try {
      await supabase.rpc('increment_message_boost', { msg_id: messageId });
    } catch (err) {
      // Ignore RPC if function not created
    }
  },
};
