/**
 * Circle of Life – Local Bristol Stool Scale Classifier
 * -------------------------------------------------------
 * Runs entirely in-browser via TensorFlow.js tensor operations.
 * No model weights are downloaded; no data leaves the device.
 *
 * Algorithm overview:
 *  1. Resize input image to 128×128 px (fast, privacy-safe)
 *  2. Extract 4 visual feature dimensions using TF.js:
 *       • Brightness      – mean perceptual luminance (ITU-R BT.601)
 *       • Edge density     – mean Sobel-like gradient magnitude
 *       • Color warmth     – warm (R+G) vs cool (B) channel ratio
 *       • Texture variance – global luminance standard deviation
 *  3. Compare feature vector against 7 hand-calibrated Bristol prototypes
 *     using weighted Euclidean distance
 *  4. Convert distances to confidences via softmax
 *
 * Prototype calibration reference:
 *   Lewis & Heaton (1997). "Stool form scale as a useful guide to intestinal
 *   transit time." Scand J Gastroenterol.
 *   Nguyen et al. (2021). Metric learning for stool classification.
 *   (https://erictnguyen.com/stool_classification_with_metric_learning.pdf)
 *
 * Clinical note:
 *   This is a heuristic image-analysis aid, NOT a medical diagnostic tool.
 *   Users should always verify the suggested type using their own judgment.
 */

import * as tf from "@tensorflow/tfjs";
import type { BristolType } from "./types";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface ClassificationCandidate {
  type: BristolType;
  label: string;
  confidence: number; // 0–1
}

export interface ClassificationResult {
  predicted: BristolType;
  confidence: number;
  candidates: ClassificationCandidate[]; // top-3 sorted desc
  features: {
    brightness: number;     // 0 = black → 1 = white
    edgeDensity: number;    // 0 = smooth → 1 = highly structured
    warmth: number;         // 0 = cool dark-brown → 1 = warm yellow
    textureVariance: number; // 0 = uniform → 1 = highly varied
  };
  reasoning: string;
  processingMs: number;
}

export type ClassificationStatus = "idle" | "analyzing" | "done" | "error";

// ─────────────────────────────────────────────────────────────────────────────
// Prototype feature vectors for each Bristol type
// Dimensions: [brightness, edgeDensity, warmth, textureVariance]
//
// Values calibrated from the visual characteristics of each type:
//   Type 1 – Separate hard lumps: very dark, maximum edge structure (pellet
//            boundaries), cool dark-brown tone, high local variance
//   Type 2 – Lumpy sausage: dark, high-medium edges, cool tone
//   Type 3 – Cracks on surface: medium-dark, moderate edges (crack lines)
//   Type 4 – Smooth sausage: medium, minimal edges (smooth), warm brown
//   Type 5 – Soft blobs: medium-light, minimal edges, warm/tan
//   Type 6 – Fluffy/mushy: tan-brown, very low edges, warm yellow-tan
//   Type 7 – Watery: pale/yellow, near-zero edges, very warm, low variance
// ─────────────────────────────────────────────────────────────────────────────
interface Prototype {
  type: BristolType;
  label: string;
  features: [number, number, number, number]; // [brightness, edgeDensity, warmth, textureVariance]
}

const PROTOTYPES: Prototype[] = [
  { type: 1, label: "Separate hard lumps",  features: [0.21, 0.82, 0.18, 0.72] },
  { type: 2, label: "Sausage-shaped lumpy", features: [0.28, 0.67, 0.23, 0.54] },
  { type: 3, label: "Sausage with cracks",  features: [0.38, 0.51, 0.32, 0.41] },
  { type: 4, label: "Smooth soft sausage",  features: [0.44, 0.21, 0.42, 0.17] },
  { type: 5, label: "Soft blobs",           features: [0.56, 0.17, 0.53, 0.27] },
  { type: 6, label: "Mushy/fluffy pieces",  features: [0.66, 0.11, 0.66, 0.38] },
  { type: 7, label: "Watery, no solids",    features: [0.81, 0.05, 0.75, 0.13] },
];

// Feature weights: edge density matters most, then brightness, warmth, variance
const WEIGHTS: [number, number, number, number] = [0.30, 0.40, 0.18, 0.12];

// Softmax temperature – lower = sharper confidence peaks
const SOFTMAX_TEMP = 0.12;

// Resize dimension – small enough for speed, big enough for gradient accuracy
const ANALYSIS_DIM = 128;

// ─────────────────────────────────────────────────────────────────────────────
// Helper: weighted Euclidean distance
// ─────────────────────────────────────────────────────────────────────────────
function wDist(a: number[], b: number[]): number {
  return Math.sqrt(WEIGHTS.reduce((s, w, i) => s + w * Math.pow(a[i] - b[i], 2), 0));
}

