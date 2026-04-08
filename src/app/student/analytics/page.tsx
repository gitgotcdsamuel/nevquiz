'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  TrendingUp,
  TrendingDown,
  Award,
  Target,
  Clock,
  BarChart3,
  PieChart,
  Download,
  CheckCircle,
  AlertCircle,
  Brain,
  Lightbulb,
  BookOpen,
  Users,
  Sparkles,
  Zap,
  Trophy
} from 'lucide-react';
import { format, subMonths, startOfMonth, endOfMonth, eachMonthOfInterval } from 'date-fns';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

// Types
interface StudyGoal {
  id: string;
  subject: string;
  targetHours: number;
  completedHours: number;
  deadline: Date;
}

interface AnalyticsData {
  totalStudyTime: number;
  averageFocusScore: number;
  completedExams: number;
  averageScore: number;
  studyTrend: { month: string; hours: number }[];
  subjectPerformance: { subject: string; score: number; studyHours: number }[];
  weeklyActivity: { day: string; hours: number }[];
  upcomingDeadlines: StudyGoal[];
  recommendations: string[];
}

// Mock data generator for demo accounts
const generateMockAnalytics = (): AnalyticsData => {
  const subjects = ['Mathematics', 'Physics', 'Computer Science', 'English', 'Chemistry'];
  
  // Study trend for last 6 months - with realistic increasing trend
  const months = eachMonthOfInterval({
    start: subMonths(new Date(), 5),
    end: new Date()
  });
  
  // Create a realistic upward trend
  const studyTrend = months.map((month, index) => ({
    month: format(month, 'MMM yyyy'),
    hours: 15 + (index * 3) + Math.random() * 5 // Increasing trend: 15, 18, 21, 24, 27, 30
  }));
  
  // Subject performance
  const subjectPerformance = subjects.map(subject => ({
    subject,
    score: 60 + Math.random() * 35,
    studyHours: 15 + Math.random() * 40
  }));
  
  // Weekly activity - realistic distribution
  const weeklyActivity = [
    { day: 'Mon', hours: 3.5 },
    { day: 'Tue', hours: 4.2 },
    { day: 'Wed', hours: 3.8 },
    { day: 'Thu', hours: 5.0 },
    { day: 'Fri', hours: 2.5 },
    { day: 'Sat', hours: 6.0 },
    { day: 'Sun', hours: 4.5 }
  ];
  
  // Upcoming deadlines
  const upcomingDeadlines: StudyGoal[] = [
    {
      id: '1',
      subject: 'Mathematics',
      targetHours: 20,
      completedHours: 12,
      deadline: new Date(new Date().setDate(new Date().getDate() + 7))
    },
    {
      id: '2',
      subject: 'Physics',
      targetHours: 15,
      completedHours: 8,
      deadline: new Date(new Date().setDate(new Date().getDate() + 14))
    },
    {
      id: '3',
      subject: 'Computer Science',
      targetHours: 25,
      completedHours: 18,
      deadline: new Date(new Date().setDate(new Date().getDate() + 21))
    }
  ];
  
  // Recommendations
  const recommendations = [
    'Increase study time for Mathematics to improve performance',
    'Your focus score is highest in the morning - schedule difficult topics then',
    'Consider joining a study group for Physics',
    'Take regular breaks to maintain high focus levels'
  ];
  
  return {
    totalStudyTime: studyTrend.reduce((sum, month) => sum + month.hours, 0),
    averageFocusScore: 65 + Math.random() * 20,
    completedExams: 4 + Math.floor(Math.random() * 6),
    averageScore: 70 + Math.random() * 20,
    studyTrend,
    subjectPerformance,
    weeklyActivity,
    upcomingDeadlines,
    recommendations
  };
};

