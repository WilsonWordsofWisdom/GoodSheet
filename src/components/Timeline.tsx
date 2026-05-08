"use client";
import { Utensils, Activity, Droplet, Trash2 } from "lucide-react";
import type { AnyLog } from "@/lib/types";
import { BRISTOL } from "@/lib/bristol";

interface Props {
  logs: AnyLog[];
  onDelete: (id: string) => void;
}

export function Timeline({ logs, onDelete }: Props) {
  if (logs.length === 0) {
    return (
      <div className="text-center py-12 text-[#5f6368]">
        <p>No entries yet.</p>
        <p className="text-sm mt-1">Tap the + button to log your first meal, activity, or stool.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {logs.map((l) => (
        <div key={l.id} className="bg-white rounded-2xl border border-[#e8eaed] p-4 flex gap-3">
          <Icon log={l} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <span className="text-[#202124] capitalize">{labelFor(l)}</span>
              <span className="text-xs text-[#5f6368]">{formatTime(l.timestamp)}</span>
            </div>
            <Body log={l} />
          </div>
          <button
            onClick={() => onDelete(l.id)}
            className="self-start p-1.5 rounded-full text-[#9aa0a6] hover:bg-[#f1f3f4] hover:text-[#EA4335]"
            aria-label="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}

function Icon({ log }: { log: AnyLog }) {
  const cls = "w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-white";
  if (log.type === "meal") return <div className={cls} style={{ backgroundColor: "#FBBC05" }}><Utensils className="w-5 h-5" /></div>;
  if (log.type === "exercise") return <div className={cls} style={{ backgroundColor: "#34A853" }}><Activity className="w-5 h-5" /></div>;
  return <div className={cls} style={{ backgroundColor: BRISTOL[log.bristol].color }}><Droplet className="w-5 h-5" /></div>;
}

function labelFor(l: AnyLog) {
  if (l.type === "meal") return l.foodName ?? "Meal";
  if (l.type === "exercise") return l.activity;
  return BRISTOL[l.bristol].label;
}

function Body({ log }: { log: AnyLog }) {
  if (log.type === "meal") {
    return (
      <div className="mt-1 text-sm text-[#5f6368]">
        {log.cuisine && <div className="text-xs">{log.cuisine}</div>}
        {log.tags.length > 0 && <div>{log.tags.map((t) => "#" + t).join(" ")}</div>}
        {log.caloriesMin != null && (
          <div className="text-xs mt-0.5">~{log.caloriesMin}–{log.caloriesMax} kcal</div>
        )}
        {log.note && <div className="text-xs mt-0.5 italic">{log.note}</div>}
      </div>
    );
  }
  if (log.type === "exercise") {
    return (
      <div className="mt-1 text-sm text-[#5f6368]">
        {log.durationMin} min · {log.intensity} intensity
        {log.note && <div className="text-xs mt-0.5 italic">{log.note}</div>}
      </div>
    );
  }
  return (
    <div className="mt-1 text-sm text-[#5f6368]">
      {BRISTOL[log.bristol].description}
      <div className="text-xs mt-0.5">urgency: {log.urgency} · ease: {log.ease}</div>
      {log.note && <div className="text-xs mt-0.5 italic">{log.note}</div>}
    </div>
  );
}

function formatTime(ts: number) {
  const d = new Date(ts);
  const now = new Date();
  const sameDay = d.toDateString() === now.toDateString();
  return sameDay
    ? d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : d.toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}