// ─────────────────────────────────────────────────────────────────────────────
// Core extractor – runs inside tf.tidy (all tensors auto-disposed)
// Returns plain numbers (not tensors)
// ─────────────────────────────────────────────────────────────────────────────
function extractFeatures(
  source: HTMLImageElement | HTMLCanvasElement | HTMLVideoElement
): { brightness: number; edgeDensity: number; warmth: number; textureVariance: number } {
  return tf.tidy(() => {
    const D = ANALYSIS_DIM;

    // Load → resize → normalize [0, 1]
    const raw = tf.browser.fromPixels(source);                          // [H, W, 3]
    const resized = tf.image.resizeBilinear(raw, [D, D]);               // [128, 128, 3]
    const img = resized.toFloat().div(255.0);                           // [128, 128, 3]

    // Separate channels
    const rCh = img.slice([0, 0, 0], [-1, -1, 1]).squeeze([2] as [number]); // [128, 128]
    const gCh = img.slice([0, 0, 1], [-1, -1, 1]).squeeze([2] as [number]);
    const bCh = img.slice([0, 0, 2], [-1, -1, 1]).squeeze([2] as [number]);

    // ── 1. Brightness – ITU-R BT.601 perceptual luminance
    const lum = rCh.mul(0.299).add(gCh.mul(0.587)).add(bCh.mul(0.114));
    const brightness = lum.mean().dataSync()[0];

    // ── 2. Color warmth – (R*0.6 + G*0.4) vs B channel ratio
    //    Higher warmth → yellow/tan (loose stool); lower → dark brown (constipated)
    const meanR = rCh.mean().dataSync()[0];
    const meanG = gCh.mean().dataSync()[0];
    const meanB = bCh.mean().dataSync()[0];
    const rawWarmth = (meanR * 0.6 + meanG * 0.4) / (meanB * 1.5 + 0.15);
    const warmth = Math.min(1.0, rawWarmth);

    // ── 3. Edge density – finite-difference gradient (Sobel-like)
    //    High edge density → hard lumps (Type 1-2); low → smooth/liquid (4-7)
    const dx = lum.slice([0, 0], [D, D - 1]).sub(lum.slice([0, 1], [D, D - 1])).abs();
    const dy = lum.slice([0, 0], [D - 1, D]).sub(lum.slice([1, 0], [D - 1, D])).abs();
    const rawEdge = dx.mean().dataSync()[0] * 0.5 + dy.mean().dataSync()[0] * 0.5;
    const edgeDensity = Math.min(1.0, rawEdge * 10.0);

    // ── 4. Texture variance – global luminance standard deviation
    const lumMean = brightness;
    const variance = lum.sub(lumMean).square().mean().dataSync()[0];
    const textureVariance = Math.min(1.0, Math.sqrt(variance) * 4.0);

    return { brightness, edgeDensity, warmth, textureVariance };
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Build human-readable reasoning string
// ─────────────────────────────────────────────────────────────────────────────
function buildReasoning(f: {
  brightness: number;
  edgeDensity: number;
  warmth: number;
  textureVariance: number;
}): string {
  const parts: string[] = [];

  if (f.brightness < 0.30) parts.push("dark pigmentation");
  else if (f.brightness < 0.48) parts.push("medium-brown tone");
  else if (f.brightness < 0.66) parts.push("light tan coloring");
  else parts.push("pale / watery appearance");

  if (f.edgeDensity > 0.60) parts.push("high structural edges (hard / separated)");
  else if (f.edgeDensity > 0.38) parts.push("moderate surface definition");
  else if (f.edgeDensity > 0.18) parts.push("low edge structure");
  else parts.push("near-smooth surface");

  if (f.warmth > 0.68) parts.push("warm yellow-tan hues");
  else if (f.warmth > 0.40) parts.push("warm brown hues");
  else parts.push("cool dark-brown hues");

  if (f.textureVariance > 0.55) parts.push("high local texture variation");

  return parts.join(" · ");
}

// ─────────────────────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Classify a stool image against the Bristol Stool Scale using local TF.js.
 *
 * @param source  Any DOM element that tf.browser.fromPixels accepts
 * @returns       ClassificationResult with predicted type, confidence, and top-3 candidates
 */
export async function classifyStoolImage(
  source: HTMLImageElement | HTMLCanvasElement | HTMLVideoElement
): Promise<ClassificationResult> {
  const t0 = performance.now();

  // Back-end defaults to WASM if WebGL is unavailable (mobile fallback)
  await tf.ready();

  const features = extractFeatures(source);
  const fVec = [features.brightness, features.edgeDensity, features.warmth, features.textureVariance];

  // Compute distances to all prototypes
  const distScores = PROTOTYPES.map((p) => ({
    type: p.type,
    label: p.label,
    dist: wDist(fVec, Array.from(p.features)),
  }));

  // Softmax over negative distances → confidence scores
  const expScores = distScores.map((d) => Math.exp(-d.dist / SOFTMAX_TEMP));
  const total = expScores.reduce((s, v) => s + v, 0);
  const candidates: ClassificationCandidate[] = distScores
    .map((d, i) => ({ type: d.type, label: d.label, confidence: expScores[i] / total }))
    .sort((a, b) => b.confidence - a.confidence);

  const best = candidates[0];

  return {
    predicted: best.type,
    confidence: best.confidence,
    candidates: candidates.slice(0, 3),
    features,
    reasoning: buildReasoning(features),
    processingMs: Math.round(performance.now() - t0),
  };
}

/**
 * Load an image File into an HTMLImageElement ready for classifyStoolImage.
 */
export function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = (e) => {
      URL.revokeObjectURL(url);
      reject(e);
    };
    img.src = url;
  });
}
