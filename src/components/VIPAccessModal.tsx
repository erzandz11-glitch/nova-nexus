import React, { useState } from 'react';
import { ShieldCheck, Wallet, Lock, Sparkles, X, CheckCircle2, ArrowRight, KeyRound, ExternalLink, Cpu } from 'lucide-react';
import { User } from '../types';
import { sounds } from '../services/soundEffects';
import { isSupabaseConfigured } from '../services/supabaseClient';

interface VIPAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerifySuccess: (passId: string) => void;
  currentUser: User;
}

export const VIPAccessModal: React.FC<VIPAccessModalProps> = ({
  isOpen,
  onClose,
  onVerifySuccess,
  currentUser,
}) => {
  const [connectingMode, setConnectingMode] = useState<'idle' | 'wallet' | 'supabase'>('idle');
  const [verifyingStep, setVerifyingStep] = useState<string>('');
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleConnectWallet = () => {
    sounds.playClick();
    setConnectingMode('wallet');
    setVerifyingStep('Requesting TrustWallet / MetaMask EIP-712 Handshake...');
    setTimeout(() => {
      setVerifyingStep('Signing cryptographic Sovereign Membership challenge...');
    }, 800);
    setTimeout(() => {
      setVerifyingStep('Scanning Contract: 0x843C...E98DA (NOVA Sovereign Pass)...');
    }, 1600);
    setTimeout(() => {
      sounds.playVerificationResonance();
      setIsSuccess(true);
      setVerifyingStep('Access Granted · Sovereign Pass #0042 Verified on Mainnet');
      setTimeout(() => {
        onVerifySuccess('NOVA-0042-BLACK');
        setConnectingMode('idle');
        setIsSuccess(false);
      }, 1200);
    }, 2400);
  };

  const handleConnectSupabase = () => {
    sounds.playClick();
    setConnectingMode('supabase');
    setVerifyingStep('Querying Private Escrow Database (Supabase Auth Cluster)...');
    setTimeout(() => {
      setVerifyingStep('Validating Accredited Syndicate Token & KYC Tier...');
    }, 900);
    setTimeout(() => {
      sounds.playVerificationResonance();
      setIsSuccess(true);
      setVerifyingStep('Session Authenticated · Welcome to The Inner Circle');
      setTimeout(() => {
        onVerifySuccess('NOVA-0042-SUPABASE');
        setConnectingMode('idle');
        setIsSuccess(false);
      }, 1200);
    }, 1900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-3xl transition-opacity animate-in fade-in duration-300">
      {/* Background ambient gold vignette */}
      <div className="absolute w-[500px] h-[500px] bg-cyan-500/[0.04] rounded-full blur-[120px] pointer-events-none" />

      {/* Modal Container */}
      <div className="relative w-full max-w-lg bg-[#0a0a0c] border border-cyan-500/25 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.9),0_0_30px_rgba(245,158,11,0.08)] overflow-hidden">
        
        {/* Subtle top gold hairline */}
        <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent" />

        {/* Close button */}
        <button
          onClick={() => {
            sounds.playClick();
            onClose();
          }}
          disabled={connectingMode !== 'idle'}
          className="absolute top-4 right-4 p-2 text-zinc-500 hover:text-zinc-200 transition-colors rounded-lg hover:bg-zinc-900/60 disabled:opacity-30 cursor-pointer"
          aria-label="Close VIP verification modal"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="p-8 sm:p-10 space-y-6">
          {/* Header Monogram & Title */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-b from-zinc-800/80 to-zinc-950 border border-cyan-500/30 shadow-[0_0_20px_rgba(251,191,36,0.1)] mb-1">
              <span className="font-sans text-xl font-extrabold tracking-wider text-cyan-400">
                NV
              </span>
            </div>
            
            <div className="space-y-1">
              <span className="text-xs font-mono uppercase tracking-wider text-cyan-400/80 block">
                Private Verification Protocol
              </span>
              <h2 className="font-sans text-2xl font-bold tracking-tight text-zinc-100">
                NOVA COMMUNITY
              </h2>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed max-w-xs mx-auto">
              Membership is restricted to the top 0.01% of creators and high-ticket syndicate principals. Verify your tokenized pass to proceed.
            </p>
          </div>

          {/* Current Identity Verification Preview */}
          <div className="p-3.5 rounded-xl bg-zinc-950/70 border border-zinc-800/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${currentUser.avatarBg} border border-cyan-500/30 flex items-center justify-center text-xs font-semibold text-zinc-200`}>
                {currentUser.initials}
              </div>
              <div className="text-left">
                <div className="text-xs font-semibold text-zinc-200">{currentUser.name}</div>
                <div className="text-xs font-mono text-zinc-400">Status: {currentUser.passId}</div>
              </div>
            </div>
            <span className="text-xs font-mono px-2 py-0.5 rounded border border-cyan-500/30 bg-cyan-500/5 text-cyan-400">
              Pass Active
            </span>
          </div>

          {/* Action options */}
          {connectingMode === 'idle' ? (
            <div className="space-y-3 pt-1">
              {/* Option 1: Connect TrustWallet (Web3 NFT Pass) */}
              <button
                onClick={handleConnectWallet}
                className="group relative w-full flex items-center justify-between p-4 rounded-xl bg-zinc-900/60 border border-cyan-500/30 hover:border-cyan-400/80 hover:bg-zinc-900 transition-all duration-300 shadow-[0_0_15px_rgba(0,0,0,0.5)] hover:shadow-[0_0_25px_rgba(245,158,11,0.12)] text-left cursor-pointer"
              >
                <div className="flex items-center gap-3.5">
                  <div className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-800 text-cyan-400 group-hover:text-cyan-300 transition-colors">
                    <Wallet className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-zinc-100 group-hover:text-cyan-300 transition-colors">
                      Connect TrustWallet
                    </div>
                    <div className="text-xs text-zinc-400 font-normal">
                      Verify Sovereign NFT Black Card On-Chain
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-zinc-500 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all" />
              </button>

              {/* Option 2: Login with Supabase / Concierge Key */}
              <button
                onClick={handleConnectSupabase}
                className="group relative w-full flex items-center justify-between p-4 rounded-xl bg-zinc-900/40 border border-zinc-800 hover:border-emerald-500/50 hover:bg-zinc-900/70 transition-all duration-300 text-left cursor-pointer"
              >
                <div className="flex items-center gap-3.5">
                  <div className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-800 text-emerald-400 group-hover:text-emerald-300 transition-colors">
                    <KeyRound className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-zinc-200 group-hover:text-zinc-100 transition-colors flex items-center gap-2">
                      <span>Login with Supabase</span>
                      {isSupabaseConfigured ? (
                        <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                          Active
                        </span>
                      ) : (
                        <span className="text-xs font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700">
                          Ready
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-zinc-400 font-normal">
                      {isSupabaseConfigured
                        ? 'Connected to live Supabase cluster & Realtime channels'
                        : 'Accredited Investor & Syndicate Email Auth (Ready for Vercel)'}
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-zinc-500 group-hover:text-zinc-300 group-hover:translate-x-0.5 transition-all" />
              </button>
            </div>
          ) : (
            /* Connecting & verifying simulation state */
            <div className="py-6 px-4 rounded-xl bg-zinc-950/80 border border-cyan-500/20 text-center space-y-4">
              <div className="relative mx-auto w-12 h-12 flex items-center justify-center">
                {isSuccess ? (
                  <CheckCircle2 className="w-10 h-10 text-emerald-400 animate-in zoom-in-75 duration-300" />
                ) : (
                  <div className="w-9 h-9 border-2 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin" />
                )}
              </div>
              <div className="space-y-1">
                <div className="text-xs font-mono font-medium text-zinc-200">
                  {verifyingStep}
                </div>
                <div className="text-xs text-zinc-400">
                  {isSuccess ? 'Cryptographic validation succeeded' : 'Please do not close this window'}
                </div>
              </div>
            </div>
          )}

          {/* Footer Terms & Security Note */}
          <div className="pt-2 border-t border-zinc-900/80 flex items-center justify-between text-xs text-zinc-400 font-mono">
            <span className="flex items-center gap-1.5 text-zinc-400">
              <Lock className="w-3 h-3 text-cyan-500/70" />
              Zero-Knowledge Verification
            </span>
            <span className="text-zinc-400 hover:text-zinc-300 cursor-pointer flex items-center gap-1 transition-colors">
              Smart Contract Audit
              <ExternalLink className="w-2.5 h-2.5" />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
