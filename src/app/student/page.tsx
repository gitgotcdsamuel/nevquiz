// app/student/page.tsx
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { 
  BookOpen, 
  Award, 
  TrendingUp, 
  Clock, 
  Users, 
  Calendar, 
  FileText, 
  CheckCircle, 
  XCircle, 
  Bell, 
  Target, 
  BarChart3, 
  Zap, 
  BookMarked,
  User,
  AlertCircle,
  GraduationCap,
  Brain,
  Sparkles
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { prisma } from '@/lib/prisma';
import { DashboardCharts } from '@/components/student/DashboardCharts';
import { NotificationsModal } from '@/components/student/NotificationsModal';

// Demo student emails - using the ones from your screenshot
const DEMO_STUDENT_EMAILS = [
  'student@example.com',  // Your demo student account
  'admin@example.com',    // Admin demo
  'lecturer@example.com', // Lecturer demo
  'demo@example.com',
  'test@example.com'
];

// Also check for demo in the name
const DEMO_STUDENT_NAMES = [
  'Demo Student',
  'Test Student',
  'Demo User',
  'Student Demo'
];

const mockStudent = {
  name: 'Demo Student',
  email: 'student@example.com',
  department: 'Computer Science',
  semester: 3,
  studentId: 'CS2024001',
  profileImage: null,
  gpa: 3.6,
  creditsCompleted: 42,
  totalCredits: 120
};

const mockAvailableExams = [
  {
    id: 'exam1',
    title: 'Data Structures & Algorithms',
    courseCode: 'CSC301',
    courseName: 'Advanced Data Structures',
    duration: 120,
    totalMarks: 100,
    endTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    _count: { attempts: 23 },
    lecturer: { name: 'Prof. James Wilson' },
    difficulty: 'Hard',
    questionsCount: 50
  },
  {
    id: 'exam2',
    title: 'Calculus II - Mid Term',
    courseCode: 'MATH102',
    courseName: 'Calculus II',
    duration: 90,
    totalMarks: 75,
    endTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    _count: { attempts: 45 },
    lecturer: { name: 'Dr. Sarah Williams' },
    difficulty: 'Medium',
    questionsCount: 30
  },
  {
    id: 'exam3',
    title: 'Physics Lab Assessment',
    courseCode: 'PHY201',
    courseName: 'Physics Mechanics',
    duration: 60,
    totalMarks: 50,
    endTime: new Date(Date.now() + 12 * 60 * 60 * 1000),
    _count: { attempts: 12 },
    lecturer: { name: 'Prof. Robert Davis' },
    difficulty: 'Medium',
    questionsCount: 20
  },
  {
    id: 'exam4',
    title: 'Database Systems Quiz',
    courseCode: 'CSC205',
    courseName: 'Database Management',
    duration: 45,
    totalMarks: 30,
    endTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    _count: { attempts: 34 },
    lecturer: { name: 'Dr. Emily Chen' },
    difficulty: 'Easy',
    questionsCount: 15
  },
  {
    id: 'exam5',
    title: 'Linear Algebra Test',
    courseCode: 'MATH205',
    courseName: 'Linear Algebra',
    duration: 75,
    totalMarks: 60,
    endTime: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
    _count: { attempts: 28 },
    lecturer: { name: 'Dr. Michael Brown' },
    difficulty: 'Hard',
    questionsCount: 25
  }
];

const mockRecentAttempts = [
  {
    id: 'attempt1',
    exam: {
      title: 'Computer Networks Final',
      courseCode: 'CSC401',
      totalMarks: 100,
      passingMarks: 40
    },
    score: 85,
    percentage: 85,
    grade: 'A',
    submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    status: 'passed'
  },
  {
    id: 'attempt2',
    exam: {
      title: 'Operating Systems Mid-Term',
      courseCode: 'CSC310',
      totalMarks: 75,
      passingMarks: 30
    },
    score: 68,
    percentage: 91,
    grade: 'A-',
    submittedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    status: 'passed'
  },
  {
    id: 'attempt3',
    exam: {
      title: 'Discrete Mathematics Quiz',
      courseCode: 'MATH208',
      totalMarks: 40,
      passingMarks: 16
    },
    score: 32,
    percentage: 80,
    grade: 'B+',
    submittedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    status: 'passed'
  },
  {
    id: 'attempt4',
    exam: {
      title: 'Chemistry Lab Report',
      courseCode: 'CHEM101',
      totalMarks: 50,
      passingMarks: 20
    },
    score: 42,
    percentage: 84,
    grade: 'B',
    submittedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    status: 'passed'
  },
  {
    id: 'attempt5',
    exam: {
      title: 'English Literature Essay',
      courseCode: 'ENG201',
      totalMarks: 100,
      passingMarks: 40
    },
    score: 38,
    percentage: 38,
    grade: 'F',
    submittedAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
    status: 'failed'
  }
];

const mockPerformanceData = [
  { date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), score: 72, examTitle: 'Algorithms Quiz 1' },
  { date: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000), score: 85, examTitle: 'Data Structures Mid' },
  { date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000), score: 68, examTitle: 'Physics Test' },
  { date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), score: 92, examTitle: 'Database Final' },
  { date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), score: 78, examTitle: 'Calculus Quiz' },
  { date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), score: 88, examTitle: 'Networks Mid' },
  { date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), score: 91, examTitle: 'OS Concepts' }
];

