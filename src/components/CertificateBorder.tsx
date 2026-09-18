import React from 'react';

interface CertificateBorderProps {
  children: React.ReactNode;
  className?: string;
}

export const CertificateBorder: React.FC<CertificateBorderProps> = ({ children, className = '' }) => {
  return (
    <div className={`relative w-full h-full bg-white text-stone-900 overflow-hidden box-border ${className}`}>
      {/* Intricate Green Guilloche / Arabesque Border Frame with fixed absolute positioning */}
      <svg
        className="absolute top-0 left-0 right-0 bottom-0 w-full h-full pointer-events-none z-10"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100%',
          height: '100%',
        }}
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
        viewBox="0 0 800 1130"
      >
        <defs>
          <pattern id="guillocheH" width="16" height="12" patternUnits="userSpaceOnUse">
            <path
              d="M0 6 C4 1, 12 1, 16 6 C12 11, 4 11, 0 6 Z M0 0 C4 5, 12 5, 16 0 M0 12 C4 7, 12 7, 16 12"
              fill="none"
              stroke="#15803d"
              strokeWidth="0.65"
              strokeOpacity="0.8"
            />
            <circle cx="8" cy="6" r="1.2" fill="#16a34a" fillOpacity="0.5" />
          </pattern>
          <pattern id="guillocheV" width="12" height="16" patternUnits="userSpaceOnUse">
            <path
              d="M6 0 C1 4, 1 12, 6 16 C11 12, 11 4, 6 0 Z M0 0 C5 4, 5 12, 0 16 M12 0 C7 4, 7 12, 12 16"
              fill="none"
              stroke="#15803d"
              strokeWidth="0.65"
              strokeOpacity="0.8"
            />
            <circle cx="6" cy="8" r="1.2" fill="#16a34a" fillOpacity="0.5" />
          </pattern>
        </defs>

        {/* Outer solid and dotted perimeter lines */}
        <rect x="10" y="10" width="780" height="1110" fill="none" stroke="#166534" strokeWidth="2" />
        <rect x="13" y="13" width="774" height="1104" fill="none" stroke="#15803d" strokeWidth="0.8" strokeDasharray="2.5 2.5" />

        {/* Guilloche pattern bands (Slim & elegant at 12px thickness) */}
        {/* Top bar */}
        <rect x="26" y="14" width="748" height="12" fill="url(#guillocheH)" />
        {/* Bottom bar */}
        <rect x="26" y="1104" width="748" height="12" fill="url(#guillocheH)" />
        {/* Left bar */}
        <rect x="14" y="26" width="12" height="1078" fill="url(#guillocheV)" />
        {/* Right bar */}
        <rect x="774" y="26" width="12" height="1078" fill="url(#guillocheV)" />

        {/* Inner frame line (neat and thin at 26px) */}
        <rect x="25" y="25" width="750" height="1080" fill="none" stroke="#15803d" strokeWidth="0.8" />
        <rect x="27" y="27" width="746" height="1076" fill="none" stroke="#166534" strokeWidth="1.2" />

        {/* Corner Ornaments */}
        {/* Top-Left */}
        <g transform="translate(10, 10)">
          <path
            d="M0 0 L18 0 C14 6 14 12 18 18 C12 14 6 14 0 18 Z"
            fill="#15803d"
            fillOpacity="0.3"
            stroke="#166534"
            strokeWidth="0.8"
          />
          <circle cx="9" cy="9" r="3.5" fill="#166534" />
          <circle cx="9" cy="9" r="2" fill="#ffffff" />
          <circle cx="9" cy="9" r="1" fill="#15803d" />
        </g>

        {/* Top-Right */}
        <g transform="translate(772, 10)">
          <path
            d="M18 0 L0 0 C4 6 4 12 0 18 C6 14 12 14 18 18 Z"
            fill="#15803d"
            fillOpacity="0.3"
            stroke="#166534"
            strokeWidth="0.8"
          />
          <circle cx="9" cy="9" r="3.5" fill="#166534" />
          <circle cx="9" cy="9" r="2" fill="#ffffff" />
          <circle cx="9" cy="9" r="1" fill="#15803d" />
        </g>

        {/* Bottom-Left */}
        <g transform="translate(10, 1102)">
          <path
            d="M0 18 L18 18 C14 12 14 6 18 0 C12 4 6 4 0 0 Z"
            fill="#15803d"
            fillOpacity="0.3"
            stroke="#166534"
            strokeWidth="0.8"
          />
          <circle cx="9" cy="9" r="3.5" fill="#166534" />
          <circle cx="9" cy="9" r="2" fill="#ffffff" />
          <circle cx="9" cy="9" r="1" fill="#15803d" />
        </g>

        {/* Bottom-Right */}
        <g transform="translate(772, 1102)">
          <path
            d="M18 18 L0 18 C4 12 4 6 0 0 C6 4 12 4 18 0 Z"
            fill="#15803d"
            fillOpacity="0.3"
            stroke="#166534"
            strokeWidth="0.8"
          />
          <circle cx="9" cy="9" r="3.5" fill="#166534" />
          <circle cx="9" cy="9" r="2" fill="#ffffff" />
          <circle cx="9" cy="9" r="1" fill="#15803d" />
        </g>

        {/* Corner Accents on Inner Frame */}
        <path d="M28 40 L28 28 L40 28" fill="none" stroke="#166534" strokeWidth="1.5" />
        <path d="M772 40 L772 28 L760 28" fill="none" stroke="#166534" strokeWidth="1.5" />
        <path d="M28 1090 L28 1102 L40 1102" fill="none" stroke="#166534" strokeWidth="1.5" />
        <path d="M772 1090 L772 1102 L760 1102" fill="none" stroke="#166534" strokeWidth="1.5" />
      </svg>

      {/* Content wrapper with generous clearance from the border frame (px-12 pt-7 pb-8) */}
      <div className="relative z-20 px-12 pt-7 pb-8 w-full h-full box-border flex flex-col justify-between">
        {children}
      </div>
    </div>
  );
};
