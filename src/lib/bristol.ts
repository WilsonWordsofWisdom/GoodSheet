import type { BristolType } from "./types";

export interface BristolInfo {
  type: BristolType;
  label: string;
  description: string;
  category: "constipated" | "optimal" | "loose";
  color: string;
}

export const BRISTOL: Record<BristolType, BristolInfo> = {
  1: { type: 1, label: "Type 1", description: "Separate hard lumps, like nuts", category: "constipated", color: "#8B5A2B" },
  2: { type: 2, label: "Type 2", description: "Sausage-shaped but lumpy", category: "constipated", color: "#A0522D" },
  3: { type: 3, label: "Type 3", description: "Sausage with cracks on the surface", category: "optimal", color: "#B97A56" },
  4: { type: 4, label: "Type 4", description: "Smooth, soft, sausage-shaped", category: "optimal", color: "#34A853" },
  5: { type: 5, label: "Type 5", description: "Soft blobs with clear-cut edges", category: "optimal", color: "#C9A77A" },
  6: { type: 6, label: "Type 6", description: "Fluffy pieces, mushy", category: "loose", color: "#FBBC05" },
  7: { type: 7, label: "Type 7", description: "Watery, no solid pieces", category: "loose", color: "#EA4335" },
};

export const BRISTOL_TYPES: BristolType[] = [1, 2, 3, 4, 5, 6, 7];
