/**
 * Circle of Life – Local Food Image Classifier
 * -----------------------------------------------
 * Uses MobileNet V2 (pre-trained on ImageNet-1K, ~14 MB, downloaded once and
 * cached by the browser) via @tensorflow-models/mobilenet, running entirely
 * in-browser via TensorFlow.js WebGL / WASM backend.
 *
 * Architecture:
 *   1. Load MobileNet V2 lazily (one-time download, cached in browser storage)
 *   2. Run model.classify(img, topK=15) → ImageNet class names + probabilities
 *   3. Score every food in our database using a keyword mapping table
 *   4. Supplement with visual colour-feature analysis (HSV) as a fallback for
 *      Asian dishes that ImageNet doesn't have explicit classes for
 *   5. Normalise scores → confidence 0–1, return top-5 candidates
 *
 * Zero-cloud compliance:
 *   ✓ Food PHOTOS are NEVER sent off-device — inference is 100 % local
 *   ✓ Only model WEIGHTS are downloaded from TF Hub CDN (one-time, ~14 MB)
 *   ✓ All tensor operations run in WebGL / WASM sandbox
 *
 * Model reference:
 *   Sandler et al. (2018). MobileNetV2: Inverted Residuals and Linear
 *   Bottlenecks. CVPR 2018. https://arxiv.org/abs/1801.04381
 *
 * Dataset reference:
 *   Bossard et al. (2014). Food-101 – Mining Discriminative Components with
 *   Random Forests. ECCV 2014. https://data.vision.ee.ethz.ch/cvl/datasets_extra/food-101/
 */

import * as tf from "@tensorflow/tfjs";
import { FOODS, type FoodItem } from "./foods";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface FoodCandidate {
  food: FoodItem;
  confidence: number;     // 0–1
  matchedClass: string;   // ImageNet label or "colour analysis"
}

export interface FoodClassificationResult {
  topCandidate: FoodItem;
  confidence: number;
  candidates: FoodCandidate[];   // top-3
  imagenetPredictions: { className: string; probability: number }[];
  method: "mobilenet" | "colour-heuristic";
  processingMs: number;
}

export type FoodClassifyStatus = "idle" | "loading-model" | "analyzing" | "done" | "error";

// ─────────────────────────────────────────────────────────────────────────────
// MobileNet singleton  (lazy-loaded, cached after first download)
// ─────────────────────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _modelPromise: Promise<any> | null = null;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getMobileNet(): Promise<any> {
  if (!_modelPromise) {
    _modelPromise = (async () => {
      await tf.ready();
      const mn = await import("@tensorflow-models/mobilenet");
      return mn.load({ version: 2, alpha: 1.0 });
    })();
  }
  return _modelPromise;
}

/** Kick off model loading in the background (call when user opens Meal tab). */
export function preloadFoodClassifier(): void {
  getMobileNet().catch(() => { /* silently ignore – will retry on classify */ });
}

// ─────────────────────────────────────────────────────────────────────────────
// ImageNet class-name → food database keyword mapping
// Each entry: keywords matched (case-insensitive substring) against the
// ImageNet class name, food names to boost (must match FOODS[].name exactly),
// and an optional score multiplier.
// ─────────────────────────────────────────────────────────────────────────────

interface KeywordMapping {
  keywords: string[];
  foodNames: string[];
  mult?: number; // default 1.0
}

