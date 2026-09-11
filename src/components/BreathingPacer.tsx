import { useState, useEffect, useRef } from 'react';
import { BreathingPattern, BreathPhase } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Wind, ChevronDown, Check, Eye, EyeOff, RotateCcw, Sparkles } from 'lucide-react';
import { ambientSound } from '../audio/ambientAudio';

export const BREATHING_PATTERNS: BreathingPattern[] = [
  {
    id: 'summit-steady',
    name: 'Mountain Stillness',
    description: 'Slow 5s inhale, 2s gentle hold, 5s exhale, 2s resting pause',
    inhale: 5,
    holdIn: 2,
    exhale: 5,
    holdOut: 2,
  },
  {
    id: 'resonant',
    name: 'Resonant Rhythm',
    description: 'Heart-breath synchronization (5.5s in, 5.5s out)',
    inhale: 5.5,
    holdIn: 0,
    exhale: 5.5,
    holdOut: 0,
  },
  {
    id: 'deep-calm-478',
    name: '4-7-8 Deep Calm',
    description: 'Nervous system relaxation (4s in, 7s hold, 8s release)',
    inhale: 4,
    holdIn: 7,
    exhale: 8,
    holdOut: 0,
  },
  {
    id: 'box-calm',
    name: 'Box Breathing',
    description: 'Equal 4-part square breath (4s in, 4s hold, 4s out, 4s hold)',
    inhale: 4,
    holdIn: 4,
    exhale: 4,
    holdOut: 4,
  },
];

export const CYCLE_PRESETS = [4, 8, 12, 16, 20, 0]; // 0 represents Infinite / Freeflow

interface BreathingPacerProps {
  selectedPattern: BreathingPattern;
  onSelectPattern: (pattern: BreathingPattern) => void;
  showPacerVisual: boolean;
  onTogglePacerVisual: () => void;
  onBreathUpdate?: (phase: BreathPhase, progress: number) => void;
  isCinemaDimmed?: boolean;
}

