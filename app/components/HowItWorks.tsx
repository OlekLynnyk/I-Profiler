import Image from 'next/image';
import React from 'react';
import PhoneMockupMobile from './PhoneMockupMobile';

export default function HowItWorks() {
  return (
    <section className="bg-transparent text-white relative overflow-hidden">
      <div className="w-full relative px-4">
        {/* ===== MOBILE ONLY ===== */}
        <div className="lg:hidden w-full mx-auto max-w-[520px]">
          {/* TOP: два телефона рядом, экран точно в рамке */}
          <div className="grid grid-cols-2 gap-4 justify-items-center">
            <PhoneMockupMobile
              screenSrc="/images/phone-left-screen1.webp"
              className="w-[46vw] max-w-[240px]"
            />
            <PhoneMockupMobile
              screenSrc="/images/phone-right-screen2.webp"
              className="w-[46vw] max-w-[240px]"
            />
          </div>

          {/* CENTER: текст HOW */}
          <div className="mt-8 text-center space-y-4">
            <h3 className="text-white text-[30px] leading-tight font-bold">
              Their words
              <br />
              Their world
              <br />
              Your clarity
            </h3>
            <ul className="text-sm text-[#CCCCCC] space-y-2 font-inter">
              <li>Understand what drives them</li>
              <li>See the unconscious command</li>
              <li>Speak their internal language</li>
              <li>Win trust in one message</li>
            </ul>
          </div>

          {/* WHY — удалено на мобайле */}
          <div className="pb-[env(safe-area-inset-bottom)]" />
        </div>
        {/* ===== /MOBILE ONLY ===== */}

        {/* ===== DESKTOP ONLY ===== */}
        <div className="hidden lg:block">
          <div className="w-full relative flex flex-col items-start">
            {/* Левый телефон */}
            <div className="relative w-[300px] md:w-[400px] lg:w-[600px] h-[600px] lg:h-[800px] mb-10 lg:mb-0 lg:ml-[-26px]">
              <div className="absolute z-0 top-0 left-0 w-full h-full flex items-center justify-center">
                <div className="w-[230px] h-[500px] overflow-hidden rounded-[26px] relative origin-center scale-[0.985]">
                  <Image
                    src="/images/phone-left-screen1.webp"
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
                <div className="w-[230px] h-[500px] overflow-hidden rounded-[26px] relative origin-center scale-[0.985] -translate-y-[6px]">
                  <Image
                    src="/images/phone-right-screen2.webp"
                    alt="Phone screen right"
                    width={230}
                    height={500}
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

            {/* Текстовый блок (DESKTOP) */}
            <div
              className="
                w-full max-w-[450px] text-center lg:text-left px-2 lg:px-6
                flex flex-col justify-start gap-y-6 z-10 mt-6 lg:mt-0
                lg:absolute 
                lg:left-[820px]
                lg:top-[125px]
                h-[auto] lg:h-[640px]
              "
            >
              {/* Верх: три пары */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-white text-[36px] sm:text-[42px] lg:text-[50px] leading-[1.05] font-bold">
                    Their words ...
                  </h3>
                  <p className="text-sm sm:text-base text-[#C084FC] mt-1">
                    — Unearth motives that shape their decisions
                  </p>
                </div>

                <div>
                  <h3 className="text-white text-[36px] sm:text-[42px] lg:text-[50px] leading-[1.05] font-bold">
                    Their world ...
                  </h3>
                  <p className="text-sm sm:text-base text-[#C084FC] mt-1">
                    — Spaek in the cadence of their inner voice
                  </p>
                </div>

                <div>
                  <h3 className="text-white text-[36px] sm:text-[42px] lg:text-[50px] leading-[1.05] font-bold">
                    Your clarity ...
                  </h3>
                  <p className="text-sm sm:text-base text-[#C084FC] mt-1">
                    — Command trust with personalised messages
                  </p>
                </div>
              </div>

              {/* Низ: убрали рамку и justify → больше нет «дыр» между словами */}
              <div className="mt-4">
                <h4 className="text-white text-lg font-semibold mb-2">
                  The Distinction Method — an exact science
                </h4>
                <ol
                  className="
                    text-[#CCCCCC] text-sm sm:text-base leading-relaxed
                    space-y-2 list-decimal ml-5 text-left
                    text-pretty hyphens-auto break-words
                  "
                >
                  <li>
                    Upload a clue{' '}
                    <span className="text-white/60">(look, accessory, LinkedIn... No bio)</span>
                  </li>
                  <li>Extract deep intelligence from nuanced signals</li>
                  <li>
                    Orchestrate your Business and personal influence with tailored precision,
                    transforming human understanding into into a signature of your triumphs.
                  </li>
                </ol>
              </div>
            </div>
          </div>

          {/* WHY — удалено на десктопе */}
        </div>
        {/* ===== /DESKTOP ONLY ===== */}
      </div>
    </section>
  );
}