const KEYWORD_MAP: KeywordMapping[] = [
  // ── Fruits ────────────────────────────────────────────────────────────────
  { keywords: ["banana"],                             foodNames: ["Banana"],                                               mult: 3.0 },
  { keywords: ["granny smith", "apple"],              foodNames: ["Apple"],                                                mult: 3.0 },
  { keywords: ["orange", "clementine", "tangerine"],  foodNames: ["Orange"],                                               mult: 3.0 },
  { keywords: ["strawberry"],                         foodNames: ["Apple"],                                                mult: 1.5 },
  { keywords: ["pineapple", "ananas"],                foodNames: ["Mango"],                                                mult: 1.0 },
  { keywords: ["mango"],                              foodNames: ["Mango", "Mango Sticky Rice"],                           mult: 3.0 },
  { keywords: ["jackfruit", "custard apple"],         foodNames: ["Mango"],                                                mult: 1.0 },
  { keywords: ["fig"],                                foodNames: ["Apple"],                                                mult: 0.8 },
  { keywords: ["pomegranate"],                        foodNames: ["Apple"],                                                mult: 0.8 },
  { keywords: ["watermelon"],                         foodNames: ["Watermelon Slice"],                                     mult: 3.0 },

  // ── Pizza ─────────────────────────────────────────────────────────────────
  { keywords: ["pizza"],                              foodNames: ["Margherita Pizza", "Pepperoni Pizza"],                  mult: 3.0 },

  // ── Burgers / hot dogs / sandwiches ───────────────────────────────────────
  { keywords: ["cheeseburger", "hamburger"],          foodNames: ["Cheeseburger & Fries"],                                 mult: 3.0 },
  { keywords: ["hotdog", "hot dog", "corn dog"],      foodNames: ["Hot Dog"],                                              mult: 3.0 },
  { keywords: ["french fries", "french-fried"],       foodNames: ["Cheeseburger & Fries", "Fish & Chips"],                 mult: 2.5 },
  { keywords: ["burrito"],                            foodNames: ["Burrito"],                                              mult: 3.0 },
  { keywords: ["taco"],                               foodNames: ["Tacos (3 pieces)"],                                     mult: 3.0 },
  { keywords: ["sandwich"],                           foodNames: ["BLT Sandwich", "Club Sandwich", "Banh Mi"],             mult: 2.0 },
  { keywords: ["guacamole", "avocado"],               foodNames: ["Avocado Toast"],                                        mult: 2.5 },

  // ── Pasta / Italian ───────────────────────────────────────────────────────
  { keywords: ["carbonara"],                          foodNames: ["Spaghetti Carbonara"],                                  mult: 3.0 },
  { keywords: ["lasagna"],                            foodNames: ["Lasagna"],                                              mult: 3.0 },
  { keywords: ["spaghetti", "pasta", "noodle"],       foodNames: ["Spaghetti Carbonara", "Bolognese Pasta", "Pesto Pasta"], mult: 1.5 },
  { keywords: ["bolognese"],                          foodNames: ["Bolognese Pasta"],                                      mult: 3.0 },
  { keywords: ["risotto"],                            foodNames: ["Risotto"],                                              mult: 3.0 },
  { keywords: ["mac", "macaroni"],                    foodNames: ["Mac & Cheese"],                                         mult: 2.5 },
  { keywords: ["tiramisu"],                           foodNames: ["Tiramisu"],                                             mult: 3.0 },
  { keywords: ["minestrone"],                         foodNames: ["Minestrone"],                                           mult: 3.0 },

  // ── Japanese ──────────────────────────────────────────────────────────────
  { keywords: ["sushi"],                              foodNames: ["Sushi Set (10 pieces)", "Salmon Sashimi (8 pieces)"],   mult: 3.0 },
  { keywords: ["sashimi"],                            foodNames: ["Salmon Sashimi (8 pieces)"],                            mult: 3.0 },
  { keywords: ["ramen"],                              foodNames: ["Tonkotsu Ramen"],                                       mult: 3.0 },
  { keywords: ["miso"],                               foodNames: ["Miso Soup"],                                            mult: 3.0 },
  { keywords: ["edamame"],                            foodNames: ["Edamame"],                                              mult: 3.0 },
  { keywords: ["gyoza", "dumpling", "wonton"],        foodNames: ["Gyoza (6 pieces)", "Dumplings (8 pieces)", "Xiao Long Bao (6 pieces)"], mult: 2.5 },
  { keywords: ["takoyaki"],                           foodNames: ["Takoyaki (6 pieces)"],                                  mult: 3.0 },
  { keywords: ["tempura"],                            foodNames: ["Tempura Udon"],                                         mult: 2.5 },
  { keywords: ["katsu", "tonkatsu"],                  foodNames: ["Tonkatsu", "Chicken Katsu Curry"],                      mult: 2.5 },
  { keywords: ["donburi", "rice bowl"],               foodNames: ["Beef Donburi"],                                         mult: 2.0 },
  { keywords: ["onigiri"],                            foodNames: ["Onigiri"],                                              mult: 3.0 },

  // ── Korean ────────────────────────────────────────────────────────────────
  { keywords: ["bibimbap"],                           foodNames: ["Bibimbap"],                                             mult: 3.0 },
  { keywords: ["kimchi"],                             foodNames: ["Kimchi Stew"],                                          mult: 3.0 },
  { keywords: ["tteokbokki"],                         foodNames: ["Tteokbokki"],                                           mult: 3.0 },
  { keywords: ["bulgogi"],                            foodNames: ["Bulgogi", "Korean BBQ (per serving)"],                  mult: 3.0 },
  { keywords: ["japchae"],                            foodNames: ["Japchae"],                                              mult: 3.0 },

  // ── Thai ──────────────────────────────────────────────────────────────────
  { keywords: ["pad thai"],                           foodNames: ["Pad Thai"],                                             mult: 3.0 },
  { keywords: ["tom yum"],                            foodNames: ["Tom Yum Soup"],                                         mult: 3.0 },

  // ── Indian ────────────────────────────────────────────────────────────────
  { keywords: ["biryani"],                            foodNames: ["Chicken Biryani"],                                      mult: 3.0 },
  { keywords: ["curry"],                              foodNames: ["Fish Curry", "Butter Chicken with Naan", "Green Curry", "Chicken Katsu Curry"], mult: 2.0 },
  { keywords: ["samosa"],                             foodNames: ["Samosa (2 pieces)"],                                    mult: 3.0 },
  { keywords: ["dosa", "masala dosa"],                foodNames: ["Masala Dosa"],                                          mult: 3.0 },
  { keywords: ["naan", "roti", "flatbread", "prata"], foodNames: ["Roti Prata", "Roti Canai", "Butter Chicken with Naan"], mult: 2.0 },
  { keywords: ["dal", "lentil"],                      foodNames: ["Dal Tadka", "Chana Masala"],                            mult: 2.5 },
  { keywords: ["palak", "paneer", "spinach"],         foodNames: ["Palak Paneer"],                                         mult: 2.5 },
  { keywords: ["tandoori"],                           foodNames: ["Tandoori Chicken"],                                     mult: 3.0 },

  // ── Soup / Hot pot ────────────────────────────────────────────────────────
  { keywords: ["hot pot", "hotpot"],                  foodNames: ["Hot Pot (per serving)"],                                mult: 3.0 },
  { keywords: ["consomme", "broth", "soup"],          foodNames: ["Wonton Soup", "Tom Yum Soup", "Bak Kut Teh", "Miso Soup"], mult: 1.0 },
  { keywords: ["pho"],                                foodNames: ["Pho (Beef)"],                                           mult: 3.0 },

  // ── Rice ──────────────────────────────────────────────────────────────────
  { keywords: ["fried rice"],                         foodNames: ["Fried Rice", "Char Siu Rice"],                          mult: 2.5 },
  { keywords: ["rice"],                               foodNames: ["Chicken Rice", "Fried Rice", "Chicken Biryani", "Hainanese Porridge"], mult: 0.8 },
  { keywords: ["congee", "porridge", "oatmeal"],      foodNames: ["Congee", "Oatmeal Bowl", "Hainanese Porridge"],         mult: 2.0 },

  // ── Chinese specific ──────────────────────────────────────────────────────
  { keywords: ["dim sum", "baozi", "bao"],            foodNames: ["Dim Sum (4 pieces)", "Char Siu Bao (3 pieces)"],        mult: 2.5 },
  { keywords: ["spring roll", "egg roll"],            foodNames: ["Spring Roll (2 pieces)", "Goi Cuon (Fresh Spring Roll)"], mult: 3.0 },
  { keywords: ["peking duck", "duck"],                foodNames: ["Peking Duck"],                                          mult: 2.5 },
  { keywords: ["sweet.*sour", "sweet and sour"],      foodNames: ["Sweet & Sour Pork"],                                    mult: 2.5 },
  { keywords: ["kung pao"],                           foodNames: ["Kung Pao Chicken"],                                     mult: 3.0 },
  { keywords: ["mapo"],                               foodNames: ["Mapo Tofu", "Mapo Eggplant"],                           mult: 3.0 },

  // ── Steak / Meat ──────────────────────────────────────────────────────────
  { keywords: ["steak", "sirloin", "rib eye", "filet mignon", "prime rib"], foodNames: ["Steak (8oz)"],                   mult: 3.0 },
  { keywords: ["meat loaf", "meatloaf"],              foodNames: ["Roast Chicken Dinner"],                                 mult: 1.0 },
  { keywords: ["satay", "skewer", "kebab"],           foodNames: ["Satay (10 sticks)"],                                    mult: 2.5 },
  { keywords: ["chicken"],                            foodNames: ["Grilled Chicken Breast", "Roast Chicken Dinner", "Korean Fried Chicken", "Karaage Chicken"], mult: 0.8 },
  { keywords: ["pork"],                               foodNames: ["Char Siu Rice", "Bak Kut Teh", "Sweet & Sour Pork"],    mult: 1.0 },

  // ── Fish / Seafood ────────────────────────────────────────────────────────
  { keywords: ["salmon"],                             foodNames: ["Grilled Salmon", "Salmon Sashimi (8 pieces)"],          mult: 2.5 },
  { keywords: ["fish"],                               foodNames: ["Fish & Chips", "Fish Curry", "Fish Ball Noodles"],       mult: 1.0 },
  { keywords: ["shrimp", "prawn"],                    foodNames: ["Prawn Mee (Hae Mee)", "Pad Thai"],                      mult: 2.0 },

  // ── Salad ─────────────────────────────────────────────────────────────────
  { keywords: ["caesar salad"],                       foodNames: ["Caesar Salad"],                                         mult: 3.0 },
  { keywords: ["greek salad"],                        foodNames: ["Greek Salad"],                                          mult: 3.0 },
  { keywords: ["salad", "lettuce"],                   foodNames: ["Caesar Salad", "Greek Salad", "Gado Gado", "Som Tum (Papaya Salad)"], mult: 1.5 },

  // ── Eggs / Breakfast ──────────────────────────────────────────────────────
  { keywords: ["egg", "omelette", "benedict"],        foodNames: ["Scrambled Eggs", "Oyster Omelette (Orh Luak)"],         mult: 1.5 },
  { keywords: ["waffle"],                             foodNames: ["Waffles"],                                              mult: 3.0 },
  { keywords: ["pancake"],                            foodNames: ["Pancakes (Stack of 3)"],                                mult: 3.0 },
  { keywords: ["french toast"],                       foodNames: ["French Toast"],                                         mult: 3.0 },

  // ── Bread / Toast ─────────────────────────────────────────────────────────
  { keywords: ["bagel"],                              foodNames: ["Kaya Toast Set", "Avocado Toast"],                      mult: 1.5 },
  { keywords: ["pretzel"],                            foodNames: ["Kaya Toast Set"],                                       mult: 1.0 },
  { keywords: ["french loaf", "baguette"],            foodNames: ["Banh Mi", "BLT Sandwich"],                              mult: 1.5 },
  { keywords: ["toast"],                              foodNames: ["Kaya Toast Set", "Avocado Toast", "French Toast"],       mult: 1.5 },

  // ── Desserts ──────────────────────────────────────────────────────────────
  { keywords: ["ice cream", "icecream", "ice lolly"], foodNames: ["Ice Cream (1 scoop)"],                                  mult: 3.0 },
  { keywords: ["donut", "doughnut"],                  foodNames: ["Donut"],                                                mult: 3.0 },
  { keywords: ["chocolate", "chocolate cake", "cupcake", "trifle"], foodNames: ["Chocolate Cake"],                         mult: 2.0 },
  { keywords: ["cheesecake"],                         foodNames: ["Cheesecake"],                                           mult: 3.0 },
  { keywords: ["tiramisu"],                           foodNames: ["Tiramisu"],                                             mult: 3.0 },
  { keywords: ["mango sticky rice"],                  foodNames: ["Mango Sticky Rice"],                                    mult: 3.0 },

  // ── Drinks ────────────────────────────────────────────────────────────────
  { keywords: ["espresso", "coffee"],                 foodNames: ["Black Coffee", "Iced Latte"],                           mult: 2.5 },
  { keywords: ["matcha"],                             foodNames: ["Matcha Latte"],                                         mult: 3.0 },
  { keywords: ["wine bottle", "wine glass", "red wine", "white wine"], foodNames: ["Glass of Wine"],                        mult: 3.0 },
  { keywords: ["beer bottle", "beer glass"],          foodNames: ["Beer (1 pint)"],                                        mult: 3.0 },
  { keywords: ["bubble", "boba", "milk tea"],         foodNames: ["Bubble Tea"],                                           mult: 3.0 },
  { keywords: ["cup", "teacup", "mug", "pitcher"],    foodNames: ["Black Coffee", "Iced Latte", "Bubble Tea"],             mult: 0.5 },

  // ── Misc ──────────────────────────────────────────────────────────────────
  { keywords: ["yogurt", "yoghurt"],                  foodNames: ["Greek Yogurt"],                                         mult: 3.0 },
  { keywords: ["nut", "almond", "cashew", "peanut"],  foodNames: ["Mixed Nuts (handful)"],                                 mult: 2.0 },
  { keywords: ["mashed potato", "potato"],            foodNames: ["Cheeseburger & Fries", "Roast Chicken Dinner"],          mult: 1.0 },
  { keywords: ["broccoli", "cauliflower"],            foodNames: ["Caesar Salad", "Dal Tadka"],                            mult: 0.6 },
  { keywords: ["mushroom"],                           foodNames: ["Risotto", "Hot Pot (per serving)"],                     mult: 0.8 },
  { keywords: ["wok", "frying pan"],                  foodNames: ["Char Kway Teow", "Fried Rice", "Mee Goreng"],           mult: 0.5 },
];

