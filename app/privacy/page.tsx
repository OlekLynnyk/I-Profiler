// app/privacy/page.tsx
'use client';

import { useEffect } from 'react';

export default function PrivacyPage() {
  useEffect(() => {
    document.title = 'H1NTED · Privacy Policy';
  }, []);

  return (
    <main
      aria-labelledby="privacy-title"
      className="relative mx-auto max-w-4xl px-6 py-16 sm:py-20 text-white"
    >
      {/* Верхний мягкий глоу как на главной */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-6 -translate-x-1/2 h-[140px] w-[min(760px,92%)] rounded-[999px] bg-white/5 blur-2xl"
      />

      <h1
        id="privacy-title"
        className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-6 sm:mb-8"
      >
        H1NTED — Privacy Policy
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

        {/* Контент */}
        <p className="text-sm text-white/70">Effective Date: 1 September 2025</p>

        {/* Вступление: разбито на 3 абзаца */}
        <p className="text-white/80">
          This Privacy Policy explains how H1NTED Ltd. (“H1NTED”, “we”, “us”, “our”) processes
          personal data in connection with our AI-driven persona analysis platform, website and
          associated services (the “Platform”).
        </p>
        <p className="text-white/80">
          H1NTED Ltd. is (or will be) incorporated in Ireland under the Companies Act 2014 (Company
          Number: [CRN]), with registered office at [Registered Address], VAT IE[VAT].
        </p>
        <p className="text-white/80">
          Contact:{' '}
          <a href="mailto:privacy@[your-domain]" className="underline">
            privacy@[your-domain]
          </a>{' '}
          / [Insert Contact Email]. This Policy should be read together with our Terms of Use and
          Cookies Policy. Capitalised terms have the meanings given in the Terms.
        </p>

        <h2 className="text-xl font-semibold tracking-tight text-white mt-4">
          1) Roles and responsibility (who is controller/processor)
        </h2>
        <p className="text-white/80">
          User Inputs (what you upload: images, text, public profiles, links, etc.) — You act as the
          data controller. H1NTED acts as your data processor, processing User Inputs solely on your
          documented instructions to provide the Platform.
        </p>
        <p className="text-white/80">
          Account, billing, website, support and security logs — H1NTED is the data controller.
        </p>
        <p className="text-white/80">
          For Business/enterprise customers, a separate Data Processing Agreement (DPA) may apply;
          where it conflicts with this Policy, the signed DPA prevails.
        </p>
        <p className="text-white/80">
          Your obligations as controller: You are solely responsible for the lawfulness of User
          Inputs, including providing data-subject notices, having a lawful basis, and, where
          required, obtaining informed permission/consent from each person whose photograph or data
          you upload.
        </p>

        <h2 className="text-xl font-semibold tracking-tight text-white">2) Scope</h2>
        <p className="text-white/80">
          This Policy covers the Platform (website, dashboard, APIs and related services) that
          generates AI-based persona insights from User Inputs. We do not engage in solely automated
          decision-making that produces legal or similarly significant effects on individuals. Any
          profiling in the GDPR sense occurs under your control (as controller) and results in
          informational Outputs, not decisions.
        </p>

        <h2 className="text-xl font-semibold tracking-tight text-white">3) What we process</h2>
        <p className="text-white/80">
          A. User Inputs (you provide): images/photographs, text, links to publicly available social
          media profiles, and metadata you supply.
        </p>
        <p className="text-white/80">
          B. Outputs (we generate): AI-generated insights and recommendations derived from User
          Inputs.
        </p>
        <p className="text-white/80">
          C. Account &amp; Billing: business name, role, email, subscription tier, invoices, payment
          status, VAT details; limited payment metadata via Stripe (we do not store full card
          numbers).
        </p>
        <p className="text-white/80">
          D. Security &amp; Operations: IP-derived coarse location, device/browser info, timestamps
          and event logs strictly necessary to operate, secure and rate-limit the Platform.
        </p>
        <p className="text-white/80">
          E. Support &amp; Comms: messages you send to support; optional call notes.
        </p>
        <p className="text-white/80">
          We do not process biometric identifiers and we do not perform emotion recognition or
          biometric categorisation. The Platform is intended for business users 18+; we do not
          knowingly collect children’s data.
        </p>

        {/* ===== 4) TABLE (no borders/lines), визуально выделена контейнером ===== */}
        <h2 className="text-xl font-semibold tracking-tight text-white">
          4) Purposes and lawful bases
        </h2>
        <div className="rounded-2xl bg-white/10 px-4 py-4 sm:px-6 sm:py-5">
          <div className="text-white/60 text-xs sm:text-sm font-semibold uppercase tracking-wide mb-2">
            Purposes, data categories and lawful bases
          </div>
          <div className="overflow-x-auto">
            <table
              className="w-full text-left text-sm sm:text-base border-separate"
              style={{ borderSpacing: '0 10px' }}
            >
              <thead>
                <tr>
                  <th className="text-white/70 font-semibold uppercase tracking-wide text-xs sm:text-sm pb-1 pr-4">
                    Purpose
                  </th>
                  <th className="text-white/70 font-semibold uppercase tracking-wide text-xs sm:text-sm pb-1 pr-4">
                    Data
                  </th>
                  <th className="text-white/70 font-semibold uppercase tracking-wide text-xs sm:text-sm pb-1">
                    Lawful basis
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="align-top text-white/80 py-3 pr-4">
                    Provide the Platform and generate Outputs
                  </td>
                  <td className="align-top text-white/80 py-3 pr-4">
                    User Inputs, Outputs, account, logs
                  </td>
                  <td className="align-top text-white/80 py-3">
                    <span className="font-semibold">Contract necessity</span> (Art. 6(1)(b)) with
                    your organisation; for User Inputs we act as{' '}
                    <span className="font-semibold">processor</span> on your instructions
                  </td>
                </tr>
                <tr>
                  <td className="align-top text-white/80 py-3 pr-4">
                    Account administration &amp; billing
                  </td>
                  <td className="align-top text-white/80 py-3 pr-4">Account &amp; Billing</td>
                  <td className="align-top text-white/80 py-3">
                    <span className="font-semibold">Contract necessity</span>;{' '}
                    <span className="font-semibold">Legal obligation</span> (tax/audit)
                  </td>
                </tr>
                <tr>
                  <td className="align-top text-white/80 py-3 pr-4">
                    Security, fraud/abuse prevention, rate-limiting
                  </td>
                  <td className="align-top text-white/80 py-3 pr-4">Security &amp; Operations</td>
                  <td className="align-top text-white/80 py-3">
                    <span className="font-semibold">Legitimate interests</span> (Art. 6(1)(f))
                  </td>
                </tr>
                <tr>
                  <td className="align-top text-white/80 py-3 pr-4">Support communications</td>
                  <td className="align-top text-white/80 py-3 pr-4">Support &amp; Comms</td>
                  <td className="align-top text-white/80 py-3">
                    <span className="font-semibold">Contract necessity</span> /{' '}
                    <span className="font-semibold">Legitimate interests</span>
                  </td>
                </tr>
                <tr>
                  <td className="align-top text-white/80 py-3 pr-4">
                    Service notices (non-marketing)
                  </td>
                  <td className="align-top text-white/80 py-3 pr-4">Account</td>
                  <td className="align-top text-white/80 py-3">
                    <span className="font-semibold">Legitimate interests</span>
                  </td>
                </tr>
                <tr>
                  <td className="align-top text-white/80 py-3 pr-4">Marketing (optional)</td>
                  <td className="align-top text-white/80 py-3 pr-4">Email, preferences</td>
                  <td className="align-top text-white/80 py-3">
                    <span className="font-semibold">Consent</span> (opt-in; withdraw any time)
                  </td>
                </tr>
                <tr>
                  <td className="align-top text-white/80 py-3 pr-4">
                    Compliance with law/requests
                  </td>
                  <td className="align-top text-white/80 py-3 pr-4">Relevant records</td>
                  <td className="align-top text-white/80 py-3">
                    <span className="font-semibold">Legal obligation / Public interest</span>, as
                    applicable
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <p className="text-white/80">
          <span className="font-semibold">Special-category data &amp; children’s data:</span> Do not
          upload special-category data (e.g., health, biometrics, ethnicity) or children’s data
          unless you have a valid legal basis and safeguards. We may reject or delete such data
          where we become aware of it.
        </p>
        {/* ===== /4 ===== */}

        <h2 className="text-xl font-semibold tracking-tight text-white">
          5) AI processing transparency
        </h2>
        <p className="text-white/80">
          We use proprietary AI models (e.g., Grok2Vision) to generate persona insights. Analysis
          relies on objects, accessories and text cues; it does not rely on facial geometry, voice,
          gait or other biometric templates. Any accuracy/score (e.g., “~80%”) is illustrative, not
          a guarantee. Users are clearly informed they interact with AI-powered features. No
          biometric data is captured, inferred or processed. You may request human review of support
          cases and opt out of optional analytics. Outputs are informational only and must not be
          used as the sole basis for high-impact decisions (employment, credit, insurance,
          immigration, law-enforcement, healthcare).
        </p>

        <h2 className="text-xl font-semibold tracking-tight text-white">
          6) Storage and retention (strict limits)
        </h2>
        <p className="text-white/80">
          User Inputs &amp; Outputs are designed to be ephemeral. We do not retain them beyond 12
          hours and 30 minutes from completion of processing, after which they are automatically
          purged from active systems and transient caches.
        </p>
        <p className="text-white/80">
          Self-service deletion: You can delete User Inputs/Outputs at any time via the in-product
          Delete control; this triggers immediate removal from active systems and purge from
          transient caches no later than 12 hours 30 minutes.
        </p>
        <p className="text-white/80">
          We do not create routine backups of User Inputs/Outputs and do not use them to train
          foundation models. Limited, de-identified telemetry may be used to improve
          safety/reliability where lawful and non-identifying.
        </p>
        <p className="text-white/80">
          Account &amp; Billing are retained for the life of your account and thereafter up to 6
          years to satisfy tax/audit obligations.
        </p>
        <p className="text-white/80">
          Security logs are retained only as necessary for security/integrity, then minimised or
          anonymised. Legal holds or regulatory requests may temporarily override the above to the
          extent required by law.
        </p>

        <h2 className="text-xl font-semibold tracking-tight text-white">
          7) Sharing and sub-processors
        </h2>
        <p className="text-white/80">
          We do not sell personal data. We share data only with: Service providers/sub-processors
          under written data-protection terms (e.g., hosting, AI inference, email/support tooling,
          Stripe for payments, AWS for hosting, Supabase for database). Professional advisers
          (legal/accounting) under confidentiality. Authorities where required by law.
        </p>
        <p className="text-white/80">
          A current list of sub-processors and locations is available on request or via our website.
          We require sub-processors to implement appropriate security and to purge User
          Inputs/Outputs within our retention window (or provide equivalent guarantees).
        </p>

        <h2 className="text-xl font-semibold tracking-tight text-white">
          8) International transfers
        </h2>
        <p className="text-white/80">
          We primarily process data in the EU/EEA. If personal data is transferred outside the
          EEA/UK, we use appropriate safeguards such as the EU Standard Contractual Clauses (SCCs)
          (and the UK IDTA/Addendum where relevant), plus additional technical and organisational
          measures.
        </p>

        <h2 className="text-xl font-semibold tracking-tight text-white">
          9) Your responsibilities (critical)
        </h2>
        <p className="text-white/80">
          Lawful basis &amp; permissions: Do not upload any photograph, profile or text about a
          person unless you have a lawful basis under applicable data-protection laws and, where
          required, that person’s informed permission/consent.
        </p>
        <p className="text-white/80">
          Accuracy &amp; relevance: Ensure User Inputs are accurate, relevant and necessary for your
          purpose.
        </p>
        <p className="text-white/80">
          Data-subject requests: As controller of User Inputs, you handle access/erasure/objection
          requests from individuals whose data you uploaded; we will reasonably assist as your
          processor.
        </p>
        <p className="text-white/80">
          Prohibited uses: No discrimination, unlawful surveillance, harassment, doxxing or
          manipulative profiling; no use as the sole basis for sensitive decisions. If you breach
          the above, you agree to indemnify and hold H1NTED harmless for resulting claims, penalties
          or fines, as set out in the Terms of Use.
        </p>

        <h2 className="text-xl font-semibold tracking-tight text-white">10) Your rights (EU/UK)</h2>
        <p className="text-white/80">
          Where H1NTED is controller (account, billing, website, support), you may exercise rights
          of access, rectification, erasure, restriction, objection, portability, and withdrawal of
          consent (for marketing/cookies) by contacting{' '}
          <a href="mailto:privacy@[your-domain]" className="underline">
            privacy@[your-domain]
          </a>
          .
        </p>
        <p className="text-white/80">
          Where you are controller (User Inputs), please direct requests to your organisation; we
          will support as processor.
        </p>
        <p className="text-white/80">
          You may lodge a complaint with a supervisory authority. Our lead authority is the Data
          Protection Commission (Ireland). You may also complain to your local EU authority or, for
          UK individuals, to the ICO.
        </p>

        <h2 className="text-xl font-semibold tracking-tight text-white">
          11) Cookies and similar technologies
        </h2>
        <p className="text-white/80">
          We use cookies and similar technologies for functionality, security and optional
          analytics/marketing. Only essential cookies are enabled by default. Non-essential cookies
          operate on consent via our Cookies banner. See our Cookies Policy for details and
          controls.
        </p>

        <h2 className="text-xl font-semibold tracking-tight text-white">12) Security</h2>
        <p className="text-white/80">
          We implement appropriate technical and organisational measures, including encryption in
          transit, access controls, environment segregation, least-privilege access and monitoring
          for abuse. You must maintain reasonable security on your side (account hygiene, role-based
          access, secure networks) and notify us without undue delay of any suspected compromise.
        </p>
        <p className="text-white/80">
          Where H1NTED is controller and a personal-data breach occurs, we will assess and, where
          required, notify the DPC within 72 hours and affected users without undue delay. Where we
          are processor, we will notify the controller without undue delay.
        </p>

        <h2 className="text-xl font-semibold tracking-tight text-white">13) Age</h2>
        <p className="text-white/80">
          The Platform is provided to business users aged 18 or over. We do not knowingly collect
          children’s data. If you believe children’s data has been uploaded, contact us immediately
          so we can take appropriate steps to delete it.
        </p>

        <h2 className="text-xl font-semibold tracking-tight text-white">
          14) Global availability &amp; local compliance
        </h2>
        <p className="text-white/80">
          The Platform is operated from Ireland and offered to business users across the EU and
          worldwide. You are responsible for ensuring your use of the Platform complies with local
          laws (e.g., employment, sector rules, image rights) in your country.
        </p>

        <h2 className="text-xl font-semibold tracking-tight text-white">
          15) Changes to this Policy
        </h2>
        <p className="text-white/80">
          We may update this Policy from time to time. For material changes, we will provide notice
          (email or in-product) at least 30 days in advance where practicable. Continued use after
          the effective date constitutes acceptance.
        </p>

        <h2 className="text-xl font-semibold tracking-tight text-white">16) Contact</h2>
        <div className="text-white/80 space-y-1">
          <p>H1NTED Ltd.</p>
          <p>Registered office: [Registered Address]</p>
          <p>
            Email:{' '}
            <a href="mailto:privacy@[your-domain]" className="underline">
              privacy@[your-domain]
            </a>{' '}
            / [Insert Contact Email]
          </p>
          <p>Company Number: [CRN] &nbsp;|&nbsp; VAT: IE[VAT]</p>
        </div>

        {/* Низ карточки: едва заметная разделительная линия */}
        <div className="pt-4 mt-2 border-t border-white/10" />
      </section>
    </main>
  );
}
