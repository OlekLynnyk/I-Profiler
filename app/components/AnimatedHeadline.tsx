'use client';
import { useEffect, useState } from 'react';
import clsx from 'clsx';

const animatedLines = [
  {
    lines: [
      "Unlock Insights with Advanced Profiling — Tailored for Business",
      "Powered by AI"
    ]
  },
  {
    lines: [
      "", // Пусто для 1-й строки
      "", // Пусто для 2-й строки
      "Turn Insights into Results" // Всплывающий текст внизу
    ]
  }
];

export default function AnimatedHeadline() {
  const [index, setIndex] = useState(0);
  const [fadeIn, setFadeIn] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setFadeIn(false);
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % animatedLines.length);
        setFadeIn(true);
      }, 500);
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative min-h-[8rem] overflow-hidden">
      <div
        className={clsx(
          "absolute inset-0 transition-all duration-700 ease-in-out transform",
          {
            "translate-y-0 opacity-100": fadeIn,
            "translate-y-full opacity-0": !fadeIn,
          }
        )}
      >
        <div className="space-y-2">
          {animatedLines[index].lines.map((line, idx) => {
            const isPurple = line.trim() === "Powered by AI";
            if (!line) return <div key={idx} className="h-[2.5rem]" />;

            return (
              <div
                key={idx}
                className={clsx(
                  "text-3xl md:text-4xl font-bold",
                  isPurple ? "text-purple-400" : "text-white"
                )}
              >
                {line}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
