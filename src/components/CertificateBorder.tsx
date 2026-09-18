import React from 'react';

interface CertificateBorderProps {
  children: React.ReactNode;
  className?: string;
}

export const CertificateBorder: React.FC<CertificateBorderProps> = ({ children, className = '' }) => {
  return (
    <div className={`relative bg-white text-stone-900 ${className}`}>
      {/* Intricate Green Guilloche / Arabesque Border Frame */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none z-10"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
        viewBox="0 0 800 1130"
      >
        <defs>
          <pattern id="guillocheH" width="20" height="24" patternUnits="userSpaceOnUse">
            <path
              d="M0 12 C5 3, 15 3, 20 12 C15 21, 5 21, 0 12 Z M0 0 C5 9, 15 9, 20 0 M0 24 C5 15, 15 15, 20 24"
              fill="none"
              stroke="#15803d"
              strokeWidth="0.8"
              strokeOpacity="0.85"
            />
            <circle cx="10" cy="12" r="2" fill="#16a34a" fillOpacity="0.4" />
          </pattern>
          <pattern id="guillocheV" width="24" height="20" patternUnits="userSpaceOnUse">
            <path
              d="M12 0 C3 5, 3 15, 12 20 C21 15, 21 5, 12 0 Z M0 0 C9 5, 9 15, 0 20 M24 0 C15 5, 15 15, 24 20"
              fill="none"
              stroke="#15803d"
              strokeWidth="0.8"
              strokeOpacity="0.85"
            />
            <circle cx="12" cy="10" r="2" fill="#16a34a" fillOpacity="0.4" />
          </pattern>
        </defs>

        {/* Outer decorative band */}
        <rect x="12" y="12" width="776" height="1106" fill="none" stroke="#166534" strokeWidth="2.5" />
        <rect x="16" y="16" width="768" height="1098" fill="none" stroke="#15803d" strokeWidth="1" strokeDasharray="3 3" />

        {/* Guilloche pattern bands */}
        {/* Top bar */}
        <rect x="40" y="17" width="720" height="22" fill="url(#guillocheH)" />
        {/* Bottom bar */}
        <rect x="40" y="1091" width="720" height="22" fill="url(#guillocheH)" />
        {/* Left bar */}
        <rect x="17" y="40" width="22" height="1050" fill="url(#guillocheV)" />
        {/* Right bar */}
        <rect x="761" y="40" width="22" height="1050" fill="url(#guillocheV)" />

        {/* Inner frame lines */}
        <rect x="38" y="38" width="724" height="1054" fill="none" stroke="#15803d" strokeWidth="1.2" />
        <rect x="42" y="42" width="716" height="1046" fill="none" stroke="#166534" strokeWidth="2" />

        {/* Corner Ornaments */}
        {/* Top-Left */}
        <g transform="translate(14, 14)">
          <path
            d="M0 0 L30 0 C25 10 25 20 30 30 C20 25 10 25 0 30 Z"
            fill="#15803d"
            fillOpacity="0.3"
            stroke="#166534"
            strokeWidth="1.2"
          />
          <circle cx="15" cy="15" r="7" fill="#166534" />
          <circle cx="15" cy="15" r="4" fill="#ffffff" />
          <circle cx="15" cy="15" r="2" fill="#15803d" />
          <path d="M0 26 C15 22 22 15 26 0" fill="none" stroke="#15803d" strokeWidth="1.5" />
        </g>

        {/* Top-Right */}
        <g transform="translate(756, 14)">
          <path
            d="M30 0 L0 0 C5 10 5 20 0 30 C10 25 20 25 30 30 Z"
            fill="#15803d"
            fillOpacity="0.3"
            stroke="#166534"
            strokeWidth="1.2"
          />
          <circle cx="15" cy="15" r="7" fill="#166534" />
          <circle cx="15" cy="15" r="4" fill="#ffffff" />
          <circle cx="15" cy="15" r="2" fill="#15803d" />
          <path d="M30 26 C15 22 8 15 4 0" fill="none" stroke="#15803d" strokeWidth="1.5" />
        </g>

        {/* Bottom-Left */}
        <g transform="translate(14, 1086)">
          <path
            d="M0 30 L30 30 C25 20 25 10 30 0 C20 5 10 5 0 0 Z"
            fill="#15803d"
            fillOpacity="0.3"
            stroke="#166534"
            strokeWidth="1.2"
          />
          <circle cx="15" cy="15" r="7" fill="#166534" />
          <circle cx="15" cy="15" r="4" fill="#ffffff" />
          <circle cx="15" cy="15" r="2" fill="#15803d" />
          <path d="M0 4 C15 8 22 15 26 30" fill="none" stroke="#15803d" strokeWidth="1.5" />
        </g>

        {/* Bottom-Right */}
        <g transform="translate(756, 1086)">
          <path
            d="M30 30 L0 30 C5 20 5 10 0 0 C10 5 20 5 30 0 Z"
            fill="#15803d"
            fillOpacity="0.3"
            stroke="#166534"
            strokeWidth="1.2"
          />
          <circle cx="15" cy="15" r="7" fill="#166534" />
          <circle cx="15" cy="15" r="4" fill="#ffffff" />
          <circle cx="15" cy="15" r="2" fill="#15803d" />
          <path d="M30 4 C15 8 8 15 4 30" fill="none" stroke="#15803d" strokeWidth="1.5" />
        </g>

        {/* Corner Accents on Inner Frame */}
        <path d="M42 62 L42 42 L62 42" fill="none" stroke="#166534" strokeWidth="2.5" />
        <path d="M758 62 L758 42 L738 42" fill="none" stroke="#166534" strokeWidth="2.5" />
        <path d="M42 1068 L42 1088 L62 1088" fill="none" stroke="#166534" strokeWidth="2.5" />
        <path d="M758 1068 L758 1088 L738 1088" fill="none" stroke="#166534" strokeWidth="2.5" />
      </svg>

      {/* Content wrapper with proper padding inside the border */}
      <div className="relative z-20 px-12 py-10 w-full h-full box-border">
        {children}
      </div>
    </div>
  );
};
