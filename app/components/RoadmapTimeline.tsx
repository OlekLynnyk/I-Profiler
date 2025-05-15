interface RoadmapTimelineProps {
  activeIndex: number;
  totalItems: number;
}

export default function RoadmapTimeline({ activeIndex, totalItems }: RoadmapTimelineProps) {
  return (
    <div className="flex justify-center gap-8 mt-6 font-orbitron text-sm text-white/80">
      {Array.from({ length: totalItems }).map((_, index) => (
        <span
          key={index}
          className={`transition duration-300 ${
            index === activeIndex
              ? 'text-white shadow-[0_0_6px_#a855f7]/70 font-semibold'
              : 'text-gray-500'
          }`}
        >
          Step {index + 1}
        </span>
      ))}
    </div>
  );
}
