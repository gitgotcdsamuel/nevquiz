// app/admin/exams/page.tsx
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { FileText, Search, Plus, Filter, Calendar, Clock, Users } from 'lucide-react';
import sql from 'mssql';

// Helper function to check if email is from demo domain
function isDemoAccount(email: string): boolean {
  const demoDomains = ['@example.com', '@demo.com', '@test.com'];
  return demoDomains.some(domain => email.endsWith(domain));
}

// Function to fetch real exams from MSSQL database
async function getRealExamsFromMSSQL() {
  try {
    const config = {
      user: process.env.MSSQL_USER || 'sa',
      password: process.env.MSSQL_PASSWORD!,
      server: process.env.MSSQL_SERVER || 'localhost',
      port: parseInt(process.env.MSSQL_PORT || '1433'),
      database: process.env.MSSQL_DATABASE || 'exam_system',
      options: { 
        encrypt: false, 
        trustServerCertificate: true,
        enableArithAbort: true,
        connectionTimeout: 30000,
        requestTimeout: 30000,
      },
    };
    
    const pool = await sql.connect(config);
    
    const result = await pool.request().query(`
      SELECT 
        e.id,
        e.title,
        e.courseCode,
        e.type,
        e.status,
        e.startTime,
        e.endTime,
        e.duration,
        u.name as lecturerName,
        COUNT(ea.id) as participants
      FROM exams e
      LEFT JOIN users u ON e.lecturerId = u.id
      LEFT JOIN exam_attempts ea ON e.id = ea.examId
      WHERE e.isPublished = 1
      GROUP BY e.id, e.title, e.courseCode, e.type, e.status, e.startTime, e.endTime, e.duration, u.name
      ORDER BY e.startTime DESC
    `);
    
    await sql.close();
    
    return result.recordset.map(exam => ({
      id: exam.id,
      title: exam.title,
      code: exam.courseCode,
      lecturer: exam.lecturerName || 'Unknown',
      status: exam.status,
      date: new Date(exam.startTime).toISOString().split('T')[0],
      duration: `${exam.duration} minutes`,
      participants: exam.participants || 0,
      type: exam.type
    }));
  } catch (error) {
    console.error('MSSQL error fetching real exams:', error);
    return [];
  }
}

// Mock data for demo mode - with realistic participant counts (only 4-6 demo students)
const mockExams = [
  { 
    id: 1, 
    title: 'Introduction to Programming', 
    code: 'CS101',
    lecturer: 'Dr. John Smith',
    status: 'Scheduled',
    date: '2024-03-25',
    duration: '2 hours',
    participants: 4,
    type: 'Final Exam'
  },
  { 
    id: 2, 
    title: 'Database Systems', 
    code: 'CS201',
    lecturer: 'Dr. Sarah Johnson',
    status: 'Completed',
    date: '2024-03-20',
    duration: '3 hours',
    participants: 3,
    type: 'Midterm'
  },
  { 
    id: 3, 
    title: 'Calculus I', 
    code: 'MATH101',
    lecturer: 'Prof. Robert Brown',
    status: 'Draft',
    date: '2024-04-01',
    duration: '1.5 hours',
    participants: 0,
    type: 'Quiz'
  },
  { 
    id: 4, 
    title: 'Data Structures & Algorithms', 
    code: 'CS301',
    lecturer: 'Dr. Emily Chen',
    status: 'Scheduled',
    date: '2024-03-28',
    duration: '2.5 hours',
    participants: 5,
    type: 'Final Exam'
  },
  { 
    id: 5, 
    title: 'Operating Systems', 
    code: 'CS310',
    lecturer: 'Dr. Michael Brown',
    status: 'In Progress',
    date: '2024-03-22',
    duration: '2 hours',
    participants: 4,
    type: 'Midterm'
  },
  { 
    id: 6, 
    title: 'Physics Mechanics', 
    code: 'PHY201',
    lecturer: 'Prof. James Wilson',
    status: 'Scheduled',
    date: '2024-03-30',
    duration: '2 hours',
    participants: 3,
    type: 'Final Exam'
  }
];

// Function to get exams based on admin type
async function getExams(isDemoAdmin: boolean) {
  if (isDemoAdmin) {
    return mockExams;
  } else {
    return await getRealExamsFromMSSQL();
  }
}

// Function to get stats based on exams
function getExamStats(exams: any[]) {
  const totalExams = exams.length;
  const activeExams = exams.filter(e => e.status === 'In Progress' || e.status === 'ACTIVE').length;
  const scheduledExams = exams.filter(e => e.status === 'Scheduled' || e.status === 'PENDING').length;
  const totalParticipants = exams.reduce((sum, exam) => sum + (exam.participants || 0), 0);
  
  return {
    totalExams,
    activeExams,
    scheduledExams,
    totalParticipants
  };
}

