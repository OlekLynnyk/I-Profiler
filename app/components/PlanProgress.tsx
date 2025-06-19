// components/PlanProgress.tsx
import React from "react";

interface PlanProgressProps {
  planName: string;
  used: number;
  total: number;
}

export const PlanProgress: React.FC<PlanProgressProps> = ({
  planName,
  used,
  total,
}) => {
  const percentage = total > 0 ? (used / total) * 100 : 0;
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - percentage / 100);

  let color = "#16a34a"; // green-600
  if (percentage >= 90) color = "#dc2626"; // red-600
  else if (percentage >= 60) color = "#f59e0b"; // yellow-500

  return (
    <div className="flex items-center gap-4">
      <div className="w-1/3 text-left">
        <div className="text-sm text-muted-foreground">Plan</div>
        <div className="text-base font-semibold">{planName}</div>
      </div>
      <div className="w-2/3 relative flex items-center justify-center">
        <svg width="100" height="100" className="-rotate-90">
          <circle
            cx="50"
            cy="50"
            r={radius}
            stroke="#e5e7eb"
            strokeWidth="10"
            fill="none"
          />
          <circle
            cx="50"
            cy="50"
            r={radius}
            stroke={color}
            strokeWidth="10"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 0.5s ease" }}
          />
        </svg>
        <div className="absolute text-center">
          <div className="text-sm font-medium">
            {Math.floor(percentage)}%
          </div>
          <div className="text-xs text-muted-foreground">
            {used}/{total}
          </div>
        </div>
      </div>
    </div>
  );
};