const mockSubjectAverages = [
  { subject: 'Computer Science', average: 86 },
  { subject: 'Mathematics', average: 79 },
  { subject: 'Physics', average: 74 },
  { subject: 'English', average: 68 },
  { subject: 'Chemistry', average: 82 }
];

const mockInProgressExams = 2;

const mockAnnouncements = [
  {
    id: '1',
    title: '📝 Mid-Term Exams Schedule Released',
    content: 'Mid-Term examinations will start from February 20, 2026. Download your personalized schedule from the student portal.',
    type: 'info' as const,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    priority: 'high' as const
  },
  {
    id: '2',
    title: '🔧 System Maintenance Tonight',
    content: 'The exam platform will be under maintenance on Saturday, February 15 from 2:00 AM to 4:00 AM. Plan your study time accordingly.',
    type: 'warning' as const,
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
    priority: 'medium' as const
  },
  {
    id: '3',
    title: '🎓 New Study Resources Available',
    content: 'Additional practice materials for Data Structures and Algorithms have been uploaded. Check the resources section.',
    type: 'success' as const,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    priority: 'low' as const
  },
  {
    id: '4',
    title: '📢 Guest Lecture: AI in Education',
    content: 'Join us for a special guest lecture by Dr. Andrew Chen on "The Future of AI in Education" on February 18 at 3:00 PM in Auditorium A.',
    type: 'event' as const,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    priority: 'medium' as const
  }
];

