import React, { useState } from 'react';
import { X, Briefcase, TrendingUp, ShieldCheck, CheckCircle2, Lock, Plus, DollarSign, Sparkles } from 'lucide-react';
import { OTCDeal, User } from '../types';
import { sounds } from '../services/soundEffects';

interface DealRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  deals: OTCDeal[];
  currentUser: User;
  onCommitAllocation?: (dealId: string, amount: number) => void;
  onCreateDeal?: (newDeal: OTCDeal) => void;
}

export const DealRoomModal: React.FC<DealRoomModalProps> = ({
  isOpen,
  onClose,
  deals,
  currentUser,
  onCommitAllocation,
  onCreateDeal,
}) => {
  const [selectedDeal, setSelectedDeal] = useState<OTCDeal | null>(deals[0] || null);
  const [allocationAmount, setAllocationAmount] = useState<string>('100000');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  // New Deal Creation State
  const [isCreatingNew, setIsCreatingNew] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState<string>('');
  const [newNiche, setNewNiche] = useState<string>('AI & Automation');
  const [newTotalAllocation, setNewTotalAllocation] = useState<string>('500000');
  const [newExpectedYield, setNewExpectedYield] = useState<string>('24% APY');
  const [newTerm, setNewTerm] = useState<string>('12');

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

  const handleCreateNewDeal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const total = parseInt(newTotalAllocation.replace(/\D/g, ''), 10) || 500000;
    const term = parseInt(newTerm, 10) || 12;

    const createdDeal: OTCDeal = {
      id: `deal-${Date.now()}`,
      title: newTitle.trim(),
      targetCompany: `${currentUser.name} Syndicate Special Vehicle`,
      niche: newNiche,
      totalAmount: total,
      totalAllocation: total,
      filledAmount: 0,
      expectedYield: newExpectedYield || '20% APY',
      termMonths: term,
      minTicket: 25000,
      leadSponsor: currentUser,
      status: 'Active',
    };

    sounds.playChime();
    if (onCreateDeal) {
      onCreateDeal(createdDeal);
    }
    setSelectedDeal(createdDeal);
    setIsCreatingNew(false);
    setNewTitle('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-3xl animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[#090d16] border border-cyan-500/30 rounded-2xl shadow-[0_0_60px_rgba(0,0,0,0.9),0_0_35px_rgba(6,182,212,0.15)] overflow-hidden">
        
        {/* Hairline Cyan Accent */}
        <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />

        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-slate-800/60 z-10"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-mono uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-cyan-400" />
                OTC Escrow & Syndicate Desk
              </span>
              <h2 className="font-sans text-xl sm:text-2xl font-bold tracking-tight text-white">
                HIGH-TICKET CO-INVESTMENT TRANCHES
              </h2>
            </div>

            <button
              onClick={() => {
                sounds.playClick();
                setIsCreatingNew(!isCreatingNew);
              }}
              className="px-3 py-1.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-300 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isCreatingNew ? 'Browse Tranches' : 'Propose Deal'}</span>
            </button>
          </div>

          {/* Form Create New Deal */}
          {isCreatingNew ? (
            <form onSubmit={handleCreateNewDeal} className="p-5 rounded-xl bg-slate-950/80 border border-cyan-500/30 space-y-4">
              <div className="text-xs font-bold text-cyan-300 uppercase tracking-wide flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>Create New Sovereign OTC Tranche</span>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">Tranche Title / Target Entity</label>
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. AI Video Cluster Tranche V or SaaS Buyout"
                    className="w-full px-3.5 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 block mb-1">Niche</label>
                    <select
                      value={newNiche}
                      onChange={(e) => setNewNiche(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-400"
                    >
                      <option value="AI & Automation">AI & Automation</option>
                      <option value="High-Ticket B2B">High-Ticket B2B</option>
                      <option value="Media Syndication">Media Syndication</option>
                      <option value="SaaS Infrastructure">SaaS Infrastructure</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 block mb-1">Total Cap ($ USD)</label>
                    <input
                      type="text"
                      value={newTotalAllocation}
                      onChange={(e) => setNewTotalAllocation(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-400"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 block mb-1">Expected APY</label>
                    <input
                      type="text"
                      value={newExpectedYield}
                      onChange={(e) => setNewExpectedYield(e.target.value)}
                      placeholder="e.g. 24% APY"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-bold text-xs rounded-xl shadow-lg transition cursor-pointer"
                >
                  Broadcast Tranche to Escrow Pool
                </button>
              </div>
            </form>
          ) : (
            <>
              {/* Deal Selector Tabs */}
              {deals.length > 0 ? (
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
                            ? 'bg-slate-900/90 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                            : 'bg-slate-950/60 border-slate-850 hover:border-slate-700'
                        }`}
                      >
                        <div className="text-[10px] font-mono text-cyan-400 font-semibold uppercase truncate">
                          {deal.niche}
                        </div>
                        <div className="text-xs font-bold text-white truncate mt-0.5">
                          {deal.title}
                        </div>
                        <div className="mt-2 text-xs font-mono text-slate-400 flex items-center justify-between">
                          <span>{formatCurrency(deal.totalAllocation)}</span>
                          <span className="text-emerald-400 font-bold">{fillPct}%</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="p-6 text-center rounded-xl bg-slate-900/40 border border-slate-800 space-y-2">
                  <div className="text-xs font-semibold text-white">No active OTC Tranches currently registered</div>
                  <p className="text-[11px] text-slate-400">Be the first sponsor to propose a high-ticket co-investment.</p>
                </div>
              )}

              {/* Selected Deal Details Card */}
              {selectedDeal && (
                <div className="p-5 rounded-xl bg-slate-950/80 border border-cyan-500/20 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/[0.06] pb-3">
                    <div>
                      <h3 className="font-bold text-white text-sm">{selectedDeal.title}</h3>
                      <div className="text-xs text-slate-400 font-mono">Entity: {selectedDeal.targetCompany}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-cyan-400 px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20">
                        {selectedDeal.expectedYield}
                      </span>
                      <span className="text-xs font-mono text-slate-400">
                        {selectedDeal.termMonths} Mo Term
                      </span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="space-y-1.5 font-mono">
                    <div className="flex justify-between text-xs text-slate-400">
                      <span>Tranche Allocation Progress</span>
                      <span className="text-slate-200">
                        {formatCurrency(selectedDeal.filledAmount)} / {formatCurrency(selectedDeal.totalAllocation)}
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden border border-slate-800">
                      <div
                        className="h-full bg-gradient-to-r from-cyan-600 via-cyan-400 to-sky-300 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, (selectedDeal.filledAmount / selectedDeal.totalAllocation) * 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Lead sponsor */}
                  <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-white/[0.06]">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500 font-mono">Lead Sponsor:</span>
                      <span className="font-semibold text-white">{selectedDeal.leadSponsor.name}</span>
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
                  <div className="font-mono text-sm font-bold text-white">
                    Allocation Committed & Signed On-Chain
                  </div>
                  <div className="text-xs font-mono text-slate-400">
                    Escrow receipt dispatched to hardware address {currentUser.walletAddress || '0x843C...E98DA'}.
                  </div>
                </div>
              ) : selectedDeal ? (
                <form onSubmit={handleCommit} className="space-y-3">
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <div className="flex-1 relative">
                      <DollarSign className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={allocationAmount}
                        onChange={(e) => setAllocationAmount(e.target.value)}
                        placeholder="Enter allocation ticket"
                        className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono font-bold text-cyan-300 placeholder:text-slate-600 focus:outline-none focus:border-cyan-400"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-mono font-bold text-xs rounded-xl shadow-[0_0_20px_rgba(6,182,212,0.3)] flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
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
                </form>
              ) : null}
            </>
          )}

        </div>
      </div>
    </div>
  );
};
