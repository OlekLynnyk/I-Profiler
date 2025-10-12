// app/cookies/page.tsx
'use client';

import { useMemo } from 'react';
import { COOKIES_AND_SDKS, type CookieRow } from './cookies.registry';

export default function CookiePolicyPage() {
  // ВСТАВКА №1: сортированный реестр (A→Z) — чисто для отображения
  const rows = useMemo<CookieRow[]>(
    () =>
      [...COOKIES_AND_SDKS].sort((a, b) =>
        a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
      ),
    []
  );

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
        H1NTED — Cookies Policy
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

        <p className="text-sm text-white/70">Effective Date: 7 October 2025</p>

        <p className="text-white/80">
          This Cookies Policy explains how H1NTED (“H1NTED”, “we”, “us”, “our”) uses cookies and
          similar technologies on our website, web dashboard and associated services (the
          “Platform”). Read this together with our{' '}
          <a
            href="/privacy"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#C4B5FD] underline underline-offset-4"
          >
            Privacy Policy
          </a>{' '}
          and{' '}
          <a
            href="/terms"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#C4B5FD] underline underline-offset-4"
          >
            Terms of Use
          </a>
          .
        </p>

        {/* Provider details — UA legal entity */}
        <p className="text-white/80">
          Provider details. ТОВАРИСТВО З ОБМЕЖЕНОЮ ВІДПОВІДАЛЬНІСТЮ «Хінтед Штучний Інтелект»
          (EDRPOU 46041011). English: Limited Liability Company "Hinted Artificial Intelligence".
          Registered address: Flat 178, 1d Universytetska Street, Irpin, Bucha District, Kyiv
          Oblast, 08200, Ukraine. Contact:{' '}
          <a href="mailto:hello@h1nted.com" className="underline">
            hello@h1nted.com
          </a>
          .
        </p>

        <h2 className="text-xl font-semibold tracking-tight text-white">
          1) What are cookies and similar technologies?
        </h2>
        <p className="text-white/80">
          Cookies are small text files placed on your device by a website or service. First-party
          cookies are set by us; third-party cookies are set by other providers (e.g., payment
          processors). We also use similar technologies such as localStorage, sessionStorage and
          IndexedDB to achieve the same purposes (e.g., to keep you signed in, remember your
          choices, or secure requests).
        </p>

        <h2 className="text-xl font-semibold tracking-tight text-white">
          2) How we use cookies (categories)
        </h2>
        <p className="text-white/80">
          By default, only essential cookies are active. All non-essential cookies are off until you
          consent.
        </p>
        <p className="text-white/80">
          <span className="text-white font-semibold">A) Essential (Strictly Necessary)</span> — Used
          to provide the service you request and to keep the Platform secure. Blocking these will
          break core functionality. Typical purposes:
        </p>
        <ul className="list-disc marker:text-[#A855F7] pl-6 space-y-1 text-white/80">
          <li>Authentication and session management</li>
          <li>CSRF and other security protections</li>
          <li>Load balancing and availability</li>
          <li>Payment processing (e.g., Stripe)</li>
          <li>Storing your cookie preferences</li>
        </ul>
        <p className="text-white/80">
          <span className="text-white font-semibold">B) Analytics</span> — Used to understand usage
          and performance in aggregate (e.g., page load times, feature adoption). Set only if you
          consent. We configure analytics to respect privacy principles (e.g., IP truncation, no
          precise location).
        </p>
        <p className="text-white/80">
          <span className="text-white font-semibold">C) Marketing</span> — Used to measure campaigns
          or personalise content/ads if enabled. Set only if you consent. We do not set marketing
          cookies by default; if introduced, they remain off unless you opt in, and the in-product
          cookie list will reflect the change.
        </p>

        <h2 className="text-xl font-semibold tracking-tight text-white">3) Legal basis</h2>
        <p className="text-white/80">
          Essential cookies are set under EU ePrivacy rules for cookies that are strictly necessary
          to provide a service you request. Analytics and marketing cookies are set only with your
          consent under the ePrivacy rules and GDPR. You can withdraw consent at any time (see
          Section 4).
        </p>

        <h2 className="text-xl font-semibold tracking-tight text-white">
          4) Your choices: give, manage, withdraw consent
        </h2>
        <ul className="list-disc marker:text-[#A855F7] pl-6 space-y-1 text-white/80">
          <li>
            You will see a cookie banner on first visit with options to{' '}
            <span className="text-white">Accept All</span>,{' '}
            <span className="text-white">Reject All</span> (non-essential), or{' '}
            <span className="text-white">Manage Preferences</span> by category.
          </li>
          <li>You can change your choices at any time via “Cookie Settings” on the site.</li>
          <li>
            Your selections are stored in a consent preference (cookie or localStorage) so we can
            honour them.
          </li>
          <li>
            If you reject non-essential categories, we will not set them (or will disable them if
            previously set).
          </li>
          <li>
            If your browser sends a Global Privacy Control (GPC) or similar signal, we treat it as
            an instruction to reject non-essential cookies.
          </li>
          <li>
            We keep a minimal record of your consent status for up to 12 months, after which we may
            ask again.
          </li>
        </ul>

        {/* ===== 5) TABLES ===== */}
        <h2 className="text-xl font-semibold tracking-tight text-white">
          5) Cookies and similar technologies we use
        </h2>
        <p className="text-white/80">
          The exact set may vary by feature and is shown in real time in{' '}
          <span className="font-semibold">Cookie Settings</span>.
        </p>

        {/* ВСТАВКА №2: динамический реестр (ничего не удаляем) */}
        <div className="overflow-x-auto mt-3">
          <table
            role="table"
            className="w-full text-left text-sm sm:text-base border-separate"
            style={{ borderSpacing: '0 10px' }}
          >
            <caption className="sr-only">Cookies and SDKs used by the Platform</caption>
            <thead>
              <tr>
                <th
                  scope="col"
                  className="text-white/70 font-semibold uppercase tracking-wide text-xs sm:text-sm pb-1 pr-4"
                >
                  Name
                </th>
                <th
                  scope="col"
                  className="text-white/70 font-semibold uppercase tracking-wide text-xs sm:text-sm pb-1 pr-4"
                >
                  Purpose
                </th>
                <th
                  scope="col"
                  className="text-white/70 font-semibold uppercase tracking-wide text-xs sm:text-sm pb-1 pr-4"
                >
                  Provider
                </th>
                <th
                  scope="col"
                  className="text-white/70 font-semibold uppercase tracking-wide text-xs sm:text-sm pb-1 pr-4"
                >
                  Type
                </th>
                <th
                  scope="col"
                  className="text-white/70 font-semibold uppercase tracking-wide text-xs sm:text-sm pb-1 pr-4"
                >
                  Category
                </th>
                <th
                  scope="col"
                  className="text-white/70 font-semibold uppercase tracking-wide text-xs sm:text-sm pb-1"
                >
                  Retention
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={`${r.name}-${i}`}>
                  <td className="align-top text-white/80 py-3 pr-4">{r.name}</td>
                  <td className="align-top text-white/80 py-3 pr-4">{r.purpose}</td>
                  <td className="align-top text-white/80 py-3 pr-4">{r.provider ?? '—'}</td>
                  <td className="align-top text-white/80 py-3 pr-4">{r.type}</td>
                  <td className="align-top text-white/80 py-3 pr-4">{r.category}</td>
                  <td className="align-top text-white/80 py-3">{r.retention}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="text-white font-semibold mt-2">Essential (examples)</p>
        <div className="overflow-x-auto">
          <table
            className="w-full text-left text-sm sm:text-base border-separate"
            style={{ borderSpacing: '0 10px' }}
          >
            <thead>
              <tr>
                <th className="text-white/70 font-semibold uppercase tracking-wide text-xs sm:text-sm pb-1 pr-4">
                  Name (pattern)
                </th>
                <th className="text-white/70 font-semibold uppercase tracking-wide text-xs sm:text-sm pb-1 pr-4">
                  Provider
                </th>
                <th className="text-white/70 font-semibold uppercase tracking-wide text-xs sm:text-sm pb-1 pr-4">
                  Purpose
                </th>
                <th className="text-white/70 font-semibold uppercase tracking-wide text-xs sm:text-sm pb-1 pr-4">
                  Storage
                </th>
                <th className="text-white/70 font-semibold uppercase tracking-wide text-xs sm:text-sm pb-1">
                  Expiry
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="align-top text-white/80 py-3 pr-4">h1_session / h1_auth</td>
                <td className="align-top text-white/80 py-3 pr-4">H1NTED</td>
                <td className="align-top text-white/80 py-3 pr-4">Sign-in / session continuity</td>
                <td className="align-top text-white/80 py-3 pr-4">Cookie</td>
                <td className="align-top text-white/80 py-3">Session / up to 24h</td>
              </tr>
              <tr>
                <td className="align-top text-white/80 py-3 pr-4">csrf_token</td>
                <td className="align-top text-white/80 py-3 pr-4">H1NTED</td>
                <td className="align-top text-white/80 py-3 pr-4">CSRF protection</td>
                <td className="align-top text-white/80 py-3 pr-4">Cookie</td>
                <td className="align-top text-white/80 py-3">Session</td>
              </tr>
              <tr>
                <td className="align-top text-white/80 py-3 pr-4">__stripe_mid, __stripe_sid</td>
                <td className="align-top text-white/80 py-3 pr-4">Stripe</td>
                <td className="align-top text-white/80 py-3 pr-4">
                  Fraud prevention &amp; checkout
                </td>
                <td className="align-top text-white/80 py-3 pr-4">Cookie (third-party)</td>
                <td className="align-top text-white/80 py-3">Up to 1 year / ~30 min</td>
              </tr>
              <tr>
                <td className="align-top text-white/80 py-3 pr-4">sb-* auth token</td>
                <td className="align-top text-white/80 py-3 pr-4">Supabase</td>
                <td className="align-top text-white/80 py-3 pr-4">Dashboard auth/session</td>
                <td className="align-top text-white/80 py-3 pr-4">localStorage</td>
                <td className="align-top text-white/80 py-3">Until sign-out</td>
              </tr>
              <tr>
                <td className="align-top text-white/80 py-3 pr-4">cookie_consent</td>
                <td className="align-top text-white/80 py-3 pr-4">H1NTED</td>
                <td className="align-top text-white/80 py-3 pr-4">Stores your cookie choices</td>
                <td className="align-top text-white/80 py-3 pr-4">Cookie / localStorage</td>
                <td className="align-top text-white/80 py-3">Up to 12 months</td>
              </tr>
              <tr>
                <td className="align-top text-white/80 py-3 pr-4">zoho_* (mail embed if any)</td>
                <td className="align-top text-white/80 py-3 pr-4">Zoho</td>
                <td className="align-top text-white/80 py-3 pr-4">Support/contact delivery</td>
                <td className="align-top text-white/80 py-3 pr-4">Cookie (third-party)</td>
                <td className="align-top text-white/80 py-3">Varies (session/short-term)</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p className="text-white font-semibold mt-4">
          Analytics (set only if you consent; examples)
        </p>
        <div className="overflow-x-auto">
          <table
            className="w-full text-left text-sm sm:text-base border-separate"
            style={{ borderSpacing: '0 10px' }}
          >
            <thead>
              <tr>
                <th className="text-white/70 font-semibold uppercase tracking-wide text-xs sm:text-sm pb-1 pr-4">
                  Name (pattern)
                </th>
                <th className="text-white/70 font-semibold uppercase tracking-wide text-xs sm:text-sm pb-1 pr-4">
                  Provider
                </th>
                <th className="text-white/70 font-semibold uppercase tracking-wide text-xs sm:text-sm pb-1 pr-4">
                  Purpose
                </th>
                <th className="text-white/70 font-semibold uppercase tracking-wide text-xs sm:text-sm pb-1 pr-4">
                  Storage
                </th>
                <th className="text-white/70 font-semibold uppercase tracking-wide text-xs sm:text-sm pb-1">
                  Expiry
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="align-top text-white/80 py-3 pr-4">analytics_*</td>
                <td className="align-top text-white/80 py-3 pr-4">
                  [None currently / provider TBD]
                </td>
                <td className="align-top text-white/80 py-3 pr-4">
                  Aggregated usage &amp; performance
                </td>
                <td className="align-top text-white/80 py-3 pr-4">Cookie / localStorage</td>
                <td className="align-top text-white/80 py-3">1–13 months</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p className="text-white font-semibold mt-4">
          Marketing (set only if you consent; examples)
        </p>
        <div className="overflow-x-auto">
          <table
            className="w-full text-left text-sm sm:text-base border-separate"
            style={{ borderSpacing: '0 10px' }}
          >
            <thead>
              <tr>
                <th className="text-white/70 font-semibold uppercase tracking-wide text-xs sm:text-sm pb-1 pr-4">
                  Name (pattern)
                </th>
                <th className="text-white/70 font-semibold uppercase tracking-wide text-xs sm:text-sm pb-1 pr-4">
                  Provider
                </th>
                <th className="text-white/70 font-semibold uppercase tracking-wide text-xs sm:text-sm pb-1 pr-4">
                  Purpose
                </th>
                <th className="text-white/70 font-semibold uppercase tracking-wide text-xs sm:text-sm pb-1 pr-4">
                  Storage
                </th>
                <th className="text-white/70 font-semibold uppercase tracking-wide text-xs sm:text-sm pb-1">
                  Expiry
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="align-top text-white/80 py-3 pr-4">[None currently]</td>
                <td className="align-top text-white/80 py-3 pr-4">—</td>
                <td className="align-top text-white/80 py-3 pr-4">—</td>
                <td className="align-top text-white/80 py-3 pr-4">—</td>
                <td className="align-top text-white/80 py-3">—</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p className="text-white/80">
          <span className="text-white">Similar technologies.</span> We may use localStorage,
          sessionStorage and IndexedDB to keep you signed in, cache non-personal settings and store
          your cookie preferences. You can clear these via your browser settings and via Cookie
          Settings.
        </p>

        <h2 className="text-xl font-semibold tracking-tight text-white">
          6) Third-party providers
        </h2>
        <p className="text-white/80">
          Some essential cookies (e.g., for payments) are set by third parties that help operate the
          Platform:
        </p>
        <ul className="list-disc marker:text-[#A855F7] pl-6 space-y-1 text-white/80">
          <li>Stripe (payments &amp; fraud prevention)</li>
          <li>AWS (hosting / load balancing)</li>
          <li>Supabase (database / auth layers)</li>
          <li>Zoho (email/support tooling)</li>
        </ul>
        <p className="text-white/80">
          Each provider processes data under its own terms and privacy notices. Where a provider
          processes data outside the EEA/UK, we rely on the EU Standard Contractual Clauses (and UK
          equivalents) and additional safeguards; for certified US providers we may rely on the
          EU–US Data Privacy Framework.
        </p>

        <h2 className="text-xl font-semibold tracking-tight text-white">
          7) Managing cookies in your browser
        </h2>
        <p className="text-white/80">
          You can block or delete cookies via your browser controls. Blocking essential cookies may
          prevent the Platform from functioning (e.g., sign-in, checkout).
        </p>

        <h2 className="text-xl font-semibold tracking-tight text-white">8) International users</h2>
        <p className="text-white/80">
          We apply EU ePrivacy consent standards. If your local rules are stricter, you are
          responsible for ensuring compliance in your use (see also our Privacy Policy, “Global
          availability &amp; local compliance”).
        </p>

        <h2 className="text-xl font-semibold tracking-tight text-white">
          9) Changes to this Policy
        </h2>
        <p className="text-white/80">
          We may update this Policy to reflect changes in technology, law or our practices. For
          material changes, we will provide notice (banner or in-product) at least 30 days in
          advance where practicable. The Effective Date above shows when this Policy last changed.
        </p>

        <h2 className="text-xl font-semibold tracking-tight text-white">10) Contact</h2>
        <div className="text-white/80 space-y-1">
          <p>
            LLC &quot;H1NTED&quot; — Limited Liability Company &quot;Hinted Artificial
            Intelligence&quot;
          </p>
          <p>
            Registered address: Flat 178, 1d Universytetska Street, Irpin, Bucha District, Kyiv
            Oblast, 08200, Ukraine
          </p>
          <p>
            Email:{' '}
            <a href="mailto:hello@h1nted.com" className="underline">
              hello@h1nted.com
            </a>
          </p>
        </div>

        <div className="pt-4 mt-2 border-t border-white/10" />
      </section>
    </main>
  );
}
