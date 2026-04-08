'use client';

import { forwardRef, HTMLAttributes } from 'react';

// Interface for Card props
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

// Card component with forwardRef
export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ children, className = '', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`bg-white rounded-lg border border-gray-200 shadow-sm ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);
Card.displayName = 'Card';

// CardHeader component
export const CardHeader = forwardRef<HTMLDivElement, CardProps>(
  ({ children, className = '', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`px-6 py-4 border-b border-gray-200 ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);
CardHeader.displayName = 'CardHeader';

// CardTitle component
export const CardTitle = forwardRef<HTMLHeadingElement, CardProps>(
  ({ children, className = '', ...props }, ref) => {
    return (
      <h3
        ref={ref}
        className={`text-lg font-semibold text-gray-900 ${className}`}
        {...props}
      >
        {children}
      </h3>
    );
  }
);
CardTitle.displayName = 'CardTitle';

// CardDescription component
export const CardDescription = forwardRef<HTMLParagraphElement, CardProps>(
  ({ children, className = '', ...props }, ref) => {
    return (
      <p
        ref={ref}
        className={`text-sm text-gray-600 ${className}`}
        {...props}
      >
        {children}
      </p>
    );
  }
);
CardDescription.displayName = 'CardDescription';

// CardContent component
export const CardContent = forwardRef<HTMLDivElement, CardProps>(
  ({ children, className = '', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`px-6 py-4 ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);
CardContent.displayName = 'CardContent';

// CardFooter component (new addition)
export const CardFooter = forwardRef<HTMLDivElement, CardProps>(
  ({ children, className = '', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`px-6 py-4 border-t border-gray-200 ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);
CardFooter.displayName = 'CardFooter';