import Image from 'next/image';
import React from 'react';

export default function HowItWorks() {
  return (
    <section className="bg-transparent text-white relative overflow-hidden min-h-[800px]">
      <div className="w-full relative px-4 flex flex-col items-center lg:block">
        {/* Левый телефон */}
        <div className="relative w-[300px] md:w-[400px] lg:w-[600px] h-[600px] lg:h-[800px] mb-10 lg:mb-0 lg:ml-[-26px]">
          <div className="absolute z-0 top-0 left-0 w-full h-full flex items-center justify-center">
            <div className="w-[230px] h-[500px] overflow-hidden rounded-[28px] relative">
              <Image
                src="/images/phone-left-screen.webp"
                alt="Phone screen left"
                width={230}
                height={500}
                className="object-cover w-full h-full"
                priority
              />
            </div>
          </div>
          <Image
            src="/images/phone-mockup.webp"
            alt="Phone frame left"
            fill
            className="object-contain z-10"
            priority
          />
        </div>

        {/* Правый телефон */}
        <div className="relative w-[300px] md:w-[400px] lg:w-[600px] h-[600px] lg:h-[800px] mb-10 lg:mb-0 lg:absolute lg:top-0 lg:left-[270px]">
          <div className="absolute z-0 top-0 left-0 w-full h-full flex items-center justify-center">
            <div className="w-[230px] h-[510px] overflow-hidden rounded-[28px] relative -translate-y-[8px] translate-x-[2px]">
              <Image
                src="/images/phone-right-screen.webp"
                alt="Phone screen right"
                width={230}
                height={510}
                className="object-cover w-full h-full object-center"
                priority
              />
            </div>
          </div>
          <Image
            src="/images/phone-mockup.webp"
            alt="Phone frame right"
            fill
            className="object-contain z-10"
            priority
          />
        </div>

        {/* Текстовый блок (HOW) */}
        <div className="w-full max-w-[400px] text-center lg:text-left px-2 lg:px-6 flex flex-col justify-center space-y-4 z-10 mt-6 lg:mt-0 lg:absolute lg:top-0 lg:left-[850px] h-[auto] lg:h-[800px]">
          <div className="space-y-2">
            <h3 className="text-white text-[36px] sm:text-[42px] lg:text-[50px] leading-tight font-bold">
              Their words
              <br />
              Their world
              <br />
              Your clarity
            </h3>
            <ul className="mt-4 text-sm sm:text-base text-[#CCCCCC] space-y-2 font-inter">
              <li>Understand what drives them</li>
              <li>See the unconscious command</li>
              <li>Speak their internal language</li>
              <li>Win trust in one message</li>
            </ul>
          </div>
        </div>
      </div>

      {/* WHY — горизонтальная полоса, ТОЛЬКО десктоп */}
      <div className="hidden lg:block w-full mt-10">
        <div className="max-w-6xl mx-auto px-6">
          <div className="rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
            <div className="grid grid-cols-3 divide-x divide-white/10 px-10 py-8">
              <div className="pr-8">
                <h4 className="text-lg font-semibold text-white">Why 1</h4>
                <p className="text-sm text-[#CCCCCC] leading-relaxed">
                  Короткое объяснение причины/ценности. (Заменим на ваш текст.)
                </p>
              </div>
              <div className="px-8">
                <h4 className="text-lg font-semibold text-white">Why 2</h4>
                <p className="text-sm text-[#CCCCCC] leading-relaxed">
                  Короткое объяснение причины/ценности. (Заменим на ваш текст.)
                </p>
              </div>
              <div className="pl-8">
                <h4 className="text-lg font-semibold text-white">Why 3</h4>
                <p className="text-sm text-[#CCCCCC] leading-relaxed">
                  Короткое объяснение причины/ценности. (Заменим на ваш текст.)
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* /WHY */}
    </section>
  );
}
