"use client";
import { useState } from "react";
import { X } from "lucide-react";
import type { UserProfile } from "@/lib/types";
import { GOALS } from "@/lib/goals";

interface Props {
  profile: UserProfile;
  onClose: () => void;
  onSave: (p: UserProfile) => void;
}

export function EditProfile({ profile, onClose, onSave }: Props) {
  const [age, setAge] = useState<number | "">(profile.age ?? "");
  const [weight, setWeight] = useState<number | "">(profile.weightKg ?? "");
  const [height, setHeight] = useState<number | "">(profile.heightCm ?? "");
  const [goals, setGoals] = useState<string[]>(profile.goals ?? []);

  const toggleGoal = (g: string) =>
    setGoals((prev) => (prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]));

  const handleSave = () => {
    onSave({
      ...profile,
      age: age === "" ? undefined : Number(age),
      weightKg: weight === "" ? undefined : Number(weight),
      heightCm: height === "" ? undefined : Number(height),
      goals,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40">
      <div className="bg-white w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#e8eaed]">
          <h2 className="text-[#202124]">Edit profile</h2>
          <button onClick={onClose} className="p-1 -m-1">
            <X className="w-5 h-5 text-[#5f6368]" />
          </button>
        </div>

        <div className="overflow-y-auto px-4 py-4 space-y-4">
          <Field label="Age">
            <input
              type="number"
              inputMode="numeric"
              value={age}
              onChange={(e) => setAge(e.target.value === "" ? "" : Number(e.target.value))}
              className="w-full bg-[#f8f9fa] rounded-xl px-3 py-2 text-[#202124] outline-none"
            />
          </Field>
          <Field label="Weight (kg)">
            <input
              type="number"
              inputMode="decimal"
              value={weight}
              onChange={(e) => setWeight(e.target.value === "" ? "" : Number(e.target.value))}
              className="w-full bg-[#f8f9fa] rounded-xl px-3 py-2 text-[#202124] outline-none"
            />
          </Field>
          <Field label="Height (cm)">
            <input
              type="number"
              inputMode="decimal"
              value={height}
              onChange={(e) => setHeight(e.target.value === "" ? "" : Number(e.target.value))}
              className="w-full bg-[#f8f9fa] rounded-xl px-3 py-2 text-[#202124] outline-none"
            />
          </Field>

          <div>
            <div className="text-sm text-[#5f6368] mb-2">Goals</div>
            <div className="flex flex-wrap gap-2">
              {GOALS.map((g) => {
                const active = goals.includes(g);
                return (
                  <button
                    key={g}
                    onClick={() => toggleGoal(g)}
                    className={`px-3 py-1.5 rounded-full text-sm border ${
                      active
                        ? "bg-[#4285F4] text-white border-[#4285F4]"
                        : "bg-white text-[#202124] border-[#dadce0]"
                    }`}
                  >
                    {g}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="px-4 py-3 border-t border-[#e8eaed] flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-full border border-[#dadce0] text-[#202124]"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 py-3 rounded-full bg-[#4285F4] text-white"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="text-sm text-[#5f6368] mb-1">{label}</div>
      {children}
    </label>
  );
}
