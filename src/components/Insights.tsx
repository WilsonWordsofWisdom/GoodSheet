"use client";
import { useState, useMemo } from "react";
import type { AnyLog, MealLog, ExerciseLog, StoolLog } from "@/lib/types";
import { findPatterns } from "@/lib/correlation";
import { TrendingUp, AlertCircle, Sparkles, CalendarDays } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  Cell,
} from "recharts";
import { BRISTOL_TYPES, BRISTOL } from "@/lib/bristol";

interface Props {
  logs: AnyLog[];
}

/* ─── Types ─────────────────────────────────────── */
type TrendView = "food" | "activity" | "stool";

/* ─── Meal colours ───────────────────────────────── */
const MEAL_KEYS = ["Breakfast", "Lunch", "Dinner", "Snack"] as const;
const MEAL_COLORS: Record<string, string> = {
  Breakfast: "#FF8F00",
  Lunch:     "#34A853",
  Dinner:    "#4285F4",
  Snack:     "#9AA0A6",
};

/* ─── Activity colours ───────────────────────────── */
const KNOWN_ACTIVITY_COLORS: Record<string, string> = {
  Tennis:        "#4285F4",
  Skating:       "#00BCD4",
  "Martial Arts":"#EA4335",
  Dance:         "#FF6D00",
  Badminton:     "#34A853",
  Kayaking:      "#039BE5",
  Climbing:      "#9C27B0",
  Hiking:        "#795548",
  Walk:          "#66BB6A",
  Run:           "#EF5350",
  Swim:          "#42A5F5",
  Cycle:         "#FFA726",
};
const FALLBACK_PALETTE = [
  "#E91E63","#673AB7","#009688","#607D8B","#F44336","#2196F3",
];
function activityColor(name: string, idx: number) {
  return KNOWN_ACTIVITY_COLORS[name] ?? FALLBACK_PALETTE[idx % FALLBACK_PALETTE.length];
}

/* ─── Helpers ────────────────────────────────────── */
function dateKey(ts: number) {
  const d = new Date(ts);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function getLast14Days(): { label: string; dateKey: string }[] {
  const days: { label: string; dateKey: string }[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - i);
    days.push({
      label: `${d.getDate()}/${d.getMonth() + 1}`,
      dateKey: dateKey(d.getTime()),
    });
  }
  return days;
}

function getMealSlot(ts: number): "Breakfast" | "Lunch" | "Dinner" | "Snack" {
  const h = new Date(ts).getHours();
  if (h >= 5  && h < 11) return "Breakfast";
  if (h >= 11 && h < 15) return "Lunch";
  if (h >= 17 && h < 22) return "Dinner";
  return "Snack";
}

function mealCals(l: MealLog): number {
  const mn = l.caloriesMin ?? 0;
  const mx = l.caloriesMax ?? 0;
  if (mn && mx) return Math.round((mn + mx) / 2);
  return mn || mx;
}

/* ─── Custom legend strip ────────────────────────── */
function LegendStrip({ items }: { items: { label: string; color: string }[] }) {
  if (!items.length) return null;
  return (
    <div className="flex flex-wrap gap-x-3 gap-y-1.5 mt-3 px-1">
      {items.map(({ label, color }) => (
        <div key={label} className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: color }} />
          <span className="text-xs text-[#5f6368]">{label}</span>
        </div>
      ))}
    </div>
  );
}

