-- =========================================================================
-- NOVA COMMUNITY / SYNDICATE - SUPABASE POSTGRESQL SCHEMA & REALTIME CONFIG
-- =========================================================================
-- Copy and paste this script directly into your Supabase Dashboard:
-- SQL Editor -> New Query -> Run
-- =========================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. MESSAGES TABLE (Realtime Syndicate Dispatches)
CREATE TABLE IF NOT EXISTS public.messages (
    id TEXT PRIMARY KEY,
    channel_id TEXT NOT NULL DEFAULT 'inner-circle',
    author_id TEXT NOT NULL,
    author_name TEXT NOT NULL,
    author_handle TEXT NOT NULL,
    author_avatar_bg TEXT NOT NULL DEFAULT 'from-amber-600 to-amber-950',
    author_initials TEXT NOT NULL DEFAULT 'JS',
    author_rank TEXT NOT NULL DEFAULT 'The Board',
    author_tier TEXT NOT NULL DEFAULT 'Sovereign Black Card',
    author_pass_id TEXT NOT NULL DEFAULT 'NOVA-0042-BLACK',
    title TEXT,
    content TEXT NOT NULL,
    boosts INTEGER NOT NULL DEFAULT 1,
    is_pinned BOOLEAN NOT NULL DEFAULT false,
    attachment JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Index for high-throughput channel queries
CREATE INDEX IF NOT EXISTS idx_messages_channel_created ON public.messages(channel_id, created_at DESC);

-- 3. ESCROW TRANSACTIONS TABLE
CREATE TABLE IF NOT EXISTS public.escrow_transactions (
    id TEXT PRIMARY KEY DEFAULT ('tx-' || extract(epoch from now())::bigint),
    timestamp TEXT NOT NULL DEFAULT 'Just now',
    amount NUMERIC NOT NULL,
    sender TEXT NOT NULL,
    recipient TEXT NOT NULL,
    deal_type TEXT NOT NULL,
    tx_hash TEXT NOT NULL,
    node_location TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Settled',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. ROW LEVEL SECURITY (RLS)
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.escrow_transactions ENABLE ROW LEVEL SECURITY;

-- Allow anyone (public/anon & authenticated) to read syndicate dispatches
CREATE POLICY "Public read access for messages"
ON public.messages FOR SELECT
USING (true);

-- Allow anyone to post dispatches (or restrict to auth if required)
CREATE POLICY "Allow public insert for messages"
ON public.messages FOR INSERT
WITH CHECK (true);

-- Allow anyone to update boosts
CREATE POLICY "Allow public update for messages"
ON public.messages FOR UPDATE
USING (true);

-- Escrow transactions policies
CREATE POLICY "Public read access for escrow"
ON public.escrow_transactions FOR SELECT
USING (true);

CREATE POLICY "Allow insert for escrow"
ON public.escrow_transactions FOR INSERT
WITH CHECK (true);

-- 5. ENABLE REALTIME BROADCASTING
-- This allows Supabase to push new messages instantly to all connected users
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.escrow_transactions;

-- 6. ATOMIC INCREMENT BOOST RPC FUNCTION
CREATE OR REPLACE FUNCTION public.increment_message_boost(msg_id TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.messages
  SET boosts = boosts + 1
  WHERE id = msg_id;
END;
$$;

-- 7. INITIAL SEED DISPATCHES (Populates The Inner Circle instantly)
INSERT INTO public.messages (
    id, channel_id, author_id, author_name, author_handle, author_avatar_bg, 
    author_initials, author_rank, author_tier, author_pass_id, title, content, 
    boosts, is_pinned, attachment
) VALUES 
(
    'msg-seed-1', 
    'inner-circle', 
    'user-1', 
    'Julian Sterling', 
    '@sterling_apex', 
    'from-amber-600 via-amber-800 to-black', 
    'JS', 
    'The Board', 
    'Sovereign Black Card', 
    'NOVA-0042-BLACK', 
    'CONFIDENTIAL DISPATCH: Q4 Apex Liquidity Mandate & Autonomous Video Agents', 
    'The syndicate has secured private allocation rights for Tranche-IV of the Zurich Autonomous Media Cluster. Settlement is routed through multi-sig cryptographic escrow on Ethereum mainnet. 

All Tier-1 Sovereign holders have 48 hours to confirm tranches prior to secondary market release.', 
    42, 
    true, 
    '{"type": "metric", "title": "Apex Cluster Tranche IV", "subtitle": "Audited Multi-Sig Escrow Settlement", "metricValue": "$2,400,000", "metricLabel": "Settled Allocation", "metricChange": "+24.8%", "tag": "Audited"}'::jsonb
),
(
    'msg-seed-2', 
    'inner-circle', 
    'user-2', 
    'Elena Rostova', 
    '@rostova_quant', 
    'from-zinc-700 via-zinc-800 to-black', 
    'ER', 
    'The Board', 
    'Sovereign Black Card', 
    'NOVA-0007-BLACK', 
    'Autonomous AI Ad Pipelines at 8-Figure Scale', 
    'Deployed 600 synthetic video ad variants yesterday through our custom inference nodes. ROAS increased from 3.2x to 4.9x in 72 hours with zero human intervention.

Full schema uploaded to the private vault.', 
    28, 
    false, 
    null
),
(
    'msg-seed-3', 
    'ai-automations', 
    'user-3', 
    'Marcus Vance', 
    '@vance_scale', 
    'from-amber-700 to-zinc-900', 
    'MV', 
    'Architects', 
    'Platinum Architect', 
    'NOVA-0108-PLAT', 
    'Real-time Content Pipeline Architecture', 
    'For those asking about our multi-agent orchestration, we moved off Python runtimes to Rust-compiled edge workers. Latency dropped from 420ms to 18ms under 50k concurrent stream load.', 
    19, 
    false, 
    null
)
ON CONFLICT (id) DO NOTHING;
