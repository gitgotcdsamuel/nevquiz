'use client';

import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';

interface PerformanceData {
  month: string;
  avgScore: number;
  students: number;
  exams: number;
}

interface PerformanceChartProps {
  data?: PerformanceData[];
  loading?: boolean;
}

export function PerformanceChart({ data, loading = false }: PerformanceChartProps) {
  const [timeRange, setTimeRange] = useState('6months');

  // Sample data for demo
  const defaultData = [
    { month: 'Jan', avgScore: 72, students: 120, exams: 3 },
    { month: 'Feb', avgScore: 75, students: 125, exams: 4 },
    { month: 'Mar', avgScore: 78, students: 130, exams: 5 },
    { month: 'Apr', avgScore: 76, students: 135, exams: 4 },
    { month: 'May', avgScore: 80, students: 140, exams: 6 },
    { month: 'Jun', avgScore: 82, students: 145, exams: 5 },
  ];

  const chartData = data || defaultData;

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-80 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Performance Over Time</CardTitle>
          <CardDescription>Average score trends over the last 6 months</CardDescription>
        </div>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="rounded-md border border-gray-300 bg-white px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="1month">Last Month</option>
          <option value="3months">Last 3 Months</option>
          <option value="6months">Last 6 Months</option>
          <option value="1year">Last Year</option>
        </select>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" />
              <YAxis domain={[0, 100]} />
              <Tooltip
                formatter={(value) => [`${value}%`, 'Average Score']}
                labelFormatter={(label) => `Month: ${label}`}
              />
              <Area
                type="monotone"
                dataKey="avgScore"
                stroke="#3b82f6"
                fill="#93c5fd"
                fillOpacity={0.3}
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}