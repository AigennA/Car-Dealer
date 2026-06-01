export default function CarHeroSVG({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 800 500"
      width="800"
      height="500"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="bodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#dceeff" stopOpacity="0.85" />
        </linearGradient>
        <linearGradient id="roofGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
          <stop offset="100%" stopColor="#c8e0ff" stopOpacity="0.9" />
        </linearGradient>
        <linearGradient id="glassGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#aad4ff" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#7ab8ff" stopOpacity="0.4" />
        </linearGradient>
        <filter id="heroShadow">
          <feDropShadow dx="0" dy="8" stdDeviation="12" floodColor="rgba(0,0,0,0.25)" />
        </filter>
        <filter id="heroGlow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Ground shadow */}
      <ellipse cx="400" cy="430" rx="310" ry="18" fill="rgba(0,0,0,0.15)" />

      {/* Car body */}
      <g filter="url(#heroShadow)">
        {/* Lower body/sill */}
        <path
          d="M 100 340 L 100 295 Q 105 280 130 278 L 670 278 Q 695 280 700 295 L 700 340 Q 680 355 620 358 L 180 358 Q 120 355 100 340 Z"
          fill="url(#bodyGrad)"
          stroke="rgba(255,255,255,0.6)"
          strokeWidth="1.5"
        />
        {/* Roof/cabin */}
        <path
          d="M 210 278 Q 250 200 300 178 L 500 178 Q 550 200 590 278 Z"
          fill="url(#roofGrad)"
          stroke="rgba(255,255,255,0.5)"
          strokeWidth="1.5"
        />
        {/* Front hood */}
        <path
          d="M 590 278 L 680 278 L 700 295 L 700 305 L 620 290 Z"
          fill="url(#bodyGrad)"
          stroke="rgba(255,255,255,0.4)"
          strokeWidth="1"
        />
        {/* Rear trunk */}
        <path
          d="M 210 278 L 120 278 L 100 295 L 100 305 L 180 290 Z"
          fill="url(#bodyGrad)"
          stroke="rgba(255,255,255,0.4)"
          strokeWidth="1"
        />
      </g>

      {/* Windows */}
      <path
        d="M 495 278 L 492 185 L 500 178 L 555 186 Q 542 215 500 278 Z"
        fill="url(#glassGrad)"
        stroke="rgba(255,255,255,0.4)"
        strokeWidth="1"
      />
      <path
        d="M 305 278 L 310 278 Q 258 215 245 178 L 300 178 L 308 185 Z"
        fill="url(#glassGrad)"
        stroke="rgba(255,255,255,0.4)"
        strokeWidth="1"
      />
      <path
        d="M 315 278 L 308 185 L 492 185 L 485 278 Z"
        fill="url(#glassGrad)"
        stroke="rgba(255,255,255,0.3)"
        strokeWidth="1"
      />

      {/* Door line */}
      <line x1="400" y1="278" x2="400" y2="355" stroke="rgba(180,210,255,0.5)" strokeWidth="1.5" />

      {/* Door handles */}
      <rect x="345" y="308" width="28" height="6" rx="3" fill="rgba(255,255,255,0.7)" stroke="rgba(255,255,255,0.4)" strokeWidth="0.5" />
      <rect x="427" y="308" width="28" height="6" rx="3" fill="rgba(255,255,255,0.7)" stroke="rgba(255,255,255,0.4)" strokeWidth="0.5" />

      {/* Front wheel */}
      <circle cx="570" cy="370" r="62" fill="#1a1a1a" />
      <circle cx="570" cy="370" r="52" fill="#2a2a2a" />
      <circle cx="570" cy="370" r="38" fill="#333" />
      <g stroke="#c0c8d8" strokeWidth="4" strokeLinecap="round">
        <line x1="570" y1="336" x2="570" y2="350" />
        <line x1="570" y1="390" x2="570" y2="404" />
        <line x1="536" y1="370" x2="550" y2="370" />
        <line x1="590" y1="370" x2="604" y2="370" />
        <line x1="546" y1="346" x2="556" y2="356" />
        <line x1="584" y1="384" x2="594" y2="394" />
        <line x1="594" y1="346" x2="584" y2="356" />
        <line x1="556" y1="384" x2="546" y2="394" />
      </g>
      <circle cx="570" cy="370" r="14" fill="#b0bcd0" />
      <circle cx="570" cy="370" r="7" fill="#d8e0ec" />

      {/* Rear wheel */}
      <circle cx="230" cy="370" r="62" fill="#1a1a1a" />
      <circle cx="230" cy="370" r="52" fill="#2a2a2a" />
      <circle cx="230" cy="370" r="38" fill="#333" />
      <g stroke="#c0c8d8" strokeWidth="4" strokeLinecap="round">
        <line x1="230" y1="336" x2="230" y2="350" />
        <line x1="230" y1="390" x2="230" y2="404" />
        <line x1="196" y1="370" x2="210" y2="370" />
        <line x1="250" y1="370" x2="264" y2="370" />
        <line x1="206" y1="346" x2="216" y2="356" />
        <line x1="244" y1="384" x2="254" y2="394" />
        <line x1="254" y1="346" x2="244" y2="356" />
        <line x1="216" y1="384" x2="206" y2="394" />
      </g>
      <circle cx="230" cy="370" r="14" fill="#b0bcd0" />
      <circle cx="230" cy="370" r="7" fill="#d8e0ec" />

      {/* Headlight */}
      <path
        d="M 692 280 Q 705 288 706 298 L 700 300 Q 698 288 688 282 Z"
        fill="rgba(255,248,200,0.95)"
        stroke="rgba(255,255,255,0.3)"
        strokeWidth="1"
      />
      <ellipse cx="700" cy="291" rx="8" ry="5" fill="rgba(255,248,180,0.9)" filter="url(#heroGlow)" />
      <path d="M 680 278 Q 700 282 706 295" fill="none" stroke="rgba(255,255,220,0.8)" strokeWidth="2.5" strokeLinecap="round" />

      {/* Tail light */}
      <path
        d="M 108 280 Q 95 288 94 298 L 100 300 Q 102 288 112 282 Z"
        fill="rgba(255,60,60,0.8)"
        stroke="rgba(255,255,255,0.3)"
        strokeWidth="1"
      />
      <ellipse cx="100" cy="291" rx="7" ry="4" fill="rgba(255,80,80,0.9)" />

      {/* Side mirror */}
      <path d="M 608 240 L 620 238 L 622 248 L 608 250 Z" fill="url(#bodyGrad)" stroke="rgba(255,255,255,0.4)" strokeWidth="1" />
    </svg>
  );
}
