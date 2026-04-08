'use client';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}

export function Skeleton({ children, className = '', ...props }: SkeletonProps) {
  return (
    <div 
      className={`animate-pulse rounded-md bg-gray-200 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}