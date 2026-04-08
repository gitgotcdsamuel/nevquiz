'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';

interface ScoreDistributionData {
  range: string;
  students: number;
  percentage: number;
}

interface ScoreDistributionChartProps {
  data?: ScoreDistributionData[];
  loading?: boolean;
}

export function ScoreDistributionChart({ data, loading = false }: ScoreDistributionChartProps) {
  const defaultData = [
    { range: '90-100', students: 25, percentage: 17.2, color: '#22c55e' },
    { range: '80-89', students: 40, percentage: 27.6, color: '#3b82f6' },
    { range: '70-79', students: 35, percentage: 24.1, color: '#f59e0b' },
    { range: '60-69', students: 20, percentage: 13.8, color: '#ef4444' },
    { range: 'Below 60', students: 10, percentage: 6.9, color: '#6b7280' },
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
      <CardHeader>
        <CardTitle>Score Distribution</CardTitle>
        <CardDescription>Number of students in each score range</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="range" />
              <YAxis />
              <Tooltip
                formatter={(value, name) => {
                  if (name === 'students') return [value, 'Students'];
                  if (name === 'percentage') return [`${value}%`, 'Percentage'];
                  return value;
                }}
              />
              <Bar dataKey="students" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 grid grid-cols-2 md:grid-cols-5 gap-2">
          {chartData.map((item, index) => (
            <div key={index} className="flex items-center space-x-2">
              <div
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <div className="text-xs">
                <div className="font-medium">{item.range}</div>
                <div className="text-gray-600">{item.students} ({item.percentage}%)</div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}