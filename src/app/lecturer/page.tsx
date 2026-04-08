// src/app/lecturer/page.tsx
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { prisma } from '@/lib/prisma';
import LecturerDashboardClient from './dashboard/LecturerDashboardClient';
import { PlusCircle } from 'lucide-react';   // ← Added this import

export default async function LecturerDashboard() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'LECTURER') {
    redirect('/auth/login');
  }

  // Fetch real lecturer data
  const exams = await prisma.exam.findMany({
    where: { lecturerId: session.user.id },
    include: {
      _count: {
        select: { attempts: true, questions: true }
      }
    },
    orderBy: { createdAt: 'desc' },
    take: 5
  });

  const now = new Date();
  const totalExams = exams.length;
  const totalAttempts = exams.reduce((sum, exam) => sum + exam._count.attempts, 0);
  const activeExams = exams.filter(exam => 
    exam.startTime <= now && exam.endTime >= now
  ).length;

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
                <h1 className="text-4xl font-bold tracking-tighter">
                  Welcome back, {session.user.name?.split(' ')[0]}!
                </h1>
                <p className="text-zinc-500 mt-2">Monitor your exams and student performance in real-time</p>
              </div>
              <Link 
                href="/lecturer/exams/create"
                className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-3 rounded-2xl flex items-center gap-3 font-medium transition-all active:scale-95 shadow-sm"
              >
                <PlusCircle className="h-5 w-5" />
                Create New Exam
              </Link>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              {[
                { label: "Total Exams", value: totalExams, icon: "📝", color: "#14B8A6", change: "Created by you" },
                { label: "Total Attempts", value: totalAttempts, icon: "👥", color: "#6366F1", change: "Student submissions" },
                { label: "Active Exams", value: activeExams, icon: "⚡", color: "#14B8A6", change: "Running now" },
              ].map((stat, i) => (
                <div key={i} className="bg-white border border-zinc-200 rounded-3xl p-8 hover:border-teal-300 hover:shadow-xl transition-all duration-300 shadow-sm">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-zinc-500 text-sm tracking-wide">{stat.label}</p>
                      <p className="text-5xl font-bold mt-3 tracking-tighter" style={{ color: stat.color }}>
                        {stat.value}
                      </p>
                    </div>
                    <div className="text-5xl opacity-80">{stat.icon}</div>
                  </div>
                  <p className="text-emerald-600 text-sm mt-4 font-medium">{stat.change}</p>
                </div>
              ))}
            </div>

            {/* Client Component */}
            <LecturerDashboardClient 
              exams={exams} 
              totalExams={totalExams}
              totalAttempts={totalAttempts}
              activeExams={activeExams}
            />
          </div>
        </main>
      </div>
    </div>
  );
}