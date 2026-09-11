export type CameraMode = 'auto-push' | 'wide' | 'close' | 'manual';

export type AspectRatioMode = 'fullscreen' | 'cinematic-2.39' | 'classic-16.9';

export type ColorGrade = 'golden-dawn' | 'alpenglow' | 'radiant-zenith';

export interface BreathingPattern {
  id: string;
  name: string;
  description: string;
  inhale: number; // seconds
  holdIn: number;
  exhale: number;
  holdOut: number;
}

export type BreathPhase = 'inhale' | 'hold-in' | 'exhale' | 'hold-out';

export interface AudioSettings {
  masterVolume: number; // 0 - 1
  windVolume: number; // 0 - 1
  birdsVolume: number; // 0 - 1
  droneVolume: number; // 0 - 1
  isPlaying: boolean;
}
