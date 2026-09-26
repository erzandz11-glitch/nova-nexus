import React, { useState, useEffect } from 'react';
import { ShieldCheck, Activity, ArrowUpRight, CheckCircle2, Lock, Radio } from 'lucide-react';
import { EscrowTransaction } from '../types';
import { sounds } from '../services/soundEffects';

interface EscrowTickerProps {
  transactions: EscrowTransaction[];
  onSelectTx?: (tx: EscrowTransaction) => void;
}

export const EscrowTicker: React.FC<EscrowTickerProps> = ({ transactions, onSelectTx }) => {
  const [selectedTx, setSelectedTx] = useState<EscrowTransaction | null>(null);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <>
      <div className="relative w-full h-8 bg-[#030304] border-b border-zinc-900 flex items-center overflow-hidden z-30 select-none text-xs font-mono text-zinc-400">
        {/* Left Live Anchor */}
        <div className="px-3 shrink-0 h-full bg-[#08080a] border-r border-zinc-900 flex items-center gap-1.5 z-10">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-xs uppercase font-bold tracking-wider text-zinc-300 hidden sm:inline">
            ORACLE PULSE
          </span>
          <span className="text-zinc-600">·</span>
          <span className="text-xs text-emerald-400">100% CONSENSUS</span>
        </div>

        {/* Marquee Streaming Strip */}
        <div className="flex-1 overflow-x-auto no-scrollbar flex items-center gap-6 px-4 whitespace-nowrap overflow-y-hidden">
          {transactions.map((tx) => (
            <button
              key={tx.id}
              onClick={() => {
                sounds.playClick();
                setSelectedTx(tx);
                if (onSelectTx) onSelectTx(tx);
              }}
              className="group flex items-center gap-2 hover:text-amber-300 transition-colors shrink-0 cursor-pointer"
            >
              <span className="text-xs text-zinc-500 font-mono">[{tx.timestamp}]</span>
              <span className="text-zinc-300 font-semibold">{tx.dealType}</span>
              <span className="text-amber-400 font-bold tabular-nums">
                {formatCurrency(tx.amount)}
              </span>
              <span className="text-zinc-600">→</span>
              <span className="text-zinc-400 max-w-[140px] truncate">{tx.recipient}</span>
              <span className="text-xs font-mono px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 group-hover:border-amber-500/40 group-hover:text-amber-400">
                {tx.nodeLocation}
              </span>
            </button>
          ))}
        </div>

        {/* Right Active Network Info */}
        <div className="hidden lg:flex items-center gap-2 px-3 shrink-0 h-full bg-[#08080a] border-l border-zinc-900 text-zinc-400 text-xs">
          <Activity className="w-3.5 h-3.5 text-amber-500/80" />
          <span>Throughput: 8,420 Tx/sec</span>
          <span className="text-zinc-700">·</span>
          <span>Latency: 11ms</span>
        </div>
      </div>

      {/* Transaction Details Modal */}
      {selectedTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-2xl animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-[#0a0a0d] border border-amber-500/30 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
              <span className="text-xs font-mono uppercase tracking-widest text-amber-400 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                Verified Escrow Proof
              </span>
              <button
                onClick={() => setSelectedTx(null)}
                className="text-zinc-500 hover:text-zinc-200 text-xs font-mono"
              >
                Close [ESC]
              </button>
            </div>

            <div className="space-y-3 text-xs font-mono">
              <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 space-y-1">
                <span className="text-xs text-zinc-400 uppercase">Settlement Value</span>
                <div className="text-2xl font-bold text-amber-400 tabular-nums">
                  {formatCurrency(selectedTx.amount)}
                </div>
                <div className="text-xs text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Multi-Sig Cryptographic Clearance Confirmed
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 rounded-lg bg-zinc-900/50 border border-zinc-800/80">
                  <span className="text-zinc-500 block">Deal Category</span>
                  <span className="text-zinc-200 font-semibold">{selectedTx.dealType}</span>
                </div>
                <div className="p-2 rounded-lg bg-zinc-900/50 border border-zinc-800/80">
                  <span className="text-zinc-500 block">Execution Node</span>
                  <span className="text-zinc-200 font-semibold">{selectedTx.nodeLocation}</span>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-zinc-900/50 border border-zinc-800/80 text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Transaction Hash</span>
                  <span className="text-amber-400 font-mono">{selectedTx.txHash}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Sender Escrow</span>
                  <span className="text-zinc-300 font-mono">{selectedTx.sender}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Recipient Beneficiary</span>
                  <span className="text-zinc-300 font-mono">{selectedTx.recipient}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setSelectedTx(null)}
              className="w-full py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700/60 rounded-xl text-xs font-mono transition-colors"
            >
              Dismiss Ledger Receipt
            </button>
          </div>
        </div>
      )}
    </>
  );
};
