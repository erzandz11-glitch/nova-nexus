import React, { useState } from 'react';
import { X, Briefcase, TrendingUp, ShieldCheck, CheckCircle2, Lock, ArrowUpRight, DollarSign } from 'lucide-react';
import { OTCDeal, User } from '../types';
import { sounds } from '../services/soundEffects';

interface DealRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  deals: OTCDeal[];
  currentUser: User;
  onCommitAllocation?: (dealId: string, amount: number) => void;
}

export const DealRoomModal: React.FC<DealRoomModalProps> = ({
  isOpen,
  onClose,
  deals,
  currentUser,
  onCommitAllocation,
}) => {
  const [selectedDeal, setSelectedDeal] = useState<OTCDeal | null>(deals[0] || null);
  const [allocationAmount, setAllocationAmount] = useState<string>('100000');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const handleCommit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseInt(allocationAmount.replace(/\D/g, ''), 10) || 100000;
    setIsSubmitting(true);

    setTimeout(() => {
      sounds.playVerificationResonance();
      setIsSubmitting(false);
      setIsSuccess(true);
      if (onCommitAllocation && selectedDeal) {
        onCommitAllocation(selectedDeal.id, num);
      }
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 1600);
    }, 1400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-3xl animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[#09090c] border border-cyan-500/30 rounded-2xl shadow-[0_0_60px_rgba(0,0,0,0.9),0_0_35px_rgba(245,158,11,0.12)] overflow-hidden">
        
        {/* Hairline gold accent */}
        <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-cyan-400/80 to-transparent" />

        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-zinc-500 hover:text-zinc-200 transition-colors rounded-lg hover:bg-zinc-900/60 z-10"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="p-6 sm:p-8 space-y-6">
          <div className="space-y-1">
            <span className="text-xs font-mono uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-cyan-400" />
              OTC Escrow & Syndicate Desk
            </span>
            <h2 className="font-sans text-xl sm:text-2xl font-bold tracking-tight text-zinc-100">
              HIGH-TICKET CO-INVESTMENT TRANCHES
            </h2>
            <p className="text-xs text-zinc-400">
              Direct allocations into verified 8-figure creator networks, software buyouts, and media clusters.
            </p>
          </div>

          {/* Deal Selector Tabs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {deals.map((deal) => {
              const isSelected = selectedDeal?.id === deal.id;
              const fillPct = Math.round((deal.filledAmount / deal.totalAllocation) * 100);

              return (
                <button
                  key={deal.id}
                  onClick={() => {
                    sounds.playClick();
                    setSelectedDeal(deal);
                  }}
                  className={`p-3 rounded-xl text-left border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-zinc-900/90 border-cyan-500/50 shadow-[0_0_15px_rgba(245,158,11,0.1)]'
                      : 'bg-zinc-950/60 border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  <div className="text-xs font-mono text-cyan-400/90 uppercase truncate">
                    {deal.niche}
                  </div>
                  <div className="text-xs font-semibold text-zinc-200 truncate mt-0.5">
                    {deal.title}
                  </div>
                  <div className="mt-2 text-xs font-mono text-zinc-400 flex items-center justify-between">
                    <span>{formatCurrency(deal.totalAllocation)}</span>
                    <span className="text-emerald-400 font-bold">{fillPct}% Filled</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Selected Deal Details Card */}
          {selectedDeal && (
            <div className="p-5 rounded-xl bg-zinc-950/80 border border-zinc-800/90 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-900 pb-3">
                <div>
                  <h3 className="font-semibold text-zinc-100 text-sm">{selectedDeal.title}</h3>
                  <div className="text-xs text-zinc-400 font-mono">Entity: {selectedDeal.targetCompany}</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-cyan-400 px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20">
                    {selectedDeal.expectedYield}
                  </span>
                  <span className="text-xs font-mono text-zinc-400">
                    {selectedDeal.termMonths} Mo Term
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="space-y-1.5 font-mono">
                <div className="flex justify-between text-xs text-zinc-400">
                  <span>Tranche Allocation Progress</span>
                  <span className="text-zinc-200">
                    {formatCurrency(selectedDeal.filledAmount)} / {formatCurrency(selectedDeal.totalAllocation)}
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-zinc-900 overflow-hidden border border-zinc-800">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-600 via-cyan-500 to-cyan-400 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, (selectedDeal.filledAmount / selectedDeal.totalAllocation) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Lead sponsor */}
              <div className="flex items-center justify-between text-xs text-zinc-400 pt-2 border-t border-zinc-900">
                <div className="flex items-center gap-2">
                  <span className="text-zinc-500 font-mono">Lead Sponsor:</span>
                  <span className="font-semibold text-zinc-200">{selectedDeal.leadSponsor.name}</span>
                </div>
                <span className="font-mono text-emerald-400 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Audited Escrow Multi-Sig
                </span>
              </div>
            </div>
          )}

          {/* Commitment Form */}
          {isSuccess ? (
            <div className="p-6 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-center space-y-2 animate-in zoom-in-95 duration-200">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
              <div className="font-mono text-sm font-bold text-zinc-100">
                Allocation Committed & Signed On-Chain
              </div>
              <div className="text-xs font-mono text-zinc-400">
                Escrow receipt dispatched to hardware address {currentUser.walletAddress || '0x843C...E98DA'}.
              </div>
            </div>
          ) : (
            <form onSubmit={handleCommit} className="space-y-3">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div className="flex-1 relative">
                  <DollarSign className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={allocationAmount}
                    onChange={(e) => setAllocationAmount(e.target.value)}
                    placeholder="Enter allocation ticket (Min $100,000)"
                    className="w-full pl-9 pr-3 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs font-mono font-bold text-cyan-400 placeholder:text-zinc-600 focus:outline-none focus:border-cyan-500/50"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 text-black font-mono font-bold text-xs rounded-xl shadow-[0_0_20px_rgba(245,158,11,0.25)] flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Lock className="w-3.5 h-3.5" />
                      <span>Commit Wire to Escrow</span>
                    </>
                  )}
                </button>
              </div>
              <div className="text-xs font-mono text-zinc-400 flex items-center justify-between">
                <span>Minimum ticket: $100,000</span>
                <span>Zero transaction fees for Sovereign Black Card</span>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
};