export default async function ExamsPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'ADMIN') {
    redirect('/auth/login');
  }

  const isDemoAdmin = session.user.email && isDemoAccount(session.user.email);
  const exams = await getExams(isDemoAdmin);
  const stats = getExamStats(exams);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex">
        <Sidebar role="ADMIN" />
        <main className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold text-gray-900">
                  Exam Management
                </h1>
                <span className={`px-4 py-1.5 text-xs font-mono border rounded-full animate-pulse ${
                  isDemoAdmin 
                    ? 'bg-purple-500 text-white border-purple-400' 
                    : 'bg-emerald-500 text-white border-emerald-400'
                }`}>
                  {isDemoAdmin ? '● DEMO MODE' : '● LIVE'}
                </span>
              </div>
              <p className="mt-2 text-gray-600">
                {isDemoAdmin 
                  ? 'Demo Mode - Viewing mock exam data (based on 4-6 demo students)' 
                  : 'Monitor and manage all examinations from the main database'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-3 bg-primary-100 rounded-lg">
                      <FileText className="h-8 w-8 text-primary-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm text-gray-600">Total Exams</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.totalExams}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-3 bg-green-100 rounded-lg">
                      <FileText className="h-8 w-8 text-green-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm text-gray-600">Active</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.activeExams}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-3 bg-yellow-100 rounded-lg">
                      <FileText className="h-8 w-8 text-yellow-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm text-gray-600">Scheduled</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.scheduledExams}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <Users className="h-8 w-8 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm text-gray-600">Total Participants</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.totalParticipants}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search exams by title, code, or lecturer..."
                      className="pl-10 w-full"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline">
                      <Filter className="h-4 w-4 mr-2" />
                      Filter by Status
                    </Button>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Exam
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>All Exams</CardTitle>
              </CardHeader>
              <CardContent>
                {exams.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No exams found</h3>
                    <p className="text-gray-500 mb-6">
                      {isDemoAdmin 
                        ? 'No mock exams available for demo mode' 
                        : 'No exams found in the database. Create your first exam!'}
                    </p>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Exam
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {exams.map((exam) => (
                      <div key={exam.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex flex-col md:flex-row md:items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 flex-wrap">
                              <h3 className="font-bold text-lg text-gray-900">{exam.title}</h3>
                              <Badge variant={
                                exam.status === 'Completed' || exam.status === 'SUBMITTED' ? 'success' :
                                exam.status === 'Scheduled' || exam.status === 'PENDING' ? 'warning' :
                                exam.status === 'In Progress' || exam.status === 'ACTIVE' ? 'info' :
                                'secondary'
                              }>
                                {exam.status}
                              </Badge>
                            </div>
                            <p className="text-gray-600">Code: {exam.code} | {exam.type}</p>
                            <div className="flex flex-wrap gap-4 mt-2">
                              <div className="flex items-center text-sm text-gray-500">
                                <Users className="h-4 w-4 mr-1" />
                                {exam.lecturer}
                              </div>
                              <div className="flex items-center text-sm text-gray-500">
                                <Calendar className="h-4 w-4 mr-1" />
                                {new Date(exam.date).toLocaleDateString()}
                              </div>
                              <div className="flex items-center text-sm text-gray-500">
                                <Clock className="h-4 w-4 mr-1" />
                                {exam.duration}
                              </div>
                              <div className="flex items-center text-sm text-gray-500">
                                <Users className="h-4 w-4 mr-1" />
                                {exam.participants} participants
                              </div>
                            </div>
                          </div>
                          <div className="mt-4 md:mt-0 flex gap-2">
                            <Button variant="outline" size="sm">View</Button>
                            <Button variant="outline" size="sm">Edit</Button>
                            <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">Delete</Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Data Source Indicator */}
            <div className="mt-8 text-center text-xs text-gray-400 border-t border-gray-200 pt-6">
              <div className="flex justify-center gap-6 flex-wrap">
                <span className="inline-flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${isDemoAdmin ? 'bg-purple-500' : 'bg-emerald-500'}`}></span>
                  Data Source: {isDemoAdmin ? 'Mock Data (Demo Mode)' : 'MSSQL Database (Real Data)'}
                </span>
                {isDemoAdmin && (
                  <span className="inline-flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                    Note: Based on 4-6 demo students ({stats.totalParticipants} total participations)
                  </span>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}