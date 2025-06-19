'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from './components/Header';
import HowItWorks from './components/HowItWorks';
import Pricing from './components/Pricing';
import { useAuth } from '@/app/context/AuthProvider';
import Footer from './components/Footer';
import CubeCanvas from './components/CubeCanvas';
import Testimonials from './components/Testimonials';
import AuthModal from './components/AuthModal';

export default function HomePage() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const { session } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (session) {
      setIsAuthModalOpen(false);
    }
  }, [session]);

  return (
    <div className="min-h-screen flex flex-col font-inter text-[#E5E5E5] relative overflow-hidden bg-[#1A1E23]">
      <Header onLoginClick={() => setIsAuthModalOpen(true)} />

      <main className="flex flex-col lg:flex-row items-center justify-between flex-grow text-left px-6 mt-10 gap-12 max-w-7xl mx-auto relative z-10">
        <div className="lg:w-1/2 space-y-2 pl-[20px] max-w-[55%]">
          <div className="min-h-[4rem]">
            <h1 className="text-5xl md:text-7xl font-bold uppercase leading-tight tracking-tight break-words">
              <span className="text-white">WE UNLOCK INSIGHTS WITH</span><br />
              <span className="text-white">ADVANCED PROFILING</span><br />
              <span className="text-[#C084FC]" style={{ fontSize: '28.6px' }}>
                SEE WHAT OTHERS CANNOT
              </span>
            </h1>
          </div>

          <div className="space-y-6 text-sm md:text-base leading-relaxed max-w-[28.6rem]">
            <p>
              Stay well ahead of others<br />
              and influence situations
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

        <div className="lg:w-1/2 w-full h-[400px] lg:h-[500px]">
          <CubeCanvas />
        </div>
      </main>

      <section className="mt-8 relative z-10">
        <HowItWorks />
      </section>

      <section className="mt-4 relative z-10">
        <Testimonials />
      </section>

      <section id="pricing" className="mt-4 relative z-10">
        <Pricing onDemoClick={() => setIsAuthModalOpen(true)} />
      </section>

      <section id="about" className="mt-4 mb-10 relative z-10">
        <div className="text-center space-y-6">
          <h2 className="text-3xl md:text-4xl font-montserrat font-weight-600 text-[#F5F5F5]">
            About
          </h2>
          <p className="text-[#E5E5E5] max-w-3xl mx-auto text-base md:text-lg leading-relaxed font-inter font-weight-400 text-justify">
            Like Pininfarina in design, I,Profiler in not really people's secrets! Understanding people is a profound challenge. Most view others through their own prism of fears and beliefs, yet every individual is unique. Then what motivates them? With I,Profiler, you get the answers.
          </p>
          <p className="text-[#E5E5E5] max-w-3xl mx-auto text-base md:text-lg leading-relaxed font-inter font-weight-400 text-justify">
            With us curious minds can deepen their understanding of human behaviour. Decode subtle cues — how someone dresses, speaks, moves, or decides — not to stereotype, but to reveal their true selves and what fuels them. We see a poet in a winemaker, or a winemaker in a poet, but we never assume they're the same. We discern their unique drives, blending art and science to illuminate human nature. — Founder, I,Profiler
          </p>
        </div>
      </section>

      {isAuthModalOpen && <AuthModal onClose={() => setIsAuthModalOpen(false)} />}
      <Footer />
    </div>
  );
}
