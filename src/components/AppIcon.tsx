"use client";
interface Props {
  size?: number;
  className?: string;
}

export function AppIcon({ size = 32, className }: Props) {
  const id = `rainbow-${size}`;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      className={className}
      aria-label="Circle Of Life"
    >
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#EA4335" />
          <stop offset="20%" stopColor="#FBBC05" />
          <stop offset="40%" stopColor="#34A853" />
          <stop offset="60%" stopColor="#4285F4" />
          <stop offset="80%" stopColor="#9C27B0" />
          <stop offset="100%" stopColor="#EA4335" />
        </linearGradient>
      </defs>
      <path
        fill={`url(#${id})`}
        d="M32 6c-3 0-5 2.5-5 5 0 1.4.5 2.5 1.2 3.4-3.4.6-6 3.6-6 7.1 0 1 .2 2 .6 2.9-4 .8-7 4.3-7 8.4 0 1.6.5 3 1.2 4.3-3 1.3-5 4.2-5 7.6 0 4.7 3.8 8.5 8.5 8.5h23c4.7 0 8.5-3.8 8.5-8.5 0-3.4-2-6.3-5-7.6.7-1.3 1.2-2.7 1.2-4.3 0-4.1-3-7.6-7-8.4.4-.9.6-1.9.6-2.9 0-3.5-2.6-6.5-6-7.1.7-.9 1.2-2 1.2-3.4 0-2.5-2-5-5-5z"
      />
      <ellipse cx="26" cy="36" rx="2.2" ry="2.6" fill="#202124" />
      <ellipse cx="38" cy="36" rx="2.2" ry="2.6" fill="#202124" />
      <path
        d="M25 44 Q32 49 39 44"
        stroke="#202124"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}