/* ─── Custom tooltip ─────────────────────────────── */
function CustomTooltip({ active, payload, label, unit }: any) {
  if (!active || !payload?.length) return null;
  const total = payload.reduce((s: number, p: any) => s + (p.value ?? 0), 0);
  return (
    <div className="bg-white rounded-xl shadow-lg border border-[#e8eaed] px-3 py-2 text-xs min-w-[110px]">
      <p className="font-semibold text-[#202124] mb-1">{label}</p>
      {payload.map((p: any) =>
        p.value > 0 ? (
          <p key={p.name} style={{ color: p.fill }} className="truncate">
            {p.name}: {p.value}{unit}
          </p>
        ) : null
      )}
      {payload.length > 1 && total > 0 && (
        <p className="text-[#202124] font-medium mt-1 border-t border-[#e8eaed] pt-1">
          Total: {total}{unit}
        </p>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   Main component
═══════════════════════════════════════════════════ */
export function Insights({ logs }: Props) {
  const patterns = findPatterns(logs);
  const positive = patterns.filter((p) => p.outcome === "optimal");
  const negative = patterns.filter((p) => p.outcome === "loose" || p.outcome === "constipated");

  /* ── Bristol distribution (all-time) ── */
  const stoolDist = BRISTOL_TYPES.map((t) => ({
    name: `T${t}`,
    count: logs.filter((l) => l.type === "stool" && (l as StoolLog).bristol === t).length,
    fill: BRISTOL[t].color,
  }));
  const totalStools = stoolDist.reduce((s, d) => s + d.count, 0);

  /* ── 2-week trend state ── */
  const [trendView, setTrendView] = useState<TrendView>("stool");

  const days = useMemo(() => getLast14Days(), []);
  const cutoff = useMemo(() => Date.now() - 14 * 24 * 60 * 60 * 1000, []);

  /* ── Food trend data ── */
  const foodChartData = useMemo(() => {
    const meals = logs.filter((l) => l.type === "meal" && l.timestamp >= cutoff) as MealLog[];
    return days.map(({ label, dateKey: dk }) => {
      const row: Record<string, number | string> = { label };
      for (const slot of MEAL_KEYS) {
        row[slot] = meals
          .filter((l) => dateKey(l.timestamp) === dk && getMealSlot(l.timestamp) === slot)
          .reduce((s, l) => s + mealCals(l), 0);
      }
      return row;
    });
  }, [logs, cutoff, days]);

  const presentMealSlots = useMemo(
    () => MEAL_KEYS.filter((s) => foodChartData.some((d) => (d[s] as number) > 0)),
    [foodChartData]
  );

  /* ── Activity trend data ── */
  const { activityChartData, presentActivities } = useMemo(() => {
    const exercises = logs.filter(
      (l) => l.type === "exercise" && l.timestamp >= cutoff
    ) as ExerciseLog[];

    // Collect unique activity names in the window
    const activityNames = Array.from(new Set(exercises.map((l) => l.activity)));

    const data = days.map(({ label, dateKey: dk }) => {
      const row: Record<string, number | string> = { label };
      for (const act of activityNames) {
        row[act] = exercises
          .filter((l) => dateKey(l.timestamp) === dk && l.activity === act)
          .reduce((s, l) => s + (l.caloriesBurned ?? 0), 0);
      }
      return row;
    });

    const present = activityNames.filter((a) => data.some((d) => (d[a] as number) > 0));
    return { activityChartData: data, presentActivities: present };
  }, [logs, cutoff, days]);

  /* ── Stool trend data ── */
  const { stoolChartData, presentBristolTypes } = useMemo(() => {
    const stools = logs.filter(
      (l) => l.type === "stool" && l.timestamp >= cutoff
    ) as StoolLog[];

    const data = days.map(({ label, dateKey: dk }) => {
      const row: Record<string, number | string> = { label };
      for (const t of BRISTOL_TYPES) {
        row[`Type ${t}`] = stools.filter(
          (l) => dateKey(l.timestamp) === dk && l.bristol === t
        ).length;
      }
      return row;
    });

    const present = BRISTOL_TYPES.filter((t) =>
      data.some((d) => (d[`Type ${t}`] as number) > 0)
    );
    return { stoolChartData: data, presentBristolTypes: present };
  }, [logs, cutoff, days]);

  /* ── Legend items per view ── */
  const legendItems = useMemo(() => {
    if (trendView === "food")
      return presentMealSlots.map((s) => ({ label: s, color: MEAL_COLORS[s] }));
    if (trendView === "activity")
      return presentActivities.map((a, i) => ({ label: a, color: activityColor(a, i) }));
    return presentBristolTypes.map((t) => ({
      label: `Type ${t}`,
      color: BRISTOL[t].color,
    }));
  }, [trendView, presentMealSlots, presentActivities, presentBristolTypes]);

  const hasData = useMemo(() => {
    if (trendView === "food") return presentMealSlots.length > 0;
    if (trendView === "activity") return presentActivities.length > 0;
    return presentBristolTypes.length > 0;
  }, [trendView, presentMealSlots, presentActivities, presentBristolTypes]);

  const yUnit = trendView === "stool" ? "" : " kcal";

  /* ── Chart bars renderer ── */
  function renderBars() {
    if (trendView === "food") {
      return presentMealSlots.map((slot) => (
        <Bar key={slot} dataKey={slot} stackId="a" fill={MEAL_COLORS[slot]} />
      ));
    }
    if (trendView === "activity") {
      return presentActivities.map((act, i) => (
        <Bar key={act} dataKey={act} stackId="a" fill={activityColor(act, i)} />
      ));
    }
    return presentBristolTypes.map((t) => (
      <Bar key={t} dataKey={`Type ${t}`} stackId="a" fill={BRISTOL[t].color} />
    ));
  }

  const chartData =
    trendView === "food"
      ? foodChartData
      : trendView === "activity"
      ? activityChartData
      : stoolChartData;

  return (
    <div className="space-y-6">
      {/* ── Bristol distribution (all-time) ── */}
      <div className="bg-white rounded-3xl border border-[#e8eaed] p-5">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-5 h-5 text-[#4285F4]" />
          <h3 className="text-[#202124]">Bristol distribution</h3>
        </div>
        {totalStools === 0 ? (
          <p className="text-sm text-[#5f6368] py-6 text-center">
            Log a few stools to see your distribution.
          </p>
        ) : (
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stoolDist}>
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 12, fill: "#5f6368" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: "#5f6368" }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip cursor={{ fill: "#f1f3f4" }} />
                <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                  {stoolDist.map((entry, i) => (
                    <Cell key={`cell-${i}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* ── 2-Week Trend ── */}
      <div className="bg-white rounded-3xl border border-[#e8eaed] p-5">
        <div className="flex items-center gap-2 mb-4">
          <CalendarDays className="w-5 h-5 text-[#FF8F00]" />
          <h3 className="text-[#202124]">2-Week Trend</h3>
        </div>

        {/* Toggle */}
        <div className="flex bg-[#f1f3f4] rounded-xl p-0.5 mb-4">
          {(["food", "activity", "stool"] as TrendView[]).map((v) => (
            <button
              key={v}
              onClick={() => setTrendView(v)}
              className={`flex-1 text-sm py-1.5 rounded-[10px] font-medium transition-all ${
                trendView === v
                  ? "bg-white text-[#202124] shadow-sm"
                  : "text-[#5f6368]"
              }`}
            >
              {v === "food" ? "Food" : v === "activity" ? "Activity" : "Stool"}
            </button>
          ))}
        </div>

        {/* View label */}
        <p className="text-xs text-[#9aa0a6] mb-3">
          {trendView === "food"
            ? "Daily calories consumed — last 14 days"
            : trendView === "activity"
            ? "Daily calories burned — last 14 days"
            : "Daily stool count — last 14 days"}
        </p>

        {!hasData ? (
          <p className="text-sm text-[#5f6368] py-6 text-center">
            {trendView === "food"
              ? "No meals logged in the last 2 weeks."
              : trendView === "activity"
              ? "No activities logged in the last 2 weeks."
              : "No stools logged in the last 2 weeks."}
          </p>
        ) : (
          <>
            <div className="overflow-x-auto -mx-1">
              <div style={{ minWidth: 520 }} className="px-1">
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart
                    data={chartData}
                    margin={{ top: 4, right: 4, left: -18, bottom: 0 }}
                    barCategoryGap="25%"
                  >
                    <XAxis
                      dataKey="label"
                      tick={{ fontSize: 10, fill: "#9aa0a6" }}
                      axisLine={false}
                      tickLine={false}
                      interval={0}
                    />
                    <YAxis
                      tick={{ fontSize: 10, fill: "#9aa0a6" }}
                      axisLine={false}
                      tickLine={false}
                      allowDecimals={false}
                      width={40}
                    />
                    <Tooltip
                      cursor={{ fill: "#f1f3f4" }}
                      content={<CustomTooltip unit={yUnit} />}
                    />
                    {renderBars()}
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <LegendStrip items={legendItems} />
          </>
        )}
      </div>

      {/* ── Helpful patterns ── */}
      <div className="bg-white rounded-3xl border border-[#e8eaed] p-5">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-5 h-5 text-[#34A853]" />
          <h3 className="text-[#202124]">Helpful patterns</h3>
        </div>
        {positive.length === 0 ? (
          <p className="text-sm text-[#5f6368]">
            No strong helpful patterns yet (need ≥5 occurrences and 1.5× lift).
          </p>
        ) : (
          <div className="space-y-2">
            {positive.map((p) => (
              <InsightRow key={p.tag + p.outcome} text={p.message} tone="green" />
            ))}
          </div>
        )}
      </div>

      {/* ── Patterns to watch ── */}
      <div className="bg-white rounded-3xl border border-[#e8eaed] p-5">
        <div className="flex items-center gap-2 mb-3">
          <AlertCircle className="w-5 h-5 text-[#EA4335]" />
          <h3 className="text-[#202124]">Patterns to watch</h3>
        </div>
        {negative.length === 0 ? (
          <p className="text-sm text-[#5f6368]">No patterns flagged. Keep logging.</p>
        ) : (
          <div className="space-y-2">
            {negative.map((p) => (
              <InsightRow key={p.tag + p.outcome} text={p.message} tone="red" />
            ))}
          </div>
        )}
      </div>

      <p className="text-xs text-[#9aa0a6] text-center px-4">
        Insights are correlations from your own logs, not medical advice.
      </p>
    </div>
  );
}

function InsightRow({ text, tone }: { text: string; tone: "green" | "red" }) {
  const bg =
    tone === "green" ? "bg-[#e6f4ea] text-[#137333]" : "bg-[#fce8e6] text-[#a50e0e]";
  return (
    <div className={`rounded-xl px-3 py-2 text-sm ${bg} whitespace-pre-line`}>{text}</div>
  );
}