// ─────────────────────────────────────────────────────────────────────────────
// Score food database items against MobileNet predictions
// ─────────────────────────────────────────────────────────────────────────────

function scoreFromPredictions(
  predictions: { className: string; probability: number }[]
): FoodCandidate[] {
  const map = new Map<string, { score: number; matchedClass: string }>();

  for (const pred of predictions) {
    const label = pred.className.toLowerCase();

    for (const mapping of KEYWORD_MAP) {
      const hit = mapping.keywords.some((kw) => label.includes(kw));
      if (!hit) continue;

      const delta = pred.probability * (mapping.mult ?? 1.0);
      for (const fname of mapping.foodNames) {
        const existing = map.get(fname);
        if (!existing || existing.score < delta) {
          map.set(fname, { score: delta, matchedClass: pred.className });
        }
      }
    }
  }

  const candidates: FoodCandidate[] = [];
  for (const [name, { score, matchedClass }] of map.entries()) {
    const food = FOODS.find((f) => f.name === name);
    if (food) candidates.push({ food, confidence: score, matchedClass });
  }

  // Normalise to 0–1 relative to the top score
  const maxScore = candidates.reduce((m, c) => Math.max(m, c.confidence), 0);
  if (maxScore > 0) {
    for (const c of candidates) c.confidence = Math.min(1, c.confidence / maxScore);
  }

  return candidates.sort((a, b) => b.confidence - a.confidence).slice(0, 5);
}

