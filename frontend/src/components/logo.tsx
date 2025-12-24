import React from 'react';

const Logo = () => {
  return (
    <div className="flex items-center gap-2 group-data-[collapsible=icon]:justify-center">
      <svg
        width="32"
        height="32"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
      >
        <path
          d="M16 2.66663C8.63619 2.66663 2.66669 8.63613 2.66669 16C2.66669 23.3638 8.63619 29.3333 16 29.3333C23.3639 29.3333 29.3334 23.3638 29.3334 16C29.3334 8.63613 23.3639 2.66663 16 2.66663Z"
          fill="hsl(var(--primary))"
        />
        <path
          d="M20 12L12 20"
          stroke="hsl(var(--primary-foreground))"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M12 12L20 20"
          stroke="hsl(var(--primary-foreground))"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span className="font-headline text-xl font-bold text-sidebar-foreground group-data-[collapsible=icon]:hidden">
        LingoLancers
      </span>
    </div>
  );
};

export default Logo;
