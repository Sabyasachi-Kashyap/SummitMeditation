/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import CinematicViewport from './components/CinematicViewport';
import CinematicControls from './components/CinematicControls';
import BreathingPacer, { BREATHING_PATTERNS } from './components/BreathingPacer';
import AudioControls from './components/AudioControls';
import MeditationTimer from './components/MeditationTimer';
import { ambientSound } from './audio/ambientAudio';
import { AspectRatioMode, ColorGrade, BreathingPattern, BreathPhase } from './types';
import { Volume2, Mountain, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  // Camera state
  const [cameraProgress, setCameraProgress] = useState(0.0); // 0 = Wide, 1 = Close
  const [isPushingIn, setIsPushingIn] = useState(true);
  const [pushSpeed, setPushSpeed] = useState(35); // seconds for full push-in

  // Visual framing & grading
  const [aspectRatio, setAspectRatio] = useState<AspectRatioMode>('fullscreen');
  const [colorGrade, setColorGrade] = useState<ColorGrade>('golden-dawn');
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Breathing state
  const [selectedPattern, setSelectedPattern] = useState<BreathingPattern>(BREATHING_PATTERNS[0]);
  const [showPacerVisual, setShowPacerVisual] = useState(false);
  const [breathPhase, setBreathPhase] = useState<BreathPhase>('inhale');
  const [breathProgress, setBreathProgress] = useState(0);

  // Callback for breath phase to drive subtle chest animation in viewport
  const handleBreathUpdate = useCallback((phase: BreathPhase, progress: number) => {
    setBreathPhase(phase);
    setBreathProgress(progress);
  }, []);
  // Sound state
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [hasUserStartedAudio, setHasUserStartedAudio] = useState(false);

  // Inactivity auto-dimming for pure cinema experience
  const [isCinemaDimmed, setIsCinemaDimmed] = useState(false);
  const idleTimeoutRef = useRef<number | null>(null);

  // Camera push-in animation loop
  useEffect(() => {
    let animFrameId: number;
    let lastTime = performance.now();
    let direction = 1; // 1 = pushing in, -1 = slowly panning out

    const step = (time: number) => {
      const delta = (time - lastTime) / 1000;
      lastTime = time;

      if (isPushingIn) {
        setCameraProgress((prev) => {
          const deltaProgress = (delta / pushSpeed) * direction;
          let next = prev + deltaProgress;

          // When reached the close shot, dwell in stillness for a while or reverse gently
          if (next >= 1) {
            next = 1;
            direction = -0.4; // very slow return so it feels like a continuous gentle breath
          } else if (next <= 0) {
            next = 0;
            direction = 1; // push in again
          }
          return next;
        });
      }

      animFrameId = requestAnimationFrame(step);
    };

    animFrameId = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(animFrameId);
    };
  }, [isPushingIn, pushSpeed]);

  // Handle user activity to reset auto-dim
  const handleUserActivity = useCallback(() => {
    setIsCinemaDimmed(false);
    if (idleTimeoutRef.current) {
      window.clearTimeout(idleTimeoutRef.current);
    }
    idleTimeoutRef.current = window.setTimeout(() => {
      setIsCinemaDimmed(true);
    }, 4000);
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', handleUserActivity);
    window.addEventListener('keydown', handleUserActivity);
    window.addEventListener('touchstart', handleUserActivity);

    // Initial timer
    idleTimeoutRef.current = window.setTimeout(() => {
      setIsCinemaDimmed(true);
    }, 5000);

    return () => {
      window.removeEventListener('mousemove', handleUserActivity);
      window.removeEventListener('keydown', handleUserActivity);
      window.removeEventListener('touchstart', handleUserActivity);
      if (idleTimeoutRef.current) {
        window.clearTimeout(idleTimeoutRef.current);
      }
    };
  }, [handleUserActivity]);

  // Audio start / toggle
  const toggleAudio = () => {
    if (!hasUserStartedAudio) {
      setHasUserStartedAudio(true);
    }
    if (isAudioPlaying) {
      ambientSound.pause();
      setIsAudioPlaying(false);
    } else {
      ambientSound.start();
      setIsAudioPlaying(true);
    }
  };

  const startAudioOnFirstClick = () => {
    if (!hasUserStartedAudio) {
      setHasUserStartedAudio(true);
      ambientSound.start();
      setIsAudioPlaying(true);
    }
  };

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  return (
    <main
      className="relative w-screen h-screen overflow-hidden bg-neutral-950 font-sans text-neutral-100"
      onClick={handleUserActivity}
      onMouseMove={handleUserActivity}
    >
      {/* Visual Canvas Viewport */}
      <CinematicViewport
        cameraProgress={cameraProgress}
        aspectRatio={aspectRatio}
        colorGrade={colorGrade}
        breathPhase={breathPhase}
        breathProgress={breathProgress}
      />

      {/* TOP BAR: Minimalist header & utilities */}
      <header
        className={`absolute top-0 left-0 right-0 p-4 sm:p-6 z-40 flex items-center justify-between transition-opacity duration-700 pointer-events-none ${
          isCinemaDimmed ? 'opacity-0' : 'opacity-100'
        }`}
      >
        {/* Title & Altitude */}
        <div className="flex items-center gap-3 pointer-events-auto">
          <div className="w-8 h-8 rounded-full bg-neutral-900/80 border border-amber-500/30 flex items-center justify-center backdrop-blur-md shadow-lg">
            <Mountain className="w-4 h-4 text-amber-300" />
          </div>
          <div>
            <h1 className="font-serif text-lg sm:text-xl font-normal text-amber-100/95 tracking-wide drop-shadow-sm flex items-center gap-2">
              Summit Sunrise
              <span className="hidden sm:inline-flex items-center text-[10px] uppercase font-sans tracking-widest text-amber-400/80 px-2 py-0.5 rounded-full bg-amber-950/40 border border-amber-800/40">
                Lotus Posture
              </span>
            </h1>
            <p className="text-[11px] text-neutral-400 font-sans flex items-center gap-1.5">
              <span>3,140m Summit</span>
              <span>•</span>
              <span className="text-amber-300/80">Golden Hour Solitude</span>
            </p>
          </div>
        </div>

        {/* Top Right Utilities */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <AudioControls isPlaying={isAudioPlaying} onTogglePlay={toggleAudio} />
          <MeditationTimer />
        </div>
      </header>

      {/* LOWER CENTER: Floating Breathing Rhythm Guide */}
      <div className="absolute bottom-28 sm:bottom-32 left-0 right-0 flex justify-center pointer-events-none z-30 px-4">
        <BreathingPacer
          selectedPattern={selectedPattern}
          onSelectPattern={setSelectedPattern}
          showPacerVisual={showPacerVisual}
          onTogglePacerVisual={() => setShowPacerVisual(!showPacerVisual)}
          onBreathUpdate={handleBreathUpdate}
          isCinemaDimmed={isCinemaDimmed}
        />
      </div>

      {/* BOTTOM CONTROLS: Push-In Scrubber, Speed, Aspect Ratio, Color Grading */}
      <footer className="absolute bottom-4 sm:bottom-6 left-0 right-0 z-40 pointer-events-none">
        <CinematicControls
          cameraProgress={cameraProgress}
          onSeekCamera={(val) => {
            setCameraProgress(val);
            setIsPushingIn(false); // Pause auto push-in when user manually scrubs
          }}
          isPushingIn={isPushingIn}
          onTogglePushIn={() => setIsPushingIn(!isPushingIn)}
          aspectRatio={aspectRatio}
          onChangeAspectRatio={setAspectRatio}
          colorGrade={colorGrade}
          onChangeColorGrade={setColorGrade}
          pushSpeed={pushSpeed}
          onChangePushSpeed={setPushSpeed}
          isFullscreen={isFullscreen}
          onToggleFullscreen={toggleFullscreen}
          isCinemaDimmed={isCinemaDimmed}
        />
      </footer>

      {/* Initial Audio Prompt Toast (Fades once audio is initiated) */}
      <AnimatePresence>
        {!hasUserStartedAudio && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="absolute bottom-28 left-1/2 -translate-x-1/2 z-50 pointer-events-auto"
          >
            <button
              onClick={startAudioOnFirstClick}
              className="flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-neutral-900/90 hover:bg-neutral-900 border border-amber-500/40 text-amber-100 shadow-[0_4px_30px_rgba(245,158,11,0.25)] backdrop-blur-xl transition-all group"
            >
              <div className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Volume2 className="w-3.5 h-3.5 text-amber-300" />
              </div>
              <span className="text-xs font-medium tracking-wide">
                Click to Enable Ambient Wind & Distant Birds
              </span>
              <Sparkles className="w-3.5 h-3.5 text-amber-400/80" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
