import React from 'react';

interface IconProps {
  className?: string;
}

export const SteamIcon: React.FC<IconProps> = ({ className = 'w-4 h-4' }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    aria-hidden="true"
  >
    <path d="M12 2a10 10 0 0 0-10 10c0 4.73 3.3 8.7 7.74 9.71l2.58-3.76a3.54 3.54 0 0 1-.32-.23l-3.6 1.48a4.98 4.98 0 0 1-1.42-6.55 5.04 5.04 0 0 1 6.55-1.43l3.3-4.78A10 10 0 0 0 12 2zm3.3 7.85a3.15 3.15 0 1 1-4.46 4.46l-2.6 3.78a2.53 2.53 0 1 0 1.25.7l2.56-3.72a3.14 3.14 0 0 1 3.25-5.22zm-.54 1.77a1.38 1.38 0 1 0 0 2.76 1.38 1.38 0 0 0 0-2.76zM7.5 17.5a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5z" />
  </svg>
);
