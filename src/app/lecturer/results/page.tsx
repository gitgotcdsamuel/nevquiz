// src/app/lecturer/results/page.tsx
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { prisma } from '@/lib/prisma';
import ResultsClient from './ResultsClient';
import { Download, TrendingUp } from 'lucide-react';

export default async function ResultsPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'LECTURER') {
    redirect('/auth/login');
  }

  const exams = await prisma.exam.findMany({
    where: {
      lecturerId: session.user.id,
      isPublished: true,
      endTime: { lt: new Date() }
    },
    include: {
      _count: {
        select: { attempts: { where: { status: 'SUBMITTED' } } }
      },
      attempts: {
        where: { status: 'SUBMITTED' },
        include: { answers: true },
        take: 5
      }
    },
    orderBy: { endTime: 'desc' }
  });

  const allStudentIds = Array.from(new Set(
    exams.flatMap(exam => exam.attempts.map(a => a.studentId))
  ));

  const students = await prisma.user.findMany({
    where: { id: { in: allStudentIds } },
    include: { studentProfile: true }
  });

  const studentMap = new Map(students.map(s => [s.id, s]));

  const examsWithData = exams.map(exam => ({
    ...exam,
    attempts: exam.attempts.map(attempt => ({
      ...attempt,
      student: studentMap.get(attempt.studentId) || null
    }))
  }));

  const totalSubmissions = exams.reduce((sum, exam) => sum + exam._count.attempts, 0);

  const calculateAverageScore = (attempts: any[]) => {
    if (attempts.length === 0) return 0;
    const total = attempts.reduce((sum, a) => sum + (a.score || 0), 0);
    return Math.round((total / attempts.length) * 100) / 100;
  };

  const overallAvgScore = exams.length > 0
    ? Math.round(exams.reduce((sum, exam) => sum + calculateAverageScore(exam.attempts), 0) / exams.length)
    : 0;

  const overallPassRate = exams.length > 0
    ? Math.round(exams.reduce((sum, exam) => {
        const avg = calculateAverageScore(exam.attempts);
        return sum + (avg >= (exam.passingMarks || 50) ? 100 : 0);
      }, 0) / exams.length)
    : 0;

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-zinc-900 overflow-hidden">
      <Navbar />
      <div className="flex">
        <Sidebar role="LECTURER" />
        <main className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-12">
              <div>
                <h1 className="text-4xl font-bold tracking-tighter">Results</h1>
                <p className="text-zinc-500 mt-2">View and analyze student performance across all exams</p>
              </div>
              <div className="text-sm text-emerald-600 font-medium">Completed Exams Only</div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
              {[
                { label: "Total Exams", value: exams.length, icon: "📋", color: "#14B8A6" },
                { label: "Total Submissions", value: totalSubmissions, icon: "👥", color: "#6366F1" },
                { label: "Avg. Pass Rate", value: `${overallPassRate}%`, icon: "📈", color: "#14B8A6" },
                { label: "Avg. Score", value: `${overallAvgScore}%`, icon: "📊", color: "#6366F1" },
              ].map((stat, i) => (
                <div key={i} className="bg-white border border-zinc-200 rounded-3xl p-8 hover:border-teal-300 hover:shadow-xl transition-all">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-zinc-500 text-sm tracking-wide">{stat.label}</p>
                      <p className="text-5xl font-bold mt-3 tracking-tighter" style={{ color: stat.color }}>
                        {stat.value}
                      </p>
                    </div>
                    <div className="text-5xl opacity-80">{stat.icon}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Client Component for interactivity */}
            <ResultsClient examsWithData={examsWithData} />
          </div>
        </main>
      </div>
    </div>
  );
}