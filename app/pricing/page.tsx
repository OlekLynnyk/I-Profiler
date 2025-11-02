'use client';

import { useState, useEffect } from 'react';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import PricingBody from '@/app/components/PricingBody';
import AuthModal from '@/app/components/AuthModal'; // ✅ добавь импорт модалки

export default function PricingPage() {
  const [showLogin, setShowLogin] = useState(false);

  useEffect(() => {
    const el = document.getElementById('pricing');
    if (el) el.scrollIntoView({ behavior: 'auto' }); // или 'smooth' если нужна анимация
  }, []);

  return (
    <>
      {/* ✅ Header — открывает модалку */}
      <Header onLoginClick={() => setShowLogin(true)} sticky={false} bg="black" />

      {/* Контент страницы с якорем для кнопки "Plans" */}
      <main className="bg-black">
        <section id="pricing">
          {/* ✅ Передаём обработчик в PricingBody */}
          <PricingBody onLoginClick={() => setShowLogin(true)} />
        </section>
      </main>

      <Footer />

      {/* ✅ сама модалка (поверх страницы) */}
      {showLogin && <AuthModal onClose={() => setShowLogin(false)} />}
    </>
  );
}
