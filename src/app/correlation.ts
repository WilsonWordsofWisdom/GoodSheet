import type { AnyLog, MealLog, StoolLog, ExerciseLog, BristolType, StoolColor } from "./types";

const HOUR = 3600 * 1000;
const LOOKBACK_MS = 72 * HOUR;
const COLOR_DIET_WINDOW = 48 * HOUR; // transit window for dietary explanation

/* ════════════════════════════════════════════════════════════════════════════
   STOOL COLOUR METADATA
   Sources:
     • Mayo Clinic – "Stool color: When to worry" (mayoclinic.org)
     • Cleveland Clinic – "What the Color of Your Poop Means"
     • NHS UK – "Blood in the stool (rectal bleeding)"
     • MedlinePlus / NIH – "Stools – pale or clay-colored"
     • AGA Clinical Guidelines on GI bleeding evaluation
   ════════════════════════════════════════════════════════════════════════════ */

export interface StoolColorMeta {
  label: string;
  hex: string;
  /**
   * Score multiplier applied to the weekly Gut Score (0–1).
   * 1.0 = no penalty; lower values = progressive deduction.
   */
  baseModifier: number;
  /**
   * Fraction of the penalty that is forgiven when a plausible dietary
   * explanation is found in the 48-hour food log.
   * 0 = no mitigation (e.g. pale/clay — no food causes this).
   */
  mitigationFraction: number;
  /** Food tags / food names (lowercase) that can explain this colour. */
  dietTags: string[];
  flagLevel: "none" | "mild" | "warning" | "alert";
  /** Short message shown in the Logger when this colour is selected. */
  flagMessage: string;
  /** Dietary context tip shown alongside the flag message. */
  dietTip: string;
  /** Notification copy for the bell panel (only for "warning"/"alert"). */
  notifMessage: string;
}

export const STOOL_COLOR_META: Record<StoolColor, StoolColorMeta> = {
  "brown": {
    label: "Brown",
    hex: "#7B4A2A",
    baseModifier: 1.00,
    mitigationFraction: 0,
    dietTags: [],
    flagLevel: "none",
    flagMessage: "",
    dietTip: "",
    notifMessage: "",
  },
  "dark-brown": {
    label: "Dark Brown",
    hex: "#3E1F08",
    baseModifier: 0.98,
    mitigationFraction: 0,
    dietTags: [],
    flagLevel: "none",
    flagMessage: "Dark brown is a normal colour variant — often linked to higher protein or iron intake.",
    dietTip: "",
    notifMessage: "",
  },
  "green": {
    label: "Green",
    hex: "#2E7D32",
    baseModifier: 0.88,
    mitigationFraction: 0.50,
    dietTags: [
      "leafy", "spinach", "kailan", "kai-lan", "kale", "chye-sim", "chye sim",
      "pandan", "matcha", "spirulina", "vegetable", "veg", "fiber", "greens",
      "broccoli", "celery", "green tea", "chlorophyll",
    ],
    flagLevel: "mild",
    flagMessage: "Green stool often means food moved quickly through your gut (rapid transit), or is dietary.",
    dietTip: "Leafy greens, pandan, matcha, or spinach in the last 48 h? Likely just dietary.",
    notifMessage: "",
  },
  "orange": {
    label: "Orange",
    hex: "#BF5800",
    baseModifier: 0.90,
    mitigationFraction: 0.50,
    dietTags: [
      "carrot", "pumpkin", "sweet-potato", "sweet potato", "papaya",
      "squash", "beta-carotene", "yam", "butternut",
    ],
    flagLevel: "mild",
    flagMessage: "Orange stool is usually from beta-carotene-rich foods. Rarely, it may indicate a bile duct issue.",
    dietTip: "Carrots, pumpkin, sweet potato, or papaya recently? Very likely dietary.",
    notifMessage: "",
  },
  "yellow": {
    label: "Yellow",
    hex: "#C8960A",
    baseModifier: 0.80,
    mitigationFraction: 0.40,
    dietTags: [
      "turmeric", "curry", "nasi-kuning", "nasi kuning", "ghee",
      "yellow curry", "dal", "lentil",
    ],
    flagLevel: "warning",
    flagMessage: "Yellow stool can indicate excess fat in the stool (malabsorption) or reduced bile. See a doctor if it persists.",
    dietTip: "Heavy curry, turmeric, or high-fat meals can temporarily cause yellow stool.",
    notifMessage: "Yellow stool logged recently. If not explained by turmeric/curry, this may indicate fat malabsorption — see a GP if it persists.",
  },
  "red": {
    label: "Red",
    hex: "#B71C1C",
    baseModifier: 0.72,
    mitigationFraction: 0.35,
    dietTags: [
      "dragon-fruit", "dragon fruit", "dragonfruit", "beetroot", "beet",
      "red-bean", "red bean", "watermelon", "strawberry",
      "tomato", "haw", "red food dye", "pomegranate",
    ],
    flagLevel: "alert",
    flagMessage: "Red stool may indicate lower GI bleeding (hemorrhoids, colitis, polyps). Consult a GP if not explained by diet.",
    dietTip: "Dragon fruit, beetroot, or red bean recently? Check your last 2 days of food logs.",
    notifMessage: "Red stool logged. If you haven't eaten dragon fruit or beetroot recently, this could indicate lower GI bleeding — please consult a GP.",
  },
  "black": {
    label: "Black",
    hex: "#1A1A1A",
    baseModifier: 0.72,
    mitigationFraction: 0.35,
    dietTags: [
      "squid-ink", "squid ink", "charcoal", "activated charcoal",
      "black-sesame", "black sesame", "pulut-hitam", "pulut hitam",
      "dark-soy", "dark soy", "iron", "iron supplement",
      "blueberry", "black licorice", "dark chocolate",
    ],
    flagLevel: "alert",
    flagMessage: "Black or tarry stool can indicate upper GI bleeding (ulcer, oesophageal). Urgent if unexplained by diet.",
    dietTip: "Squid ink, charcoal buns, pulut hitam, or iron supplements can darken stool significantly.",
    notifMessage: "Black stool logged. If not from squid ink, charcoal, or iron supplements, this could indicate upper GI bleeding — see a doctor promptly.",
  },
  "pale": {
    label: "Pale/Clay",
    hex: "#C4BAA8",
    baseModifier: 0.60,
    mitigationFraction: 0.00, // No common food causes acholic stools — always flag
    dietTags: [],
    flagLevel: "alert",
    flagMessage: "Pale or clay-coloured stool means very little bile is reaching your gut. This may indicate liver or bile duct disease.",
    dietTip: "",
    notifMessage: "Pale/clay-coloured stool logged. This may indicate a bile duct or liver issue (e.g. hepatitis, gallstones). Please see a GP promptly.",
  },
};

