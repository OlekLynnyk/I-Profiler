'use client';

import CookieConsent from 'react-cookie-consent';
import Link from 'next/link';

export function CookieBanner() {
  return (
    <CookieConsent
      location="bottom"
      buttonText="Accept"
      cookieName="fractalplus-cookie-consent"
      style={{
        background: "#111",
        color: "#fff",
        fontSize: "14px",
        textAlign: "left",
        padding: "1rem 2rem",
      }}
      buttonStyle={{
        background: "#fff",
        color: "#111",
        borderRadius: "9999px",
        padding: "0.5rem 1.5rem",
        fontWeight: 500,
      }}
    >
      This website uses cookies to enhance the user experience and analyse traffic, in accordance with the General Data Protection Regulation (GDPR).
      Continued use of the platform requires your consent.{" "}
      <Link href="/privacy" className="underline text-purple-400 ml-1">
        Read our Privacy Policy.
      </Link>
    </CookieConsent>
  );
}
