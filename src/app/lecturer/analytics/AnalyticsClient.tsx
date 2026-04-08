// src/app/lecturer/analytics/AnalyticsClient.tsx
'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { 
  Search, 
  Download, 
  TrendingUp,
  X 
} from 'lucide-react';
import { PerformanceChart } from '@/components/charts/PerformanceChart';
import { ScoreDistributionChart } from '@/components/charts/ScoreDistributionChart';
import { MoreFiltersModal } from '@/components/analytics/MoreFiltersModal';

interface AnalyticsData {
  stats: {
    totalStudents: number;
    avgScore: number;
    passRate: number;
    examsConducted: number;
    totalAttempts: number;
    totalMarks: number;
  };
  performanceOverTime: Array<{
    month: string;
    avgScore: number;
    students: number;
    exams: number;
  }>;
  scoreDistribution: Array<{
    range: string;
    students: number;
    percentage: number;
  }>;
  topStudents: Array<{
    id: string;
    name: string;
    studentId: string;
    avgScore: number;
    examsTaken: number;
    lastExam: string;
    lastScore: number;
    department: string;
    program: string;
    semester: number;
  }>;
}

interface Filters {
  department?: string;
  program?: string;
  semester?: string;
  minScore?: string;
  maxScore?: string;
  examType?: string;
  dateFrom?: string;
  dateTo?: string;
}

