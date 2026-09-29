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
  const isArchitect = message.author.rank === 'Architects';

  return (
    <article 
      className={`group relative rounded-xl px-4 py-3.5 sm:px-5 sm:py-4 transition-all duration-150 ${
        message.isPinned
          ? 'bg-[#111622]/90 border border-cyan-500/20 shadow-sm'
          : 'bg-[#0d111a]/80 hover:bg-[#111622] border border-white/[0.04] hover:border-white/[0.08]'
      }`}
    >
      {/* Pinned Indicator Header */}
      {message.isPinned && (
        <div className="flex items-center justify-between text-xs text-cyan-400/90 mb-2.5 pb-2 border-b border-cyan-500/10">
          <div className="flex items-center gap-1.5 font-medium tracking-wide">
            <Pin className="w-3.5 h-3.5 rotate-45 text-cyan-400 fill-cyan-400/20" />
            <span>Pinned Announcement</span>
          </div>
          <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-cyan-400/10 text-cyan-300">
            Mandate
          </span>
        </div>
      )}

      {/* Main Message Block: Avatar Left, Message Content Right (Discord Flow) */}
      <div className="flex items-start gap-3.5">
        {/* Avatar */}
        <button
          onClick={() => {
            sounds.playClick();
            onOpenProfile && onOpenProfile(message.author);
          }}
          className="relative shrink-0 text-left focus:outline-none rounded-full group/avatar mt-0.5"
        >
          <div
            className={`w-10 h-10 rounded-full bg-gradient-to-br ${message.author.avatarBg} border ${
              isAuthorBoard 
                ? 'border-cyan-400/60 shadow-sm' 
                : isArchitect 
                ? 'border-zinc-500/60'
                : 'border-zinc-700/50'
            } flex items-center justify-center text-xs font-bold text-zinc-100 transition-transform group-hover/avatar:scale-105`}
          >
            {message.author.initials}
          </div>
          {message.author.status === 'online' && (
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-[#0d111a]" />
          )}
          {message.author.status === 'in-deal-room' && (
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-cyan-400 ring-2 ring-[#0d111a]" />
          )}
        </button>

        {/* Message Body */}
        <div className="flex-1 min-w-0">
          {/* Header Row */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => {
                  sounds.playClick();
                  onOpenProfile && onOpenProfile(message.author);
                }}
                className="text-sm font-semibold text-zinc-100 hover:text-cyan-300 transition-colors cursor-pointer"
              >
                {message.author.name}
              </button>

              {/* Badges */}
              {isAuthorBoard ? (
                <span className="text-[10px] font-semibold text-cyan-300 bg-cyan-500/10 border border-cyan-500/20 px-1.5 py-0.5 rounded">
                  The Board
                </span>
              ) : isArchitect ? (
                <span className="text-[10px] font-medium text-zinc-300 bg-zinc-800/80 border border-zinc-700/50 px-1.5 py-0.5 rounded">
                  Architect
                </span>
              ) : null}

              <span className="text-zinc-500 text-xs">·</span>
              <span className="text-xs text-zinc-500 font-normal">
                {message.timestamp}
              </span>
            </div>

            {/* Pass ID Tag */}
            <div className="hidden sm:inline-flex items-center gap-1 text-[11px] text-zinc-400 bg-zinc-900/60 border border-zinc-800/80 px-2 py-0.5 rounded-md shrink-0">
              <ShieldCheck className="w-3 h-3 text-cyan-400/80" />
              <span>{message.author.passId}</span>
            </div>
          </div>

          {/* Title if any */}
          {message.title && (
            <h4 className="mt-1 text-sm font-semibold text-cyan-300/90 tracking-tight">
              {message.title}
            </h4>
          )}

          {/* Text Content */}
          <p className="mt-1 text-sm text-zinc-300 leading-relaxed font-normal whitespace-pre-line">
            {message.content}
          </p>

          {/* Attachment Preview (if any) */}
          {message.attachment && (
            <div className="mt-3 rounded-lg bg-[#080b12] border border-white/[0.06] p-3 transition-colors hover:border-cyan-500/30">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold text-zinc-200">
                  {message.attachment.title}
                </span>
                {message.attachment.tag && (
                  <span className="text-[10px] text-cyan-300 font-medium px-1.5 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20">
                    {message.attachment.tag}
                  </span>
                )}
              </div>

              {message.attachment.subtitle && (
                <p className="text-xs text-zinc-400 mb-2">
                  {message.attachment.subtitle}
                </p>
              )}

              {message.attachment.metricValue && (
                <div className="flex items-baseline gap-2 pt-2 border-t border-zinc-800/60">
                  <span className="text-xl font-mono font-bold text-cyan-400 tabular-nums">
                    {message.attachment.metricValue}
                  </span>
                  {message.attachment.metricLabel && (
                    <span className="text-xs text-zinc-400">
                      {message.attachment.metricLabel}
                    </span>
                  )}
                  {message.attachment.metricChange && (
                    <span className="text-xs font-medium text-emerald-400 flex items-center gap-1 ml-auto">
                      <TrendingUp className="w-3 h-3" />
                      {message.attachment.metricChange}
                    </span>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Action Row */}
          <div className="mt-3 flex items-center gap-2">
            {/* Boost button */}
            <button
              onClick={handleBoostToggle}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                boosted
                  ? 'bg-cyan-400/15 text-cyan-300 border border-cyan-500/40'
                  : 'bg-zinc-800/40 text-zinc-400 border border-zinc-700/30 hover:border-zinc-600 hover:text-zinc-200 hover:bg-zinc-800/80'
              }`}
              title="Boost"
            >
              <Sparkles
                className={`w-3 h-3 ${
                  boosted ? 'text-cyan-400 fill-cyan-400' : 'text-zinc-400'
                }`}
              />
              <span>{boosted ? 'Boosted' : 'Boost'}</span>
              <span className="tabular-nums font-semibold text-zinc-300">
                {boostCount}
              </span>
            </button>

            {/* Replies button */}
            <button
              onClick={() => {
                sounds.playClick();
                setRepliesExpanded(!repliesExpanded);
              }}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium text-zinc-400 hover:text-zinc-200 bg-zinc-800/40 hover:bg-zinc-800/80 border border-zinc-700/30 hover:border-zinc-600 transition-colors cursor-pointer"
            >
              <MessageSquare className="w-3 h-3 text-zinc-400" />
              <span>
                {repliesExpanded ? 'Hide' : 'Replies'} ({(message.repliesCount || 0) + localReplies.length})
              </span>
            </button>

            {/* Share button */}
            <button
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50 transition-colors cursor-pointer ml-auto"
              title="Share"
            >
              {copiedLink ? (
                <>
                  <Check className="w-3 h-3 text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3 h-3" />
                  <span>Share</span>
                </>
              )}
            </button>
          </div>

          {/* Reply Section */}
          {repliesExpanded && (
            <div className="mt-3 pt-2.5 space-y-2.5 border-t border-zinc-800/60 animate-in fade-in duration-150">
              {localReplies.map((reply) => (
                <div key={reply.id} className="pl-3 border-l-2 border-cyan-500/40 py-0.5 space-y-0.5">
                  <div className="flex items-center gap-1.5 text-xs">
                    <span className="font-semibold text-zinc-200">{reply.author.name}</span>
                    <span className="text-zinc-600">·</span>
                    <span className="text-zinc-500 text-[11px]">{reply.time}</span>
                  </div>
                  <p className="text-xs text-zinc-300 leading-relaxed">{reply.text}</p>
                </div>
              ))}

              {/* Quick Reply Form */}
              <form onSubmit={handleAddReply} className="flex items-center gap-2 pt-1">
                <input
                  type="text"
                  value={newReplyText}
                  onChange={(e) => setNewReplyText(e.target.value)}
                  placeholder="Send a quick reply..."
                  className="flex-1 bg-zinc-900/90 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:border-cyan-500/40"
                />
                <button
                  type="submit"
                  disabled={!newReplyText.trim()}
                  className="px-3 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-black font-semibold rounded-lg text-xs transition-all disabled:opacity-30 cursor-pointer flex items-center gap-1"
                >
                  <Send className="w-3 h-3" />
                  <span>Reply</span>
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </article>
  );
});

