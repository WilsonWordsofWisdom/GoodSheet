"use client";
interface ToiletIconProps {
  className?: string;
}

/**
 * Custom toilet-bowl icon modelled on Freepik #900722.
 * Drawn in lucide style: stroke-only, strokeWidth 2, round caps/joins, 24×24 viewBox.
 *
 *  ┌──────────┐   ← tank (rect)
 *  ╰──────────╯   ← seat-lid top arc
 *  (  ~~~~~~  )   ← bowl outer + inner seat oval
 *   ╰────────╯    ← base pedestal arc
 */
export function ToiletIcon({ className }: ToiletIconProps) {
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
      {/* ── Tank ── */}
      <rect x="7" y="2" width="10" height="5" rx="1.5" />

      {/* ── Seat lid – gently domed arc that bridges tank to bowl ── */}
      <path d="M5 10 Q5 7.5 12 7.5 Q19 7.5 19 10" />

      {/* ── Bowl outer – wide teardrop closing into the pedestal ── */}
      <path d="M5 10 Q3.5 15 5.5 18.5 Q8 21.5 12 21.5 Q16 21.5 18.5 18.5 Q20.5 15 19 10" />

      {/* ── Inner seat oval (water surface / seat ring) ── */}
      <ellipse cx="12" cy="14.5" rx="4" ry="3" />

      {/* ── Pedestal / base ── */}
      <path d="M9 21.5 Q9 23.5 12 23.5 Q15 23.5 15 21.5" />
    </svg>
  );
}
