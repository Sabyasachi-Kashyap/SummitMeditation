import { useEffect, useRef } from 'react';

interface MistCanvasProps {
  colorGrade: 'golden-dawn' | 'alpenglow' | 'radiant-zenith';
  intensity?: number;
}

interface MistPuff {
  x: number;
  y: number;
  radiusX: number;
  radiusY: number;
  rotation: number;
  speed: number;
  opacity: number;
  baseOpacity: number;
  pulsePhase: number;
  pulseSpeed: number;
}

interface GoldenMote {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
  phase: number;
}

export default function MistCanvas({ colorGrade, intensity = 1 }: MistCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animFrameId: number;
    let width = (canvas.width = container.clientWidth);
    let height = (canvas.height = container.clientHeight);

    // Color grade adjustments for mist and motes
    const getGradeTones = () => {
      switch (colorGrade) {
        case 'alpenglow':
          return {
            mistR: 255,
            mistG: 220,
            mistB: 210,
            moteColor: 'rgba(255, 230, 215, ',
          };
        case 'radiant-zenith':
          return {
            mistR: 255,
            mistG: 245,
            mistB: 230,
            moteColor: 'rgba(255, 250, 220, ',
          };
        case 'golden-dawn':
        default:
          return {
            mistR: 255,
            mistG: 230,
            mistB: 185,
            moteColor: 'rgba(255, 225, 170, ',
          };
      }
    };

    // Generate mist puffs drifting across lower half (cloud sea) and middle
    const puffsCount = Math.max(14, Math.floor(width / 70));
    const mistPuffs: MistPuff[] = [];

    for (let i = 0; i < puffsCount; i++) {
      mistPuffs.push({
        x: Math.random() * (width + 400) - 200,
        y: height * (0.45 + Math.random() * 0.55),
        radiusX: 180 + Math.random() * 260,
        radiusY: 70 + Math.random() * 120,
        rotation: (Math.random() - 0.5) * 0.2,
        speed: (0.12 + Math.random() * 0.25) * intensity,
        opacity: (0.04 + Math.random() * 0.09) * intensity,
        baseOpacity: (0.04 + Math.random() * 0.09) * intensity,
        pulsePhase: Math.random() * Math.PI * 2,
        pulseSpeed: 0.008 + Math.random() * 0.01,
      });
    }

    // Golden floating morning dust motes
    const motesCount = Math.floor(width / 35);
    const motes: GoldenMote[] = [];
    for (let i = 0; i < motesCount; i++) {
      motes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: 1 + Math.random() * 2.5,
        speedX: (Math.random() - 0.3) * 0.35,
        speedY: -0.15 - Math.random() * 0.3,
        opacity: 0.2 + Math.random() * 0.6,
        phase: Math.random() * Math.PI * 2,
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      const tones = getGradeTones();

      // Draw mist puffs
      for (const puff of mistPuffs) {
        puff.x += puff.speed;
        puff.pulsePhase += puff.pulseSpeed;
        const currentOpacity = puff.baseOpacity * (0.8 + 0.3 * Math.sin(puff.pulsePhase));

        // Wrap around seamlessly
        if (puff.x - puff.radiusX > width) {
          puff.x = -puff.radiusX;
          puff.y = height * (0.45 + Math.random() * 0.55);
        }

        ctx.save();
        ctx.translate(puff.x, puff.y);
        ctx.rotate(puff.rotation);
        ctx.scale(1, puff.radiusY / puff.radiusX);

        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, puff.radiusX);
        gradient.addColorStop(0, `rgba(${tones.mistR}, ${tones.mistG}, ${tones.mistB}, ${currentOpacity})`);
        gradient.addColorStop(0.5, `rgba(${tones.mistR}, ${tones.mistG}, ${tones.mistB}, ${currentOpacity * 0.5})`);
        gradient.addColorStop(1, `rgba(${tones.mistR}, ${tones.mistG}, ${tones.mistB}, 0)`);

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(0, 0, puff.radiusX, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // Draw drifting golden morning light motes
      for (const mote of motes) {
        mote.x += mote.speedX;
        mote.y += mote.speedY;
        mote.phase += 0.02;

        if (mote.y < -10) {
          mote.y = height + 10;
          mote.x = Math.random() * width;
        }
        if (mote.x > width + 10) mote.x = -10;
        if (mote.x < -10) mote.x = width + 10;

        const shimmer = 0.5 + 0.5 * Math.sin(mote.phase);
        const moteAlpha = mote.opacity * shimmer * 0.8;

        ctx.fillStyle = `${tones.moteColor}${moteAlpha})`;
        ctx.beginPath();
        ctx.arc(mote.x, mote.y, mote.size, 0, Math.PI * 2);
        ctx.fill();
      }

      animFrameId = requestAnimationFrame(render);
    };

    render();

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width: newW, height: newH } = entry.contentRect;
        if (newW && newH && (newW !== width || newH !== height)) {
          width = canvas.width = newW;
          height = canvas.height = newH;
        }
      }
    });

    resizeObserver.observe(container);

    return () => {
      cancelAnimationFrame(animFrameId);
      resizeObserver.disconnect();
    };
  }, [colorGrade, intensity]);

  return (
    <div ref={containerRef} className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
}
