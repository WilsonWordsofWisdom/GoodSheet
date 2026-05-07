"use client";
import type { BristolType } from "@/lib/types";

interface Props {
  type: BristolType;
  className?: string;
}

/**
 * Scientifically accurate Bristol Stool Scale visual representations
 * Based on Rome Foundation and NHS clinical guidelines
 */
export function BristolVisual({ type, className = "" }: Props) {
  return (
    <svg
      viewBox="0 0 200 80"
      className={className}
      aria-label={`Bristol Type ${type} visual example`}
    >
      {type === 1 && <Type1 />}
      {type === 2 && <Type2 />}
      {type === 3 && <Type3 />}
      {type === 4 && <Type4 />}
      {type === 5 && <Type5 />}
      {type === 6 && <Type6 />}
      {type === 7 && <Type7 />}
    </svg>
  );
}

// Type 1: Separate hard lumps, like nuts (hard to pass)
function Type1() {
  const lumps = [
    { cx: 30, cy: 40, rx: 12, ry: 14 },
    { cx: 55, cy: 38, rx: 11, ry: 13 },
    { cx: 78, cy: 42, rx: 13, ry: 12 },
    { cx: 102, cy: 40, rx: 12, ry: 14 },
    { cx: 128, cy: 39, rx: 13, ry: 13 },
    { cx: 152, cy: 41, rx: 11, ry: 12 },
    { cx: 172, cy: 40, rx: 12, ry: 13 },
  ];

  return (
    <g>
      {lumps.map((lump, i) => (
        <ellipse
          key={i}
          cx={lump.cx}
          cy={lump.cy}
          rx={lump.rx}
          ry={lump.ry}
          fill="#8B5A2B"
          stroke="#5D3A1A"
          strokeWidth="1"
        />
      ))}
    </g>
  );
}

// Type 2: Sausage-shaped but lumpy
function Type2() {
  return (
    <g>
      <path
        d="M 20 40 Q 30 32, 50 38 Q 70 42, 90 36 Q 110 32, 130 38 Q 150 44, 170 40 Q 180 38, 180 40 Q 180 42, 170 42 Q 150 46, 130 42 Q 110 38, 90 42 Q 70 46, 50 42 Q 30 38, 20 42 Z"
        fill="#A0522D"
        stroke="#6B3410"
        strokeWidth="1.5"
      />
      {/* Lumpy texture */}
      <circle cx="40" cy="38" r="8" fill="#8B4513" opacity="0.5" />
      <circle cx="75" cy="40" r="9" fill="#8B4513" opacity="0.5" />
      <circle cx="110" cy="37" r="8" fill="#8B4513" opacity="0.5" />
      <circle cx="145" cy="41" r="9" fill="#8B4513" opacity="0.5" />
    </g>
  );
}

// Type 3: Sausage with cracks on the surface
function Type3() {
  return (
    <g>
      <ellipse cx="100" cy="40" rx="80" ry="16" fill="#B97A56" stroke="#8B5A2B" strokeWidth="1.5" />
      {/* Surface cracks */}
      <line x1="45" y1="28" x2="48" y2="52" stroke="#6B4423" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="75" y1="26" x2="78" y2="54" stroke="#6B4423" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="105" y1="27" x2="108" y2="53" stroke="#6B4423" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="135" y1="28" x2="138" y2="52" stroke="#6B4423" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="160" y1="29" x2="163" y2="51" stroke="#6B4423" strokeWidth="1.5" strokeLinecap="round" />
    </g>
  );
}

// Type 4: Smooth, soft sausage or snake (optimal)
function Type4() {
  return (
    <g>
      <ellipse cx="100" cy="40" rx="85" ry="14" fill="#9B7653" stroke="#7A5C42" strokeWidth="1.5" />
      {/* Smooth shading */}
      <ellipse cx="100" cy="35" rx="75" ry="8" fill="#B4927D" opacity="0.4" />
    </g>
  );
}

// Type 5: Soft blobs with clear-cut edges
function Type5() {
  const blobs = [
    { cx: 35, cy: 40, rx: 18, ry: 15 },
    { cx: 70, cy: 42, rx: 20, ry: 16 },
    { cx: 110, cy: 38, rx: 22, ry: 17 },
    { cx: 150, cy: 40, rx: 19, ry: 15 },
  ];

  return (
    <g>
      {blobs.map((blob, i) => (
        <ellipse
          key={i}
          cx={blob.cx}
          cy={blob.cy}
          rx={blob.rx}
          ry={blob.ry}
          fill="#C9A77A"
          stroke="#9A7B5A"
          strokeWidth="1.5"
        />
      ))}
    </g>
  );
}

