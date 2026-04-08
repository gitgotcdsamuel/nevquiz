// app/lecturer/dashboard/LecturerDashboardClient.tsx
'use client';
import Link from 'next/link';
import { PlusCircle, FileText, BarChart3 } from 'lucide-react';

type Exam = {
  id: string;
  title: string;
  startTime: Date;
  endTime: Date;
  _count: {
    attempts: number;
    questions: number;
  };
};

export default function LecturerDashboardClient({ 
  exams, 
  totalExams, 
  totalAttempts, 
  activeExams 
}: { 
  exams: Exam[]; 
  totalExams: number; 
  totalAttempts: number; 
  activeExams: number;
}) {
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Recent Exams */}
      <div className="bg-white border border-zinc-200 rounded-3xl p-8 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold">Recent Exams</h2>
          <Link href="/lecturer/exams" className="text-teal-600 hover:text-teal-700 text-sm font-medium flex items-center gap-1">
            View all →
          </Link>
        </div>
        
        {exams.length === 0 ? (
          <div className="text-center py-12 text-zinc-400">
            No exams created yet. Create your first exam!
          </div>
        ) : (
          <div className="space-y-4">
            {exams.map((exam) => (
              <Link
                key={exam.id}
                href={`/lecturer/exams/${exam.id}`}
                className="block p-6 bg-zinc-50 hover:bg-white border border-transparent hover:border-teal-200 rounded-2xl transition-all group"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-lg text-zinc-900 group-hover:text-teal-700 transition-colors">
                      {exam.title}
                    </h3>
                    <div className="flex items-center gap-4 mt-3 text-sm text-zinc-500">
                      <span>{formatDate(exam.startTime)}</span>
                      <span className="bg-zinc-200 px-2.5 py-0.5 rounded text-xs">{exam._count.questions} questions</span>
                      <span className="bg-emerald-100 text-emerald-700 px-2.5 py-0.5 rounded text-xs">{exam._count.attempts} attempts</span>
                    </div>
                  </div>
                  <div className="text-emerald-500 opacity-0 group-hover:opacity-100 transition">→</div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Recent Submissions / Placeholder */}
      <div className="bg-white border border-zinc-200 rounded-3xl p-8 shadow-sm">
        <h2 className="text-2xl font-semibold mb-6">Recent Submissions</h2>
        <div className="text-center py-16 text-zinc-400 border border-dashed border-zinc-200 rounded-2xl">
          <BarChart3 className="h-12 w-12 mx-auto mb-4 text-zinc-300" />
          <p>No recent submissions yet</p>
          <p className="text-sm mt-1">Student results will appear here</p>
        </div>
      </div>

      {/* Quick Actions - Modern Cards */}
      <div className="lg:col-span-2 bg-white border border-zinc-200 rounded-3xl p-8 shadow-sm">
        <h2 className="text-2xl font-semibold mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link
            href="/lecturer/exams/create"
            className="group bg-gradient-to-br from-teal-50 to-white border border-teal-100 hover:border-teal-300 rounded-3xl p-8 transition-all hover:-translate-y-1"
          >
            <PlusCircle className="h-10 w-10 text-teal-600 mb-6" />
            <h3 className="font-semibold text-xl mb-2">Create Exam</h3>
            <p className="text-zinc-500">Set up a new examination with questions and timing</p>
          </Link>

          <Link
            href="/lecturer/exams"
            className="group bg-white border border-zinc-200 hover:border-zinc-300 rounded-3xl p-8 transition-all hover:-translate-y-1"
          >
            <FileText className="h-10 w-10 text-zinc-600 mb-6" />
            <h3 className="font-semibold text-xl mb-2">View All Exams</h3>
            <p className="text-zinc-500">Manage, edit, and monitor your existing exams</p>
          </Link>

          <Link
            href="/lecturer/results"
            className="group bg-white border border-zinc-200 hover:border-zinc-300 rounded-3xl p-8 transition-all hover:-translate-y-1"
          >
            <BarChart3 className="h-10 w-10 text-zinc-600 mb-6" />
            <h3 className="font-semibold text-xl mb-2">View Results</h3>
            <p className="text-zinc-500">Analyze student performance and scores</p>
          </Link>
        </div>
      </div>
    </div>
  );
}