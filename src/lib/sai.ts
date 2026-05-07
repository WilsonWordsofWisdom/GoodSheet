import type { AnyLog, MealLog, StoolLog } from "./types";
import { findPatterns, fiberToday, recentExerciseCount, gutScore } from "./correlation";

const HOUR = 3600 * 1000;

export interface SaiMessage {
  id: string;
  role: "sai" | "user";
  text: string;
  timestamp: number;
  chips?: string[];
}

export function saiGreeting(logs: AnyLog[]): SaiMessage {
  const score = gutScore(logs);
  const hr = new Date().getHours();
  const greet = hr < 12 ? "Good morning" : hr < 18 ? "Good afternoon" : "Good evening";
  const scoreText =
    score === 0
      ? "I don't have enough data yet — log a few stools this week and I can start spotting patterns."
      : `Your 7-day Gut Score is ${score}.`;
  return {
    id: crypto.randomUUID(),
    role: "sai",
    timestamp: Date.now(),
    text: `${greet}. ${scoreText} How can I help?`,
    chips: [
      "What should I avoid?",
      "Gut health food tips",
      "How to poop smoothly?",
      "Exercises for bowels",
    ],
  };
}

export function saiReply(input: string, logs: AnyLog[]): SaiMessage {
  const q = input.toLowerCase();
  const now = Date.now();

  if (/eat|food|recommend|suggest/.test(q)) {
    const fiber = fiberToday(logs);
    const patterns = findPatterns(logs);
    const positive = patterns.filter((p) => p.outcome === "optimal").slice(0, 2);
    const avoid = patterns.filter((p) => p.outcome === "loose").slice(0, 2);

    const parts: string[] = [];
    if (fiber < 2) {
      parts.push("Fiber looks low today — consider lentils, oats, berries, or leafy greens.");
    } else {
      parts.push("Fiber looks on track today.");
    }
    if (positive.length) {
      parts.push(`Tags that pattern with your best days: ${positive.map((p) => "#" + p.tag).join(", ")}.`);
    }
    if (avoid.length) {
      parts.push(`Tags to keep an eye on: ${avoid.map((p) => "#" + p.tag).join(", ")}.`);
    }
    parts.push("These are patterns from your own logs, not medical advice.");
    return msg(parts.join(" "));
  }

  if (/remind|reminder|nudge/.test(q)) {
    return msg(
      "I'll nudge you at meal times and at the end of the day to log. (Reminders run while the app is open in MVP.)",
      ["Set quiet hours", "Disable reminders"]
    );
  }

  if (/pattern|insight|trend/.test(q)) {
    const patterns = findPatterns(logs);
    if (!patterns.length) {
      return msg(
        "No strong patterns yet — I need at least 5 co-occurrences with a 1.5× lift before I'll surface anything. Keep logging."
      );
    }
    const top = patterns.slice(0, 3).map((p) => "• " + p.message).join("\n");
    return msg("Here's what I see:\n" + top);
  }

  if (/score|gut score/.test(q)) {
    return msg(`Your 7-day Gut Score is ${gutScore(logs)}. It tracks how often your stools fall in the optimal Type 3–5 range.`);
  }

  if (/transit|how long/.test(q)) {
    const lastStool = logs.find((l): l is StoolLog => l.type === "stool");
    if (!lastStool) return msg("Log a stool first and I can estimate transit time from your last meal.");
    const lastMeal = logs.find(
      (l): l is MealLog => l.type === "meal" && l.timestamp < lastStool.timestamp
    );
    if (!lastMeal) return msg("I don't see a meal logged before your last stool.");
    const hrs = Math.round((lastStool.timestamp - lastMeal.timestamp) / HOUR);
    return msg(`Approx ${hrs}h transit from your last meal to your last stool.`);
  }

  // 1) Food to avoid
  if (/avoid|bad food|harmful food|triggers/.test(q)) {
    return msg(
      "To keep things moving smoothly, try to minimize:\n• Highly processed snacks (low fiber)\n• Excessive red meat (can slow transit)\n• Large amounts of dairy (for some)\n• Fried, greasy foods\n\nCheck your 'Insights' tab to see which specific tags I've flagged as triggers for you!",
      ["What should I eat?", "Show my patterns"]
    );
  }

  // 2) Good food for gut health
  if (/good food|gut health food|recommend food|fiber food/.test(q)) {
    return msg(
      "For a happy gut, aim for:\n• Probiotics: Kimchi, Yogurt, Tempeh\n• Soluble Fiber: Oats, beans, apples\n• Insoluble Fiber: Whole grains, nuts, cauliflower\n• Hydration: Water is key for fiber to work!\n\nPro-tip: Try more Singaporean 'Local' options like Brown Rice or extra kailan.",
      ["How to poop smoothly?", "Exercise for bowels"]
    );
  }

  // 3) Poop smoothly
  if (/smooth|constipat|hard poop|difficult|water/.test(q)) {
    return msg(
      "To help things pass smoothly:\n• Hydrate: Aim for 2-3L of water daily.\n• Fiber: Gradually increase your fiber intake.\n• Position: Try using a small stool to elevate your feet (Squatty Potty style).\n• Routine: Go when you feel the urge; don't hold it in!",
      ["Exercise for bowels", "Good food for gut"]
    );
  }

  // 4) Exercises for bowels
  if (/exercise|movement|workout|activity|muscle/.test(q)) {
    return msg(
      "Movement is like a massage for your colon! Try:\n• Walking: A brisk 15-min walk after meals.\n• Core Work: Gentle twists or planks to engage abdominal muscles.\n• Yoga: Cat-Cow or Child's Pose help relax the digestive tract.\n• Cardio: Jogging or swimming to stimulate intestinal contractions.",
      ["Tips to poop smoothly", "What's my Gut Score?"]
    );
  }

  // 5) AI / classifier questions
  if (/ai|classifier|photo|image|camera|tensorflow|tf\.?js|classify|detect|scan/.test(q)) {
    return msg(
      "Circle of Life now has a built-in Bristol Stool Scale image classifier — and it runs 100% on your device using TensorFlow.js. Here's how it works:\n\n📸 Tap the Stool tab in the Logger, then hit 'Photo for AI Bristol Analysis'.\n🧠 TF.js extracts 4 visual features: brightness, edge density, color warmth, and texture variance.\n🔬 These are compared against calibrated prototypes for all 7 Bristol types.\n✅ The top suggestion is shown with a confidence %. Tap 'Apply' to pre-fill your Bristol picker.\n\nZero data leaves your device — no cloud API, no tracking.",
      ["How accurate is the AI?", "What's the Bristol Scale?"]
    );
  }

  if (/accurate|accuracy|how good|reliable|trust/.test(q)) {
    return msg(
      "The AI uses a color + texture heuristic — it's a scientifically-grounded starting point, not a clinical diagnostic. It works best when:\n• The photo is well-lit with a neutral background\n• The subject fills most of the frame\n\nIn practice it's most reliable at distinguishing hard (Types 1-2) from smooth (Type 4) from watery (Type 7). Types 3, 5, and 6 can be closer together visually.\n\nAlways verify with your own judgment — you know best!",
      ["How does the AI work?", "Show my patterns"]
    );
  }

  return msg(
    "I can suggest food for the day, set reminders, or summarize your patterns. What would you like?",
    ["What should I eat today?", "Show my patterns", "What's my Gut Score?"]
  );
}

