export default function PrivacyPage() {
  return (
    <main className="max-w-4xl mx-auto py-20 px-6 text-white">
      <h1 className="text-4xl font-bold mb-10">Privacy Policy</h1>
      <div className="border border-gray-400 rounded-2xl p-6 text-black bg-transparent space-y-6 whitespace-pre-wrap bg-white text-black">
        <p>Effective Date: [Insert Date]</p>

        <p>
          This Privacy Policy describes how H1NTED ("we", "our", "us") collects, uses, discloses,
          and protects personal data when you use our platform, accessible via our website and
          associated services.
        </p>

        <h2 className="text-xl font-semibold">1. Data Controller</h2>
        <p>
          H1NTED is the data controller. While our company is not yet formally incorporated, it will
          be established in Ireland. For any questions, you may contact us at: [Insert Contact
          Email].
        </p>

        <h2 className="text-xl font-semibold">2. Scope of Policy</h2>
        <p>
          This policy applies to our website and associated services that perform persona analysis
          using AI models. We do not perform profiling under the definition set by GDPR.
        </p>

        <h2 className="text-xl font-semibold">3. Types of Data We Collect</h2>
        <p>
          • Uploaded images, text, or publicly available LinkedIn profiles submitted by the user; •
          Automatically captured technical metadata (IP address, browser type, device ID) for
          security and performance only; • Account details (email address, subscription tier).
        </p>
        <p>
          We do not process biometric identifiers. All uploaded content is automatically deleted
          from our servers after 12 hours. Users can also delete any content manually at any time.
        </p>

        <h2 className="text-xl font-semibold">4. Purpose and Legal Basis of Processing</h2>
        <p>
          We process your data to: • Provide AI-based persona analysis and decision-support
          recommendations; • Deliver insights to help users communicate more effectively; • Improve
          platform functionality and security.
        </p>
        <p>
          Legal basis: • Consent: for voluntarily uploading images or text; • Contractual necessity:
          for processing related to subscription services; • Legitimate interest: to maintain
          security, detect fraud, and optimize our services. We assess our legitimate interest
          against your rights and freedoms, ensuring proportionality and necessity.
        </p>
        <p>
          The analysis provided is informational and does not constitute truth or final judgment.
          The system does not make decisions — only suggestions.
        </p>

        <h2 className="text-xl font-semibold">5. AI Processing and Transparency</h2>
        <p>
          We use our proprietary AI model, Grok2Vision, to generate persona insights. • Analysis is
          based on visual characteristics of objects, accessories, or text — not gestures, voice, or
          biometric traits; • The analysis may refer to estimated accuracy (e.g., 80%) solely for
          illustrative purposes — this is not a factual guarantee; • Users are clearly informed that
          they are interacting with an AI-powered system; • No biometric data is captured, inferred,
          or processed.
        </p>
        <p>
          Users acknowledge and consent to AI-based analysis and retain the right to opt-out or
          request human review.
        </p>
        <p>
          While we do not conduct formal AI ethics training at this stage, our team is committed to
          ethical and transparent use of AI systems in accordance with AI Act principles.
        </p>

        <h2 className="text-xl font-semibold">6. Data Storage and Retention</h2>
        <p>
          • Uploaded content and analysis results are automatically deleted after 12 hours; • Users
          can delete content sooner via their dashboard; • Data is stored on secure EU-based servers
          (AWS Europe region); • No long-term storage or retention occurs.
        </p>
        <p>
          We maintain internal documentation of our processing operations as required under Article
          30 of the GDPR.
        </p>

        <h2 className="text-xl font-semibold">7. Data Sharing and Subprocessors</h2>
        <p>
          We do not sell or share your personal data for marketing purposes. We use the following
          subprocessors: • AWS (website and hosting); • Supabase (database); • Stripe (payments).
        </p>
        <p>A full list of subprocessors is available upon request.</p>

        <h2 className="text-xl font-semibold">8. International Data Transfers</h2>
        <p>
          All data is processed within the European Economic Area (EEA). If data is ever transferred
          outside the EEA, we ensure protection using Standard Contractual Clauses or other approved
          safeguards.
        </p>

        <h2 className="text-xl font-semibold">9. User Rights under GDPR</h2>
        <p>
          You have the right to: • Access your data; • Correct inaccuracies; • Delete your data
          (including analysis results); • Restrict or object to processing; • Request portability; •
          Withdraw consent; • File a complaint with the Irish Data Protection Commission
          (www.dataprotection.ie).
        </p>

        <h2 className="text-xl font-semibold">10. Cookies and Tracking</h2>
        <p>
          Our platform uses cookies. Only essential cookies are enabled by default. Non-essential
          cookies (e.g., analytics) require your consent.
        </p>

        <h2 className="text-xl font-semibold">11. Security Measures</h2>
        <p>
          We use encryption, access controls, and data minimization to protect your data. Our
          systems follow the principles of privacy-by-design and privacy-by-default. Any security
          incident will be assessed and reported (if required) within 72 hours.
        </p>

        <h2 className="text-xl font-semibold">12. Responsibility and Content Disclaimer</h2>
        <p>
          Users are fully responsible for the content they upload. All uploads must be lawful, and
          the user confirms they have the right to share this content. Users also agree not to use
          analysis results to harm others, manipulate decisions, or as a basis for sensitive legal,
          HR, or medical actions. We strictly prohibit the use of our service for discrimination,
          unlawful surveillance, or manipulative profiling. We expressly disclaim all responsibility
          for the accuracy or truthfulness of the AI outputs. Any reported accuracy (e.g., "~80%")
          is a generic system indicator, not a representation of fact or guarantee.
        </p>

        <h2 className="text-xl font-semibold">13. Age Limit</h2>
        <p>
          Our service is intended for users aged 16 or older, in compliance with GDPR. We do not
          knowingly collect or process data of children under 16.
        </p>

        <h2 className="text-xl font-semibold">14. Changes to This Policy</h2>
        <p>
          We may update this Privacy Policy periodically. Users will be notified via email or in-app
          banners. Last updated date will be indicated at the top.
        </p>

        <h2 className="text-xl font-semibold">Contact</h2>
        <p>For privacy-related inquiries, contact our team at: [Insert Email]</p>
      </div>
    </main>
  );
}
