/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { 
  ShieldCheck, 
  Menu, 
  X, 
  Users, 
  Plus, 
  Search, 
  Lock, 
  Sparkles, 
  ChevronDown, 
  Layers, 
  TrendingUp, 
  ExternalLink,
  SlidersHorizontal,
  Compass,
  Award,
  Bell,
  ArrowRight,
  ArrowLeft,
  Trophy,
  Volume2,
  VolumeX,
  Radio,
  Briefcase
} from 'lucide-react';

import { TelegramIcon, DiscordIcon } from './components/SocialIcons';
import { NovaEcosystemSwitcher } from './components/NovaEcosystemSwitcher';
import { NovaOnboardingQuest } from './components/NovaOnboardingQuest';
import { NovaCommandSurface } from './nova-os/NovaCommandSurface';
import { NovaKeyboardRouter } from './nova-os/novaKeyboard';
import { NovaStateManager } from './nova-os/novaState';

import { 
  User, 
  Channel, 
  Message, 
  LeaderboardEntry, 
  Attachment, 
  MemberRank, 
  EscrowTransaction, 
  SyndicateNotification, 
  OTCDeal 
} from './types';

import { 
  CURRENT_USER, 
  MOCK_USERS, 
  MOCK_CHANNELS, 
  MOCK_MESSAGES, 
  MOCK_LEADERBOARD,
  INITIAL_ESCROW_TRANSACTIONS,
  MOCK_NOTIFICATIONS,
  MOCK_OTC_DEALS
} from './data/mockData';

import { TheArena } from './pages/TheArena';
import { FeedMessage } from './components/FeedMessage';
import { VIPAccessModal } from './components/VIPAccessModal';
import { TokenGateModal } from './components/TokenGateModal';
import { MemberProfileModal } from './components/MemberProfileModal';
import { CreatePostModal } from './components/CreatePostModal';
import { EscrowTicker } from './components/EscrowTicker';
import { NotificationCenter } from './components/NotificationCenter';
import { DealRoomModal } from './components/DealRoomModal';
import { sounds } from './services/soundEffects';
import { supabaseService } from './services/supabaseService';
import { isSupabaseConfigured } from './services/supabaseClient';

