import React from 'react';

const Logo = ({ className = "w-10 h-10" }) => (
  <svg className={className} viewBox="0 0 500 500" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="bgGrad" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
        <stop offset="0%" stopColor="#1e293b" />
        <stop offset="100%" stopColor="#0f172a" />
      </radialGradient>
      <linearGradient id="bambooGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#10B981" />
        <stop offset="100%" stopColor="#059669" />
      </linearGradient>
      <linearGradient id="darkGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#1e293b" />
        <stop offset="100%" stopColor="#0f172a" />
      </linearGradient>
    </defs>
    <rect width="500" height="500" rx="120" fill="url(#bgGrad)" />
    <circle cx="250" cy="250" r="210" fill="none" stroke="#334155" strokeWidth="2" strokeDasharray="10 15" opacity="0.5" />
    <g transform="translate(0, 10)">
      <circle cx="160" cy="140" r="45" fill="url(#darkGrad)" />
      <circle cx="160" cy="140" r="25" fill="#0f172a" opacity="0.6" />
      <circle cx="340" cy="140" r="45" fill="url(#darkGrad)" />
      <circle cx="340" cy="140" r="25" fill="#0f172a" opacity="0.6" />
      <path d="M 130 260 C 130 150, 370 150, 370 260 C 370 340, 130 340, 130 260 Z" fill="#ffffff" />
      <path d="M 175 220 C 150 230, 160 280, 195 270 C 210 265, 200 210, 175 220 Z" fill="url(#darkGrad)" />
      <path d="M 325 220 C 350 230, 340 280, 305 270 C 290 265, 300 210, 325 220 Z" fill="url(#darkGrad)" />
      <circle cx="190" cy="245" r="10" fill="#ffffff" />
      <circle cx="190" cy="245" r="4" fill="#10B981" />
      <circle cx="310" cy="245" r="10" fill="#ffffff" />
      <circle cx="310" cy="245" r="4" fill="#10B981" />
      <path d="M 220 280 Q 250 300 280 280" fill="none" stroke="#f1f5f9" strokeWidth="8" strokeLinecap="round" />
      <path d="M 235 282 C 235 275, 265 275, 265 282 C 265 292, 235 292, 235 282 Z" fill="#0f172a" />
      <path d="M 242 294 Q 250 302 258 294" fill="none" stroke="#0f172a" strokeWidth="4.5" strokeLinecap="round" />
      <g transform="translate(325, 280) rotate(15)">
        <rect x="0" y="0" width="10" height="35" rx="3" fill="url(#bambooGrad)" />
        <rect x="0" y="38" width="10" height="35" rx="3" fill="url(#bambooGrad)" />
        <line x1="-2" y1="36" x2="12" y2="36" stroke="#065f46" strokeWidth="3" strokeLinecap="round" />
        <path d="M 10 15 C 30 5, 45 25, 10 30 Z" fill="url(#bambooGrad)" />
        <path d="M 0 50 C -25 45, -30 25, 0 40 Z" fill="url(#bambooGrad)" />
      </g>
    </g>
  </svg>
);

export default Logo;
