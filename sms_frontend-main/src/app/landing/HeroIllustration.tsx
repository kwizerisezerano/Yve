export function HeroIllustration() {
  return (
    <svg
      viewBox="0 0 480 480"
      className="w-full max-w-md"
      role="img"
      aria-label="Illustration of a phone receiving a message notification"
    >
      <circle cx="420" cy="420" r="90" fill="#FFE8EC" />

      <g opacity="0.7">
        <ellipse cx="90" cy="90" rx="34" ry="20" fill="#FFC7D0" />
        <ellipse cx="120" cy="80" rx="22" ry="14" fill="#FFC7D0" />
        <ellipse cx="150" cy="130" rx="26" ry="16" fill="#FFC7D0" />
      </g>

      <path
        d="M400 350c10 20-4 42-26 46-18 3-30-8-34-24-4-18 8-30 24-34 16-4 30 4 36 12z"
        fill="rgba(200, 16, 46, 1)"
        opacity="0.4"
      />

      <g transform="rotate(-6 240 300)">
        <rect x="150" y="160" width="190" height="340" rx="30" fill="#1F2937" />
        <rect x="164" y="182" width="162" height="278" rx="12" fill="#FFF5F7" />
        <rect x="220" y="170" width="40" height="6" rx="3" fill="#374151" />
        <circle cx="245" cy="478" r="10" fill="#374151" />

        <rect x="185" y="380" width="120" height="18" rx="9" fill="rgba(200, 16, 46, 1)" />
        <rect x="185" y="405" width="80" height="18" rx="9" fill="#FFD4DB" />
      </g>

      <g transform="rotate(6 245 190)">
        <rect x="160" y="120" width="170" height="120" rx="10" fill="rgba(180, 14, 41, 1)" />
        <polygon points="175,132 245,190 315,132" fill="rgba(220, 18, 50, 1)" />
        <polygon points="160,240 245,190 160,130" fill="rgba(180, 14, 41, 1)" />
        <polygon points="330,240 245,190 330,130" fill="rgba(160, 12, 36, 1)" />
        <polygon points="245,190 160,240 330,240" fill="rgba(200, 16, 46, 1)" />
        <rect
          x="205"
          y="95"
          width="80"
          height="100"
          rx="4"
          fill="#FFFFFF"
          stroke="#E5E7EB"
        />
        <rect x="218" y="115" width="54" height="6" rx="3" fill="#D1D5DB" />
        <rect x="218" y="130" width="54" height="6" rx="3" fill="#D1D5DB" />
        <rect x="218" y="145" width="34" height="6" rx="3" fill="#D1D5DB" />
      </g>

      <g transform="translate(120 250)">
        <circle cx="0" cy="0" r="26" fill="#1F2937" />
        <path
          d="M-8-4a8 8 0 0 1 16 0c0 6 3 8 3 8h-22s3-2 3-8z"
          fill="#FFF5F7"
        />
        <rect x="-4" y="4" width="8" height="4" rx="2" fill="#FFF5F7" />
      </g>
    </svg>
  );
}
