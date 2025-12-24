import React from 'react';

export const TwilioIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 256 256"
    xmlns="http://www.w3.org/2000/svg"
    preserveAspectRatio="xMidYMid"
    {...props}
  >
    <defs>
      <radialGradient
        id="a"
        cx="29.04%"
        cy="28.92%"
        r="100%"
        fx="29.04%"
        fy="28.92%"
      >
        <stop offset="0%" stopColor="#fff" />
        <stop offset="100%" stopColor="#F22F46" />
      </radialGradient>
    </defs>
    <path
      d="M128 0C57.31 0 0 57.31 0 128s57.31 128 128 128 128-57.31 128-128S198.69 0 128 0Z"
      fill="url(#a)"
      fillRule="evenodd"
    />
  </svg>
);
