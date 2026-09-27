import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Command,
  ChevronDown,
  Menu,
  ExternalLink,
  Zap,
  User as UserIcon,
} from 'lucide-react';
import { NOVA_ENVIRONMENTS } from './novaRegistry';
import { NovaNavigationProps } from './novaNavTypes';
import { NovaEnvironment } from './novaTypes';

export const NovaNavigationLayer: React.FC<NovaNavigationProps> = ({
  currentEnvironment = 'community',
  breadcrumbs = [],
  onOpenCommandSurface,
  xpValue,
  xpLevel,
  userProfile,
  customActions,
  customStatus,
  onToggleSidebar,
  showSidebarToggle = false,
}) => {
  const [isEnvDropdownOpen, setIsEnvDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const currentEnvMeta = NOVA_ENVIRONMENTS[currentEnvironment];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsEnvDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const triggerCommand = () => {
    if (onOpenCommandSurface) {
      onOpenCommandSurface();
    } else if (typeof window !== 'undefined') {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }));
    }
  };

  const getEnvColorClasses = (env: NovaEnvironment) => {
    switch (env) {
      case 'platform':
        return {
          glow: 'shadow-[0_0_15px_rgba(6,182,212,0.35)]',
          border: 'border-cyan-500/40',
          text: 'text-cyan-400',
          bg: 'bg-cyan-500/10',
          accent: 'from-cyan-400 to-blue-500',
        };
      case 'mind':
        return {
          glow: 'shadow-[0_0_15px_rgba(56,189,248,0.35)]',
          border: 'border-sky-500/40',
          text: 'text-sky-400',
          bg: 'bg-sky-500/10',
          accent: 'from-blue-400 to-indigo-500',
        };
      case 'producer':
        return {
          glow: 'shadow-[0_0_15px_rgba(168,85,247,0.35)]',
          border: 'border-violet-500/40',
          text: 'text-violet-400',
          bg: 'bg-violet-500/10',
          accent: 'from-violet-400 to-purple-500',
        };
      case 'artlabs':
        return {
          glow: 'shadow-[0_0_15px_rgba(244,114,182,0.35)]',
          border: 'border-pink-500/40',
          text: 'text-pink-400',
          bg: 'bg-pink-500/10',
          accent: 'from-fuchsia-400 to-pink-500',
        };
      case 'community':
        return {
          glow: 'shadow-[0_0_15px_rgba(251,191,36,0.35)]',
          border: 'border-amber-500/40',
          text: 'text-amber-400',
          bg: 'bg-amber-500/10',
          accent: 'from-amber-400 to-orange-500',
        };
    }
  };

  const envTheme = getEnvColorClasses(currentEnvironment);

  return (
    <header className="sticky top-0 z-40 w-full bg-[#030712]/90 backdrop-blur-2xl border-b border-white/[0.08] text-zinc-100 select-none transition-colors duration-200">
      {/* 1. Main Navigation Bar */}
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-3 sm:px-6 lg:px-8 gap-2 sm:gap-4">
        
        {/* Left: Identity + Environment Indicator Dropdown */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0" ref={dropdownRef}>
          {showSidebarToggle && (
            <button
              onClick={onToggleSidebar}
              className="lg:hidden p-2 rounded-xl text-zinc-400 hover:text-white bg-white/[0.03] border border-white/10 hover:border-white/20 transition-all cursor-pointer"
              aria-label="Toggle navigation drawer"
            >
              <Menu className="w-4 h-4" />
            </button>
          )}

          {/* NOVA Abstract Logo Mark */}
          <a
            href={currentEnvMeta.url}
            className="flex items-center gap-2.5 group cursor-pointer"
            title="NOVA OS Home"
          >
            <div className={`relative flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-xl p-[1px] bg-gradient-to-tr ${envTheme.accent} ${envTheme.glow} group-hover:scale-105 transition-transform overflow-hidden shrink-0`}>
              <div className="w-full h-full bg-[#030712] rounded-[11px] flex items-center justify-center">
                <span className="font-mono font-black text-sm text-white tracking-tighter">N</span>
              </div>
            </div>
            
            <div className="hidden min-[400px]:flex flex-col">
              <span className="font-bold text-sm tracking-tight text-white flex items-center gap-1.5 leading-none">
                NOVA
                <span className="text-[10px] font-mono text-zinc-500 font-normal">OS</span>
              </span>
            </div>
          </a>

          {/* Divider */}
          <span className="text-zinc-700 text-sm hidden min-[480px]:inline">/</span>

          {/* Environment Switcher Trigger */}
          <div className="relative">
            <button
              onClick={() => setIsEnvDropdownOpen(!isEnvDropdownOpen)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border ${envTheme.border} ${envTheme.bg} ${envTheme.text} hover:brightness-110 transition-all text-xs font-mono font-bold tracking-wider cursor-pointer shadow-sm`}
            >
              <span>{currentEnvMeta.badge}</span>
              <ChevronDown className={`w-3 h-3 opacity-70 transition-transform ${isEnvDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Fast Environment Teleport Dropdown */}
            {isEnvDropdownOpen && (
              <div className="absolute left-0 mt-2 w-64 rounded-2xl border border-white/10 bg-[#060913]/95 p-2 shadow-2xl backdrop-blur-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-2.5 py-1.5 text-[10px] font-mono tracking-widest text-zinc-400 uppercase">
                  NOVA Environments
                </div>
                <div className="space-y-1">
                  {(Object.keys(NOVA_ENVIRONMENTS) as NovaEnvironment[]).map((envKey) => {
                    const env = NOVA_ENVIRONMENTS[envKey];
                    const isCurrent = envKey === currentEnvironment;
                    const itemTheme = getEnvColorClasses(envKey);

                    return (
                      <a
                        key={envKey}
                        href={env.url}
                        className={`flex items-center justify-between p-2 rounded-xl text-xs transition-all ${
                          isCurrent
                            ? 'bg-white/10 text-white font-bold border border-white/15'
                            : 'text-zinc-300 hover:bg-white/5 hover:text-white border border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className={`w-2 h-2 rounded-full bg-gradient-to-r ${itemTheme.accent}`} />
                          <div className="truncate">
                            <div>{env.name}</div>
                            <div className="text-[10px] text-zinc-500 font-mono">{env.label}</div>
                          </div>
                        </div>
                        {isCurrent ? (
                          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-white/10 text-zinc-300">
                            CURRENT
                          </span>
                        ) : (
                          <ExternalLink className="w-3 h-3 text-zinc-500" />
                        )}
                      </a>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Center: Universal Command Search Bar (Desktop) */}
        <div className="hidden md:flex flex-1 max-w-md mx-2 lg:mx-6">
          <button
            onClick={triggerCommand}
            type="button"
            className="w-full flex items-center justify-between px-3.5 py-1.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 hover:border-white/20 text-xs text-zinc-400 hover:text-zinc-200 transition-all group shadow-inner cursor-pointer"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <Search className={`w-3.5 h-3.5 ${envTheme.text} group-hover:scale-110 transition-transform`} />
              <span className="truncate">Search syndicate channels, deals, arena...</span>
            </div>
            <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md bg-black/50 border border-white/10 text-[10px] font-mono text-zinc-400">
              <Command className="w-2.5 h-2.5" /> K
            </kbd>
          </button>
        </div>

        {/* Right: Actions, Status & Profile */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          
          {/* Custom Status Slot */}
          {customStatus && <div className="hidden lg:flex items-center">{customStatus}</div>}

          {/* Mobile & Tablet Command Trigger Button (P0) */}
          <button
            onClick={triggerCommand}
            type="button"
            className="md:hidden flex items-center justify-center p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-zinc-300 hover:text-white cursor-pointer transition-all"
            aria-label="Open Command Search"
            title="Open Command Search (⌘K)"
          >
            <Search className={`w-4 h-4 ${envTheme.text}`} />
          </button>

          {/* XP Gamification Badge */}
          {xpValue !== undefined && (
            <div
              onClick={triggerCommand}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-gradient-to-r from-white/[0.04] to-white/[0.02] border border-white/10 text-xs font-mono cursor-pointer hover:border-white/20 transition-all"
              title="NOVA User XP"
            >
              <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400/30" />
              <span className="font-bold text-white">{xpValue.toLocaleString()}</span>
              {xpLevel !== undefined && (
                <span className="text-[10px] text-zinc-500 hidden sm:inline">Lv.{xpLevel}</span>
              )}
            </div>
          )}

          {/* Custom Platform Actions */}
          {customActions && <div className="flex items-center gap-1.5 sm:gap-2">{customActions}</div>}

          {/* User Profile Avatar / Sign In */}
          {userProfile ? (
            <div
              onClick={userProfile.onClick}
              className="flex items-center gap-2 p-1 pr-2 rounded-xl border border-white/10 hover:border-white/25 bg-white/[0.02] cursor-pointer transition-all"
              title={userProfile.name || userProfile.email || 'Profile'}
            >
              {userProfile.avatarUrl ? (
                <img
                  src={userProfile.avatarUrl}
                  alt={userProfile.name || 'User'}
                  className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg object-cover"
                />
              ) : (
                <div className={`w-6 h-6 sm:w-7 sm:h-7 rounded-lg ${envTheme.bg} ${envTheme.text} flex items-center justify-center font-bold text-xs`}>
                  {userProfile.name?.charAt(0) || userProfile.email?.charAt(0) || <UserIcon className="w-3.5 h-3.5" />}
                </div>
              )}
              {userProfile.name && (
                <span className="text-xs font-semibold text-zinc-200 hidden xl:inline max-w-[100px] truncate">
                  {userProfile.name}
                </span>
              )}
            </div>
          ) : null}
        </div>
      </div>

      {/* 2. Context Breadcrumbs Sub-Bar */}
      {breadcrumbs.length > 0 && (
        <div className="border-t border-white/[0.05] bg-[#02050c]/80 px-3 sm:px-6 lg:px-8 py-1.5 flex items-center overflow-x-auto no-scrollbar gap-1.5 text-[11px] font-mono text-zinc-400">
          <span className="text-zinc-600 shrink-0 font-bold">NOVA OS</span>
          <span className="text-zinc-700 shrink-0">/</span>
          <span className={`shrink-0 font-semibold ${envTheme.text}`}>
            {currentEnvMeta.badge}
          </span>

          {breadcrumbs.map((crumb, idx) => {
            const isLast = idx === breadcrumbs.length - 1;
            return (
              <React.Fragment key={idx}>
                <span className="text-zinc-700 shrink-0">/</span>
                {crumb.onClick ? (
                  <button
                    onClick={crumb.onClick}
                    className={`shrink-0 hover:text-white transition-colors cursor-pointer ${
                      isLast ? 'text-zinc-100 font-bold' : 'text-zinc-400'
                    }`}
                  >
                    {crumb.label}
                  </button>
                ) : crumb.href ? (
                  <a
                    href={crumb.href}
                    className={`shrink-0 hover:text-white transition-colors ${
                      isLast ? 'text-zinc-100 font-bold' : 'text-zinc-400'
                    }`}
                  >
                    {crumb.label}
                  </a>
                ) : (
                  <span
                    className={`shrink-0 ${
                      isLast ? 'text-zinc-200 font-semibold' : 'text-zinc-400'
                    }`}
                  >
                    {crumb.label}
                  </span>
                )}
              </React.Fragment>
            );
          })}
        </div>
      )}
    </header>
  );
};
