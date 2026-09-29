import React, { useState, memo } from 'react';
import { 
  Sparkles, 
  Pin, 
  MessageSquare, 
  Share2, 
  Check, 
  TrendingUp, 
  ShieldCheck, 
  Send,
  Zap,
  ExternalLink,
  ChevronDown,
  ChevronUp
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
      className={`group relative rounded-2xl p-5 sm:p-6 transition-all duration-200 ${
        message.isPinned
          ? 'bg-gradient-to-b from-[#0f172a]/95 to-[#0b0f19]/95 border border-cyan-500/35 shadow-[0_0_25px_rgba(6,182,212,0.15)]'
          : 'bg-gradient-to-b from-[#0d121c]/90 to-[#090d16]/90 hover:from-[#111724]/90 hover:to-[#0c101a]/90 border border-slate-800/80 hover:border-cyan-500/30 shadow-[0_4px_20px_rgba(0,0,0,0.35)]'
      }`}
    >
      {/* Pinned Indicator Header */}
      {message.isPinned && (
        <div className="flex items-center justify-between text-xs text-cyan-400 font-semibold mb-3.5 pb-2.5 border-b border-cyan-500/20">
          <div className="flex items-center gap-2 tracking-wide uppercase">
            <Pin className="w-3.5 h-3.5 rotate-45 text-cyan-400 fill-cyan-400/30" />
            <span>High-Priority Syndicate Directive</span>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-400/10 text-cyan-300 border border-cyan-500/30">
            MANDATE
          </span>
        </div>
      )}

      {/* Header Row: Author Info & Badges */}
      <div className="flex items-start justify-between gap-3 mb-3.5">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={() => {
              sounds.playClick();
              onOpenProfile && onOpenProfile(message.author);
            }}
            className="relative shrink-0 text-left focus:outline-none rounded-full group/avatar cursor-pointer"
          >
            <div
              className={`w-11 h-11 rounded-full bg-gradient-to-br ${message.author.avatarBg} border ${
                isAuthorBoard 
                  ? 'border-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.4)]' 
                  : isArchitect 
                  ? 'border-sky-500/60'
                  : 'border-slate-700'
              } flex items-center justify-center text-xs font-bold text-white transition-transform group-hover/avatar:scale-105`}
            >
              {message.author.initials}
            </div>
            {message.author.status === 'online' && (
              <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-400 ring-2 ring-[#090d16]" />
            )}
            {message.author.status === 'in-deal-room' && (
              <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-cyan-400 ring-2 ring-[#090d16]" />
            )}
          </button>

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => {
                  sounds.playClick();
                  onOpenProfile && onOpenProfile(message.author);
                }}
                className="text-sm font-bold text-white hover:text-cyan-300 transition-colors cursor-pointer"
              >
                {message.author.name}
              </button>

              {/* Ranks & Verifications */}
              {isAuthorBoard ? (
                <span className="text-[10px] font-bold text-cyan-300 bg-cyan-500/15 border border-cyan-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-cyan-400" />
                  The Board
                </span>
              ) : isArchitect ? (
                <span className="text-[10px] font-semibold text-sky-300 bg-sky-500/10 border border-sky-500/20 px-2 py-0.5 rounded-full">
                  Architect
                </span>
              ) : null}

              {message.author.verifiedAudit && (
                <span className="text-[10px] font-mono text-slate-400 bg-slate-800/80 px-1.5 py-0.5 rounded border border-slate-700">
                  {message.author.passId}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
              <span>{message.author.roleTitle}</span>
              <span>•</span>
              <span className="font-mono text-[11px] text-slate-400">{message.timestamp}</span>
            </div>
          </div>
        </div>

        {/* Share Button */}
        <button
          onClick={handleCopyLink}
          className="p-2 text-slate-400 hover:text-cyan-300 rounded-xl hover:bg-slate-800/60 transition cursor-pointer shrink-0"
          title="Share Transmission"
        >
          {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
        </button>
      </div>

      {/* Message Title (if present) */}
      {message.title && (
        <h3 className="text-base font-bold text-slate-100 mb-2 tracking-tight group-hover:text-cyan-200 transition-colors">
          {message.title}
        </h3>
      )}

      {/* Message Content Body */}
      <div className="text-xs sm:text-sm text-slate-300 leading-relaxed space-y-2 whitespace-pre-line mb-4 font-normal">
        {message.content}
      </div>

      {/* Attachment Card (if present) */}
      {message.attachment && (
        <div className="mb-4 rounded-xl overflow-hidden border border-cyan-500/20 bg-[#070b14]/90 p-3.5 space-y-2.5">
          <div className="flex items-center justify-between text-xs text-slate-400 pb-2 border-b border-white/[0.06]">
            <span className="font-semibold text-cyan-300 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
              Verified Telemetry Payload
            </span>
            <span className="font-mono text-[10px] text-slate-400">SHA-256 VERIFIED</span>
          </div>

          {message.attachment.type === 'image' && message.attachment.url && (
            <div className="rounded-lg overflow-hidden border border-slate-800">
              <img
                src={message.attachment.url}
                alt={message.attachment.title || 'Attached Intel'}
                className="w-full max-h-80 object-cover"
              />
            </div>
          )}

          {message.attachment.title && (
            <div className="text-xs font-semibold text-slate-200">{message.attachment.title}</div>
          )}

          {message.attachment.metrics && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
              {Object.entries(message.attachment.metrics).map(([key, val]) => (
                <div key={key} className="p-2 rounded-lg bg-slate-900/80 border border-slate-800">
                  <div className="text-[10px] uppercase font-bold text-slate-400">{key}</div>
                  <div className="text-xs font-mono font-bold text-cyan-300">{val}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Action Bar: Boost, Reply, Stats */}
      <div className="flex items-center justify-between pt-3 border-t border-white/[0.06] text-xs">
        <div className="flex items-center gap-2">
          {/* Boost Button */}
          <button
            onClick={handleBoostToggle}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer ${
              boosted
                ? 'bg-gradient-to-r from-cyan-500/25 to-blue-500/25 text-cyan-300 border border-cyan-400/50 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                : 'bg-slate-900/70 hover:bg-slate-850 text-slate-300 hover:text-cyan-300 border border-slate-800 hover:border-cyan-500/30'
            }`}
          >
            <Sparkles className={`w-3.5 h-3.5 ${boosted ? 'text-cyan-400 animate-pulse' : 'text-slate-400'}`} />
            <span>Boost</span>
            <span className="font-mono text-xs ml-0.5">{boostCount}</span>
          </button>

          {/* Replies Expander */}
          <button
            onClick={() => {
              sounds.playClick();
              setRepliesExpanded(!repliesExpanded);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/70 hover:bg-slate-850 text-slate-300 hover:text-slate-100 border border-slate-800 transition cursor-pointer"
          >
            <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
            <span>Debriefs</span>
            <span className="font-mono text-xs ml-0.5">
              {(message.repliesCount || 0) + localReplies.length}
            </span>
            {repliesExpanded ? <ChevronUp className="w-3 h-3 ml-1" /> : <ChevronDown className="w-3 h-3 ml-1" />}
          </button>
        </div>

        {/* Guild Seal Tag */}
        <div className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
          <Zap className="w-3 h-3 text-cyan-400" />
          <span>ESCROW SYNCED</span>
        </div>
      </div>

      {/* Expandable Replies Section */}
      {repliesExpanded && (
        <div className="mt-4 pt-4 border-t border-white/[0.06] space-y-3 animate-in fade-in duration-200">
          {/* Existing / Local Replies list */}
          {localReplies.map((reply) => (
            <div key={reply.id} className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-900/50 border border-slate-800/80">
              <div className={`w-7 h-7 rounded-full bg-gradient-to-br ${reply.author.avatarBg} border border-cyan-400/40 flex items-center justify-center text-[10px] font-bold text-white shrink-0`}>
                {reply.author.initials}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between text-xs mb-0.5">
                  <span className="font-semibold text-slate-200">{reply.author.name}</span>
                  <span className="font-mono text-[10px] text-slate-400">{reply.time}</span>
                </div>
                <div className="text-xs text-slate-300">{reply.text}</div>
              </div>
            </div>
          ))}

          {/* Quick Reply Form */}
          <form onSubmit={handleAddReply} className="flex items-center gap-2 pt-1">
            <input
              type="text"
              value={newReplyText}
              onChange={(e) => setNewReplyText(e.target.value)}
              placeholder="Contribute perspective or rebuttal..."
              className="flex-1 bg-slate-900/90 border border-slate-800 hover:border-slate-700 focus:border-cyan-400 rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-slate-400 focus:outline-none transition"
            />
            <button
              type="submit"
              disabled={!newReplyText.trim()}
              className={`px-3 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-1 cursor-pointer shrink-0 ${
                newReplyText.trim()
                  ? 'bg-cyan-500 hover:bg-cyan-400 text-black shadow-sm'
                  : 'bg-slate-850 text-slate-600 cursor-not-allowed opacity-50'
              }`}
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}
    </article>
  );
});
FeedMessage.displayName = 'FeedMessage';
