"use client";
import { useState } from "react";
import { Info, Eye, EyeOff, AlertTriangle } from "lucide-react";
import { BRISTOL, BRISTOL_TYPES } from "@/lib/bristol";
import type { BristolType } from "@/lib/types";
import { BristolVisual } from "./BristolVisuals";

interface Props {
  value: BristolType | null;
  onChange: (b: BristolType) => void;
}

export function BristolPicker({ value, onChange }: Props) {
  const [showLearn, setShowLearn] = useState(false);
  const [showVisuals, setShowVisuals] = useState(false);
  const [showWarning, setShowWarning] = useState(false);

  const handleToggleVisuals = () => {
    if (!showVisuals) {
      // Show warning modal first
      setShowWarning(true);
    } else {
      // Hide visuals immediately
      setShowVisuals(false);
    }
  };

  const handleConfirmShow = () => {
    setShowWarning(false);
    setShowVisuals(true);
  };

  const handleCancelShow = () => {
    setShowWarning(false);
  };

  return (
    <>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label>Bristol Stool Scale</label>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleToggleVisuals}
              className="flex items-center gap-1 text-[#c45000] text-sm hover:text-[#a03d00]"
            >
              {showVisuals ? (
                <>
                  <EyeOff className="w-4 h-4" />
                  Hide examples
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4" />
                  Show examples
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => setShowLearn((s) => !s)}
              className="flex items-center gap-1 text-[#4285F4] text-sm"
            >
              <Info className="w-4 h-4" />
              Learn more
            </button>
          </div>
        </div>

        {showLearn && (
          <div className="bg-[#f8f9fa] rounded-xl p-3 text-sm text-[#3c4043] leading-relaxed">
            The Bristol Stool Scale (NHS / Rome Foundation) classifies stool form into 7 types.
            Types 3–5 are typically considered optimal; 1–2 indicate constipation, 6–7 indicate looseness.
            This is a pattern-tracking tool, not a diagnosis.
          </div>
        )}

      <div className="grid grid-cols-1 gap-2">
        {BRISTOL_TYPES.map((t) => {
          const info = BRISTOL[t];
          const selected = value === t;
          return (
            <button
              key={t}
              type="button"
              onClick={() => onChange(t)}
              className={`flex flex-col gap-2 p-3 rounded-2xl border transition-all text-left ${
                selected
                  ? "border-[#4285F4] bg-[#e8f0fe] shadow-sm"
                  : "border-[#dadce0] bg-white hover:bg-[#f8f9fa]"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white shrink-0"
                  style={{ backgroundColor: info.color }}
                >
                  {t}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[#202124]">{info.label}</div>
                  <div className="text-sm text-[#5f6368] truncate">{info.description}</div>
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    info.category === "optimal"
                      ? "bg-[#e6f4ea] text-[#137333]"
                      : info.category === "loose"
                        ? "bg-[#fef7e0] text-[#b06000]"
                        : "bg-[#fce8e6] text-[#a50e0e]"
                  }`}
                >
                  {info.category}
                </span>
              </div>

              {showVisuals && (
                <div className="mt-1 bg-white/50 rounded-xl p-3 border border-[#dadce0]">
                  <BristolVisual type={t} className="w-full h-auto" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>

    {/* Warning Modal */}
    {showWarning && (
      <div
        className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
        onClick={handleCancelShow}
      >
        <div
          className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-[#fef7e0] flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-[#F9AB00]" />
            </div>
            <h3 className="text-lg text-[#202124] font-medium">Content Notice</h3>
          </div>

          <p className="text-sm text-[#5f6368] leading-relaxed mb-6">
            You're about to view medical reference images showing stool appearance examples from the Bristol Stool Scale. These are scientific illustrations for health tracking purposes.
          </p>

          <div className="flex gap-3">
            <button
              onClick={handleCancelShow}
              className="flex-1 py-2.5 px-4 rounded-full border border-[#dadce0] text-[#5f6368] hover:bg-[#f8f9fa]"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmShow}
              className="flex-1 py-2.5 px-4 rounded-full bg-[#4285F4] text-white hover:bg-[#1967d2]"
            >
              Show examples
            </button>
          </div>
        </div>
      </div>
    )}
  </>
  );
}