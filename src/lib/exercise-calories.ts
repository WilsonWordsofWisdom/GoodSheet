/**
 * Exercise Calorie Burn Estimator
 *
 * Based on MET (Metabolic Equivalent of Task) values from:
 * - Ainsworth BE, et al. (2011). "Compendium of Physical Activities"
 * - American College of Sports Medicine (ACSM) guidelines
 * - Mayo Clinic exercise intensity research
 *
 * Formula: Calories = MET × Weight(kg) × Duration(hours)
 *
 * MET values represent energy cost relative to resting metabolic rate:
 * - 1 MET = resting (sitting quietly)
 * - Light activity: 2-3.9 METs
 * - Moderate activity: 4-5.9 METs
 * - Vigorous activity: 6+ METs
 */

export interface ActivityMET {
  activity: string;
  low: number;      // Light intensity MET
  medium: number;   // Moderate intensity MET
  high: number;     // Vigorous intensity MET
  description: string;
}

// MET values from 2011 Compendium of Physical Activities
export const ACTIVITY_METS: Record<string, ActivityMET> = {
  "Walk": {
    activity: "Walk",
    low: 2.5,       // Slow pace, 2 mph
    medium: 3.5,    // Moderate pace, 3-3.5 mph (Ainsworth: 3.5 METs)
    high: 5.0,      // Brisk pace, 4 mph (Ainsworth: 5.0 METs)
    description: "Walking at varied paces"
  },
  "Run": {
    activity: "Run",
    low: 6.0,       // Jogging, 4 mph
    medium: 9.0,    // Running 6 mph (Ainsworth: 9.8 METs)
    high: 12.0,     // Running 8 mph (Ainsworth: 11.8 METs)
    description: "Running/jogging at varied intensities"
  },
  "Yoga": {
    activity: "Yoga",
    low: 2.5,       // Gentle/Hatha yoga (Ainsworth: 2.5 METs)
    medium: 3.0,    // General yoga (Ainsworth: 3.0 METs)
    high: 4.0,      // Power/Vinyasa yoga (Ainsworth: 4.0 METs)
    description: "Yoga practice from gentle to power flow"
  },
  "Gym": {
    activity: "Gym",
    low: 3.5,       // Light weight training (Ainsworth: 3.5 METs)
    medium: 5.0,    // Moderate resistance training (Ainsworth: 5.0 METs)
    high: 6.0,      // Vigorous weight lifting (Ainsworth: 6.0 METs)
    description: "Gym resistance/strength training"
  },
  "Cycle": {
    activity: "Cycle",
    low: 4.0,       // Leisure cycling <10 mph (Ainsworth: 4.0 METs)
    medium: 8.0,    // Moderate cycling 12-14 mph (Ainsworth: 8.0 METs)
    high: 12.0,     // Vigorous cycling 16-19 mph (Ainsworth: 12.0 METs)
    description: "Cycling at varied speeds"
  },
  "Swim": {
    activity: "Swim",
    low: 6.0,       // Leisure swimming (Ainsworth: 6.0 METs)
    medium: 8.0,    // Moderate laps (Ainsworth: 8.0 METs)
    high: 11.0,     // Vigorous laps (Ainsworth: 10.0-11.0 METs)
    description: "Swimming laps at varied intensities"
  },
  "Tennis": {
    activity: "Tennis",
    low: 5.0,       // Doubles tennis (Ainsworth code 15675: 5.0 METs)
    medium: 7.3,    // General tennis (Ainsworth code 15605: 7.3 METs)
    high: 8.0,      // Singles, competitive (Ainsworth code 15685: 8.0 METs)
    description: "Tennis from doubles to competitive singles"
  },
  "Skating": {
    activity: "Skating",
    low: 5.5,       // Ice/roller skating leisure (Ainsworth code 19130: 5.5 METs)
    medium: 7.0,    // Moderate effort skating (Ainsworth code 19140: 7.0 METs)
    high: 9.0,      // Vigorous/speed skating (Ainsworth code 19180: 9.0 METs)
    description: "Ice or roller skating at varied intensities"
  },
  "Martial Arts": {
    activity: "Martial Arts",
    low: 5.3,       // Tai chi, light practice (Ainsworth code 15675: 5.3 METs)
    medium: 10.3,   // Karate/judo/taekwondo moderate (Ainsworth code 15425: 10.3 METs)
    high: 12.0,     // Boxing/MMA sparring vigorous (Ainsworth code 15100: 12.0 METs)
    description: "Martial arts from tai chi to sparring"
  },
  "Dance": {
    activity: "Dance",
    low: 3.0,       // Slow ballroom/social (Ainsworth code 03015: 3.0 METs)
    medium: 5.5,    // General/aerobic dance (Ainsworth code 03031: 5.5 METs)
    high: 7.8,      // Vigorous aerobic dance (Ainsworth code 03021: 7.8 METs)
    description: "Dance from social to high-impact aerobic"
  },
  "Badminton": {
    activity: "Badminton",
    low: 4.5,       // Social/recreational (Ainsworth code 15010: 4.5 METs)
    medium: 5.5,    // General badminton (Ainsworth code 15020: 5.5 METs)
    high: 7.0,      // Competitive singles (Ainsworth code 15020: 7.0 METs)
    description: "Badminton from social to competitive"
  },
  "Kayaking": {
    activity: "Kayaking",
    low: 3.5,       // Leisure paddling (Ainsworth code 18070: 3.5 METs)
    medium: 5.0,    // Moderate effort (Ainsworth code 18075: 5.0 METs)
    high: 12.5,     // Vigorous/whitewater (Ainsworth code 18080: 12.5 METs)
    description: "Kayaking from leisure to whitewater"
  },
  "Climbing": {
    activity: "Climbing",
    low: 5.0,       // Bouldering low effort (Ainsworth code 17120: 5.0 METs)
    medium: 8.0,    // Rock climbing rappelling (Ainsworth code 17120: 8.0 METs)
    high: 11.0,     // Rock climbing ascending (Ainsworth code 17120: 11.0 METs)
    description: "Rock or wall climbing at varied effort"
  },
  "Hiking": {
    activity: "Hiking",
    low: 5.3,       // Cross-country hiking (Ainsworth code 17080: 5.3 METs)
    medium: 7.0,    // Hiking with light pack (Ainsworth code 17080: 7.0 METs)
    high: 7.8,      // Uphill/heavy pack (Ainsworth code 17085: 7.8 METs)
    description: "Hiking on trails at varied grades"
  }
};

