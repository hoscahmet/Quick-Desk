import React from 'react'

interface LogoProps {
  size?: number
  className?: string
}

export const Logo: React.FC<LogoProps> = ({ size = 20, className = '' }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 512 512"
      width={size}
      height={size}
      style={{ width: size, height: size }}
      className={`rounded-md shrink-0 drop-shadow-sm select-none pointer-events-none ${className}`}
    >
      <defs>
        <linearGradient id="logo-bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#141824" />
          <stop offset="50%" stopColor="#0e1117" />
          <stop offset="100%" stopColor="#080a0f" />
        </linearGradient>

        <linearGradient id="logo-border" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#2563eb" stopOpacity="0.4" />
        </linearGradient>

        <linearGradient id="logo-bolt" x1="20%" y1="0%" x2="80%" y2="100%">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="50%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#1d4ed8" />
        </linearGradient>

        <linearGradient id="logo-desk" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#1d4ed8" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#0284c7" stopOpacity="0.85" />
        </linearGradient>
      </defs>

      <rect
        x="32"
        y="32"
        width="448"
        height="448"
        rx="108"
        fill="url(#logo-bg)"
        stroke="url(#logo-border)"
        strokeWidth="12"
      />

      <g transform="translate(0, 42)">
        <path
          d="M 140 310 L 372 310 C 382 310 390 318 390 328 L 390 330 C 390 340 382 348 372 348 L 140 348 C 130 348 122 340 122 330 L 122 328 C 122 318 130 310 140 310 Z"
          fill="url(#logo-desk)"
          opacity="0.85"
        />
        <path
          d="M 180 270 L 332 270 C 340 270 346 276 346 284 C 346 292 340 298 332 298 L 180 298 C 172 298 166 292 166 284 C 166 276 172 270 180 270 Z"
          fill="#38bdf8"
          opacity="0.5"
        />
      </g>

      <path
        d="M 284 96 L 174 256 C 170 262 174 270 182 270 L 252 270 L 220 396 C 216 410 234 418 242 406 L 352 246 C 356 240 352 232 344 232 L 274 232 L 306 106 C 310 92 292 84 284 96 Z"
        fill="url(#logo-bolt)"
      />

      <path
        d="M 284 96 L 210 205 L 265 205 L 235 320 L 330 236 L 274 236 L 306 106 C 309 94 294 85 284 96 Z"
        fill="#ffffff"
        opacity="0.3"
      />
    </svg>
  )
}
