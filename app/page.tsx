'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from './components/Header';
import HowItWorks from './components/HowItWorks';
import Pricing from './components/Pricing';
import { useAuth } from '@/app/context/AuthProvider';
import Footer from './components/Footer';
import CubeCanvas from './components/CubeCanvas';
import AuthModal from './components/AuthModal';
import BlackCognitiveSand from '@/components/effects/BlackCognitiveSand';

export default function HomePage() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const { session } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (session) setIsAuthModalOpen(false);
  }, [session]);

  return (
    <div className="min-h-screen flex flex-col font-inter text-[#E5E5E5] relative overflow-hidden bg-[#1A1E23] no-scrollbar">
      <BlackCognitiveSand />

      <Header onLoginClick={() => setIsAuthModalOpen(true)} />

      <main className="flex flex-col lg:flex-row items-center justify-between flex-grow text-left px-6 mt-10 gap-12 max-w-7xl mx-auto relative z-10">
        <div className="w-full lg:w-[80%] space-y-2 pl-[20px]">
          <div className="min-h-[4rem]">
            <h1 className="font-bold uppercase leading-tight tracking-tight break-words text-[34px] md:text-[82px]">
              <span className="text-white">WE UNLOCK INSIGHTS WITH</span>
              <br />
              <span className="text-white">ADVANCED PROFILING</span>
              <br />
              {/* Мобайл: те же по ширине, что и “PROFILING”; десктоп — как было */}
              <div className="text-[#C084FC] leading-tight max-w-[18ch] md:max-w-none">
                <div className="text-[22px] md:text-[28.6px]">SEE WHAT OTHERS CANNOT</div>
                <div className="text-[22px] md:text-[28.6px]">
                  REDUCE HUMAN <span className="text-[18px] md:text-[22.6px]">FACTOR</span> RISK
                </div>
              </div>
            </h1>
          </div>

          <div className="space-y-6 text-[0.8rem] md:text-[0.9rem] leading-relaxed md:max-w-[28.6rem]">
            <p className="max-w-[18ch] md:max-w-none">
              Since people do not tell us who they are, but show it <br />
              through their signals, these must be interpreted.
            </p>

            {!session && (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="bg-transparent text-[#E5E5E5] border-2 border-white font-inter font-weight-400 py-2 px-5 rounded-2xl text-base hover:bg-[#C084FC] transition-all shadow-[0_6px_12px_rgba(0,0,0,0.15)]"
              >
                Start Free Trial
              </button>
            )}
          </div>
        </div>

        <div className="w-full lg:w-1/2 h-[250px] sm:h-[350px] lg:h-[500px]">
          <CubeCanvas />
        </div>
      </main>

      <section className="mt-10 relative z-10">
        <HowItWorks />
      </section>

      <section id="pricing" className="mt-0 relative z-10">
        <Pricing onDemoClick={() => setIsAuthModalOpen(true)} />
      </section>

      {/* ABOUT — мобайл ровный текст, десктоп без изменений */}
      <section id="about" className="mt-12 mb-10 relative z-10 px-4 md:px-0">
        <div className="text-center space-y-6">
          <h2 className="text-3xl md:text-4xl font-montserrat font-weight-600 text-[#F5F5F5]">
            About
          </h2>

          {/* Узкая "мера" на мобиле создаёт ощущение рамки без самой рамки */}
          <div className="mx-auto max-w-[38ch] sm:max-w-[48ch] md:max-w-3xl text-justify md:text-justify">
            <p
              lang="en"
              className="
                text-[#E5E5E5]
                text-[15px] md:text-base
                leading-relaxed font-inter font-weight-400
                text-pretty
                hyphens-auto
                break-words
                mb-6
              "
            >
              We don’t claim to read minds. Instead, we interpret silent signals — how someone
              dresses, reacts or decides to reveal deeper drives, hidden needs and what truly moves
              them. Powered by advanced AI, we blend behavioural science with elegant inference to
              transform fragments into full pictures.
            </p>

            <p
              lang="en"
              className="
                text-[#E5E5E5]
                text-[15px] md:text-base
                leading-relaxed font-inter font-weight-400
                text-pretty
                hyphens-auto
                break-words
              "
            >
              Much like Pininfarina designs beauty into motion, we design insight into human nature.
              Every person carries a unique internal compass — we help you interpret it. Not to
              label, but to understand. To lead. To connect. Whether you're a strategist, founder or
              curious, H1NTED offers a new lens. See nuance. Sense motivation. Speak with resonance.
              Because influence begins with pure understanding.
            </p>
          </div>
        </div>
      </section>
      {/* /ABOUT */}

      {isAuthModalOpen && <AuthModal onClose={() => setIsAuthModalOpen(false)} />}
      <Footer />
    </div>
  );
}
