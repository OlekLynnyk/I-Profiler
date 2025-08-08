import { useEffect, useRef } from 'react';
import snapshot from './snapshot.json';

const BASE_COLOR = 'rgba(255,255,255,0.3)'; // ВРЕМЕННО увеличим яркость
const BACKGROUND_COLOR = '#0b0b0c';
const LAYER_SIZES = [0.3, 0.5, 0.7]; // Если нужно — сделаем временно больше

export default function BlackCognitiveSandStatic() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Временно фиксированный размер (как был при экспорте)
    const width = (canvas.width = 1440);
    const height = (canvas.height = 900);

    ctx.globalAlpha = 1;
    ctx.fillStyle = BACKGROUND_COLOR;
    ctx.fillRect(0, 0, width, height);

    (snapshot as number[][]).forEach((layer: number[], index: number) => {
      const size = LAYER_SIZES[index] || 0.5; // Временно увеличим
      ctx.fillStyle = BASE_COLOR;
      for (let i = 0; i < layer.length; i += 4) {
        const x = layer[i];
        const y = layer[i + 1];
        ctx.fillRect(x, y, size, size);
      }
    });
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 pointer-events-none"
      style={{ background: BACKGROUND_COLOR }}
    />
  );
}
