'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const testimonials = [
  { name: 'Anna Petrova', role: 'HR Director at NovaTech', text: 'Using I,Profiler, we automated candidate assessment and reduced hiring time by 70%.' },
  { name: 'David Lee', role: 'Founder at InsightWorks', text: 'The platform helps identify team weaknesses before they become issues. It’s transformed our approach to growth.' },
  { name: 'Julia Mendes', role: 'Product Manager at Finflow', text: 'For the first time, we saw how users truly think, not how we imagined. A powerful insight.' },
  { name: 'Carlos Ruiz', role: 'CEO at HirePro', text: 'We used to lose up to 30% of our time interviewing unsuitable candidates. Not anymore. AI profile analysis changes everything.' },
  { name: 'Elena Moretti', role: 'COO at DataPulse', text: 'We use I,Profiler for staff reviews — it shows who’s overwhelmed and who’s underperforming. The data speaks for itself.' },
  { name: 'Tom Becker', role: 'Growth Lead at RetailMind', text: 'We applied the product to our sales team. It revealed why we were stagnating. We found patterns in employee data.' },
  { name: 'Amina Yusuf', role: 'Talent Partner at BlueOrbit', text: 'Revolutionary. We started looking beyond CVs to behaviour. It’s a new era of recruitment.' },
  { name: 'Ivan Kovalenko', role: 'CTO at NeuralSys', text: 'We integrated I,Profiler’s API for automated skill assessment. It saved months of manual analysis.' },
  { name: 'Sophie Zhang', role: 'UX Research Lead at FlowIQ', text: 'Spotting anomalies in user behaviour has become effortless. We’ve finally seen the true structure of user decisions.' },
  { name: 'Marta Šimunić', role: 'People Ops at GrowSphere', text: 'We now have a clear view of soft skills. Team communication has become simpler.' },
  { name: 'Alex Yamamoto', role: 'Strategy Director at PivotSync', text: 'I,Profiler gave us a clear picture of employee motivation. It reshaped our organisational structure.' },
  { name: 'Lina Schmidt', role: 'Behavioural Analyst at MindBridge', text: 'A great tool for hypothesising about behavioural patterns. Fewer subjective assessments now.' },
  { name: 'Nikolai Ivanov', role: 'Team Lead at CodeWave', text: 'We saw why some developers thrive on tasks while others burn out. A useful framework.' },
  { name: 'Priya Desai', role: 'Org Coach at TrueFlow', text: 'Working with I,Profiler is like having a thermal camera for the team. We see where the energy is and where the gaps are.' },
  { name: 'Mateo García', role: 'Recruitment Lead at BrightForge', text: 'We identified patterns in candidates that later proved accurate on the job. The tool truly reads behaviour.' },
  { name: 'Camille Dubois', role: 'Data Lead at MetricSync', text: 'AI-driven personality interpretation is the new standard. It’s like a new language for company interactions.' },
  { name: 'Tariq Al-Fulan', role: 'HR Innovation at ZenithAI', text: 'Usually, such assessments are subjective. But here — data, behaviour, algorithms. A revolution.' },
  { name: 'Greta Lindholm', role: 'Culture Architect at TeamRise', text: 'We can now work on culture through specific signals. It’s invaluable for transformations.' },
];

export default function Testimonials() {
  const [page, setPage] = useState(0);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const testimonialsPerPage = 6;
  const totalPages = Math.ceil(testimonials.length / testimonialsPerPage);

  const start = page * testimonialsPerPage;
  const end = start + testimonialsPerPage;

  const current = testimonials.slice(start, end);

  const prev = () => setPage((p) => (p - 1 + totalPages) % totalPages);
  const next = () => setPage((p) => (p + 1) % totalPages);

  return (
    <section className="py-24 bg-[#1A1E23] text-[#E5E5E5] relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-6 text-center relative z-10">
        <h2 className="text-4xl font-montserrat font-weight-600 text-[#F5F5F5] mb-4">
          What People Are Saying
        </h2>

        <div className="relative mt-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {current.map((t, idx) => {
              const globalIndex = start + idx;
              const isActive = globalIndex === activeIndex;

              return (
                <div
                  key={globalIndex}
                  onClick={() => setActiveIndex(globalIndex)}
                  className={`cursor-pointer bg-[#F6F5ED] border border-[#D1D4D6] rounded-xl p-6 shadow-[0_6px_12px_rgba(0,0,0,0.15)] transition-all text-left
                    ${isActive ? 'border-[#C084FC] shadow-[#C084FC]/50' : ''}`}
                >
                  <p className="text-[#374151] font-inter font-weight-400 mb-4 italic">“{t.text}”</p>
                  <div className="font-montserrat font-weight-600 text-[#111827]">
                    {t.name}
                  </div>
                  <div className="text-sm text-[#6B7280] font-inter font-weight-400">{t.role}</div>
                </div>
              );
            })}
          </div>

          <button
            onClick={prev}
            className="absolute left-[-64px] top-1/2 -translate-y-1/2 text-[#E5E5E5] hover:scale-110 transition-all"
            aria-label="Previous"
          >
            <ChevronLeft size={60} strokeWidth={1.5} />
          </button>
          <button
            onClick={next}
            className="absolute right-[-64px] top-1/2 -translate-y-1/2 text-[#E5E5E5] hover:scale-110 transition-all"
            aria-label="Next"
          >
            <ChevronRight size={60} strokeWidth={1.5} />
          </button>
        </div>
      </div>
    </section>
  );
}