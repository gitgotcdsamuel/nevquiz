// components/student/CalendarModal.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Calendar as CalendarIcon, X, ChevronLeft, ChevronRight, Clock, MapPin, Users } from 'lucide-react';
import Link from 'next/link';

interface Exam {
  id: string;
  title: string;
  courseCode: string;
  courseName: string;
  startTime: Date;
  endTime: Date;
  duration: number;
}

interface CalendarModalProps {
  exams: Exam[];
}

export function CalendarModal({ exams }: CalendarModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();

    return { daysInMonth, startingDay };
  };

  const { daysInMonth, startingDay } = getDaysInMonth(currentMonth);
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
    setSelectedDate(null);
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
    setSelectedDate(null);
  };

  const getExamsForDate = (day: number) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    return exams.filter(exam => {
      const examDate = new Date(exam.startTime);
      return examDate.toDateString() === date.toDateString();
    });
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const hasExamsOnDate = (day: number) => {
    return getExamsForDate(day).length > 0;
  };

  const upcomingExams = exams
    .filter(exam => new Date(exam.startTime) > new Date())
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
    .slice(0, 5);

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="flex items-center"
      >
        <CalendarIcon className="h-4 w-4 mr-2" />
        Calendar
      </Button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Exam Calendar</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Calendar Section */}
                <div className="lg:col-span-2">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-medium text-gray-900">
                      {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                    </h3>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={prevMonth}
                        className="p-2 hover:bg-gray-100 rounded-full"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      <button
                        onClick={nextMonth}
                        className="p-2 hover:bg-gray-100 rounded-full"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>
                    </div>
                  </div>

                  {/* Calendar Header */}
                  <div className="grid grid-cols-7 gap-1 mb-2">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                      <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                        {day}
                      </div>
                    ))}
                  </div>

                  {/* Calendar Days */}
                  <div className="grid grid-cols-7 gap-1">
                    {Array.from({ length: startingDay }).map((_, index) => (
                      <div key={`empty-${index}`} className="aspect-square p-2" />
                    ))}
                    
                    {Array.from({ length: daysInMonth }).map((_, index) => {
                      const day = index + 1;
                      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
                      const isToday = new Date().toDateString() === date.toDateString();
                      const hasExams = hasExamsOnDate(day);
                      const isSelected = selectedDate?.getDate() === day;

                      return (
                        <button
                          key={day}
                          onClick={() => setSelectedDate(hasExams ? date : null)}
                          disabled={!hasExams}
                          className={`aspect-square p-2 rounded-lg border transition-all ${
                            isSelected
                              ? 'border-primary-600 bg-primary-50 ring-2 ring-primary-200'
                              : isToday
                              ? 'border-primary-500 bg-primary-50'
                              : hasExams
                              ? 'border-blue-200 bg-blue-50 hover:border-blue-400 cursor-pointer'
                              : 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                          }`}
                        >
                          <div className="h-full flex flex-col">
                            <span className={`text-sm ${isToday ? 'font-bold text-primary-600' : ''}`}>
                              {day}
                            </span>
                            {hasExams && (
                              <div className="mt-auto">
                                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mx-auto" />
                              </div>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Details Section */}
                <div className="lg:col-span-1">
                  {selectedDate ? (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-3">
                        {selectedDate.toLocaleDateString('en-US', { 
                          weekday: 'long',
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </h4>
                      <div className="space-y-3">
                        {getExamsForDate(selectedDate.getDate()).map(exam => (
                          <div key={exam.id} className="p-3 bg-white rounded-lg border hover:shadow-md transition-shadow">
                            <h5 className="font-medium text-gray-900">{exam.title}</h5>
                            <p className="text-sm text-gray-600 mt-1">{exam.courseCode}</p>
                            <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                              <Clock className="h-4 w-4" />
                              <span>{formatTime(exam.startTime)} - {formatTime(exam.endTime)}</span>
                            </div>
                            <div className="mt-3">
                              <Button size="sm" className="w-full" asChild>
                                <Link href={`/student/exams/take/${exam.id}`}>
                                  View Details
                                </Link>
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-3">Upcoming Exams</h4>
                      <div className="space-y-3">
                        {upcomingExams.map(exam => {
                          const startDate = new Date(exam.startTime);
                          const daysUntil = Math.ceil((startDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                          
                          return (
                            <div key={exam.id} className="p-3 bg-white rounded-lg border hover:shadow-md transition-shadow">
                              <div className="flex items-start justify-between">
                                <div>
                                  <h5 className="font-medium text-gray-900">{exam.title}</h5>
                                  <p className="text-sm text-gray-600">{exam.courseCode}</p>
                                </div>
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                  daysUntil <= 1 ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                                }`}>
                                  {daysUntil === 0 ? 'Today' : daysUntil === 1 ? 'Tomorrow' : `${daysUntil}d`}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                                <Clock className="h-4 w-4" />
                                <span>{formatTime(exam.startTime)}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-white border-t px-6 py-4 flex justify-end">
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}