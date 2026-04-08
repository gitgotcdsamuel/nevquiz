import { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';
import { AlertCircle, CheckCircle, Info, XCircle } from 'lucide-react';

interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'info' | 'success' | 'warning' | 'danger';
  title?: string;
}

export function Alert({
  variant = 'info',
  title,
  children,
  className,
  ...props
}: AlertProps) {
  const variants = {
    info: {
      bg: 'bg-primary-50',
      border: 'border-primary-200',
      text: 'text-primary-900',
      icon: Info,
      iconColor: 'text-primary-600',
    },
    success: {
      bg: 'bg-success-50',
      border: 'border-success-200',
      text: 'text-success-900',
      icon: CheckCircle,
      iconColor: 'text-success-600',
    },
    warning: {
      bg: 'bg-warning-50',
      border: 'border-warning-200',
      text: 'text-warning-900',
      icon: AlertCircle,
      iconColor: 'text-warning-600',
    },
    danger: {
      bg: 'bg-danger-50',
      border: 'border-danger-200',
      text: 'text-danger-900',
      icon: XCircle,
      iconColor: 'text-danger-600',
    },
  };

  const { bg, border, text, icon: Icon, iconColor } = variants[variant];

  return (
    <div
      className={cn(
        'rounded-lg border p-4',
        bg,
        border,
        text,
        className
      )}
      {...props}
    >
      <div className="flex">
        <div className="flex-shrink-0">
          <Icon className={cn('h-5 w-5', iconColor)} />
        </div>
        <div className="ml-3 flex-1">
          {title && (
            <h3 className="text-sm font-medium mb-1">{title}</h3>
          )}
          <div className="text-sm">{children}</div>
        </div>
      </div>
    </div>
  );
}