function msg(text: string, chips?: string[]): SaiMessage {
  return { id: crypto.randomUUID(), role: "sai", timestamp: Date.now(), text, chips };
}

export function checkReminders(logs: AnyLog[], now = Date.now()): string[] {
  const out: string[] = [];
  const hr = new Date(now).getHours();
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);
  const todays = logs.filter((l) => l.timestamp >= todayStart.getTime());
  const meals = todays.filter((l) => l.type === "meal").length;
  const exercise = recentExerciseCount(logs, now);
  const stools = todays.filter((l) => l.type === "stool").length;
  const lastStool = logs.find((l): l is StoolLog => l.type === "stool");
  const hrsSinceLastPoop = lastStool ? (now - lastStool.timestamp) / HOUR : Infinity;

  if (hr >= 9 && hr < 11 && meals === 0) out.push("Haven't seen breakfast yet — want to log it?");
  if (hr >= 13 && hr < 15 && meals < 2) out.push("Lunch reminder — tap + to log.");
  if (hr >= 19 && exercise === 0) out.push("No activity logged today. Even a 10-min walk counts.");
  if (hr >= 21 && stools === 0) out.push("End-of-day check: did you log today's bowel movement?");
  
  if (hrsSinceLastPoop >= 18 && hrsSinceLastPoop < 48) {
    out.push("It's been over 18 hours since your last log. Maybe time to visit the toilet?");
  } else if (hrsSinceLastPoop >= 48) {
    out.push("No logs in 48 hours. Focus on hydration and fiber today!");
  }

  return out;
}