// Your original mock data (kept intact)
const MOCK_DATA: Record<string, AnalyticsData> = {
  '1month': {
    stats: { totalStudents: 845, avgScore: 71.2, passRate: 75.8, examsConducted: 2, totalAttempts: 892, totalMarks: 2500 },
    performanceOverTime: [
      { month: 'Week 1', avgScore: 68.5, students: 210, exams: 1 },
      { month: 'Week 2', avgScore: 70.2, students: 225, exams: 0 },
      { month: 'Week 3', avgScore: 72.8, students: 198, exams: 1 },
      { month: 'Week 4', avgScore: 73.5, students: 212, exams: 0 },
    ],
    scoreDistribution: [
      { range: '0-20%', students: 28, percentage: 3.3 },
      { range: '21-40%', students: 67, percentage: 7.9 },
      { range: '41-60%', students: 178, percentage: 21.1 },
      { range: '61-80%', students: 334, percentage: 39.5 },
      { range: '81-100%', students: 238, percentage: 28.2 },
    ],
    topStudents: [
      { id: '1', name: 'John Smith', studentId: 'STU20001', avgScore: 94.5, examsTaken: 5, lastExam: 'Final Exam', lastScore: 92, department: 'Computer Science', program: 'BSc CS', semester: 4 },
      { id: '2', name: 'Emma Johnson', studentId: 'STU20002', avgScore: 92.3, examsTaken: 5, lastExam: 'Midterm Exam', lastScore: 95, department: 'Software Engineering', program: 'BSc SE', semester: 4 },
      { id: '3', name: 'Michael Brown', studentId: 'STU20003', avgScore: 89.7, examsTaken: 4, lastExam: 'Final Exam', lastScore: 88, department: 'Computer Science', program: 'BSc CS', semester: 3 },
      { id: '4', name: 'Sarah Wilson', studentId: 'STU20004', avgScore: 88.4, examsTaken: 5, lastExam: 'Quiz 3', lastScore: 91, department: 'Information Technology', program: 'BSc IT', semester: 4 },
      { id: '5', name: 'David Lee', studentId: 'STU20005', avgScore: 87.2, examsTaken: 4, lastExam: 'Midterm Exam', lastScore: 86, department: 'Data Science', program: 'BSc DS', semester: 3 },
    ]
  },
  '3months': {
    stats: { totalStudents: 1120, avgScore: 70.8, passRate: 76.5, examsConducted: 5, totalAttempts: 2156, totalMarks: 6200 },
    performanceOverTime: [
      { month: 'January', avgScore: 68.5, students: 215, exams: 2 },
      { month: 'February', avgScore: 71.3, students: 228, exams: 1 },
      { month: 'March', avgScore: 72.8, students: 245, exams: 2 },
    ],
    scoreDistribution: [
      { range: '0-20%', students: 38, percentage: 3.4 },
      { range: '21-40%', students: 89, percentage: 7.9 },
      { range: '41-60%', students: 239, percentage: 21.3 },
      { range: '61-80%', students: 438, percentage: 39.1 },
      { range: '81-100%', students: 316, percentage: 28.2 },
    ],
    topStudents: [
      { id: '1', name: 'John Smith', studentId: 'STU20001', avgScore: 93.8, examsTaken: 8, lastExam: 'Final Exam', lastScore: 94, department: 'Computer Science', program: 'BSc CS', semester: 4 },
      { id: '2', name: 'Emma Johnson', studentId: 'STU20002', avgScore: 91.5, examsTaken: 7, lastExam: 'Midterm Exam', lastScore: 93, department: 'Software Engineering', program: 'BSc SE', semester: 4 },
      { id: '3', name: 'Michael Brown', studentId: 'STU20003', avgScore: 89.2, examsTaken: 6, lastExam: 'Final Exam', lastScore: 87, department: 'Computer Science', program: 'BSc CS', semester: 3 },
      { id: '4', name: 'Sarah Wilson', studentId: 'STU20004', avgScore: 87.9, examsTaken: 7, lastExam: 'Quiz 3', lastScore: 90, department: 'Information Technology', program: 'BSc IT', semester: 4 },
      { id: '5', name: 'David Lee', studentId: 'STU20005', avgScore: 86.5, examsTaken: 6, lastExam: 'Midterm Exam', lastScore: 85, department: 'Data Science', program: 'BSc DS', semester: 3 },
    ]
  },
  '6months': {
    stats: { totalStudents: 1247, avgScore: 72.5, passRate: 78.3, examsConducted: 8, totalAttempts: 3421, totalMarks: 10000 },
    performanceOverTime: [
      { month: 'Oct', avgScore: 67.8, students: 198, exams: 1 },
      { month: 'Nov', avgScore: 68.5, students: 145, exams: 2 },
      { month: 'Dec', avgScore: 70.2, students: 162, exams: 1 },
      { month: 'Jan', avgScore: 71.8, students: 158, exams: 2 },
      { month: 'Feb', avgScore: 73.4, students: 175, exams: 1 },
      { month: 'Mar', avgScore: 74.9, students: 189, exams: 2 },
    ],
    scoreDistribution: [
      { range: '0-20%', students: 45, percentage: 3.6 },
      { range: '21-40%', students: 98, percentage: 7.9 },
      { range: '41-60%', students: 267, percentage: 21.4 },
      { range: '61-80%', students: 489, percentage: 39.2 },
      { range: '81-100%', students: 348, percentage: 27.9 },
    ],
    topStudents: [
      { id: '1', name: 'John Smith', studentId: 'STU20001', avgScore: 94.2, examsTaken: 10, lastExam: 'Final Exam', lastScore: 95, department: 'Computer Science', program: 'BSc CS', semester: 4 },
      { id: '2', name: 'Emma Johnson', studentId: 'STU20002', avgScore: 92.1, examsTaken: 9, lastExam: 'Midterm Exam', lastScore: 94, department: 'Software Engineering', program: 'BSc SE', semester: 4 },
      { id: '3', name: 'Michael Brown', studentId: 'STU20003', avgScore: 89.5, examsTaken: 8, lastExam: 'Final Exam', lastScore: 88, department: 'Computer Science', program: 'BSc CS', semester: 3 },
      { id: '4', name: 'Sarah Wilson', studentId: 'STU20004', avgScore: 88.2, examsTaken: 9, lastExam: 'Quiz 3', lastScore: 91, department: 'Information Technology', program: 'BSc IT', semester: 4 },
      { id: '5', name: 'David Lee', studentId: 'STU20005', avgScore: 87.1, examsTaken: 8, lastExam: 'Midterm Exam', lastScore: 86, department: 'Data Science', program: 'BSc DS', semester: 3 },
    ]
  },
  '1year': {
    stats: { totalStudents: 1560, avgScore: 70.2, passRate: 75.6, examsConducted: 18, totalAttempts: 5240, totalMarks: 22500 },
    performanceOverTime: [
      { month: 'Apr', avgScore: 65.2, students: 210, exams: 2 }, { month: 'May', avgScore: 66.8, students: 225, exams: 1 },
      { month: 'Jun', avgScore: 67.5, students: 198, exams: 2 }, { month: 'Jul', avgScore: 68.2, students: 215, exams: 1 },
      { month: 'Aug', avgScore: 68.9, students: 230, exams: 2 }, { month: 'Sep', avgScore: 69.5, students: 205, exams: 1 },
      { month: 'Oct', avgScore: 67.8, students: 198, exams: 1 }, { month: 'Nov', avgScore: 68.5, students: 145, exams: 2 },
      { month: 'Dec', avgScore: 70.2, students: 162, exams: 1 }, { month: 'Jan', avgScore: 71.8, students: 158, exams: 2 },
      { month: 'Feb', avgScore: 73.4, students: 175, exams: 1 }, { month: 'Mar', avgScore: 74.9, students: 189, exams: 2 },
    ],
    scoreDistribution: [
      { range: '0-20%', students: 89, percentage: 5.7 }, { range: '21-40%', students: 156, percentage: 10.0 },
      { range: '41-60%', students: 342, percentage: 21.9 }, { range: '61-80%', students: 589, percentage: 37.8 },
      { range: '81-100%', students: 384, percentage: 24.6 },
    ],
    topStudents: [
      { id: '1', name: 'John Smith', studentId: 'STU20001', avgScore: 93.5, examsTaken: 18, lastExam: 'Final Exam', lastScore: 94, department: 'Computer Science', program: 'BSc CS', semester: 4 },
      { id: '2', name: 'Emma Johnson', studentId: 'STU20002', avgScore: 91.2, examsTaken: 17, lastExam: 'Midterm Exam', lastScore: 93, department: 'Software Engineering', program: 'BSc SE', semester: 4 },
      { id: '3', name: 'Michael Brown', studentId: 'STU20003', avgScore: 88.9, examsTaken: 16, lastExam: 'Final Exam', lastScore: 87, department: 'Computer Science', program: 'BSc CS', semester: 3 },
      { id: '4', name: 'Sarah Wilson', studentId: 'STU20004', avgScore: 87.6, examsTaken: 17, lastExam: 'Quiz 3', lastScore: 90, department: 'Information Technology', program: 'BSc IT', semester: 4 },
      { id: '5', name: 'David Lee', studentId: 'STU20005', avgScore: 86.3, examsTaken: 16, lastExam: 'Midterm Exam', lastScore: 85, department: 'Data Science', program: 'BSc DS', semester: 3 },
    ]
  },
  'all': {
    stats: { totalStudents: 2150, avgScore: 68.5, passRate: 73.2, examsConducted: 32, totalAttempts: 8750, totalMarks: 40000 },
    performanceOverTime: [
      { month: '2022 Q1', avgScore: 62.5, students: 185, exams: 4 }, { month: '2022 Q2', avgScore: 64.2, students: 195, exams: 4 },
      { month: '2022 Q3', avgScore: 65.8, students: 210, exams: 4 }, { month: '2022 Q4', avgScore: 66.5, students: 220, exams: 4 },
      { month: '2023 Q1', avgScore: 67.2, students: 235, exams: 4 }, { month: '2023 Q2', avgScore: 68.9, students: 245, exams: 4 },
      { month: '2023 Q3', avgScore: 69.5, students: 260, exams: 4 }, { month: '2023 Q4', avgScore: 70.2, students: 275, exams: 4 },
      { month: '2024 Q1', avgScore: 71.8, students: 290, exams: 4 }, { month: '2024 Q2', avgScore: 72.5, students: 305, exams: 4 },
      { month: '2024 Q3', avgScore: 73.2, students: 315, exams: 4 }, { month: '2024 Q4', avgScore: 73.9, students: 325, exams: 4 },
    ],
    scoreDistribution: [
      { range: '0-20%', students: 129, percentage: 6.0 }, { range: '21-40%', students: 215, percentage: 10.0 },
      { range: '41-60%', students: 473, percentage: 22.0 }, { range: '61-80%', students: 795, percentage: 37.0 },
      { range: '81-100%', students: 538, percentage: 25.0 },
    ],
    topStudents: [
      { id: '1', name: 'John Smith', studentId: 'STU20001', avgScore: 92.8, examsTaken: 32, lastExam: 'Final Exam', lastScore: 93, department: 'Computer Science', program: 'BSc CS', semester: 4 },
      { id: '2', name: 'Emma Johnson', studentId: 'STU20002', avgScore: 90.5, examsTaken: 31, lastExam: 'Midterm Exam', lastScore: 92, department: 'Software Engineering', program: 'BSc SE', semester: 4 },
      { id: '3', name: 'Michael Brown', studentId: 'STU20003', avgScore: 88.2, examsTaken: 30, lastExam: 'Final Exam', lastScore: 86, department: 'Computer Science', program: 'BSc CS', semester: 3 },
      { id: '4', name: 'Sarah Wilson', studentId: 'STU20004', avgScore: 86.9, examsTaken: 31, lastExam: 'Quiz 3', lastScore: 89, department: 'Information Technology', program: 'BSc IT', semester: 4 },
      { id: '5', name: 'David Lee', studentId: 'STU20005', avgScore: 85.6, examsTaken: 30, lastExam: 'Midterm Exam', lastScore: 84, department: 'Data Science', program: 'BSc DS', semester: 3 },
    ]
  }
};

