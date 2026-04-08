// src/app/lecturer/results/ResultsClient.tsx
'use client';
import Link from 'next/link';
import { useState } from 'react';
import { Calendar, Users, Eye, Download, TrendingUp, TrendingDown } from 'lucide-react';

export default function ResultsClient({ examsWithData }: { examsWithData: any[] }) {
  const [search, setSearch] = useState('');

  const filteredExams = examsWithData.filter(exam =>
    exam.title.toLowerCase().includes(search.toLowerCase()) ||
    exam.code.toLowerCase().includes(search.toLowerCase())
  );

  const calculateAverageScore = (attempts: any[]) => {
    if (attempts.length === 0) return 0;
    const total = attempts.reduce((sum, a) => sum + (a.score || 0), 0);
    return Math.round((total / attempts.length) * 100) / 100;
  };

  const calculatePassRate = (attempts: any[], passingMarks: number) => {
    if (attempts.length === 0) return 0;
    const passed = attempts.filter(a => (a.score || 0) >= passingMarks).length;
    return Math.round((passed / attempts.length) * 100);
  };

  const formatDate = (date: Date) => new Date(date).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric'
  });

  return (
    <>
      {/* Search Bar */}
      <div className="bg-white border border-zinc-200 rounded-3xl p-6 mb-8 shadow-sm">
        <div className="relative">
          <input
            type="text"
            placeholder="Search exams by title or code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-zinc-50 border border-zinc-200 pl-11 py-3 rounded-2xl focus:outline-none focus:border-teal-400"
          />
        </div>
      </div>

      {/* Results Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredExams.length === 0 ? (
          <div className="col-span-full text-center py-16">
            <div className="text-6xl mb-4">📊</div>
            <h3 className="text-xl font-medium text-zinc-900">No results yet</h3>
            <p className="text-zinc-500 mt-2">Completed exam results will appear here</p>
          </div>
        ) : (
          filteredExams.map((exam) => {
            const avgScore = calculateAverageScore(exam.attempts);
            const passRate = calculatePassRate(exam.attempts, exam.passingMarks || 50);

            return (
              <div key={exam.id} className="bg-white border border-zinc-200 rounded-3xl p-8 hover:border-teal-300 hover:shadow-xl transition-all group">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="font-semibold text-2xl text-zinc-900 group-hover:text-teal-700 transition-colors">
                      {exam.title}
                    </h3>
                    <p className="text-zinc-500 text-sm mt-1">Code: {exam.code}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-emerald-600 font-mono text-sm">{formatDate(exam.endTime)}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-8 mb-8">
                  <div>
                    <div className="text-zinc-500 text-sm">Average Score</div>
                    <div className="text-5xl font-bold tracking-tighter mt-1" style={{ color: avgScore >= (exam.passingMarks || 50) ? '#14B8A6' : '#F59E0B' }}>
                      {avgScore}%
                    </div>
                  </div>
                  <div>
                    <div className="text-zinc-500 text-sm">Pass Rate</div>
                    <div className="text-5xl font-bold tracking-tighter mt-1 text-emerald-600">
                      {passRate}%
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Link href={`/lecturer/exams/${exam.id}`} className="flex-1">
                    <button className="w-full py-3 border border-zinc-200 hover:bg-zinc-50 rounded-2xl flex items-center justify-center gap-2 transition">
                      <Eye className="h-5 w-5" /> View Details
                    </button>
                  </Link>
                  <a href={`/api/results/download?examId=${exam.id}`} target="_blank" className="flex-1">
                    <button className="w-full py-3 bg-teal-600 text-white rounded-2xl flex items-center justify-center gap-2 hover:bg-teal-700 transition">
                      <Download className="h-5 w-5" /> Download PDF
                    </button>
                  </a>
                </div>
              </div>
            );
          })
        )}
      </div>
    </>
  );
}