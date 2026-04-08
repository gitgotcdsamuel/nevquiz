import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { 
  Calendar, 
  Clock, 
  Users, 
  Download,
  ArrowLeft,
  CheckCircle,
  XCircle,
  AlertTriangle,
  BarChart
} from 'lucide-react';
import { prisma } from '@/lib/prisma';

export default async function ExamResultsPage({
  params,
}: {
  params: { examId: string };
}) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'LECTURER') {
    redirect('/auth/login');
  }

  const exam = await prisma.exam.findUnique({
    where: { 
      id: params.examId,
      lecturerId: session.user.id
    },
    include: {
      lecturer: {
        include: {
          profile: true,
        }
      },
      questions: true,
      attempts: {
        include: {
          student: {
            include: {
              profile: true,
            }
          },
          answers: {
            include: {
              question: true,
            }
          },
          violations: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      },
    },
  });

  if (!exam) {
    redirect('/lecturer/results');
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const calculatePercentage = (score: number, totalMarks: number) => {
    return ((score / totalMarks) * 100).toFixed(1);
  };

  const totalAttempts = exam.attempts.length;
  const completedAttempts = exam.attempts.filter(a => a.status === 'COMPLETED').length;
  const passedAttempts = exam.attempts.filter(a => 
    a.status === 'COMPLETED' && a.score && a.score >= (exam.passingMarks || 0)
  ).length;
  const avgScore = totalAttempts > 0 
    ? (exam.attempts.reduce((sum, a) => sum + (a.score || 0), 0) / totalAttempts).toFixed(1)
    : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex">
        <Sidebar role="LECTURER" />
        <main className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            {/* Header with back button */}
            <div className="mb-6">
              <Link href="/lecturer/results">
                <Button variant="ghost" size="sm" className="mb-4">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Results
                </Button>
              </Link>
              
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">{exam.title}</h1>
                  <p className="mt-2 text-gray-600 flex items-center gap-4">
                    <span className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {formatDate(exam.startTime)}
                    </span>
                    <span className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {exam.duration} minutes
                    </span>
                    <span>Code: {exam.code}</span>
                  </p>
                </div>
                <Link href={`/api/results/${exam.id}/pdf`} target="_blank">
                  <Button>
                    <Download className="h-4 w-4 mr-2" />
                    Download PDF Report
                  </Button>
                </Link>
              </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
              <Card>
                <CardContent className="p-4">
                  <p className="text-sm text-gray-600">Total Attempts</p>
                  <p className="text-2xl font-bold">{totalAttempts}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <p className="text-sm text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-green-600">{completedAttempts}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <p className="text-sm text-gray-600">Passed</p>
                  <p className="text-2xl font-bold text-blue-600">{passedAttempts}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <p className="text-sm text-gray-600">Pass Rate</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {totalAttempts > 0 ? ((passedAttempts / totalAttempts) * 100).toFixed(1) : 0}%
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <p className="text-sm text-gray-600">Avg Score</p>
                  <p className="text-2xl font-bold text-orange-600">{avgScore}%</p>
                </CardContent>
              </Card>
            </div>

            {/* Student Results Table */}
            <Card>
              <CardHeader>
                <CardTitle>Student Performance</CardTitle>
              </CardHeader>
              <CardContent>
                {exam.attempts.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No submissions yet for this exam</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4">Student</th>
                          <th className="text-left py-3 px-4">Roll No</th>
                          <th className="text-left py-3 px-4">Status</th>
                          <th className="text-left py-3 px-4">Score</th>
                          <th className="text-left py-3 px-4">Percentage</th>
                          <th className="text-left py-3 px-4">Violations</th>
                          <th className="text-left py-3 px-4">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {exam.attempts.map((attempt) => (
                          <tr key={attempt.id} className="border-b hover:bg-gray-50">
                            <td className="py-3 px-4">
                              {attempt.student.name || attempt.student.email}
                            </td>
                            <td className="py-3 px-4">
                              {(attempt.student.profile as any)?.rollNumber || 'N/A'}
                            </td>
                            <td className="py-3 px-4">
                              <Badge className={
                                attempt.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                                attempt.status === 'IN_PROGRESS' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }>
                                {attempt.status}
                              </Badge>
                            </td>
                            <td className="py-3 px-4 font-medium">
                              {attempt.score || 0}/{exam.totalMarks}
                            </td>
                            <td className="py-3 px-4">
                              {calculatePercentage(attempt.score || 0, exam.totalMarks)}%
                            </td>
                            <td className="py-3 px-4">
                              {attempt.violations.length > 0 ? (
                                <span className="flex items-center text-red-600">
                                  <AlertTriangle className="h-4 w-4 mr-1" />
                                  {attempt.violations.length}
                                </span>
                              ) : (
                                <span className="text-green-600 flex items-center">
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  None
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-4">
                              <Link href={`/lecturer/results/${exam.id}/student/${attempt.studentId}`}>
                                <Button variant="outline" size="sm">
                                  View Details
                                </Button>
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}