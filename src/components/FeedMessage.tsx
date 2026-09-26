import React, { useState, memo } from 'react';
import { 
  Sparkles, 
  Pin, 
  MessageSquare, 
  Share2, 
  Check, 
  TrendingUp, 
  ShieldCheck, 
  Send 
} from 'lucide-react';
import { Message, User } from '../types';
import { sounds } from '../services/soundEffects';

interface FeedMessageProps {
  message: Message;
  currentUser: User;
  onOpenProfile?: (user: User) => void;
  onBoost?: (messageId: string) => void;
}

export const FeedMessage = memo<FeedMessageProps>(({
  message,
  currentUser,
  onOpenProfile,
  onBoost,
}) => {
  // Reaction states
  const [boosted, setBoosted] = useState<boolean>(!!message.hasBoosted);
  const [boostCount, setBoostCount] = useState<number>(message.boosts || 0);

  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [repliesExpanded, setRepliesExpanded] = useState<boolean>(false);
  const [newReplyText, setNewReplyText] = useState<string>('');
  const [localReplies, setLocalReplies] = useState<{ id: string; author: User; text: string; time: string }[]>([]);

  const handleBoostToggle = () => {
    if (boosted) {
      setBoosted(false);
      setBoostCount((prev) => Math.max(0, prev - 1));
      sounds.playClick();
    } else {
      setBoosted(true);
      setBoostCount((prev) => prev + 1);
      sounds.playChime();
      if (onBoost) onBoost(message.id);
    }
  };

  const handleCopyLink = () => {
    sounds.playClick();
    setCopiedLink(true);
    navigator.clipboard?.writeText?.(window.location.href);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleAddReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReplyText.trim()) return;
    sounds.playClick();
    setLocalReplies((prev) => [
      ...prev,
      {
        id: `reply-${Date.now()}`,
        author: currentUser,
        text: newReplyText.trim(),
        time: 'Just now',
      },
    ]);
    setNewReplyText('');
    setRepliesExpanded(true);
  };

  const isAuthorBoard = message.author.rank === 'The Board';
  const tierFormatted = isAuthorBoard 
    ? 'Tier 1 · Board' 
    : message.author.rank === 'Architects' 
    ? 'Tier 2 · Architect' 
    : 'Tier 3 · Member';

  const displayTime = message.timestamp.includes('UTC') 
    ? message.timestamp 
    : `${message.timestamp} • ${tierFormatted}`;

  return (
    <article 
      className={`group relative rounded-2xl p-5 sm:p-6 transition-all duration-200 shadow-sm ${
        message.isPinned
          ? 'border border-amber-500/30 bg-gradient-to-b from-[#0c0e18] to-[#070912]'
          : 'border border-zinc-800/80 bg-[#070912] hover:border-zinc-700/80 hover:bg-[#090c17]'
      }`}
    >
      {/* Pinned Dispatch Header */}
      {message.isPinned && (
        <div className="flex items-center justify-between text-xs text-amber-400 mb-3.5 pb-2.5 border-b border-amber-500/20">
          <div className="flex items-center gap-2 font-medium tracking-wide">
            <Pin className="w-3.5 h-3.5 rotate-45 text-amber-400 fill-amber-400/30" />
            <span>Pinned Dispatch · Board Mandate</span>
          </div>
          <span className="text-xs uppercase font-medium px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-300">
            Priority
          </span>
        </div>
      )}

      {/* Author Header Row */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3.5 min-w-0">
          {/* Avatar */}
          <button
            onClick={() => {
              sounds.playClick();
              onOpenProfile && onOpenProfile(message.author);
            }}
            className="relative shrink-0 group/avatar text-left focus:outline-none focus-visible:ring-1 focus-visible:ring-amber-400 rounded-xl"
          >
            <div
              className={`w-11 h-11 rounded-xl bg-gradient-to-br ${message.author.avatarBg} border ${
                isAuthorBoard 
                  ? 'border-amber-400/80 shadow-sm' 
                  : 'border-zinc-700/80'
              } flex items-center justify-center text-xs font-bold text-zinc-100 transition-transform group-hover/avatar:scale-105`}
            >
              {message.author.initials}
            </div>
            {message.author.status === 'online' && (
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-zinc-950" />
            )}
            {message.author.status === 'in-deal-room' && (
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-amber-400 ring-2 ring-zinc-950" />
            )}
          </button>

          {/* User Details & Metadata */}
          <div className="space-y-0.5 min-w-0">
            <div className="flex items-center flex-wrap gap-x-2 gap-y-0.5">
              <button
                onClick={() => {
                  sounds.playClick();
                  onOpenProfile && onOpenProfile(message.author);
                }}
                className="text-sm font-bold text-zinc-100 hover:text-amber-300 font-sans tracking-tight transition-colors cursor-pointer truncate"
              >
                {message.author.name}
              </button>
              
              {isAuthorBoard ? (
                <span className="text-xs font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded tracking-wide shrink-0">
                  Board
                </span>
              ) : (
                <span className="text-xs font-medium text-zinc-400 bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded shrink-0">
                  {message.author.rank}
                </span>
              )}

              <span className="text-zinc-600 text-xs select-none">·</span>

              <span className="text-xs text-zinc-400 tracking-tight shrink-0">
                {displayTime}
              </span>
            </div>

            <div className="text-xs text-zinc-400 font-normal truncate">
              {message.author.roleTitle}
            </div>
          </div>
        </div>

        {/* Pass ID Tag */}
        <div className="hidden sm:inline-flex items-center gap-1.5 text-xs text-zinc-400 border border-zinc-800 bg-zinc-900/60 px-2.5 py-1 rounded-lg shrink-0">
          <ShieldCheck className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span className="font-medium text-zinc-300">{message.author.passId}</span>
        </div>
      </div>

      {/* Main Content Body */}
      <div className="mt-3.5 text-sm sm:text-base text-zinc-200 leading-relaxed font-sans space-y-2">
        {message.title && (
          <h4 className="text-base sm:text-lg font-bold text-amber-300/95 tracking-tight">
            {message.title}
          </h4>
        )}
        <p className="whitespace-pre-line text-zinc-300 font-normal">{message.content}</p>
      </div>

      {/* Attachment Preview (if present) */}
      {message.attachment && (
        <div className="mt-4 rounded-xl bg-zinc-950/80 border border-amber-500/20 p-4 transition-colors hover:border-amber-500/40">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span className="text-sm font-semibold text-zinc-100 font-sans">
                {message.attachment.title}
              </span>
            </div>
            {message.attachment.tag && (
              <span className="text-xs text-amber-300 font-medium px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30">
                {message.attachment.tag}
              </span>
            )}
          </div>

          {message.attachment.subtitle && (
            <p className="text-xs sm:text-sm text-zinc-400 mb-3 font-sans">
              {message.attachment.subtitle}
            </p>
          )}

          {message.attachment.metricValue && (
            <div className="flex items-baseline gap-3 pt-2.5 border-t border-zinc-900">
              <span className="text-2xl font-mono font-bold text-amber-400 tabular-nums">
                {message.attachment.metricValue}
              </span>
              {message.attachment.metricLabel && (
                <span className="text-xs text-zinc-400">
                  {message.attachment.metricLabel}
                </span>
              )}
              {message.attachment.metricChange && (
                <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1 ml-auto">
                  <TrendingUp className="w-3.5 h-3.5" />
                  {message.attachment.metricChange}
                </span>
              )}
            </div>
          )}
        </div>
      )}

      {/* Action Bar: Clean, uncluttered action buttons */}
      <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          {/* Boost Button */}
          <button
            onClick={handleBoostToggle}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-150 cursor-pointer ${
              boosted
                ? 'bg-amber-400/15 text-amber-300 border border-amber-500/50'
                : 'bg-zinc-900/60 text-zinc-400 border border-zinc-800 hover:border-zinc-700 hover:text-zinc-200'
            }`}
            title="Boost Dispatch"
          >
            <Sparkles
              className={`w-3.5 h-3.5 ${
                boosted ? 'text-amber-400 fill-amber-400' : 'text-zinc-400'
              }`}
            />
            <span>{boosted ? 'Boosted' : 'Boost'}</span>
            <span className="tabular-nums font-semibold text-zinc-300">
              {boostCount}
            </span>
          </button>

          {/* Reply Button */}
          <button
            onClick={() => {
              sounds.playClick();
              setRepliesExpanded(!repliesExpanded);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-zinc-400 hover:text-zinc-200 bg-zinc-900/60 hover:bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-colors cursor-pointer"
          >
            <MessageSquare className="w-3.5 h-3.5 text-zinc-400" />
            <span>
              {repliesExpanded ? 'Hide' : 'Replies'} ({(message.repliesCount || 0) + localReplies.length})
            </span>
          </button>
        </div>

        {/* Share Button */}
        <button
          onClick={handleCopyLink}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-zinc-400 hover:text-amber-300 hover:bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700 transition-all cursor-pointer"
          title="Share link"
        >
          {copiedLink ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400">Copied</span>
            </>
          ) : (
            <>
              <Share2 className="w-3.5 h-3.5" />
              <span>Share</span>
            </>
          )}
        </button>
      </div>

      {/* Expanded Reply Section */}
      {repliesExpanded && (
        <div className="mt-3.5 pt-3 space-y-3 border-t border-zinc-800/80 animate-in fade-in duration-150">
          {localReplies.map((reply) => (
            <div key={reply.id} className="pl-3.5 border-l-2 border-amber-500/40 py-1 space-y-1 bg-zinc-900/40 rounded-r-xl p-2.5">
              <div className="flex items-center gap-2 text-xs">
                <span className="font-semibold text-zinc-200">{reply.author.name}</span>
                <span className="text-zinc-600">·</span>
                <span className="text-zinc-400">{reply.time}</span>
              </div>
              <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">{reply.text}</p>
            </div>
          ))}

          {/* Quick Reply Input */}
          <form onSubmit={handleAddReply} className="flex items-center gap-2 pt-1">
            <input
              type="text"
              value={newReplyText}
              onChange={(e) => setNewReplyText(e.target.value)}
              placeholder="Write a reply..."
              className="flex-1 bg-zinc-900/80 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-zinc-200 placeholder:text-zinc-500 font-sans focus:outline-none focus:border-amber-500/50"
            />
            <button
              type="submit"
              disabled={!newReplyText.trim()}
              className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-black font-semibold rounded-xl text-xs transition-all disabled:opacity-30 cursor-pointer shadow-sm flex items-center gap-1.5"
            >
              <Send className="w-3 h-3" />
              <span>Reply</span>
            </button>
          </form>
        </div>
      )}
    </article>
  );
});
