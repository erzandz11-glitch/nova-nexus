import React, { useState, useMemo, useEffect } from 'react';
import { 
  Trophy, 
  TrendingUp, 
  ShieldCheck, 
  ArrowUpRight, 
  Search, 
  Calendar, 
  Filter, 
  Flame, 
  Briefcase, 
  DollarSign, 
  ChevronRight,
  ChevronLeft,
  Sparkles,
  ExternalLink,
  Award,
  Download,
  ArrowUpDown,
  LocateFixed,
  Zap,
  ArrowLeft
} from 'lucide-react';
import { LeaderboardEntry, User } from '../types';
import { sounds } from '../services/soundEffects';

interface TheArenaProps {
  entries: LeaderboardEntry[];
  currentUser: User;
  onSelectUser: (user: User) => void;
  onOpenDealRoom?: () => void;
  onBackToFeed?: () => void;
}

type SortField = 'rank' | 'revenue' | 'growth' | 'deals';
type SortDirection = 'asc' | 'desc';

export const TheArena: React.FC<TheArenaProps> = ({
  entries,
  currentUser,
  onSelectUser,
  onOpenDealRoom,
  onBackToFeed,
}) => {
  const [timeframe, setTimeframe] = useState<'weekly' | 'monthly' | 'season'>('weekly');
  const [selectedNiche, setSelectedNiche] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // High-performance sorting & pagination
  const [sortField, setSortField] = useState<SortField>('rank');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(15);
  const [jumpRankInput, setJumpRankInput] = useState<string>('');

  // Top 3 for the sticky podium
  const topThree = useMemo(() => {
    return [...entries].sort((a, b) => b.weeklyRevenue - a.weeklyRevenue).slice(0, 3);
  }, [entries]);

  // Current user's entry
  const currentUserEntry = useMemo(() => {
    return entries.find((e) => e.user.id === currentUser.id);
  }, [entries, currentUser.id]);

  // Filter & Sort
  const processedEntries = useMemo(() => {
    let result = entries.filter((entry) => {
      const matchesSearch =
        entry.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.user.handle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.niche.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (entry.user.walletAddress && entry.user.walletAddress.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesNiche = selectedNiche === 'All' || entry.niche === selectedNiche;
      return matchesSearch && matchesNiche;
    });

    result.sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'rank':
          comparison = a.rank - b.rank;
          break;
        case 'revenue':
          comparison = b.weeklyRevenue - a.weeklyRevenue;
          break;
        case 'growth':
          comparison = b.growthDelta - a.growthDelta;
          break;
        case 'deals':
          comparison = b.dealsClosed - a.dealsClosed;
          break;
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [entries, searchQuery, selectedNiche, sortField, sortDirection]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(processedEntries.length / pageSize));
  const paginatedEntries = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return processedEntries.slice(start, start + pageSize);
  }, [processedEntries, currentPage, pageSize]);

  // Handle Sort Change
  const handleSort = (field: SortField) => {
    sounds.playClick();
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection(field === 'rank' ? 'asc' : 'desc');
    }
    setCurrentPage(1);
  };

  // Jump to specific rank
  const handleJumpToRank = (e: React.FormEvent) => {
    e.preventDefault();
    const rankNum = parseInt(jumpRankInput.trim(), 10);
    if (!rankNum || isNaN(rankNum)) return;

    const itemIndex = processedEntries.findIndex((e) => e.rank === rankNum);
    if (itemIndex !== -1) {
      const targetPage = Math.floor(itemIndex / pageSize) + 1;
      setCurrentPage(targetPage);
      sounds.playChime();
    }
    setJumpRankInput('');
  };

  // Jump to current user's page
  const handleJumpToMyRank = () => {
    if (!currentUserEntry) return;
    sounds.playChime();
    const itemIndex = processedEntries.findIndex((e) => e.user.id === currentUser.id);
    if (itemIndex !== -1) {
      const targetPage = Math.floor(itemIndex / pageSize) + 1;
      setCurrentPage(targetPage);
    }
  };

  // Export Audited CSV
  const handleExportCSV = () => {
    sounds.playClick();
    const headers = ['Rank', 'Name', 'Handle', 'WeeklyRevenue', 'TotalVolume', 'GrowthDelta', 'DealsClosed', 'Niche', 'AuditBadge', 'WalletAddress'];
    const rows = processedEntries.map((e) => [
      e.rank,
      `"${e.user.name}"`,
      `"${e.user.handle}"`,
      e.weeklyRevenue,
      e.user.totalVolume,
      `${e.growthDelta}%`,
      e.dealsClosed,
      `"${e.niche}"`,
      `"${e.auditBadge}"`,
      `"${e.user.walletAddress || ''}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `NOVA_Sovereign_Arena_Audit_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const getRankStyle = (rank: number) => {
    switch (rank) {
      case 1:
        return {
          badge: 'text-amber-300 font-bold border border-amber-400/80 bg-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.35)] ring-1 ring-amber-400/40',
          border: 'border-amber-400/70 bg-amber-500/10 shadow-[0_0_30px_rgba(245,158,11,0.25)]',
          label: 'I · SOVEREIGN',
        };
      case 2:
        return {
          badge: 'text-zinc-100 font-bold border border-zinc-300/80 bg-zinc-400/20 shadow-[0_0_15px_rgba(228,228,231,0.25)] ring-1 ring-zinc-300/40',
          border: 'border-zinc-300/60 bg-zinc-400/10 shadow-[0_0_25px_rgba(228,228,231,0.18)]',
          label: 'II · PLATINUM',
        };
      case 3:
        return {
          badge: 'text-amber-400 font-bold border border-amber-700/80 bg-amber-800/20 shadow-[0_0_15px_rgba(217,119,6,0.25)] ring-1 ring-amber-700/40',
          border: 'border-amber-700/60 bg-amber-800/10 shadow-[0_0_25px_rgba(217,119,6,0.18)]',
          label: 'III · BRONZE',
        };
      default:
        return {
          badge: 'text-zinc-500 font-medium border border-zinc-800 bg-zinc-950',
          border: 'border-zinc-800 bg-zinc-950',
          label: `#${rank}`,
        };
    }
  };

  return (
    <div className="min-h-full pb-24 space-y-6 animate-in fade-in duration-300">
      
      {/* Return to Feed Action Bar */}
      {onBackToFeed && (
        <div className="flex items-center justify-between">
          <button
            onClick={() => {
              sounds.playClick();
              onBackToFeed();
            }}
            className="group inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-900/90 hover:bg-zinc-850 border border-zinc-700/80 hover:border-amber-500/50 text-xs font-mono text-zinc-300 hover:text-amber-300 transition-all cursor-pointer shadow-md"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-amber-400 group-hover:-translate-x-0.5 transition-transform" />
            <span>← Return to Syndicate Channel Feed</span>
          </button>

          <span className="hidden sm:inline-flex items-center gap-1.5 text-xs text-zinc-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Live Arena Consensus Protocol
          </span>
        </div>
      )}

      {/* Top Banner / Bloomberg Terminal Header */}
      <div className="relative rounded-2xl border border-zinc-800/80 bg-gradient-to-b from-zinc-900/60 to-zinc-950/90 p-6 sm:p-8 overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/[0.04] rounded-full blur-[90px] pointer-events-none" />

        <div className="relative flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-mono text-amber-400 tracking-widest uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              Sovereign Ledger · Q3 Arena Sprint
            </div>
            <h1 className="font-sans text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-100">
              THE LEADERBOARD ARENA
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-xl leading-relaxed">
              Real-time audited revenue volume from the top creators and syndicate operators globally. Scalable high-frequency escrow consensus.
            </p>
          </div>

          {/* Quick Actions & Aggregate Stats */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <div className="grid grid-cols-2 gap-3 font-mono text-left">
              <div className="p-3 rounded-xl border border-zinc-800/80 bg-black/40">
                <span className="text-xs text-zinc-400 uppercase tracking-wider block">Sprint Volume</span>
                <span className="text-base font-bold text-amber-400 tabular-nums">$9,842,000</span>
              </div>
              <div className="p-3 rounded-xl border border-zinc-800/80 bg-black/40">
                <span className="text-xs text-zinc-400 uppercase tracking-wider block">Total Audited</span>
                <span className="text-base font-bold text-zinc-200 tabular-nums">{entries.length} Creators</span>
              </div>
            </div>

            <button
              onClick={handleExportCSV}
              className="px-3.5 py-3 rounded-xl border border-zinc-800 hover:border-amber-500/40 bg-zinc-900/60 hover:bg-zinc-900 text-zinc-300 hover:text-amber-300 text-xs font-mono flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
              title="Download verified cryptographic CSV ledger"
            >
              <Download className="w-4 h-4 text-amber-400" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* STICKY TOP PODIUM: Top 3 Creators Visualizer */}
      <div className="relative pt-2">
        <div className="text-center mb-6">
          <span className="text-xs font-mono uppercase tracking-[0.2em] text-zinc-400">
            Current Cycle Apex · Top 3 Sovereign Principals
          </span>
        </div>

        {/* 3 Podium Blocks */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end max-w-4xl mx-auto">
          
          {/* Rank 2 (Platinum / Left) */}
          {topThree[1] && (
            <div
              onClick={() => {
                sounds.playClick();
                onSelectUser(topThree[1].user);
              }}
              className="group cursor-pointer order-2 md:order-1 relative rounded-2xl border border-zinc-700/60 bg-gradient-to-b from-zinc-900/90 via-zinc-950 to-black p-5 text-center transition-all duration-300 hover:border-zinc-500 hover:-translate-y-1 shadow-[0_10px_30px_rgba(0,0,0,0.6)]"
            >
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3.5 py-0.5 rounded-full border border-zinc-400/40 bg-zinc-900 font-mono text-xs font-semibold text-zinc-300 shadow">
                RANK II · PLATINUM
              </div>

              <div className="mt-2 flex flex-col items-center">
                <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${topThree[1].user.avatarBg} border-2 border-zinc-400/60 flex items-center justify-center font-mono text-base font-bold text-zinc-100 shadow-[0_0_20px_rgba(228,228,231,0.15)] group-hover:scale-105 transition-transform`}>
                  {topThree[1].user.initials}
                </div>
                <div className="mt-3 font-semibold text-sm text-zinc-100 group-hover:text-amber-300 transition-colors">
                  {topThree[1].user.name}
                </div>
                <div className="text-xs text-zinc-400 font-mono">{topThree[1].user.handle}</div>
                
                <div className="mt-4 pt-3 border-t border-zinc-900 w-full space-y-1">
                  <div className="text-xs text-zinc-400 font-mono">Weekly Audited Revenue</div>
                  <div className="text-xl font-mono font-bold text-zinc-100 tabular-nums">
                    {formatCurrency(topThree[1].weeklyRevenue)}
                  </div>
                  <div className="flex items-center justify-center gap-1 text-xs font-mono text-emerald-400">
                    <TrendingUp className="w-3.5 h-3.5" />
                    +{topThree[1].growthDelta}%
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Rank 1 (Gold / Middle - Elevated) */}
          {topThree[0] && (
            <div
              onClick={() => {
                sounds.playClick();
                onSelectUser(topThree[0].user);
              }}
              className="group cursor-pointer order-1 md:order-2 relative rounded-2xl border border-amber-500/50 bg-gradient-to-b from-amber-950/20 via-zinc-950 to-black p-6 text-center transition-all duration-300 hover:border-amber-400 hover:-translate-y-1.5 shadow-[0_15px_40px_rgba(245,158,11,0.18)]"
            >
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full border border-amber-500/70 bg-gradient-to-r from-amber-600/30 via-zinc-900 to-amber-600/30 font-mono text-xs font-bold text-amber-300 shadow-[0_0_25px_rgba(245,158,11,0.3)] flex items-center gap-1.5">
                <Trophy className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                RANK I · SOVEREIGN
              </div>

              <div className="mt-2 flex flex-col items-center">
                <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${topThree[0].user.avatarBg} border-2 border-amber-400 flex items-center justify-center font-mono text-xl font-bold text-amber-300 shadow-[0_0_30px_rgba(245,158,11,0.35)] group-hover:scale-105 transition-transform`}>
                  {topThree[0].user.initials}
                </div>
                <div className="mt-3.5 font-semibold text-base text-zinc-100 group-hover:text-amber-300 transition-colors">
                  {topThree[0].user.name}
                </div>
                <div className="text-xs text-zinc-400 font-mono">{topThree[0].user.handle}</div>
                
                <div className="mt-5 pt-3.5 border-t border-amber-500/20 w-full space-y-1">
                  <div className="text-xs text-zinc-400 font-mono">Weekly Audited Revenue</div>
                  <div className="text-2xl font-mono font-extrabold text-amber-400 tabular-nums">
                    {formatCurrency(topThree[0].weeklyRevenue)}
                  </div>
                  <div className="flex items-center justify-center gap-1 text-xs font-mono text-emerald-400">
                    <TrendingUp className="w-3.5 h-3.5" />
                    +{topThree[0].growthDelta}% sprint gain
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Rank 3 (Bronze / Right) */}
          {topThree[2] && (
            <div
              onClick={() => {
                sounds.playClick();
                onSelectUser(topThree[2].user);
              }}
              className="group cursor-pointer order-3 relative rounded-2xl border border-amber-800/40 bg-gradient-to-b from-zinc-900/90 via-zinc-950 to-black p-5 text-center transition-all duration-300 hover:border-amber-700 hover:-translate-y-1 shadow-[0_10px_30px_rgba(0,0,0,0.6)]"
            >
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3.5 py-0.5 rounded-full border border-amber-700/50 bg-zinc-900 font-mono text-xs font-semibold text-amber-500 shadow">
                RANK III · BRONZE
              </div>

              <div className="mt-2 flex flex-col items-center">
                <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${topThree[2].user.avatarBg} border-2 border-amber-700/60 flex items-center justify-center font-mono text-base font-bold text-amber-500 shadow-[0_0_20px_rgba(180,83,9,0.15)] group-hover:scale-105 transition-transform`}>
                  {topThree[2].user.initials}
                </div>
                <div className="mt-3 font-semibold text-sm text-zinc-100 group-hover:text-amber-300 transition-colors">
                  {topThree[2].user.name}
                </div>
                <div className="text-xs text-zinc-400 font-mono">{topThree[2].user.handle}</div>
                
                <div className="mt-4 pt-3 border-t border-zinc-900 w-full space-y-1">
                  <div className="text-xs text-zinc-400 font-mono">Weekly Audited Revenue</div>
                  <div className="text-xl font-mono font-bold text-amber-500/90 tabular-nums">
                    {formatCurrency(topThree[2].weeklyRevenue)}
                  </div>
                  <div className="flex items-center justify-center gap-1 text-xs font-mono text-emerald-400">
                    <TrendingUp className="w-3.5 h-3.5" />
                    +{topThree[2].growthDelta}%
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* FILTER & HIGH-PERFORMANCE CONTROLS BAR */}
      <div className="rounded-xl border border-zinc-800/80 bg-zinc-950/70 p-3 sm:p-4 space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          
          {/* Timeframe Segmented Control */}
          <div className="flex items-center gap-1 p-1 bg-zinc-900/80 rounded-lg border border-zinc-800">
            <button
              onClick={() => {
                sounds.playClick();
                setTimeframe('weekly');
              }}
              className={`px-3 py-1.5 rounded-md text-xs font-mono font-medium transition-all cursor-pointer ${
                timeframe === 'weekly'
                  ? 'bg-zinc-800 text-amber-300 shadow-sm border border-zinc-700'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Weekly Sprint
            </button>
            <button
              onClick={() => {
                sounds.playClick();
                setTimeframe('monthly');
              }}
              className={`px-3 py-1.5 rounded-md text-xs font-mono font-medium transition-all cursor-pointer ${
                timeframe === 'monthly'
                  ? 'bg-zinc-800 text-amber-300 shadow-sm border border-zinc-700'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Monthly Cycle
            </button>
            <button
              onClick={() => {
                sounds.playClick();
                setTimeframe('season');
              }}
              className={`px-3 py-1.5 rounded-md text-xs font-mono font-medium transition-all cursor-pointer ${
                timeframe === 'season'
                  ? 'bg-zinc-800 text-amber-300 shadow-sm border border-zinc-700'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Season 4 All-Time
            </button>
          </div>

          {/* Search & Jump-to-Rank form */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative min-w-[220px] flex-1 sm:flex-initial">
              <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search creator / wallet..."
                className="w-full pl-8 pr-3 py-1.5 bg-zinc-900/60 border border-zinc-800 rounded-lg text-xs font-mono text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-amber-500/40"
              />
            </div>

            {/* Direct Jump to Rank input */}
            <form onSubmit={handleJumpToRank} className="flex items-center gap-1">
              <input
                type="number"
                min="1"
                max={entries.length}
                value={jumpRankInput}
                onChange={(e) => setJumpRankInput(e.target.value)}
                placeholder="Rank #"
                className="w-18 px-2.5 py-1.5 bg-zinc-900/60 border border-zinc-800 rounded-lg text-xs font-mono text-amber-400 text-center focus:outline-none focus:border-amber-500/40"
              />
              <button
                type="submit"
                className="px-2.5 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/60 text-zinc-300 hover:text-amber-300 rounded-lg text-xs font-mono cursor-pointer"
              >
                Go
              </button>
            </form>

            {/* Jump to My Rank */}
            {currentUserEntry && (
              <button
                onClick={handleJumpToMyRank}
                className="px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/40 text-amber-300 rounded-lg text-xs font-mono flex items-center gap-1.5 cursor-pointer"
                title="Locate my standing"
              >
                <LocateFixed className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">My Rank</span> #{currentUserEntry.rank}
              </button>
            )}
          </div>
        </div>

        {/* Niche Pills & Rows per Page selector */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-zinc-900">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {['All', 'AI & Automation', 'Creator Commerce', 'Private Equity', 'SaaS & Enterprise'].map((niche) => (
              <button
                key={niche}
                onClick={() => {
                  sounds.playClick();
                  setSelectedNiche(niche);
                  setCurrentPage(1);
                }}
                className={`px-2.5 py-1 rounded text-xs font-mono whitespace-nowrap transition-colors cursor-pointer ${
                  selectedNiche === niche
                    ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                }`}
              >
                {niche}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-zinc-500">
            <span>Rows:</span>
            {[15, 25, 50].map((size) => (
              <button
                key={size}
                onClick={() => {
                  sounds.playClick();
                  setPageSize(size);
                  setCurrentPage(1);
                }}
                className={`px-2 py-0.5 rounded cursor-pointer ${
                  pageSize === size ? 'bg-zinc-800 text-amber-400 font-bold' : 'hover:text-zinc-300'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* BLOOMBERG-STYLE ENTERPRISE DATA TABLE */}
      <div className="rounded-2xl border border-zinc-800/90 bg-zinc-950/90 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-900/50 text-xs font-mono text-zinc-400 uppercase tracking-wider">
                <th
                  onClick={() => handleSort('rank')}
                  className="py-3.5 px-4 w-20 text-center cursor-pointer hover:text-amber-400 select-none"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>Rank</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3.5 px-4">Creator / Principal</th>
                <th
                  onClick={() => handleSort('revenue')}
                  className="py-3.5 px-4 text-right cursor-pointer hover:text-amber-400 select-none"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Weekly Revenue</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3.5 px-4 text-right">AI Token Gen</th>
                <th className="py-3.5 px-4 hidden md:table-cell">Member Tier</th>
                <th
                  onClick={() => handleSort('growth')}
                  className="py-3.5 px-4 text-right cursor-pointer hover:text-amber-400 select-none"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Growth Delta</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('deals')}
                  className="py-3.5 px-4 text-right hidden lg:table-cell cursor-pointer hover:text-amber-400 select-none"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Deals Closed</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3.5 px-4 hidden xl:table-cell">Primary Niche</th>
                <th className="py-3.5 px-4">Status & Escrow</th>
                <th className="py-3.5 px-4 text-center">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900/90 text-xs font-mono">
              {paginatedEntries.map((entry) => {
                const rankStyling = getRankStyle(entry.rank);
                const isCurrentUser = entry.user.id === currentUser.id;

                return (
                  <tr
                    key={entry.user.id}
                    onClick={() => {
                      sounds.playClick();
                      onSelectUser(entry.user);
                    }}
                    className={`group cursor-pointer transition-colors duration-150 ${
                      isCurrentUser
                        ? 'bg-amber-500/[0.06] hover:bg-amber-500/[0.1]'
                        : 'hover:bg-zinc-900/60'
                    }`}
                  >
                    {/* Rank */}
                    <td className="py-4 px-4 text-center">
                      <span className={`inline-block px-2.5 py-1 rounded text-xs tabular-nums font-bold ${rankStyling.badge}`}>
                        {entry.rank <= 3 ? rankStyling.label : `#${entry.rank}`}
                      </span>
                    </td>

                    {/* Creator Identity */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-lg bg-gradient-to-br ${entry.user.avatarBg} border ${
                            entry.rank === 1
                              ? 'border-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.3)]'
                              : entry.rank === 2
                              ? 'border-zinc-300 shadow-[0_0_10px_rgba(228,228,231,0.2)]'
                              : entry.rank === 3
                              ? 'border-amber-600 shadow-[0_0_10px_rgba(217,119,6,0.2)]'
                              : 'border-zinc-800'
                          } flex items-center justify-center font-mono text-xs font-semibold text-zinc-200 shrink-0`}
                        >
                          {entry.user.initials}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-zinc-100 group-hover:text-amber-300 transition-colors truncate">
                              {entry.user.name}
                            </span>
                            {isCurrentUser && (
                              <span className="text-xs text-amber-400 border border-amber-500/30 px-1.5 py-0.5 rounded font-sans">
                                You
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-zinc-400 truncate">
                            {entry.user.roleTitle}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Weekly Revenue */}
                    <td className="py-4 px-4 text-right">
                      <div className="font-bold text-zinc-100 tabular-nums text-sm group-hover:text-amber-300 transition-colors">
                        {formatCurrency(entry.weeklyRevenue)}
                      </div>
                      <div className="text-xs text-zinc-400 tabular-nums">
                        Vol: {formatCurrency(entry.user.totalVolume)}
                      </div>
                    </td>

                    {/* AI Token Generation Metric */}
                    <td className="py-4 px-4 text-right font-mono">
                      <div className="text-amber-300 font-semibold tabular-nums text-xs">
                        {entry.aiTokensMetric || '48.2M Tokens/mo'}
                      </div>
                      <div className="text-xs text-zinc-500">Autonomous Nodes</div>
                    </td>

                    {/* Member Tier */}
                    <td className="py-4 px-4 hidden md:table-cell">
                      <span className={`inline-flex items-center gap-1 text-xs font-mono px-2 py-0.5 rounded border ${
                        entry.user.tier === 'Sovereign Black Card'
                          ? 'border-amber-500/40 bg-amber-500/10 text-amber-300'
                          : entry.user.tier === 'Platinum Architect'
                          ? 'border-zinc-400/40 bg-zinc-400/10 text-zinc-200'
                          : 'border-zinc-800 bg-zinc-900 text-zinc-400'
                      }`}>
                        {entry.user.tier}
                      </span>
                    </td>

                    {/* Growth Delta */}
                    <td className="py-4 px-4 text-right">
                      <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold tabular-nums">
                        <TrendingUp className="w-3 h-3" />
                        +{entry.growthDelta}%
                      </span>
                      <div className="text-xs text-zinc-400">
                        {entry.streakWeeks}w streak
                      </div>
                    </td>

                    {/* Deals Closed */}
                    <td className="py-4 px-4 text-right hidden lg:table-cell text-zinc-300 tabular-nums">
                      {entry.dealsClosed} deals
                    </td>

                    {/* Niche */}
                    <td className="py-4 px-4 hidden xl:table-cell text-zinc-400">
                      <span>{entry.niche}</span>
                    </td>

                    {/* Verification Status */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-1.5 text-xs">
                        <ShieldCheck className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span className="text-zinc-300 font-normal">
                          {entry.auditBadge}
                        </span>
                      </div>
                      <div className="text-xs text-zinc-400 font-mono">
                        {entry.user.walletAddress || entry.statusText}
                      </div>
                    </td>

                    {/* Inspect CTA */}
                    <td className="py-4 px-4 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          sounds.playClick();
                          onSelectUser(entry.user);
                        }}
                        className="p-1.5 rounded-lg text-zinc-500 hover:text-amber-400 hover:bg-zinc-800 transition-colors cursor-pointer"
                        title="View Audited Escrow Profile"
                      >
                        <ArrowUpRight className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Table Pagination Bar */}
        <div className="py-3 px-6 bg-zinc-950 border-t border-zinc-900 flex flex-col sm:flex-row items-center justify-between text-xs font-mono text-zinc-400 gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Escrow Oracle Consensus: 100% Validated</span>
            <span className="text-zinc-700">·</span>
            <span>Showing {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, processedEntries.length)} of {processedEntries.length} Creators</span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                if (currentPage > 1) {
                  sounds.playClick();
                  setCurrentPage(currentPage - 1);
                }
              }}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-zinc-800 hover:border-zinc-700 disabled:opacity-30 disabled:hover:border-zinc-800 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="px-3 py-1 bg-zinc-900 rounded-lg text-zinc-200">
              Page {currentPage} of {totalPages}
            </span>

            <button
              onClick={() => {
                if (currentPage < totalPages) {
                  sounds.playClick();
                  setCurrentPage(currentPage + 1);
                }
              }}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-zinc-800 hover:border-zinc-700 disabled:opacity-30 disabled:hover:border-zinc-800 transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* STICKY BOTTOM USER STANDING BAR (Quick telemetry for current user) */}
      {currentUserEntry && (
        <div className="fixed bottom-3 inset-x-4 md:inset-x-auto md:left-72 md:right-8 z-20 p-3 sm:p-4 rounded-2xl bg-zinc-950/90 border border-amber-500/30 backdrop-blur-xl shadow-[0_10px_35px_rgba(0,0,0,0.8),0_0_20px_rgba(245,158,11,0.1)] flex flex-wrap items-center justify-between gap-3 animate-in slide-in-from-bottom-3 duration-300">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-semibold text-zinc-100 flex items-center gap-2">
                <span>Your Standing: Rank #{currentUserEntry.rank}</span>
                <span className="text-xs font-mono text-emerald-400">+{currentUserEntry.growthDelta}% This Sprint</span>
              </div>
              <div className="text-xs font-mono text-zinc-400">
                Weekly Revenue: <span className="text-amber-400 font-bold">{formatCurrency(currentUserEntry.weeklyRevenue)}</span> · Next Rank Target: +$91,500
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onOpenDealRoom && (
              <button
                onClick={() => {
                  sounds.playClick();
                  onOpenDealRoom();
                }}
                className="px-3.5 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-mono font-bold text-xs rounded-xl shadow-[0_0_15px_rgba(245,158,11,0.2)] transition-all cursor-pointer whitespace-nowrap"
              >
                Access OTC Tranches
              </button>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
