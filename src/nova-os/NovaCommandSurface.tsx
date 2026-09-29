import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Search,
  ArrowRight,
  Sparkles,
  Compass,
  Cpu,
  Brain,
  Users,
  ShoppingBag,
  ExternalLink,
  History,
  CornerDownLeft,
  X,
  Zap,
  Globe,
} from 'lucide-react';
import { GLOBAL_COMMANDS, NOVA_ENVIRONMENTS } from './novaRegistry';
import { NovaCommand, NovaEnvironment, NovaSessionState } from './novaTypes';
import { NovaStateManager } from './novaState';
import { sounds } from '../services/soundEffects';

interface CommandSurfaceProps {
  isOpen: boolean;
  onClose: () => void;
  currentEnvironment?: NovaEnvironment;
}

export const NovaCommandSurface: React.FC<CommandSurfaceProps> = ({
  isOpen,
  onClose,
  currentEnvironment = 'community',
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [lastSession, setLastSession] = useState<NovaSessionState | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      sounds.playClick();
      setLastSession(NovaStateManager.getLastSession());
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const filteredCommands = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return GLOBAL_COMMANDS;

    return GLOBAL_COMMANDS.filter((cmd) => {
      const matchLabel = cmd.label.toLowerCase().includes(q);
      const matchSubtitle = cmd.subtitle?.toLowerCase().includes(q);
      const matchKeywords = cmd.keywords?.some((k) => k.toLowerCase().includes(q));
      return matchLabel || matchSubtitle || matchKeywords;
    });
  }, [query]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % (filteredCommands.length + (lastSession ? 1 : 0)));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        const total = filteredCommands.length + (lastSession ? 1 : 0);
        setSelectedIndex((prev) => (prev - 1 + total) % total);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        executeCurrentSelection();
      }
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, selectedIndex, filteredCommands, lastSession]);

  const executeCommand = (cmd: NovaCommand) => {
    sounds.playChime();
    NovaStateManager.recordCommandExecution(cmd.id);
    onClose();

    if (cmd.action) {
      cmd.action();
    } else if (cmd.url) {
      if (cmd.url.startsWith('http')) {
        window.open(cmd.url, '_blank', 'noopener,noreferrer');
      } else {
        window.location.href = cmd.url;
      }
    }
  };

  const resumeSession = (session: NovaSessionState) => {
    sounds.playChime();
    onClose();
    window.location.href = session.lastRoute;
  };

  const executeCurrentSelection = () => {
    if (lastSession && selectedIndex === 0) {
      resumeSession(lastSession);
      return;
    }
    const offset = lastSession ? 1 : 0;
    const cmd = filteredCommands[selectedIndex - offset];
    if (cmd) {
      executeCommand(cmd);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-150">
      <div className="w-full max-w-2xl rounded-2xl bg-[#060913] border border-white/10 shadow-[0_25px_70px_rgba(0,0,0,0.95)] overflow-hidden text-zinc-100 flex flex-col max-h-[80vh]">
        {/* Top Search Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-white/10 gap-3 bg-[#0a0f20]/90 shrink-0">
          <Search className="w-4 h-4 text-cyan-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Search commands, faculties, studios, or teleport (G+M, G+P)..."
            className="flex-1 bg-transparent border-none text-sm text-white placeholder:text-zinc-500 focus:outline-none font-mono"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded-lg text-zinc-500 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <kbd className="hidden sm:inline-block px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] font-mono text-zinc-400">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div ref={listRef} className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-thin">
          {/* 1. Resume Last Session */}
          {lastSession && !query && (
            <div className="mb-2">
              <div className="px-3 py-1 text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-bold flex items-center gap-1.5">
                <History className="w-3 h-3 text-cyan-400" />
                <span>Continue Where You Left Off</span>
              </div>
              <div
                onClick={() => resumeSession(lastSession)}
                className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-all ${
                  selectedIndex === 0
                    ? 'bg-cyan-500/15 border border-cyan-500/40 text-white'
                    : 'hover:bg-white/5 border border-transparent text-zinc-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white flex items-center gap-2">
                      <span>{lastSession.lastTitle}</span>
                      <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                        {NOVA_ENVIRONMENTS[lastSession.lastEnvironment]?.badge || 'RESUME'}
                      </span>
                    </div>
                    <div className="text-[10px] text-zinc-400 font-mono">
                      Last accessed {new Date(lastSession.lastTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-[11px] font-mono text-cyan-400">
                  <span>Resume</span>
                  <ArrowRight className="w-3 h-3" />
                </div>
              </div>
            </div>
          )}

          {/* 2. Grouped Commands */}
          {filteredCommands.length === 0 ? (
            <div className="py-12 text-center text-zinc-500">
              <p className="text-xs font-mono">No matching commands found for &ldquo;{query}&rdquo;</p>
              <p className="text-[11px] text-zinc-600 mt-1">Try searching for &quot;arena&quot;, &quot;mind&quot;, &quot;war room&quot;, or &quot;godot&quot;</p>
            </div>
          ) : (
            filteredCommands.map((cmd, idx) => {
              const itemIndex = idx + (lastSession && !query ? 1 : 0);
              const isSelected = itemIndex === selectedIndex;
              const envMeta = NOVA_ENVIRONMENTS[cmd.environment];

              return (
                <div
                  key={cmd.id}
                  onClick={() => executeCommand(cmd)}
                  className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-white/10 border border-cyan-500/40 text-white shadow-sm'
                      : 'hover:bg-white/5 border border-transparent text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-7 h-7 rounded-lg bg-gradient-to-tr ${envMeta.color} p-[1px] shrink-0`}>
                      <div className="w-full h-full bg-[#060913] rounded-lg flex items-center justify-center">
                        <span className="text-[9px] font-bold text-white font-mono">{envMeta.badge.slice(0, 2)}</span>
                      </div>
                    </div>

                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-zinc-200 truncate flex items-center gap-2">
                        <span>{cmd.label}</span>
                        {cmd.badge && (
                          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-white/5 text-zinc-400 border border-white/10">
                            {cmd.badge}
                          </span>
                        )}
                      </div>
                      {cmd.subtitle && (
                        <div className="text-[10px] text-zinc-500 truncate mt-0.5">
                          {cmd.subtitle}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 pl-2">
                    {cmd.shortcut && (
                      <kbd className="hidden sm:inline-block px-2 py-0.5 rounded bg-zinc-900 border border-zinc-700/80 text-[10px] font-mono text-zinc-300">
                        {cmd.shortcut}
                      </kbd>
                    )}
                    {isSelected && (
                      <CornerDownLeft className="w-3.5 h-3.5 text-cyan-400" />
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Bottom Bar */}
        <div className="px-4 py-2 border-t border-white/10 bg-[#04060d] flex items-center justify-between text-[11px] font-mono text-zinc-500 shrink-0">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-[10px] text-zinc-400">↑↓</kbd>
              Navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-[10px] text-zinc-400">↵</kbd>
              Execute
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-zinc-400">
            <span>Teleport:</span>
            <span className="text-cyan-400">G+H</span> (HQ)
            <span className="text-cyan-400">G+M</span> (Mind)
            <span className="text-cyan-400">G+P</span> (Producer)
            <span className="text-cyan-400">G+A</span> (Art)
            <span className="text-cyan-400">G+C</span> (Community)
          </div>
        </div>
      </div>
    </div>
  );
};
