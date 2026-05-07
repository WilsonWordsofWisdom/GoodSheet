"use client";
/**
 * StoolAnalysis – UI component for the local TF.js Bristol classifier
 *
 * Shows:
 *   • Animated "Analysing…" skeleton while TF.js processes
 *   • Predicted Bristol type with confidence badge
 *   • Top-3 candidates as confidence bars
 *   • Visual feature breakdown (brightness, edges, warmth, texture)
 *   • "Apply suggestion" button + disclaimer
 */

import { useState } from "react";
import { Brain, ChevronDown, ChevronUp, AlertCircle, CheckCircle2, Cpu, Zap } from "lucide-react";
import { BRISTOL } from "@/lib/bristol";
import type { ClassificationResult } from "@/lib/stool-classifier";
import type { BristolType } from "@/lib/types";

interface Props {
  result: ClassificationResult | null;
  isAnalyzing: boolean;
  error?: string;
  onApply: (type: BristolType) => void;
}

// Color per Bristol type (reuse from bristol.ts)
const TYPE_COLORS: Record<BristolType, string> = {
  1: "#8B5A2B",
  2: "#A0522D",
  3: "#B97A56",
  4: "#34A853",
  5: "#C9A77A",
  6: "#FBBC05",
  7: "#EA4335",
};

