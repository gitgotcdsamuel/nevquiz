// components/student/DashboardCharts.tsx
'use client';

import { Card, CardContent } from '@/components/ui/Card';
import { Award, TrendingUp } from 'lucide-react';

interface DashboardChartsProps {
  averageScore: number;
  performanceData: Array<{ date: Date; score: number; examTitle: string }>;
  subjectAverages: Array<{ subject: string; average: number }>;
  totalExams: number;
  passedExams: number;
}

export function DashboardCharts({ 
  averageScore, 
  performanceData, 
  subjectAverages, 
  totalExams, 
  passedExams 
}: DashboardChartsProps) {
  
  // Calculate progress ring percentage
  const passRate = totalExams > 0 ? (passedExams / totalExams) * 100 : 0;
  const ringSize = 180; // Increased from 120 to 180
  const radius = 70; // Increased from 45 to 70
  const strokeWidth = 12; // Increased from 8 to 12
  const ringCircumference = 2 * Math.PI * radius;
  const ringOffset = ringCircumference - (passRate / 100) * ringCircumference;

  return (
    <>
      {/* Progress Ring Card - Made larger */}
      <Card className="overflow-hidden hover:shadow-lg transition-shadow">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Overall Performance</h3>
          <div className="flex items-center justify-center">
            <div className="relative w-64 h-64"> {/* Increased from w-48 h-48 to w-64 h-64 */}
              {/* Background ring */}
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="128" // Adjusted from 96 to 128
                  cy="128" // Adjusted from 96 to 128
                  r={radius}
                  stroke="currentColor"
                  strokeWidth={strokeWidth}
                  fill="transparent"
                  className="text-gray-200"
                />
                <circle
                  cx="128" // Adjusted from 96 to 128
                  cy="128" // Adjusted from 96 to 128
                  r={radius}
                  stroke="currentColor"
                  strokeWidth={strokeWidth}
                  fill="transparent"
                  strokeDasharray={ringCircumference}
                  strokeDashoffset={ringOffset}
                  strokeLinecap="round"
                  className="text-primary-600 transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-4xl font-bold text-gray-900">{passRate.toFixed(0)}%</span>
                <span className="text-sm text-gray-600 mt-1">Pass Rate</span>
                <div className="flex items-center mt-2 text-sm text-gray-500">
                  <Award className="h-4 w-4 mr-1" />
                  {passedExams}/{totalExams} passed
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-6 grid grid-cols-2 gap-4 text-center">
            <div className="p-3 bg-green-50 rounded-lg">
              <p className="text-xs text-gray-600">Average Score</p>
              <p className="text-2xl font-bold text-green-600">{averageScore}%</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-xs text-gray-600">Best Score</p>
              <p className="text-2xl font-bold text-blue-600">
                {performanceData.length > 0 
                  ? Math.max(...performanceData.map(d => d.score)) 
                  : 0}%
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Subject Performance Card */}
      <Card className="overflow-hidden hover:shadow-lg transition-shadow">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Subject Performance</h3>
          <div className="space-y-4">
            {subjectAverages.length > 0 ? (
              subjectAverages.slice(0, 5).map((subject) => (
                <div key={subject.subject} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">{subject.subject}</span>
                    <span className="font-medium text-gray-900">{subject.average}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className={`h-2.5 rounded-full ${
                        subject.average >= 80 ? 'bg-green-500' : 
                        subject.average >= 60 ? 'bg-blue-500' : 'bg-yellow-500'
                      }`}
                      style={{ width: `${subject.average}%` }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 py-4">No data available yet</p>
            )}
          </div>

          {performanceData.length > 0 && (
            <div className="mt-6">
              <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                <TrendingUp className="h-4 w-4 mr-1" />
                Recent Trend
              </h4>
              <div className="flex items-end h-32 gap-2"> {/* Increased height from h-24 to h-32 */}
                {performanceData.slice(-5).map((data, index) => (
                  <div key={index} className="flex-1 flex flex-col items-center">
                    <div 
                      className="w-full bg-primary-500 rounded-t-lg"
                      style={{ height: `${data.score * 0.8}px` }}
                    />
                    <span className="text-xs text-gray-500 mt-2 font-medium">
                      {data.score}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}