"use client";
interface ToiletRollIconProps {
  className?: string;
}

/**
 * Custom toilet-paper-roll icon.
 * Drawn in lucide style: stroke-only, strokeWidth 2, round caps/joins, 24×24 viewBox.
 *
 *    ╭──────╮
 *   ( ╭──╮  )  ← outer roll circle + inner cardboard tube hole
 *    ╰──────╯
 *      │  │
 *      ╰──╯~   ← hanging sheet with wavy tear edge
 */
export function ToiletRollIcon({ className }: ToiletRollIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {/* ── Outer roll body ── */}
      <circle cx="12" cy="10" r="7" />

      {/* ── Cardboard tube (center hole) ── */}
      <circle cx="12" cy="10" r="2.5" />

      {/* ── Paper layer arc – suggests wound paper ── */}
      <path d="M6.5 12.5 Q8 15.5 12 15.5 Q16 15.5 17.5 12.5" />

      {/* ── Hanging sheet with wavy torn bottom edge ── */}
      <path d="M10 17 L10 21.5 Q11 23 12 21.5 Q13 20 14 21.5 L14 17" />
    </svg>
  );
}
