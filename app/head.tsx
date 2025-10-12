export default function Head() {
  return (
    <>
      {/* ускоряем моб.видео в блоке HowItWorksVideoMobile */}
      <link
        rel="preload"
        as="video"
        href="/videos/how-it-works-1080p-h264.mp4"
        type="video/mp4"
        media="(max-width: 1023.98px)"
        crossOrigin="anonymous"
      />

      {/* GA loader — активируется только после согласия (analytics) */}
      <script
        type="text/plain"
        data-consent="analytics"
        data-src={`https://www.googletagmanager.com/gtag/js?id=G-XXXXXXX`}
        data-async
      />
      <script
        type="text/plain"
        data-consent="analytics"
        // inline-инициализация тоже «спит» до согласия
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){ dataLayer.push(arguments); }
            gtag('js', new Date());
            gtag('config', 'G-XXXXXXX', { anonymize_ip: true });
          `,
        }}
      />
    </>
  );
}