// ─────────────────────────────────────────────────────────────────────────────
// Colour-feature analysis (TF.js) – heuristic fallback for Asian dishes
// Returns dominant colour descriptors in 0–1 range
// ─────────────────────────────────────────────────────────────────────────────

interface ColourFeatures {
  meanR: number; meanG: number; meanB: number;
  hue: number;          // 0–360 (HSV hue)
  saturation: number;   // 0–1
  brightness: number;   // 0–1 (HSV value)
  yellowness: number;   // warm yellow/orange → curry, egg, laksa
  greenness: number;    // green tones → salad, vegetables
  redness: number;      // red → spicy, tomato, kimchi
  paleness: number;     // pale/white → rice, porridge, soup
  deepBrown: number;    // dark rich brown → BBQ, char kway teow, coffee
}

function extractColourFeatures(
  source: HTMLImageElement | HTMLCanvasElement
): ColourFeatures {
  return tf.tidy(() => {
    const raw = tf.browser.fromPixels(source);
    const small = tf.image.resizeBilinear(raw, [64, 64]);
    const img = small.toFloat().div(255.0);

    const rCh = img.slice([0, 0, 0], [-1, -1, 1]).squeeze([2] as [number]);
    const gCh = img.slice([0, 0, 1], [-1, -1, 1]).squeeze([2] as [number]);
    const bCh = img.slice([0, 0, 2], [-1, -1, 1]).squeeze([2] as [number]);

    const meanR = rCh.mean().dataSync()[0];
    const meanG = gCh.mean().dataSync()[0];
    const meanB = bCh.mean().dataSync()[0];

    // HSV conversion from mean RGB
    const vMax = Math.max(meanR, meanG, meanB);
    const vMin = Math.min(meanR, meanG, meanB);
    const delta = vMax - vMin;

    let hue = 0;
    if (delta > 0.01) {
      if (vMax === meanR)      hue = 60 * (((meanG - meanB) / delta) % 6);
      else if (vMax === meanG) hue = 60 * ((meanB - meanR) / delta + 2);
      else                     hue = 60 * ((meanR - meanG) / delta + 4);
      if (hue < 0) hue += 360;
    }

    const saturation = vMax > 0.01 ? delta / vMax : 0;
    const brightness = vMax;

    // Colour descriptors
    const yellowness  = Math.max(0, (meanR * 0.7 + meanG * 0.3) - meanB * 1.2);
    const greenness   = Math.max(0, meanG - Math.max(meanR, meanB) * 1.1);
    const redness     = Math.max(0, meanR - Math.max(meanG, meanB) * 1.1);
    const paleness    = Math.min(meanR, meanG, meanB); // all channels high → white
    const deepBrown   = meanR > 0.2 && meanR > meanB * 1.5 && meanG > meanB * 1.2 && brightness < 0.55
      ? (meanR - meanB) * 0.8
      : 0;

    return { meanR, meanG, meanB, hue, saturation, brightness, yellowness, greenness, redness, paleness, deepBrown };
  });
}

