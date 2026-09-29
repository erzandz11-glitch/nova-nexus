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
  Briefcase,
  Send,
  Zap,
  CheckCircle2,
  Share2
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

  // Interactive Quick Dispatch input state
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
        sender: '0x' + Math.random().toString(16).substring(2, 6).toUpperCase() + '...Nova',
        recipient: 'OTC Escrow Pool',
        dealType: randomType,
        txHash: randomHash,
        nodeLocation: randomNode,
        status: 'Settled',
      };

      setTransactions((prev) => [newTx, ...prev.slice(0, 19)]);
    }, 12000);

    return () => clearInterval(interval);
  }, []);

  // Filter messages by channel & search
  const currentMessages = useMemo(() => {
    const channelMsgs = messages[activeChannelId] || [];
    if (!chatSearch.trim()) return channelMsgs;
    return channelMsgs.filter(
      (m) =>
        m.content.toLowerCase().includes(chatSearch.toLowerCase()) ||
        (m.title && m.title.toLowerCase().includes(chatSearch.toLowerCase())) ||
        m.author.name.toLowerCase().includes(chatSearch.toLowerCase())
    );
  }, [messages, activeChannelId, chatSearch]);

  // Roster groupings for the Right Sidebar
  const boardMembers = useMemo(() => members.filter((m) => m.rank === 'The Board'), [members]);
  const architectMembers = useMemo(() => members.filter((m) => m.rank === 'Architects'), [members]);
  const regularMembers = useMemo(() => members.filter((m) => m.rank === 'Members'), [members]);

  // Switch channel handler
  const handleSelectChannel = (channel: Channel) => {
    sounds.playClick();
    if (channel.isRestricted && !unlockedChannels.includes(channel.id)) {
      setTokenGatedChannel(channel);
      setIsTokenGateOpen(true);
      return;
    }
    setActiveChannelId(channel.id);
    setActiveView('feed');
    setIsMobileNavOpen(false);
  };

  // Open Arena View
  const handleOpenArena = () => {
    sounds.playClick();
    setActiveView('arena');
    setIsMobileNavOpen(false);
  };

  // Back to Feed handler
  const handleBackToFeed = () => {
    sounds.playClick();
    setActiveView('feed');
  };

  // Toggle audio
  const handleToggleAudio = () => {
    const state = sounds.toggleSound();
    setAudioEnabled(state);
  };

  // Add new dispatch post
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

    if (targetChannelId !== activeChannelId) {
      setActiveChannelId(targetChannelId);
    }
    setActiveView('feed');

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

    if (isSupabaseConfigured) {
      supabaseService.sendDispatch(newMsg);
    }
  };

  // Quick Dispatch Form Submission
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
    <div className="flex flex-col h-screen w-full bg-[#06080e] text-slate-100 overflow-hidden font-sans select-none antialiased">
      
      {/* Live Cyber Syndicate Escrow Ticker */}
      <EscrowTicker 
        transactions={transactions} 
        onOpenDealRoom={() => setIsDealRoomOpen(true)} 
      />

      {/* Main App Container */}
      <div className="flex-1 flex overflow-hidden relative">

        {/* ========================================================================= */}
        {/* COLUMN 1: Channels & Syndicate Hub                                        */}
        {/* ========================================================================= */}
        <aside
          className={`fixed inset-y-0 left-0 z-40 w-[280px] bg-[#090d16] border-r border-cyan-500/15 flex flex-col transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
            isMobileNavOpen ? 'translate-x-0 shadow-[0_0_50px_rgba(0,0,0,0.8)]' : '-translate-x-full'
          }`}
        >
          {/* Syndicate Wordmark & Header */}
          <div className="h-16 px-4 border-b border-cyan-500/15 flex items-center justify-between shrink-0 bg-[#070a10]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full p-[1.5px] bg-gradient-to-tr from-cyan-400 via-sky-500 to-indigo-500 shadow-[0_0_15px_rgba(6,182,212,0.35)]">
                <img src="/nova-logo.jpg" alt="NOVA Logo" className="w-full h-full object-cover rounded-full" />
              </div>
              <div>
                <div className="font-sans text-sm font-extrabold tracking-tight text-white flex items-center gap-1.5">
                  <span>NOVA</span>
                  <span className="text-[10px] text-cyan-400 font-mono font-semibold px-1.5 py-0.5 rounded bg-cyan-400/10 border border-cyan-500/20">
                    SYNDICATE
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 font-medium">Private Creator Guild</div>
              </div>
            </div>

            {/* Close drawer on mobile */}
            <button
              onClick={() => setIsMobileNavOpen(false)}
              className="lg:hidden p-1.5 text-slate-400 hover:text-white cursor-pointer rounded-lg hover:bg-slate-800/60"
              aria-label="Close navigation"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Channels Navigation Scroll */}
          <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 scrollbar-thin">
            
            {/* Quick Nav: The Arena Highlight Button */}
            <div>
              <button
                onClick={handleOpenArena}
                className={`w-full group relative flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all cursor-pointer ${
                  activeView === 'arena'
                    ? 'bg-gradient-to-r from-cyan-500/25 via-cyan-500/15 to-transparent border border-cyan-400/50 text-cyan-300 shadow-[0_0_20px_rgba(6,182,212,0.25)]'
                    : 'bg-slate-900/60 hover:bg-slate-850 border border-slate-800/80 hover:border-cyan-500/30 text-slate-300 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Trophy className={`w-4 h-4 ${activeView === 'arena' ? 'text-cyan-400' : 'text-slate-400 group-hover:text-cyan-400'}`} />
                  <span className="font-sans text-xs font-bold tracking-wider">THE ARENA</span>
                </div>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-cyan-400/10 text-cyan-300 border border-cyan-500/20">
                  LIVE PODIUM
                </span>
              </button>
            </div>

            {/* Categories and Channels */}
            {(['Syndicate Core', 'Alpha & Intelligence', 'High-Ticket War Room'] as const).map((category) => {
              const channelGroup = MOCK_CHANNELS.filter(
                (c) => c.category === category && c.id !== 'arena-overview'
              );

              return (
                <div key={category} className="space-y-1.5">
                  <div className="px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                    <span>{category}</span>
                  </div>

                  <div className="space-y-1 pt-0.5">
                    {channelGroup.map((channel) => {
                      const isActive = activeView === 'feed' && activeChannelId === channel.id;
                      const isLocked = channel.isRestricted && !unlockedChannels.includes(channel.id);

                      return (
                        <button
                          key={channel.id}
                          onClick={() => handleSelectChannel(channel)}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all text-left cursor-pointer group ${
                            isActive
                              ? 'bg-cyan-500/15 text-cyan-200 border border-cyan-500/30 font-semibold shadow-[0_0_15px_rgba(6,182,212,0.15)]'
                              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50 border border-transparent'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 truncate">
                            <span className="text-sm shrink-0">{channel.symbol}</span>
                            <span className="truncate">{channel.name}</span>
                          </div>

                          {channel.unreadCount ? (
                            <span className="shrink-0 text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-semibold">
                              {channel.unreadCount}
                            </span>
                          ) : isLocked ? (
                            <div className="flex items-center gap-1 text-[10px] text-cyan-400 font-semibold px-1.5 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20">
                              <Lock className="w-3 h-3" />
                              <span>VIP</span>
                            </div>
                          ) : null}
                        </button>
                      );
                    })}
                  </div>

                  {/* Direct Transmissions bridge inside sidebar */}
                  {category === 'Alpha & Intelligence' && (
                    <div className="pt-2 px-1 space-y-2">
                      <div className="px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                        <span className="flex items-center gap-1.5 text-cyan-400">
                          <Radio className="w-3 h-3 text-cyan-400 animate-pulse" />
                          DIRECT BRIDGES
                        </span>
                        <span className="text-[10px] text-emerald-400 font-mono font-medium">LIVE</span>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <a
                          href="https://t.me/novasyndicate"
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => sounds.playClick()}
                          className="flex flex-col p-2 rounded-xl bg-slate-900/60 hover:bg-slate-850 border border-slate-800 hover:border-cyan-500/40 transition group"
                        >
                          <div className="flex items-center justify-between text-slate-400 group-hover:text-cyan-300 mb-1">
                            <TelegramIcon className="w-4 h-4 fill-current" />
                            <ExternalLink className="w-3 h-3 opacity-60" />
                          </div>
                          <span className="text-[11px] font-semibold text-white">Telegram</span>
                          <span className="text-[9px] text-slate-400">Signals</span>
                        </a>

                        <a
                          href="https://discord.gg/novasyndicate"
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => sounds.playClick()}
                          className="flex flex-col p-2 rounded-xl bg-slate-900/60 hover:bg-slate-850 border border-slate-800 hover:border-cyan-500/40 transition group"
                        >
                          <div className="flex items-center justify-between text-slate-400 group-hover:text-cyan-300 mb-1">
                            <DiscordIcon className="w-4 h-4 fill-current" />
                            <ExternalLink className="w-3 h-3 opacity-60" />
                          </div>
                          <span className="text-[11px] font-semibold text-white">Discord</span>
                          <span className="text-[9px] text-slate-400">Voice Arena</span>
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Column 1 Footer: Sovereign User Dossier */}
          <div className="p-3 border-t border-cyan-500/15 bg-[#070a10] shrink-0">
            <div
              onClick={() => {
                sounds.playClick();
                setSelectedProfileUser(currentUser);
              }}
              className="flex items-center justify-between p-2 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-cyan-500/40 transition-all cursor-pointer"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className={`relative w-8 h-8 rounded-full bg-gradient-to-br ${currentUser.avatarBg} border border-cyan-400/50 flex items-center justify-center text-xs font-bold text-white shrink-0 shadow-sm`}>
                  {currentUser.initials}
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-[#070a10]" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-white truncate flex items-center gap-1">
                    {currentUser.name}
                  </div>
                  <div className="text-[10px] text-cyan-400/80 font-mono truncate">
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
                title="Sovereign Pass Verification"
                className="p-1.5 text-cyan-400 hover:text-cyan-300 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 transition cursor-pointer shrink-0"
              >
                <ShieldCheck className="w-4 h-4" />
              </button>
            </div>
          </div>
        </aside>

        {/* Backdrop overlay for mobile */}
        {isMobileNavOpen && (
          <div
            onClick={() => setIsMobileNavOpen(false)}
            className="fixed inset-0 z-30 bg-black/80 backdrop-blur-sm lg:hidden"
          />
        )}

        {/* ========================================================================= */}
        {/* COLUMN 2: Middle Cyber Syndicate Canvas                                   */}
        {/* ========================================================================= */}
        <main className="flex-1 flex flex-col min-w-0 bg-[#06080e] overflow-hidden relative w-full">
          
          {/* Header Bar */}
          <header className="h-16 px-4 sm:px-6 border-b border-cyan-500/15 bg-[#090d16]/90 backdrop-blur-md flex items-center justify-between shrink-0 z-20 gap-3">
            
            {/* Left: Channel Info */}
            <div className="flex items-center gap-3 min-w-0">
              <button
                onClick={() => setIsMobileNavOpen(true)}
                className="lg:hidden p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer shrink-0"
                aria-label="Open channels"
              >
                <Menu className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2.5 min-w-0">
                <span className="text-xl shrink-0">
                  {activeView === 'arena' ? '⚔️' : activeChannel.symbol}
                </span>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-bold text-white tracking-tight truncate">
                      {activeView === 'arena' ? 'The Sovereign Arena' : activeChannel.name}
                    </h2>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 shrink-0 hidden sm:inline">
                      {activeView === 'arena' ? 'LEADERBOARD' : 'ACTIVE CHANNEL'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 truncate hidden md:block">
                    {activeView === 'arena' ? 'Verified creator revenue leaderboards & high-ticket OTC deal tranches.' : activeChannel.description}
                  </p>
                </div>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Search Bar */}
              {activeView !== 'arena' && (
                <div className="relative hidden md:block w-48 lg:w-60">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={chatSearch}
                    onChange={(e) => setChatSearch(e.target.value)}
                    placeholder="Search alpha & members..."
                    className="w-full pl-9 pr-3 py-1.5 bg-slate-900/80 border border-slate-800 hover:border-cyan-500/30 focus:border-cyan-400 rounded-xl text-xs text-slate-100 placeholder:text-slate-400 focus:outline-none transition shadow-inner"
                  />
                </div>
              )}

              {/* Back to Feed Button if in Arena */}
              {activeView === 'arena' && (
                <button
                  onClick={handleBackToFeed}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-300 text-xs font-semibold transition cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Return to Feed</span>
                </button>
              )}

              {/* Sound Toggle */}
              <button
                onClick={handleToggleAudio}
                className="p-2 text-slate-400 hover:text-cyan-300 rounded-xl bg-slate-900/60 hover:bg-slate-850 border border-slate-800 transition cursor-pointer"
                title={audioEnabled ? 'Mute Audio' : 'Enable Audio'}
              >
                {audioEnabled ? (
                  <Volume2 className="w-4 h-4 text-cyan-400" />
                ) : (
                  <VolumeX className="w-4 h-4 text-slate-500" />
                )}
              </button>

              {/* Notification Center */}
              <div className="relative">
                <button
                  onClick={() => {
                    sounds.playClick();
                    setIsNotifOpen(!isNotifOpen);
                  }}
                  className="relative p-2 text-slate-400 hover:text-cyan-300 rounded-xl bg-slate-900/60 hover:bg-slate-850 border border-slate-800 transition cursor-pointer"
                  title="Syndicate Notifications"
                >
                  <Bell className="w-4 h-4" />
                  {unreadNotifCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
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

              {/* Mobile Members Toggle */}
              <button
                onClick={() => {
                  sounds.playClick();
                  setIsMobileMembersOpen(!isMobileMembersOpen);
                }}
                className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-900/60 hover:bg-slate-850 border border-slate-800 transition cursor-pointer xl:hidden"
                aria-label="Toggle syndicate members"
              >
                <Users className="w-4 h-4" />
              </button>
            </div>
          </header>

          {/* Main Feed View Area */}
          <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 space-y-5 scrollbar-thin">
            {activeView === 'arena' ? (
              <TheArena
                entries={leaderboard}
                currentUser={currentUser}
                onSelectUser={(user) => setSelectedProfileUser(user)}
                onOpenDealRoom={() => setIsDealRoomOpen(true)}
                onBackToFeed={handleBackToFeed}
              />
            ) : (
              <div className="max-w-4xl mx-auto space-y-5 pb-16">
                
                {/* Interactive Quick Dispatch Card at the top of the feed */}
                <div className="rounded-2xl bg-gradient-to-b from-[#0e1422] to-[#0a0e18] border border-cyan-500/25 p-4 shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
                  <form onSubmit={handleQuickDispatch} className="space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
                      <div className="flex items-center gap-2 text-xs font-bold text-cyan-300 tracking-wide uppercase">
                        <Zap className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Dispatch Alpha to #{activeChannel.name}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          sounds.playClick();
                          setIsCreatePostOpen(true);
                        }}
                        className="text-[11px] font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer transition"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Rich Dispatch Editor</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${currentUser.avatarBg} border border-cyan-400/40 flex items-center justify-center text-xs font-bold text-white shrink-0`}>
                        {currentUser.initials}
                      </div>
                      <input
                        type="text"
                        value={quickDispatchText}
                        onChange={(e) => setQuickDispatchText(e.target.value)}
                        placeholder={`Share confidential alpha, metrics, or insights with #${activeChannel.name}...`}
                        className="flex-1 bg-slate-900/80 border border-slate-800 hover:border-slate-700 focus:border-cyan-400 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none transition shadow-inner"
                      />
                      <button
                        type="submit"
                        disabled={!quickDispatchText.trim()}
                        className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                          quickDispatchText.trim()
                            ? 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                            : 'bg-slate-800 text-slate-500 opacity-50 cursor-not-allowed'
                        }`}
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Broadcast</span>
                      </button>
                    </div>
                  </form>
                </div>

                {/* Messages Feed Stream */}
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
                  <div className="py-20 text-center space-y-3 rounded-2xl bg-slate-900/30 border border-slate-800/80">
                    <Sparkles className="w-8 h-8 mx-auto text-cyan-400/60" />
                    <div className="text-sm font-bold text-white">No active transmissions in this channel</div>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto">
                      Be the first to broadcast a high-signal dispatch or market intelligence.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>

        {/* ========================================================================= */}
        {/* COLUMN 3: Active Syndicate Members                                        */}
        {/* ========================================================================= */}
        <aside
          className={`fixed inset-y-0 right-0 z-40 w-[260px] bg-[#090d16] border-l border-cyan-500/15 flex flex-col transition-transform duration-300 ease-in-out xl:static xl:translate-x-0 ${
            isMobileMembersOpen ? 'translate-x-0 shadow-[0_0_50px_rgba(0,0,0,0.8)]' : 'translate-x-full'
          }`}
        >
          {/* Header */}
          <div className="h-16 px-4 border-b border-cyan-500/15 flex items-center justify-between shrink-0 bg-[#070a10]">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                Syndicate Roster ({members.length})
              </span>
            </div>
            <button
              onClick={() => setIsMobileMembersOpen(false)}
              className="xl:hidden p-1.5 text-slate-400 hover:text-white cursor-pointer rounded-lg hover:bg-slate-800"
              aria-label="Close roster"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Member Groups Scroll */}
          <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5 scrollbar-thin">
            
            {/* The Board */}
            <div className="space-y-1">
              <div className="px-2 text-[10px] font-bold uppercase tracking-wider text-cyan-400 flex items-center justify-between">
                <span>The Board — {boardMembers.length}</span>
                <span className="text-[9px] font-mono text-cyan-400/70">VIP</span>
              </div>

              <div className="space-y-1 pt-1">
                {boardMembers.map((member) => (
                  <div
                    key={member.id}
                    onClick={() => {
                      sounds.playClick();
                      setSelectedProfileUser(member);
                    }}
                    className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl bg-slate-900/40 hover:bg-cyan-500/10 border border-transparent hover:border-cyan-500/30 transition cursor-pointer group"
                  >
                    <div className="relative shrink-0">
                      <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${member.avatarBg} border border-cyan-400/60 flex items-center justify-center text-[10px] font-bold text-white shadow-sm`}>
                        {member.initials}
                      </div>
                      {member.status === 'online' && (
                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-[#090d16]" />
                      )}
                      {member.status === 'in-deal-room' && (
                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-cyan-400 ring-2 ring-[#090d16]" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-semibold text-slate-100 group-hover:text-cyan-300 truncate">
                        {member.name}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">
                        {member.roleTitle}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Architects */}
            <div className="space-y-1">
              <div className="px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Architects — {architectMembers.length}
              </div>

              <div className="space-y-1 pt-1">
                {architectMembers.map((member) => (
                  <div
                    key={member.id}
                    onClick={() => {
                      sounds.playClick();
                      setSelectedProfileUser(member);
                    }}
                    className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl hover:bg-slate-900/50 transition cursor-pointer group"
                  >
                    <div className="relative shrink-0">
                      <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${member.avatarBg} border border-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-200`}>
                        {member.initials}
                      </div>
                      {member.status === 'online' && (
                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-[#090d16]" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-medium text-slate-200 group-hover:text-white truncate">
                        {member.name}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">
                        {member.roleTitle}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Regular Members */}
            <div className="space-y-1">
              <div className="px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Members — {regularMembers.length}
              </div>

              <div className="space-y-1 pt-1">
                {regularMembers.slice(0, 15).map((member) => (
                  <div
                    key={member.id}
                    onClick={() => {
                      sounds.playClick();
                      setSelectedProfileUser(member);
                    }}
                    className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl hover:bg-slate-900/40 transition cursor-pointer group"
                  >
                    <div className="relative shrink-0">
                      <div className={`w-7 h-7 rounded-full bg-gradient-to-br ${member.avatarBg} border border-slate-800 flex items-center justify-center text-[10px] font-semibold text-slate-400`}>
                        {member.initials}
                      </div>
                      {member.status === 'online' && (
                        <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-[#090d16]" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="text-xs text-slate-300 group-hover:text-slate-100 truncate">
                        {member.name}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">
                        {member.roleTitle}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </aside>

        {/* Backdrop for mobile roster */}
        {isMobileMembersOpen && (
          <div
            onClick={() => setIsMobileMembersOpen(false)}
            className="fixed inset-0 z-30 bg-black/80 backdrop-blur-sm xl:hidden"
          />
        )}

      </div>

      {/* ========================================================================= */}
      {/* MODALS & OVERLAYS                                                         */}
      {/* ========================================================================= */}
      
      {/* VIP Access Modal */}
      <VIPAccessModal
        isOpen={isVIPModalOpen}
        onClose={() => setIsVIPModalOpen(false)}
        onVerifySuccess={handleVerifySuccess}
        currentUser={currentUser}
      />

      {/* Token-Gate Modal */}
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

      {/* Create New Post Dispatch Modal */}
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