export default function AnalyticsClient() {
  const { data: session, status } = useSession();
  const [searchQuery, setSearchQuery] = useState('');
  const [timeRange, setTimeRange] = useState<'1month' | '3months' | '6months' | '1year' | 'all'>('6months');
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState<Filters>({});
  const [exporting, setExporting] = useState(false);

  const isDemoUser = useMemo(() => {
    if (!session?.user?.email) return true;
    const email = session.user.email.toLowerCase();
    return email === 'lecturer@example.com' || email.includes('demo') || email.includes('test');
  }, [session]);

  const loadData = useCallback(() => {
    setLoading(true);
    const data = MOCK_DATA[timeRange] || MOCK_DATA['6months'];
    setAnalyticsData(data);
    setLoading(false);
  }, [timeRange]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleClearFilters = () => {
    setAppliedFilters({});
    setSearchQuery('');
  };

  const handleExportReport = async () => {
    if (!analyticsData || exporting) return;
    setExporting(true);
    
    try {
      const headers = ['Student Name', 'Student ID', 'Average Score', 'Exams Taken', 'Last Exam', 'Last Score', 'Department', 'Program', 'Semester'];
      const rows = analyticsData.topStudents.map(student => [
        student.name, student.studentId, student.avgScore.toFixed(1), student.examsTaken,
        student.lastExam, student.lastScore.toFixed(1), student.department, student.program, student.semester
      ]);
      
      const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics-report-${timeRange}-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert('Failed to export report');
    } finally {
      setExporting(false);
    }
  };

  const stats = analyticsData?.stats || { totalStudents: 0, avgScore: 0, passRate: 0, examsConducted: 0, totalAttempts: 0, totalMarks: 0 };
  const hasFilters = Object.keys(appliedFilters).length > 0 || searchQuery;

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Header Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tighter">Analytics Overview</h2>
          <p className="text-zinc-500 mt-1">
            {isDemoUser ? 'Demo Mode – Simulated Performance Data' : 'Real-time insights from your students'}
          </p>
        </div>
        <div className="flex gap-3">
          {hasFilters && (
            <button 
              onClick={handleClearFilters} 
              className="px-5 py-2.5 border border-zinc-200 rounded-2xl text-sm flex items-center gap-2 hover:bg-zinc-50 transition"
            >
              <X className="h-4 w-4" /> Clear Filters
            </button>
          )}
          <button 
            onClick={handleExportReport} 
            disabled={exporting || !analyticsData}
            className="bg-teal-600 hover:bg-teal-700 disabled:bg-zinc-300 text-white px-6 py-2.5 rounded-2xl flex items-center gap-2 font-medium transition"
          >
            <Download className="h-4 w-4" />
            {exporting ? 'Exporting...' : 'Export Report'}
          </button>
        </div>
      </div>

      {/* Time Range & Search */}
      <div className="bg-white border border-zinc-200 rounded-3xl p-6 mb-8 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="text-sm text-zinc-500 block mb-2">Time Range</label>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="w-full h-11 border border-zinc-200 rounded-2xl px-4 focus:outline-none focus:border-teal-400 bg-white"
          >
            <option value="1month">Last Month</option>
            <option value="3months">Last 3 Months</option>
            <option value="6months">Last 6 Months</option>
            <option value="1year">Last Year</option>
            <option value="all">All Time</option>
          </select>
        </div>
        <div>
          <label className="text-sm text-zinc-500 block mb-2">Search Students</label>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400" />
            <input
              type="text"
              placeholder="Search by name or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 py-3 border border-zinc-200 rounded-2xl focus:outline-none focus:border-teal-400"
            />
          </div>
        </div>
      </div>

      {/* KPI Stats - Glassmorphic Style */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {[
          { label: "Total Students", value: stats.totalStudents.toLocaleString(), icon: "👥", color: "#14B8A6" },
          { label: "Average Score", value: `${stats.avgScore.toFixed(1)}%`, icon: "📊", color: "#6366F1" },
          { label: "Pass Rate", value: `${stats.passRate.toFixed(1)}%`, icon: "📈", color: "#14B8A6" },
          { label: "Exams Conducted", value: stats.examsConducted, icon: "📋", color: "#6366F1" },
        ].map((stat, i) => (
          <div key={i} className="bg-white border border-zinc-200 rounded-3xl p-8 hover:border-teal-300 hover:shadow-xl transition-all duration-300">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-zinc-500 text-sm tracking-wide">{stat.label}</p>
                <p className="text-5xl font-bold mt-4 tracking-tighter" style={{ color: stat.color }}>
                  {stat.value}
                </p>
              </div>
              <div className="text-5xl opacity-80">{stat.icon}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
        <PerformanceChart key={`perf-${timeRange}`} data={analyticsData?.performanceOverTime} loading={loading} />
        <ScoreDistributionChart key={`dist-${timeRange}`} data={analyticsData?.scoreDistribution} loading={loading} />
      </div>

      {/* Top Students Table */}
      <div className="bg-white border border-zinc-200 rounded-3xl p-8 shadow-sm overflow-hidden">
        <h3 className="text-2xl font-semibold mb-6">Top Performing Students</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b">
              <tr>
                <th className="text-left py-4 font-medium text-zinc-500">Student</th>
                <th className="text-left py-4 font-medium text-zinc-500">ID</th>
                <th className="text-left py-4 font-medium text-zinc-500">Avg. Score</th>
                <th className="text-left py-4 font-medium text-zinc-500">Exams Taken</th>
                <th className="text-left py-4 font-medium text-zinc-500">Last Exam</th>
                <th className="text-left py-4 font-medium text-zinc-500">Last Score</th>
              </tr>
            </thead>
            <tbody>
              {analyticsData?.topStudents.map((student) => (
                <tr key={student.id} className="border-b hover:bg-zinc-50 transition-colors">
                  <td className="py-5">
                    <div className="font-medium text-zinc-900">{student.name}</div>
                    <div className="text-sm text-zinc-500">{student.department}</div>
                  </td>
                  <td className="py-5 text-zinc-600 font-mono">{student.studentId}</td>
                  <td className="py-5 font-semibold text-emerald-600">{student.avgScore.toFixed(1)}%</td>
                  <td className="py-5 text-zinc-600">{student.examsTaken}</td>
                  <td className="py-5 text-zinc-600">{student.lastExam}</td>
                  <td className="py-5 font-medium">{student.lastScore.toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* More Filters Modal */}
      <MoreFiltersModal 
        isOpen={showFilters} 
        onClose={() => setShowFilters(false)} 
        onApply={setAppliedFilters} 
        currentFilters={appliedFilters} 
      />
    </div>
  );
}