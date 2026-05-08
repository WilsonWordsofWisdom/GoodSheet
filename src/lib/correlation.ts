import type { AnyLog, MealLog, StoolLog, ExerciseLog, BristolType, StoolColor } from "./types";

const HOUR = 3600 * 1000;
const LOOKBACK_MS = 72 * HOUR;
const COLOR_DIET_WINDOW = 48 * HOUR;

export interface PatternInsight {
  tag: string;
  outcome: "loose" | "optimal" | "constipated";
  occurrences: number;
  baselineRate: number;
  conditionalRate: number;
  lift: number;
  message: string;
}

export interface StoolColorMeta {
  hex: string;
  baseModifier: number;
  mitigationFraction: number;
  dietTags: string[];
  flagLevel: "none" | "info" | "warn" | "alert";
  flagMessage: string;
  dietTip: string;
  notifMessage: string;
}

export const STOOL_COLOR_META: Record<StoolColor, StoolColorMeta> = {
  brown: {
    hex: "#8B4513",
    baseModifier: 1.0,
    mitigationFraction: 0,
    dietTags: [],
    flagLevel: "none",
    flagMessage: "",
    dietTip: "",
    notifMessage: "",
  },
  "dark-brown": {
    hex: "#4E2A04",
    baseModifier: 0.95,
    mitigationFraction: 0.3,
    dietTags: ["water", "hydration", "fiber"],
    flagLevel: "info",
    flagMessage: "Dark brown can mean slightly low hydration. Drink more water.",
    dietTip: "Increase water intake and add soluble fiber (oats, apples).",
    notifMessage: "Dark stool logged — consider drinking more water today.",
  },
  green: {
    hex: "#4CAF50",
    baseModifier: 0.9,
    mitigationFraction: 0.5,
    dietTags: ["leafy-greens", "spinach", "kale", "iron"],
    flagLevel: "info",
    flagMessage: "Green can be from leafy greens or fast transit — usually fine.",
    dietTip: "If not from greens, green may indicate fast transit. Try probiotics.",
    notifMessage: "Green stool logged — likely diet-related, but worth noting.",
  },
  orange: {
    hex: "#FF9800",
    baseModifier: 0.85,
    mitigationFraction: 0.5,
    dietTags: ["carrot", "sweet-potato", "pumpkin", "beta-carotene"],
    flagLevel: "info",
    flagMessage: "Orange often comes from beta-carotene-rich foods (carrots, sweet potato).",
    dietTip: "If not diet-related, orange may indicate bile absorption issues.",
    notifMessage: "Orange stool logged — check recent beta-carotene intake.",
  },
  yellow: {
    hex: "#FFEB3B",
    baseModifier: 0.75,
    mitigationFraction: 0.4,
    dietTags: ["low-fat", "probiotic", "ginger"],
    flagLevel: "warn",
    flagMessage: "Yellow stools may indicate excess fat malabsorption or fast transit.",
    dietTip: "Reduce fatty foods; add probiotics and ginger to support digestion.",
    notifMessage: "Yellow stool logged — consider reviewing fat intake.",
  },
  red: {
    hex: "#F44336",
    baseModifier: 0.6,
    mitigationFraction: 0.3,
    dietTags: ["beet", "tomato", "red-food-coloring"],
    flagLevel: "alert",
    flagMessage: "Red stools can indicate bleeding — if not from red foods, consult a doctor.",
    dietTip: "Rule out red foods (beets, tomato). Seek medical advice if unexplained.",
    notifMessage: "Red stool logged — if not diet-related, please consult a doctor.",
  },
  black: {
    hex: "#212121",
    baseModifier: 0.6,
    mitigationFraction: 0.2,
    dietTags: ["iron-supplement", "activated-charcoal", "licorice"],
    flagLevel: "alert",
    flagMessage: "Black stools may indicate upper GI bleeding — consult a doctor if not from iron supplements.",
    dietTip: "Iron supplements or activated charcoal can cause black stools. Otherwise seek medical advice.",
    notifMessage: "Black stool logged — if not from iron/supplements, please see a doctor.",
  },
  pale: {
    hex: "#F5F5DC",
    baseModifier: 0.65,
    mitigationFraction: 0.25,
    dietTags: ["bile-support", "beet", "turmeric"],
    flagLevel: "alert",
    flagMessage: "Pale/clay-coloured stools may indicate bile duct issues — worth checking with a doctor.",
    dietTip: "Pale stools can signal liver or bile duct issues. Consult a healthcare professional.",
    notifMessage: "Pale stool logged — this may warrant a check-up.",
  },
};

export function hasDietaryExplanation(stool: StoolLog, meals: MealLog[]): boolean {
  if (!stool.stoolColor) return true;
  const meta = STOOL_COLOR_META[stool.stoolColor];
  if (meta.dietTags.length === 0) return true;
  const window = meals.filter(
    (m) => m.timestamp < stool.timestamp && stool.timestamp - m.timestamp <= COLOR_DIET_WINDOW
  );
  const allTags = window.flatMap((m) => m.tags.map((t) => t.toLowerCase()));
  return meta.dietTags.some((dt) => allTags.some((t) => t.includes(dt) || dt.includes(t)));
}

export function getColorModifier(stool: StoolLog, meals: MealLog[]): number {
  if (!stool.stoolColor) return 1.0;
  const meta = STOOL_COLOR_META[stool.stoolColor];
  if (hasDietaryExplanation(stool, meals)) {
    return meta.baseModifier + (1.0 - meta.baseModifier) * meta.mitigationFraction;
  }
  return meta.baseModifier;
}

function categoryOf(b: BristolType): "loose" | "optimal" | "constipated" {
  if (b <= 2) return "constipated";
  if (b >= 6) return "loose";
  return "optimal";
}

