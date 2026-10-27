"use client";

import React from "react";

export function MountainBackdrop() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none rounded-2xl">
      <svg
        className="w-full h-full object-cover"
        viewBox="0 0 1200 480"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Twilight Sky Gradient */}
          <linearGradient id="skyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#0B1026" />
            <stop offset="35%" stopColor="#1E1B4B" />
            <stop offset="70%" stopColor="#312E81" />
            <stop offset="85%" stopColor="#6D28D9" />
            <stop offset="95%" stopColor="#BE185D" />
            <stop offset="100%" stopColor="#F43F5E" />
          </linearGradient>

          {/* Distant Mountain Peak Gradient */}
          <linearGradient id="peakDistant" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#4338CA" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#1E1B4B" stopOpacity="0.95" />
          </linearGradient>

          {/* Mid Mountain Range Gradient */}
          <linearGradient id="peakMid" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#312E81" />
            <stop offset="40%" stopColor="#1E1B4B" />
            <stop offset="100%" stopColor="#0F172A" />
          </linearGradient>

          {/* Foreground Mountain Gradient */}
          <linearGradient id="peakFront" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#172554" />
            <stop offset="50%" stopColor="#0F172A" />
            <stop offset="100%" stopColor="#080B14" />
          </linearGradient>

          {/* Smooth Fade to Dashboard Surface */}
          <linearGradient id="bottomFade" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#080B14" stopOpacity="0" />
            <stop offset="45%" stopColor="#080B14" stopOpacity="0.3" />
            <stop offset="80%" stopColor="#080B14" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#080B14" stopOpacity="1" />
          </linearGradient>
        </defs>

        {/* Sky Background */}
        <rect width="1200" height="480" fill="url(#skyGrad)" />

        {/* Stars */}
        <circle cx="150" cy="45" r="1.2" fill="#FFFFFF" opacity="0.8" />
        <circle cx="280" cy="80" r="1.5" fill="#FFFFFF" opacity="0.9" />
        <circle cx="420" cy="35" r="1" fill="#FFFFFF" opacity="0.7" />
        <circle cx="650" cy="60" r="1.8" fill="#FFFFFF" opacity="0.85" />
        <circle cx="820" cy="40" r="1.2" fill="#FFFFFF" opacity="0.75" />
        <circle cx="980" cy="75" r="1.4" fill="#FFFFFF" opacity="0.9" />
        <circle cx="1120" cy="30" r="1" fill="#FFFFFF" opacity="0.6" />

        {/* Far Snowcapped Mountain Peaks */}
        <path
          d="M0 320 L120 220 L240 280 L360 170 L480 260 L600 140 L720 250 L840 180 L960 270 L1080 190 L1200 290 L1200 480 L0 480 Z"
          fill="url(#peakDistant)"
        />

        {/* Snow Peak Highlights */}
        <polygon points="360,170 330,210 355,200 375,215 390,205" fill="#E0E7FF" opacity="0.5" />
        <polygon points="600,140 565,190 595,180 620,195 640,185" fill="#E0E7FF" opacity="0.6" />
        <polygon points="840,180 815,220 835,210 855,225" fill="#E0E7FF" opacity="0.45" />
        <polygon points="1080,190 1055,230 1075,220 1095,235" fill="#E0E7FF" opacity="0.4" />

        {/* Mid Mountain Ridge */}
        <path
          d="M0 360 L180 270 L340 330 L510 230 L680 320 L860 240 L1040 310 L1200 250 L1200 480 L0 480 Z"
          fill="url(#peakMid)"
          opacity="0.95"
        />

        {/* Foreground Mountain Ridges */}
        <path
          d="M0 400 L220 310 L440 370 L640 280 L880 360 L1100 290 L1200 340 L1200 480 L0 480 Z"
          fill="url(#peakFront)"
        />

        {/* Bottom Fade to Solid App Background */}
        <rect width="1200" height="480" fill="url(#bottomFade)" />
      </svg>
    </div>
  );
}
