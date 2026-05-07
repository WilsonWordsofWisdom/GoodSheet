"use client";
import { useState } from "react";
import { X, Plus } from "lucide-react";

interface Props {
  value: string[];
  onChange: (tags: string[]) => void;
  suggestions?: string[];
  placeholder?: string;
}

const DEFAULT_SUGGESTIONS = [
  "Breakfast", "Lunch", "Dinner", "Snack",
  "Spicy", "HighFiber", "LowFiber", "Dairy",
  "Gluten", "Caffeine", "Alcohol", "Sugar",
  "Fried", "Oats", "Veg", "Fruit", "Meat", "Fish",
];

export function QuickChips({ value, onChange, suggestions = DEFAULT_SUGGESTIONS, placeholder = "Add tag" }: Props) {
  const [input, setInput] = useState("");

  const add = (tag: string) => {
    const clean = tag.trim().replace(/^#/, "");
    if (!clean) return;
    if (value.includes(clean)) return;
    onChange([...value, clean]);
    setInput("");
  };

  const remove = (tag: string) => onChange(value.filter((t) => t !== tag));

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {value.map((t) => (
          <span
            key={t}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#e8f0fe] text-[#1967d2] text-sm"
          >
            #{t}
            <button type="button" onClick={() => remove(t)} className="hover:bg-[#d2e3fc] rounded-full p-0.5">
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add(input);
            }
          }}
          placeholder={placeholder}
          className="flex-1 px-3 py-2 rounded-full border border-[#dadce0] bg-white text-sm focus:outline-none focus:border-[#4285F4]"
        />
        <button
          type="button"
          onClick={() => add(input)}
          className="px-3 py-2 rounded-full bg-[#4285F4] text-white text-sm flex items-center gap-1"
        >
          <Plus className="w-4 h-4" />
          Add
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {suggestions
          .filter((s) => !value.includes(s))
          .slice(0, 12)
          .map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => add(s)}
              className="px-3 py-1.5 rounded-full border border-[#dadce0] bg-white text-sm text-[#5f6368] hover:bg-[#f8f9fa]"
            >
              #{s}
            </button>
          ))}
      </div>
    </div>
  );
}