export default function App() {
  // Navigation & View States
  const [activeView, setActiveView] = useState<'feed' | 'arena'>('feed');
  const [activeChannelId, setActiveChannelId] = useState<string>('inner-circle');
  const [messages, setMessages] = useState<Record<string, Message[]>>(MOCK_MESSAGES);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>(MOCK_LEADERBOARD);
  const [members, setMembers] = useState<User[]>(MOCK_USERS);
  const [currentUser, setCurrentUser] = useState<User>(CURRENT_USER);
  const [transactions, setTransactions] = useState<EscrowTransaction[]>(INITIAL_ESCROW_TRANSACTIONS);
  const [notifications, setNotifications] = useState<SyndicateNotification[]>(MOCK_NOTIFICATIONS);
  const [deals, setDeals] = useState<OTCDeal[]>(MOCK_OTC_DEALS);

  // Unlocked restricted channels tracker
  const [unlockedChannels, setUnlockedChannels] = useState<string[]>([]);
  const [tokenGatedChannel, setTokenGatedChannel] = useState<Channel | null>(null);

  // Audio state
  const [audioEnabled, setAudioEnabled] = useState<boolean>(sounds.enabled);

  // Modals & Panels
  const [isVIPModalOpen, setIsVIPModalOpen] = useState<boolean>(false);
  const [isCreatePostOpen, setIsCreatePostOpen] = useState<boolean>(false);
  const [isDealRoomOpen, setIsDealRoomOpen] = useState<boolean>(false);
  const [isNotifOpen, setIsNotifOpen] = useState<boolean>(false);
  const [isTokenGateOpen, setIsTokenGateOpen] = useState<boolean>(false);
  const [isCommandOpen, setIsCommandOpen] = useState<boolean>(false);
  const [selectedProfileUser, setSelectedProfileUser] = useState<User | null>(null);

  // Record session & attach global keyboard router (⌘K + G sequences)
  useEffect(() => {
    NovaStateManager.recordActivity('community', window.location.href, 'NOVA Community Syndicate');
    const cleanup = NovaKeyboardRouter.attach({
      onOpenCommandSurface: () => setIsCommandOpen(true),
    });
    return cleanup;
  }, []);

  // Mobile & Tablet Drawer Toggles (<1024px and <1280px)
  const [isMobileNavOpen, setIsMobileNavOpen] = useState<boolean>(false);
  const [isMobileMembersOpen, setIsMobileMembersOpen] = useState<boolean>(false);

  // Search & Filter in chat
  const [chatSearch, setChatSearch] = useState<string>('');

  // Interactive Quick Dispatch input state (Requirement 3)
  const [quickDispatchText, setQuickDispatchText] = useState<string>('');

  // Unread notifications count
  const unreadNotifCount = useMemo(() => {
    return notifications.filter((n) => !n.read).length;
  }, [notifications]);

  // Active Channel lookup
  const activeChannel = useMemo(() => {
    return MOCK_CHANNELS.find((c) => c.id === activeChannelId) || MOCK_CHANNELS[1];
  }, [activeChannelId]);

  // High-throughput simulation engine for scalable global active user experience
  useEffect(() => {
    const interval = setInterval(() => {
      const randomAmount = Math.floor(Math.random() * 850000) + 75000;
      const nodes = ['Zurich-01', 'Singapore-04', 'London-02', 'Dubai-01', 'Tokyo-02', 'Frankfurt-03'];
      const types: ('Secondary Tranche' | 'OTC Buyout' | 'Cohort Retainer' | 'AI Cluster Allocation')[] = [
        'Secondary Tranche',
        'OTC Buyout',
        'Cohort Retainer',
        'AI Cluster Allocation',
      ];
      const randomType = types[Math.floor(Math.random() * types.length)];
      const randomNode = nodes[Math.floor(Math.random() * nodes.length)];
      const randomHash = `0x${Math.random().toString(16).substring(2, 6)}...${Math.random().toString(16).substring(2, 6)}`;

      const newTx: EscrowTransaction = {
        id: `tx-${Date.now()}`,
        timestamp: 'Just now',
        amount: randomAmount,
        sender: '0x' + Math.random().toString(16).substring(2, 6) + '...' + Math.random().toString(16).substring(2, 6),
        recipient: 'Apex Multi-Sig Escrow',
        dealType: randomType,
        txHash: randomHash,
        nodeLocation: randomNode,
        status: 'Settled',
      };

      setTransactions((prev) => [newTx, ...prev.slice(0, 14)]);
    }, 12000);

    return () => clearInterval(interval);
  }, []);

  // Supabase Real-time Synchronization across all connected users
  useEffect(() => {
    if (!isSupabaseConfigured) return;

    // 1. Fetch persistent messages for active channel from Supabase
    supabaseService.fetchMessages(activeChannelId).then((fetched) => {
      if (fetched && fetched.length > 0) {
        setMessages((prev) => ({
          ...prev,
          [activeChannelId]: fetched,
        }));
      }
    });

    // 2. Subscribe to real-time dispatches from other users
    const unsubscribe = supabaseService.subscribeToDispatches((newMsg) => {
      sounds.playChime();
      setMessages((prev) => {
        const list = prev[newMsg.channelId] || [];
        if (list.some((m) => m.id === newMsg.id)) return prev;
        return {
          ...prev,
          [newMsg.channelId]: [newMsg, ...list],
        };
      });
    });

    return () => {
      unsubscribe();
    };
  }, [activeChannelId]);

  // Filtered messages
  const currentMessages = useMemo(() => {
    const list = messages[activeChannelId] || [];
    if (!chatSearch.trim()) return list;
    return list.filter(
      (m) =>
        m.content.toLowerCase().includes(chatSearch.toLowerCase()) ||
        m.author.name.toLowerCase().includes(chatSearch.toLowerCase()) ||
        (m.title && m.title.toLowerCase().includes(chatSearch.toLowerCase()))
    );
  }, [messages, activeChannelId, chatSearch]);

  // Categorized Members for Column 3
  const boardMembers = useMemo(() => members.filter((m) => m.rank === 'The Board'), [members]);
  const architectMembers = useMemo(() => members.filter((m) => m.rank === 'Architects'), [members]);
  const regularMembers = useMemo(() => members.filter((m) => m.rank === 'Members'), [members]);

  // Channel select with audio feedback and token gating
  const handleSelectChannel = (channel: Channel) => {
    sounds.playClick();

    // Check if channel is locked and not yet unlocked
    if (channel.isRestricted && !unlockedChannels.includes(channel.id)) {
      setTokenGatedChannel(channel);
      setIsTokenGateOpen(true);
      return;
    }

    setActiveChannelId(channel.id);
    setActiveView('feed');
    setIsMobileNavOpen(false);

    // If selecting OTC Escrow Desk, open the Deal Room modal directly
    if (channel.id === 'deal-room-closed') {
      setIsDealRoomOpen(true);
    }
  };

  // Switch to Arena
  const handleOpenArena = () => {
    sounds.playClick();
    setActiveView('arena');
    setIsMobileNavOpen(false);
  };

  // Return to feed
  const handleBackToFeed = () => {
    sounds.playClick();
    setActiveView('feed');
  };

  // Toggle audio
  const handleToggleAudio = () => {
    const state = sounds.toggleSound();
    setAudioEnabled(state);
  };

  // Add new dispatch post (Requirement 2)
  const handleCreatePost = (
    title: string,
    channelId: string,
    content: string,
    attachment?: Attachment
  ) => {
    sounds.playChime();
    const targetChannelId = channelId || activeChannelId;

    const newMsg: Message = {
      id: `msg-${Date.now()}`,
      channelId: targetChannelId,
      author: currentUser,
      title: title || undefined,
      content,
      timestamp: 'Just now',
      boosts: 1,
      hasBoosted: true,
      attachment,
      repliesCount: 0,
    };

    setMessages((prev) => ({
      ...prev,
      [targetChannelId]: [newMsg, ...(prev[targetChannelId] || [])],
    }));

    // If user posted into another channel, navigate there
    if (targetChannelId !== activeChannelId) {
      setActiveChannelId(targetChannelId);
    }
    setActiveView('feed');

    // Also add to syndicate notifications
    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        title: 'New Dispatch Broadcasted',
        description: `"${title || 'Confidential Transmission'}" broadcasted to ${activeChannel.name}.`,
        timestamp: 'Just now',
        read: false,
        type: 'boost',
      },
      ...prev,
    ]);

    // Broadcast to Supabase PostgreSQL real-time cluster if configured
    if (isSupabaseConfigured) {
      supabaseService.sendDispatch(newMsg);
    }
  };

  // Quick Dispatch Form Submission (Requirement 3: Interactive "+ Dispatch" bar)
  const handleQuickDispatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickDispatchText.trim()) return;

    handleCreatePost(
      '',
      activeChannelId,
      quickDispatchText.trim()
    );

    setQuickDispatchText('');
  };

  // Boost handler with Supabase sync
  const handleBoostMessage = useCallback((msgId: string) => {
    sounds.playChime();
    if (isSupabaseConfigured) {
      supabaseService.boostMessage(msgId);
    }
  }, []);

  // Verify Pass callback
  const handleVerifySuccess = (passId: string) => {
    setCurrentUser((prev) => ({
      ...prev,
      passId,
      verifiedAudit: true,
    }));
    setIsVIPModalOpen(false);
  };

  // Token-gate unlock callback
  const handleTokenGateUnlock = (channelId: string) => {
    setUnlockedChannels((prev) => [...prev, channelId]);
    setActiveChannelId(channelId);
    setActiveView('feed');
    setIsMobileNavOpen(false);
  };

  // Commit allocation
  const handleCommitAllocation = (dealId: string, amount: number) => {
    setDeals((prev) =>
      prev.map((d) => (d.id === dealId ? { ...d, filledAmount: d.filledAmount + amount } : d))
    );
    const newTx: EscrowTransaction = {
      id: `tx-${Date.now()}`,
      timestamp: 'Just now',
      amount,
      sender: currentUser.walletAddress || '0x843C...E98D',
      recipient: 'OTC Escrow Pool',
      dealType: 'Secondary Tranche',
      txHash: '0x' + Math.random().toString(16).substring(2, 6) + '...' + Math.random().toString(16).substring(2, 6),
      nodeLocation: 'Zurich-01',
      status: 'Settled',
    };
    setTransactions((prev) => [newTx, ...prev]);
  };

  return (
    <div className="flex flex-col h-screen w-full bg-[#04060c] text-zinc-100 overflow-hidden font-sans select-none antialiased">
      
      {/* Main App Container */}
      <div className="flex-1 flex overflow-hidden relative">

        {/* ========================================================================= */}
        {/* COLUMN 1: Channels List (Collapsible on <1024px)                          */}
        {/* ========================================================================= */}
        <aside
          className={`fixed inset-y-0 left-0 z-40 w-[280px] bg-[#070912] border-r border-zinc-800/80 flex flex-col transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
            isMobileNavOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
          }`}
        >
          {/* Syndicate Wordmark & Header */}
          <div className="h-16 px-5 border-b border-zinc-800/80 flex items-center justify-between shrink-0 bg-black/30">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full p-[1px] bg-gradient-to-tr from-cyan-400 via-blue-500 to-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.3)]">
                <img src="/nova-logo.jpg" alt="NOVA Logo" className="w-full h-full object-cover rounded-full scale-105" />
              </div>
              <div>
                <div className="font-sans text-sm font-extrabold tracking-tight text-zinc-100 flex items-center gap-1.5">
                  <span>NOVA</span>
                  <span className="text-xs text-amber-400 font-mono font-medium">COMMUNITY</span>
                </div>
                <div className="text-xs text-zinc-400 font-normal">Private Creator Guild</div>
              </div>
            </div>

            {/* Close drawer on mobile & tablet */}
            <button
              onClick={() => setIsMobileNavOpen(false)}
              className="lg:hidden p-1.5 text-zinc-400 hover:text-zinc-200 cursor-pointer rounded-lg hover:bg-zinc-900"
              aria-label="Close navigation drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Channels Navigation Scroll */}
          <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
            
            {/* Quick Nav: The Arena Highlight Button */}
            <div className="px-1">
              <button
                onClick={handleOpenArena}
                className={`w-full group relative flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all cursor-pointer ${
                  activeView === 'arena'
                    ? 'bg-gradient-to-r from-amber-500/25 via-amber-500/15 to-transparent border border-amber-500/50 text-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.2)]'
                    : 'bg-zinc-900/50 hover:bg-zinc-900/90 border border-zinc-800 text-zinc-300 hover:text-amber-200'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Trophy className={`w-4 h-4 ${activeView === 'arena' ? 'text-amber-400' : 'text-zinc-400 group-hover:text-amber-400'}`} />
                  <span className="font-sans text-xs font-bold tracking-wider">THE ARENA</span>
                </div>
                <span className="text-xs font-medium px-2 py-0.5 rounded bg-amber-400/10 text-amber-400 border border-amber-500/20">
                  LIVE
                </span>
              </button>
            </div>

            {/* Categories and Channels */}
            {(['Syndicate Core', 'Alpha & Intelligence', 'High-Ticket War Room'] as const).map((category) => {
              const channelGroup = MOCK_CHANNELS.filter(
                (c) => c.category === category && c.id !== 'arena-overview'
              );

              return (
                <React.Fragment key={category}>
                  <div className="space-y-1">
                    <div className="px-3 text-xs font-semibold uppercase tracking-wider text-zinc-400 flex items-center justify-between">
                      <span>{category}</span>
                    </div>

                    <div className="space-y-0.5 pt-1">
                      {channelGroup.map((channel) => {
                        const isActive = activeView === 'feed' && activeChannelId === channel.id;
                        const isLocked = channel.isRestricted && !unlockedChannels.includes(channel.id);

                        return (
                          <button
                            key={channel.id}
                            onClick={() => handleSelectChannel(channel)}
                            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all duration-150 text-left cursor-pointer group ${
                              isActive
                                ? 'bg-zinc-800/90 text-zinc-100 border border-zinc-700/70 shadow-sm'
                                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60 border border-transparent'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 truncate">
                              <span className="text-sm shrink-0">{channel.symbol}</span>
                              <span className="truncate">{channel.name}</span>
                            </div>

                            {channel.unreadCount ? (
                              <span className="shrink-0 text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold">
                                {channel.unreadCount}
                              </span>
                            ) : isLocked ? (
                              <div className="flex items-center gap-1 text-xs text-amber-400/90 font-medium">
                                <Lock className="w-3.5 h-3.5 text-amber-400/80 shrink-0" />
                                <span>VIP</span>
                              </div>
                            ) : null}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* DIRECT TRANSMISSIONS SECTION */}
                  {category === 'Alpha & Intelligence' && (
                    <div className="space-y-1.5 pt-1">
                      <div className="px-3 text-xs font-semibold uppercase tracking-wider text-zinc-400 flex items-center justify-between">
                        <span className="flex items-center gap-1.5 text-amber-400/90">
                          <Radio className="w-3.5 h-3.5 text-amber-400" />
                          DIRECT TRANSMISSIONS
                        </span>
                        <span className="text-xs text-emerald-400 font-medium">
                          Active
                        </span>
                      </div>

                      <div className="space-y-2 pt-1 px-1">
                        {/* Telegram Signals */}
                        <a
                          href="https://t.me/novasyndicate"
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => sounds.playClick()}
                          className="group relative flex items-center justify-between p-2.5 rounded-xl bg-zinc-900/40 hover:bg-zinc-900/80 border border-zinc-800/80 hover:border-amber-500/50 backdrop-blur-2xl transition-all duration-200 cursor-pointer shadow-sm"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-7 h-7 rounded-lg bg-[#229ED9]/15 border border-[#229ED9]/30 flex items-center justify-center text-[#229ED9] group-hover:scale-105 group-hover:border-[#229ED9]/60 transition-all shrink-0">
                              <TelegramIcon className="w-3.5 h-3.5" />
                            </div>
                            <div className="min-w-0">
                              <div className="text-xs font-semibold text-zinc-200 group-hover:text-amber-300 transition-colors flex items-center gap-1">
                                <span className="truncate">Telegram Signals</span>
                                <ExternalLink className="w-3 h-3 text-zinc-500 group-hover:text-amber-400/80 shrink-0" />
                              </div>
                              <div className="text-xs text-zinc-400 flex items-center gap-1.5 truncate">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
                                <span className="text-emerald-400 font-medium">Live</span>
                                <span className="text-zinc-600">·</span>
                                <span>Signals</span>
                              </div>
                            </div>
                          </div>

                          <div className="shrink-0 flex items-center pl-1">
                            <span className="text-xs text-emerald-400 font-medium px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30">
                              Joined
                            </span>
                          </div>
                        </a>

                        {/* Discord Guild VIP */}
                        <a
                          href="https://discord.gg/novasyndicate"
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => sounds.playClick()}
                          className="group relative flex items-center justify-between p-2.5 rounded-xl bg-zinc-900/40 hover:bg-zinc-900/80 border border-zinc-800/80 hover:border-amber-500/50 backdrop-blur-2xl transition-all duration-200 cursor-pointer shadow-sm"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-7 h-7 rounded-lg bg-[#5865F2]/15 border border-[#5865F2]/30 flex items-center justify-center text-[#5865F2] group-hover:scale-105 group-hover:border-[#5865F2]/60 transition-all shrink-0">
                              <DiscordIcon className="w-3.5 h-3.5" />
                            </div>
                            <div className="min-w-0">
                              <div className="text-xs font-semibold text-zinc-200 group-hover:text-amber-300 transition-colors flex items-center gap-1">
                                <span className="truncate">Discord Guild VIP</span>
                                <ExternalLink className="w-3 h-3 text-zinc-500 group-hover:text-amber-400/80 shrink-0" />
                              </div>
                              <div className="text-xs text-zinc-400 flex items-center gap-1.5 truncate">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0"></span>
                                <span className="text-zinc-300 font-medium">1,420 Active</span>
                              </div>
                            </div>
                          </div>

                          <div className="shrink-0 flex items-center pl-1">
                            <span className="text-xs text-zinc-300 font-medium px-2 py-0.5 rounded bg-zinc-800/80 border border-zinc-700/60">
                              Online
                            </span>
                          </div>
                        </a>
                      </div>
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>

          {/* Column 1 Footer: Current User Concierge Card */}
          <div className="p-3.5 border-t border-zinc-800/80 bg-[#070912] shrink-0">
            <div
              onClick={() => {
                sounds.playClick();
                setSelectedProfileUser(currentUser);
              }}
              className="group flex items-center justify-between p-3 rounded-xl border border-zinc-800/90 hover:border-amber-500/50 bg-zinc-950/90 hover:bg-zinc-900/90 transition-all cursor-pointer shadow-sm"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className={`relative w-10 h-10 rounded-xl bg-gradient-to-br ${currentUser.avatarBg} border border-amber-500/50 flex items-center justify-center text-xs font-bold text-zinc-100 shrink-0 shadow-sm`}>
                  {currentUser.initials}
                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-zinc-950" />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-bold text-zinc-100 group-hover:text-amber-300 font-sans tracking-tight transition-colors truncate">
                    {currentUser.name}
                  </div>
                  <div className="text-xs font-mono text-zinc-400 truncate">
                    {currentUser.passId}
                  </div>
                </div>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  sounds.playClick();
                  setIsVIPModalOpen(true);
                }}
                title="Verify VIP Card / Protocol Access"
                className="p-2 text-zinc-400 hover:text-amber-300 rounded-lg hover:bg-zinc-800/80 transition-all cursor-pointer shrink-0"
              >
                <ShieldCheck className="w-4 h-4 text-amber-400" />
              </button>
            </div>
          </div>
        </aside>

        {/* Backdrop overlay for mobile & tablet navigation drawer */}
        {isMobileNavOpen && (
          <div
            onClick={() => setIsMobileNavOpen(false)}
            className="fixed inset-0 z-30 bg-black/75 backdrop-blur-sm lg:hidden animate-in fade-in duration-200"
          />
        )}

        {/* ========================================================================= */}
        {/* COLUMN 2: Middle Flexible Area (Chat/Feed or The Arena)                  */}
        {/* ========================================================================= */}
        <main className="flex-1 flex flex-col min-w-0 bg-[#04060c] overflow-hidden relative w-full">
          
          {/* Top Bar */}
          <header className="h-16 px-4 sm:px-6 border-b border-zinc-800/80 bg-[#070912]/95 backdrop-blur-xl flex items-center justify-between shrink-0 z-20 gap-3">
            
            {/* Zone 1: Mobile Hamburger + Current Channel Title */}
            <div className="flex items-center gap-3 shrink-0 min-w-0">
              <button
                onClick={() => setIsMobileNavOpen(true)}
                className="lg:hidden p-2 -ml-1 text-zinc-400 hover:text-zinc-200 rounded-xl hover:bg-zinc-900 cursor-pointer shrink-0"
                aria-label="Toggle navigation menu"
              >
                <Menu className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2.5 shrink-0">
                <span className="text-xl sm:text-2xl shrink-0">
                  {activeView === 'arena' ? '⚔️' : activeChannel.symbol}
                </span>
                
                {/* Channel Title & Subtitle */}
                <div className="shrink-0 flex flex-col justify-center">
                  <h2 className="font-sans text-sm sm:text-base font-bold text-zinc-100 whitespace-nowrap tracking-tight flex items-center gap-2">
                    <span>{activeView === 'arena' ? 'THE ARENA' : activeChannel.name.toUpperCase()}</span>
                    {activeView === 'arena' ? (
                      <span className="text-xs px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30 font-medium">
                        LEADERBOARD
                      </span>
                    ) : (
                      <span className="hidden md:inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded bg-zinc-900 text-zinc-400 border border-zinc-800 font-medium">
                        {activeChannel.category}
                      </span>
                    )}
                  </h2>
                  <span className="text-xs text-zinc-400 font-normal leading-relaxed whitespace-nowrap hidden lg:block">
                    {activeView === 'arena'
                      ? 'Audited Leaderboard & Revenue Volumes'
                      : activeChannel.description}
                  </span>
                </div>
              </div>
            </div>

            {/* Zone 2: Responsive Search Field */}
            <div className="hidden md:flex items-center justify-center flex-1 px-2 lg:px-4 min-w-0">
              {activeView !== 'arena' && (
                <div className="relative w-full max-w-[220px] sm:max-w-xs">
                  <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={chatSearch}
                    onChange={(e) => setChatSearch(e.target.value)}
                    placeholder="Search messages..."
                    className="w-full pl-8 pr-3 py-1.5 bg-zinc-900/80 border border-zinc-800 rounded-xl text-xs text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:border-amber-500/50"
                  />
                </div>
              )}
            </div>

            {/* Zone 3: Right Cluster */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              
              {/* Universal Command Trigger Button (Mobile & Desktop) */}
              <button
                onClick={() => {
                  sounds.playClick();
                  window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }));
                }}
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-zinc-900/60 hover:bg-zinc-850 border border-amber-500/40 hover:border-amber-400 text-xs font-mono text-amber-300 hover:text-white transition shadow-sm cursor-pointer"
                title="Open Universal Command Search (⌘K)"
              >
                <Search className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Search</span>
                <kbd className="px-1.5 py-0.2 rounded bg-black/50 text-[10px] text-amber-300 border border-amber-500/30">
                  ⌘K
                </kbd>
              </button>

              <NovaEcosystemSwitcher currentId="community" />
              
              {/* Back to Feed button if in Arena view */}
              {activeView === 'arena' && (
                <button
                  onClick={handleBackToFeed}
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-700/80 hover:border-amber-500/50 bg-zinc-900/80 hover:bg-zinc-850 text-zinc-300 hover:text-amber-300 text-xs font-medium transition-all cursor-pointer whitespace-nowrap shrink-0"
                >
                  <ArrowLeft className="w-3.5 h-3.5 text-amber-400" />
                  <span>Feed</span>
                </button>
              )}

              {/* Quick-Launch Telegram Signals */}
              <a
                href="https://t.me/novasyndicate"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => sounds.playClick()}
                className="relative p-2 text-zinc-400 hover:text-[#229ED9] rounded-xl bg-zinc-900/60 hover:bg-zinc-900 border border-zinc-800/80 hover:border-[#229ED9]/50 transition-all duration-200 cursor-pointer shrink-0 group shadow-sm"
                title="Telegram Signals"
                aria-label="Telegram Signals Quick Launch"
              >
                <TelegramIcon className="w-4 h-4 fill-current group-hover:scale-110 transition-transform" />
              </a>

              {/* Quick-Launch Discord Guild VIP */}
              <a
                href="https://discord.gg/novasyndicate"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => sounds.playClick()}
                className="relative p-2 text-zinc-400 hover:text-[#5865F2] rounded-xl bg-zinc-900/60 hover:bg-zinc-900 border border-zinc-800/80 hover:border-[#5865F2]/50 transition-all duration-200 cursor-pointer shrink-0 group shadow-sm"
                title="Discord Guild VIP"
                aria-label="Discord Guild VIP Quick Launch"
              >
                <DiscordIcon className="w-4 h-4 fill-current group-hover:scale-110 transition-transform" />
              </a>

              {/* Audio Toggle */}
              <button
                onClick={handleToggleAudio}
                className="p-2 text-zinc-400 hover:text-zinc-200 rounded-xl bg-zinc-900/60 hover:bg-zinc-900 border border-zinc-800/80 hover:border-zinc-700 transition-colors cursor-pointer shrink-0"
                title={audioEnabled ? 'Mute sound effects' : 'Enable sound effects'}
              >
                {audioEnabled ? (
                  <Volume2 className="w-4 h-4 text-amber-400" />
                ) : (
                  <VolumeX className="w-4 h-4 text-zinc-500" />
                )}
              </button>

              {/* Notification Center Trigger */}
              <div className="relative shrink-0">
                <button
                  onClick={() => {
                    sounds.playClick();
                    setIsNotifOpen(!isNotifOpen);
                  }}
                  className="relative p-2 text-zinc-400 hover:text-zinc-200 rounded-xl bg-zinc-900/60 hover:bg-zinc-900 border border-zinc-800/80 hover:border-zinc-700 transition-colors cursor-pointer"
                  title="Syndicate Dispatches & Alerts"
                >
                  <Bell className="w-4 h-4" />
                  {unreadNotifCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-400 ring-2 ring-zinc-950" />
                  )}
                </button>

                <NotificationCenter
                  notifications={notifications}
                  isOpen={isNotifOpen}
                  onClose={() => setIsNotifOpen(false)}
                  onMarkAllAsRead={() => {
                    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
                  }}
                />
              </div>

              {/* VIP Status Badge */}
              <button
                onClick={() => {
                  sounds.playClick();
                  setIsVIPModalOpen(true);
                }}
                className="shrink-0 inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-1.5 rounded-xl border border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-xs font-semibold tracking-tight transition-all cursor-pointer whitespace-nowrap"
                title="Verify Sovereign Pass #0042 [VIP]"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>Pass #0042 [VIP]</span>
              </button>

              {/* Broadcast Dispatch button */}
              <button
                onClick={() => {
                  sounds.playClick();
                  setIsCreatePostOpen(true);
                }}
                className="shrink-0 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-sans font-bold text-xs tracking-tight transition-all shadow-md cursor-pointer whitespace-nowrap"
              >
                <Plus className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden sm:inline">+ New Dispatch</span>
                <span className="sm:hidden text-xs">Dispatch</span>
              </button>

              {/* Mobile & Tablet toggle for Members Roster Column (<1280px) */}
              <button
                onClick={() => {
                  sounds.playClick();
                  setIsMobileMembersOpen(!isMobileMembersOpen);
                }}
                className="xl:hidden p-2 text-zinc-400 hover:text-zinc-200 rounded-xl bg-zinc-900/60 hover:bg-zinc-900 border border-zinc-800/80 cursor-pointer shrink-0"
                aria-label="Toggle syndicate members list"
              >
                <Users className="w-4 h-4" />
              </button>
            </div>
          </header>

          {/* Context Breadcrumbs Sub-Bar */}
          <div className="border-b border-amber-900/30 bg-[#04060c]/90 px-4 sm:px-6 py-1.5 flex items-center overflow-x-auto no-scrollbar gap-1.5 text-[11px] font-mono text-zinc-400 shrink-0">
            <span className="text-zinc-600 shrink-0 font-bold">NOVA OS</span>
            <span className="text-zinc-700 shrink-0">/</span>
            <span className="text-amber-400 font-semibold shrink-0">COMMUNITY</span>
            <span className="text-zinc-700 shrink-0">/</span>
            <span className="text-zinc-200 font-semibold shrink-0 uppercase">
              {activeView === 'arena' ? 'THE ARENA' : activeChannel.name.toUpperCase()}
            </span>
            <span className="text-zinc-700 shrink-0">/</span>
            <span className="text-zinc-400 shrink-0">
              {activeView === 'arena' ? 'LEADERBOARD' : 'FEED'}
            </span>
          </div>

          {/* Content View: The Arena OR Active Channel Feed */}
          <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-5 sm:py-6 w-full">
            {activeView === 'arena' ? (
              /* ================= THE ARENA LEADERBOARD VIEW ================= */
              <TheArena
                entries={leaderboard}
                currentUser={currentUser}
                onSelectUser={(user) => setSelectedProfileUser(user)}
                onOpenDealRoom={() => setIsDealRoomOpen(true)}
                onBackToFeed={handleBackToFeed}
              />
            ) : (
              /* ================= ACTIVE CHAT / FEED VIEW ================= */
              <div className="w-full max-w-3xl mx-auto space-y-5 pb-24">
                
                {/* Channel Welcome Banner */}
                <div className="p-5 sm:p-6 rounded-2xl border border-zinc-800/80 bg-gradient-to-b from-zinc-900/80 to-[#070912] space-y-2 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl sm:text-3xl shrink-0">{activeChannel.symbol}</span>
                      <div>
                        <h3 className="font-sans text-xl sm:text-2xl font-extrabold text-zinc-100 tracking-tight uppercase">
                          {activeChannel.name}
                        </h3>
                        <p className="text-xs sm:text-sm text-zinc-400 font-normal leading-relaxed mt-0.5 max-w-xl">
                          {activeChannel.description}
                        </p>
                      </div>
                    </div>

                    {activeChannel.id === 'deal-room-closed' && (
                      <button
                        onClick={() => setIsDealRoomOpen(true)}
                        className="px-3.5 py-2 rounded-xl border border-amber-500/40 bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-sm transition-all shrink-0"
                      >
                        <Briefcase className="w-3.5 h-3.5 text-amber-400" />
                        <span>Open Deal Desk</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Interactive Quick Dispatch Bar */}
                <form
                  onSubmit={handleQuickDispatch}
                  className="p-2.5 sm:p-3 rounded-2xl border border-zinc-800/90 focus-within:border-amber-500/60 focus-within:ring-1 focus-within:ring-amber-500/20 bg-zinc-950/90 backdrop-blur-xl transition-all duration-200 flex items-center gap-2.5 sm:gap-3.5 shadow-sm group"
                >
                  <div className={`relative w-9 h-9 rounded-xl bg-gradient-to-br ${currentUser.avatarBg} border border-amber-500/50 flex items-center justify-center text-xs font-bold text-zinc-100 shrink-0 ml-0.5 shadow-sm`}>
                    {currentUser.initials}
                    <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-zinc-950" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <input
                      type="text"
                      value={quickDispatchText}
                      onChange={(e) => setQuickDispatchText(e.target.value)}
                      placeholder={`Share tactical alpha or deal intelligence with #${activeChannel.name}...`}
                      className="w-full bg-transparent text-xs sm:text-sm text-zinc-100 placeholder:text-zinc-500 font-sans focus:outline-none py-1"
                    />
                  </div>

                  <div className="flex items-center gap-2 shrink-0 pr-0.5">
                    {/* Open full dispatch modal for metrics & custom titles */}
                    <button
                      type="button"
                      onClick={() => {
                        sounds.playClick();
                        setIsCreatePostOpen(true);
                      }}
                      title="Open Full Transmission Console"
                      className="p-2 text-zinc-500 hover:text-zinc-300 rounded-xl hover:bg-zinc-900 transition-colors cursor-pointer hidden sm:flex items-center"
                    >
                      <SlidersHorizontal className="w-4 h-4" />
                    </button>

                    {/* Submit Dispatch Button (Item 3: single crisp "+ Dispatch" button) */}
                    <button
                      type="submit"
                      disabled={!quickDispatchText.trim()}
                      className={`font-sans font-bold text-xs px-4 py-2 rounded-xl transition-all duration-150 flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                        quickDispatchText.trim()
                          ? 'bg-amber-500 hover:bg-amber-400 text-black shadow-[0_0_20px_rgba(245,158,11,0.35)] hover:scale-[1.02]'
                          : 'bg-amber-500/20 text-amber-300/60 border border-amber-500/30 opacity-70 cursor-not-allowed'
                      }`}
                    >
                      <Plus className="w-3.5 h-3.5 shrink-0" />
                      <span>+ Dispatch</span>
                    </button>
                  </div>
                </form>

                {/* Feed Messages List */}
                <div className="space-y-4">
                  {currentMessages.length > 0 ? (
                    currentMessages.map((message) => (
                      <FeedMessage
                        key={message.id}
                        message={message}
                        currentUser={currentUser}
                        onOpenProfile={(user) => setSelectedProfileUser(user)}
                        onBoost={handleBoostMessage}
                      />
                    ))
                  ) : (
                    <div className="py-16 text-center space-y-3 rounded-2xl border border-dashed border-zinc-900">
                      <Sparkles className="w-8 h-8 text-zinc-600 mx-auto" />
                      <div className="text-sm font-semibold text-zinc-300">
                        No dispatches found
                      </div>
                      <p className="text-xs text-zinc-500 max-w-xs mx-auto">
                        {chatSearch
                          ? 'Try clearing your search query.'
                          : 'Be the first Sovereign member to initiate intelligence in this room.'}
                      </p>
                      <button
                        onClick={() => {
                          sounds.playClick();
                          setIsCreatePostOpen(true);
                        }}
                        className="px-4 py-2 bg-zinc-900 border border-zinc-800 text-zinc-200 text-xs font-mono rounded-lg hover:border-amber-500/40 cursor-pointer"
                      >
                        Broadcast First Dispatch
                      </button>
                    </div>
                  )}
                </div>

              </div>
            )}
          </div>

        </main>

        {/* ========================================================================= */}
        {/* COLUMN 3: Active Members List (Collapsible on <1280px)                    */}
        {/* ========================================================================= */}
        <aside
          className={`fixed inset-y-0 right-0 z-40 w-[280px] bg-[#070912] border-l border-zinc-800/80 flex flex-col transition-transform duration-300 ease-in-out xl:static xl:translate-x-0 ${
            isMobileMembersOpen ? 'translate-x-0 shadow-2xl' : 'translate-x-full'
          }`}
        >
          {/* Header */}
          <div className="h-16 px-5 border-b border-zinc-800/80 flex items-center justify-between shrink-0 bg-black/30">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-amber-400" />
              <span className="font-sans text-xs font-bold tracking-wider text-zinc-100">
                SYNDICATE ROSTER
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-400 font-medium">
                {members.length} VERIFIED
              </span>
              <button
                onClick={() => setIsMobileMembersOpen(false)}
                className="xl:hidden p-1 text-zinc-400 hover:text-zinc-200 cursor-pointer rounded-lg hover:bg-zinc-900"
                aria-label="Close syndicate roster"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Member Groups Scroll */}
          <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
            
            {/* Group 1: The Board */}
            <div className="space-y-1.5">
              <div className="px-2 text-xs font-semibold uppercase tracking-wider text-amber-400/90 flex items-center justify-between">
                <span>The Board ({boardMembers.length})</span>
                <span className="text-xs text-amber-400/80 font-medium">
                  Tier-1
                </span>
              </div>

              <div className="space-y-1">
                {boardMembers.map((member) => (
                  <div
                    key={member.id}
                    onClick={() => {
                      sounds.playClick();
                      setSelectedProfileUser(member);
                    }}
                    className="group flex items-center gap-3 p-2 rounded-xl hover:bg-zinc-900/70 border border-transparent hover:border-amber-500/30 transition-all cursor-pointer"
                  >
                    <div className="relative shrink-0">
                      <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${member.avatarBg} border border-amber-400/50 flex items-center justify-center text-xs font-semibold text-zinc-100 shadow-sm group-hover:scale-105 transition-transform`}>
                        {member.initials}
                      </div>
                      {member.status === 'online' && (
                        <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-zinc-950" />
                      )}
                      {member.status === 'in-deal-room' && (
                        <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-amber-400 ring-2 ring-zinc-950" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-zinc-200 group-hover:text-amber-300 transition-colors truncate">
                          {member.name}
                        </span>
                      </div>
                      <div className="text-xs text-zinc-400 truncate">
                        {member.status === 'in-deal-room' ? 'In Deal Room' : member.roleTitle}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Group 2: Architects */}
            <div className="space-y-1.5">
              <div className="px-2 text-xs font-semibold uppercase tracking-wider text-zinc-400 flex items-center justify-between">
                <span>Architects ({architectMembers.length})</span>
              </div>

              <div className="space-y-1">
                {architectMembers.map((member) => (
                  <div
                    key={member.id}
                    onClick={() => {
                      sounds.playClick();
                      setSelectedProfileUser(member);
                    }}
                    className="group flex items-center gap-3 p-2 rounded-xl hover:bg-zinc-900/50 border border-transparent hover:border-zinc-800 transition-all cursor-pointer"
                  >
                    <div className="relative shrink-0">
                      <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${member.avatarBg} border border-zinc-700/60 flex items-center justify-center text-xs font-semibold text-zinc-300 group-hover:scale-105 transition-transform`}>
                        {member.initials}
                      </div>
                      {member.status === 'online' && (
                        <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-zinc-950" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-semibold text-zinc-300 group-hover:text-zinc-100 transition-colors truncate">
                        {member.name}
                      </div>
                      <div className="text-xs text-zinc-400 truncate">
                        {member.roleTitle}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Group 3: Members */}
            <div className="space-y-1.5">
              <div className="px-2 text-xs font-semibold uppercase tracking-wider text-zinc-400 flex items-center justify-between">
                <span>Members ({regularMembers.length})</span>
              </div>

              <div className="space-y-1">
                {regularMembers.slice(0, 15).map((member) => (
                  <div
                    key={member.id}
                    onClick={() => {
                      sounds.playClick();
                      setSelectedProfileUser(member);
                    }}
                    className="group flex items-center gap-3 p-2 rounded-xl hover:bg-zinc-900/40 border border-transparent hover:border-zinc-800 transition-all cursor-pointer"
                  >
                    <div className="relative shrink-0">
                      <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${member.avatarBg} border border-zinc-800 flex items-center justify-center text-xs font-semibold text-zinc-400`}>
                        {member.initials}
                      </div>
                      {member.status === 'online' && (
                        <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-zinc-950" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-medium text-zinc-400 group-hover:text-zinc-200 transition-colors truncate">
                        {member.name}
                      </div>
                      <div className="text-xs text-zinc-400 truncate">
                        {member.roleTitle}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Column 3 Footer: Syndicate Status */}
          <div className="p-3.5 border-t border-zinc-800/80 bg-black/40 shrink-0 text-xs text-zinc-400 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              Syndicate Connected
            </span>
            <span className="text-zinc-500 font-mono text-xs">Node #42</span>
          </div>
        </aside>

        {/* Backdrop overlay for mobile & tablet members drawer */}
        {isMobileMembersOpen && (
          <div
            onClick={() => setIsMobileMembersOpen(false)}
            className="fixed inset-0 z-30 bg-black/75 backdrop-blur-sm xl:hidden animate-in fade-in duration-200"
          />
        )}

      </div>

      {/* ========================================================================= */}
      {/* MODALS & OVERLAYS                                                         */}
      {/* ========================================================================= */}
      
      {/* VIP Access Modal (Web3 / Supabase Verification) */}
      <VIPAccessModal
        isOpen={isVIPModalOpen}
        onClose={() => setIsVIPModalOpen(false)}
        onVerifySuccess={handleVerifySuccess}
        currentUser={currentUser}
      />

      {/* Token-Gate Modal (Requirement 3: Locked Channels) */}
      <TokenGateModal
        isOpen={isTokenGateOpen}
        channel={tokenGatedChannel}
        onClose={() => setIsTokenGateOpen(false)}
        onUnlockSuccess={handleTokenGateUnlock}
      />

      {/* Member Profile Dossier Modal */}
      <MemberProfileModal
        user={selectedProfileUser}
        onClose={() => setSelectedProfileUser(null)}
        currentUser={currentUser}
        onSendDirectMessage={(user, text) => {
          sounds.playChime();
        }}
      />

      {/* Create New Post Dispatch Modal (Requirement 2) */}
      <CreatePostModal
        isOpen={isCreatePostOpen}
        onClose={() => setIsCreatePostOpen(false)}
        activeChannel={activeChannel}
        availableChannels={MOCK_CHANNELS}
        currentUser={currentUser}
        onPostCreated={handleCreatePost}
      />

      {/* OTC Escrow Deal Room Modal */}
      <DealRoomModal
        isOpen={isDealRoomOpen}
        onClose={() => setIsDealRoomOpen(false)}
        deals={deals}
        currentUser={currentUser}
        onCommitAllocation={handleCommitAllocation}
      />

      {/* Interactive Ecosystem Quest */}
      <NovaOnboardingQuest />

      {/* Universal ⌘K Command Surface */}
      <NovaCommandSurface
        isOpen={isCommandOpen}
        onClose={() => setIsCommandOpen(false)}
        currentEnvironment="community"
      />

    </div>
  );
}
