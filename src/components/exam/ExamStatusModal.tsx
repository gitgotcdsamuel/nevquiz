'use client';

import { X, Clock, Calendar, AlertCircle, CheckCircle, Lock, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/Card';

interface ExamStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  status: 'UPCOMING' | 'COMPLETED' | 'DRAFT' | 'ARCHIVED' | 'NOT_FOUND' | 'MAX_ATTEMPTS' | 'UNAUTHORIZED' | 'ERROR';
  examData?: {
    title?: string;
    startTime?: string;
    endTime?: string;
    remainingTime?: string;
    attemptsTaken?: number;
    maxAttempts?: number;
    lecturerName?: string;
  };
}

export function ExamStatusModal({ isOpen, onClose, status, examData }: ExamStatusModalProps) {
  if (!isOpen) return null;

  const statusConfig: Record<string, any> = {
    UPCOMING: {
      icon: <Clock className="h-12 w-12 text-blue-500" />,
      title: 'Exam Not Started Yet',
      description: 'This exam is scheduled to start soon.',
      color: 'blue',
      details: examData?.startTime ? (
        <>
          <p className="text-sm text-gray-600 mb-2">
            <strong>Exam Title:</strong> {examData.title}
          </p>
          <p className="text-sm text-gray-600 mb-2">
            <strong>Starts:</strong> {new Date(examData.startTime).toLocaleString()}
          </p>
          <p className="text-sm text-gray-600 mb-2">
            <strong>Ends:</strong> {new Date(examData.endTime || '').toLocaleString()}
          </p>
          {examData.remainingTime && (
            <p className="text-sm text-gray-600">
              <strong>Time remaining:</strong> {examData.remainingTime}
            </p>
          )}
        </>
      ) : null,
      actionText: 'Set Reminder',
      secondaryActionText: 'View Details',
    },
    COMPLETED: {
      icon: <Calendar className="h-12 w-12 text-gray-500" />,
      title: 'Exam Has Ended',
      description: 'The exam period has passed.',
      color: 'gray',
      details: examData?.endTime ? (
        <>
          <p className="text-sm text-gray-600 mb-2">
            <strong>Exam Title:</strong> {examData.title}
          </p>
          <p className="text-sm text-gray-600 mb-2">
            <strong>Ended:</strong> {new Date(examData.endTime).toLocaleString()}
          </p>
          {examData.attemptsTaken !== undefined && (
            <p className="text-sm text-gray-600">
              <strong>Your attempts:</strong> {examData.attemptsTaken}/{examData.maxAttempts || 1}
            </p>
          )}
        </>
      ) : null,
      actionText: 'View Results',
      secondaryActionText: 'Contact Lecturer',
    },
    DRAFT: {
      icon: <AlertCircle className="h-12 w-12 text-yellow-500" />,
      title: 'Exam Not Published',
      description: 'This exam is still being prepared by your lecturer.',
      color: 'yellow',
      details: examData?.lecturerName ? (
        <>
          <p className="text-sm text-gray-600 mb-2">
            <strong>Lecturer:</strong> {examData.lecturerName}
          </p>
          <p className="text-sm text-gray-600">
            The exam will be available once published by your lecturer.
          </p>
        </>
      ) : null,
      actionText: 'Check Later',
      secondaryActionText: null,
    },
    ARCHIVED: {
      icon: <Lock className="h-12 w-12 text-red-500" />,
      title: 'Exam Archived',
      description: 'This exam is no longer available.',
      color: 'red',
      details: (
        <p className="text-sm text-gray-600">
          Archived exams cannot be accessed. Please contact your lecturer if you believe this is an error.
        </p>
      ),
      actionText: 'Contact Support',
      secondaryActionText: null,
    },
    NOT_FOUND: {
      icon: <AlertTriangle className="h-12 w-12 text-orange-500" />,
      title: 'Exam Not Found',
      description: 'No exam matches the code you entered.',
      color: 'orange',
      details: (
        <div className="space-y-2">
          <p className="text-sm text-gray-600">
            Please check that you've entered the correct 8-character exam code.
          </p>
          <ul className="text-sm text-gray-600 list-disc pl-5">
            <li>Check for typos in the code</li>
            <li>Ensure you're using the right exam code</li>
            <li>Contact your lecturer for the correct code</li>
          </ul>
        </div>
      ),
      actionText: 'Try Again',
      secondaryActionText: 'Contact Lecturer',
    },
    MAX_ATTEMPTS: {
      icon: <AlertCircle className="h-12 w-12 text-red-500" />,
      title: 'Maximum Attempts Reached',
      description: 'You have already taken this exam the maximum number of times.',
      color: 'red',
      details: examData?.maxAttempts ? (
        <>
          <p className="text-sm text-gray-600 mb-2">
            <strong>Exam Title:</strong> {examData.title}
          </p>
          <p className="text-sm text-gray-600">
            <strong>Attempts:</strong> {examData.attemptsTaken}/{examData.maxAttempts} attempts used
          </p>
        </>
      ) : null,
      actionText: 'View Previous Attempts',
      secondaryActionText: 'Request Extra Attempt',
    },
    UNAUTHORIZED: {
      icon: <Lock className="h-12 w-12 text-red-500" />,
      title: 'Access Denied',
      description: 'You are not authorized to take this exam.',
      color: 'red',
      details: (
        <div className="space-y-2">
          <p className="text-sm text-gray-600">
            This exam may be restricted to specific students or departments.
          </p>
          <ul className="text-sm text-gray-600 list-disc pl-5">
            <li>Check if you're enrolled in the correct course</li>
            <li>Verify with your lecturer about exam access</li>
            <li>Ensure you're using the right student account</li>
          </ul>
        </div>
      ),
      actionText: 'Contact Lecturer',
      secondaryActionText: 'Switch Account',
    },
    ERROR: {
      icon: <AlertCircle className="h-12 w-12 text-red-500" />,
      title: 'Error',
      description: 'An error occurred while checking the exam.',
      color: 'red',
      details: (
        <p className="text-sm text-gray-600">
          Please try again or contact support if the problem persists.
        </p>
      ),
      actionText: 'Try Again',
      secondaryActionText: 'Contact Support',
    },
  };

  const config = statusConfig[status] || statusConfig.ERROR;

  const handleAction = () => {
    switch (status) {
      case 'UPCOMING':
        // Set reminder logic
        alert('Reminder set! You will be notified when the exam starts.');
        break;
      case 'COMPLETED':
        // View results
        window.location.href = `/student/results?exam=${examData?.title}`;
        break;
      case 'DRAFT':
      case 'ARCHIVED':
      case 'NOT_FOUND':
      case 'UNAUTHORIZED':
      case 'ERROR':
        // Just close for these
        break;
      case 'MAX_ATTEMPTS':
        // View previous attempts
        window.location.href = `/student/attempts`;
        break;
    }
    onClose();
  };

  const handleSecondaryAction = () => {
    switch (status) {
      case 'UPCOMING':
        // View exam details
        alert('Exam details would be shown here');
        break;
      case 'COMPLETED':
      case 'NOT_FOUND':
      case 'UNAUTHORIZED':
        // Contact lecturer
        window.location.href = `/messages?to=lecturer`;
        break;
      case 'MAX_ATTEMPTS':
        // Request extra attempt
        window.location.href = `/requests/extra-attempt`;
        break;
      case 'ERROR':
        // Contact support
        window.location.href = `/support`;
        break;
    }
    onClose();
  };

  const getColorClass = (color: string) => {
    const colorMap: Record<string, string> = {
      blue: 'text-blue-700',
      gray: 'text-gray-700',
      yellow: 'text-yellow-700',
      red: 'text-red-700',
      orange: 'text-orange-700',
    };
    return colorMap[color] || 'text-gray-700';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="relative">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 p-1 hover:bg-gray-100 rounded-full"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="flex flex-col items-center text-center">
            <div className="mb-4">{config.icon}</div>
            <CardTitle className={`text-xl ${getColorClass(config.color)}`}>
              {config.title}
            </CardTitle>
            <p className="text-gray-600 mt-2">{config.description}</p>
          </div>
        </CardHeader>
        
        {config.details && (
          <CardContent>
            <div className="bg-gray-50 p-4 rounded-lg">
              {config.details}
            </div>
          </CardContent>
        )}

        <CardFooter className="flex flex-col space-y-3">
          <Button 
            onClick={handleAction} 
            className="w-full"
            variant={status === 'UPCOMING' ? 'default' : 'outline'}
          >
            {config.actionText}
          </Button>
          
          {config.secondaryActionText && (
            <Button 
              onClick={handleSecondaryAction} 
              variant="ghost" 
              className="w-full"
            >
              {config.secondaryActionText}
            </Button>
          )}
          
          <Button 
            onClick={onClose} 
            variant="ghost" 
            className="w-full"
          >
            Close
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}