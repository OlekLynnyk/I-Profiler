// app/cookies/page.tsx

export default function CookiePolicyPage() {
  return (
    <main
      aria-labelledby="cookies-title"
      className="relative mx-auto max-w-4xl px-6 py-16 sm:py-20 text-white"
    >
      {/* Верхний мягкий глоу */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-6 -translate-x-1/2 h-[140px] w-[min(760px,92%)] rounded-[999px] bg-white/5 blur-2xl"
      />

      <h1
        id="cookies-title"
        className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-6 sm:mb-8"
      >
        Cookie Policy
      </h1>

      {/* Стеклянная карточка */}
      <section
        className="
          relative rounded-3xl bg-white/5 backdrop-blur
          ring-1 ring-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.35)]
          px-5 sm:px-8 py-6 sm:py-8 space-y-6
        "
      >
        {/* Тонкая светящаяся полоса сверху */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-[3px] rounded-t-3xl bg-gradient-to-r from-transparent via-[#A855F7]/60 to-transparent"
        />

        <p className="text-sm text-white/70">Last updated: [Insert Date]</p>

        <p className="text-white/80">
          This Cookie Policy explains how <span className="text-white">H1NTED</span> (“we”, “us”,
          “our”) uses cookies and similar technologies on our website and related services (the
          “Platform”). It should be read together with our{' '}
          <a href="/privacy" className="text-[#C4B5FD] underline underline-offset-4">
            Privacy Policy
          </a>
          .
        </p>

        <h2 className="text-xl font-semibold tracking-tight text-white">1. What are cookies?</h2>
        <p className="text-white/80">
          Cookies are small text files stored on your device by your browser. They help websites
          remember your actions and preferences and enable features like secure sign-in and session
          continuity. Similar technologies include localStorage, sessionStorage and pixels.
        </p>

        <h2 className="text-xl font-semibold tracking-tight text-white">2. How we use cookies</h2>
        <ul className="list-disc marker:text-[#A855F7] pl-6 space-y-1 text-white/80">
          <li>To keep you signed in and secure the session.</li>
          <li>To remember your choices (e.g., cookie consent).</li>
          <li>To measure site usage and improve performance (aggregated analytics).</li>
          <li>To support payments and billing flows via our providers.</li>
        </ul>

        <h2 className="text-xl font-semibold tracking-tight text-white">
          3. Categories of cookies
        </h2>
        <ul className="list-disc marker:text-[#A855F7] pl-6 space-y-2 text-white/80">
          <li>
            <span className="text-white">Strictly necessary</span> — required for core functionality
            and security (cannot be switched off).
          </li>
          <li>
            <span className="text-white">Performance/analytics</span> — help us understand how the
            Platform is used in aggregate to improve UX.
          </li>
          <li>
            <span className="text-white">Functionality</span> — remember your preferences to provide
            a more tailored experience.
          </li>
          <li>
            <span className="text-white">Advertising</span> — if enabled in the future, used to
            deliver and measure ads; disabled by default.
          </li>
        </ul>

        <h2 className="text-xl font-semibold tracking-tight text-white">4. Cookies we may set</h2>
        <div className="rounded-2xl ring-1 ring-white/10 bg-white/5 overflow-hidden">
          <div className="grid grid-cols-3 gap-0 text-sm">
            <div className="px-4 py-3 text-white/60">Name</div>
            <div className="px-4 py-3 text-white/60">Purpose</div>
            <div className="px-4 py-3 text-white/60">Expiry</div>
          </div>
          <div className="border-t border-white/10" />
          <div className="grid grid-cols-3 gap-0 text-sm">
            <div className="px-4 py-3 text-white/80">h1_session</div>
            <div className="px-4 py-3 text-white/80">Secure sign-in &amp; session</div>
            <div className="px-4 py-3 text-white/80">Session</div>
          </div>
          <div className="border-t border-white/10" />
          <div className="grid grid-cols-3 gap-0 text-sm">
            <div className="px-4 py-3 text-white/80">cookie_consent</div>
            <div className="px-4 py-3 text-white/80">Stores your cookie choices</div>
            <div className="px-4 py-3 text-white/80">6–12 months</div>
          </div>
          <div className="border-t border-white/10" />
          <div className="grid grid-cols-3 gap-0 text-sm">
            <div className="px-4 py-3 text-white/80">analytics_*</div>
            <div className="px-4 py-3 text-white/80">Anonymous usage stats (if enabled)</div>
            <div className="px-4 py-3 text-white/80">Up to 13 months</div>
          </div>
        </div>

        <h2 className="text-xl font-semibold tracking-tight text-white">
          5. Managing your preferences
        </h2>
        <p className="text-white/80">
          You can manage non-essential cookies any time via our on-site cookie banner or by changing
          your browser settings to block or delete cookies. Blocking strictly necessary cookies may
          break some features. For guidance, see your browser’s help pages.
        </p>

        <h2 className="text-xl font-semibold tracking-tight text-white">6. Third-party cookies</h2>
        <p className="text-white/80">
          Some features (e.g., payments via Stripe) may place cookies set by third parties. We do
          not control these cookies; please review the respective providers’ policies.
        </p>

        <h2 className="text-xl font-semibold tracking-tight text-white">7. Updates</h2>
        <p className="text-white/80">
          We may update this Cookie Policy from time to time to reflect changes in technology, law
          or our practices. We will post the updated version here and adjust the date above.
        </p>

        <h2 className="text-xl font-semibold tracking-tight text-white">8. Contact</h2>
        <p className="text-white/80">
          Questions about cookies? Contact us at: <span className="text-white">[Insert Email]</span>
        </p>

        <div className="pt-4 mt-2 border-t border-white/10" />
      </section>
    </main>
  );
}
