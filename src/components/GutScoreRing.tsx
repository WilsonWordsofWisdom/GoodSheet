"use client";
interface Props {
  score: number;
  size?: number;
}

export function GutScoreRing({ score, size = 160 }: Props) {
  const r = size / 2 - 12;
  const c = 2 * Math.PI * r;
  const dash = (score / 100) * c;
  const color = score >= 70 ? "#34A853" : score >= 40 ? "#FBBC05" : score === 0 ? "#dadce0" : "#EA4335";

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} stroke="#f1f3f4" strokeWidth={12} fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={color}
          strokeWidth={12}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${c}`}
          style={{ transition: "stroke-dasharray 0.6s ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-[#202124]" style={{ fontSize: size * 0.28 }}>{score}</div>
        <div className="text-xs text-[#5f6368] uppercase tracking-wide">Gut Score</div>
      </div>
    </div>
  );
}
