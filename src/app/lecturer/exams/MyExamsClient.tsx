// src/app/lecturer/exams/MyExamsClient.tsx
'use client';
import Link from 'next/link';
import { useState } from 'react';
import { Calendar, Clock, Users, Eye, Edit, RefreshCw, FileText, Filter } from 'lucide-react';

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

export default function MyExamsClient({ 
  exams: initialExams, 
  currentFilter 
}: { 
  exams: ExamWithCounts[]; 
  currentFilter: ExamStatus;
}) {
  const [filter, setFilter] = useState(currentFilter);
  const [search, setSearch] = useState('');

  const getExamStatus = (startTime: Date, endTime: Date, isPublished: boolean): ExamStatus => {
    const now = new Date();
    if (!isPublished) return 'DRAFT';
    if (now < startTime) return 'UPCOMING';
    if (now >= startTime && now <= endTime) return 'ACTIVE';
    return 'COMPLETED';
  };

  const filteredExams = initialExams
    .filter(exam => {
      const status = getExamStatus(exam.startTime, exam.endTime, exam.isPublished);
      const matchesFilter = filter === 'ALL' || status === filter;
      const matchesSearch = exam.title.toLowerCase().includes(search.toLowerCase()) ||
                           (exam.description?.toLowerCase().includes(search.toLowerCase()) || false);
      return matchesFilter && matchesSearch;
    });

  const formatDate = (date: Date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const formatTime = (date: Date) => new Date(date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  const getStatusColor = (status: ExamStatus) => {
    switch(status) {
      case 'DRAFT': return 'bg-zinc-100 text-zinc-700';
      case 'UPCOMING': return 'bg-blue-100 text-blue-700';
      case 'ACTIVE': return 'bg-emerald-100 text-emerald-700';
      case 'COMPLETED': return 'bg-purple-100 text-purple-700';
      default: return 'bg-zinc-100 text-zinc-700';
    }
  };

  return (
    <>
      {/* Filters & Search */}
      <div className="bg-white border border-zinc-200 rounded-3xl p-6 mb-8 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Search exams by title or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-zinc-50 border border-zinc-200 pl-11 py-3 rounded-2xl focus:outline-none focus:border-teal-400"
          />
        </div>
        <select 
          value={filter} 
          onChange={(e) => setFilter(e.target.value as ExamStatus)}
          className="bg-white border border-zinc-200 px-6 py-3 rounded-2xl focus:outline-none focus:border-teal-400"
        >
          <option value="ALL">All Exams</option>
          <option value="ACTIVE">Active</option>
          <option value="UPCOMING">Upcoming</option>
          <option value="COMPLETED">Completed</option>
          <option value="DRAFT">Draft</option>
        </select>
      </div>

      <div className="text-sm text-zinc-500 mb-6">
        Showing {filteredExams.length} {filter === 'ALL' ? 'total' : filter.toLowerCase()} exam{filteredExams.length !== 1 ? 's' : ''}
      </div>

      {/* Exams Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredExams.length === 0 ? (
          <div className="col-span-full text-center py-16">
            <FileText className="h-16 w-16 text-zinc-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-zinc-900 mb-2">No exams found</h3>
            <p className="text-zinc-500">Try changing the filter or create a new exam</p>
          </div>
        ) : (
          filteredExams.map((exam) => {
            const status = getExamStatus(exam.startTime, exam.endTime, exam.isPublished);
            return (
              <div key={exam.id} className="bg-white border border-zinc-200 rounded-3xl p-8 hover:border-teal-300 hover:shadow-xl transition-all group">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex-1">
                    <h3 className="font-semibold text-xl text-zinc-900 group-hover:text-teal-700 transition-colors line-clamp-2">
                      {exam.title}
                    </h3>
                    <p className="text-zinc-500 text-sm mt-2 line-clamp-2">
                      {exam.description || 'No description provided'}
                    </p>
                  </div>
                  <span className={`px-4 py-1 text-xs font-semibold rounded-full ${getStatusColor(status)}`}>
                    {status}
                  </span>
                </div>

                <div className="space-y-4 text-sm text-zinc-600">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-zinc-400" />
                    <span>{formatDate(exam.startTime)}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-zinc-400" />
                    <span>{formatTime(exam.startTime)} — {formatTime(exam.endTime)}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-zinc-400" />
                    <span>Duration: {exam.duration} minutes</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-zinc-400" />
                    <span>{exam._count.attempts} participants • {exam._count.questions} questions</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-zinc-400" />
                    <span>Code: <code className="bg-zinc-100 px-2 py-0.5 rounded text-xs font-mono">{exam.shortCode || exam.code}</code></span>
                  </div>
                </div>

                <div className="flex gap-3 mt-8 pt-6 border-t border-zinc-100">
                  <Link href={`/lecturer/exams/${exam.id}`} className="flex-1">
                    <button className="w-full py-3 border border-zinc-200 hover:bg-zinc-50 rounded-2xl flex items-center justify-center gap-2 transition">
                      <Eye className="h-4 w-4" /> View
                    </button>
                  </Link>
                  <Link href={`/lecturer/exams/${exam.id}/edit`} className="flex-1">
                    <button className="w-full py-3 border border-zinc-200 hover:bg-zinc-50 rounded-2xl flex items-center justify-center gap-2 transition">
                      <Edit className="h-4 w-4" /> Edit
                    </button>
                  </Link>
                </div>

                {status === 'COMPLETED' && (
                  <div className="mt-4 flex gap-3">
                    <Link href={`/lecturer/results?exam=${exam.id}`} className="flex-1">
                      <button className="w-full py-3 bg-emerald-600 text-white rounded-2xl flex items-center justify-center gap-2 hover:bg-emerald-700 transition">
                        <FileText className="h-4 w-4" /> Results
                      </button>
                    </Link>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </>
  );
}