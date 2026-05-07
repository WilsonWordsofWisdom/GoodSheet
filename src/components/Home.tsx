"use client";
import { Timeline } from "./Timeline";
import { StreakCard } from "./StreakCard";
import type { AnyLog } from "@/lib/types";
import {
  gutScore,
  fiberToday,
  recentExerciseCount,
  goodShitStreak,
} from "@/lib/correlation";
import { Bell, Info, X, PlusCircle } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";

interface Props {
  logs: AnyLog[];
  reminders: string[];
  onDeleteLog: (id: string) => void;
  onLogEntry: () => void;
}

export function Home({ logs, reminders, onDeleteLog, onLogEntry }: Props) {
  const [showInfo, setShowInfo] = useState(false);
  const score = gutScore(logs);
  const fiber = fiberToday(logs);
  const exercise = recentExerciseCount(logs);
  const streak = goodShitStreak(logs);

  const today = logs.filter((l) => {
    const d = new Date(l.timestamp);
    const n = new Date();
    return d.toDateString() === n.toDateString();
  });

  // Latest notification (first item only)
  const latestReminder = reminders[0] ?? null;

  return (
    <div className="space-y-6">
      {/* ── Latest notification banner ── */}
      {latestReminder && (
        <div className="flex items-start gap-3 bg-[#fef7e0] border border-[#f9c845]/40 rounded-2xl px-4 py-3">
          <Bell className="w-4 h-4 text-[#FBBC05] mt-0.5 shrink-0" />
          <p className="text-sm text-[#b06000] font-medium leading-snug">{latestReminder}</p>
        </div>
      )}

      {/* ── Log entry button ── */}
      <button
        onClick={onLogEntry}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-[#4285F4] text-white font-medium shadow-sm hover:bg-[#1967d2] active:scale-[0.98] transition-all"
      >
        <PlusCircle className="w-5 h-5" />
        Log entry
      </button>

      {/* ── Gut Score card ── */}
      <div className="bg-white rounded-3xl border border-[#e8eaed] p-6 flex flex-col items-center relative overflow-hidden">
        <button
          onClick={() => setShowInfo(true)}
          className="absolute top-4 right-4 p-2 text-[#bdc1c6] hover:text-[#4285F4] transition-colors rounded-full hover:bg-blue-50"
          aria-label="How is this calculated?"
        >
          <Info className="w-5 h-5" />
        </button>
        <GutScoreRing score={score} />
        <p className="text-sm text-[#5f6368] mt-3 text-center max-w-xs">
          {score === 0
            ? "Log a few stools this week to see your score."
            : score >= 70
              ? "You're trending in the optimal range."
              : score >= 40
                ? "Some variability — keep logging to spot patterns."
                : "Mostly outside the optimal range this week."}
        </p>
      </div>

      <AnimatePresence>
        {showInfo && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-6 relative"
            >
              <button
                onClick={() => setShowInfo(false)}
                className="absolute top-4 right-4 p-2 text-[#5f6368] hover:bg-[#f1f3f4] rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="text-lg font-semibold text-[#202124] mb-4 pr-8">
                How is your Gut Score calculated?
              </h3>

              <div className="space-y-4 text-sm text-[#3c4043] leading-relaxed">
                <p>
                  Your Gut Score (0–100) reflects the consistency and
                  regularity of your digestion over the last 7 days.
                </p>

                <div className="bg-[#f8f9fa] rounded-2xl p-4 font-mono text-xs border border-[#e8eaed]">
                  <p className="text-[#4285F4] font-bold mb-1">THE FORMULA:</p>
                  <p className="whitespace-pre-wrap">
                    Score = (# Optimal Stool Logs / # Total Logs) × 100 × Frequency Bonus{"\n"}
                    {"\n"}
                    Where, user gets a 1.3x Frequency Bonus for getting 7 optimal stool log for the week.{"\n"}
                    {"\n"}
                    (Score is capped at 100)
                  </p>
                </div>

                <ul className="space-y-3">
                  <li className="flex gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#34A853] mt-1.5 shrink-0" />
                    <span>
                      <strong className="text-[#202124]">Optimal Logs:</strong>{" "}
                      A stool log counts as optimal only when{" "}
                      <strong>all three</strong> are true: Bristol Scale Type
                      3, 4, or 5 (sausage-like or soft blobs);{" "}
                      <strong>urgency is not High</strong>; and{" "}
                      <strong>ease of passage is not Strained</strong>.
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#4285F4] mt-1.5 shrink-0" />
                    <span>
                      <strong className="text-[#202124]">Frequency Bonus:</strong>{" "}
                      Rewards consistent regularity. We count up to 7 optimal
                      logs in the week and multiply the score by{" "}
                      <strong>1.3 (130%)</strong> when you reach 7. Fewer
                      optimal logs scale the bonus down proportionally (e.g.
                      4 optimal logs → 4 ÷ 7 × 1.3 ≈ 0.74×).
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#FBBC05] mt-1.5 shrink-0" />
                    <span>
                      <strong className="text-[#202124]">Timespan:</strong>{" "}
                      We only look at your last 7 days of activity to keep
                      the score relevant.
                    </span>
                  </li>
                </ul>
              </div>

              <button
                onClick={() => setShowInfo(false)}
                className="w-full mt-6 py-3 bg-[#4285F4] text-white rounded-2xl font-medium hover:bg-[#1967d2] transition active:scale-[0.98]"
              >
                Got it
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <StreakCard
        current={streak.current}
        best={streak.best}
        goodToday={streak.goodToday}
        score={score}
      />

      <div className="grid grid-cols-3 gap-3">
        <Stat
          label="Logs today"
          value={today.length}
          accent="#4285F4"
        />
        <Stat
          label="Fiber tags"
          value={fiber}
          accent="#34A853"
        />
        <Stat
          label="Activity 24h"
          value={exercise}
          accent="#FBBC05"
        />
      </div>

      <div>
        <h3 className="text-[#202124] mb-3">Daily Dairy</h3>
        <Timeline
          logs={logs.slice(0, 30)}
          onDelete={onDeleteLog}
        />
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-[#e8eaed] p-3 text-center">
      <div className="text-2xl" style={{ color: accent }}>
        {value}
      </div>
      <div className="text-xs text-[#5f6368] mt-1">{label}</div>
    </div>
  );
}

function GutScoreRing({ score }: { score: number }) {
  const size = 160;
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = circumference - (score / 100) * circumference;

  const color =
    score >= 70 ? "#34A853" : score >= 40 ? "#FBBC05" : score > 0 ? "#EA4335" : "#e8eaed";

  const label =
    score >= 70 ? "Great" : score >= 40 ? "Fair" : score > 0 ? "Low" : "—";

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#f1f3f4"
            strokeWidth={strokeWidth}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={progress}
            style={{ transition: "stroke-dashoffset 0.6s ease" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-bold text-[#202124]">{score}</span>
          <span className="text-xs font-medium mt-0.5" style={{ color }}>
            {label}
          </span>
        </div>
      </div>
      <p className="text-sm font-semibold text-[#202124] mt-2">Gut Score</p>
    </div>
  );
}