// ─────────────────────────────────────────────────────────────────────────────
// Skeleton loader
// ─────────────────────────────────────────────────────────────────────────────
function AnalysingState() {
  return (
    <div className="bg-[#f0f4ff] border border-[#c7d5f8] rounded-2xl p-4">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-8 h-8 rounded-full bg-[#4285F4] flex items-center justify-center animate-pulse">
          <Brain className="w-4 h-4 text-white" />
        </div>
        <div>
          <div className="text-sm font-medium text-[#202124]">Analysing image…</div>
          <div className="text-xs text-[#5f6368]">Running TF.js on-device — no data sent anywhere</div>
        </div>
        <div className="ml-auto">
          <div className="w-5 h-5 border-2 border-[#4285F4] border-t-transparent rounded-full animate-spin" />
        </div>
      </div>

      {/* Skeleton bars */}
      <div className="space-y-2">
        {[80, 55, 30].map((w, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="w-14 h-3 rounded bg-[#d2e0ff] animate-pulse" />
            <div
              className="h-3 rounded-full bg-[#c7d5f8] animate-pulse"
              style={{ width: `${w}%` }}
            />
            <div className="w-8 h-3 rounded bg-[#d2e0ff] animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Feature meter bar
// ─────────────────────────────────────────────────────────────────────────────
function FeatureMeter({
  label,
  value,
  leftLabel,
  rightLabel,
  color,
}: {
  label: string;
  value: number;
  leftLabel: string;
  rightLabel: string;
  color: string;
}) {
  const pct = Math.round(value * 100);
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-[#5f6368]">{label}</span>
        <span className="text-xs text-[#3c4043] font-mono">{pct}%</span>
      </div>
      <div className="relative h-2 bg-[#e8eaed] rounded-full overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
      <div className="flex justify-between mt-0.5">
        <span className="text-[10px] text-[#9aa0a6]">{leftLabel}</span>
        <span className="text-[10px] text-[#9aa0a6]">{rightLabel}</span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────────────────────
export function StoolAnalysis({ result, isAnalyzing, error, onApply }: Props) {
  const [showDetails, setShowDetails] = useState(false);
  const [applied, setApplied] = useState(false);

  if (isAnalyzing) return <AnalysingState />;

  if (error) {
    return (
      <div className="bg-[#fce8e6] border border-[#f5c6c2] rounded-2xl p-3 flex items-start gap-2 text-sm text-[#a50e0e]">
        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
        <div>
          <div className="font-medium">Analysis unavailable</div>
          <div className="text-xs mt-0.5 text-[#c62828]">{error}</div>
        </div>
      </div>
    );
  }

  if (!result) return null;

  const { predicted, confidence, candidates, features, reasoning, processingMs } = result;
  const info = BRISTOL[predicted];
  const confPct = Math.round(confidence * 100);

  const handleApply = () => {
    onApply(predicted);
    setApplied(true);
    setTimeout(() => setApplied(false), 2000);
  };

  return (
    <div className="border rounded-2xl overflow-hidden" style={{ borderColor: TYPE_COLORS[predicted] + "55" }}>
      {/* ── Header ── */}
      <div
        className="p-3 flex items-center gap-3"
        style={{ backgroundColor: TYPE_COLORS[predicted] + "18" }}
      >
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
          style={{ backgroundColor: TYPE_COLORS[predicted] }}
        >
          {predicted}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-[#202124]">Type {predicted} suggested</span>
            <span
              className="text-[10px] px-1.5 py-0.5 rounded-full text-white font-bold"
              style={{ backgroundColor: confPct >= 55 ? "#34A853" : confPct >= 35 ? "#FBBC05" : "#EA4335" }}
            >
              {confPct}%
            </span>
          </div>
          <div className="text-xs text-[#5f6368] truncate">{info.description}</div>
        </div>
        <div className="flex items-center gap-1 text-[10px] text-[#9aa0a6] shrink-0">
          <Cpu className="w-3 h-3" />
          <span>{processingMs}ms</span>
        </div>
      </div>

      <div className="p-3 space-y-3 bg-white">
        {/* ── Top-3 candidates ── */}
        <div className="space-y-2">
          <div className="text-xs font-medium text-[#5f6368] uppercase tracking-wide">Top candidates</div>
          {candidates.map((c, idx) => {
            const cPct = Math.round(c.confidence * 100);
            const cInfo = BRISTOL[c.type];
            return (
              <div key={c.type} className="flex items-center gap-2">
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0"
                  style={{ backgroundColor: TYPE_COLORS[c.type] }}
                >
                  {c.type}
                </div>
                <div className="flex-1 relative h-5 bg-[#f1f3f4] rounded-full overflow-hidden">
                  <div
                    className="absolute inset-y-0 left-0 rounded-full transition-all duration-700"
                    style={{
                      width: `${cPct}%`,
                      backgroundColor: TYPE_COLORS[c.type] + (idx === 0 ? "ff" : "88"),
                    }}
                  />
                  <div className="absolute inset-0 flex items-center px-2">
                    <span className="text-[10px] text-[#3c4043] font-medium truncate">
                      {cInfo.label}
                    </span>
                  </div>
                </div>
                <span className="text-xs text-[#5f6368] w-8 text-right font-mono">{cPct}%</span>
              </div>
            );
          })}
        </div>

        {/* ── Reasoning ── */}
        <div className="bg-[#f8f9fa] rounded-xl px-3 py-2">
          <div className="flex items-center gap-1.5 mb-1">
            <Brain className="w-3.5 h-3.5 text-[#5f6368]" />
            <span className="text-xs font-medium text-[#5f6368]">Visual analysis</span>
          </div>
          <p className="text-xs text-[#3c4043] leading-relaxed">{reasoning}</p>
        </div>

        {/* ── Expandable feature details ── */}
        <button
          onClick={() => setShowDetails((s) => !s)}
          className="w-full flex items-center justify-between text-xs text-[#5f6368] hover:text-[#202124]"
        >
          <span>Feature breakdown</span>
          {showDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

        {showDetails && (
          <div className="space-y-3 pt-1 border-t border-[#f1f3f4]">
            <FeatureMeter
              label="Brightness"
              value={features.brightness}
              leftLabel="Dark"
              rightLabel="Pale"
              color="#8B5A2B"
            />
            <FeatureMeter
              label="Edge density"
              value={features.edgeDensity}
              leftLabel="Smooth"
              rightLabel="Structured"
              color="#4285F4"
            />
            <FeatureMeter
              label="Color warmth"
              value={features.warmth}
              leftLabel="Cool brown"
              rightLabel="Warm yellow"
              color="#FBBC05"
            />
            <FeatureMeter
              label="Texture variance"
              value={features.textureVariance}
              leftLabel="Uniform"
              rightLabel="High variation"
              color="#34A853"
            />

            {/* Feature space legend */}
            <div className="bg-[#e8f0fe] rounded-xl p-2.5 text-[10px] text-[#1967d2] leading-relaxed">
              <div className="flex items-start gap-1.5">
                <Zap className="w-3 h-3 shrink-0 mt-0.5" />
                <span>
                  Features extracted via TF.js tensor ops (ITU-R BT.601 luminance,
                  finite-difference Sobel gradients, channel warmth ratio).
                  Classified using weighted nearest-prototype (k=1) with softmax
                  confidence. Ref: Lewis &amp; Heaton (1997); Nguyen et al. (2021).
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ── Apply / disclaimer ── */}
        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={handleApply}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all ${
              applied
                ? "bg-[#34A853] text-white"
                : "bg-[#4285F4] text-white hover:bg-[#1967d2]"
            }`}
          >
            {applied ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                Applied!
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                Apply Type {predicted}
              </>
            )}
          </button>
          <p className="text-[10px] text-[#9aa0a6] leading-relaxed">
            AI suggestion only — please verify manually.
          </p>
        </div>
      </div>
    </div>
  );
}
