"use client";
import { useEffect, useRef, useState } from "react";
import { Camera, Utensils, Activity, Droplet, X, Flame, CalendarClock } from "lucide-react";
import { BristolPicker } from "./BristolPicker";
import { QuickChips } from "./QuickChips";
import { FoodPicker } from "./FoodPicker";
import { StoolAnalysis } from "./StoolAnalysis";
import { FoodAnalysis } from "./FoodAnalysis";
import type { AnyLog, BristolType, UserProfile } from "@/lib/types";
import { saveLog } from "@/lib/storage";
import { estimateCalories } from "@/lib/calorie";
import { estimateCaloriesBurned } from "@/lib/exercise-calories";
import type { FoodItem } from "@/lib/foods";
import { classifyStoolImage, loadImageFromFile } from "@/lib/stool-classifier";
import type { ClassificationResult } from "@/lib/stool-classifier";
import {
  classifyFoodImage,
  loadFoodImageFromFile,
  preloadFoodClassifier,
} from "@/lib/food-classifier";
import type { FoodClassificationResult, FoodClassifyStatus } from "@/lib/food-classifier";

interface Props {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  storeThumbnails: boolean;
  userProfile?: UserProfile;
}

type Tab = "meal" | "exercise" | "stool";

export function Logger({ open, onClose, onSaved, storeThumbnails, userProfile }: Props) {
  const [tab, setTab] = useState<Tab>("meal");
  const [food, setFood] = useState<FoodItem | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [note, setNote] = useState("");
  const [activity, setActivity] = useState("Walk");
  const [intensity, setIntensity] = useState<"low" | "medium" | "high">("medium");
  const [duration, setDuration] = useState(20);
  const [bristol, setBristol] = useState<BristolType | null>(null);
  const [urgency, setUrgency] = useState<"low" | "medium" | "high">("medium");
  const [ease, setEase] = useState<"easy" | "normal" | "strained">("normal");
  const [thumbnail, setThumbnail] = useState<string | undefined>(undefined);
  const [entryDatetime, setEntryDatetime] = useState(() => toDatetimeLocal(new Date()));
  // Bristol AI classifier state
  const [classifyResult, setClassifyResult] = useState<ClassificationResult | null>(null);
  const [classifyStatus, setClassifyStatus] = useState<"idle" | "analyzing" | "done" | "error">("idle");
  const [classifyError, setClassifyError] = useState<string | undefined>(undefined);
  // Food AI classifier state
  const [foodClassifyResult, setFoodClassifyResult] = useState<FoodClassificationResult | null>(null);
  const [foodClassifyStatus, setFoodClassifyStatus] = useState<FoodClassifyStatus>("idle");
  const [foodClassifyError, setFoodClassifyError] = useState<string | undefined>(undefined);
  const fileRef = useRef<HTMLInputElement>(null);

  // Reset datetime to now each time the logger opens
  useEffect(() => {
    if (open) setEntryDatetime(toDatetimeLocal(new Date()));
  }, [open]);

  // Preload MobileNet model when user switches to meal tab
  useEffect(() => {
    if (tab === "meal") preloadFoodClassifier();
  }, [tab]);

  if (!open) return null;

  const reset = () => {
    setFood(null); setTags([]); setNote(""); setActivity("Walk"); setIntensity("medium");
    setDuration(20); setBristol(null); setUrgency("medium"); setEase("normal");
    setThumbnail(undefined);
    setEntryDatetime(toDatetimeLocal(new Date()));
    setClassifyResult(null); setClassifyStatus("idle"); setClassifyError(undefined);
    setFoodClassifyResult(null); setFoodClassifyStatus("idle"); setFoodClassifyError(undefined);
  };

  const handleSelectFood = (f: FoodItem | null) => {
    setFood(f);
    if (f) {
      const existing = new Set(tags);
      for (const t of f.tags) existing.add(t);
      setTags(Array.from(existing));
    }
  };

  const handlePhoto = async (file: File) => {
    // Store thumbnail only if user opted in
    if (storeThumbnails) {
      const compressed = await compressImage(file, 200, 0.6);
      setThumbnail(compressed);
    } else if (tab === "stool") {
      // Still show a preview in-memory (not saved to log) so user sees the image while classifying
      const compressed = await compressImage(file, 200, 0.6);
      setThumbnail(compressed);
    }

    // ── Meal tab: run Food AI classifier ─────────────────────────────────────
    if (tab === "meal") {
      if (!storeThumbnails) {
        const compressed = await compressImage(file, 200, 0.6);
        setThumbnail(compressed);
      }
      setFoodClassifyStatus("loading-model");
      setFoodClassifyResult(null);
      setFoodClassifyError(undefined);
      try {
        const imgEl = await loadFoodImageFromFile(file);
        const result = await classifyFoodImage(imgEl, (s) => setFoodClassifyStatus(s));
        setFoodClassifyResult(result);
        setFoodClassifyStatus("done");
      } catch (err) {
        setFoodClassifyError(err instanceof Error ? err.message : String(err));
        setFoodClassifyStatus("error");
      }
    }

    // ── Stool tab: run Bristol AI classifier ─────────────────────────────────
    if (tab === "stool") {
      setClassifyStatus("analyzing");
      setClassifyResult(null);
      setClassifyError(undefined);
      try {
        const imgEl = await loadImageFromFile(file);
        const result = await classifyStoolImage(imgEl);
        setClassifyResult(result);
        setClassifyStatus("done");
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        setClassifyError(msg);
        setClassifyStatus("error");
      }
    }
  };

  const submit = async () => {
    const id = crypto.randomUUID();
    const ts = entryDatetime ? new Date(entryDatetime).getTime() : Date.now();
    let log: AnyLog | null = null;

    if (tab === "meal") {
      const cal = food ? { min: food.kcalMin, max: food.kcalMax } : estimateCalories(tags);
      log = {
        id, type: "meal", timestamp: ts, tags,
        foodName: food?.name,
        cuisine: food?.cuisine,
        note: note || undefined,
        caloriesMin: cal?.min, caloriesMax: cal?.max,
        thumbnail: storeThumbnails ? thumbnail : undefined,
      };
    } else if (tab === "exercise") {
      const calorieBurn = estimateCaloriesBurned(
        activity,
        intensity,
        duration,
        userProfile?.weightKg
      );
      log = {
        id, type: "exercise", timestamp: ts,
        activity, intensity, durationMin: duration,
        caloriesBurned: calorieBurn.calories,
        met: calorieBurn.met,
        note: note || undefined,
      };
    } else if (tab === "stool" && bristol) {
      log = {
        id, type: "stool", timestamp: ts,
        bristol, urgency, ease,
        note: note || undefined,
        thumbnail: storeThumbnails ? thumbnail : undefined,
      };
    }

    if (!log) return;
    await saveLog(log);
    reset();
    onSaved();
    onClose();
  };

  const canSave =
    (tab === "meal" && (food !== null || tags.length > 0)) ||
    tab === "exercise" ||
    (tab === "stool" && bristol !== null);

  const mealCalories = food
    ? { min: food.kcalMin, max: food.kcalMax }
    : estimateCalories(tags);

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center" onClick={onClose}>
      <div
        className="bg-white w-full sm:max-w-lg sm:rounded-3xl rounded-t-3xl max-h-[92vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b border-[#e8eaed] px-4 py-3 flex items-center justify-between">
          <h2 className="text-[#202124]">Log entry</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-[#f1f3f4]">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-4 pt-4">
          <div className="grid grid-cols-3 gap-2 p-1 bg-[#f1f3f4] rounded-full">
            <TabBtn icon={<Utensils className="w-4 h-4" />} label="Food" active={tab === "meal"} onClick={() => setTab("meal")} />
            <TabBtn icon={<Activity className="w-4 h-4" />} label="Activity" active={tab === "exercise"} onClick={() => setTab("exercise")} />
            <TabBtn icon={<Droplet className="w-4 h-4" />} label="Stool" active={tab === "stool"} onClick={() => setTab("stool")} />
          </div>
        </div>

        <div className="p-4 space-y-4">
          {(tab === "meal" || tab === "stool") && (
            <PhotoField
              thumbnail={thumbnail}
              storeThumbnails={storeThumbnails}
              isStool={tab === "stool"}
              onPick={() => fileRef.current?.click()}
              onClear={() => {
                setThumbnail(undefined);
                setClassifyResult(null);
                setClassifyStatus("idle");
                setClassifyError(undefined);
                setFoodClassifyResult(null);
                setFoodClassifyStatus("idle");
                setFoodClassifyError(undefined);
              }}
            />
          )}

          {/* AI classifier result – stool tab only */}
          {tab === "stool" && (classifyStatus === "analyzing" || classifyStatus === "done" || classifyStatus === "error") && (
            <StoolAnalysis
              result={classifyResult}
              isAnalyzing={classifyStatus === "analyzing"}
              error={classifyError}
              onApply={(t) => setBristol(t)}
            />
          )}

          {tab === "meal" && (
            <>
              <FoodPicker value={food} onChange={handleSelectFood} />
              <div>
                <label>Quick tags</label>
                <div className="mt-2">
                  <QuickChips value={tags} onChange={setTags} />
                </div>
              </div>
              {mealCalories && (
                <div className="bg-[#e8f0fe] rounded-xl p-3 text-sm text-[#1967d2]">
                  {food ? (
                    <>
                      <span className="block">{food.name} · ~{mealCalories.min}–{mealCalories.max} kcal · ±30%</span>
                      <span className="block text-xs text-[#5f6368] mt-0.5">From food selection (overrides tag estimate)</span>
                    </>
                  ) : (
                    <>Estimated from tags: ~{mealCalories.min}–{mealCalories.max} kcal · ±30%</>
                  )}
                </div>
              )}
              {/* Food AI classifier result – meal tab only */}
              {tab === "meal" && foodClassifyStatus !== "idle" && (
                <FoodAnalysis
                  result={foodClassifyResult}
                  status={foodClassifyStatus}
                  error={foodClassifyError}
                  onApply={(f) => handleSelectFood(f)}
                />
              )}
            </>
          )}

          {tab === "exercise" && (
            <>
              <div>
                <label>Activity</label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {["Walk", "Run", "Yoga", "Gym", "Cycle", "Swim", "Tennis", "Skating", "Martial Arts", "Dance", "Badminton", "Kayaking", "Climbing", "Hiking"].map((a) => (
                    <button
                      key={a}
                      onClick={() => setActivity(a)}
                      className={`px-3 py-1.5 rounded-full text-sm ${
                        activity === a ? "bg-[#4285F4] text-white" : "bg-white border border-[#dadce0] text-[#5f6368]"
                      }`}
                    >
                      {a}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label>Intensity</label>
                <div className="mt-2 grid grid-cols-3 gap-2">
                  {(["low", "medium", "high"] as const).map((i) => (
                    <button
                      key={i}
                      onClick={() => setIntensity(i)}
                      className={`py-2 rounded-full text-sm capitalize ${
                        intensity === i ? "bg-[#34A853] text-white" : "bg-white border border-[#dadce0] text-[#5f6368]"
                      }`}
                    >
                      {i}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label>Duration: {duration} min</label>
                <input
                  type="range"
                  min={5}
                  max={120}
                  step={5}
                  value={duration}
                  onChange={(e) => setDuration(+e.target.value)}
                  className="w-full mt-2 accent-[#4285F4]"
                />
              </div>
              <CalorieBurnDisplay
                activity={activity}
                intensity={intensity}
                duration={duration}
                weightKg={userProfile?.weightKg}
              />
            </>
          )}

          {tab === "stool" && (
            <>
              <BristolPicker value={bristol} onChange={setBristol} />
              <div>
                <label>Urgency</label>
                <div className="mt-2 grid grid-cols-3 gap-2">
                  {(["low", "medium", "high"] as const).map((i) => {
                    const activeColor =
                      i === "low" ? "bg-[#34A853] text-white" :
                      i === "medium" ? "bg-[#FBBC05] text-[#202124]" :
                      "bg-[#EA4335] text-white";
                    return (
                      <button
                        key={i}
                        onClick={() => setUrgency(i)}
                        className={`py-2 rounded-full text-sm capitalize ${
                          urgency === i ? activeColor : "bg-white border border-[#dadce0] text-[#5f6368]"
                        }`}
                      >
                        {i}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <label>Ease of passage</label>
                <div className="mt-2 grid grid-cols-3 gap-2">
                  {(["easy", "normal", "strained"] as const).map((i) => {
                    const activeColor =
                      i === "easy" ? "bg-[#34A853] text-white" :
                      i === "normal" ? "bg-[#FBBC05] text-[#202124]" :
                      "bg-[#EA4335] text-white";
                    return (
                      <button
                        key={i}
                        onClick={() => setEase(i)}
                        className={`py-2 rounded-full text-sm capitalize ${
                          ease === i ? activeColor : "bg-white border border-[#dadce0] text-[#5f6368]"
                        }`}
                      >
                        {i}
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          <div>
            <label>Notes (optional)</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              className="mt-2 w-full px-3 py-2 rounded-xl border border-[#dadce0] bg-white text-sm focus:outline-none focus:border-[#4285F4]"
              placeholder="Additional details for record and tracking…"
            />
          </div>

          {/* ── Date & Time selector ── */}
          <div className="bg-[#f8f9fa] rounded-2xl border border-[#e8eaed] px-4 py-3">
            <div className="flex items-center gap-2 mb-2">
              <CalendarClock className="w-4 h-4 text-[#4285F4] shrink-0" />
              <span className="text-sm font-medium text-[#202124]">Date &amp; Time</span>
              <span className="ml-auto text-[10px] text-[#9aa0a6] bg-white border border-[#e8eaed] px-2 py-0.5 rounded-full">
                defaults to now
              </span>
            </div>
            <input
              type="datetime-local"
              value={entryDatetime}
              onChange={(e) => setEntryDatetime(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-[#dadce0] bg-white text-sm text-[#202124] focus:outline-none focus:border-[#4285F4] focus:ring-1 focus:ring-[#4285F4]/20"
            />
          </div>

          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handlePhoto(f);
            }}
          />

          <button
            disabled={!canSave}
            onClick={submit}
            className="w-full py-3 rounded-full bg-[#4285F4] text-white disabled:bg-[#dadce0] disabled:text-[#9aa0a6]"
          >
            Save entry
          </button>
        </div>
      </div>
    </div>
  );
}

function TabBtn({ icon, label, active, onClick }: { icon: React.ReactNode; label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-center gap-2 py-2 rounded-full text-sm transition-all ${
        active ? "bg-white text-[#202124] shadow-sm" : "text-[#5f6368]"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function PhotoField({
  thumbnail, storeThumbnails, isStool, onPick, onClear,
}: {
  thumbnail?: string; storeThumbnails: boolean; isStool?: boolean; onPick: () => void; onClear: () => void;
}) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <label>
          Photo{" "}
          {isStool
            ? <span className="text-xs text-[#4285F4] font-medium">· AI Bristol classifier</span>
            : <span className="text-xs text-[#F57C00] font-medium">· AI food identifier</span>}
        </label>
        {!thumbnail && (
          <span className={`text-[10px] px-2 py-0.5 rounded-full ${
            isStool
              ? "bg-[#e8f0fe] text-[#1967d2]"
              : "bg-[#fff3e0] text-[#E65100]"
          }`}>
            Auto-identifies on upload
          </span>
        )}
      </div>
      {thumbnail ? (
        <div className="mt-2 relative w-full">
          <img src={thumbnail} alt="" className="w-full h-40 object-cover rounded-2xl" />
          <button
            onClick={onClear}
            className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1.5"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={onPick}
          className={`mt-2 w-full h-32 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center hover:bg-[#f8f9fa] ${
            isStool
              ? "border-[#4285F4]/40 bg-[#f0f4ff]"
              : "border-[#F57C00]/40 bg-[#fff8f0]"
          }`}
        >
          <Camera className={`w-6 h-6 mb-1 ${isStool ? "text-[#4285F4]" : "text-[#F57C00]"}`} />
          <span className={`text-sm font-medium ${isStool ? "text-[#4285F4]" : "text-[#F57C00]"}`}>
            {isStool ? "Photo for AI Bristol Analysis" : "Photo for AI Food Detection"}
          </span>
          <span className="text-[10px] text-[#5f6368] mt-0.5">
            {isStool ? "Runs locally · zero cloud" : "MobileNet V2 · runs locally · zero cloud"}
          </span>
        </button>
      )}
    </div>
  );
}

function CalorieBurnDisplay({
  activity,
  intensity,
  duration,
  weightKg,
}: {
  activity: string;
  intensity: "low" | "medium" | "high";
  duration: number;
  weightKg?: number;
}) {
  const estimate = estimateCaloriesBurned(activity, intensity, duration, weightKg);

  return (
    <div className="bg-[#e6f4ea] rounded-xl p-3 space-y-2">
      <div className="flex items-center gap-2 text-[#137333]">
        <Flame className="w-5 h-5" />
        <span className="text-lg">~{estimate.calories} kcal burned</span>
      </div>
      <div className="text-xs text-[#5f6368] space-y-0.5">
        <div>Based on {estimate.met} METs (Metabolic Equivalent)</div>
        <div>{estimate.note}</div>
        <div className="text-[#3c4043] mt-1">
          Source: Ainsworth BE et al. (2011) Compendium of Physical Activities
        </div>
      </div>
      {!weightKg && (
        <div className="text-xs text-[#b06000] bg-[#fef7e0] px-2 py-1.5 rounded-lg">
          💡 Add your weight in Settings for personalized estimates
        </div>
      )}
    </div>
  );
}

async function compressImage(file: File, maxDim: number, quality: number): Promise<string> {
  const dataUrl = await new Promise<string>((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result as string);
    r.onerror = () => rej(r.error);
    r.readAsDataURL(file);
  });
  const img = await new Promise<HTMLImageElement>((res, rej) => {
    const i = new Image();
    i.onload = () => res(i);
    i.onerror = rej;
    i.src = dataUrl;
  });
  const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
  const w = Math.round(img.width * scale);
  const h = Math.round(img.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = w; canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, 0, 0, w, h);
  return canvas.toDataURL("image/jpeg", quality);
}

// Helper: format a Date as datetime-local input value (local time)
function toDatetimeLocal(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}