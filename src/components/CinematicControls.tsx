import { useState } from 'react';
import {
  Play,
  Pause,
  Maximize2,
  Minimize2,
  Film,
  Sun,
  Eye,
  Info,
  Compass,
} from 'lucide-react';
import { AspectRatioMode, ColorGrade } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface CinematicControlsProps {
  cameraProgress: number; // 0 (wide) to 1 (close)
  onSeekCamera: (progress: number) => void;
  isPushingIn: boolean;
  onTogglePushIn: () => void;
  aspectRatio: AspectRatioMode;
  onChangeAspectRatio: (mode: AspectRatioMode) => void;
  colorGrade: ColorGrade;
  onChangeColorGrade: (grade: ColorGrade) => void;
  pushSpeed: number; // in seconds for full travel
  onChangePushSpeed: (speed: number) => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  isCinemaDimmed: boolean;
}

export default function CinematicControls({
  cameraProgress,
  onSeekCamera,
  isPushingIn,
  onTogglePushIn,
  aspectRatio,
  onChangeAspectRatio,
  colorGrade,
  onChangeColorGrade,
  pushSpeed,
  onChangePushSpeed,
  isFullscreen,
  onToggleFullscreen,
  isCinemaDimmed,
}: CinematicControlsProps) {
  const [showInfo, setShowInfo] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  return (
    <div
      className={`transition-opacity duration-700 pointer-events-auto ${
        isCinemaDimmed ? 'opacity-20 hover:opacity-100' : 'opacity-100'
      }`}
    >
      <div className="flex flex-col items-center gap-2 max-w-4xl mx-auto px-4">
        {/* Scrubber Bar (Wide Aerial to Closer Three-Quarter Shot) */}
        <div className="w-full bg-neutral-900/85 hover:bg-neutral-900/95 border border-neutral-700/80 rounded-2xl p-3 backdrop-blur-xl shadow-2xl transition-all">
          <div className="flex items-center justify-between text-[11px] text-neutral-400 mb-1.5 font-sans px-1">
            <span className="flex items-center gap-1 text-neutral-300">
              <Compass className="w-3.5 h-3.5 text-amber-400" />
              Wide Aerial Vista
            </span>
            <span className="font-mono text-amber-300/90 text-xs">
              {Math.round(cameraProgress * 100)}% Focal Push
            </span>
            <span className="text-neutral-300">Close Three-Quarter</span>
          </div>

          <div className="relative flex items-center group">
            <input
              type="range"
              min="0"
              max="1"
              step="0.001"
              value={cameraProgress}
              onChange={(e) => onSeekCamera(parseFloat(e.target.value))}
              className="w-full h-2 bg-neutral-800 rounded-lg appearance-none cursor-ew-resize accent-amber-400 focus:outline-none"
            />
          </div>

          {/* Quick Anchor Buttons */}
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-neutral-800/80">
            <div className="flex items-center gap-2">
              {/* Play / Pause Push-in */}
              <button
                onClick={onTogglePushIn}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  isPushingIn
                    ? 'bg-amber-500 text-neutral-950 font-semibold'
                    : 'bg-neutral-800 text-neutral-200 hover:bg-neutral-700'
                }`}
                title={isPushingIn ? 'Pause camera push-in' : 'Resume slow cinematic push-in'}
              >
                {isPushingIn ? (
                  <>
                    <Pause className="w-3 h-3" />
                    <span>Pushing In</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3 h-3" />
                    <span>Start Push-In</span>
                  </>
                )}
              </button>

              {/* Speed Preset Selector */}
              <div className="flex items-center bg-neutral-800/80 rounded-full p-0.5 text-[11px] font-mono">
                {[20, 35, 60].map((s) => (
                  <button
                    key={s}
                    onClick={() => onChangePushSpeed(s)}
                    className={`px-2 py-0.5 rounded-full transition-colors ${
                      pushSpeed === s
                        ? 'bg-neutral-700 text-amber-300 font-semibold'
                        : 'text-neutral-400 hover:text-neutral-200'
                    }`}
                    title={`Push-in duration: ${s} seconds`}
                  >
                    {s}s
                  </button>
                ))}
              </div>

              {/* Quick Views */}
              <button
                onClick={() => onSeekCamera(0)}
                className={`px-2.5 py-1 rounded-full text-xs transition-colors ${
                  cameraProgress < 0.05
                    ? 'bg-amber-950/60 text-amber-200 border border-amber-800/50'
                    : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800'
                }`}
              >
                Wide
              </button>
              <button
                onClick={() => onSeekCamera(1)}
                className={`px-2.5 py-1 rounded-full text-xs transition-colors ${
                  cameraProgress > 0.95
                    ? 'bg-amber-950/60 text-amber-200 border border-amber-800/50'
                    : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800'
                }`}
              >
                Close
              </button>
            </div>

            {/* Right side toggles: Aspect ratio, Color Grade, Fullscreen, Info */}
            <div className="flex items-center gap-1.5">
              {/* Color Grade toggle */}
              <div className="relative">
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className="p-1.5 rounded-full text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800 transition-colors"
                  title="Lighting & Color Grade"
                >
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                </button>

                <AnimatePresence>
                  {showSettings && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -6 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -6 }}
                      className="absolute bottom-full right-0 mb-2 w-48 bg-neutral-900/95 border border-neutral-700/80 rounded-xl p-2 shadow-2xl backdrop-blur-xl z-50 text-neutral-200"
                    >
                      <div className="text-[10px] uppercase font-semibold text-neutral-400 px-2 py-1 mb-1">
                        Sunrise Lighting
                      </div>
                      <button
                        onClick={() => {
                          onChangeColorGrade('golden-dawn');
                          setShowSettings(false);
                        }}
                        className={`w-full text-left px-2 py-1.5 rounded-lg text-xs transition-colors flex items-center justify-between ${
                          colorGrade === 'golden-dawn'
                            ? 'bg-amber-500/20 text-amber-200 font-medium'
                            : 'text-neutral-300 hover:bg-neutral-800'
                        }`}
                      >
                        <span>Golden Dawn</span>
                        <span className="w-2 h-2 rounded-full bg-amber-400" />
                      </button>
                      <button
                        onClick={() => {
                          onChangeColorGrade('alpenglow');
                          setShowSettings(false);
                        }}
                        className={`w-full text-left px-2 py-1.5 rounded-lg text-xs transition-colors flex items-center justify-between ${
                          colorGrade === 'alpenglow'
                            ? 'bg-rose-500/20 text-rose-200 font-medium'
                            : 'text-neutral-300 hover:bg-neutral-800'
                        }`}
                      >
                        <span>Alpenglow</span>
                        <span className="w-2 h-2 rounded-full bg-rose-400" />
                      </button>
                      <button
                        onClick={() => {
                          onChangeColorGrade('radiant-zenith');
                          setShowSettings(false);
                        }}
                        className={`w-full text-left px-2 py-1.5 rounded-lg text-xs transition-colors flex items-center justify-between ${
                          colorGrade === 'radiant-zenith'
                            ? 'bg-amber-300/20 text-amber-100 font-medium'
                            : 'text-neutral-300 hover:bg-neutral-800'
                        }`}
                      >
                        <span>Radiant Sun</span>
                        <span className="w-2 h-2 rounded-full bg-yellow-200" />
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Aspect Ratio Mode */}
              <button
                onClick={() =>
                  onChangeAspectRatio(
                    aspectRatio === 'cinematic-2.39' ? 'fullscreen' : 'cinematic-2.39'
                  )
                }
                className={`p-1.5 rounded-full transition-colors ${
                  aspectRatio === 'cinematic-2.39'
                    ? 'bg-amber-950/70 text-amber-300 border border-amber-800/60'
                    : 'text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800'
                }`}
                title={
                  aspectRatio === 'cinematic-2.39'
                    ? 'Switch to Fullscreen (16:9)'
                    : 'Enable Cinematic Letterbox (2.39:1)'
                }
              >
                <Film className="w-3.5 h-3.5" />
              </button>

              {/* Fullscreen */}
              <button
                onClick={onToggleFullscreen}
                className="p-1.5 rounded-full text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800 transition-colors"
                title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
              >
                {isFullscreen ? (
                  <Minimize2 className="w-3.5 h-3.5" />
                ) : (
                  <Maximize2 className="w-3.5 h-3.5" />
                )}
              </button>

              {/* Info modal toggle */}
              <button
                onClick={() => setShowInfo(!showInfo)}
                className="p-1.5 rounded-full text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800 transition-colors"
                title="Scene Details & Contemplation"
              >
                <Info className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Info Modal */}
      <AnimatePresence>
        {showInfo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-neutral-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
            onClick={() => setShowInfo(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-neutral-900 border border-neutral-800 rounded-2xl max-w-lg w-full p-6 text-neutral-200 shadow-2xl relative"
            >
              <h2 className="font-serif text-2xl text-amber-100 mb-2 font-light">
                Summit Sunrise Meditation
              </h2>
              <p className="text-xs text-amber-400/90 tracking-wide uppercase font-sans mb-4">
                Cinematic Contemplative Atmosphere
              </p>

              <div className="space-y-3 text-xs leading-relaxed text-neutral-300 font-sans">
                <p>
                  Perched high upon the rugged mountain summit above a tranquil sea of clouds,
                  the meditator sits in steady lotus posture facing the newborn dawn. As soft golden
                  rays break through rolling mist, gentle valley breezes whisper across alpine rock.
                </p>

                <div className="p-3 bg-neutral-950/60 rounded-xl border border-neutral-800/80 space-y-2">
                  <div className="flex items-center gap-2 text-amber-200 font-medium">
                    <Eye className="w-4 h-4 text-amber-400" />
                    Cinematic Camera Motion
                  </div>
                  <p className="text-[11px] text-neutral-400">
                    The camera glides gently from an expansive aerial vista revealing endless layered
                    peaks, pushing inward toward an intimate three-quarter portrait with shallow
                    depth of field. Use the timeline slider or play button to guide your focus.
                  </p>
                </div>

                <div className="p-3 bg-neutral-950/60 rounded-xl border border-neutral-800/80 space-y-2">
                  <div className="flex items-center gap-2 text-amber-200 font-medium">
                    <Compass className="w-4 h-4 text-amber-400" />
                    Procedural Soundscape
                  </div>
                  <p className="text-[11px] text-neutral-400">
                    Pure Web Audio API acoustic synthesis generates natural alpine gusts and
                    sporadic distant valley songbirds echoing through the canyons without dialogue
                    or looped MP3 files.
                  </p>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-neutral-800 flex justify-end">
                <button
                  onClick={() => setShowInfo(false)}
                  className="px-4 py-1.5 rounded-lg bg-amber-500 text-neutral-950 text-xs font-semibold hover:bg-amber-400 transition-colors"
                >
                  Return to Contemplation
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
