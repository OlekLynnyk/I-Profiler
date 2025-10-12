'use client';

export default function SubProcessorsPage() {
  return (
    <main
      aria-labelledby="subprocessors-title"
      className="relative mx-auto max-w-4xl px-6 py-16 sm:py-20 text-white"
    >
      {/* Верхний мягкий глоу */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-6 -translate-x-1/2 h-[140px] w-[min(760px,92%)] rounded-[999px] bg-white/5 blur-2xl"
      />

      <h1
        id="subprocessors-title"
        className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-6 sm:mb-8"
      >
        Sub-processors
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

        <p className="text-sm text-white/70">
          <span className="font-medium">Effective Date:</span> 9 October 2025
          <br />
          <span className="font-medium">Last Updated:</span> 9 October 2025
        </p>

        <p className="text-white/80">
          This page lists the third-party service providers that H1NTED engages as{' '}
          <strong>sub-processors</strong> to support the Platform{' '}
          <strong>solely where H1NTED acts as a data processor</strong> on behalf of business
          customers. For activities where H1NTED is a <strong>data controller</strong> (e.g.,
          account, billing, website), see our{' '}
          <a className="underline" href="/privacy">
            Privacy Policy
          </a>
          .
        </p>

        <h2 className="text-xl font-semibold tracking-tight text-white">What a sub-processor is</h2>
        <p className="text-white/80">
          A sub-processor is a third party engaged by H1NTED that may process personal data{' '}
          <strong>on our customers’ instructions</strong> to provide, secure, or support the
          Platform (hosting, storage, authentication, payments, support tooling, AI inference,
          etc.). We require each sub-processor to sign data-protection terms, implement appropriate
          technical and organisational measures, and to delete data within our retention windows or
          provide equivalent guarantees.
        </p>

        <h2 className="text-xl font-semibold tracking-tight text-white">
          Current sub-processors (processor scope)
        </h2>
        <blockquote className="text-white/70 border-l border-white/10 pl-4">
          Scope below applies to processing where H1NTED is <strong>processor</strong>. Data is
          limited to the minimum necessary to perform the service.
        </blockquote>

        {/* Таблица со скроллом на мобильных */}
        <div className="overflow-x-auto">
          <table className="min-w-full text-left align-top text-sm">
            <thead className="text-white/80">
              <tr className="border-b border-white/10">
                <th className="py-3 pr-4 font-semibold">Provider</th>
                <th className="py-3 pr-4 font-semibold">Service/Role</th>
                <th className="py-3 pr-4 font-semibold">Typical Data Processed</th>
                <th className="py-3 pr-4 font-semibold">Primary Processing Location(s)</th>
                <th className="py-3 pr-4 font-semibold">Transfer Mechanism(s)</th>
                <th className="py-3 pr-4 font-semibold">DPA / Info</th>
              </tr>
            </thead>
            <tbody className="text-white/80">
              <tr className="border-b border-white/10">
                <td className="py-3 pr-4 font-medium text-white">Amazon Web Services (AWS)</td>
                <td className="py-3 pr-4">Cloud hosting, storage, load balancing</td>
                <td className="py-3 pr-4">
                  Pseudonymous user IDs, <strong>ephemeral</strong> User Inputs/Outputs during
                  inference, operational logs strictly necessary for delivery/security
                </td>
                <td className="py-3 pr-4">
                  EU (primary). Limited access from other regions for support if required
                </td>
                <td className="py-3 pr-4">EU GDPR SCCs (if cross-border support access occurs)</td>
                <td className="py-3 pr-4">
                  <a
                    className="underline"
                    href="https://aws.amazon.com/compliance"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    aws.amazon.com/compliance
                  </a>
                </td>
              </tr>

              <tr className="border-b border-white/10">
                <td className="py-3 pr-4 font-medium text-white">Supabase</td>
                <td className="py-3 pr-4">Managed database &amp; authentication for dashboard</td>
                <td className="py-3 pr-4">
                  Account identifiers, session tokens, minimal operational metadata
                </td>
                <td className="py-3 pr-4">
                  EU (primary). Limited support access from other regions if required
                </td>
                <td className="py-3 pr-4">EU GDPR SCCs (if cross-border support access occurs)</td>
                <td className="py-3 pr-4">
                  <a
                    className="underline"
                    href="https://supabase.com/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    supabase.com/privacy
                  </a>
                </td>
              </tr>

              <tr className="border-b border-white/10">
                <td className="py-3 pr-4 font-medium text-white">Stripe</td>
                <td className="py-3 pr-4">Payments &amp; anti-fraud</td>
                <td className="py-3 pr-4">
                  Billing contact, business name, email, payment metadata (no full card numbers
                  stored by H1NTED)
                </td>
                <td className="py-3 pr-4">EU/US (depends on card network/region)</td>
                <td className="py-3 pr-4">EU–US DPF and/or EU GDPR SCCs</td>
                <td className="py-3 pr-4">
                  <a
                    className="underline"
                    href="https://stripe.com/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    stripe.com/privacy
                  </a>
                </td>
              </tr>

              <tr className="border-b border-white/10">
                <td className="py-3 pr-4 font-medium text-white">Zoho</td>
                <td className="py-3 pr-4">Email/support tooling (contact forms, ticketing)</td>
                <td className="py-3 pr-4">Support messages, contact email, headers/metadata</td>
                <td className="py-3 pr-4">EU/US (service-dependent)</td>
                <td className="py-3 pr-4">EU GDPR SCCs and/or EU–US DPF</td>
                <td className="py-3 pr-4">
                  <a
                    className="underline"
                    href="https://www.zoho.com/privacy.html"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    zoho.com/privacy
                  </a>
                </td>
              </tr>

              <tr>
                <td className="py-3 pr-4 font-medium text-white">
                  Third-party AI inference provider(s)
                </td>
                <td className="py-3 pr-4">Model inference to generate Outputs from User Inputs</td>
                <td className="py-3 pr-4">
                  <strong>Ephemeral</strong> User Inputs strictly necessary to fulfil the request;
                  transient safety/abuse-prevention features
                </td>
                <td className="py-3 pr-4">
                  Region depends on model/provider; selected to minimise transfers
                </td>
                <td className="py-3 pr-4">EU GDPR SCCs and/or EU–US DPF (provider-dependent)</td>
                <td className="py-3 pr-4">Listed in-product in the model picker</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 className="text-lg font-semibold tracking-tight text-white">Notes</h3>
        <ul className="list-disc marker:text-[#A855F7] pl-6 space-y-1 text-white/80">
          <li>
            <strong>AI models:</strong> Third-party inference is used{' '}
            <strong>only for runtime processing</strong>; User Inputs/Outputs are{' '}
            <strong>not</strong> used to train, fine-tune, or improve models.
          </li>
          <li>
            <strong>Data minimisation:</strong> User Inputs/Outputs are designed to be{' '}
            <strong>ephemeral</strong> and automatically deleted within short windows after
            processing completion.
          </li>
          <li>
            <strong>Security:</strong> All sub-processors are contractually required to implement
            appropriate security (encryption in transit, access controls, least privilege,
            monitoring) and to support our deletion timelines.
          </li>
        </ul>

        <h2 className="text-xl font-semibold tracking-tight text-white">
          Locations &amp; international transfers
        </h2>
        <p className="text-white/80">
          Where personal data is transferred from the EEA/UK to a country without an adequacy
          decision, H1NTED implements the{' '}
          <strong>EU Standard Contractual Clauses (2021/914)</strong> (and the UK IDTA/Addendum
          where relevant), plus additional technical and organisational measures. For certified US
          providers, we may rely on the <strong>EU–US Data Privacy Framework</strong>.
        </p>

        <h2 className="text-xl font-semibold tracking-tight text-white">
          How we add or change sub-processors
        </h2>
        <ul className="list-disc marker:text-[#A855F7] pl-6 space-y-1 text-white/80">
          <li>
            <strong>Advance notice:</strong> We will post updates to this page and, for affected
            customers with a signed DPA, provide{' '}
            <strong>email notice at least 30 days in advance</strong> of adding or replacing a
            sub-processor (except urgent changes required for security, continuity, or legal
            compliance; in such cases we will notify as soon as practicable).
          </li>
          <li>
            <strong>Subscribe to updates:</strong> Email{' '}
            <a
              className="underline"
              href="mailto:hello@h1nted.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              hello@h1nted.com
            </a>{' '}
            with the subject “Subscribe — Sub-processor updates” to receive change notifications.
          </li>
          <li>
            <strong>Enterprise objections:</strong> If your signed DPA includes an{' '}
            <strong>objection right</strong>, you may object on reasonable, documented
            data-protection grounds by emailing{' '}
            <a
              className="underline"
              href="mailto:hello@h1nted.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              hello@h1nted.com
            </a>{' '}
            within the notice period. We will work with you in good faith to provide a commercially
            reasonable alternative. If no alternative is feasible, remedies are as set out in the
            DPA.
          </li>
        </ul>

        <h2 className="text-xl font-semibold tracking-tight text-white">
          Data retention (processor scope)
        </h2>
        <ul className="list-disc marker:text-[#A855F7] pl-6 space-y-1 text-white/80">
          <li>
            <strong>User Inputs/Outputs:</strong> Ephemeral by design (auto-deletion within short
            windows after processing).
          </li>
          <li>
            <strong>Operational logs:</strong> Minimal logs retained only as necessary for
            integrity, security and legal obligations.
          </li>
          <li>
            <strong>Payments &amp; billing:</strong> Retained as required for tax/audit compliance.
          </li>
        </ul>

        <h2 className="text-xl font-semibold tracking-tight text-white">Security overview</h2>
        <p className="text-white/80">
          We apply defence-in-depth measures across our stack and require equivalent commitments
          from sub-processors: encryption in transit, network/data segregation, role-based access
          with least privilege, audit logging and monitoring, secure key management, and prompt
          incident response. Providers’ independent certifications (e.g., ISO 27001, SOC 2) are
          available on their compliance pages.
        </p>

        <h2 className="text-xl font-semibold tracking-tight text-white">Contact</h2>
        <p className="text-white/80">
          Questions about this page or data transfers? Email{' '}
          <a
            className="underline"
            href="mailto:hello@h1nted.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            hello@h1nted.com
          </a>
          . EEA data subjects may also contact our <strong>EU Representative</strong> as listed in
          our{' '}
          <a className="underline" href="/privacy">
            Privacy Policy
          </a>
          .
        </p>

        {/* Низ карточки */}
        <div className="pt-4 mt-2 border-t border-white/10" />
      </section>
    </main>
  );
}
