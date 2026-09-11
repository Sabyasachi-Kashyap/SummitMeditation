import { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Sliders, Wind, Music, Bell, X } from 'lucide-react';
import { ambientSound } from '../audio/ambientAudio';
import { motion, AnimatePresence } from 'motion/react';

interface AudioControlsProps {
  isPlaying: boolean;
  onTogglePlay: () => void;
}

export default function AudioControls({ isPlaying, onTogglePlay }: AudioControlsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [masterVol, setMasterVol] = useState(0.7);
  const [windVol, setWindVol] = useState(0.65);
  const [birdsVol, setBirdsVol] = useState(0.5);
  const [droneVol, setDroneVol] = useState(0.25);
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

  const handleMasterChange = (val: number) => {
    setMasterVol(val);
    ambientSound.setMasterVolume(val);
  };

  const handleWindChange = (val: number) => {
    setWindVol(val);
    ambientSound.setWindVolume(val);
  };

  const handleBirdsChange = (val: number) => {
    setBirdsVol(val);
    ambientSound.setBirdsVolume(val);
  };

  const handleDroneChange = (val: number) => {
    setDroneVol(val);
    ambientSound.setDroneVolume(val);
  };

  const handleBellChime = () => {
    ambientSound.playSingingBowl();
  };

  return (
    <div ref={containerRef} className="relative">
      <div className="flex items-center gap-1.5 bg-neutral-900/80 hover:bg-neutral-900/95 border border-neutral-700/80 rounded-full px-2.5 py-1.5 backdrop-blur-md shadow-lg transition-all">
        {/* Play / Mute button */}
        <button
          onClick={onTogglePlay}
          className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-sans font-medium transition-colors ${
            isPlaying
              ? 'text-amber-300 hover:text-amber-200'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
          title={isPlaying ? 'Mute ambient nature sound' : 'Play ambient wind & distant birds'}
        >
          {isPlaying ? (
            <>
              <Volume2 className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">Ambient Audio</span>
              {/* Animated audio bar indicator */}
              <div className="flex items-end gap-0.5 h-3 ml-0.5">
                <span className="w-0.5 bg-amber-400 rounded-full animate-[pulse_1s_ease-in-out_infinite] h-2.5" />
                <span className="w-0.5 bg-amber-300 rounded-full animate-[pulse_1.4s_ease-in-out_infinite] h-3.5" />
                <span className="w-0.5 bg-amber-400 rounded-full animate-[pulse_0.9s_ease-in-out_infinite] h-1.5" />
              </div>
            </>
          ) : (
            <>
              <VolumeX className="w-4 h-4 text-neutral-400" />
              <span className="hidden sm:inline">Sound Off</span>
            </>
          )}
        </button>

        {/* Mixer Toggle */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`p-1 rounded-full text-neutral-400 hover:text-white transition-colors ${
            isOpen ? 'bg-neutral-800 text-white' : ''
          }`}
          title="Audio Mixer & Settings"
        >
          <Sliders className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Popover Mixer: positioned downwards from top-right header */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -6 }}
            className="absolute top-full right-0 mt-2 w-72 sm:w-80 bg-neutral-900/98 border border-neutral-700/90 rounded-2xl p-4 shadow-2xl backdrop-blur-2xl z-50 text-neutral-200"
          >
            <div className="flex items-center justify-between pb-2 border-b border-neutral-800 mb-3">
              <span className="text-xs font-semibold text-neutral-100 uppercase tracking-wider">
                Soundscape Mixer
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleBellChime}
                  title="Ring Tibetan Singing Bowl"
                  className="flex items-center gap-1 text-[11px] text-amber-300 hover:text-amber-200 bg-amber-950/40 border border-amber-800/40 px-2 py-0.5 rounded-full transition-colors"
                >
                  <Bell className="w-3 h-3 text-amber-400" />
                  <span>Bowl Chime</span>
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 text-neutral-400 hover:text-neutral-100 transition-colors rounded-full"
                  title="Close mixer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Master Volume */}
            <div className="space-y-1 mb-3">
              <div className="flex justify-between text-xs text-neutral-300">
                <span className="font-medium">Master Atmosphere</span>
                <span className="font-mono text-[11px] text-neutral-400">
                  {Math.round(masterVol * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={masterVol}
                onChange={(e) => handleMasterChange(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
              />
            </div>

            {/* Summit Wind */}
            <div className="space-y-1 mb-3">
              <div className="flex items-center justify-between text-xs text-neutral-300">
                <span className="flex items-center gap-1.5">
                  <Wind className="w-3.5 h-3.5 text-neutral-400" />
                  Mountain Summit Wind
                </span>
                <span className="font-mono text-[11px] text-neutral-400">
                  {Math.round(windVol * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={windVol}
                onChange={(e) => handleWindChange(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
              />
            </div>

            {/* Distant Alpine Birds */}
            <div className="space-y-1 mb-3">
              <div className="flex items-center justify-between text-xs text-neutral-300">
                <span className="flex items-center gap-1.5">
                  <span className="text-sm leading-none">🕊️</span>
                  Distant Valley Birds
                </span>
                <span className="font-mono text-[11px] text-neutral-400">
                  {Math.round(birdsVol * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={birdsVol}
                onChange={(e) => handleBirdsChange(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
              />
            </div>

            {/* Resonant Drone */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs text-neutral-300">
                <span className="flex items-center gap-1.5">
                  <Music className="w-3.5 h-3.5 text-neutral-400" />
                  Golden Hour Resonance
                </span>
                <span className="font-mono text-[11px] text-neutral-400">
                  {Math.round(droneVol * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={droneVol}
                onChange={(e) => handleDroneChange(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
              />
            </div>

            <p className="mt-3 pt-2 text-[10px] text-neutral-500 border-t border-neutral-800 leading-normal">
              Procedurally synthesized via Web Audio API. Zero external audio downloads, pure tranquil nature acoustics.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
