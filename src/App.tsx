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
import { NovaIdentityControl } from './nova-os/NovaIdentityControl';

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
    <div className="flex flex-col h-screen w-full bg-[#080a0f] text-slate-100 overflow-hidden font-sans select-none antialiased">
      
      {/* Main App Container */}
      <div className="flex-1 flex overflow-hidden relative">

        {/* ========================================================================= */}
        {/* COLUMN 1: Channels List (Discord-Inspired Sleek Navigation)              */}
        {/* ========================================================================= */}
        <aside
          className={`fixed inset-y-0 left-0 z-40 w-[260px] bg-[#0b0e14] border-r border-white/[0.06] flex flex-col transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
            isMobileNavOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
          }`}
        >
          {/* Syndicate Wordmark & Header */}
          <div className="h-14 px-4 border-b border-white/[0.06] flex items-center justify-between shrink-0 bg-[#090b10]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full p-[1px] bg-gradient-to-tr from-cyan-500/80 to-blue-500/40">
                <img src="/nova-logo.jpg" alt="NOVA Logo" className="w-full h-full object-cover rounded-full" />
              </div>
              <div>
                <div className="font-sans text-sm font-bold tracking-tight text-white flex items-center gap-1.5">
                  <span>NOVA</span>
                  <span className="text-[10px] text-cyan-400 font-mono font-medium px-1 py-0.2 rounded bg-cyan-400/10">COMMUNITY</span>
                </div>
              </div>
            </div>

            {/* Close drawer on mobile */}
            <button
              onClick={() => setIsMobileNavOpen(false)}
              className="lg:hidden p-1.5 text-zinc-400 hover:text-white cursor-pointer rounded-lg hover:bg-zinc-800"
              aria-label="Close navigation"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Channels Navigation Scroll */}
          <div className="flex-1 overflow-y-auto px-2.5 py-3 space-y-5">
            
            {/* Quick Nav: The Arena Highlight Button */}
            <div>
              <button
                onClick={handleOpenArena}
                className={`w-full group flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeView === 'arena'
                    ? 'bg-cyan-400/15 text-cyan-300 border border-cyan-500/30 shadow-sm'
                    : 'bg-white/[0.03] hover:bg-white/[0.06] border border-transparent text-zinc-300 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Trophy className={`w-3.5 h-3.5 ${activeView === 'arena' ? 'text-cyan-400' : 'text-zinc-400 group-hover:text-cyan-400'}`} />
                  <span className="tracking-wide">THE ARENA</span>
                </div>
                <span className="text-[10px] font-medium px-1.5 py-0.2 rounded bg-cyan-400/10 text-cyan-400">
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
                <div key={category} className="space-y-1">
                  <div className="px-2 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                    {category}
                  </div>

                  <div className="space-y-0.5 pt-0.5">
                    {channelGroup.map((channel) => {
                      const isActive = activeView === 'feed' && activeChannelId === channel.id;
                      const isLocked = channel.isRestricted && !unlockedChannels.includes(channel.id);

                      return (
                        <button
                          key={channel.id}
                          onClick={() => handleSelectChannel(channel)}
                          className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-all text-left cursor-pointer group ${
                            isActive
                              ? 'bg-white/[0.08] text-white font-semibold'
                              : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.03]'
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <span className="text-zinc-500 group-hover:text-zinc-400 text-sm shrink-0">#</span>
                            <span className="truncate">{channel.name}</span>
                          </div>

                          {channel.unreadCount ? (
                            <span className="shrink-0 text-[10px] px-1.5 py-0.2 rounded-full bg-cyan-500/20 text-cyan-300 font-semibold">
                              {channel.unreadCount}
                            </span>
                          ) : isLocked ? (
                            <Lock className="w-3 h-3 text-zinc-500 shrink-0" />
                          ) : null}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Column 1 Footer: Compact Discord-Style User Bar */}
          <div className="p-2 border-t border-white/[0.06] bg-[#090b10] shrink-0">
            <div
              onClick={() => {
                sounds.playClick();
                setSelectedProfileUser(currentUser);
              }}
              className="flex items-center justify-between p-1.5 rounded-lg hover:bg-white/[0.04] transition-all cursor-pointer"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className={`relative w-8 h-8 rounded-full bg-gradient-to-br ${currentUser.avatarBg} border border-cyan-400/40 flex items-center justify-center text-xs font-bold text-white shrink-0`}>
                  {currentUser.initials}
                  <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-[#090b10]" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-white truncate">
                    {currentUser.name}
                  </div>
                  <div className="text-[10px] text-zinc-500 truncate">
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
                title="Protocol Card / Sovereign Pass"
                className="p-1.5 text-zinc-400 hover:text-cyan-300 rounded hover:bg-white/[0.06] transition-all cursor-pointer shrink-0"
              >
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
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
        {/* COLUMN 2: Middle Chat Stream / The Arena (Discord-Style Canvas)           */}
        {/* ========================================================================= */}
        <main className="flex-1 flex flex-col min-w-0 bg-[#080a0f] overflow-hidden relative w-full">
          
          {/* Channel Top Bar */}
          <header className="h-14 px-4 border-b border-white/[0.06] bg-[#0b0e14]/90 backdrop-blur-md flex items-center justify-between shrink-0 z-20 gap-3">
            
            {/* Left: Channel Title & Info */}
            <div className="flex items-center gap-2.5 min-w-0">
              <button
                onClick={() => setIsMobileNavOpen(true)}
                className="lg:hidden p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 cursor-pointer shrink-0"
                aria-label="Open channels"
              >
                <Menu className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2 min-w-0">
                <span className="text-zinc-500 text-base shrink-0">
                  {activeView === 'arena' ? '⚔️' : '#'}
                </span>
                <div className="flex items-baseline gap-2 min-w-0">
                  <h2 className="text-sm font-bold text-white tracking-tight truncate">
                    {activeView === 'arena' ? 'The Arena' : activeChannel.name}
                  </h2>
                  <span className="text-xs text-zinc-400 font-normal truncate hidden sm:inline">
                    {activeView === 'arena' ? 'Leaderboard & Revenue Volumes' : activeChannel.description}
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Quick Controls */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Search Bar */}
              {activeView !== 'arena' && (
                <div className="relative hidden md:block w-44 lg:w-56">
                  <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={chatSearch}
                    onChange={(e) => setChatSearch(e.target.value)}
                    placeholder="Search..."
                    className="w-full pl-8 pr-3 py-1 bg-black/40 border border-white/[0.06] rounded-md text-xs text-zinc-200 placeholder:text-zinc-400 focus:outline-none focus:border-cyan-500/40"
                  />
                </div>
              )}

              {/* Back to Feed if in Arena */}
              {activeView === 'arena' && (
                <button
                  onClick={handleBackToFeed}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/[0.05] hover:bg-white/[0.08] text-zinc-300 hover:text-white text-xs font-medium transition cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Feed</span>
                </button>
              )}

              {/* Sound Toggle */}
              <button
                onClick={handleToggleAudio}
                className="p-1.5 text-zinc-400 hover:text-zinc-200 rounded-md hover:bg-white/[0.05] transition cursor-pointer"
                title={audioEnabled ? 'Mute audio' : 'Unmute audio'}
              >
                {audioEnabled ? (
                  <Volume2 className="w-4 h-4 text-cyan-400" />
                ) : (
                  <VolumeX className="w-4 h-4 text-zinc-500" />
                )}
              </button>

              {/* Notification Center */}
              <div className="relative">
                <button
                  onClick={() => {
                    sounds.playClick();
                    setIsNotifOpen(!isNotifOpen);
                  }}
                  className="relative p-1.5 text-zinc-400 hover:text-zinc-200 rounded-md hover:bg-white/[0.05] transition cursor-pointer"
                  title="Notifications"
                >
                  <Bell className="w-4 h-4" />
                  {unreadNotifCount > 0 && (
                    <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-cyan-400 ring-2 ring-[#0b0e14]" />
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

              {/* Identity Control */}
              <NovaIdentityControl />

              {/* Toggle Members Sidebar */}
              <button
                onClick={() => {
                  sounds.playClick();
                  setIsMobileMembersOpen(!isMobileMembersOpen);
                }}
                className="p-1.5 text-zinc-400 hover:text-white rounded-md hover:bg-white/[0.05] transition cursor-pointer xl:hidden"
                aria-label="Toggle members list"
              >
                <Users className="w-4 h-4" />
              </button>
            </div>
          </header>

          {/* Main Feed / Content View */}
          <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-4">
            {activeView === 'arena' ? (
              <TheArena
                entries={leaderboard}
                currentUser={currentUser}
                onSelectUser={(user) => setSelectedProfileUser(user)}
                onOpenDealRoom={() => setIsDealRoomOpen(true)}
                onBackToFeed={handleBackToFeed}
              />
            ) : (
              <div className="max-w-4xl mx-auto space-y-3 pb-20">
                {/* Messages list */}
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
                  <div className="py-16 text-center space-y-2 text-zinc-500">
                    <Sparkles className="w-6 h-6 mx-auto text-zinc-600" />
                    <div className="text-sm font-medium text-zinc-400">No messages in this channel</div>
                    <p className="text-xs text-zinc-500">Be the first to start the conversation!</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Discord-Style Bottom Input Bar */}
          {activeView === 'feed' && (
            <div className="p-3 bg-[#080a0f] shrink-0">
              <form
                onSubmit={handleQuickDispatch}
                className="max-w-4xl mx-auto rounded-xl bg-[#0e121a] border border-white/[0.06] focus-within:border-cyan-500/40 px-3.5 py-2.5 flex items-center gap-3 transition-colors shadow-sm"
              >
                {/* Attach / Create Full Post modal trigger */}
                <button
                  type="button"
                  onClick={() => {
                    sounds.playClick();
                    setIsCreatePostOpen(true);
                  }}
                  title="Attach metric or create rich post"
                  className="p-1 text-zinc-400 hover:text-cyan-300 rounded hover:bg-white/[0.04] transition cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                </button>

                {/* Input Text */}
                <input
                  type="text"
                  value={quickDispatchText}
                  onChange={(e) => setQuickDispatchText(e.target.value)}
                  placeholder={`Message #${activeChannel.name}...`}
                  className="flex-1 bg-transparent text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none"
                />

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={!quickDispatchText.trim()}
                  className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                    quickDispatchText.trim()
                      ? 'bg-cyan-500 hover:bg-cyan-400 text-black shadow-sm'
                      : 'text-zinc-600 cursor-not-allowed opacity-50'
                  }`}
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          )}
        </main>

        {/* ========================================================================= */}
        {/* COLUMN 3: Active Members Sidebar (Discord Style)                          */}
        {/* ========================================================================= */}
        <aside
          className={`fixed inset-y-0 right-0 z-40 w-[240px] bg-[#0b0e14] border-l border-white/[0.06] flex flex-col transition-transform duration-300 ease-in-out xl:static xl:translate-x-0 ${
            isMobileMembersOpen ? 'translate-x-0 shadow-2xl' : 'translate-x-full'
          }`}
        >
          {/* Header */}
          <div className="h-14 px-4 border-b border-white/[0.06] flex items-center justify-between shrink-0 bg-[#090b10]">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Members — {members.length}
            </span>
            <button
              onClick={() => setIsMobileMembersOpen(false)}
              className="xl:hidden p-1 text-zinc-400 hover:text-white cursor-pointer rounded hover:bg-zinc-800"
              aria-label="Close roster"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Member Groups Scroll */}
          <div className="flex-1 overflow-y-auto px-2.5 py-3 space-y-4">
            
            {/* Group 1: The Board */}
            <div className="space-y-0.5">
              <div className="px-2 text-[10px] font-bold uppercase tracking-wider text-cyan-400">
                The Board — {boardMembers.length}
              </div>

              <div className="space-y-0.5 pt-1">
                {boardMembers.map((member) => (
                  <div
                    key={member.id}
                    onClick={() => {
                      sounds.playClick();
                      setSelectedProfileUser(member);
                    }}
                    className="flex items-center gap-2.5 px-2 py-1.5 rounded-md hover:bg-white/[0.04] transition cursor-pointer group"
                  >
                    <div className="relative shrink-0">
                      <div className={`w-7 h-7 rounded-full bg-gradient-to-br ${member.avatarBg} border border-cyan-400/50 flex items-center justify-center text-[10px] font-bold text-white`}>
                        {member.initials}
                      </div>
                      {member.status === 'online' && (
                        <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 ring-1 ring-[#0b0e14]" />
                      )}
                      {member.status === 'in-deal-room' && (
                        <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-cyan-400 ring-1 ring-[#0b0e14]" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-semibold text-zinc-200 group-hover:text-cyan-300 truncate">
                        {member.name}
                      </div>
                      <div className="text-[10px] text-zinc-400 truncate">
                        {member.roleTitle}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Group 2: Architects */}
            <div className="space-y-0.5">
              <div className="px-2 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                Architects — {architectMembers.length}
              </div>

              <div className="space-y-0.5 pt-1">
                {architectMembers.map((member) => (
                  <div
                    key={member.id}
                    onClick={() => {
                      sounds.playClick();
                      setSelectedProfileUser(member);
                    }}
                    className="flex items-center gap-2.5 px-2 py-1.5 rounded-md hover:bg-white/[0.04] transition cursor-pointer group"
                  >
                    <div className="relative shrink-0">
                      <div className={`w-7 h-7 rounded-full bg-gradient-to-br ${member.avatarBg} border border-zinc-700 flex items-center justify-center text-[10px] font-bold text-zinc-300`}>
                        {member.initials}
                      </div>
                      {member.status === 'online' && (
                        <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 ring-1 ring-[#0b0e14]" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-medium text-zinc-300 group-hover:text-white truncate">
                        {member.name}
                      </div>
                      <div className="text-[10px] text-zinc-400 truncate">
                        {member.roleTitle}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Group 3: Members */}
            <div className="space-y-0.5">
              <div className="px-2 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                Members — {regularMembers.length}
              </div>

              <div className="space-y-0.5 pt-1">
                {regularMembers.slice(0, 15).map((member) => (
                  <div
                    key={member.id}
                    onClick={() => {
                      sounds.playClick();
                      setSelectedProfileUser(member);
                    }}
                    className="flex items-center gap-2.5 px-2 py-1.5 rounded-md hover:bg-white/[0.03] transition cursor-pointer group"
                  >
                    <div className="relative shrink-0">
                      <div className={`w-7 h-7 rounded-full bg-gradient-to-br ${member.avatarBg} border border-zinc-800 flex items-center justify-center text-[10px] font-semibold text-zinc-400`}>
                        {member.initials}
                      </div>
                      {member.status === 'online' && (
                        <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 ring-1 ring-[#0b0e14]" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="text-xs text-zinc-400 group-hover:text-zinc-200 truncate">
                        {member.name}
                      </div>
                      <div className="text-[10px] text-zinc-400 truncate">
                        {member.roleTitle}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </aside>

        {/* Backdrop overlay for mobile members drawer */}
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