export default function BreathingPacer({
  selectedPattern,
  onSelectPattern,
  showPacerVisual,
  onTogglePacerVisual,
  onBreathUpdate,
  isCinemaDimmed = false,
}: BreathingPacerProps) {
  const [phase, setPhase] = useState<BreathPhase>('inhale');
  const [phaseProgress, setPhaseProgress] = useState(0); // 0 to 1
  const [cycleCount, setCycleCount] = useState(1);
  const [targetCycles, setTargetCycles] = useState<number>(8); // default to 8 mindful cycles
  const [isCompleted, setIsCompleted] = useState(false);

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isCycleMenuOpen, setIsCycleMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const cycleMenuRef = useRef<HTMLDivElement>(null);

  // Close menus when clicking outside
  useEffect(() => {
    if (!isDropdownOpen && !isCycleMenuOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
      if (cycleMenuRef.current && !cycleMenuRef.current.contains(e.target as Node)) {
        setIsCycleMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isDropdownOpen, isCycleMenuOpen]);

  // Breathing timer ticker with ref to avoid restarting animation frame loop on parent render
  const onBreathUpdateRef = useRef(onBreathUpdate);
  useEffect(() => {
    onBreathUpdateRef.current = onBreathUpdate;
  });

  const resetPractice = (newTarget?: number) => {
    if (newTarget !== undefined) {
      setTargetCycles(newTarget);
    }
    setCycleCount(1);
    setIsCompleted(false);
    setPhase('inhale');
    setPhaseProgress(0);
  };

  useEffect(() => {
    if (isCompleted) return;

    let animationFrameId: number;
    let startTime = performance.now();
    let currentPhase: BreathPhase = 'inhale';
    let currentPhaseDuration = selectedPattern.inhale * 1000;
    let currentCycle = cycleCount;

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, Math.max(0, elapsed / currentPhaseDuration));
      setPhaseProgress(progress);

      if (onBreathUpdateRef.current) {
        onBreathUpdateRef.current(currentPhase, progress);
      }

      if (elapsed >= currentPhaseDuration) {
        startTime = now;
        if (currentPhase === 'inhale') {
          if (selectedPattern.holdIn > 0) {
            currentPhase = 'hold-in';
            currentPhaseDuration = selectedPattern.holdIn * 1000;
          } else {
            currentPhase = 'exhale';
            currentPhaseDuration = selectedPattern.exhale * 1000;
          }
        } else if (currentPhase === 'hold-in') {
          currentPhase = 'exhale';
          currentPhaseDuration = selectedPattern.exhale * 1000;
        } else if (currentPhase === 'exhale') {
          if (selectedPattern.holdOut > 0) {
            currentPhase = 'hold-out';
            currentPhaseDuration = selectedPattern.holdOut * 1000;
          } else {
            // Check if goal reached
            if (targetCycles > 0 && currentCycle >= targetCycles) {
              setIsCompleted(true);
              ambientSound.playSingingBowl();
              return;
            }
            currentPhase = 'inhale';
            currentPhaseDuration = selectedPattern.inhale * 1000;
            currentCycle += 1;
            setCycleCount(currentCycle);
          }
        } else if (currentPhase === 'hold-out') {
          // Check if goal reached
          if (targetCycles > 0 && currentCycle >= targetCycles) {
            setIsCompleted(true);
            ambientSound.playSingingBowl();
            return;
          }
          currentPhase = 'inhale';
          currentPhaseDuration = selectedPattern.inhale * 1000;
          currentCycle += 1;
          setCycleCount(currentCycle);
        }

        setPhase(currentPhase);
      }

      animationFrameId = requestAnimationFrame(tick);
    };

    animationFrameId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [selectedPattern, targetCycles, isCompleted]);

  const getPhaseInstruction = (p: BreathPhase) => {
    switch (p) {
      case 'inhale':
        return 'Breathe In';
      case 'hold-in':
        return 'Hold Breath';
      case 'exhale':
        return 'Breathe Out';
      case 'hold-out':
        return 'Rest / Stillness';
    }
  };

  const getPhaseSubtitle = (p: BreathPhase) => {
    switch (p) {
      case 'inhale':
        return 'Lungs expand gently';
      case 'hold-in':
        return 'Retain the calmness';
      case 'exhale':
        return 'Release tension slowly';
      case 'hold-out':
        return 'Quiet mountain pause';
    }
  };

  // Dynamic scale for the visual breath halo ring
  const getPhaseScale = () => {
    switch (phase) {
      case 'inhale':
        return 1 + 0.35 * phaseProgress;
      case 'hold-in':
        return 1.35;
      case 'exhale':
        return 1.35 - 0.35 * phaseProgress;
      case 'hold-out':
        return 1.0;
    }
  };

  // Helper to compute seconds left in current phase
  const getCurrentPhaseSeconds = () => {
    let totalSec = selectedPattern.inhale;
    if (phase === 'hold-in') totalSec = selectedPattern.holdIn;
    else if (phase === 'exhale') totalSec = selectedPattern.exhale;
    else if (phase === 'hold-out') totalSec = selectedPattern.holdOut;

    const remaining = Math.max(0, totalSec * (1 - phaseProgress));
    return remaining.toFixed(1);
  };

  return (
    <div className="relative flex flex-col items-center select-none">
      {/* 1. EXPANDING BREATH HALO RING (Visible when user toggles it ON) */}
      {showPacerVisual && (
        <div className="relative flex flex-col items-center justify-center mb-3 pointer-events-none">
          <div className="relative w-36 h-36 flex items-center justify-center">
            {/* Ambient golden aura glow */}
            <motion.div
              animate={{
                scale: isCompleted ? 1.05 : getPhaseScale() * 1.15,
                opacity: isCompleted ? 0.4 : phase === 'inhale' ? 0.35 + 0.25 * phaseProgress : 0.22,
              }}
              transition={{ duration: 0.1, ease: 'linear' }}
              className="absolute inset-0 rounded-full border border-amber-300/40 bg-amber-500/10 blur-md"
            />

            {/* Glowing guide circle with dynamic SVG progress meter */}
            <motion.div
              animate={{ scale: isCompleted ? 1.0 : getPhaseScale() }}
              transition={{ duration: 0.1, ease: 'linear' }}
              className="relative w-28 h-28 rounded-full bg-neutral-900/85 flex flex-col items-center justify-center backdrop-blur-md shadow-[0_0_30px_rgba(245,158,11,0.25)] border border-neutral-700/60"
            >
              {/* SVG circular countdown stroke */}
              <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  className="stroke-neutral-800/80"
                  strokeWidth="3"
                  fill="none"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  stroke="currentColor"
                  strokeWidth="3.5"
                  strokeDasharray={282.7}
                  strokeDashoffset={isCompleted ? 0 : 282.7 * (1 - phaseProgress)}
                  strokeLinecap="round"
                  fill="none"
                  className={`transition-[stroke-dashoffset] duration-75 ${
                    isCompleted
                      ? 'text-emerald-400'
                      : phase === 'inhale'
                      ? 'text-amber-400'
                      : phase === 'exhale'
                      ? 'text-blue-400'
                      : phase === 'hold-in'
                      ? 'text-emerald-400'
                      : 'text-neutral-400'
                  }`}
                />
              </svg>

              {isCompleted ? (
                <div className="flex flex-col items-center justify-center text-center p-1">
                  <Sparkles className="w-4 h-4 text-emerald-300 mb-0.5" />
                  <span className="text-[11px] font-medium text-emerald-200">Complete</span>
                  <span className="text-[9px] text-neutral-400 font-sans mt-0.5">{targetCycles} cycles</span>
                </div>
              ) : (
                <>
                  <span className="text-xs font-serif tracking-wide text-amber-100 font-semibold drop-shadow">
                    {getPhaseInstruction(phase)}
                  </span>
                  <span className="text-xs font-mono font-medium text-amber-300 tracking-tight mt-0.5">
                    {getCurrentPhaseSeconds()}s
                  </span>
                  <span className="text-[9px] uppercase tracking-wider text-neutral-400 font-sans mt-0.5">
                    {Math.round(phaseProgress * 100)}%
                  </span>
                </>
              )}
            </motion.div>
          </div>
        </div>
      )}

      {/* 2. ELEGANT FLOATING BREATH GUIDANCE PILL */}
      <div
        className={`transition-opacity duration-700 pointer-events-auto ${
          isCinemaDimmed ? 'opacity-30 hover:opacity-100' : 'opacity-100'
        }`}
      >
        <div className="flex flex-col items-center">
          {/* Main Pill Card */}
          <div className="inline-flex items-center gap-2.5 bg-neutral-900/90 hover:bg-neutral-900/98 border border-amber-500/30 rounded-full pl-3 pr-2 py-1.5 backdrop-blur-xl shadow-2xl transition-all">
            {/* Realtime Breath Step Indicator */}
            <div className="flex items-center gap-2">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                  isCompleted
                    ? 'bg-emerald-500/30 text-emerald-300'
                    : phase === 'inhale'
                    ? 'bg-amber-500/30 text-amber-300'
                    : phase === 'exhale'
                    ? 'bg-blue-500/25 text-blue-300'
                    : 'bg-emerald-500/25 text-emerald-300'
                }`}
              >
                {isCompleted ? <Sparkles className="w-3.5 h-3.5 text-emerald-300" /> : <Wind className="w-3.5 h-3.5" />}
              </div>

              {/* Text label: "Breathe In", "Hold Breath", "Breathe Out", "Rest", or "Practice Complete" */}
              <div className="flex flex-col text-left">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-medium text-amber-100 font-sans tracking-wide">
                    {isCompleted ? 'Practice Complete' : getPhaseInstruction(phase)}
                  </span>

                  {/* Interactive Cycle Goal Selector Pill */}
                  <div ref={cycleMenuRef} className="relative">
                    <button
                      onClick={() => setIsCycleMenuOpen(!isCycleMenuOpen)}
                      className="text-[10px] text-amber-300 hover:text-amber-100 font-mono bg-amber-950/70 hover:bg-amber-900/80 px-2 py-0.5 rounded-full border border-amber-800/40 flex items-center gap-1 transition-all"
                      title="Set target cycle limit (or freeflow)"
                    >
                      <span>
                        Cycle {cycleCount}
                        {targetCycles > 0 ? ` of ${targetCycles}` : ' (∞)'}
                      </span>
                      <ChevronDown className="w-2.5 h-2.5 opacity-70" />
                    </button>

                    {/* Cycle Limit Dropdown */}
                    <AnimatePresence>
                      {isCycleMenuOpen && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95, y: 6 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: 6 }}
                          className="absolute bottom-full left-0 mb-2 w-56 bg-neutral-900/98 border border-neutral-700/90 rounded-2xl p-2.5 shadow-2xl backdrop-blur-2xl z-50 text-left"
                        >
                          <div className="px-1.5 py-1 text-[10px] uppercase tracking-wider text-amber-400 font-semibold border-b border-neutral-800 mb-1 flex items-center justify-between">
                            <span>Breath Cycle Target</span>
                            <span className="text-neutral-500 font-normal">limit</span>
                          </div>

                          <div className="grid grid-cols-2 gap-1 mb-2">
                            {CYCLE_PRESETS.map((preset) => {
                              const isTarget = targetCycles === preset;
                              const label = preset === 0 ? 'Freeflow (∞)' : `${preset} Cycles`;
                              return (
                                <button
                                  key={preset}
                                  onClick={() => {
                                    resetPractice(preset);
                                    setIsCycleMenuOpen(false);
                                  }}
                                  className={`px-2 py-1.5 rounded-lg text-xs font-mono transition-colors text-center ${
                                    isTarget
                                      ? 'bg-amber-500/25 text-amber-200 border border-amber-500/40 font-semibold'
                                      : 'text-neutral-300 hover:bg-neutral-800 hover:text-white'
                                  }`}
                                >
                                  {label}
                                </button>
                              );
                            })}
                          </div>

                          <button
                            onClick={() => {
                              resetPractice();
                              setIsCycleMenuOpen(false);
                            }}
                            className="w-full flex items-center justify-center gap-1.5 text-[11px] text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800/80 py-1.5 rounded-lg border-t border-neutral-800/80 transition-colors"
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>Restart From Cycle 1</span>
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                <span className="text-[10px] text-neutral-400 font-sans leading-none hidden sm:block">
                  {isCompleted ? 'Peaceful pause reached' : getPhaseSubtitle(phase)}
                </span>
              </div>
            </div>

            <span className="w-px h-5 bg-neutral-800" />

            {/* Pattern Selector Dropdown Trigger */}
            <div ref={dropdownRef} className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-1.5 px-2 py-1 rounded-full text-xs text-neutral-300 hover:text-white hover:bg-neutral-800/80 transition-colors focus:outline-none"
                title="Change breathing technique"
              >
                <span className="text-neutral-400 text-[11px] hidden sm:inline">Rhythm:</span>
                <span className="text-amber-200/90 font-medium">{selectedPattern.name}</span>
                <ChevronDown className="w-3 h-3 text-neutral-400" />
              </button>

              {/* Dropdown Menu (Positioned safely above) */}
              <AnimatePresence>
                {isDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.96, y: 6 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.96, y: 6 }}
                    className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 bg-neutral-900/98 border border-neutral-700/90 rounded-2xl p-2 shadow-2xl backdrop-blur-2xl z-50 text-left"
                  >
                    <div className="px-2.5 py-1.5 text-[10px] uppercase tracking-wider text-amber-400/90 font-semibold border-b border-neutral-800 mb-1 flex items-center justify-between">
                      <span>Meditation Breathing Patterns</span>
                      <span className="text-neutral-500 lowercase font-normal">select one</span>
                    </div>

                    <div className="space-y-1">
                      {BREATHING_PATTERNS.map((p) => {
                        const isSelected = p.id === selectedPattern.id;
                        return (
                          <button
                            key={p.id}
                            onClick={() => {
                              onSelectPattern(p);
                              resetPractice();
                              setIsDropdownOpen(false);
                            }}
                            className={`w-full text-left px-3 py-2 rounded-xl text-xs transition-colors flex items-start justify-between group ${
                              isSelected
                                ? 'bg-amber-500/20 text-amber-100 border border-amber-500/30'
                                : 'text-neutral-300 hover:bg-neutral-800 hover:text-white'
                            }`}
                          >
                            <div className="space-y-0.5 pr-2">
                              <div className="flex items-center gap-1.5 font-medium">
                                <span>{p.name}</span>
                                {isSelected && <Check className="w-3 h-3 text-amber-400" />}
                              </div>
                              <p className="text-[10.5px] text-neutral-400 group-hover:text-neutral-300 font-sans leading-relaxed">
                                {p.description}
                              </p>
                            </div>
                            <span className="font-mono text-[10px] text-amber-300/80 bg-neutral-950/70 px-1.5 py-0.5 rounded shrink-0">
                              {p.inhale}s-{p.holdIn > 0 ? `${p.holdIn}s-` : ''}{p.exhale}s
                              {p.holdOut > 0 ? `-${p.holdOut}s` : ''}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <span className="w-px h-5 bg-neutral-800" />

            {/* If completed, show quick restart button */}
            {isCompleted ? (
              <button
                onClick={() => resetPractice()}
                className="flex items-center gap-1 bg-emerald-500/30 hover:bg-emerald-500/50 text-emerald-200 border border-emerald-500/40 px-2.5 py-1 rounded-full text-xs font-medium transition-colors"
                title="Start new breathing round"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Repeat</span>
              </button>
            ) : (
              /* Toggle Breath Ring Guide */
              <button
                onClick={onTogglePacerVisual}
                className={`p-1.5 rounded-full transition-colors ${
                  showPacerVisual
                    ? 'bg-amber-500/30 text-amber-300 border border-amber-500/40'
                    : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800'
                }`}
                title={showPacerVisual ? 'Hide center breath halo circle' : 'Show center breath halo circle'}
              >
                {showPacerVisual ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

