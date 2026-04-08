// src/app/lecturer/exams/page.tsx
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { prisma } from '@/lib/prisma';
import MyExamsClient from './MyExamsClient';
import { PlusCircle } from 'lucide-react';

type ExamStatus = 'ALL' | 'ACTIVE' | 'UPCOMING' | 'COMPLETED' | 'DRAFT';

interface ExamWithCounts {
  id: string;
  title: string;
  description: string | null;
  code: string;
  shortCode: string | null;
  startTime: Date;
  endTime: Date;
  duration: number;
  isPublished: boolean;
  _count: {
    attempts: number;
    questions: number;
  };
}

export default async function MyExamsPage({
  searchParams,
}: {
  searchParams: { filter?: ExamStatus };
}) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'LECTURER') {
    redirect('/auth/login');
  }

  const filter = (searchParams.filter as ExamStatus) || 'ALL';

  const allExams = await prisma.exam.findMany({
    where: { lecturerId: session.user.id },
    include: {
      _count: { select: { attempts: true, questions: true } }
    },
    orderBy: { createdAt: 'desc' }
  });

  const getExamStatus = (startTime: Date, endTime: Date, isPublished: boolean): ExamStatus => {
    const now = new Date();
    if (!isPublished) return 'DRAFT';
    if (now < startTime) return 'UPCOMING';
    if (now >= startTime && now <= endTime) return 'ACTIVE';
    return 'COMPLETED';
  };

  const filteredExams = allExams.filter(exam => {
    const status = getExamStatus(exam.startTime, exam.endTime, exam.isPublished);
    return filter === 'ALL' || status === filter;
  });

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
                <h1 className="text-4xl font-bold tracking-tighter">My Exams</h1>
                <p className="text-zinc-500 mt-2">Manage all your created examinations</p>
              </div>
              <Link 
                href="/lecturer/exams/create"
                className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-3 rounded-2xl flex items-center gap-3 font-medium transition-all active:scale-95 shadow-sm"
              >
                <PlusCircle className="h-5 w-5" />
                Create New Exam
              </Link>
            </div>

            {/* Client Component for filters, search, and interactive cards */}
            <MyExamsClient 
              exams={filteredExams} 
              currentFilter={filter}
            />
          </div>
        </main>
      </div>
    </div>
  );
}