/* ════════════════════════════════════════════════════════════════════════════
   COLOUR MODIFIER HELPERS
   ════════════════════════════════════════════════════════════════════════════ */

/**
 * Returns true if a food logged within 48 h before this stool plausibly
 * explains the colour (e.g. dragon fruit → red).
 */
export function hasDietaryExplanation(stool: StoolLog, meals: MealLog[]): boolean {
  if (!stool.stoolColor) return false;
  const meta = STOOL_COLOR_META[stool.stoolColor];
  if (meta.dietTags.length === 0) return false;

  const recentTerms = new Set<string>();
  for (const m of meals) {
    if (m.timestamp < stool.timestamp && stool.timestamp - m.timestamp <= COLOR_DIET_WINDOW) {
      for (const t of m.tags) recentTerms.add(t.toLowerCase());
      if (m.foodName) recentTerms.add(m.foodName.toLowerCase());
    }
  }
  return meta.dietTags.some((tag) => recentTerms.has(tag));
}

/**
 * Per-stool colour score multiplier (0.60 – 1.00).
 * Penalty is partially forgiven when a dietary explanation is found.
 */
export function getColorModifier(stool: StoolLog, meals: MealLog[]): number {
  if (!stool.stoolColor) return 1.0;
  const meta = STOOL_COLOR_META[stool.stoolColor];
  if (meta.baseModifier >= 1.0) return 1.0;

  const penalty = 1.0 - meta.baseModifier;
  if (meta.mitigationFraction === 0 || meta.dietTags.length === 0) return meta.baseModifier;

  if (hasDietaryExplanation(stool, meals)) {
    // Partially restore the score when diet explains the colour
    return Math.min(1.0, meta.baseModifier + penalty * meta.mitigationFraction);
  }
  return meta.baseModifier;
}

/* ════════════════════════════════════════════════════════════════════════════
   CORE FUNCTIONS
   ════════════════════════════════════════════════════════════════════════════ */

export interface PatternInsight {
  tag: string;
  outcome: "loose" | "optimal" | "constipated";
  occurrences: number;
  baselineRate: number;
  conditionalRate: number;
  lift: number;
  message: string;
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

/**
 * Gut Score (0–100), last 7 days.
 *
 * Formula:
 *   score = (optimalCount / totalCount) × 100 × frequencyBonus × avgColourModifier
 *
 * frequencyBonus  scales linearly from 0→1.3 as optimal logs go from 0→7.
 * avgColourModifier is the mean of per-stool colour modifiers for any stool
 *   where a colour was logged (defaults to 1.0 for un-coloured logs so legacy
 *   data is unaffected).
 */
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

  // Only stool logs that have a colour contribute to the colour modifier.
  // This preserves backward-compatibility for all logs before this feature.
  const stoolsWithColor = stools.filter((s) => s.stoolColor);
  const avgColorModifier =
    stoolsWithColor.length > 0
      ? stoolsWithColor.reduce((sum, s) => sum + getColorModifier(s, meals), 0) /
        stoolsWithColor.length
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
      const entry = tagCounts.get(t) ?? {
        total: 0,
        outcomes: { loose: 0, optimal: 0, constipated: 0 },
      };
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
        message: `Pattern: #${tag} ${verb} (based on ${occ} occurrences, ${
          Math.round(lift * 10) / 10
        }× your baseline).`,
      });
    }
  }

  return insights.sort((a, b) => b.lift - a.lift);
}

export function goodShitStreak(
  logs: AnyLog[],
  now = Date.now()
): { current: number; best: number; goodToday: boolean } {
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
  const yesterday = today - 24 * HOUR;
  const goodToday = goodDays.has(today);

  let current = 0;
  let cursor = goodToday ? today : yesterday;
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
