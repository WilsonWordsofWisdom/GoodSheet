"use client";
import { useState } from "react";
import {
  Shield,
  Database,
  Download,
  ChevronRight,
} from "lucide-react";
import type { UserProfile } from "@/lib/types";
import { AppIcon } from "./AppIcon";
import { GOALS } from "@/lib/goals";

interface Props {
  onComplete: (p: UserProfile) => void;
}

export function Onboarding({ onComplete }: Props) {
  const [step, setStep] = useState(0);
  const [age, setAge] = useState<number | "">("");
  const [weight, setWeight] = useState<number | "">("");
  const [height, setHeight] = useState<number | "">("");
  const [goals, setGoals] = useState<string[]>([]);
  const [storeThumbs, setStoreThumbs] = useState(false);

  const [errors, setErrors] = useState<{ age?: string; weight?: string; height?: string }>({});
  const [showAgeBlock, setShowAgeBlock] = useState(false);

  const next = () => setStep((s) => s + 1);

  const validateBasics = () => {
    const errs: { age?: string; weight?: string; height?: string } = {};
    if (age === "" || !Number.isFinite(Number(age))) {
      errs.age = "Enter your age";
    } else if (!Number.isInteger(Number(age))) {
      errs.age = "Age must be a whole number";
    } else if (Number(age) <= 0) {
      errs.age = "Age must be greater than 0";
    } else if (Number(age) < 18) {
      errs.age = "You must be 18 or older";
    }

    if (weight === "" || !Number.isFinite(Number(weight))) {
      errs.weight = "Enter your weight";
    } else if (Number(weight) <= 0) {
      errs.weight = "Weight must be greater than 0";
    }

    if (height === "" || !Number.isFinite(Number(height))) {
      errs.height = "Enter your height";
    } else if (Number(height) <= 0) {
      errs.height = "Height must be greater than 0";
    }

    setErrors(errs);
    if (errs.age === "You must be 18 or older") setShowAgeBlock(true);
    return Object.keys(errs).length === 0;
  };

  const handleBasicsContinue = () => {
    if (validateBasics()) next();
  };

  const finish = () => {
    onComplete({
      age: age === "" ? undefined : age,
      weightKg: weight === "" ? undefined : weight,
      heightCm: height === "" ? undefined : height,
      goals,
      storeThumbnails: storeThumbs,
      onboardedAt: Date.now(),
    });
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="flex-1 max-w-md mx-auto w-full px-6 pt-12 pb-6 flex flex-col">
        <div className="flex gap-1 mb-8">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full ${i <= step ? "bg-[#4285F4]" : "bg-[#e8eaed]"}`}
            />
          ))}
        </div>

        {step === 0 && (
          <div className="flex-1 flex flex-col">
            <div className="flex items-center gap-2 mb-2">
              <AppIcon size={40} />
              <h1 className="text-[#202124]">Goodsh!t</h1>
            </div>
            <p className="text-[#5f6368] mb-6">
              Close the feedback loop between what you eat and
              how your gut responds.
            </p>

            <div className="space-y-4 mb-6">
              <PrivacyRow
                icon={
                  <Shield className="w-5 h-5 text-[#34A853]" />
                }
                title="Data stays on your device"
                desc="No accounts, no servers, no cloud."
              />
              <PrivacyRow
                icon={
                  <Database className="w-5 h-5 text-[#4285F4]" />
                }
                title="No account needed"
                desc="Open the app and start logging."
              />
              <PrivacyRow
                icon={
                  <Download className="w-5 h-5 text-[#FBBC05]" />
                }
                title="Export or delete anytime"
                desc="Your data, your control."
              />
            </div>

            <button
              onClick={next}
              className="mt-auto w-full py-3 rounded-full bg-[#4285F4] text-white flex items-center justify-center gap-1"
            >
              Continue <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {step === 1 && (
          <div className="flex-1 flex flex-col">
            <h2 className="text-[#202124] mb-2">
              A bit about you
            </h2>
            <p className="text-[#5f6368] mb-6 text-sm">
              Information about yourself is used only to contextualize your
              patterns. Data is stored locally on your device.
            </p>

            <div className="space-y-4">
              <Field
                label="Age"
                value={age}
                onChange={(v) => setAge(v)}
                unit="years"
                helper="Must be 18 or older"
                error={errors.age}
                step={1}
                min={18}
              />
              <Field
                label="Weight"
                value={weight}
                onChange={(v) => setWeight(v)}
                unit="kg"
                error={errors.weight}
                step={0.1}
                min={0.1}
              />
              <Field
                label="Height"
                value={height}
                onChange={(v) => setHeight(v)}
                unit="cm"
                error={errors.height}
                step={0.1}
                min={0.1}
              />
            </div>

            {showAgeBlock && (
              <div className="mt-4 rounded-xl border border-[#f4c7c3] bg-[#fce8e6] p-3 text-sm text-[#a50e0e]">
                Users must be age 18 and above to use the app as mandated by IMDA Code of Practice for Online Safety requires designated App Distribution Services (ADSs). Recommend this app to your parents or grandparents instead — they would probably need this app more than you.
              </div>
            )}

            <button
              onClick={handleBasicsContinue}
              className="mt-auto w-full py-3 rounded-full bg-[#4285F4] text-white"
            >
              Continue
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="flex-1 flex flex-col">
            <h2 className="text-[#202124] mb-2">
              What are you tracking for?
            </h2>
            <p className="text-[#5f6368] mb-6 text-sm">
              Pick any that apply.
            </p>

            <div className="space-y-2">
              {GOALS.map((g) => {
                const on = goals.includes(g);
                return (
                  <button
                    key={g}
                    onClick={() =>
                      setGoals((cur) =>
                        on
                          ? cur.filter((x) => x !== g)
                          : [...cur, g],
                      )
                    }
                    className={`w-full text-left px-4 py-3 rounded-2xl border ${
                      on
                        ? "border-[#4285F4] bg-[#e8f0fe] text-[#1967d2]"
                        : "border-[#dadce0] bg-white text-[#202124]"
                    }`}
                  >
                    {g}
                  </button>
                );
              })}
            </div>

            <button
              onClick={next}
              className="mt-auto w-full py-3 rounded-full bg-[#4285F4] text-white"
            >
              Continue
            </button>
          </div>
        )}

        {step === 3 && (
          <div className="flex-1 flex flex-col">
            <h2 className="text-[#202124] mb-2">
              Photo storage
            </h2>
            <p className="text-[#5f6368] mb-6 text-sm">
              By default, photos are processed in-memory and
              discarded. You can opt in to keep small thumbnails
              (~50KB) for visual recall.
            </p>

            <div className="space-y-2">
              <button
                onClick={() => setStoreThumbs(false)}
                className={`w-full text-left px-4 py-4 rounded-2xl border ${
                  !storeThumbs
                    ? "border-[#4285F4] bg-[#e8f0fe]"
                    : "border-[#dadce0] bg-white"
                }`}
              >
                <div className="text-[#202124]">
                  Don't store photos (recommended)
                </div>
                <div className="text-sm text-[#5f6368] mt-1">
                  Maximum privacy. Only labels + metadata kept.
                </div>
              </button>
              <button
                onClick={() => setStoreThumbs(true)}
                className={`w-full text-left px-4 py-4 rounded-2xl border ${
                  storeThumbs
                    ? "border-[#4285F4] bg-[#e8f0fe]"
                    : "border-[#dadce0] bg-white"
                }`}
              >
                <div className="text-[#202124]">
                  Store thumbnails
                </div>
                <div className="text-sm text-[#5f6368] mt-1">
                  Compressed thumbnails saved locally for visual
                  history.
                </div>
              </button>
            </div>

            <button
              onClick={finish}
              className="mt-auto w-full py-3 rounded-full bg-[#34A853] text-white"
            >
              Get started
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function PrivacyRow({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="shrink-0 mt-0.5">{icon}</div>
      <div>
        <div className="text-[#202124]">{title}</div>
        <div className="text-sm text-[#5f6368]">{desc}</div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  unit,
  helper,
  error,
  step,
  min,
}: {
  label: string;
  value: number | "";
  onChange: (v: number | "") => void;
  unit: string;
  helper?: string;
  error?: string;
  step?: number;
  min?: number;
}) {
  return (
    <label className="block">
      <span className="text-sm text-[#5f6368]">{label}</span>
      <div className="mt-1 flex items-center gap-2">
        <input
          type="number"
          inputMode={step === 1 ? "numeric" : "decimal"}
          step={step}
          min={min}
          value={value}
          onChange={(e) =>
            onChange(
              e.target.value === "" ? "" : +e.target.value,
            )
          }
          className={`flex-1 px-3 py-2 rounded-xl border focus:outline-none ${
            error ? "border-[#a50e0e] focus:border-[#a50e0e]" : "border-[#dadce0] focus:border-[#4285F4]"
          }`}
        />
        <span className="text-sm text-[#5f6368]">{unit}</span>
      </div>
      {error ? (
        <span className="mt-1 block text-xs text-[#a50e0e]">{error}</span>
      ) : helper ? (
        <span className="mt-1 block text-xs text-[#5f6368]">{helper}</span>
      ) : null}
    </label>
  );
}