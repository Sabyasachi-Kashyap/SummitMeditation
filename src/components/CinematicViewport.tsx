import { AspectRatioMode, ColorGrade } from '../types';
import MistCanvas from './MistCanvas';
import wideShotImg from '../assets/images/meditation_summit_wide_1789131424121.jpg';
import closeShotImg from '../assets/images/meditation_summit_close_1789131439515.jpg';

interface CinematicViewportProps {
  cameraProgress: number; // 0 (wide aerial) to 1 (close three-quarter)
  aspectRatio: AspectRatioMode;
  colorGrade: ColorGrade;
  breathPhase: 'inhale' | 'hold-in' | 'exhale' | 'hold-out';
  breathProgress: number; // 0 to 1
}

export default function CinematicViewport({
  cameraProgress,
  aspectRatio,
  colorGrade,
  breathPhase,
  breathProgress,
}: CinematicViewportProps) {
  // Compute breath expansion (0 to 1)
  let breathExpansion = 0;
  if (breathPhase === 'inhale') {
    breathExpansion = breathProgress;
  } else if (breathPhase === 'hold-in') {
    breathExpansion = 1;
  } else if (breathPhase === 'exhale') {
    breathExpansion = 1 - breathProgress;
  } else {
    breathExpansion = 0;
  }

  // Smooth easing for camera push-in
  // Linear progress -> smooth camera zoom & crossfade
  const t = Math.max(0, Math.min(1, cameraProgress));

  // Wide image transform: scale from 1.0 to 1.35, pan slightly toward upper-center
  const wideScale = 1.0 + t * 0.35;
  const wideTranslateY = -t * 8; // subtle upward pan into the subject
  const wideOpacity = Math.max(0, 1 - Math.pow(t, 1.4));

  // Close image transform: scale from 0.88 to 1.06, opacity fades in smoothly
  const closeScale = 0.88 + t * 0.18;
  const closeOpacity = Math.min(1, Math.max(0, (t - 0.12) / 0.88));

  // Shallow depth of field blur on background as camera gets close
  // Described in prompt: "shallow depth of field on final shot"
  const backgroundDoFBlur = Math.max(0, (t - 0.5) * 4); // 0px to 2px soft cinematic edge blur

  // Subtle natural chest breathing movement (0.3% to 0.7% micro-expansion)
  const chestRiseScale = 1 + breathExpansion * 0.008;
  const chestRiseY = -breathExpansion * 2.5;

  // Color grade filter classes
  const getColorGradeStyle = () => {
    switch (colorGrade) {
      case 'alpenglow':
        return 'sepia(18%) saturate(125%) hue-rotate(-12deg) contrast(104%)';
      case 'radiant-zenith':
        return 'brightness(106%) saturate(118%) contrast(106%)';
      case 'golden-dawn':
      default:
        return 'sepia(24%) saturate(135%) hue-rotate(5deg) contrast(108%)';
    }
  };

  return (
    <div className="relative w-full h-full overflow-hidden bg-neutral-950 select-none flex items-center justify-center">
      {/* 2.39:1 Letterbox Framing Container */}
      <div
        className={`relative w-full h-full flex items-center justify-center transition-all duration-700 ${
          aspectRatio === 'cinematic-2.39' ? 'max-h-[75vh] sm:max-h-[82vh]' : 'h-full'
        }`}
      >
        {/* Aspect Ratio Cutout / Visual Stage */}
        <div
          className="relative w-full h-full overflow-hidden"
          style={{
            filter: getColorGradeStyle(),
          }}
        >
          {/* LAYER 1: Wide Aerial-Adjacent Mountain Summit Shot */}
          <div
            className="absolute inset-0 w-full h-full transition-opacity duration-300 pointer-events-none"
            style={{
              opacity: wideOpacity,
              transform: `scale(${wideScale * chestRiseScale}) translateY(${wideTranslateY + chestRiseY}px)`,
              transformOrigin: '50% 60%',
              willChange: 'transform, opacity',
            }}
          >
            <img
              src={wideShotImg}
              alt="Serene wide aerial shot of man meditating in lotus position on mountain summit at sunrise"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-center pointer-events-none"
            />
          </div>

          {/* LAYER 2: Closer Three-Quarter Shot (Push-In Focal Target) */}
          <div
            className="absolute inset-0 w-full h-full transition-opacity duration-300 pointer-events-none"
            style={{
              opacity: closeOpacity,
              transform: `scale(${closeScale * chestRiseScale}) translateY(${chestRiseY}px)`,
              transformOrigin: '50% 55%',
              filter: `blur(${backgroundDoFBlur * 0.3}px)`,
              willChange: 'transform, opacity',
            }}
          >
            <img
              src={closeShotImg}
              alt="Closer three-quarter shot of man meditating in peaceful stillness on rocky mountain summit"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-center pointer-events-none"
            />
          </div>

          {/* LAYER 3: Procedural Drifting Mist and Morning Light Motes */}
          <MistCanvas colorGrade={colorGrade} intensity={0.9} />

          {/* LAYER 4: Soft Golden Sunrise Light Flare */}
          <div
            className="absolute inset-0 pointer-events-none z-15 mix-blend-screen transition-opacity duration-700"
            style={{
              background:
                colorGrade === 'alpenglow'
                  ? 'radial-gradient(ellipse 65% 55% at 75% 25%, rgba(255, 190, 180, 0.28) 0%, rgba(255, 140, 160, 0.12) 45%, transparent 75%)'
                  : 'radial-gradient(ellipse 70% 60% at 78% 22%, rgba(255, 220, 130, 0.32) 0%, rgba(245, 158, 11, 0.15) 50%, transparent 80%)',
              opacity: 0.85 + 0.15 * Math.sin(breathExpansion * Math.PI),
            }}
          />

          {/* LAYER 5: Vignette & Film Atmosphere */}
          <div
            className="absolute inset-0 pointer-events-none z-20"
            style={{
              boxShadow: 'inset 0 0 120px rgba(0, 0, 0, 0.55), inset 0 0 240px rgba(0, 0, 0, 0.35)',
            }}
          />
        </div>
      </div>

      {/* Cinematic Anamorphic Letterbox Bars (Top & Bottom) */}
      {aspectRatio === 'cinematic-2.39' && (
        <>
          <div className="absolute top-0 left-0 right-0 bg-neutral-950 h-[10vh] sm:h-[9vh] pointer-events-none z-30 transition-all duration-700" />
          <div className="absolute bottom-0 left-0 right-0 bg-neutral-950 h-[10vh] sm:h-[9vh] pointer-events-none z-30 transition-all duration-700" />
        </>
      )}
    </div>
  );
}
