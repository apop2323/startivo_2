import React from 'react';

function HexLogo({ size = 32 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <path d="M16 2L28 9V23L16 30L4 23V9L16 2Z" fill="#FF5C00"/>
      <path d="M11 16L14 11L17 16L14 21L11 16Z" fill="white"/>
      <path d="M17 13L21 16L17 19" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    </svg>
  );
}

export default HexLogo;