export default async function StudentDashboard() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'STUDENT') {
    redirect('/auth/login');
  }

  // Check if this is a demo student - using the emails from your screenshot
  const isDemoStudent = 
    DEMO_STUDENT_EMAILS.includes(session.user.email || '') ||
    DEMO_STUDENT_NAMES.includes(session.user.name || '') ||
    session.user.name?.toLowerCase().includes('demo') ||
    session.user.email?.toLowerCase().includes('demo');

  console.log('Session user:', session.user);
  console.log('Is demo student:', isDemoStudent);

  let availableExams, recentAttempts, inProgressExams, performanceData, subjectAverages, announcements;
  let studentName = session.user.name || 'Student';
  let studentDepartment = session.user.studentProfile?.department || 'Student';
  let studentSemester = session.user.studentProfile?.semester || 1;

  if (isDemoStudent) {
    // Use mock data for demo student
    availableExams = mockAvailableExams;
    recentAttempts = mockRecentAttempts;
    inProgressExams = mockInProgressExams;
    performanceData = mockPerformanceData;
    subjectAverages = mockSubjectAverages;
    announcements = mockAnnouncements;
    
    // Use mock student name if it's the demo account
    if (session.user.email === 'student@example.com') {
      studentName = mockStudent.name;
      studentDepartment = mockStudent.department;
      studentSemester = mockStudent.semester;
    }
  } else {
    // Fetch real data from database for real students
    try {
      // Fetch available exams
      const dbAvailableExams = await prisma.exam.findMany({
        where: {
          isPublished: true,
          status: 'ACTIVE',
          startTime: { lte: new Date() },
          endTime: { gte: new Date() },
          NOT: {
            attempts: {
              some: {
                studentId: session.user.id,
                status: 'SUBMITTED'
              }
            }
          }
        },
        include: {
          _count: {
            select: {
              attempts: true
            }
          },
          lecturer: {
            select: {
              name: true
            }
          }
        },
        orderBy: {
          endTime: 'asc'
        },
        take: 5
      });

      // Fetch student attempts
      const dbRecentAttempts = await prisma.examAttempt.findMany({
        where: {
          studentId: session.user.id,
          status: 'SUBMITTED'
        },
        include: {
          exam: true
        },
        orderBy: {
          submittedAt: 'desc'
        },
        take: 5
      });

      // Count in-progress exams
      const dbInProgressExams = await prisma.examAttempt.count({
        where: {
          studentId: session.user.id,
          status: 'IN_PROGRESS'
        }
      });

      // Transform database data to match the expected format
      availableExams = dbAvailableExams.map(exam => ({
        ...exam,
        difficulty: 'Medium',
        questionsCount: 30
      }));

      recentAttempts = dbRecentAttempts.map(attempt => ({
        id: attempt.id,
        exam: {
          title: attempt.exam.title,
          courseCode: attempt.exam.courseCode,
          totalMarks: attempt.exam.totalMarks,
          passingMarks: attempt.exam.passingMarks
        },
        score: attempt.score || 0,
        percentage: attempt.percentage || 0,
        grade: attempt.grade || 'N/A',
        submittedAt: attempt.submittedAt || new Date(),
        status: (attempt.score || 0) >= attempt.exam.passingMarks ? 'passed' : 'failed'
      }));

      inProgressExams = dbInProgressExams;

      // Create performance data from recent attempts
      performanceData = dbRecentAttempts.map(attempt => ({
        date: attempt.submittedAt || new Date(),
        score: attempt.percentage || 0,
        examTitle: attempt.exam.title
      })).reverse();

      // Calculate subject averages from attempts
      const subjectPerformance: Record<string, { total: number; count: number }> = {};
      dbRecentAttempts.forEach(attempt => {
        const subject = attempt.exam.courseCode.split(' ')[0];
        if (!subjectPerformance[subject]) {
          subjectPerformance[subject] = { total: 0, count: 0 };
        }
        subjectPerformance[subject].total += attempt.percentage || 0;
        subjectPerformance[subject].count += 1;
      });

      subjectAverages = Object.entries(subjectPerformance).map(([subject, data]) => ({
        subject,
        average: Math.round(data.total / data.count)
      }));

      announcements = [];
      
    } catch (error) {
      console.error('Error fetching student data:', error);
      availableExams = [];
      recentAttempts = [];
      inProgressExams = 0;
      performanceData = [];
      subjectAverages = [];
      announcements = [];
    }
  }

  // Calculate statistics
  const totalExamsTaken = recentAttempts.length;
  const completedExams = recentAttempts.length;
  const averageScore = totalExamsTaken > 0 
    ? Math.round(recentAttempts.reduce((sum, attempt) => sum + (attempt.percentage || 0), 0) / totalExamsTaken)
    : isDemoStudent ? 75 : 0;
  const passedExams = recentAttempts.filter(attempt => attempt.status === 'passed').length;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex">
        <Sidebar role="STUDENT" />
        <main className="flex-1 p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {/* Header with Welcome Message and Notifications */}
            <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl font-bold text-gray-900">
                    Welcome back, {studentName}!
                  </h1>
                  {isDemoStudent && (
                    <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                      Demo Account
                    </span>
                  )}
                </div>
                <div className="mt-2 flex items-center gap-4 text-gray-600">
                  <p className="flex items-center">
                    <GraduationCap className="h-4 w-4 mr-1" />
                    {studentDepartment} • Semester {studentSemester}
                  </p>
                  {isDemoStudent && session.user.email === 'student@example.com' && (
                    <>
                      <p className="flex items-center">
                        <Award className="h-4 w-4 mr-1" />
                        GPA: {mockStudent.gpa}
                      </p>
                      <p className="flex items-center">
                        <Target className="h-4 w-4 mr-1" />
                        {mockStudent.creditsCompleted}/{mockStudent.totalCredits} credits
                      </p>
                    </>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <NotificationsModal announcements={announcements} />
                <Button variant="outline" size="sm" asChild>
                  <Link href="/student/settings">
                    <User className="h-4 w-4 mr-2" />
                    Profile
                  </Link>
                </Button>
              </div>
            </div>

            {/* Stats Cards - Horizontal Row Layout */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {/* Available Exams Card */}
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="text-sm text-gray-600">Available Exams</p>
                      <p className="text-2xl font-bold text-gray-900">{availableExams.length}</p>
                    </div>
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <BookOpen className="h-5 w-5 text-blue-600" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">{availableExams.length} exams waiting</span>
                      {isDemoStudent && (
                        <span className="text-blue-600 font-medium">3 due this week</span>
                      )}
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${Math.min(availableExams.length * 20, 100)}%` }}></div>
                    </div>
                    {availableExams.length > 0 && (
                      <Button size="sm" variant="link" className="p-0 h-auto text-blue-600 text-xs" asChild>
                        <Link href="/student/courses">View all →</Link>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Completed Exams Card */}
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="text-sm text-gray-600">Completed</p>
                      <p className="text-2xl font-bold text-gray-900">{completedExams}</p>
                    </div>
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Award className="h-5 w-5 text-green-600" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-xs flex-wrap">
                      <span className="font-medium text-green-600">{passedExams} passed</span>
                      <span className="text-gray-400">•</span>
                      <span className="text-gray-500">{completedExams - passedExams} failed</span>
                      <span className="text-gray-400">•</span>
                      <span className="text-gray-500">{inProgressExams} in progress</span>
                    </div>
                    <p className="text-xs text-gray-500">
                      Success rate: {totalExamsTaken > 0 ? Math.round((passedExams / totalExamsTaken) * 100) : isDemoStudent ? 80 : 0}%
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Average Score Card */}
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="text-sm text-gray-600">Average Score</p>
                      <p className="text-2xl font-bold text-gray-900">{averageScore}%</p>
                    </div>
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <TrendingUp className="h-5 w-5 text-purple-600" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">Above Class Avg</span>
                      <span className="font-medium text-green-600">
                        {isDemoStudent ? '+5.2%' : 'N/A'}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div className="bg-purple-600 h-1.5 rounded-full" style={{ width: `${averageScore}%` }}></div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>Best: {isDemoStudent ? '92%' : averageScore}%</span>
                      <span>Latest: {recentAttempts[0]?.percentage || 0}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* In Progress Card */}
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="text-sm text-gray-600">In Progress</p>
                      <p className="text-2xl font-bold text-gray-900">{inProgressExams}</p>
                    </div>
                    <div className="p-2 bg-yellow-100 rounded-lg">
                      <Clock className="h-5 w-5 text-yellow-600" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    {inProgressExams > 0 ? (
                      <>
                        {isDemoStudent ? (
                          <>
                            <div className="space-y-1">
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-gray-600">Data Structures</span>
                                <span className="text-yellow-600 font-medium">45%</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-1">
                                <div className="bg-yellow-500 h-1 rounded-full" style={{ width: '45%' }}></div>
                              </div>
                            </div>
                            <div className="space-y-1">
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-gray-600">Physics Lab</span>
                                <span className="text-yellow-600 font-medium">30%</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-1">
                                <div className="bg-yellow-500 h-1 rounded-full" style={{ width: '30%' }}></div>
                              </div>
                            </div>
                          </>
                        ) : (
                          <p className="text-sm text-gray-600">{inProgressExams} exam(s) in progress</p>
                        )}
                        <Button size="sm" variant="link" className="p-0 h-auto text-yellow-600 text-xs font-medium" asChild>
                          <Link href="/student/exams/in-progress">Continue where you left off →</Link>
                        </Button>
                      </>
                    ) : (
                      <p className="text-sm text-gray-500">No exams in progress</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Content Grid - 2:1 Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - 2/3 width - Available Exams */}
              <div className="lg:col-span-2">
                <Card className="h-full">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center">
                        <BookMarked className="h-5 w-5 mr-2 text-primary-600" />
                        Available Exams ({availableExams.length})
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        {isDemoStudent && (
                          <span className="text-sm text-gray-500">Sort by: Deadline</span>
                        )}
                        <Link href="/student/courses">
                          <Button variant="outline" size="sm">View All Courses</Button>
                        </Link>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {availableExams.length === 0 ? (
                      <div className="text-center py-12">
                        <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No exams available</h3>
                        <p className="text-gray-500 mb-6">Check back later for new exams from your lecturers</p>
                        <Button variant="outline" asChild>
                          <Link href="/student/courses">Browse Courses</Link>
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {availableExams.map((exam: any) => {
                          const timeUntilEnd = exam.endTime.getTime() - new Date().getTime();
                          const hoursUntilEnd = Math.floor(timeUntilEnd / (1000 * 60 * 60));
                          const daysUntilEnd = Math.floor(hoursUntilEnd / 24);
                          const remainingHours = hoursUntilEnd % 24;
                          const isUrgent = hoursUntilEnd < 24;
                          
                          // For real data, we don't have difficulty field
                          const difficultyColor = isDemoStudent
                            ? exam.difficulty === 'Hard' ? 'bg-red-100 text-red-800' :
                              exam.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            : 'bg-blue-100 text-blue-800';
                          
                          return (
                            <div key={exam.id} className="p-5 border rounded-lg hover:bg-gray-50 transition-all hover:shadow-md">
                              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                                {/* Left side - Exam Info */}
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 flex-wrap mb-2">
                                    <h3 className="font-semibold text-gray-900 text-lg">{exam.title}</h3>
                                    {isUrgent && (
                                      <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full flex items-center">
                                        <AlertCircle className="h-3 w-3 mr-1" />
                                        Urgent
                                      </span>
                                    )}
                                    {isDemoStudent && (
                                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${difficultyColor}`}>
                                        {exam.difficulty}
                                      </span>
                                    )}
                                  </div>
                                  
                                  <p className="text-sm text-gray-600 mb-3">{exam.courseCode} - {exam.courseName}</p>
                                  
                                  {/* Stats Grid */}
                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                                    <div className="flex items-center text-sm text-gray-600">
                                      <Users className="h-4 w-4 mr-2 text-gray-400" />
                                      <span>{exam._count.attempts} taken</span>
                                    </div>
                                    {isDemoStudent && (
                                      <div className="flex items-center text-sm text-gray-600">
                                        <Brain className="h-4 w-4 mr-2 text-gray-400" />
                                        <span>{exam.questionsCount} questions</span>
                                      </div>
                                    )}
                                    <div className="flex items-center text-sm text-gray-600">
                                      <Clock className="h-4 w-4 mr-2 text-gray-400" />
                                      <span>{exam.duration} mins</span>
                                    </div>
                                    <div className="flex items-center text-sm text-gray-600">
                                      <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                                      <span>Due: {exam.endTime.toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex items-center text-sm text-gray-600">
                                      <Award className="h-4 w-4 mr-2 text-gray-400" />
                                      <span>{exam.totalMarks} marks</span>
                                    </div>
                                    {isDemoStudent && (
                                      <div className="flex items-center text-sm text-gray-600">
                                        <TrendingUp className="h-4 w-4 mr-2 text-gray-400" />
                                        <span>Avg: 76%</span>
                                      </div>
                                    )}
                                  </div>
                                  
                                  <p className="text-xs text-gray-500">
                                    Lecturer: {exam.lecturer.name}
                                  </p>
                                </div>

                                {/* Right side - Time Remaining & Start Button */}
                                <div className="lg:w-64 flex flex-col gap-3">
                                  <div className="w-full">
                                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                                      <span>Time remaining</span>
                                      <span className={isUrgent ? 'text-red-600 font-medium' : 'font-medium'}>
                                        {daysUntilEnd > 0 ? `${daysUntilEnd}d ${remainingHours}h` : `${hoursUntilEnd}h`}
                                      </span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                      <div 
                                        className={`h-2 rounded-full ${isUrgent ? 'bg-red-500' : 'bg-blue-500'}`}
                                        style={{ width: `${Math.min(100, (100 - (hoursUntilEnd / (24 * 7)) * 100))}%` }}
                                      ></div>
                                    </div>
                                  </div>
                                  <Button className="w-full" asChild>
                                   <Link href={`/student/exams/${exam.id}/take`}>
  Start Exam
</Link>
                                  </Button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Right Column - 1/3 width - Quick Stats and Recent Results */}
              <div className="space-y-6">
                {/* Performance Overview Card */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Target className="h-5 w-5 mr-2 text-primary-600" />
                      Performance Overview
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="flex items-center">
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                          <span className="text-sm text-gray-600">Current GPA</span>
                        </div>
                        <span className="font-semibold text-gray-900">
                          {isDemoStudent && session.user.email === 'student@example.com' ? mockStudent.gpa : 'N/A'}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="flex items-center">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                          <span className="text-sm text-gray-600">Best Subject</span>
                        </div>
                        <span className="font-semibold text-gray-900">
                          {isDemoStudent ? 'Computer Science (86%)' : subjectAverages[0]?.subject || 'N/A'}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="flex items-center">
                          <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                          <span className="text-sm text-gray-600">Study Streak</span>
                        </div>
                        <span className="font-semibold text-gray-900">
                          {isDemoStudent ? '12 days 🔥' : `${Math.floor(Math.random() * 10) + 1} days`}
                        </span>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="flex items-center">
                          <div className="w-2 h-2 bg-orange-500 rounded-full mr-3"></div>
                          <span className="text-sm text-gray-600">Class Rank</span>
                        </div>
                        <span className="font-semibold text-gray-900">
                          {isDemoStudent ? '#8 of 156' : 'N/A'}
                        </span>
                      </div>

                      {isDemoStudent && session.user.email === 'student@example.com' && (
                        <div className="mt-4 p-3 bg-primary-50 rounded-lg border border-primary-200">
                          <div className="flex items-start gap-2">
                            <Sparkles className="h-4 w-4 text-primary-600 mt-0.5" />
                            <div>
                              <p className="text-sm font-medium text-primary-800">Next Milestone</p>
                              <p className="text-xs text-primary-700">5 more exams to reach Top 5</p>
                              <div className="w-full bg-primary-200 rounded-full h-1.5 mt-2">
                                <div className="bg-primary-600 h-1.5 rounded-full" style={{ width: '60%' }}></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Recent Results Card */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center">
                        <Award className="h-5 w-5 mr-2 text-primary-600" />
                        Recent Results
                      </CardTitle>
                      <Link href="/student/analytics">
                        <Button variant="outline" size="sm">View Analytics</Button>
                      </Link>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {recentAttempts.length === 0 ? (
                      <div className="text-center py-8">
                        <Award className="h-10 w-10 text-gray-400 mx-auto mb-3" />
                        <p className="text-sm text-gray-500">No exam results yet</p>
                        <Button variant="link" size="sm" className="mt-2" asChild>
                          <Link href="/student/exams">Take an exam →</Link>
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {recentAttempts.slice(0, 4).map((attempt: any) => {
                          const passed = attempt.status === 'passed';
                          const percentage = attempt.percentage || 0;
                          
                          return (
                            <div key={attempt.id} className="p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <h3 className="font-medium text-gray-900 text-sm truncate">{attempt.exam.title}</h3>
                                    {passed ? (
                                      <CheckCircle className="h-3 w-3 text-green-600 flex-shrink-0" />
                                    ) : (
                                      <XCircle className="h-3 w-3 text-red-600 flex-shrink-0" />
                                    )}
                                  </div>
                                  <p className="text-xs text-gray-500 mt-0.5">
                                    {attempt.submittedAt.toLocaleDateString('en-US', { 
                                      month: 'short', 
                                      day: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </p>
                                </div>
                                <div className="text-right ml-2">
                                  <span className={`text-sm font-bold ${
                                    passed ? 'text-green-600' : 'text-red-600'
                                  }`}>
                                    {percentage}%
                                  </span>
                                  <p className="text-xs text-gray-500">{attempt.grade}</p>
                                </div>
                              </div>
                              
                              <div className="w-full bg-gray-200 rounded-full h-1.5">
                                <div 
                                  className={`h-1.5 rounded-full ${passed ? 'bg-green-500' : 'bg-red-500'}`}
                                  style={{ width: `${percentage}%` }}
                                ></div>
                              </div>
                              
                              <div className="mt-2 flex justify-between text-xs text-gray-500">
                                <span>Score: {attempt.score}/{attempt.exam.totalMarks}</span>
                                {isDemoStudent && <span>Class avg: 72%</span>}
                              </div>
                            </div>
                          );
                        })}
                        
                        {recentAttempts.length > 4 && (
                          <Button variant="link" size="sm" className="w-full text-primary-600" asChild>
                            <Link href="/student/results">View all {recentAttempts.length} results →</Link>
                          </Button>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Quick Actions Card */}
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-3">

                      <Link
                        href="/student/analytics"
                        className="p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors border border-green-200 text-center group"
                      >
                        <BarChart3 className="h-6 w-6 text-green-600 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                        <span className="text-sm font-medium text-green-700">Analytics</span>
                      </Link>

                      <Link
                        href="/student/settings"
                        className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200 text-center group"
                      >
                        <User className="h-6 w-6 text-gray-600 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                        <span className="text-sm font-medium text-gray-700">Settings</span>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Study Tips Section - Only show for demo student */}
            {isDemoStudent && (
              <div className="mt-8">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Brain className="h-5 w-5 mr-2 text-primary-600" />
                      Smart Study Tips for Your Exams
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 hover:shadow-md transition-shadow">
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-blue-200 rounded-lg">
                            <Clock className="h-5 w-5 text-blue-700" />
                          </div>
                          <div>
                            <h4 className="font-medium text-blue-800 mb-1">Time Management</h4>
                            <p className="text-sm text-blue-700">You have 3 exams this week. Start with the urgent Data Structures exam due in 12 hours.</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-4 bg-green-50 rounded-lg border border-green-200 hover:shadow-md transition-shadow">
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-green-200 rounded-lg">
                            <Target className="h-5 w-5 text-green-700" />
                          </div>
                          <div>
                            <h4 className="font-medium text-green-800 mb-1">Focus Area</h4>
                            <p className="text-sm text-green-700">Your English scores need improvement. Try the new writing resources.</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-4 bg-purple-50 rounded-lg border border-purple-200 hover:shadow-md transition-shadow">
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-purple-200 rounded-lg">
                            <Zap className="h-5 w-5 text-purple-700" />
                          </div>
                          <div>
                            <h4 className="font-medium text-purple-800 mb-1">Study Streak</h4>
                            <p className="text-sm text-purple-700">You're on a 12-day streak! Keep it up to maintain momentum.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}