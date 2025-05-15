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
import AnimatedHeadline from './components/AnimatedHeadline';

export default function HomePage() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const { session, signOut } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (session) {
      setIsAuthModalOpen(false);
    }
  }, [session]);

  return (
    <div className="min-h-screen flex flex-col font-inter text-[#E5E5E5] relative overflow-hidden bg-[#1A1E23]">
      <Header onLoginClick={() => setIsAuthModalOpen(true)} />

      <main className="flex flex-col lg:flex-row items-center justify-between flex-grow text-left px-6 mt-20 gap-12 max-w-7xl mx-auto relative z-10">
        <div className="lg:w-1/2 space-y-8 pl-[20px] max-w-[55%]">
          <div className="min-h-[4rem]">
            <AnimatedHeadline />
          </div>

          <div className="space-y-6 text-base md:text-lg leading-relaxed">
            <p>
              I,Profiler analyses subtle cues — appearance, social media posts, writing, and emphasis — to reveal what drives people and provide actionable insights.
            </p>
            <p>
              We simplify your life, unlocking deeper human understanding for smarter decision-making. No fluff, just real value — delivered quickly and precisely.
            </p>

            {!session ? (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="bg-[#C084FC] text-[#212529] font-inter font-weight-400 py-3 px-8 rounded-2xl text-lg hover:bg-[#D8B4FE] transition-all shadow-[0_6px_12px_rgba(0,0,0,0.15)]"
              >
                Try for Free
              </button>
            ) : (
              <button
                onClick={signOut}
                className="bg-[#C084FC] text-[#212529] font-inter font-weight-400 py-3 px-8 rounded-2xl text-lg hover:bg-[#D8B4FE] transition-all shadow-[0_6px_12px_rgba(0,0,0,0.15)]"
              >
                Sign Out
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
            About I,Profiler
          </h2>
          <p className="text-[#E5E5E5] max-w-5xl mx-auto text-base md:text-lg leading-relaxed font-inter font-weight-400">
            What drives people? That question sparked a journey into profiling — decoding the subtle cues behind how individuals dress, speak, move, and make decisions. Not to pigeonhole them, but to understand them as they truly are. At I,Profiler, we believe a poet might be hidden within a winemaker, and a winemaker within a poet. This philosophy guides our approach, blending art and science to uncover the layers of human behavior. Our tools delve into the nuances of personality, drawing from diverse data points like online presence, written communication, and visual style. The result is a richer, more empathetic understanding that empowers better connections and decisions. We’re committed to evolving this process, constantly refining our methods to reflect the complexity of human nature, ensuring our insights remain relevant and profound...
          </p>
        </div>
      </section>

      {isAuthModalOpen && <AuthModal onClose={() => setIsAuthModalOpen(false)} />}
      <Footer />
    </div>
  );
}
