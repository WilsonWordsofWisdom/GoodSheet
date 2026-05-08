"use client";
import { Trophy } from "lucide-react";

interface Props {
  current: number;
  best: number;
  goodToday: boolean;
  score: number;
}

function poopColorFor(score: number) {
  const s = Math.max(0, Math.min(100, score));
  let r: number, g: number, b: number;
  if (s < 50) {
    const t = s / 50;
    r = Math.round(234 + (251 - 234) * t);
    g = Math.round(67 + (188 - 67) * t);
    b = Math.round(53 + (5 - 53) * t);
  } else {
    const t = (s - 50) / 50;
    r = Math.round(251 + (52 - 251) * t);
    g = Math.round(188 + (168 - 188) * t);
    b = Math.round(5 + (83 - 5) * t);
  }
  return `rgb(${r}, ${g}, ${b})`;
}

function PoopIcon({ size = 56, color }: { size?: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-label="streak">
      <path
        fill={color}
        d="M32 6c-3 0-5 2.5-5 5 0 1.4.5 2.5 1.2 3.4-3.4.6-6 3.6-6 7.1 0 1 .2 2 .6 2.9-4 .8-7 4.3-7 8.4 0 1.6.5 3 1.2 4.3-3 1.3-5 4.2-5 7.6 0 4.7 3.8 8.5 8.5 8.5h23c4.7 0 8.5-3.8 8.5-8.5 0-3.4-2-6.3-5-7.6.7-1.3 1.2-2.7 1.2-4.3 0-4.1-3-7.6-7-8.4.4-.9.6-1.9.6-2.9 0-3.5-2.6-6.5-6-7.1.7-.9 1.2-2 1.2-3.4 0-2.5-2-5-5-5z"
      />
      <ellipse cx="26" cy="36" rx="2.2" ry="2.6" fill="#202124" />
      <ellipse cx="38" cy="36" rx="2.2" ry="2.6" fill="#202124" />
      <path
        d="M25 44 Q32 49 39 44"
        stroke="#202124"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

export function StreakCard({ current, best, goodToday, score }: Props) {
  const milestones = [3, 7, 14, 30];
  const nextMilestone = milestones.find((m) => m > current) ?? current + 1;
  const prevMilestone = [...milestones].reverse().find((m) => m <= current) ?? 0;
  const progress =
    current === 0 ? 0 : Math.min(1, (current - prevMilestone) / (nextMilestone - prevMilestone));

  const poopColor = poopColorFor(score);

  return (
    <div className="bg-gradient-to-br from-[#fff8e1] via-white to-[#e8f5e9] rounded-3xl border border-[#e8eaed] p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-xs uppercase tracking-wide text-[#5f6368]">Good Sh!t Streak</div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-4xl text-[#202124]" style={{ fontVariantNumeric: "tabular-nums" }}>
              {current}
            </span>
            <span className="text-sm text-[#5f6368]">{current === 1 ? "day" : "days"}</span>
          </div>
        </div>
        <div className="relative">
          <PoopIcon size={56} color={poopColor} />
          {current >= 7 && (
            <span className="absolute -bottom-1 -right-1 bg-[#EA4335] text-white text-[10px] px-1.5 py-0.5 rounded-full">
              🔥
            </span>
          )}
        </div>
      </div>

      <div className="space-y-1.5">
        <div className="flex justify-between text-xs text-[#5f6368]">
          <span>{prevMilestone === 0 ? "Start" : `${prevMilestone}-day badge`}</span>
          <span>{nextMilestone}-day milestone</span>
        </div>
        <div className="h-2 bg-white rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#FBBC05] to-[#34A853] rounded-full transition-all duration-500"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between mt-4 text-xs">
        <div className="flex items-center gap-1.5 text-[#5f6368]">
          <Trophy className="w-3.5 h-3.5" />
          Best: {best} {best === 1 ? "day" : "days"}
        </div>
        <div className={goodToday ? "text-[#137333]" : "text-[#5f6368]"}>
          {current === 0
            ? "Log a Type 3–5 to start"
            : goodToday
              ? "✓ Today counted"
              : "Log today to keep streak alive"}
        </div>
      </div>
    </div>
  );
}
