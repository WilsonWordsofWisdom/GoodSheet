export type LogType = "meal" | "exercise" | "stool";

export type BristolType = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export interface MealLog {
  id: string;
  type: "meal";
  timestamp: number;
  foodName?: string;
  cuisine?: string;
  tags: string[];
  note?: string;
  caloriesMin?: number;
  caloriesMax?: number;
  thumbnail?: string;
}

export interface ExerciseLog {
  id: string;
  type: "exercise";
  timestamp: number;
  activity: string;
  intensity: "low" | "medium" | "high";
  durationMin: number;
  caloriesBurned?: number;
  met?: number;
  note?: string;
}

export interface StoolLog {
  id: string;
  type: "stool";
  timestamp: number;
  bristol: BristolType;
  urgency?: "low" | "medium" | "high";
  ease?: "easy" | "normal" | "strained";
  note?: string;
  thumbnail?: string;
}

export type AnyLog = MealLog | ExerciseLog | StoolLog;

export interface UserProfile {
  age?: number;
  weightKg?: number;
  heightCm?: number;
  goals: string[];
  storeThumbnails: boolean;
  onboardedAt: number;
}