// Real data fetcher (to be implemented with your API)
const fetchRealAnalytics = async (userId: string): Promise<AnalyticsData> => {
  const response = await fetch(`/api/analytics?userId=${userId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch analytics data');
  }
  return response.json();
};

export default function StudentAnalyticsPage() {
  const { data: session, status } = useSession();
  const [mounted, setMounted] = useState(false);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'semester'>('month');
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Demo detection
  const isDemoUser = !session?.user?.email || 
                     session.user.email === 'demo@example.com' ||
                     session.user.email === 'student@example.com' ||
                     session.user.email?.includes('demo') ||
                     session.user.email?.includes('test');

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const loadAnalyticsData = async () => {
      if (status === 'loading') return;
      
      setLoading(true);
      setError(null);
      
      try {
        if (isDemoUser) {
          console.log('🎭 Demo account detected - Using mock analytics data');
          setTimeout(() => {
            setAnalyticsData(generateMockAnalytics());
            setLoading(false);
          }, 500);
          return;
        }
        
        if (session?.user?.id) {
          console.log('👤 Real account detected - Fetching from database');
          const data = await fetchRealAnalytics(session.user.id);
          setAnalyticsData(data);
        }
      } catch (err) {
        console.error('Error loading analytics:', err);
        setError(err instanceof Error ? err.message : 'Failed to load analytics data');
        setAnalyticsData(generateMockAnalytics());
      } finally {
        setLoading(false);
      }
    };
    
    loadAnalyticsData();
  }, [session, status, isDemoUser]);

  const exportToPDF = async () => {
    if (!analyticsData || exporting) return;
    
    setExporting(true);
    
    try {
      const pdfDoc = await PDFDocument.create();
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      
      let page = pdfDoc.addPage();
      const { height } = page.getSize();
      let y = height - 50;

      const addLine = (text: string, size: number = 10, bold: boolean = false, x: number = 50) => {
        if (y < 50) {
          page = pdfDoc.addPage();
          y = height - 50;
        }
        page.drawText(text, { x, y, size, font: bold ? boldFont : font });
        y -= size + 5;
      };

      const addDivider = () => {
        y -= 5;
        page.drawLine({ start: { x: 50, y: y + 5 }, end: { x: 550, y: y + 5 }, thickness: 1, color: rgb(0.8, 0.8, 0.8) });
        y -= 10;
      };

      addLine(`Student Learning Analytics Report ${isDemoUser ? '(Demo Mode)' : ''}`, 20, true);
      y -= 10;
      addLine(`Generated: ${format(new Date(), 'MMMM dd, yyyy hh:mm a')}`, 10);
      addLine(`Student: ${session?.user?.name || 'Student'}`, 10);
      addLine(`Email: ${session?.user?.email || 'student@example.com'}`, 10);
      y -= 10;
      addDivider();

      addLine('Performance Summary', 14, true);
      addLine(`Total Study Time: ${analyticsData.totalStudyTime.toFixed(0)} hours`);
      addLine(`Average Focus Score: ${analyticsData.averageFocusScore.toFixed(0)}%`);
      addLine(`Exams Completed: ${analyticsData.completedExams}`);
      addLine(`Average Score: ${analyticsData.averageScore.toFixed(0)}%`);
      y -= 10;
      addDivider();

      addLine('Study Trend (Last 6 Months)', 14, true);
      for (const trend of analyticsData.studyTrend) {
        addLine(`${trend.month}: ${trend.hours.toFixed(0)} hours`, 10);
      }
      y -= 10;
      addDivider();

      addLine('Weekly Activity', 14, true);
      for (const day of analyticsData.weeklyActivity) {
        addLine(`${day.day}: ${day.hours.toFixed(1)} hours`, 10);
      }
      y -= 10;
      addDivider();

      addLine('Study Goals & Deadlines', 14, true);
      for (const goal of analyticsData.upcomingDeadlines) {
        const progress = (goal.completedHours / goal.targetHours) * 100;
        const daysLeft = Math.ceil(
          (goal.deadline.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
        );
        addLine(`${goal.subject}: ${goal.completedHours}/${goal.targetHours} hours (${progress.toFixed(0)}%) - Due in ${daysLeft} days`, 10);
      }
      y -= 10;
      addDivider();

      addLine('AI Recommendations', 14, true);
      for (const rec of analyticsData.recommendations) {
        addLine(`• ${rec}`, 10);
      }

      const pages = pdfDoc.getPages();
      const lastPage = pages[pages.length - 1];
      lastPage.drawText(`Generated by Exam Platform • This report is for personal use only`, {
        x: 50,
        y: 30,
        size: 8,
        font,
        color: rgb(0.5, 0.5, 0.5),
      });

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `learning-analytics-report-${format(new Date(), 'yyyy-MM-dd')}${isDemoUser ? '-demo' : ''}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('PDF generation failed:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  if (!mounted || status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex">
          <Sidebar role="STUDENT" />
          <main className="flex-1 p-8">
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900">Authentication Required</h2>
          <p className="mt-2 text-gray-600">Please sign in to access your analytics dashboard.</p>
          <Button className="mt-4" onClick={() => window.location.href = '/login'}>
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  if (loading || !analyticsData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex">
          <Sidebar role="STUDENT" />
          <main className="flex-1 p-8">
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex">
          <Sidebar role="STUDENT" />
          <main className="flex-1 p-8">
            <div className="max-w-7xl mx-auto">
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-red-800 mb-2">Error Loading Data</h2>
                <p className="text-red-600 mb-4">{error}</p>
                <Button onClick={() => window.location.reload()}>Retry</Button>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  const {
    totalStudyTime,
    averageFocusScore,
    completedExams,
    averageScore,
    studyTrend,
    subjectPerformance,
    weeklyActivity,
    upcomingDeadlines,
    recommendations
  } = analyticsData;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex">
        <Sidebar role="STUDENT" />
        <main className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    Learning Analytics {isDemoUser && '(Demo Mode)'}
                  </h1>
                  <p className="mt-2 text-gray-600">
                    {isDemoUser 
                      ? '🎭 Demo mode - Viewing simulated analytics data' 
                      : 'Track your study habits, performance trends, and academic progress'}
                  </p>
                  {isDemoUser && (
                    <Badge variant="outline" className="mt-2">
                      Demo Account - Mock Data
                    </Badge>
                  )}
                </div>
                <Button 
                  variant="outline" 
                  onClick={exportToPDF}
                  disabled={exporting}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  {exporting ? 'Generating PDF...' : 'Export Report'}
                </Button>
              </div>
            </div>

            {/* Time Range Selector */}
            <div className="mb-6 flex gap-2">
              {(['week', 'month', 'semester'] as const).map((range) => (
                <Button
                  key={range}
                  variant={timeRange === range ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTimeRange(range)}
                >
                  {range.charAt(0).toUpperCase() + range.slice(1)}
                </Button>
              ))}
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Study Time</p>
                      <p className="text-2xl font-bold text-gray-900">{totalStudyTime.toFixed(0)} hrs</p>
                      <p className="text-xs text-green-600 mt-1">↑ 12% from last month</p>
                    </div>
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <Clock className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Avg. Focus Score</p>
                      <p className="text-2xl font-bold text-gray-900">{averageFocusScore.toFixed(0)}%</p>
                      <p className="text-xs text-green-600 mt-1">↑ 5% from last month</p>
                    </div>
                    <div className="p-3 bg-green-100 rounded-lg">
                      <Brain className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Exams Completed</p>
                      <p className="text-2xl font-bold text-gray-900">{completedExams}</p>
                      <p className="text-xs text-gray-600 mt-1">This semester</p>
                    </div>
                    <div className="p-3 bg-purple-100 rounded-lg">
                      <Trophy className="h-6 w-6 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Average Score</p>
                      <p className="text-2xl font-bold text-gray-900">{averageScore.toFixed(0)}%</p>
                      <p className="text-xs text-green-600 mt-1">↑ 8% from last semester</p>
                    </div>
                    <div className="p-3 bg-yellow-100 rounded-lg">
                      <Award className="h-6 w-6 text-yellow-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Study Trend Chart - FIXED VERSION */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Study Trend</CardTitle>
                  <CardDescription>Monthly study hours over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    {studyTrend && studyTrend.length > 0 ? (
                      <div className="flex h-full items-end space-x-2">
                        {studyTrend.map((data, index) => {
                          // Calculate max value for proper scaling
                          const maxHours = Math.max(...studyTrend.map(d => d.hours), 1);
                          const barHeight = (data.hours / maxHours) * 100;
                          
                          return (
                            <div key={index} className="flex-1 flex flex-col items-center">
                              <div
                                className="w-full bg-primary-500 rounded-t transition-all duration-500 hover:bg-primary-600"
                                style={{ height: `${barHeight}%`, minHeight: '4px' }}
                              />
                              <div className="text-xs text-gray-600 mt-2 transform -rotate-45 origin-top-left whitespace-nowrap">
                                {data.month}
                              </div>
                              <div className="text-xs font-medium mt-1">{data.hours.toFixed(0)}h</div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-500">
                        No study data available
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Subject Performance */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Subject Performance</CardTitle>
                  <CardDescription>Score vs Study Hours</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {subjectPerformance.map((subject, index) => (
                      <div key={index}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="font-medium text-gray-700">{subject.subject}</span>
                          <div className="flex gap-4">
                            <span className="text-blue-600">{subject.studyHours.toFixed(0)} hrs</span>
                            <span className="text-green-600">{subject.score.toFixed(0)}%</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-500 rounded-full h-2"
                              style={{ width: `${(subject.studyHours / 60) * 100}%` }}
                            />
                          </div>
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-green-500 rounded-full h-2"
                              style={{ width: `${subject.score}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Weekly Activity and Goals */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              {/* Weekly Activity */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="text-lg">Weekly Activity</CardTitle>
                  <CardDescription>Study hours by day</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {weeklyActivity.map((day, index) => (
                      <div key={index}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="font-medium text-gray-700">{day.day}</span>
                          <span className="text-gray-600">{day.hours.toFixed(1)} hours</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-primary-500 rounded-full h-2 transition-all"
                            style={{ width: `${(day.hours / 8) * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Study Goals & Deadlines */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Study Goals</CardTitle>
                  <CardDescription>Upcoming deadlines and progress</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {upcomingDeadlines.map((goal) => {
                    const progress = (goal.completedHours / goal.targetHours) * 100;
                    const daysLeft = Math.ceil(
                      (goal.deadline.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
                    );
                    
                    return (
                      <div key={goal.id} className="border-b border-gray-100 pb-3 last:border-0">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-semibold text-gray-900">{goal.subject}</h4>
                            <p className="text-xs text-gray-500" suppressHydrationWarning>
                              Due in {daysLeft} days • {goal.completedHours}/{goal.targetHours} hours
                            </p>
                          </div>
                          <Badge variant={progress >= 80 ? 'default' : progress >= 50 ? 'secondary' : 'outline'}>
                            {progress.toFixed(0)}%
                          </Badge>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`rounded-full h-2 transition-all ${
                              progress >= 80 ? 'bg-green-500' : progress >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </div>

            {/* Insights & Recommendations */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-yellow-500" />
                    Performance Insights
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-start gap-3">
                      <TrendingUp className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-gray-900">Improving Trend</h4>
                        <p className="text-sm text-gray-600 mt-1">
                          Your study consistency has improved by 23% over the last 3 months.
                          Keep up the momentum!
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="flex items-start gap-3">
                      <Zap className="h-5 w-5 text-green-600 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-gray-900">Peak Performance</h4>
                        <p className="text-sm text-gray-600 mt-1">
                          Your focus score is highest on Tuesday and Wednesday mornings.
                          Schedule important study sessions then.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-purple-500" />
                    AI Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {recommendations.map((rec, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-gray-700">{rec}</p>
                    </div>
                  ))}
                  
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-600">Study group available for Physics</span>
                      </div>
                      <Button size="sm" variant="outline">Join</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Study Tips Section */}
            <div className="mt-8">
              <Card className="bg-gradient-to-r from-primary-500 to-primary-600 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                      <h3 className="text-xl font-semibold mb-2">Pro Tip</h3>
                      <p className="text-primary-100">
                        Students who study for 25-minute focused sessions (Pomodoro) retain 40% more information.
                        Try it for your next study session!
                      </p>
                    </div>
                    <Button variant="secondary" className="bg-white text-primary-600 hover:bg-gray-100">
                      Learn More
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}