export interface CalorieBurnEstimate {
  calories: number;
  met: number;
  confidence: "low" | "medium" | "high";
  note: string;
}

/**
 * Calculate calories burned during exercise
 *
 * @param activity - Type of activity (Walk, Run, etc.)
 * @param intensity - Exercise intensity level
 * @param durationMin - Duration in minutes
 * @param weightKg - User's weight in kg (optional, defaults to 70kg avg)
 * @returns Calorie burn estimate with MET value and confidence level
 */
export function estimateCaloriesBurned(
  activity: string,
  intensity: "low" | "medium" | "high",
  durationMin: number,
  weightKg?: number
): CalorieBurnEstimate {
  const activityData = ACTIVITY_METS[activity];

  if (!activityData) {
    // Fallback for unknown activities
    const defaultMET = intensity === "low" ? 3.0 : intensity === "medium" ? 5.0 : 7.0;
    const weight = weightKg || 70;
    const hours = durationMin / 60;

    return {
      calories: Math.round(defaultMET * weight * hours),
      met: defaultMET,
      confidence: "low",
      note: "Estimate based on intensity level (no user weight data)"
    };
  }

  const met = activityData[intensity];
  const weight = weightKg || 70; // Default to 70kg (average adult)
  const hours = durationMin / 60;

  // Standard formula: Calories = MET × weight(kg) × time(hours)
  const calories = Math.round(met * weight * hours);

  // Confidence depends on whether we have user weight
  const confidence = weightKg ? "high" : "medium";
  const weightNote = weightKg
    ? "Based on your profile weight"
    : "Based on avg 70kg adult weight";

  return {
    calories,
    met,
    confidence,
    note: weightNote
  };
}

/**
 * Get MET range for an activity across all intensities
 */
export function getActivityMETRange(activity: string): { min: number; max: number } | null {
  const data = ACTIVITY_METS[activity];
  if (!data) return null;

  return {
    min: data.low,
    max: data.high
  };
}
