import React from 'react';

interface SchoolLogoProps {
  className?: string;
  size?: number;
}

export const SchoolLogo: React.FC<SchoolLogoProps> = ({ className = '', size = 80 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 160 170"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <radialGradient id="greenGlow" cx="50%" cy="45%" r="50%">
          <stop offset="0%" stopColor="#22c55e" />
          <stop offset="70%" stopColor="#15803d" />
          <stop offset="100%" stopColor="#166534" />
        </radialGradient>
        <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="50%" stopColor="#eab308" />
          <stop offset="100%" stopColor="#ca8a04" />
        </linearGradient>
      </defs>

      {/* Hexagonal / Crest Base */}
      <path
        d="M80 6 L146 44 L146 122 L80 160 L14 122 L14 44 Z"
        fill="url(#greenGlow)"
        stroke="#14532d"
        strokeWidth="3"
      />
      {/* Inner gold border */}
      <path
        d="M80 13 L140 48 L140 118 L80 153 L20 118 L20 48 Z"
        fill="none"
        stroke="url(#goldGrad)"
        strokeWidth="2"
      />

      {/* Radiant sunburst lines behind minaret */}
      <g stroke="#86efac" strokeWidth="1" strokeOpacity="0.4">
        <line x1="80" y1="85" x2="80" y2="25" />
        <line x1="80" y1="85" x2="45" y2="35" />
        <line x1="80" y1="85" x2="115" y2="35" />
        <line x1="80" y1="85" x2="35" y2="55" />
        <line x1="80" y1="85" x2="125" y2="55" />
      </g>

      {/* Star / Crescent / Dome */}
      <path
        d="M74 38 C74 32 86 32 86 38 C86 44 80 47 80 50 C80 47 74 44 74 38 Z"
        fill="url(#goldGrad)"
      />
      {/* Dome */}
      <path
        d="M60 62 C60 48 100 48 100 62 Z"
        fill="#14532d"
        stroke="url(#goldGrad)"
        strokeWidth="1.5"
      />

      {/* Open Quran Book */}
      <path
        d="M48 88 C60 84 76 86 80 93 C84 86 100 84 112 88 L112 108 C98 104 84 106 80 112 C76 106 62 104 48 108 Z"
        fill="#ffffff"
        stroke="#166534"
        strokeWidth="1.5"
      />
      {/* Book pages lines */}
      <path d="M52 92 C62 89 74 91 78 96" stroke="#9ca3af" strokeWidth="1" />
      <path d="M52 97 C62 94 74 96 78 101" stroke="#9ca3af" strokeWidth="1" />
      <path d="M108 92 C98 89 86 91 82 96" stroke="#9ca3af" strokeWidth="1" />
      <path d="M108 97 C98 94 86 96 82 101" stroke="#9ca3af" strokeWidth="1" />

      {/* Wheat / Padi stalks flanking sides */}
      <g stroke="url(#goldGrad)" strokeWidth="1.5" fill="none">
        <path d="M32 95 C30 75 40 55 52 45" />
        <path d="M128 95 C130 75 120 55 108 45" />
      </g>
      {/* Grains */}
      <circle cx="34" cy="85" r="2.5" fill="url(#goldGrad)" />
      <circle cx="32" cy="73" r="2.5" fill="url(#goldGrad)" />
      <circle cx="36" cy="62" r="2.5" fill="url(#goldGrad)" />
      <circle cx="43" cy="52" r="2.5" fill="url(#goldGrad)" />

      <circle cx="126" cy="85" r="2.5" fill="url(#goldGrad)" />
      <circle cx="128" cy="73" r="2.5" fill="url(#goldGrad)" />
      <circle cx="124" cy="62" r="2.5" fill="url(#goldGrad)" />
      <circle cx="117" cy="52" r="2.5" fill="url(#goldGrad)" />

      {/* Ribbon / Banner at bottom */}
      <path
        d="M30 128 L80 122 L130 128 L124 140 L80 134 L36 140 Z"
        fill="url(#goldGrad)"
        stroke="#854d0e"
        strokeWidth="1"
      />
      {/* Ribbon text */}
      <text
        x="80"
        y="133.5"
        textAnchor="middle"
        fontSize="8.5"
        fontWeight="bold"
        fontFamily="sans-serif"
        fill="#14532d"
        letterSpacing="0.4"
      >
        YPI AL-GHOZALI
      </text>
    </svg>
  );
};
