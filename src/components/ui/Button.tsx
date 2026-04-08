// src/components/ui/button.tsx
import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  asChild?: boolean; // ✅ Add asChild prop
}

// Add buttonVariants for shadcn compatibility (used by alert-dialog, dialog, etc.)
const buttonVariants = cva(
  "inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed",
  {
    variants: {
      variant: {
        primary: "bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500",
        secondary: "bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500",
        danger: "bg-danger-600 text-white hover:bg-danger-700 focus:ring-danger-500",
        success: "bg-success-600 text-white hover:bg-success-700 focus:ring-success-500",
        outline: "border-2 border-primary-600 text-primary-600 hover:bg-primary-50 focus:ring-primary-500",
        // Extra variants for shadcn compatibility
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        ghost: "hover:bg-accent hover:text-accent-foreground",
      },
      size: {
        sm: "px-3 py-1.5 text-sm",
        md: "px-4 py-2 text-base",
        lg: "px-6 py-3 text-lg",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      disabled,
      asChild = false, // ✅ Handle asChild prop
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles = buttonVariants({ variant, size });

    // Filter out non-DOM props
    const filteredProps = { ...props };
    delete filteredProps.isLoading;
    delete filteredProps.asChild; // ✅ Remove asChild from props

    // If asChild is true, render as a child element (like a Link or a)
    if (asChild) {
      return (
        <span
          ref={ref}
          className={cn(baseStyles, className)}
          {...filteredProps}
        >
          {isLoading && (
            <svg
              className="animate-spin -ml-1 mr-2 h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          )}
          {children}
        </span>
      );
    }

    return (
      <button
        ref={ref}
        className={cn(baseStyles, className)}
        disabled={disabled || isLoading}
        {...filteredProps}
      >
        {isLoading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

// Export buttonVariants so shadcn components (alert-dialog, etc.) can use it
export { buttonVariants };