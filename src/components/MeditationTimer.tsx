import { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Timer, CheckCircle, X } from 'lucide-react';
import { ambientSound } from '../audio/ambientAudio';
import { motion, AnimatePresence } from 'motion/react';

const TIMER_PRESETS = [
  { label: '5m', seconds: 300 },
  { label: '10m', seconds: 600 },
  { label: '15m', seconds: 900 },
  { label: '20m', seconds: 1200 },
  { label: 'Open', seconds: 0 },
];

export default function MeditationTimer() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState(600); // 10m default
  const [timeRemaining, setTimeRemaining] = useState(600);
  const [elapsedOpen, setElapsedOpen] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  useEffect(() => {
    let interval: number | null = null;

    if (isActive) {
      interval = window.setInterval(() => {
        if (selectedDuration > 0) {
          setTimeRemaining((prev) => {
            if (prev <= 1) {
              // Timer completed
              setIsActive(false);
              setIsCompleted(true);
              ambientSound.playSingingBowl();
              return 0;
            }
            return prev - 1;
          });
        } else {
          // Open timer
          setElapsedOpen((prev) => prev + 1);
        }
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, selectedDuration]);

  const handleSelectPreset = (seconds: number) => {
    setSelectedDuration(seconds);
    setTimeRemaining(seconds);
    setElapsedOpen(0);
    setIsActive(false);
    setIsCompleted(false);
  };

  const handleToggleTimer = () => {
    if (isCompleted) {
      setTimeRemaining(selectedDuration);
      setIsCompleted(false);
    }
    setIsActive(!isActive);
  };

  const handleReset = () => {
    setIsActive(false);
    setIsCompleted(false);
    setTimeRemaining(selectedDuration);
    setElapsedOpen(0);
  };

  const formatTime = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const displayTime = selectedDuration > 0 ? formatTime(timeRemaining) : formatTime(elapsedOpen);

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 bg-neutral-900/80 hover:bg-neutral-900/95 border border-neutral-700/80 rounded-full px-3 py-1.5 text-xs text-neutral-300 hover:text-white backdrop-blur-md shadow-md transition-all font-mono"
        title="Mindful Sitting Timer"
      >
        <Timer className="w-3.5 h-3.5 text-amber-400 font-sans" />
        <span>{displayTime}</span>
        {isActive && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -6 }}
            className="absolute top-full right-0 mt-2 w-64 sm:w-72 bg-neutral-900/98 border border-neutral-700/90 rounded-2xl p-4 shadow-2xl backdrop-blur-2xl z-50 text-neutral-200"
          >
            <div className="text-xs font-semibold text-neutral-100 uppercase tracking-wider mb-2 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <span>Sitting Timer</span>
                {isCompleted && (
                  <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-normal">
                    <CheckCircle className="w-3 h-3" /> Done
                  </span>
                )}
              </span>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 text-neutral-400 hover:text-neutral-100 transition-colors rounded-full"
                title="Close timer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Presets */}
            <div className="grid grid-cols-5 gap-1 mb-3">
              {TIMER_PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  onClick={() => handleSelectPreset(preset.seconds)}
                  className={`py-1 rounded text-xs font-mono transition-colors ${
                    selectedDuration === preset.seconds
                      ? 'bg-amber-500/30 text-amber-200 border border-amber-500/40 font-semibold'
                      : 'bg-neutral-800 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-700'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>

            {/* Big Countdown */}
            <div className="text-center py-2 bg-neutral-950/60 rounded-xl border border-neutral-800/80 mb-3 font-mono text-3xl font-light tracking-wider text-amber-100">
              {displayTime}
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={handleToggleTimer}
                className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-colors ${
                  isActive
                    ? 'bg-amber-900/40 text-amber-200 border border-amber-700/50 hover:bg-amber-900/60'
                    : 'bg-amber-500 text-neutral-950 hover:bg-amber-400 font-semibold'
                }`}
              >
                {isActive ? (
                  <>
                    <Pause className="w-3.5 h-3.5" /> Pause
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5" /> {isCompleted ? 'Restart' : 'Begin'}
                  </>
                )}
              </button>

              <button
                onClick={handleReset}
                className="p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white transition-colors"
                title="Reset timer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
