import React, { useState } from 'react';
import { ShieldAlert, ShieldCheck, Wallet, Lock, Sparkles, X, ArrowRight, ExternalLink } from 'lucide-react';
import { Channel } from '../types';
import { sounds } from '../services/soundEffects';

interface TokenGateModalProps {
  isOpen: boolean;
  channel: Channel | null;
  onClose: () => void;
  onUnlockSuccess: (channelId: string) => void;
}

export const TokenGateModal: React.FC<TokenGateModalProps> = ({
  isOpen,
  channel,
  onClose,
  onUnlockSuccess,
}) => {
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [verifyStatus, setVerifyStatus] = useState<string>('');

  if (!isOpen || !channel) return null;

  const handleVerifyPass = () => {
    sounds.playClick();
    setIsVerifying(true);
    setVerifyStatus('Connecting TrustWallet provider...');

    setTimeout(() => {
      setVerifyStatus('Querying Sovereign Pass #0042 NFT token gating...');
    }, 700);

    setTimeout(() => {
      sounds.playVerificationResonance();
      setVerifyStatus('Clearance Granted · Token-Gate Unlocked');
      setTimeout(() => {
        setIsVerifying(false);
        onUnlockSuccess(channel.id);
        onClose();
      }, 1000);
    }, 1700);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-3xl animate-in fade-in duration-200">
      
      {/* Background ambient gold vignette */}
      <div className="absolute w-[450px] h-[450px] bg-cyan-500/[0.05] rounded-full blur-[100px] pointer-events-none" />

      {/* Main Card with pulsing gold border */}
      <div className="relative w-full max-w-md bg-zinc-950/95 border border-cyan-500/40 rounded-2xl p-6 sm:p-8 shadow-[0_0_50px_rgba(0,0,0,0.95),0_0_30px_rgba(245,158,11,0.18)] overflow-hidden animate-pulse-subtle">
        
        {/* Subtle top gold hairline */}
        <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />

        {/* Close button */}
        <button
          onClick={() => {
            sounds.playClick();
            onClose();
          }}
          disabled={isVerifying}
          className="absolute top-4 right-4 p-2 text-zinc-500 hover:text-zinc-200 transition-colors rounded-lg hover:bg-zinc-900/60 disabled:opacity-30 cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="space-y-6 text-center">
          
          {/* Glowing security shield badge */}
          <div className="relative mx-auto w-16 h-16 flex items-center justify-center">
            <div className="absolute inset-0 rounded-2xl bg-cyan-500/20 blur-xl animate-pulse" />
            <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-b from-zinc-800 to-zinc-950 border border-cyan-500/60 flex items-center justify-center shadow-[0_0_25px_rgba(245,158,11,0.25)]">
              <ShieldAlert className="w-8 h-8 text-cyan-400" />
            </div>
          </div>

          {/* Title & Copy */}
          <div className="space-y-2">
            <span className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-semibold block">
              VIP Access Required · Tier-1 Clearance
            </span>
            <h3 className="font-sans text-xl sm:text-2xl font-bold tracking-tight text-zinc-100 flex items-center justify-center gap-2">
              <span>{channel.symbol}</span>
              <span>{channel.name}</span>
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed max-w-sm mx-auto">
              This channel contains confidential syndicate allocations and high-ticket alpha. Access is restricted to holders of the <span className="text-cyan-300 font-semibold">NOVA Sovereign Black Card</span> or verified Syndicate Pass.
            </p>
          </div>

          {/* Channel metadata preview */}
          <div className="p-3.5 rounded-xl bg-zinc-900/50 border border-zinc-800/80 text-left space-y-1.5 font-mono text-xs">
            <div className="flex items-center justify-between text-zinc-400">
              <span className="text-xs text-zinc-400">Security Level:</span>
              <span className="text-cyan-400 font-bold flex items-center gap-1">
                <Lock className="w-3 h-3" />
                RESTRICTED ALPHA
              </span>
            </div>
            <div className="flex items-center justify-between text-zinc-400">
              <span className="text-xs text-zinc-400">Contract Verification:</span>
              <span className="text-zinc-300 font-mono text-xs">0x843C...E98DA</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2.5 pt-1">
            <button
              onClick={handleVerifyPass}
              disabled={isVerifying}
              className="group relative w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-cyan-500 via-cyan-400 to-cyan-500 hover:from-cyan-400 hover:to-cyan-300 text-black font-mono font-bold text-xs shadow-[0_0_25px_rgba(245,158,11,0.25)] transition-all cursor-pointer disabled:opacity-50"
            >
              {isVerifying ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  <span>{verifyStatus}</span>
                </div>
              ) : (
                <>
                  <Wallet className="w-4 h-4 text-black" />
                  <span>Connect TrustWallet (Verify Pass)</span>
                  <ArrowRight className="w-4 h-4 text-black group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </button>

            <button
              onClick={() => {
                sounds.playClick();
                onClose();
              }}
              disabled={isVerifying}
              className="w-full py-2.5 rounded-xl bg-zinc-900/60 hover:bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-zinc-200 text-xs font-mono transition-colors cursor-pointer"
            >
              Cancel
            </button>
          </div>

          {/* Footnote */}
          <div className="pt-2 border-t border-zinc-900 flex items-center justify-between text-xs font-mono text-zinc-400">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-500/80" />
              On-Chain Gate
            </span>
            <span className="text-zinc-500 hover:text-zinc-300 cursor-pointer flex items-center gap-1 transition-colors">
              Acquire Pass
              <ExternalLink className="w-2.5 h-2.5" />
            </span>
          </div>

        </div>

      </div>

    </div>
  );
};