// Map colour features to food candidates as a fallback
function colourFallbackCandidates(f: ColourFeatures): FoodCandidate[] {
  const buckets: { names: string[]; score: number }[] = [];

  // Orange-yellow → curry, laksa, egg dishes
  if (f.yellowness > 0.08) {
    buckets.push({ names: ["Laksa", "Chicken Biryani", "Fish Curry", "Butter Chicken with Naan", "Green Curry", "Mee Rebus", "Scrambled Eggs"], score: f.yellowness * 0.7 });
  }
  // Green → salad, vegetable
  if (f.greenness > 0.04) {
    buckets.push({ names: ["Caesar Salad", "Greek Salad", "Gado Gado", "Palak Paneer", "Som Tum (Papaya Salad)", "Dal Tadka"], score: f.greenness * 0.8 });
  }
  // Red/pink → spicy dishes, tomato-based
  if (f.redness > 0.06) {
    buckets.push({ names: ["Kimchi Stew", "Tteokbokki", "Tom Yum Soup", "Mee Goreng", "Beef Rendang", "Sweet & Sour Pork"], score: f.redness * 0.7 });
  }
  // Pale/white, low saturation → rice, soups, porridge
  if (f.paleness > 0.5 && f.saturation < 0.25) {
    buckets.push({ names: ["Chicken Rice", "Congee", "Hainanese Porridge", "Fish Ball Noodles", "Wonton Soup", "Miso Soup"], score: f.paleness * 0.5 });
  }
  // Deep brown → BBQ, char kway teow, coffee, bak kut teh
  if (f.deepBrown > 0.05) {
    buckets.push({ names: ["Korean BBQ (per serving)", "Char Kway Teow", "Bak Kut Teh", "Steak (8oz)", "Black Coffee", "Char Siu Rice"], score: f.deepBrown * 0.8 });
  }
  // Medium dark orange-brown → noodle dishes
  if (f.yellowness > 0.04 && f.brightness > 0.3 && f.brightness < 0.65 && f.deepBrown < 0.05) {
    buckets.push({ names: ["Hokkien Mee", "Pad Thai", "Mee Goreng", "Tonkotsu Ramen", "Laksa"], score: 0.25 });
  }

  const map = new Map<string, number>();
  for (const { names, score } of buckets) {
    for (const name of names) map.set(name, (map.get(name) ?? 0) + score);
  }

  const candidates: FoodCandidate[] = [];
  for (const [name, score] of map.entries()) {
    const food = FOODS.find((x) => x.name === name);
    if (food) candidates.push({ food, confidence: score, matchedClass: "colour analysis" });
  }

  const maxScore = candidates.reduce((m, c) => Math.max(m, c.confidence), 0);
  if (maxScore > 0) for (const c of candidates) c.confidence = Math.min(1, c.confidence / maxScore);

  return candidates.sort((a, b) => b.confidence - a.confidence).slice(0, 5);
}

