import React, { useState, useEffect } from 'react';
import {
  Brain,
  Cpu,
  Sparkles,
  ShoppingBag,
  Users,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  X,
  Trophy,
  Compass,
  ExternalLink,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { sounds } from '../services/soundEffects';

interface QuestStep {
  id: string;
  stationNumber: number;
  platform: string;
  title: string;
  subtitle: string;
  description: string;
  actionText: string;
  actionUrl: string;
  external: boolean;
  icon: React.ElementType;
  gradient: string;
  badge: string;
  rewardXP: number;
}

const QUEST_STEPS: QuestStep[] = [
  {
    id: 'step-mind',
    stationNumber: 1,
    platform: 'NOVA Mind',
    title: '1. Inisiasi Pola Pikir & Kurikulum Frontier',
    subtitle: 'Knowledge & Rationality Engine',
    description: 'Pelajari 7 Fakultas Strategis (AI Mastery, Deep IT, Quant Finance, Energi, Biotek, hingga Mental Models) dan uji ketajaman logika di simulator interaktif.',
    actionText: 'Buka NOVA Mind Academy',
    actionUrl: 'https://nova-mindset.vercel.app',
    external: true,
    icon: Brain,
    gradient: 'from-blue-500 via-indigo-500 to-cyan-400',
    badge: 'STAGE 1: KNOWLEDGE',
    rewardXP: 100,
  },
  {
    id: 'step-producer',
    stationNumber: 2,
    platform: 'NOVA Producer',
    title: '2. Automasi Eksekutif & AI War Room',
    subtitle: 'High-Scale Production Studio',
    description: 'Gunakan 7 Pilar Produksi AI, FastTrack Prompt Optimizer (~300ms), dan dewan eksekutif virtual untuk merancang blueprint produk berskala 100k+ concurrency.',
    actionText: 'Kunjungi NOVA Producer Studio',
    actionUrl: 'https://nova-company.vercel.app',
    external: true,
    icon: Cpu,
    gradient: 'from-violet-500 via-purple-500 to-indigo-500',
    badge: 'STAGE 2: PRODUCTION',
    rewardXP: 100,
  },
  {
    id: 'step-artlabs',
    stationNumber: 3,
    platform: 'NOVA Art Labs',
    title: '3. Studio Generasi Visual & Animasi Sinematik',
    subtitle: 'Visual Media & Generative Studio',
    description: 'Rancang logo haute couture, video cinematic, storyboard interaktif, dan sinkronkan seluruh aset kreatif ke Google Cloud Firestore.',
    actionText: 'Buka NOVA Art Labs',
    actionUrl: 'https://nova-artlabs.vercel.app',
    external: true,
    icon: Sparkles,
    gradient: 'from-fuchsia-500 via-pink-500 to-rose-400',
    badge: 'STAGE 3: MEDIA ASSETS',
    rewardXP: 100,
  },
  {
    id: 'step-platform',
    stationNumber: 4,
    platform: 'NOVA Platform',
    title: '4. Pasar Berdaulat & Ekosistem Produk Digital',
    subtitle: 'Sovereign Commerce & Creator Hub',
    description: 'Jelajahi etalase produk digital (Playbook, Script Godot 4, Boilerplate Next.js SaaS, Template Notion OS) dan sambungkan dompet Web3 Anda.',
    actionText: 'Jelajahi Sovereign Market',
    actionUrl: 'https://nova-platfrom.vercel.app/store',
    external: true,
    icon: ShoppingBag,
    gradient: 'from-cyan-400 via-teal-400 to-blue-500',
    badge: 'STAGE 4: COMMERCE',
    rewardXP: 100,
  },
  {
    id: 'step-community',
    stationNumber: 5,
    platform: 'NOVA Community',
    title: '5. Private Creator Guild & The Arena',
    subtitle: 'Syndicate Network & OTC Deals',
    description: 'Bergabung dengan kanal dispatch privat, pantau leaderboard volume di The Arena, dan lakukan transaksi terverifikasi melalui OTC Escrow Desk.',
    actionText: 'Jelajahi Feed Komunitas',
    actionUrl: '#',
    external: false,
    icon: Users,
    gradient: 'from-cyan-400 via-orange-500 to-yellow-500',
    badge: 'STAGE 5: SYNDICATE',
    rewardXP: 100,
  },
];

export const NovaOnboardingQuest: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [claimedReward, setClaimedReward] = useState(false);

  useEffect(() => {
    try {
      const savedCompleted = localStorage.getItem('nova_quest_completed_steps');
      if (savedCompleted) {
        setCompletedSteps(JSON.parse(savedCompleted));
      }
      const savedClaimed = localStorage.getItem('nova_quest_claimed');
      if (savedClaimed === 'true') {
        setClaimedReward(true);
      }
    } catch {}
  }, []);

  const markStepComplete = (stepId: string) => {
    sounds.playChime();
    if (!completedSteps.includes(stepId)) {
      const updated = [...completedSteps, stepId];
      setCompletedSteps(updated);
      try {
        localStorage.setItem('nova_quest_completed_steps', JSON.stringify(updated));
      } catch {}
    }
  };

  const handleClaimGrandReward = () => {
    sounds.playChime();
    setClaimedReward(true);
    try {
      localStorage.setItem('nova_quest_claimed', 'true');
    } catch {}
  };

  const currentStep = QUEST_STEPS[currentStepIndex];
  const isAllCompleted = QUEST_STEPS.every((s) => completedSteps.includes(s.id));
  const progressPercent = Math.round((completedSteps.length / QUEST_STEPS.length) * 100);

  return (
    <>
      {/* Floating Quest Quick-Trigger Badge */}
      <button
        onClick={() => {
          sounds.playClick();
          setIsOpen(true);
        }}
        className="fixed bottom-6 right-6 z-40 group flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-zinc-950/90 hover:bg-zinc-900 border border-cyan-500/40 hover:border-cyan-400 text-xs font-mono text-white shadow-[0_0_25px_rgba(245,158,11,0.35)] backdrop-blur-xl transition-all duration-300 hover:scale-105 cursor-pointer"
        title="Buka Peta Ekosistem & Onboarding Quest NOVA"
      >
        <div className="relative flex items-center justify-center w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-300">
          <Compass className="w-3.5 h-3.5 animate-spin duration-3000" />
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
        </div>
        <div className="flex flex-col text-left leading-none">
          <span className="font-bold text-[11px] text-cyan-300">Ecosystem Quest</span>
          <span className="text-[9px] text-zinc-400 mt-0.5">
            {completedSteps.length}/{QUEST_STEPS.length} Selesai ({progressPercent}%)
          </span>
        </div>
      </button>

      {/* Main Quest Modal Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl rounded-3xl bg-[#080c18] border border-cyan-500/30 p-6 sm:p-8 shadow-[0_25px_70px_rgba(0,0,0,0.9)] overflow-hidden text-zinc-100">
            {/* Ambient Background Light */}
            <div className="pointer-events-none absolute -top-24 -right-24 w-72 h-72 rounded-full bg-cyan-500/15 blur-[80px]" />
            <div className="pointer-events-none absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-cyan-600/15 blur-[80px]" />

            {/* Header Area */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10 relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-cyan-950/60 border border-cyan-500/40 flex items-center justify-center text-cyan-300 shadow-md">
                  <Compass className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-mono text-base font-bold text-white flex items-center gap-2">
                    <span>NOVA ECOSYSTEM QUEST</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                      5-Step Journey
                    </span>
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Panduan interaktif menavigasi 5 platform otonom NOVA
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  sounds.playClick();
                  setIsOpen(false);
                }}
                className="p-1.5 rounded-xl text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Progress Bar & Station Dots */}
            <div className="py-4 space-y-2 relative z-10">
              <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
                <span className="flex items-center gap-1.5 text-cyan-300">
                  <Zap className="w-3.5 h-3.5 text-cyan-400" />
                  Station {currentStep.stationNumber} dari 5: {currentStep.platform}
                </span>
                <span className="text-zinc-400">{progressPercent}% Completed</span>
              </div>

              <div className="w-full h-2 rounded-full bg-zinc-900 overflow-hidden p-0.5 border border-white/5">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-orange-500 to-cyan-500 transition-all duration-500 shadow-[0_0_10px_rgba(245,158,11,0.8)]"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              {/* Station Indicators */}
              <div className="flex items-center justify-between pt-1">
                {QUEST_STEPS.map((s, idx) => {
                  const isDone = completedSteps.includes(s.id);
                  const isCurrent = idx === currentStepIndex;

                  return (
                    <button
                      key={s.id}
                      onClick={() => {
                        sounds.playClick();
                        setCurrentStepIndex(idx);
                      }}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-mono transition-all cursor-pointer ${
                        isCurrent
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 font-bold shadow-sm'
                          : isDone
                          ? 'text-emerald-400 hover:bg-emerald-500/10'
                          : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5'
                      }`}
                    >
                      {isDone ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <span className="w-2 h-2 rounded-full bg-zinc-700" />
                      )}
                      <span className="hidden sm:inline">{s.platform.replace('NOVA ', '')}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Active Card Body */}
            <div className="mt-2 p-5 rounded-2xl bg-[#0f1424]/90 border border-cyan-500/20 relative z-10">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${currentStep.gradient} p-0.5 shadow-lg`}>
                    <div className="w-full h-full bg-[#080c18] rounded-2xl flex items-center justify-center">
                      <currentStep.icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono tracking-widest text-cyan-400 uppercase font-semibold">
                      {currentStep.badge}
                    </span>
                    <h4 className="text-base sm:text-lg font-bold text-white tracking-tight">
                      {currentStep.title}
                    </h4>
                  </div>
                </div>

                <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 shrink-0 flex items-center gap-1 font-bold">
                  <Trophy className="w-3 h-3 text-cyan-400" />
                  +{currentStep.rewardXP} XP
                </span>
              </div>

              <p className="mt-4 text-xs sm:text-sm text-zinc-300 leading-relaxed">
                {currentStep.description}
              </p>

              {/* Action Button inside Card */}
              <div className="mt-5 flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-white/10">
                <a
                  href={currentStep.actionUrl}
                  target={currentStep.external ? '_blank' : '_self'}
                  rel="noopener noreferrer"
                  onClick={() => {
                    markStepComplete(currentStep.id);
                    if (!currentStep.external) setIsOpen(false);
                  }}
                  className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r ${currentStep.gradient} text-xs font-bold text-white shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer`}
                >
                  <span>{currentStep.actionText}</span>
                  {currentStep.external ? (
                    <ExternalLink className="w-3.5 h-3.5" />
                  ) : (
                    <ArrowRight className="w-3.5 h-3.5" />
                  )}
                </a>

                <button
                  onClick={() => markStepComplete(currentStep.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-mono transition cursor-pointer ${
                    completedSteps.includes(currentStep.id)
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'bg-white/5 hover:bg-white/10 text-zinc-300 border border-white/10'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>
                    {completedSteps.includes(currentStep.id)
                      ? 'Misi Ditandai Selesai'
                      : 'Tandai Selesai'}
                  </span>
                </button>
              </div>
            </div>

            {/* Grand Completion Reward Banner */}
            {isAllCompleted && (
              <div className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-cyan-500/15 via-purple-500/15 to-cyan-500/15 border border-cyan-500/40 flex items-center justify-between gap-4 animate-in zoom-in-95 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-400 flex items-center justify-center text-cyan-300 shrink-0">
                    <Trophy className="w-5 h-5 animate-bounce" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-white flex items-center gap-1.5">
                      <span>Semua 5 Stasiun Terjelajahi!</span>
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    </h5>
                    <p className="text-[11px] text-zinc-300">
                      Klaim title kehormatan <strong>NOVA Genesis Citizen Pass</strong> & +500 XP.
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleClaimGrandReward}
                  disabled={claimedReward}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold font-mono transition shadow-lg shrink-0 cursor-pointer ${
                    claimedReward
                      ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-500/50 cursor-default'
                      : 'bg-gradient-to-r from-cyan-400 to-orange-500 text-black hover:scale-105'
                  }`}
                >
                  {claimedReward ? '✓ Reward Diklaim' : 'Klaim Badge'}
                </button>
              </div>
            )}

            {/* Modal Bottom Footer Navigation */}
            <div className="mt-6 flex items-center justify-between pt-4 border-t border-white/10 relative z-10">
              <button
                onClick={() => {
                  sounds.playClick();
                  setCurrentStepIndex((prev) => Math.max(0, prev - 1));
                }}
                disabled={currentStepIndex === 0}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-40 disabled:pointer-events-none text-xs text-zinc-300 border border-white/10 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Sebelumnya</span>
              </button>

              <div className="text-xs font-mono text-zinc-400">
                {currentStepIndex + 1} of {QUEST_STEPS.length}
              </div>

              {currentStepIndex < QUEST_STEPS.length - 1 ? (
                <button
                  onClick={() => {
                    sounds.playClick();
                    markStepComplete(currentStep.id);
                    setCurrentStepIndex((prev) => Math.min(QUEST_STEPS.length - 1, prev + 1));
                  }}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-xs font-bold text-cyan-300 border border-cyan-500/50 cursor-pointer"
                >
                  <span>Lanjut</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  onClick={() => {
                    sounds.playClick();
                    setIsOpen(false);
                  }}
                  className="px-4 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white border border-white/20 cursor-pointer"
                >
                  Tutup Quest
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
