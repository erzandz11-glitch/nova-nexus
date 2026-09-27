import React, { useState, useEffect, useRef } from 'react';
import { User, LogOut, Shield, ChevronDown, Sparkles } from 'lucide-react';
import { NovaIdentityService, NovaUserProfile } from './novaIdentity';

interface NovaIdentityControlProps {
  className?: string;
  compact?: boolean;
}

export const NovaIdentityControl: React.FC<NovaIdentityControlProps> = ({
  className = '',
  compact = false,
}) => {
  const [profile, setProfile] = useState<NovaUserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 1. Initial profile fetch
    NovaIdentityService.getUserProfile()
      .then((p) => {
        setProfile(p);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));

    // 2. Auth state subscription (login, logout, token refresh)
    const unsubscribe = NovaIdentityService.onAuthStateChange((_event, _session, userProfile) => {
      setProfile(userProfile);
      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignIn = async () => {
    setIsLoading(true);
    const { error } = await NovaIdentityService.signInWithGoogle();
    if (error) {
      console.warn('[NOVA ID] Sign in error:', error.message || error);
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    setIsLoading(true);
    setIsMenuOpen(false);
    await NovaIdentityService.signOut();
    setProfile(null);
    setIsLoading(false);
  };

  if (isLoading) {
    return (
      <div className={`h-8 w-8 rounded-xl bg-white/5 animate-pulse flex items-center justify-center ${className}`} />
    );
  }

  // 1. GUEST STATE -> Sign In with Google
  if (!profile) {
    return (
      <button
        onClick={handleSignIn}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-cyan-500/40 text-xs font-semibold text-zinc-200 hover:text-white transition-all cursor-pointer shadow-sm group ${className}`}
        title="Sign in with Google (NOVA ID)"
      >
        <svg className="w-3.5 h-3.5 group-hover:scale-110 transition-transform shrink-0" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
        </svg>
        <span className="hidden sm:inline">Sign In</span>
      </button>
    );
  }

  // 2. AUTHENTICATED STATE -> Avatar + Dropdown
  const initials = (profile.displayName || profile.email || 'U').charAt(0).toUpperCase();

  return (
    <div className={`relative ${className}`} ref={menuRef}>
      <button
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="flex items-center gap-2 p-1 pr-2.5 rounded-xl border border-white/10 hover:border-cyan-500/40 bg-white/[0.03] hover:bg-white/[0.06] transition-all cursor-pointer group"
        title={profile.displayName || profile.email || 'Account'}
      >
        {profile.avatarUrl ? (
          <img
            src={profile.avatarUrl}
            alt={profile.displayName || 'User'}
            className="w-7 h-7 rounded-lg object-cover ring-1 ring-white/20"
          />
        ) : (
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center font-bold text-xs text-white">
            {initials}
          </div>
        )}

        {!compact && (
          <div className="hidden lg:flex flex-col text-left min-w-0 max-w-[120px]">
            <span className="text-xs font-semibold text-zinc-200 truncate leading-tight group-hover:text-white">
              {profile.displayName || profile.email?.split('@')[0]}
            </span>
            <span className="text-[10px] font-mono text-cyan-400/80 truncate leading-tight">
              {profile.tierRank || 'Novice'}
            </span>
          </div>
        )}

        <ChevronDown className={`w-3 h-3 text-zinc-400 transition-transform ${isMenuOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* User Dropdown Menu */}
      {isMenuOpen && (
        <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-white/10 bg-[#060913]/95 p-2 shadow-2xl backdrop-blur-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="px-3 py-2 border-b border-white/10">
            <div className="text-xs font-bold text-white truncate">
              {profile.displayName || 'NOVA Member'}
            </div>
            <div className="text-[10px] font-mono text-zinc-400 truncate">
              {profile.email}
            </div>
            <div className="mt-1.5 flex items-center gap-1 text-[10px] font-mono text-cyan-400 bg-cyan-950/60 border border-cyan-500/30 px-1.5 py-0.5 rounded">
              <Sparkles className="w-2.5 h-2.5" />
              <span>{profile.tierRank || 'Novice Observer'}</span>
            </div>
          </div>

          <div className="p-1">
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
