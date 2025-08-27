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
    </>
  );
}
