import { useEffect, useRef } from 'react';

const LAYER_COUNT = 3;
const PARTICLES_PER_LAYER = [1600, 1200, 800]; // увеличено
const BASE_COLOR = 'rgba(255,255,255,0.015)';
const FPS_INTERVAL = 1000 / 30;
const PREWARM_STEPS = 200;

export default function BlackCognitiveSand() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particles = useRef<Float32Array[]>([]);
  const windOffset = useRef(200);
  const isVisible = useRef(true);
  const animRef = useRef<number>(0);
  const lastFrameTime = useRef<number>(0);

  const windCache = Array.from({ length: 628 }, (_, i) => Math.sin(i / 100) * 0.1);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const resize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);

    // Init particles per layer
    for (let l = 0; l < LAYER_COUNT; l++) {
      const count = PARTICLES_PER_LAYER[l];
      const arr = new Float32Array(count * 4);
      for (let i = 0; i < count; i++) {
        const base = i * 4;
        arr[base] = Math.random() * width;
        arr[base + 1] = Math.random() * height;
        arr[base + 2] = (Math.random() - 0.5) * (0.05 + l * 0.15);
        arr[base + 3] = (Math.random() - 0.5) * (0.05 + l * 0.15);
      }
      particles.current.push(arr);
    }

    // Prewarm loop
    for (let step = 0; step < PREWARM_STEPS; step++) {
      const wind = windCache[Math.floor((windOffset.current + step) % windCache.length)];
      particles.current.forEach((layer) => {
        for (let i = 0; i < layer.length; i += 4) {
          let x = layer[i];
          let y = layer[i + 1];
          let vx = layer[i + 2] + wind;
          let vy = layer[i + 3];

          x += vx;
          y += vy;

          if (x < 0) x = width;
          if (x > width) x = 0;
          if (y < 0) y = height;
          if (y > height) y = 0;

          layer[i] = x;
          layer[i + 1] = y;
          layer[i + 2] = vx * 0.97;
          layer[i + 3] = vy * 0.97;
        }
      });
      windOffset.current += 1;
    }

    const animate = (time: number) => {
      animRef.current = requestAnimationFrame(animate);
      if (!isVisible.current) return;

      const elapsed = time - lastFrameTime.current;
      if (elapsed < FPS_INTERVAL) return;
      lastFrameTime.current = time;

      ctx.globalAlpha = 0.3;
      ctx.fillStyle = 'rgba(11,11,12,0.12)';
      ctx.fillRect(0, 0, width, height);
      ctx.globalAlpha = 1.0;
      ctx.fillStyle = BASE_COLOR;

      const wind = windCache[Math.floor(windOffset.current) % windCache.length];
      windOffset.current += 1;

      particles.current.forEach((layer, idx) => {
        const size = 0.3 + idx * 0.2;

        for (let i = 0; i < layer.length; i += 4) {
          let x = layer[i];
          let y = layer[i + 1];
          let vx = layer[i + 2] + wind;
          let vy = layer[i + 3];

          x += vx;
          y += vy;

          if (x < 0) x = width;
          if (x > width) x = 0;
          if (y < 0) y = height;
          if (y > height) y = 0;

          layer[i] = x;
          layer[i + 1] = y;
          layer[i + 2] = vx * 0.97;
          layer[i + 3] = vy * 0.97;

          ctx.fillRect(x, y, size, size);
        }
      });
    };

    animRef.current = requestAnimationFrame(animate);

    const observer = new IntersectionObserver(([entry]) => {
      isVisible.current = entry.isIntersecting;
    });
    observer.observe(canvas);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', resize);
      observer.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 pointer-events-none"
      style={{ background: '#0b0b0c' }}
    />
  );
}