// Type 6: Fluffy pieces with ragged edges, mushy
function Type6() {
  return (
    <g>
      {/* Multiple irregular, fluffy blobs */}
      <path
        d="M 25 40 Q 20 35, 25 32 Q 30 30, 35 32 Q 40 30, 43 35 Q 45 40, 40 43 Q 35 46, 30 44 Q 25 45, 25 40"
        fill="#D4B896"
        stroke="#A89070"
        strokeWidth="1"
      />
      <path
        d="M 50 38 Q 48 33, 53 30 Q 58 29, 62 31 Q 67 29, 70 34 Q 72 39, 67 42 Q 62 45, 57 43 Q 52 44, 50 38"
        fill="#D4B896"
        stroke="#A89070"
        strokeWidth="1"
      />
      <path
        d="M 78 42 Q 75 37, 80 34 Q 85 32, 90 34 Q 95 32, 98 37 Q 100 42, 95 45 Q 90 48, 85 46 Q 80 47, 78 42"
        fill="#D4B896"
        stroke="#A89070"
        strokeWidth="1"
      />
      <path
        d="M 105 39 Q 103 34, 108 31 Q 113 30, 117 32 Q 122 30, 125 35 Q 127 40, 122 43 Q 117 46, 112 44 Q 107 45, 105 39"
        fill="#D4B896"
        stroke="#A89070"
        strokeWidth="1"
      />
      <path
        d="M 132 41 Q 130 36, 135 33 Q 140 31, 145 33 Q 150 31, 153 36 Q 155 41, 150 44 Q 145 47, 140 45 Q 135 46, 132 41"
        fill="#D4B896"
        stroke="#A89070"
        strokeWidth="1"
      />
      <path
        d="M 160 38 Q 158 33, 163 30 Q 168 29, 172 31 Q 177 29, 180 34 Q 182 39, 177 42 Q 172 45, 167 43 Q 162 44, 160 38"
        fill="#D4B896"
        stroke="#A89070"
        strokeWidth="1"
      />
      {/* Add scattered particles for mushy appearance */}
      <circle cx="45" cy="48" r="2" fill="#C4A886" opacity="0.7" />
      <circle cx="73" cy="50" r="2" fill="#C4A886" opacity="0.7" />
      <circle cx="100" cy="49" r="2" fill="#C4A886" opacity="0.7" />
      <circle cx="128" cy="51" r="2" fill="#C4A886" opacity="0.7" />
      <circle cx="155" cy="49" r="2" fill="#C4A886" opacity="0.7" />
    </g>
  );
}

// Type 7: Watery, no solid pieces, entirely liquid
function Type7() {
  return (
    <g>
      {/* Watery spread with particles */}
      <ellipse cx="100" cy="45" rx="90" ry="8" fill="#D4A574" opacity="0.3" />
      <ellipse cx="100" cy="42" rx="85" ry="6" fill="#C4956A" opacity="0.4" />

      {/* Small particles suspended in liquid */}
      <circle cx="30" cy="43" r="2.5" fill="#B8885E" opacity="0.6" />
      <circle cx="52" cy="44" r="2" fill="#B8885E" opacity="0.5" />
      <circle cx="48" cy="40" r="1.5" fill="#B8885E" opacity="0.5" />
      <circle cx="75" cy="42" r="2.5" fill="#B8885E" opacity="0.6" />
      <circle cx="70" cy="45" r="1.8" fill="#B8885E" opacity="0.5" />
      <circle cx="95" cy="43" r="2" fill="#B8885E" opacity="0.6" />
      <circle cx="105" cy="44" r="2.2" fill="#B8885E" opacity="0.5" />
      <circle cx="110" cy="40" r="1.5" fill="#B8885E" opacity="0.5" />
      <circle cx="125" cy="42" r="2.5" fill="#B8885E" opacity="0.6" />
      <circle cx="132" cy="45" r="1.8" fill="#B8885E" opacity="0.5" />
      <circle cx="148" cy="43" r="2" fill="#B8885E" opacity="0.6" />
      <circle cx="165" cy="44" r="2.2" fill="#B8885E" opacity="0.5" />
      <circle cx="170" cy="41" r="1.5" fill="#B8885E" opacity="0.5" />

      {/* Liquid spread effect */}
      <ellipse cx="100" cy="46" rx="88" ry="5" fill="#E4B584" opacity="0.2" />
    </g>
  );
}
