'use client';
import React, { useEffect, useRef, useMemo } from 'react';

/**
 * StarKingsNebulaTrails — v3 (Realistic 80/100)
 * Цель: убрать «компьютерные» прямые линии и добиться органики.
 * Подход: частицы двигаются по ПОЛЮ ПОТОКА (flow field) на основе согласованного шума (Perlin-like),
 *         с мягким шлейфом (motion persistence) и глубиной (3 слоя). Никаких прямых линий.
 */

export type StarKingsProps = {
  intensity?: number; // 0.6..1.4 — общая яркость
  density?: number; // 0..1 — плотность частиц/звёзд
  breath?: number; // 30..90 — длительность «дыхания» (сек) — влияет на туманность
  hueShift?: number; // -20..+20 — сдвиг оттенка (HSL)
  parallax?: number; // 0..8 — сила параллакса (px)
  background?: string; // базовый фон
};

export function StarKingsNebulaTrails({
  intensity = 1,
  density = 0.8,
  breath = 55,
  hueShift = 0,
  parallax = 5,
  background = '#0a0b0c',
}: StarKingsProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const backing = useRef({ w: 0, h: 0, dpr: 1, stop: false });
  const mouse = useRef({ x: 0, y: 0 });
  const isReduced = useMemo(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  // Палитра — менее насыщенная, ближе к физичной ночной сцене
  const palette = useMemo(() => {
    const baseHue = 208 + hueShift; // стальной
    return {
      mistA: `hsla(${baseHue - 4}, 26%, 56%, ${0.1 * intensity})`,
      mistB: `hsla(${baseHue - 10}, 24%, 50%, ${0.09 * intensity})`,
      trail: `hsla(${baseHue + 6}, 60%, 74%, ${0.17 * intensity})`,
      star: `hsla(${baseHue + 14}, 82%, 92%, ${0.75 * Math.min(1, intensity)})`,
    };
  }, [hueShift, intensity]);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d', { alpha: true })!;

    // ===== Размер и ретина
    const fit = () => {
      const { innerWidth: w, innerHeight: h, devicePixelRatio: dprRaw } = window;
      const dpr = Math.min(2, dprRaw || 1);
      backing.current = { w, h, dpr, stop: false };
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(document.body);

    // ===== Перлин‑подобный шум (кохерентный)
    // Простая value-noise с интерполяцией — достаточно для органики и скорости.
    const randTable = new Uint32Array(256);
    for (let i = 0; i < 256; i++) randTable[i] = (Math.sin(i * 12.9898) * 43758.5453123) >>> 0;
    const hash = (x: number, y: number, z: number) => {
      let h = (x * 374761393 + y * 668265263 + z * 2147483647) >>> 0;
      h = (h ^ (h >> 13)) >>> 0;
      return randTable[h & 255] / 4294967295;
    };
    const smooth = (t: number) => t * t * (3 - 2 * t);
    const noise3 = (x: number, y: number, z: number) => {
      const xi = Math.floor(x),
        yi = Math.floor(y),
        zi = Math.floor(z);
      const xf = x - xi,
        yf = y - yi,
        zf = z - zi;
      const u = smooth(xf),
        v = smooth(yf),
        w = smooth(zf);
      const n000 = hash(xi, yi, zi);
      const n100 = hash(xi + 1, yi, zi);
      const n010 = hash(xi, yi + 1, zi);
      const n110 = hash(xi + 1, yi + 1, zi);
      const n001 = hash(xi, yi, zi + 1);
      const n101 = hash(xi + 1, yi, zi + 1);
      const n011 = hash(xi, yi + 1, zi + 1);
      const n111 = hash(xi + 1, yi + 1, zi + 1);
      const x00 = n000 * (1 - u) + n100 * u;
      const x10 = n010 * (1 - u) + n110 * u;
      const x01 = n001 * (1 - u) + n101 * u;
      const x11 = n011 * (1 - u) + n111 * u;
      const y0 = x00 * (1 - v) + x10 * v;
      const y1 = x01 * (1 - v) + x11 * v;
      return y0 * (1 - w) + y1 * w; // 0..1
    };

    // ===== Flow field (curl-like) — углы направления из шума
    const fieldScale = 0.0016; // чем меньше — тем более крупные вихри
    const timeScale = 0.05;
    const angleAt = (x: number, y: number, t: number) => {
      const n = noise3(x * fieldScale, y * fieldScale, t * timeScale);
      const n2 = noise3((x + 1000) * fieldScale, (y - 1000) * fieldScale, t * timeScale);
      // комбинируем две карты, чтобы избежать повторяемости
      const ang = (n * 2 - 1) * Math.PI + (n2 * 2 - 1) * 0.6; // -π..π с мод. фазой
      return ang;
    };

    // ===== Частицы в 3 слоях глубины — без прямых линий, с шлейфом
    type P = {
      x: number;
      y: number;
      vx: number;
      vy: number;
      life: number;
      max: number;
      layer: number;
    };
    const LAYERS = [
      { count: Math.floor(280 * density), speed: 0.6, size: 1.6, alpha: 0.32 }, // ближний мягкий шлейф
      { count: Math.floor(220 * density), speed: 0.45, size: 1.4, alpha: 0.26 }, // средний
      { count: Math.floor(180 * density), speed: 0.3, size: 1.2, alpha: 0.2 }, // дальний
    ];
    const parts: P[] = [];
    const rnd = (a = 0, b = 1) => a + Math.random() * (b - a);
    const spawn = (layer: number) => ({
      x: rnd(0, backing.current.w),
      y: rnd(0, backing.current.h),
      vx: 0,
      vy: 0,
      life: 0,
      max: rnd(160, 420),
      layer,
    });
    LAYERS.forEach((L, li) => {
      for (let i = 0; i < L.count; i++) parts.push(spawn(li));
    });

    // ===== Туманность (фоновые эллипсы + лёгкое дыхание)
    const drawMist = (t: number, parX: number, parY: number) => {
      const W = backing.current.w,
        H = backing.current.h;
      const phase = (Math.sin((t / breath) * Math.PI * 2) + 1) * 0.5; // 0..1
      const g1 = ctx.createRadialGradient(
        W * (0.28 + parX * 0.001),
        H * (0.3 + parY * 0.001),
        0,
        W * (0.28 + parX * 0.001),
        H * (0.3 + parY * 0.001),
        Math.max(W, H) * 0.5
      );
      g1.addColorStop(0, palette.mistA);
      g1.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = 1;
      ctx.fillStyle = g1;
      ctx.beginPath();
      ctx.rect(0, 0, W, H);
      ctx.fill();
      const g2 = ctx.createRadialGradient(
        W * (0.74 - parX * 0.001),
        H * (0.68 - parY * 0.001),
        0,
        W * (0.74 - parX * 0.001),
        H * (0.68 - parY * 0.001),
        Math.max(W, H) * (0.55 + phase * 0.05)
      );
      g2.addColorStop(0, palette.mistB);
      g2.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.globalAlpha = 0.95;
      ctx.fillStyle = g2;
      ctx.beginPath();
      ctx.rect(0, 0, W, H);
      ctx.fill();
    };

    // Параллакс — мышь только при pointer:fine
    const onMove = (e: MouseEvent) => {
      const b = backing.current;
      mouse.current.x = e.clientX / b.w - 0.5;
      mouse.current.y = e.clientY / b.h - 0.5;
    };
    const pointerFine = matchMedia('(pointer:fine)').matches;
    if (pointerFine) window.addEventListener('mousemove', onMove);

    // ===== Анимация
    let raf = 0;
    let last = performance.now();
    let t = 0;
    const draw = (now: number) => {
      if (backing.current.stop) return;
      const dt = Math.min(64, now - last);
      last = now;
      t += dt / 1000;

      // Motion persistence — мягкая шторка без полного стирания
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = background + 'f2'; // чуть прозрачный
      ctx.fillRect(0, 0, backing.current.w, backing.current.h);

      const W = backing.current.w,
        H = backing.current.h;
      const parX = isReduced ? 0 : mouse.current.x * parallax;
      const parY = isReduced ? 0 : mouse.current.y * parallax;

      // Туманность
      drawMist(t, parX, parY);

      // Частицы по полю потока (ничего прямого)
      ctx.globalCompositeOperation = 'lighter';
      for (let i = 0; i < parts.length; i++) {
        const p = parts[i];
        const L = LAYERS[p.layer];
        const ang = angleAt(p.x, p.y, t);
        // сглаживание скорости (инерция)
        p.vx = p.vx * 0.96 + Math.cos(ang) * L.speed;
        p.vy = p.vy * 0.96 + Math.sin(ang) * L.speed;
        const nx = p.x + p.vx,
          ny = p.y + p.vy;

        // рисуем шлейф как мяглое свечение, без резких точек
        const g = ctx.createRadialGradient(
          nx - parX * (0.6 + p.layer * 0.2),
          ny - parY * (0.6 + p.layer * 0.2),
          0,
          nx - parX * (0.6 + p.layer * 0.2),
          ny - parY * (0.6 + p.layer * 0.2),
          L.size * 12
        );
        g.addColorStop(0, palette.trail);
        g.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.globalAlpha = L.alpha * (0.85 + 0.15 * Math.sin((p.life + i) * 0.01));
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(nx, ny, L.size * 12, 0, Math.PI * 2);
        ctx.fill();

        p.x = nx;
        p.y = ny;
        p.life += 1;
        if (p.x < -32 || p.x > W + 32 || p.y < -32 || p.y > H + 32 || p.life > p.max) {
          // респаун на краю или рандом
          const edge = Math.random();
          if (edge < 0.25) {
            p.x = -16;
            p.y = Math.random() * H;
          } else if (edge < 0.5) {
            p.x = W + 16;
            p.y = Math.random() * H;
          } else if (edge < 0.75) {
            p.y = -16;
            p.x = Math.random() * W;
          } else {
            p.y = H + 16;
            p.x = Math.random() * W;
          }
          p.vx = p.vy = 0;
          p.life = 0;
          p.max = 160 + Math.random() * 320;
        }
      }

      // Дальние звёзды (немного и очень мягко)
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = 0.35 * intensity;
      for (let i = 0; i < Math.floor(50 * density); i++) {
        const sx = (i * 89.42 + ((t * 7 + i * 13) % W)) % W;
        const sy = (i * 53.11 + ((t * 5 + i * 7) % H)) % H;
        const r = 0.8 + ((i * 17.3) % 10) * 0.02;
        const g = ctx.createRadialGradient(
          sx - parX * 0.2,
          sy - parY * 0.2,
          0,
          sx - parX * 0.2,
          sy - parY * 0.2,
          r * 8
        );
        g.addColorStop(0, palette.star);
        g.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(sx, sy, r * 8, 0, Math.PI * 2);
        ctx.fill();
      }

      if (!document.hidden) raf = requestAnimationFrame(draw);
    };

    // visibility throttling
    const onVis = () => {
      if (document.hidden) backing.current.stop = true;
      else {
        backing.current.stop = false;
        last = performance.now();
        raf = requestAnimationFrame(draw);
      }
    };
    document.addEventListener('visibilitychange', onVis);

    // Параллакс
    const handleMove = (e: MouseEvent) => onMove(e);

    if (isReduced) {
      // статичная вуаль
      ctx.fillStyle = background;
      ctx.fillRect(0, 0, backing.current.w, backing.current.h);
    } else {
      raf = requestAnimationFrame(draw);
    }

    return () => {
      backing.current.stop = true;
      cancelAnimationFrame(raf);
      document.removeEventListener('visibilitychange', onVis);
      window.removeEventListener('mousemove', handleMove);
      if (pointerFine) window.removeEventListener('mousemove', onMove);
      ro.disconnect();
    };
  }, [intensity, density, breath, hueShift, parallax, background, isReduced, palette]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
      }}
    />
  );
}

