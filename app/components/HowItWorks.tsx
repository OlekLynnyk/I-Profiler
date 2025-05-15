'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

const items = [
  {
    id: 1,
    title: 'Upload Clues',
    description: `To unlock brilliant insights, simply upload pictures of someone’s style (such as clothes, bags, sunglasses, etc.), words (a few emails or chats), or social media posts, and provide a command — specify why you wish to analyse a person (a specific request) — no faces needed!

This clever tool, built with ultra-safe GDPR technology, interprets it all like a wizard, turning small clues into significant, powerful insights.`,
    image: '/images/upload.png',
  },
  {
    id: 2,
    title: 'Get Deep Insights',
    description: `Reap the benefits of breaking down and piecing back together the materials you provided, with added value — an answer to your request. Here’s a glimpse of what you can gain with I,Profiler:

Hidden Message: Their style reveals a secret message (e.g., “I crave freedom but need control”) — decode it, and everyone will admire you.
Motivations & Key Words: Their heart beats with big dreams (e.g., freedom, control, openness) — use these magic words to connect.
Personalised Note: The tool crafts a tailored note with those words (e.g., “Feel free with a space full of control!” or “Drive with freedom and power!”).`,
    image: '/images/process.png',
  },
  {
    id: 3,
    title: 'Unlock Potential',
    description: `See I,Profiler’s magic transform the way you interact with the world for the better:

For Business: Secure major deals with meeting insights, lead teams like a pro, sell cars 70% faster, choose ideal jobs, and pitch startups to win big!
For You: Discover your own hidden dreams (like a love for freedom), making you the most confident, smartest version of yourself!
For Friends: Understand their subtle vibes, avoid conflicts, and make friendships shine brighter than ever!`,
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

  return (
    <div className="flex flex-col items-center w-full py-24 relative overflow-hidden bg-[#1A1E23]">
      <div className="max-w-6xl mx-auto px-6 text-center relative z-10">
        <h2 className="text-3xl font-montserrat font-weight-600 text-[#F5F5F5] text-center mb-8">
          How It Works
        </h2>

        <div className="flex justify-center gap-4 mb-10">
          {items.map((item, index) => (
            <div
              key={item.id}
              onClick={() => handleClick(index + 1)}
              className={`cursor-pointer text-[0.6ровойrem] md:text-xs font-inter font-weight-400 px-2 py-1 rounded-2xl transition-all
                ${
                  activeIndex === index + 1
                    ? 'bg-[#C084FC] text-[#212529]'
                    : 'text-[#E5E5E5] border border-[#D1D4D6] hover:bg-[#F6F5ED]/20'
                }`}
            >
              Step {index + 1}
            </div>
          ))}
        </div>

        <div className="flex flex-col md:flex-row gap-6 justify-center items-center w-full">
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
                className={`flex-1 p-4 rounded-xl cursor-pointer border shadow-[0_6px_12px_rgba(0,0,0,0.15)] transition-all bg-[#F6F5ED]
                  ${
                    isActive
                      ? 'border-[#C084FC] shadow-[#C084FC]/50'
                      : 'border-[#D1D4D6]'
                  }`}
              >
                <h3 className="text-xl font-montserrat font-weight-600 text-[#111827] text-center mb-3">
                  {item.title}
                </h3>

                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full object-contain mx-auto mb-3 rounded-xl"
                  style={{ maxHeight: '300px' }}
                />

                <p className="text-sm text-[#374151] font-inter font-weight-400 whitespace-pre-line">
                  {item.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}