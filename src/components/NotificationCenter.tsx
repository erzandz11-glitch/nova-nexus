import React from 'react';
import { Bell, Check, X, ShieldCheck, Trophy, Sparkles, Briefcase } from 'lucide-react';
import { SyndicateNotification } from '../types';
import { sounds } from '../services/soundEffects';

interface NotificationCenterProps {
  notifications: SyndicateNotification[];
  isOpen: boolean;
  onClose: () => void;
  onMarkAllAsRead: () => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  notifications,
  isOpen,
  onClose,
  onMarkAllAsRead,
}) => {
  if (!isOpen) return null;

  const getIcon = (type: SyndicateNotification['type']) => {
    switch (type) {
      case 'escrow':
        return <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />;
      case 'rank':
        return <Trophy className="w-3.5 h-3.5 text-amber-300" />;
      case 'boost':
        return <Sparkles className="w-3.5 h-3.5 text-emerald-400" />;
      case 'deal':
        return <Briefcase className="w-3.5 h-3.5 text-blue-400" />;
    }
  };

  return (
    <div className="absolute right-0 top-12 z-50 w-80 sm:w-96 rounded-2xl bg-[#09090c] border border-amber-500/30 shadow-[0_10px_40px_rgba(0,0,0,0.8),0_0_20px_rgba(245,158,11,0.1)] overflow-hidden animate-in fade-in duration-150">
      
      {/* Header */}
      <div className="p-4 border-b border-zinc-900 flex items-center justify-between bg-black/40">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-amber-400" />
          <span className="font-sans text-xs font-extrabold tracking-wider text-zinc-100">
            SYNDICATE DISPATCHES
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              sounds.playClick();
              onMarkAllAsRead();
            }}
            className="text-xs text-zinc-400 hover:text-amber-300 transition-colors"
          >
            Mark all read
          </button>
          <button
            onClick={onClose}
            className="p-1 text-zinc-500 hover:text-zinc-200"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* List */}
      <div className="max-h-80 overflow-y-auto divide-y divide-zinc-900/80 p-2">
        {notifications.map((item) => (
          <div
            key={item.id}
            className={`p-3 rounded-xl transition-colors ${
              item.read ? 'bg-transparent text-zinc-400' : 'bg-zinc-900/40 text-zinc-200 border border-zinc-800/40'
            }`}
          >
            <div className="flex items-start gap-2.5">
              <div className="mt-0.5 p-1 rounded-lg bg-zinc-950 border border-zinc-800">
                {getIcon(item.type)}
              </div>
              <div className="flex-1 min-w-0 space-y-0.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-zinc-200 truncate">
                    {item.title}
                  </span>
                  <span className="text-xs text-zinc-500 shrink-0">
                    {item.timestamp}
                  </span>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed font-normal">
                  {item.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="p-2.5 border-t border-zinc-900 bg-black/60 text-center">
        <span className="text-xs text-zinc-500">
          Encrypted Webhook Stream · Zero Data Retention
        </span>
      </div>
    </div>
  );
};