/** Предпросмотр */
export default function StarKingsNebulaTrails_Preview() {
  return (
    <div className="w-screen h-screen relative" style={{ background: '#0a0b0c' }}>
      <StarKingsNebulaTrails
        intensity={0.95}
        density={0.85}
        breath={60}
        hueShift={-6}
        parallax={5}
      />
      <div className="relative z-10 h-full w-full flex items-center justify-center p-8">
        <div className="text-center max-w-3xl">
          <h1 className="text-4xl md:text-6xl font-semibold tracking-tight text-white">
            Star Kings — Nebula Trails (Realistic v3)
          </h1>
          <p className="mt-4 text-white/70 text-lg">
            Flow field + мягкие шлейфы. Никаких прямых линий. Реалистичнее движение и фактура.
          </p>
        </div>
      </div>
    </div>
  );
}

/** Мини-галерея тестов */
export function StarKingsNebulaTrails_TestGallery() {
  return (
    <div
      className="min-h-screen grid grid-cols-1 md:grid-cols-3 gap-6 p-6"
      style={{ background: '#0a0b0c' }}
    >
      <div className="relative h-64 rounded-xl overflow-hidden">
        <StarKingsNebulaTrails
          intensity={0.9}
          density={0.8}
          breath={65}
          hueShift={-10}
          parallax={5}
        />
        <div className="relative z-10 p-3 text-white/80">Case A: colder steel, slower</div>
      </div>
      <div className="relative h-64 rounded-xl overflow-hidden">
        <StarKingsNebulaTrails
          intensity={1.0}
          density={0.95}
          breath={55}
          hueShift={-2}
          parallax={6}
        />
        <div className="relative z-10 p-3 text-white/80">Case B: denser field</div>
      </div>
      <div className="relative h-64 rounded-xl overflow-hidden">
        <StarKingsNebulaTrails
          intensity={0.85}
          density={0.7}
          breath={75}
          hueShift={4}
          parallax={4}
        />
        <div className="relative z-10 p-3 text-white/80">Case C: calm & warm steel</div>
      </div>
    </div>
  );
}
