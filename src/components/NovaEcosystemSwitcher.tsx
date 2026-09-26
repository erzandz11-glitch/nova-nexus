import React, { useState, useRef, useEffect } from 'react';
import { 
  Globe, 
  Brain, 
  Users, 
  Cpu, 
  Sparkles, 
  ChevronDown, 
  ExternalLink,
  Layers
} from 'lucide-react';

export const NOVA_ECOSYSTEM = [
  {
    id: 'platform',
    name: 'NOVA Platform',
    tagline: 'Autonomous Creator Hub & Sovereign Marketplace',
    url: 'https://nova-platfrom.vercel.app',
    color: 'from-cyan-500 to-blue-600',
    badge: 'MAIN HUB',
    icon: Globe,
  },
  {
    id: 'mind',
    name: 'NOVA Mind',
    tagline: '7 Frontier Faculties & Interactive Sandboxes',
    url: 'https://nova-mindset.vercel.app',
    color: 'from-blue-500 to-indigo-600',
    badge: 'ACADEMY',
    icon: Brain,
  },
  {
    id: 'community',
    name: 'NOVA Community',
    tagline: 'Private Creator Syndicate & OTC Desk',
    url: 'https://novacommunity.vercel.app',
    color: 'from-amber-500 to-orange-600',
    badge: 'SYNDICATE',
    icon: Users,
    isCurrent: true,
  },
  {
    id: 'producer',
    name: 'NOVA Producer',
    tagline: 'AI Studio, War Room & Production OS',
    url: 'https://nova-company.vercel.app',
    color: 'from-violet-500 to-purple-600',
    badge: 'STUDIO',
    icon: Cpu,
  },
  {
    id: 'artlabs',
    name: 'NOVA Art Labs',
    tagline: 'Visual Media Studio & Cinematic Generation',
    url: 'https://nova-artlabs.vercel.app',
    color: 'from-fuchsia-500 to-pink-600',
    badge: 'ART LAB',
    icon: Sparkles,
  },
];

export const NovaEcosystemSwitcher: React.FC<{ currentId?: string }> = ({ currentId = 'community' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-xs font-mono text-amber-300 hover:text-white transition-all shadow-[0_0_12px_rgba(245,158,11,0.2)] cursor-pointer"
      >
        <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
        <span className="font-semibold tracking-wide hidden sm:inline">NOVA Matrix</span>
        <ChevronDown className={`w-3.5 h-3.5 text-amber-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-2 w-72 rounded-2xl bg-[#090d18]/95 backdrop-blur-2xl border border-amber-500/30 p-2 shadow-[0_20px_50px_rgba(0,0,0,0.9)] z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="px-3 py-2 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-400" />
              <span className="text-[11px] font-mono uppercase tracking-widest text-zinc-300 font-bold">
                NOVA 5-Platform Matrix
              </span>
            </div>
            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
              Live
            </span>
          </div>

          <div className="py-1.5 space-y-1">
            {NOVA_ECOSYSTEM.map((platform) => {
              const IconComponent = platform.icon;
              const isCurrent = platform.id === currentId;

              return (
                <a
                  key={platform.id}
                  href={platform.url}
                  target={isCurrent ? '_self' : '_blank'}
                  rel="noopener noreferrer"
                  className={`flex items-start gap-3 p-2.5 rounded-xl transition-all cursor-pointer ${
                    isCurrent 
                      ? 'bg-amber-500/15 border border-amber-500/40 text-white' 
                      : 'hover:bg-white/5 border border-transparent text-zinc-400 hover:text-white'
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-tr ${platform.color} p-[1px] shrink-0 mt-0.5 shadow-md`}>
                    <div className="w-full h-full bg-[#090d18] rounded-lg flex items-center justify-center">
                      <IconComponent className="w-4 h-4 text-white" />
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs font-bold tracking-tight text-white truncate">
                        {platform.name}
                      </span>
                      <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-white/10 text-zinc-300 border border-white/10 shrink-0">
                        {platform.badge}
                      </span>
                    </div>
                    <p className="text-[10px] text-zinc-400 truncate mt-0.5">
                      {platform.tagline}
                    </p>
                  </div>

                  {!isCurrent && (
                    <ExternalLink className="w-3.5 h-3.5 text-zinc-500 mt-1 shrink-0 group-hover:text-amber-400" />
                  )}
                </a>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
