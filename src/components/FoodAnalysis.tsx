"use client";
/**
 * FoodAnalysis – UI card for the local MobileNet V2 food classifier
 *
 * Shows:
 *   • Loading model skeleton (first-run download indicator)
 *   • Animated "Analysing…" skeleton while inference runs
 *   • Detected food with confidence badge
 *   • Top-3 candidates as confidence bars
 *   • Raw ImageNet predictions (expandable)
 *   • "Apply [Food]" button + disclaimer
 */

import { useState } from "react";
import {
  Brain, ChevronDown, ChevronUp, AlertCircle, CheckCircle2,
  Cpu, Zap, Utensils, Download,
} from "lucide-react";
import type { FoodClassificationResult } from "@/lib/food-classifier";
import type { FoodItem } from "@/lib/foods";

interface Props {
  result: FoodClassificationResult | null;
  status: "idle" | "loading-model" | "analyzing" | "done" | "error";
  error?: string;
  onApply: (food: FoodItem) => void;
}

// Cuisine → colour accent
const CUISINE_COLORS: Record<string, string> = {
  Singaporean: "#E8711A",
  Chinese:     "#C62828",
  Malay:       "#2E7D32",
  Indian:      "#F57C00",
  Thai:        "#6A1B9A",
  Vietnamese:  "#AD1457",
  Japanese:    "#1565C0",
  Korean:      "#283593",
  Italian:     "#558B2F",
  Western:     "#00695C",
  Drink:       "#0277BD",
  Snack:       "#6D4C41",
};

function accentFor(cuisine: string): string {
  return CUISINE_COLORS[cuisine] ?? "#5f6368";
}

// ─────────────────────────────────────────────────────────────────────────────
// Skeleton states
// ─────────────────────────────────────────────────────────────────────────────

