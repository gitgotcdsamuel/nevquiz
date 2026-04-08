// components/exams/ReconductExamModal.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Calendar, Clock, X } from 'lucide-react';

interface Exam {
  id: string;
  title: string;
  description: string | null;
  duration: number;
}

interface ReconductExamModalProps {
  exam: Exam;
  children: React.ReactNode;
}

export function ReconductExamModal({ exam, children }: ReconductExamModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    startTime: '',
    endTime: '',
    duration: exam.duration,
  });
  const router = useRouter();

  // Set default dates when modal opens
  const handleOpen = () => {
    const defaultStart = new Date();
    defaultStart.setDate(defaultStart.getDate() + 7); // 7 days from now
    defaultStart.setHours(9, 0, 0, 0); // 9:00 AM
    
    const defaultEnd = new Date(defaultStart);
    defaultEnd.setMinutes(defaultEnd.getMinutes() + exam.duration);

    setFormData({
      startTime: defaultStart.toISOString().slice(0, 16),
      endTime: defaultEnd.toISOString().slice(0, 16),
      duration: exam.duration,
    });
    setIsOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/exams/reconduct', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          originalExamId: exam.id,
          startTime: formData.startTime,
          endTime: formData.endTime,
          duration: formData.duration,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to reconduct exam');
      }

      const data = await response.json();
      router.push(`/lecturer/exams/${data.exam.id}/edit`);
      router.refresh();
    } catch (error) {
      console.error('Error reconducting exam:', error);
      alert('Failed to reconduct exam. Please try again.');
    } finally {
      setIsLoading(false);
      setIsOpen(false);
    }
  };

  // Calculate end time when start time or duration changes
  const handleStartTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const startTime = e.target.value;
    setFormData(prev => {
      const start = new Date(startTime);
      const end = new Date(start.getTime() + prev.duration * 60000);
      return {
        ...prev,
        startTime,
        endTime: end.toISOString().slice(0, 16),
      };
    });
  };

  const handleDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const duration = parseInt(e.target.value) || 0;
    setFormData(prev => {
      if (prev.startTime) {
        const start = new Date(prev.startTime);
        const end = new Date(start.getTime() + duration * 60000);
        return {
          ...prev,
          duration,
          endTime: end.toISOString().slice(0, 16),
        };
      }
      return { ...prev, duration };
    });
  };

  return (
    <>
      <div onClick={handleOpen}>{children}</div>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-lg font-semibold">Reconduct Exam</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-4">
                  Create a new exam based on <span className="font-medium">{exam.title}</span> with updated schedule.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Time
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="datetime-local"
                      value={formData.startTime}
                      onChange={handleStartTimeChange}
                      className="w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Duration (minutes)
                  </label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="number"
                      value={formData.duration}
                      onChange={handleDurationChange}
                      min="1"
                      className="w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Time
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="datetime-local"
                      value={formData.endTime}
                      readOnly
                      className="w-full pl-10 pr-3 py-2 border rounded-lg bg-gray-50 text-gray-600"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Automatically calculated based on start time and duration
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                >
                  {isLoading ? 'Creating...' : 'Create Reconducted Exam'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}