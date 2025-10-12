import React, { CSSProperties, useMemo } from 'react';

/**
 * BlackNebulaCSS — спокойная туманность в стиле космооперы.
 * Технология: ТОЛЬКО CSS (radial-gradient + transform/opacity), 0 KB JS-анимации.
 * Лёгкая, mobile-friendly, с поддержкой prefers-reduced-motion.
 *
 * Размещение: положите этот файл в `app/effects/BlackNebulaCSS.tsx`.
 * Просмотр: откройте превью-компонент ниже (экспорт по умолчанию) на любой странице или в песочнице.
 */

// Базовый фон и 3 слоя мягких световых пятен. Различие достигается сдвигами, масштабом и прозрачностью.
function NebulaLayer({
  blur = 40,
  opacity = 0.18,
  size = 140, // vw
  x = 0,
  y = 0,
  hue = 210, // стальной синий по умолчанию
  speed = 40, // секунд на цикл
  delay = 0,
}: {
  blur?: number;
  opacity?: number;
  size?: number; // в vw
  x?: number; // в vw
  y?: number; // в vh
  hue?: number; // градусы HSL
  speed?: number; // секунд
  delay?: number; // секунд
}) {
  const style = useMemo<CSSProperties>(
    () => ({
      position: 'absolute',
      inset: 0,
      // градиент как большой эллипс; цвет — холодный синий со сдвигом оттенка
      background: `radial-gradient( circle at ${x}vw ${y}vh, hsla(${hue}, 60%, 72%, ${opacity}) 0%, hsla(${hue}, 60%, 72%, 0) ${size}vw )`,
      filter: `blur(${blur}px)`,
      animation: `nebula-drift ${speed}s ease-in-out ${delay}s infinite alternate` as any,
      willChange: 'transform, opacity',
      pointerEvents: 'none',
    }),
    [blur, opacity, size, x, y, hue, speed, delay]
  );

  return <div style={style} className="nebula-layer" />;
}

export function BlackNebulaCSS({
  intensity = 1, // 0.6..1.4 — масштаб яркости слоёв
  hueShift = 0, // -20..+20 — сдвиг оттенка
  speed = 40, // секунд на цикл
  background = '#0a0b0c', // базовый графит
  previewBoost = 1, // 1..2 — усиливает амплитуду/скорость только для предпросмотра
}: {
  intensity?: number;
  hueShift?: number;
  speed?: number;
  background?: string;
  previewBoost?: number;
}) {
  // Привязка параметров к слоям: разные размеры/смещения/прозрачности.
  const layers = [
    {
      blur: 48,
      opacity: 0.18 * intensity,
      size: 110,
      x: 30,
      y: 25,
      hue: 210 + hueShift,
      speed: speed / previewBoost,
      delay: 0,
    },
    {
      blur: 64,
      opacity: 0.14 * intensity,
      size: 150,
      x: 70,
      y: 50,
      hue: 198 + hueShift,
      speed: (speed * 1.25) / previewBoost,
      delay: 3,
    },
    {
      blur: 56,
      opacity: 0.12 * intensity,
      size: 180,
      x: 10,
      y: 70,
      hue: 190 + hueShift,
      speed: (speed * 0.9) / previewBoost,
      delay: 1.5,
    },
  ];

  return (
    <div
      className="nebula-root"
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        background,
        pointerEvents: 'none',
      }}
    >
      {/* Базовое лёгкое зерно для глубины (доступно, но очень низкой интенсивности) */}
      <div className="nebula-grain" aria-hidden />
      {layers.map((p, i) => (
        <NebulaLayer key={i} {...p} />
      ))}

      <style>{`
        .nebula-root { isolation: isolate; }
        .nebula-grain {
          position: absolute; inset: 0; opacity: 0.035; pointer-events: none; mix-blend-mode: normal;
          background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch"/></filter><rect width="128" height="128" filter="url(%23n)" opacity="0.35"/></svg>');
          background-size: 128px 128px;
          animation: grain-shift 11s steps(60) infinite;
        }

        @keyframes grain-shift {
          0% { transform: translate3d(0,0,0); }
          100% { transform: translate3d(-128px,-128px,0); }
        }

        /* FIX: корректный блок без лишних скобок */
        @keyframes nebula-drift {
          0% { transform: translate3d(0, 0, 0) scale(1); opacity: 1; }
          100% { transform: translate3d(4vw, -4vh, 0) scale(1.06); opacity: 0.96; }
        }

        /* Доступность: уважаем предпочтение сниженной анимации */
        @media (prefers-reduced-motion: reduce) {
          .nebula-layer { animation: none !important; }
          .nebula-grain { animation: none !important; opacity: 0.02; }
        }
      `}</style>
    </div>
  );
}

/**
 * Превью на всю страницу: поместите компонент под любой layout, чтобы посмотреть фон перед интеграцией.
 * Этот экспорт — только для предпросмотра. В реальном проекте импортируйте BlackNebulaCSS и вставляйте в секцию/герой.
 */
export default function BlackNebulaCSS_Preview() {
  return (
    <div className="w-screen h-screen relative" style={{ background: '#0a0b0c' }}>
      {/* Фон */}
      <BlackNebulaCSS intensity={1} hueShift={0} speed={40} previewBoost={1.6} />

      {/* Демо-контент поверх */}
      <div className="relative z-10 h-full w-full flex items-center justify-center p-8">
        <div className="text-center max-w-3xl">
          <h1 className="text-4xl md:text-6xl font-semibold tracking-tight text-white">
            Calm Nebula — CSS Only
          </h1>
          <p className="mt-4 text-white/70 text-lg">
            Спокойный фон-туманность. Отключаемый, доступный, без JS-бандлов. Подходит для
            hero/секций.
          </p>
        </div>
      </div>
    </div>
  );
}

/** DEV TEST GALLERY (визуальные тест-кейсы)
 * Набор мини-превью для быстрого сравнения параметров (это наши "тесты").
 * Открой компонент, чтобы убедиться, что анимация видна и ведёт себя ожидаемо.
 */
export function BlackNebulaCSS_TestGallery() {
  return (
    <div
      className="min-h-screen grid grid-cols-1 md:grid-cols-3 gap-6 p-6"
      style={{ background: '#0a0b0c' }}
    >
      <div className="relative h-64 rounded-xl overflow-hidden">
        <BlackNebulaCSS intensity={0.9} hueShift={-8} speed={45} previewBoost={1.6} />
        <div className="relative z-10 p-3 text-white/80">Case A: softer, steel hue</div>
      </div>
      <div className="relative h-64 rounded-xl overflow-hidden">
        <BlackNebulaCSS intensity={1.05} hueShift={4} speed={35} previewBoost={1.6} />
        <div className="relative z-10 p-3 text-white/80">Case B: slightly brighter, cooler</div>
      </div>
      <div className="relative h-64 rounded-xl overflow-hidden">
        <BlackNebulaCSS intensity={0.8} hueShift={0} speed={60} previewBoost={1.8} />
        <div className="relative z-10 p-3 text-white/80">Case C: very calm, slower</div>
      </div>
    </div>
  );
}
