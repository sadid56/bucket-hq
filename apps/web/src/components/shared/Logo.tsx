import React from "react";

interface LogoProps {
  size?: number;
  color?: string;
}

export function Logo({ size = 24, color = "var(--chakra-colors-teal-500)" }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: "inline-block", verticalAlign: "middle" }}
    >
      {/* Outer shield representing secure hosting */}
      <path
        d="M12 2.5L20 6.5V13.5C20 17.8 16.6 20.8 12 21.8C7.4 20.8 4 17.8 4 13.5V6.5L12 2.5Z"
        stroke={color}
        strokeWidth="2"
        strokeLinejoin="round"
        opacity="0.25"
      />
      {/* Professional minimal storage bucket */}
      <path
        d="M8.5 8.5L9.5 15.2C9.6 15.8 10.2 16.3 10.9 16.3H13.1C13.8 16.3 14.4 15.8 14.5 15.2L15.5 8.5"
        stroke={color}
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Bucket Handle */}
      <path
        d="M10.2 8.5C10.2 7.5 11 6.7 12 6.7C13 6.7 13.8 7.5 13.8 8.5"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      {/* Storage Disk Indicator (database record) */}
      <line x1="10.5" y1="12" x2="13.5" y2="12" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
