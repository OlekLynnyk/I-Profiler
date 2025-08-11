// app/components/PhoneMockupMobile.tsx
'use client';

import React from 'react';

// Заменишь на реальные размеры РАМКИ (нативные px файла /images/phone-mockup.webp)
const FRAME_W = 1179;
const FRAME_H = 2556;

/**
 * Координаты "экрана" (внутреннее окно) в системе координат рамки.
 * Эти значения подобраны под типичный iPhone mockup.
 * Если у тебя свой файл рамки – поправь однажды.
 */
const SCREEN = {
  x: 0.071 * FRAME_W, // 7.1% слева
  y: 0.084 * FRAME_H, // 8.4% сверху
  w: 0.858 * FRAME_W, // ширина = 100% - 2*7.1%
  h: 1 - 0.084 - 0.094, // относительная высота (1 - top - bottom)
  r: 24, // радиус скругления экрана (подбери при необходимости)
};

type Props = {
  screenSrc: string;
  alt?: string;
  // ширина карточки на мобайле
  className?: string; // напр. "w-[46vw] max-w-[240px]"
};

export default function PhoneMockupMobile({ screenSrc, alt = 'Phone screen', className }: Props) {
  const screenHeightPx = SCREEN.h * FRAME_H;
  const screenWidthPx = SCREEN.w;
  const screenX = SCREEN.x;
  const screenY = SCREEN.y;

  return (
    // контейнер фиксирует аспект точно по рамке -> больше нет "сжатий"
    <div className={`relative ${className}`} style={{ aspectRatio: `${FRAME_W}/${FRAME_H}` }}>
      <svg
        viewBox={`0 0 ${FRAME_W} ${FRAME_H}`}
        xmlns="http://www.w3.org/2000/svg"
        className="absolute inset-0 w-full h-full"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <clipPath id="screen-clip">
            <rect
              x={screenX}
              y={screenY}
              width={screenWidthPx}
              height={screenHeightPx}
              rx={SCREEN.r}
              ry={SCREEN.r}
            />
          </clipPath>
        </defs>

        {/* Экран: кладём изображение в точную область, обрезаем по радиусу, заполняем область без искажений */}
        <image
          href={screenSrc}
          x={screenX}
          y={screenY}
          width={screenWidthPx}
          height={screenHeightPx}
          preserveAspectRatio="xMidYMid slice"
          clipPath="url(#screen-clip)"
        />

        {/* Рамка поверх (всегда совпадает с контейнером) */}
        <image
          href="/images/phone-mockup.webp"
          x={0}
          y={0}
          width={FRAME_W}
          height={FRAME_H}
          preserveAspectRatio="xMidYMid meet"
        />
      </svg>
    </div>
  );
}
