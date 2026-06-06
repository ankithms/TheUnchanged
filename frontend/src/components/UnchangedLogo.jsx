import React from 'react';

const UnchangedLogo = ({ size = 40, style = {} }) => {
  return (
    <svg 
      viewBox="0 0 100 100" 
      width={size} 
      height={size} 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="3" 
      strokeLinecap="round" 
      strokeLinejoin="round"
      style={{ display: 'inline-block', verticalAlign: 'middle', ...style }}
    >
      {/* Hand-drawn character body (puppet/bean shape) */}
      <path d="M 28 85 C 28 45, 34 32, 50 32 C 66 32, 72 45, 72 85" />
      
      {/* Left Arm raised up */}
      <path d="M 38 45 L 24 18" />
      {/* Left Hand Fingers */}
      <path d="M 24 18 L 18 12" />
      {/* Finger 2 */}
      <path d="M 24 18 L 24 10" />
      {/* Finger 3 */}
      <path d="M 24 18 L 30 14" />
      
      {/* Right Arm raised up */}
      <path d="M 62 45 L 76 18" />
      {/* Right Hand Fingers */}
      <path d="M 76 18 L 70 14" />
      {/* Finger 2 */}
      <path d="M 76 18 L 76 10" />
      {/* Finger 3 */}
      <path d="M 76 18 L 82 12" />
      
      {/* Eyes */}
      <circle cx="45" cy="48" r="1.5" fill="currentColor" />
      <circle cx="55" cy="48" r="1.5" fill="currentColor" />
    </svg>
  );
};

export default UnchangedLogo;