export function isOptimalStool(s: StoolLog): boolean {
  return (
    categoryOf(s.bristol) === "optimal" &&
    s.urgency !== "high" &&
    s.ease !== "strained"
  );
}

export function gutScore(logs: AnyLog[], now = Date.now()): number {
  const since = now - 7 * 24 * HOUR;
  const stools = logs.filter(
    (l): l is StoolLog => l.type === "stool" && l.timestamp >= since
  );
  if (stools.length === 0) return 0;
  const meals = logs.filter((l): l is MealLog => l.type === "meal");
  const optimal = stools.filter(isOptimalStool).length;
  const ratio = optimal / stools.length;
  const frequencyBonus = (Math.min(optimal, 7) / 7) * 1.3;
  const stoolsWithColor = stools.filter((s) => s.stoolColor);
  const avgColorModifier =
    stoolsWithColor.length > 0
      ? stoolsWithColor.reduce((sum, s) => sum + getColorModifier(s, meals), 0) / stoolsWithColor.length
      : 1.0;
  return Math.min(100, Math.round(ratio * 100 * frequencyBonus * avgColorModifier));
}

export function transitTimeFor(stool: StoolLog, logs: AnyLog[]): number | null {
  const meals = logs.filter(
    (l): l is MealLog =>
      l.type === "meal" &&
      l.timestamp < stool.timestamp &&
      stool.timestamp - l.timestamp <= LOOKBACK_MS
  );
  if (meals.length === 0) return null;
  const closest = meals.reduce((a, b) =>
    stool.timestamp - a.timestamp < stool.timestamp - b.timestamp ? a : b
  );
  return Math.round((stool.timestamp - closest.timestamp) / HOUR);
}

export function findPatterns(logs: AnyLog[]): PatternInsight[] {
  const stools = logs.filter((l): l is StoolLog => l.type === "stool");
  if (stools.length < 3) return [];

  const meals = logs.filter((l): l is MealLog => l.type === "meal");

  const baselineByCat = {
    loose: stools.filter((s) => categoryOf(s.bristol) === "loose").length / stools.length,
    optimal: stools.filter((s) => categoryOf(s.bristol) === "optimal").length / stools.length,
    constipated:
      stools.filter((s) => categoryOf(s.bristol) === "constipated").length / stools.length,
  };

  const tagCounts = new Map<string, { total: number; outcomes: Record<string, number> }>();

  for (const stool of stools) {
    const cat = categoryOf(stool.bristol);
    const window = meals.filter(
      (m) => m.timestamp < stool.timestamp && stool.timestamp - m.timestamp <= LOOKBACK_MS
    );
    const tags = new Set<string>();
    for (const m of window) for (const t of m.tags) tags.add(t.toLowerCase());
    for (const t of tags) {
      const entry = tagCounts.get(t) ?? { total: 0, outcomes: { loose: 0, optimal: 0, constipated: 0 } };
      entry.total += 1;
      entry.outcomes[cat] += 1;
      tagCounts.set(t, entry);
    }
  }

  const insights: PatternInsight[] = [];
  for (const [tag, data] of tagCounts) {
    for (const cat of ["loose", "optimal", "constipated"] as const) {
      const occ = data.outcomes[cat];
      if (occ < 5) continue;
      const conditional = occ / data.total;
      const baseline = baselineByCat[cat] || 0.0001;
      const lift = conditional / baseline;
      if (lift < 1.5) continue;

      const verb =
        cat === "optimal"
          ? "appears alongside Type 3–5 outcomes"
          : cat === "loose"
            ? "appears before Type 6–7 (loose) outcomes"
            : "appears before Type 1–2 (firm) outcomes";

      insights.push({
        tag,
        outcome: cat,
        occurrences: occ,
        baselineRate: baseline,
        conditionalRate: conditional,
        lift,
        message: `Pattern: #${tag} ${verb} (based on ${occ} occurrences, ${Math.round(lift * 10) / 10}× your baseline).`,
      });
    }
  }

  return insights.sort((a, b) => b.lift - a.lift);
}

export function goodShitStreak(logs: AnyLog[], now = Date.now()): { current: number; best: number; goodToday: boolean } {
  const stools = logs.filter((l): l is StoolLog => l.type === "stool");
  if (stools.length === 0) return { current: 0, best: 0, goodToday: false };

  const dayKey = (ts: number) => {
    const d = new Date(ts);
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  };

  const goodDays = new Set<number>();
  for (const s of stools) {
    if (categoryOf(s.bristol) === "optimal") goodDays.add(dayKey(s.timestamp));
  }

  const today = dayKey(now);
  const goodToday = goodDays.has(today);

  let current = 0;
  let cursor = goodToday ? today : today - 24 * HOUR;
  while (goodDays.has(cursor)) {
    current++;
    cursor -= 24 * HOUR;
  }

  const sorted = [...goodDays].sort((a, b) => a - b);
  let best = 0;
  let run = 0;
  let prev: number | null = null;
  for (const d of sorted) {
    if (prev !== null && d - prev === 24 * HOUR) run++;
    else run = 1;
    if (run > best) best = run;
    prev = d;
  }

  return { current, best: Math.max(best, current), goodToday };
}

export function recentExerciseCount(logs: AnyLog[], now = Date.now()): number {
  const since = now - 24 * HOUR;
  return logs.filter(
    (l): l is ExerciseLog => l.type === "exercise" && l.timestamp >= since
  ).length;
}

export function fiberToday(logs: AnyLog[], now = Date.now()): number {
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  return logs.filter(
    (l): l is MealLog =>
      l.type === "meal" &&
      l.timestamp >= start.getTime() &&
      l.tags.some((t) => /fiber|fibre|oat|bean|lentil|veg|fruit|whole/i.test(t))
  ).length;
}