// ─────────────────────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Classify a food image.
 * Attempts MobileNet first; falls back to colour heuristics if unavailable.
 *
 * @param source  HTMLImageElement (loaded via loadImageFromFile)
 * @param onStatus  Optional callback for progress updates ("loading-model" | "analyzing")
 */
export async function classifyFoodImage(
  source: HTMLImageElement,
  onStatus?: (s: FoodClassifyStatus) => void
): Promise<FoodClassificationResult> {
  const t0 = performance.now();

  try {
    onStatus?.("loading-model");
    const model = await getMobileNet();

    onStatus?.("analyzing");
    const imagenetPredictions: { className: string; probability: number }[] =
      await model.classify(source, 15);

    const candidates = scoreFromPredictions(imagenetPredictions);

    // If MobileNet gave poor food matches (all zero), fall back to colour
    if (candidates.length === 0 || candidates[0].confidence < 0.05) {
      const colour = extractColourFeatures(source);
      const colourCandidates = colourFallbackCandidates(colour);
      if (colourCandidates.length > 0) {
        return {
          topCandidate: colourCandidates[0].food,
          confidence: colourCandidates[0].confidence,
          candidates: colourCandidates.slice(0, 3),
          imagenetPredictions: imagenetPredictions.slice(0, 5),
          method: "colour-heuristic",
          processingMs: Math.round(performance.now() - t0),
        };
      }
    }

    return {
      topCandidate: candidates[0].food,
      confidence: candidates[0].confidence,
      candidates: candidates.slice(0, 3),
      imagenetPredictions: imagenetPredictions.slice(0, 5),
      method: "mobilenet",
      processingMs: Math.round(performance.now() - t0),
    };
  } catch {
    // MobileNet failed (offline / WebGL unavailable) – colour heuristics only
    onStatus?.("analyzing");
    const colour = extractColourFeatures(source);
    const candidates = colourFallbackCandidates(colour);

    if (candidates.length === 0) throw new Error("Unable to classify image.");

    return {
      topCandidate: candidates[0].food,
      confidence: candidates[0].confidence,
      candidates: candidates.slice(0, 3),
      imagenetPredictions: [],
      method: "colour-heuristic",
      processingMs: Math.round(performance.now() - t0),
    };
  }
}

/** Load an image File into an HTMLImageElement for classifyFoodImage. */
export function loadFoodImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload  = () => { URL.revokeObjectURL(url); resolve(img); };
    img.onerror = (e) => { URL.revokeObjectURL(url); reject(e); };
    img.src = url;
  });
}
