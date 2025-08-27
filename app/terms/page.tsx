// app/terms/page.tsx
'use client';

import { useEffect } from 'react';

export default function TermsPage() {
  return (
    <main
      aria-labelledby="terms-title"
      className="relative mx-auto max-w-4xl px-6 py-16 sm:py-20 text-white"
    >
      {/* Верхний мягкий глоу */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-6 -translate-x-1/2 h-[140px] w-[min(760px,92%)] rounded-[999px] bg-white/5 blur-2xl"
      />

      <h1
        id="terms-title"
        className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-6 sm:mb-8"
      >
        H1NTED — Terms of Use
      </h1>

      {/* Стеклянная карточка */}
      <section
        className="
          relative rounded-3xl bg-white/5 backdrop-blur
          ring-1 ring-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.35)]
          px-5 sm:px-8 py-6 sm:py-8 space-y-6
        "
      >
        {/* Тонкая светящая полоска сверху */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-[3px] rounded-t-3xl bg-gradient-to-r from-transparent via-[#A855F7]/60 to-transparent"
        />

        <p className="text-sm text-white/70">Effective Date: 1 September 2025</p>

        <p className="text-white/80">
          These Terms of Use (&quot;Terms&quot;) govern your access to and use of H1NTED’s AI-driven
          persona analysis platform, including our website, web dashboard, any beta features,
          integrations and APIs (collectively, the &quot;Platform&quot;). By registering for,
          accessing or using the Platform, you agree to be bound by these Terms.
        </p>
        <p className="text-white/80">
          Provider details. H1NTED Ltd., a company incorporated in Ireland under the Companies Act
          2014 (Company Number: [CRN]), with registered office at [Registered Address], VAT No:
          IE[VAT].
        </p>
        <p className="text-white/80">
          These Terms sit alongside our Privacy Policy and Cookies Policy. If you use paid services,
          the billing terms below also apply.
        </p>

        <h2 className="text-xl font-semibold tracking-tight text-white">
          0) Definitions and interpretation
        </h2>
        <ul className="list-disc marker:text-[#A855F7] pl-6 space-y-1 text-white/80">
          <li>
            <span className="text-white">User Inputs:</span> any data, text, links, images,
            photographs, social media profiles or other content you submit to or through the
            Platform.
          </li>
          <li>
            <span className="text-white">Outputs:</span> AI-generated content, insights, scores,
            indicators and recommendations produced by the Platform.
          </li>
          <li>
            <span className="text-white">You / your:</span> the business customer or authorised user
            of the Platform.
          </li>
        </ul>
        <p className="text-white/80">
          Headings are for convenience only. UK English spelling prevails.
        </p>

        <h2 className="text-xl font-semibold tracking-tight text-white">
          1) Age and Access Requirements
        </h2>
        <p className="text-white/80">
          This Platform is intended for business users aged 18 years or over. By using our services,
          you represent and warrant that you meet this requirement and that you act for business
          purposes and not as a consumer. These Terms apply to all uses of the Platform, including
          any features or integrations.
        </p>

        <h2 className="text-xl font-semibold tracking-tight text-white">
          2) Description of Service
        </h2>
        <p className="text-white/80">
          Our Platform offers AI-generated persona analysis based on User Inputs and provides
          behavioural and communication recommendations.
        </p>
        <p className="text-white/80">The service does not:</p>
        <ul className="list-disc marker:text-[#A855F7] pl-6 space-y-1 text-white/80">
          <li>guarantee accuracy, truth or completeness;</li>
          <li>make decisions on your behalf;</li>
          <li>
            constitute legal, HR, medical, psychological, financial or other professional advice.
          </li>
        </ul>
        <p className="text-white/80">
          All insights are recommendations only. You remain fully responsible for reviewing Outputs
          and for any actions or decisions taken on the basis of them. The Platform is provided
          &quot;as is&quot; and &quot;as available&quot; and may include beta features that can be
          unstable or change without notice.
        </p>

        <h2 className="text-xl font-semibold tracking-tight text-white">
          3) Registration and Consent
        </h2>
        <p className="text-white/80">
          To use the Platform, you must create an account and explicitly agree to these Terms (e.g.,
          via checkbox) during registration and login. Access is granted via Google sign-in or email
          verification code. During sign-up you must confirm you act for business purposes and
          provide business details (e.g., company name and role). You must ensure your account
          information is accurate and kept up to date.
        </p>

        <h2 className="text-xl font-semibold tracking-tight text-white">4) Acceptable Use</h2>
        <p className="text-white/80">You agree to:</p>
        <ul className="list-disc marker:text-[#A855F7] pl-6 space-y-1 text-white/80">
          <li>use the Platform lawfully, ethically and in good faith;</li>
          <li>never use it to harm others or yourself;</li>
          <li>upload only lawful, non-infringing and authorised content.</li>
        </ul>
        <p className="text-white/80">
          You must not use the Platform for harassment, defamation, doxxing, discrimination,
          surveillance, scraping without right, or any purpose that breaches privacy, image rights,
          IP rights, export controls or sanctions laws. We may suspend or terminate your access
          where we reasonably believe the Platform is used in a harmful, abusive, unlawful or
          high-risk manner. No refunds will be issued in such cases.
        </p>

        <h2 className="text-xl font-semibold tracking-tight text-white">5) Nature of AI Output</h2>
        <p className="text-white/80">
          All Outputs are AI-generated, non-deterministic and probabilistic. They may be inaccurate
          or incomplete and can vary for the same prompt. You must not treat Outputs as definitive
          for any legal, medical, employment, credit, insurance, immigration, law-enforcement or
          other high-impact decisions. You bear all responsibility for validation and use of
          Outputs. Approximate accuracy or confidence indicators are illustrative only.
        </p>

        <h2 className="text-xl font-semibold tracking-tight text-white">
          6) User Inputs &amp; Legal Responsibility (photos and permissions)
        </h2>
        <p className="text-white/80">
          You are solely responsible for User Inputs. You remain the data controller for personal
          data contained in User Inputs unless a separate written data processing agreement (DPA)
          states otherwise.
        </p>
        <p className="text-white/80">By submitting User Inputs, you warrant that:</p>
        <ul className="list-disc marker:text-[#A855F7] pl-6 space-y-1 text-white/80">
          <li>
            you have a lawful basis under applicable data protection laws (EU/UK GDPR and
            equivalents);
          </li>
          <li>
            where required, you obtained informed permission from each person whose photograph or
            data you upload;
          </li>
          <li>
            User Inputs do not include children’s data or special-category data (e.g., health,
            biometrics) unless you have all legally required consents and safeguards;
          </li>
          <li>
            User Inputs do not infringe any third-party rights (including copyright, database
            rights, privacy, image rights).
          </li>
        </ul>
        <p className="text-white/80">
          You grant H1NTED a limited licence to process User Inputs solely to provide, secure and
          improve the Platform (including model quality), as described in our Privacy Policy. We do
          not sell personal data.
        </p>
        <p className="text-white/80">
          You agree to defend, indemnify and hold harmless H1NTED from any claims, damages,
          penalties, regulatory fines, costs and expenses (including reasonable legal fees) arising
          from User Inputs, your failure to obtain permissions, or your breach of law or these
          Terms.
        </p>

        <h2 className="text-xl font-semibold tracking-tight text-white">
          7) Prohibited and High-Risk Uses
        </h2>
        <p className="text-white/80">
          You must not use the Platform to perform or assist emotion recognition, biometric
          categorisation, or profiling in contexts regulated as high-risk (including workplace or
          education) without a separate written agreement, appropriate human oversight and lawful
          basis. No use for surveillance or any purpose prohibited by AI or privacy regulation.
        </p>

        <h2 className="text-xl font-semibold tracking-tight text-white">
          8) Subscription and Payments
        </h2>
        <p className="text-white/80">
          We offer several subscription tiers (Free, Smarter, Business) as described on our Pricing
          page. Subscriptions renew automatically every 4 weeks via Stripe.
        </p>
        <ul className="list-disc marker:text-[#A855F7] pl-6 space-y-1 text-white/80">
          <li>You may cancel at any time; access remains until the end of the current period.</li>
          <li>Payments are non-refundable once processed, except where required by law.</li>
          <li>
            Fees are as published on the Website, exclusive of taxes; Irish VAT (if applicable) will
            be charged at the prevailing Irish rate.
          </li>
          <li>
            You are responsible for all applicable taxes relating to your purchases, except taxes on
            H1NTED’s income.
          </li>
          <li>We may change fees with prior notice.</li>
          <li>
            Chargebacks or failed payments are a material breach and may result in suspension.
          </li>
          <li>
            All payment processing is securely managed by Stripe. We do not store full card details.
          </li>
        </ul>

        <h2 className="text-xl font-semibold tracking-tight text-white">9) Support</h2>
        <p className="text-white/80">
          We offer email-based support via [Insert Email]. Target response time is up to 48 business
          hours. Occasional video sessions may be offered at our discretion and are not guaranteed.
          Unless expressly agreed, no SLA or uptime commitment applies and support priority is not
          tier-based.
        </p>

        <h2 className="text-xl font-semibold tracking-tight text-white">
          10) Account Security, Deletion and Suspension
        </h2>
        <p className="text-white/80">
          You must keep credentials confidential and use reasonable organisational and technical
          measures to secure access. Notify us without undue delay if you suspect unauthorised use.
        </p>
        <p className="text-white/80">
          You may delete your account at any time via settings. Deleted accounts may be recoverable
          within 24 hours. We may retain minimal transactional logs as required by law.
        </p>
        <p className="text-white/80">
          We reserve the right to disable accounts without notice in cases of policy violations,
          misuse, non-payment, security or regulatory risk, without refund or liability.
        </p>

        <h2 className="text-xl font-semibold tracking-tight text-white">
          11) Intellectual Property
        </h2>
        <p className="text-white/80">
          All technology, software, AI models, analysis, design, and content provided through the
          Platform are the exclusive property of H1NTED or its licensors.
        </p>
        <p className="text-white/80">
          We grant you a limited, non-exclusive, non-transferable licence to access and use the
          Platform and to use Outputs for your internal business purposes in accordance with these
          Terms. Except for the limited licence above, no IP rights are transferred. You must not
          reverse engineer, decompile or create derivative works of the Platform.
        </p>

        <h2 className="text-xl font-semibold tracking-tight text-white">
          12) Data Protection and Roles
        </h2>
        <p className="text-white/80">
          We process personal data in accordance with our Privacy Policy. For most use cases, you
          are the controller of personal data in User Inputs and H1NTED acts as processor. For
          Business/enterprise customers, a DPA may be provided; in case of conflict, the signed DPA
          prevails over these Terms.
        </p>
        <p className="text-white/80">
          International transfers may occur; we use appropriate safeguards as required by EU/UK
          GDPR. Our lead supervisory authority is the Data Protection Commission (Ireland). You may
          lodge a complaint with the DPC or with your local EU supervisory authority.
        </p>
        <p className="text-white/80">
          You must not upload personal data where you lack a lawful basis or permissions, and you
          must honour data-subject rights requests arising from your use of the Platform.
        </p>

        <h2 className="text-xl font-semibold tracking-tight text-white">
          13) Third-Party Services and Sub-processors
        </h2>
        <p className="text-white/80">
          The Platform integrates third-party services (including hosting, analytics, AI providers
          and payment processors). We are not responsible for their acts or omissions. Your use of
          Stripe and other third-party services may be subject to their own terms.
        </p>

        <h2 className="text-xl font-semibold tracking-tight text-white">14) Indemnity</h2>
        <p className="text-white/80">
          In addition to clause 6, you shall defend, indemnify and hold harmless H1NTED, its
          officers, employees and contractors from and against all claims, damages, penalties,
          regulatory fines, costs and expenses (including reasonable legal fees) arising out of or
          in connection with: (a) your User Inputs; (b) your use of the Platform or Outputs; (c)
          your breach of these Terms or of law; or (d) any third-party claim relating to privacy,
          image rights, IP or defamation.
        </p>

        <h2 className="text-xl font-semibold tracking-tight text-white">
          15) Limitation of Liability
        </h2>
        <p className="text-white/80">
          Nothing in these Terms limits or excludes liability for death or personal injury caused by
          negligence, fraud or fraudulent misrepresentation, or any liability that cannot lawfully
          be limited or excluded.
        </p>
        <ul className="list-disc marker:text-[#A855F7] pl-6 space-y-1 text-white/80">
          <li>all implied warranties are excluded to the fullest extent permitted by law;</li>
          <li>
            H1NTED shall not be liable for loss of profits, revenue, goodwill, anticipated savings,
            data loss, business interruption, or any indirect or consequential loss;
          </li>
          <li>
            H1NTED’s total aggregate liability arising out of or in connection with the Platform
            (whether in contract, tort, negligence or otherwise) shall not exceed the greater of
            €100 or the fees paid by you to H1NTED in the preceding 12 months.
          </li>
        </ul>
        <p className="text-white/80">
          We are not responsible for service interruptions or data loss due to force majeure
          (including software errors, hosting issues, third-party outages or acts of government).
          Repairs may take time.
        </p>

        <h2 className="text-xl font-semibold tracking-tight text-white">
          16) Territorial Scope and Your Compliance
        </h2>
        <p className="text-white/80">
          The Platform is operated from Ireland and is available to business users across the EU and
          worldwide. You are responsible for ensuring that your access and use comply with the laws
          of the country in which you are located, including data, employment and sector-specific
          rules.
        </p>

        <h2 className="text-xl font-semibold tracking-tight text-white">
          17) Governing Law and Jurisdiction
        </h2>
        <p className="text-white/80">
          These Terms and any non-contractual obligations arising out of or in connection with them
          are governed by the laws of Ireland. The courts of Ireland, sitting in Dublin, shall have
          exclusive jurisdiction.
        </p>

        <h2 className="text-xl font-semibold tracking-tight text-white">
          18) Changes to These Terms
        </h2>
        <p className="text-white/80">
          We may update these Terms. For material changes, we will provide notice (e.g., email or
          in-product) at least 30 days in advance where practicable, or sooner where required for
          security or legal compliance. Continued use after the effective date constitutes
          acceptance.
        </p>

        <h2 className="text-xl font-semibold tracking-tight text-white">
          19) Notices and Communications
        </h2>
        <p className="text-white/80">
          Notices may be given by email to your registered address and to H1NTED at [Insert Email].
          Electronic notices are deemed received on the day sent, if sent on a business day. We sell
          exclusively to businesses. The EU Online Dispute Resolution platform does not apply.
        </p>

        <h2 className="text-xl font-semibold tracking-tight text-white">
          20) Export Control and Sanctions
        </h2>
        <p className="text-white/80">
          You represent that you are not subject to sanctions and will not access or use the
          Platform in embargoed jurisdictions or for prohibited end-uses. You agree to comply with
          applicable EU, Irish, UK and US export control and sanctions laws.
        </p>

        <h2 className="text-xl font-semibold tracking-tight text-white">21) Taxes</h2>
        <p className="text-white/80">
          You are responsible for all applicable taxes (including VAT) relating to your purchases,
          except for taxes on H1NTED’s income.
        </p>

        <h2 className="text-xl font-semibold tracking-tight text-white">
          22) Assignment and Subcontracting
        </h2>
        <p className="text-white/80">
          You may not assign or transfer your rights under these Terms without our prior written
          consent. We may assign our rights or subcontract our obligations in connection with a
          merger, acquisition, corporate reorganisation or sale of assets.
        </p>

        <h2 className="text-xl font-semibold tracking-tight text-white">23) Order of Precedence</h2>
        <p className="text-white/80">
          If there is a conflict, a signed order form or DPA (if any) prevails over these Terms,
          which prevail over policies published on the Website.
        </p>

        <h2 className="text-xl font-semibold tracking-tight text-white">
          24) Language and Legal Effect
        </h2>
        <p className="text-white/80">
          These Terms are drafted in English. In the event of translation discrepancies, the English
          version shall prevail.
        </p>

        <h2 className="text-xl font-semibold tracking-tight text-white">
          25) No Agency; Independent Parties
        </h2>
        <p className="text-white/80">
          Nothing in these Terms creates a partnership, agency, employment or joint venture. Each
          party is an independent contractor.
        </p>

        <h2 className="text-xl font-semibold tracking-tight text-white">
          26) Severability; Waiver; Entire Agreement
        </h2>
        <p className="text-white/80">
          If any provision is held invalid, the remainder remains in force. A failure to enforce is
          not a waiver. These Terms constitute the entire agreement regarding your use of the
          Platform and supersede prior understandings on that subject.
        </p>

        <h2 className="text-xl font-semibold tracking-tight text-white">Contact</h2>
        <div className="text-white/80 space-y-1">
          <p>H1NTED Ltd.</p>
          <p>Registered office: [Registered Address]</p>
          <p>Email: [Insert Email]</p>
          <p>Company Number: [CRN] &nbsp;|&nbsp; VAT: IE[VAT]</p>
        </div>

        {/* Низ карточки */}
        <div className="pt-4 mt-2 border-t border-white/10" />
      </section>
    </main>
  );
}
