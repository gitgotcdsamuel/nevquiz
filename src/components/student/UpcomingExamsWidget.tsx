// components/student/UpcomingExamsWidget.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Calendar, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
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

interface UpcomingExamsWidgetProps {
  exams: Exam[];
}

export function UpcomingExamsWidget({ exams }: UpcomingExamsWidgetProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay(); // 0 = Sunday, 1 = Monday, etc.

    return { daysInMonth, startingDay };
  };

  const { daysInMonth, startingDay } = getDaysInMonth(currentMonth);
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
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

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-primary-600" />
            Upcoming Exams Calendar
          </CardTitle>
          <div className="flex items-center gap-2">
            <button onClick={prevMonth} className="p-1 hover:bg-gray-100 rounded">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-sm font-medium">
              {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </span>
            <button onClick={nextMonth} className="p-1 hover:bg-gray-100 rounded">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Calendar Header */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
            <div key={day} className="text-center text-xs font-medium text-gray-500 py-1">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: startingDay }).map((_, index) => (
            <div key={`empty-${index}`} className="aspect-square p-1" />
          ))}
          
          {Array.from({ length: daysInMonth }).map((_, index) => {
            const day = index + 1;
            const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
            const isToday = new Date().toDateString() === date.toDateString();
            const dayExams = getExamsForDate(day);
            const hasExams = dayExams.length > 0;

            return (
              <div
                key={day}
                onClick={() => hasExams && setSelectedDate(selectedDate?.getDate() === day ? null : date)}
                className={`aspect-square p-1 rounded-lg border cursor-pointer transition-colors ${
                  isToday ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-primary-300'
                } ${hasExams ? 'bg-blue-50' : ''}`}
              >
                <div className="h-full flex flex-col">
                  <span className={`text-xs ${isToday ? 'font-bold text-primary-600' : ''}`}>
                    {day}
                  </span>
                  {hasExams && (
                    <div className="mt-auto">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mx-auto" />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Date Exams */}
        {selectedDate && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-medium text-gray-900 mb-2">
              Exams on {selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </h4>
            {getExamsForDate(selectedDate.getDate()).length > 0 ? (
              <div className="space-y-2">
                {getExamsForDate(selectedDate.getDate()).map(exam => (
                  <div key={exam.id} className="flex items-center justify-between p-2 bg-white rounded border">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{exam.title}</p>
                      <p className="text-xs text-gray-600">{exam.courseCode} • {exam.duration} mins</p>
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-3 w-3 text-gray-400 mr-1" />
                      <span className="text-xs text-gray-600">{formatTime(exam.startTime)}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No exams scheduled</p>
            )}
          </div>
        )}

        {/* Upcoming Exams List */}
        {exams.length > 0 && !selectedDate && (
          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Next Upcoming Exams</h4>
            <div className="space-y-2">
              {exams.slice(0, 3).map(exam => {
                const startDate = new Date(exam.startTime);
                const daysUntil = Math.ceil((startDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                
                return (
                  <div key={exam.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{exam.title}</p>
                      <p className="text-xs text-gray-600">{exam.courseCode}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-medium text-primary-600">
                        {daysUntil === 0 ? 'Today' : daysUntil === 1 ? 'Tomorrow' : `In ${daysUntil} days`}
                      </p>
                      <p className="text-xs text-gray-500">{formatTime(startDate)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {exams.length === 0 && (
          <p className="text-center text-gray-500 py-4">No upcoming exams scheduled</p>
        )}
      </CardContent>
    </Card>
  );
}