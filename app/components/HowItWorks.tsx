'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, useAnimation, useInView } from 'framer-motion';

const items = [
  {
    id: 1,
    title: 'Upload Clues',
    image: '/images/upload.png',
  },
  {
    id: 2,
    title: 'Get Deep Insights',
    image: '/images/process.png',
  },
  {
    id: 3,
    title: 'Unlock Potential',
    image: '/images/insights.png',
  },
];

export default function HowItWorks() {
  const [activeIndex, setActiveIndex] = useState<number>(1);

  const handleClick = (index: number) => {
    setActiveIndex(index);
  };

  const getCardScale = (index: number) => {
    if (index + 1 === activeIndex) return 1.1;
    if (Math.abs(index + 1 - activeIndex) === 1) return 0.95;
    return 0.85;
  };

  const firstCardTexts = [
    'Get insights with AI persona analysis',
    'Identify the hidden command they project',
    'Uncover their core motivational drivers',
    'Receive key resonant words and a tailored message for impactful communication',
    'Simply upload an image, text, or social media post reflecting someone’s style. Give a command → get insights. No faces needed.',
  ];

  const secondCardTexts = [
    'See what drives them and how to reach them.',
    'Hidden Command: What they unconsciously project (e.g. “Let me feel free, but stay in control”)',
    'Motivational Drivers: Core values they respond to (e.g. freedom, precision, trust).',
    'Tailored Messaging: Speak their language with crafted messages that match their inner world.',
  ];

  const thirdCardTexts = [
    'Turn insights into advantage.',
    'For Business: Close deals faster, pitch smarter, lead meetings with words that land.',
    'For You: Understand people deeper, make better choices, avoid costly misreads.',
    'For Teams & Friends: Build trust, reduce friction, and connect in ways that truly matter.',
  ];

  function AnimatedTextList({ texts }: { texts: string[] }) {
    const controls = useAnimation();
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true });

    useEffect(() => {
      if (isInView) {
        texts.forEach((_, i) => {
          controls.start((index) => {
            if (index === i) {
              return {
                opacity: 1,
                y: 0,
                transition: {
                  duration: 1,
                  delay: i * 0.7,
                },
              };
            }
            return {};
          });
        });
      }
    }, [isInView, controls, texts]);

    return (
      <div ref={ref} className="mt-4 flex flex-col gap-2 items-start">
        {texts.map((text, index) => (
          <motion.div
            key={index}
            custom={index}
            initial={{ opacity: 0, y: 20 }}
            animate={controls}
            className={`px-3 py-2 rounded-xl text-xs md:text-sm font-inter ${
              index === texts.length - 1
                ? 'bg-[#C084FC]/30 text-[#1A1E23]'
                : 'bg-white/20 text-[#1A1E23] font-normal'
            } ${index === 0 ? 'font-semibold' : ''}`}
          >
            {text}
          </motion.div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center w-full py-16 md:py-24 relative overflow-hidden bg-[#1A1E23]">
      <div className="max-w-6xl mx-auto px-4 md:px-6 text-center relative z-10">
        <h2 className="text-3xl md:text-4xl font-montserrat font-weight-600 text-[#F5F5F5] text-center mb-8">
          How It Works
        </h2>

        {/* Убрали Step 1, 2, 3 блок */}

        <div className="flex flex-col md:flex-row gap-4 md:gap-6 justify-center items-center w-full">
          {items.map((item, index) => {
            const isActive = activeIndex === index + 1;

            return (
              <motion.div
                key={item.id}
                animate={{
                  scale: getCardScale(index),
                  opacity: isActive ? 1 : 0.6,
                }}
                transition={{ duration: 0.4 }}
                onClick={() => handleClick(index + 1)}
                className={`flex-1 min-w-0 p-3 md:p-4 rounded-xl cursor-pointer border shadow-[0_4px_8px_rgba(0,0,0,0.15)] transition-all bg-[#F6F5ED]
                  ${
                    isActive
                      ? 'border-[#C084FC] shadow-[#C084FC]/50'
                      : 'border-[#D1D4D6]'
                  }`}
                style={{
                  maxWidth: '380px',
                }}
              >
                <h3 className="text-lg md:text-xl font-montserrat font-weight-600 text-[#111827] text-center mb-4">
                  {item.title}
                </h3>

                {index === 0 ? (
                  <div className="text-left">
                    <img
                      src="/images/person.jpg"
                      alt="Uploaded person"
                      className="w-[120px] h-[120px] object-cover rounded-xl mb-4 mx-auto"
                    />
                    <AnimatedTextList texts={firstCardTexts} />
                  </div>
                ) : index === 1 ? (
                  <div className="text-left">
                    <AnimatedTextList texts={secondCardTexts} />
                  </div>
                ) : (
                  <div className="text-left">
                    <AnimatedTextList texts={thirdCardTexts} />
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
