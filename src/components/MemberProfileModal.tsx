import React, { useState } from 'react';
import { X, ShieldCheck, TrendingUp, Briefcase, MapPin, Send, CheckCircle2, Lock, Sparkles, ExternalLink } from 'lucide-react';
import { User } from '../types';

interface MemberProfileModalProps {
  user: User | null;
  onClose: () => void;
  currentUser: User;
  onSendDirectMessage?: (user: User, text: string) => void;
}

export const MemberProfileModal: React.FC<MemberProfileModalProps> = ({
  user,
  onClose,
  currentUser,
  onSendDirectMessage,
}) => {
  const [dealRoomSent, setDealRoomSent] = useState<boolean>(false);
  const [inviteText, setInviteText] = useState<string>('');

  if (!user) return null;

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const handleRequestDealRoom = (e: React.FormEvent) => {
    e.preventDefault();
    setDealRoomSent(true);
    if (onSendDirectMessage && inviteText) {
      onSendDirectMessage(user, inviteText);
    }
    setTimeout(() => {
      setDealRoomSent(false);
      setInviteText('');
      onClose();
    }, 1800);
  };

  const isBoard = user.rank === 'The Board';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-2xl animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#08080a] border border-cyan-500/30 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.9),0_0_30px_rgba(245,158,11,0.1)] overflow-hidden">
        
        {/* Gold hairline accent */}
        <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-cyan-400/70 to-transparent" />

        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-zinc-500 hover:text-zinc-200 transition-colors rounded-lg hover:bg-zinc-900/60 z-10"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="p-6 sm:p-8 space-y-6">
          {/* Top Dossier Title */}
          <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
            <span className="text-xs font-mono uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-cyan-400" />
              Sovereign Member Dossier
            </span>
            <span className="text-xs font-mono text-zinc-400">
              {user.passId}
            </span>
          </div>

          {/* Luxury Membership Card Preview */}
          <div className="relative rounded-xl border border-cyan-500/40 bg-gradient-to-br from-zinc-900/90 via-zinc-950 to-black p-5 shadow-inner">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3.5">
                <div
                  className={`w-14 h-14 rounded-xl bg-gradient-to-br ${user.avatarBg} border-2 ${
                    isBoard ? 'border-cyan-400 shadow-[0_0_15px_rgba(245,158,11,0.25)]' : 'border-zinc-600'
                  } flex items-center justify-center font-mono text-lg font-bold text-zinc-100`}
                >
                  {user.initials}
                </div>
                <div>
                  <h3 className="font-sans text-lg font-bold tracking-tight text-zinc-100 flex items-center gap-2">
                    {user.name}
                    {user.verifiedAudit && (
                      <ShieldCheck className="w-4 h-4 text-cyan-400 fill-cyan-400/20" />
                    )}
                  </h3>
                  <div className="text-xs font-mono text-zinc-400">{user.handle}</div>
                  <div className="text-xs text-cyan-400/90 font-mono mt-0.5">{user.tier}</div>
                </div>
              </div>

              {/* Status indicator */}
              <div className="text-right">
                <span className="inline-flex items-center gap-1 text-xs font-mono px-2 py-0.5 rounded border border-zinc-800 bg-zinc-900/80 text-zinc-300">
                  <span className={`w-1.5 h-1.5 rounded-full ${user.status === 'online' ? 'bg-emerald-400' : 'bg-cyan-400'}`} />
                  {user.status === 'in-deal-room' ? 'In Deal Room' : user.status}
                </span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-zinc-800/80 grid grid-cols-3 gap-2 text-center font-mono">
              <div>
                <div className="text-xs text-zinc-400 uppercase tracking-wider">Weekly Vol</div>
                <div className="text-sm font-bold text-cyan-400 tabular-nums">
                  {formatCurrency(user.weeklyRevenue)}
                </div>
              </div>
              <div>
                <div className="text-xs text-zinc-400 uppercase tracking-wider">Total Volume</div>
                <div className="text-sm font-bold text-zinc-200 tabular-nums">
                  {formatCurrency(user.totalVolume)}
                </div>
              </div>
              <div>
                <div className="text-xs text-zinc-400 uppercase tracking-wider">Deals Settled</div>
                <div className="text-sm font-bold text-zinc-200 tabular-nums">
                  {user.dealsClosed}
                </div>
              </div>
            </div>
          </div>

          {/* Details & Bio */}
          <div className="space-y-3 text-xs text-zinc-300">
            <div className="flex items-center gap-2 text-zinc-400 font-mono">
              <MapPin className="w-3.5 h-3.5 text-zinc-500" />
              <span>{user.location}</span>
              <span className="text-zinc-700">·</span>
              <Briefcase className="w-3.5 h-3.5 text-zinc-500" />
              <span>{user.roleTitle}</span>
            </div>

            <p className="p-3 rounded-lg bg-zinc-900/40 border border-zinc-800/60 leading-relaxed text-zinc-300 font-normal">
              "{user.bio}"
            </p>
          </div>

          {/* Action: Deal Room Invitation */}
          {dealRoomSent ? (
            <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-center space-y-1">
              <CheckCircle2 className="w-6 h-6 text-emerald-400 mx-auto" />
              <div className="text-xs font-mono font-semibold text-zinc-200">
                Deal Room Handshake Dispatched
              </div>
              <div className="text-xs text-zinc-400 font-mono">
                Encrypted push delivered to {user.name}’s hardware key.
              </div>
            </div>
          ) : (
            <form onSubmit={handleRequestDealRoom} className="space-y-3">
              <label className="block text-xs font-mono text-zinc-400 uppercase tracking-wider">
                Request Private Escrow Deal Room
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inviteText}
                  onChange={(e) => setInviteText(e.target.value)}
                  placeholder={`Suggest mandate or co-syndicate allocation...`}
                  className="flex-1 bg-zinc-900/80 border border-zinc-800 rounded-lg px-3 py-2 text-xs font-mono text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-cyan-500/40"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 text-black font-mono font-bold text-xs rounded-lg transition-all shadow-[0_0_15px_rgba(245,158,11,0.2)] flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send</span>
                </button>
              </div>
            </form>
          )}

          {/* Bottom Security Assurance */}
          <div className="pt-2 border-t border-zinc-900 flex items-center justify-between text-xs font-mono text-zinc-400">
            <span className="flex items-center gap-1 text-zinc-400">
              <Lock className="w-3 h-3 text-cyan-500" />
              Private Encrypted Channel
            </span>
            <span className="text-zinc-400">Escrow Audited</span>
          </div>

        </div>
      </div>
    </div>
  );
};
