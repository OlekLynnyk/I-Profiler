'use client';

export default function HowItWorks() {
  const cards = [
    {
      title: 'Upload Clues',
      texts: [
        'Get insights with AI persona analysis',
        'Identify the hidden command they project',
        'Uncover their core motivational drivers',
        'Receive key resonant words and a tailored message for impactful communication',
        'Simply upload an image, text, or social media post reflecting someone’s style. Give a command → get insights. No faces needed.',
      ],
      image: '/images/person.jpg',
    },
    {
      title: 'Get Deep Insights',
      texts: [
        'See what drives them and how to reach them.',
        'Hidden Command: What they unconsciously project (e.g. “Let me feel free, but stay in control”)',
        'Motivational Drivers: Core values they respond to (e.g. freedom, precision, trust).',
        'Tailored Messaging: Speak their language with crafted messages that match their inner world.',
      ],
    },
    {
      title: 'Unlock Potential',
      texts: [
        'Turn insights into advantage.',
        'For Business: Close deals faster, pitch smarter, lead meetings with words that land.',
        'For You: Understand people deeper, make better choices, avoid costly misreads.',
        'For Teams & Friends: Build trust, reduce friction, and connect in ways that truly matter.',
      ],
    },
  ];

  return (
    <section className="py-16 md:py-24 bg-[#1A1E23]">
      <div className="max-w-6xl mx-auto px-4 md:px-6 text-center">
        <h2 className="text-3xl md:text-4xl text-[#F5F5F5] mb-10">
          How It Works
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {cards.map((card, index) => (
            <div
              key={card.title}
              className={`p-6 md:p-7 rounded-xl bg-[#F6F5ED] border shadow transition-all border-[#D1D4D6]`}
            >
              <h3 className="text-xl md:text-2xl text-[#111827] mb-4">
                {card.title}
              </h3>

              {card.image && (
                <img
                  src={card.image}
                  alt={card.title}
                  className="w-[120px] h-[120px] object-cover rounded-xl mb-4 mx-auto"
                />
              )}

              <ul className="text-left text-xs md:text-sm text-[#374151] space-y-2">
                {card.texts.map((text, idx) => (
                  <li
                    key={idx}
                    className="before:content-['✔'] before:mr-2 before:text-[#C084FC]"
                  >
                    {text}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
