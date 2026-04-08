// src/components/ui/Badge.tsx
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  children: ReactNode;
}

export function Badge({ 
  variant = 'default', 
  size = 'md', 
  interactive = false,
  className,
  children,
  onClick,
  ...props 
}: BadgeProps) {
  const variantClasses = {
    default: 'bg-gray-100 text-gray-800 border-gray-200',
    success: 'bg-green-100 text-green-800 border-green-200',
    warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    error: 'bg-red-100 text-red-800 border-red-200',
    info: 'bg-blue-100 text-blue-800 border-blue-200',
    secondary: 'bg-purple-100 text-purple-800 border-purple-200',
    ghost: 'bg-transparent text-gray-600 border-gray-300 hover:bg-gray-50'
  };

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base'
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-medium border',
        variantClasses[variant],
        sizeClasses[size],
        interactive && 'cursor-pointer hover:opacity-80 transition-opacity',
        className
      )}
      onClick={interactive ? onClick : undefined}
      {...props}
    >
      {children}
    </span>
  );
}