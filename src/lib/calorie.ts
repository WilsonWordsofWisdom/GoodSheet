const TAG_KCAL: Record<string, [number, number]> = {
  breakfast: [300, 600],
  lunch: [500, 800],
  dinner: [500, 900],
  snack: [100, 300],
  oats: [250, 400],
  spicy: [400, 700],
  highfiber: [350, 600],
  lowfiber: [400, 700],
  dairy: [200, 500],
  gluten: [400, 700],
  caffeine: [5, 80],
  alcohol: [150, 400],
  sugar: [200, 500],
  fried: [500, 900],
  veg: [100, 250],
  fruit: [80, 200],
  meat: [400, 700],
  fish: [300, 500],
};

export function estimateCalories(tags: string[]): { min: number; max: number } | null {
  if (!tags.length) return null;
  let min = 0;
  let max = 0;
  let matched = 0;
  for (const t of tags) {
    const range = TAG_KCAL[t.toLowerCase()];
    if (range) {
      min += range[0];
      max += range[1];
      matched++;
    }
  }
  if (matched === 0) return null;
  // Average instead of stack for multiple meal tags
  if (matched > 1) {
    min = Math.round(min / Math.max(1, matched - 1));
    max = Math.round(max / Math.max(1, matched - 1));
  }
  return { min, max };
}
