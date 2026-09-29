import React, { useState } from 'react';
import { X, Send, Sparkles, TrendingUp, ShieldCheck, DollarSign, Tag, Radio, Layers } from 'lucide-react';
import { User, Channel, Attachment } from '../types';
import { sounds } from '../services/soundEffects';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeChannel: Channel;
  availableChannels: Channel[];
  currentUser: User;
  onPostCreated: (title: string, channelId: string, content: string, attachment?: Attachment) => void;
}

export const CreatePostModal: React.FC<CreatePostModalProps> = ({
  isOpen,
  onClose,
  activeChannel,
  availableChannels,
  currentUser,
  onPostCreated,
}) => {
  const [transmissionTitle, setTransmissionTitle] = useState<string>('');
  const [selectedChannelId, setSelectedChannelId] = useState<string>(activeChannel.id);
  const [intelContentPayload, setIntelContentPayload] = useState<string>('');
  
  // Optional deal metric attachment
  const [includeMetric, setIncludeMetric] = useState<boolean>(false);
  const [metricTitle, setMetricTitle] = useState<string>('');
  const [metricVal, setMetricVal] = useState<string>('');
  const [metricLabel, setMetricLabel] = useState<string>('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!intelContentPayload.trim()) return;

    let attachment: Attachment | undefined = undefined;
    if (includeMetric && metricTitle && metricVal) {
      attachment = {
        type: 'metric',
        title: metricTitle,
        subtitle: 'Verified by Nova Escrow Multi-Sig Protocol',
        metricValue: metricVal,
        metricLabel: metricLabel || 'Settled Volume',
        metricChange: '+18.4%',
        tag: 'Audited Escrow',
      };
    }

    sounds.playChime();
    onPostCreated(
      transmissionTitle.trim(),
      selectedChannelId || activeChannel.id,
      intelContentPayload.trim(),
      attachment
    );

    setTransmissionTitle('');
    setIntelContentPayload('');
    setIncludeMetric(false);
    setMetricTitle('');
    setMetricVal('');
    setMetricLabel('');
    onClose();
  };

  const currentSelectedChannel = availableChannels.find((c) => c.id === selectedChannelId) || activeChannel;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-2xl animate-in fade-in duration-200">
      
      {/* Background ambient gold vignette */}
      <div className="absolute w-[500px] h-[500px] bg-cyan-500/[0.04] rounded-full blur-[120px] pointer-events-none" />

      <div className="relative w-full max-w-lg bg-zinc-950/95 border border-cyan-500/30 backdrop-blur-2xl rounded-2xl shadow-[0_0_60px_rgba(0,0,0,0.95),0_0_30px_rgba(245,158,11,0.15)] overflow-hidden">
        
        {/* Gold hairline */}
        <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-cyan-400/80 to-transparent" />

        <button
          onClick={() => {
            sounds.playClick();
            onClose();
          }}
          className="absolute top-4 right-4 p-2 text-zinc-500 hover:text-zinc-200 transition-colors rounded-lg hover:bg-zinc-900/60 cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-4 h-4" />
        </button>

        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-5">
          <div className="space-y-1">
            <span className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-semibold block">
              SYNDICATE BROADCAST CONSOLE
            </span>
            <h3 className="font-sans text-xl sm:text-2xl font-bold tracking-tight text-zinc-100 flex items-center gap-2">
              <span>+ NEW DISPATCH</span>
            </h3>
            <p className="text-xs text-zinc-400">
              Transmit confidential intel, frameworks, or deal summaries to authorized syndicate principals.
            </p>
          </div>

          {/* User badge */}
          <div className="flex items-center gap-3 p-3 bg-zinc-900/60 border border-zinc-800/80 rounded-xl">
            <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${currentUser.avatarBg} border border-cyan-500/40 flex items-center justify-center text-xs font-semibold text-zinc-200 shrink-0`}>
              {currentUser.initials}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-semibold text-zinc-200 flex items-center gap-1.5 truncate">
                <span>{currentUser.name}</span>
                <span className="text-xs text-cyan-400/90 font-medium">[{currentUser.rank.toUpperCase()}]</span>
              </div>
              <div className="text-xs text-zinc-400 truncate">{currentUser.tier} · {currentUser.passId}</div>
            </div>
          </div>

          {/* Form Field 1: Transmission Title */}
          <div className="space-y-1.5">
            <label className="block text-xs font-mono uppercase tracking-wider text-zinc-300">
              Transmission Title
            </label>
            <input
              type="text"
              value={transmissionTitle}
              onChange={(e) => setTransmissionTitle(e.target.value)}
              placeholder="e.g. Q4 Alpha Liquidity Mandate & Autonomous Video Agents"
              className="w-full bg-zinc-900/80 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-cyan-500/50 font-sans"
            />
          </div>

          {/* Form Field 2: Channel Category / Destination */}
          <div className="space-y-1.5">
            <label className="block text-xs font-mono uppercase tracking-wider text-zinc-300">
              Channel Category & Destination
            </label>
            <div className="relative">
              <select
                value={selectedChannelId}
                onChange={(e) => setSelectedChannelId(e.target.value)}
                className="w-full appearance-none bg-zinc-900/80 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-500/50 cursor-pointer"
              >
                {availableChannels
                  .filter((c) => c.id !== 'arena-overview')
                  .map((c) => (
                    <option key={c.id} value={c.id} className="bg-zinc-950 text-zinc-200">
                      {c.category} → {c.symbol} {c.name}
                    </option>
                  ))}
              </select>
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500 text-xs">
                ▼
              </div>
            </div>
            <div className="text-xs text-zinc-400">
              Selected room: <span className="text-zinc-300">{currentSelectedChannel.name}</span> ({currentSelectedChannel.category})
            </div>
          </div>

          {/* Form Field 3: Intel Content Payload */}
          <div className="space-y-1.5">
            <label className="block text-xs font-mono uppercase tracking-wider text-zinc-300">
              Intel Content Payload
            </label>
            <textarea
              rows={4}
              required
              value={intelContentPayload}
              onChange={(e) => setIntelContentPayload(e.target.value)}
              placeholder="Enter verified operational findings, pricing models, programmatic pipelines, or confidential strategic allocation details..."
              className="w-full bg-zinc-900/80 border border-zinc-800 rounded-xl p-3.5 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-cyan-500/50 resize-none leading-relaxed font-sans"
            />
          </div>

          {/* Optional Deal Metric attachment toggle */}
          <div className="space-y-3 pt-1 border-t border-zinc-900">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-zinc-400 flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
                Attach Audited Deal / Revenue Proof
              </span>
              <button
                type="button"
                onClick={() => setIncludeMetric(!includeMetric)}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  includeMetric ? 'bg-cyan-500' : 'bg-zinc-800'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-black shadow-lg ring-0 transition duration-200 ease-in-out ${
                    includeMetric ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {includeMetric && (
              <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-cyan-500/20 space-y-3 animate-in fade-in duration-200">
                <input
                  type="text"
                  value={metricTitle}
                  onChange={(e) => setMetricTitle(e.target.value)}
                  placeholder="Metric Title (e.g. Q4 Secondary Liquidity Pool)"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-cyan-500/40 font-mono"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={metricVal}
                    onChange={(e) => setMetricVal(e.target.value)}
                    placeholder="Volume (e.g. $1,850,000)"
                    className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-cyan-400 font-bold placeholder:text-zinc-600 focus:outline-none focus:border-cyan-500/40 font-mono"
                  />
                  <input
                    type="text"
                    value={metricLabel}
                    onChange={(e) => setMetricLabel(e.target.value)}
                    placeholder="Label (e.g. Net Settled Volume)"
                    className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-300 placeholder:text-zinc-600 focus:outline-none focus:border-cyan-500/40 font-mono"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Submit Action */}
          <div className="flex items-center justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                onClose();
              }}
              className="px-4 py-2.5 text-xs font-mono text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!intelContentPayload.trim()}
              className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 via-cyan-400 to-cyan-500 hover:from-cyan-400 hover:to-cyan-300 text-black font-mono font-bold text-xs rounded-xl shadow-[0_0_20px_rgba(245,158,11,0.25)] flex items-center gap-2 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Broadcast Dispatch</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
