import React, { useState } from 'react';
import { ArrowRight, Sparkles, X, Compass, ExternalLink } from 'lucide-react';
import { NovaContinuityRecord } from './novaIdentity';
import { NOVA_ENVIRONMENTS } from './novaRegistry';

interface NovaContinuityBannerProps {
  continuity: NovaContinuityRecord | null;
  onDismiss?: () => void;
}

export const NovaContinuityBanner: React.FC<NovaContinuityBannerProps> = ({
  continuity,
  onDismiss,
}) => {
  const [isVisible, setIsVisible] = useState(true);

  if (!continuity || !isVisible) return null;

  const targetMeta = NOVA_ENVIRONMENTS[continuity.targetEnvironment];

  const handleResume = () => {
    if (typeof window !== 'undefined' && targetMeta?.url) {
      window.location.href = `${targetMeta.url}${continuity.route || ''}`;
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full animate-in slide-in-from-bottom-5 fade-in duration-300">
      <div className="relative p-3.5 rounded-2xl bg-[#070b19]/95 border border-cyan-500/40 shadow-[0_10px_35px_rgba(0,0,0,0.8)] backdrop-blur-2xl text-white">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shrink-0">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-bold">
                Continue Where You Left Off
              </div>
              <div className="text-xs font-bold text-zinc-100 line-clamp-1">
                {continuity.title}
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              setIsVisible(false);
              onDismiss?.();
            }}
            className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
            aria-label="Dismiss banner"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="mt-2.5 flex items-center justify-between pt-2 border-t border-white/[0.08]">
          <span className="text-[10px] font-mono text-zinc-400">
            Target: <span className="text-zinc-200 font-bold">{targetMeta?.name || continuity.targetEnvironment}</span>
          </span>

          <button
            onClick={handleResume}
            className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/50 text-xs font-bold text-cyan-300 hover:text-white transition-all cursor-pointer shadow-sm"
          >
            <span>Resume</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};
