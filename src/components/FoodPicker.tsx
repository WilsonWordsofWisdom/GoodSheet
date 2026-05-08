"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { Search, X, ChevronDown } from "lucide-react";
import { FOODS, searchFoods, type FoodItem } from "@/lib/foods";

interface Props {
  value: FoodItem | null;
  onChange: (food: FoodItem | null) => void;
}

export function FoodPicker({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  const cuisines = useMemo(() => {
    const set = new Set<string>();
    for (const f of FOODS) set.add(f.cuisine);
    return Array.from(set);
  }, []);

  const results = useMemo(() => searchFoods(query, 80), [query]);

  const grouped = useMemo(() => {
    const map = new Map<string, FoodItem[]>();
    for (const f of results) {
      const arr = map.get(f.cuisine) ?? [];
      arr.push(f);
      map.set(f.cuisine, arr);
    }
    return Array.from(map.entries());
  }, [results]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div className="space-y-2" ref={containerRef}>
      <label>Food name</label>

      {value ? (
        <div className="flex items-center justify-between bg-[#e8f0fe] border border-[#4285F4] rounded-2xl px-3 py-2.5">
          <div className="min-w-0">
            <div className="text-[#1967d2] truncate">{value.name}</div>
            <div className="text-xs text-[#5f6368]">{value.cuisine} · ~{value.kcalMin}–{value.kcalMax} kcal</div>
          </div>
          <button onClick={() => onChange(null)} className="p-1 rounded-full hover:bg-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="w-full flex items-center justify-between px-3 py-2.5 rounded-2xl border border-[#dadce0] bg-white text-[#5f6368] hover:bg-[#f8f9fa]"
        >
          <span className="flex items-center gap-2 text-sm">
            <Search className="w-4 h-4" />
            Search foods (Singaporean, Chinese, Indian, Western…)
          </span>
          <ChevronDown className="w-4 h-4" />
        </button>
      )}

      {open && (
        <div className="rounded-2xl border border-[#dadce0] bg-white shadow-lg overflow-hidden">
          <div className="p-2 border-b border-[#e8eaed] flex items-center gap-2">
            <Search className="w-4 h-4 text-[#5f6368] ml-1" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Type a dish or cuisine…"
              className="flex-1 px-1 py-1 text-sm focus:outline-none"
            />
            {query && (
              <button onClick={() => setQuery("")} className="p-1 rounded-full hover:bg-[#f1f3f4]">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {!query && (
            <div className="px-3 py-2 flex flex-wrap gap-1.5 border-b border-[#e8eaed]">
              {cuisines.map((c) => (
                <button
                  key={c}
                  onClick={() => setQuery(c)}
                  className="px-2.5 py-1 rounded-full text-xs bg-[#f1f3f4] text-[#5f6368] hover:bg-[#e8eaed]"
                >
                  {c}
                </button>
              ))}
            </div>
          )}

          <div className="max-h-64 overflow-y-auto">
            {grouped.length === 0 && (
              <div className="px-4 py-6 text-center text-sm text-[#5f6368]">No matches.</div>
            )}
            {grouped.map(([cuisine, items]) => (
              <div key={cuisine}>
                <div className="sticky top-0 bg-[#f8f9fa] px-3 py-1 text-xs uppercase tracking-wide text-[#5f6368]">
                  {cuisine}
                </div>
                {items.map((f) => (
                  <button
                    key={f.name}
                    onClick={() => {
                      onChange(f);
                      setOpen(false);
                      setQuery("");
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-[#f8f9fa] flex items-center justify-between"
                  >
                    <span className="text-sm text-[#202124]">{f.name}</span>
                    <span className="text-xs text-[#5f6368]">~{f.kcalMin}–{f.kcalMax}</span>
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
