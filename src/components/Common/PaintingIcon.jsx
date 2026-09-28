import React from 'react';

export function PaintingIcon({ size = 22, className = '', style = {} }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0, ...style }}
    >
      <defs>
        <linearGradient id="kargahGold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="40%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#d97706" />
        </linearGradient>
        <linearGradient id="kargahBristle" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f43f5e" />
          <stop offset="60%" stopColor="#ec4899" />
          <stop offset="100%" stopColor="#a855f7" />
        </linearGradient>
      </defs>

      {/* Painter's Palette Outline */}
      <path 
        d="M12 2.5C6.75 2.5 2.5 6.75 2.5 12C2.5 17.25 6.75 21.5 12 21.5C13.6 21.5 14.9 20.2 14.9 18.6C14.9 17.85 14.6 17.15 14.1 16.65C13.6 16.15 13.3 15.45 13.3 14.7C13.3 13.1 14.6 11.8 16.2 11.8H17.8C20 11.8 21.8 10 21.8 7.8C21.8 4.6 17.3 2.5 12 2.5Z" 
        stroke="url(#kargahGold)" 
        strokeWidth="1.6" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />

      {/* Primary Pigment Wells */}
      <circle cx="6.8" cy="11.5" r="1.3" fill="#38bdf8" />
      <circle cx="9.8" cy="7.5" r="1.3" fill="#f43f5e" />
      <circle cx="14.8" cy="7.2" r="1.3" fill="#fbbf24" />

      {/* Thumb Hole */}
      <circle cx="17.2" cy="16.8" r="1.5" stroke="url(#kargahGold)" strokeWidth="1.2" />

      {/* Artist Brush */}
      <path 
        d="M21 3L15 9" 
        stroke="url(#kargahGold)" 
        strokeWidth="1.7" 
        strokeLinecap="round"
      />
      <path 
        d="M15 9L13.2 11.2C12.7 11.8 12.8 12.5 13.4 12.8C14 13.1 14.6 12.8 15 12.2L16 10" 
        stroke="url(#kargahBristle)" 
        strokeWidth="1.5" 
        strokeLinecap="round"
      />
    </svg>
  );
}
