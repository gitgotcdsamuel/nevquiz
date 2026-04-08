'use client';

import { AlertCircle, Clock, Calendar, Lock, AlertTriangle, Info } from 'lucide-react';

interface ExamStatusMessageProps {
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  details?: string[];
}

export function ExamStatusMessage({ type, title, message, details }: ExamStatusMessageProps) {
  const config = {
    info: {
      icon: <Info className="h-5 w-5 text-blue-500" />,
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      textColor: 'text-blue-800',
    },
    warning: {
      icon: <AlertTriangle className="h-5 w-5 text-yellow-500" />,
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      textColor: 'text-yellow-800',
    },
    error: {
      icon: <AlertCircle className="h-5 w-5 text-red-500" />,
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      textColor: 'text-red-800',
    },
    success: {
      icon: <Info className="h-5 w-5 text-green-500" />,
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      textColor: 'text-green-800',
    },
  };

  const { icon, bgColor, borderColor, textColor } = config[type] || config.info;

  return (
    <div className={`${bgColor} border ${borderColor} rounded-lg p-4`}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">{icon}</div>
        <div className="flex-1">
          <h3 className={`font-semibold ${textColor}`}>{title}</h3>
          <p className={`mt-1 text-sm ${textColor}`}>{message}</p>
          {details && details.length > 0 && (
            <ul className="mt-2 text-sm space-y-1">
              {details.map((detail, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-gray-500">•</span>
                  <span className={textColor}>{detail}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}