function LoadingModelState() {
  return (
    <div className="bg-[#fff8e1] border border-[#ffe082] rounded-2xl p-4">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-[#F57C00] flex items-center justify-center animate-pulse">
          <Download className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-[#202124]">Loading AI model…</div>
          <div className="text-xs text-[#5f6368]">MobileNet V2 — downloading once, ~14 MB, then cached</div>
        </div>
        <div className="w-5 h-5 border-2 border-[#F57C00] border-t-transparent rounded-full animate-spin shrink-0" />
      </div>
      {/* progress bar shimmer */}
      <div className="mt-3 h-1.5 bg-[#ffe082] rounded-full overflow-hidden">
        <div className="h-full bg-[#F57C00] rounded-full animate-pulse" style={{ width: "60%" }} />
      </div>
    </div>
  );
}

function AnalysingState() {
  return (
    <div className="bg-[#fff3e0] border border-[#ffcc80] rounded-2xl p-4">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-8 h-8 rounded-full bg-[#F57C00] flex items-center justify-center animate-pulse">
          <Brain className="w-4 h-4 text-white" />
        </div>
        <div>
          <div className="text-sm font-medium text-[#202124]">Identifying food…</div>
          <div className="text-xs text-[#5f6368]">Running MobileNet V2 on-device — no data sent anywhere</div>
        </div>
        <div className="ml-auto w-5 h-5 border-2 border-[#F57C00] border-t-transparent rounded-full animate-spin shrink-0" />
      </div>
      <div className="space-y-2">
        {[75, 50, 30].map((w, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="w-16 h-3 rounded bg-[#ffe0b2] animate-pulse" />
            <div className="h-3 rounded-full bg-[#ffcc80] animate-pulse" style={{ width: `${w}%` }} />
            <div className="w-8 h-3 rounded bg-[#ffe0b2] animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Confidence bar row
// ─────────────────────────────────────────────────────────────────────────────
function CandidateBar({
  food, confidence, matchedClass, accent, rank,
}: {
  food: FoodItem; confidence: number; matchedClass: string; accent: string; rank: number;
}) {
  const pct = Math.round(confidence * 100);
  return (
    <div className="flex items-center gap-2">
      <div
        className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0"
        style={{ backgroundColor: accent }}
      >
        {rank}
      </div>
      <div className="flex-1 relative h-6 bg-[#f1f3f4] rounded-full overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, backgroundColor: accent + (rank === 1 ? "ff" : "88") }}
        />
        <div className="absolute inset-0 flex items-center px-2 gap-1">
          <span className="text-[10px] text-[#3c4043] font-medium truncate">{food.name}</span>
          <span className="text-[9px] text-[#5f6368] shrink-0">· {food.cuisine}</span>
        </div>
      </div>
      <span className="text-xs text-[#5f6368] w-8 text-right font-mono shrink-0">{pct}%</span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────────────────────
export function FoodAnalysis({ result, status, error, onApply }: Props) {
  const [showDetails, setShowDetails] = useState(false);
  const [applied, setApplied] = useState(false);

  if (status === "loading-model") return <LoadingModelState />;
  if (status === "analyzing")    return <AnalysingState />;

  if (error) {
    return (
      <div className="bg-[#fce8e6] border border-[#f5c6c2] rounded-2xl p-3 flex items-start gap-2 text-sm text-[#a50e0e]">
        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
        <div>
          <div className="font-medium">Food detection unavailable</div>
          <div className="text-xs mt-0.5 text-[#c62828]">{error}</div>
        </div>
      </div>
    );
  }

  if (!result) return null;

  const { topCandidate, confidence, candidates, imagenetPredictions, method, processingMs } = result;
  const accent = accentFor(topCandidate.cuisine);
  const confPct = Math.round(confidence * 100);

  const handleApply = () => {
    onApply(topCandidate);
    setApplied(true);
    setTimeout(() => setApplied(false), 2500);
  };

  return (
    <div className="border rounded-2xl overflow-hidden" style={{ borderColor: accent + "55" }}>
      {/* ── Header ── */}
      <div className="p-3 flex items-center gap-3" style={{ backgroundColor: accent + "18" }}>
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-white shrink-0"
          style={{ backgroundColor: accent }}
        >
          <Utensils className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-[#202124] truncate">{topCandidate.name}</span>
            <span
              className="text-[10px] px-1.5 py-0.5 rounded-full text-white font-bold shrink-0"
              style={{ backgroundColor: confPct >= 55 ? "#34A853" : confPct >= 30 ? "#FBBC05" : "#EA4335" }}
            >
              {confPct}%
            </span>
          </div>
          <div className="text-xs text-[#5f6368]">
            {topCandidate.cuisine} · ~{topCandidate.kcalMin}–{topCandidate.kcalMax} kcal
          </div>
        </div>
        <div className="flex items-center gap-1 text-[10px] text-[#9aa0a6] shrink-0">
          <Cpu className="w-3 h-3" />
          <span>{processingMs}ms</span>
        </div>
      </div>

      <div className="p-3 space-y-3 bg-white">
        {/* ── Candidates ── */}
        <div className="space-y-2">
          <div className="text-xs font-medium text-[#5f6368] uppercase tracking-wide">Top matches</div>
          {candidates.map((c, idx) => (
            <CandidateBar
              key={c.food.name}
              food={c.food}
              confidence={c.confidence}
              matchedClass={c.matchedClass}
              accent={accentFor(c.food.cuisine)}
              rank={idx + 1}
            />
          ))}
        </div>

        {/* ── Method badge ── */}
        <div className="bg-[#f8f9fa] rounded-xl px-3 py-2">
          <div className="flex items-center gap-1.5">
            <Brain className="w-3.5 h-3.5 text-[#5f6368]" />
            <span className="text-xs font-medium text-[#5f6368]">
              {method === "mobilenet"
                ? "MobileNet V2 · ImageNet-1K classification"
                : "Colour-feature heuristic (offline fallback)"}
            </span>
          </div>
          {candidates[0]?.matchedClass && candidates[0].matchedClass !== "colour analysis" && (
            <p className="text-[10px] text-[#9aa0a6] mt-0.5 truncate">
              Matched: "{candidates[0].matchedClass}"
            </p>
          )}
        </div>

        {/* ── Expandable: raw ImageNet predictions ── */}
        {imagenetPredictions.length > 0 && (
          <>
            <button
              onClick={() => setShowDetails((s) => !s)}
              className="w-full flex items-center justify-between text-xs text-[#5f6368] hover:text-[#202124]"
            >
              <span>Raw ImageNet predictions</span>
              {showDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {showDetails && (
              <div className="space-y-1.5 pt-1 border-t border-[#f1f3f4]">
                {imagenetPredictions.map((p) => (
                  <div key={p.className} className="flex items-center gap-2">
                    <div
                      className="h-2 rounded-full bg-[#4285F4]"
                      style={{ width: `${Math.round(p.probability * 100)}%`, minWidth: 4 }}
                    />
                    <span className="text-[10px] text-[#5f6368] truncate flex-1">{p.className}</span>
                    <span className="text-[10px] font-mono text-[#9aa0a6] shrink-0">
                      {(p.probability * 100).toFixed(1)}%
                    </span>
                  </div>
                ))}
                <div className="bg-[#e8f0fe] rounded-xl p-2.5 text-[10px] text-[#1967d2] leading-relaxed mt-1">
                  <div className="flex items-start gap-1.5">
                    <Zap className="w-3 h-3 shrink-0 mt-0.5" />
                    <span>
                      MobileNet V2 (Sandler et al., CVPR 2018) pre-trained on ImageNet-1K.
                      Mapped to Circle of Life food database via keyword scoring.
                      Model weights downloaded once from TF Hub and cached — your photos
                      never leave the device.
                    </span>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* ── Apply button + disclaimer ── */}
        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={handleApply}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all ${
              applied
                ? "bg-[#34A853] text-white"
                : "text-white hover:opacity-90"
            }`}
            style={{ backgroundColor: applied ? "#34A853" : accent }}
          >
            {applied ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                Applied!
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                Apply "{topCandidate.name}"
              </>
            )}
          </button>
          <p className="text-[10px] text-[#9aa0a6] leading-relaxed">
            AI suggestion — verify manually.
          </p>
        </div>
      </div>
    </div>
  );
}
