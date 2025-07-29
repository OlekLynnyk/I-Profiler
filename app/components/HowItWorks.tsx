'use client';

import Image from 'next/image';
import React from 'react';

export default function HowItWorks() {
  return (
    <section className="bg-transparent py-32 text-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 md:px-10 flex flex-col lg:flex-row items-center justify-between gap-12">

        {/* Телефон — адаптивный и высокий */}
        <div className="w-full max-w-[300px] h-[400px] md:h-[580px] lg:h-[640px] relative flex-shrink-0">
          <div className="relative w-full h-full aspect-[260/520]">
            <Image
              src="/images/phone-mockup.webp"
              alt="Phone frame"
              fill
              className="object-contain"
            />
          </div>
        </div>

        {/* Блок с текстом */}
        <div className="w-full lg:w-1/2 flex justify-center">
          <div className="bg-[#1A1E23]/80 backdrop-blur-md rounded-2xl border border-[#2F2F2F] px-8 py-10 space-y-6 shadow-xl max-w-md w-full flex flex-col justify-center">
            <h2 className="text-4xl md:text-5xl font-semibold leading-tight tracking-tight text-white">
              Their words.<br />Their world.<br />Your clarity.
            </h2>
            <div className="text-base md:text-lg space-y-4 text-gray-300">
              <p>Understand what drives them</p>
              <p>See the unconscious command</p>
              <p>Speak their internal language</p>
              <p>Win trust in one message</p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
