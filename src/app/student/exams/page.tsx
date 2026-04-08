// src/app/student/exams/page.tsx   (or wherever your student exam entry page lives)
'use client';

import { useState, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { 
  BookOpen, 
  Lock, 
  Clock, 
  Calendar, 
  AlertCircle, 
  CheckCircle, 
  X, 
  AlertTriangle, 
  Info, 
  Zap, 
  User 
} from 'lucide-react';

type ExamStatus = 'AVAILABLE' | 'UPCOMING' | 'COMPLETED' | 'DRAFT' | 'ARCHIVED' | 'NOT_FOUND' | 'MAX_ATTEMPTS' | 'UNAUTHORIZED';

export default function StudentExamsPage() {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [examInfo, setExamInfo] = useState<any>(null);
  const [examStatus, setExamStatus] = useState<ExamStatus | null>(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [timeUntilStart, setTimeUntilStart] = useState('');
  const [statusMessage, setStatusMessage] = useState<{
    type: 'info' | 'warning' | 'error' | 'success';
    title: string;
    message: string;
    details?: string[];
  } | null>(null);

  // Countdown for upcoming exams
  useEffect(() => {
    if (!examInfo || examStatus !== 'UPCOMING') return;

    const updateCountdown = () => {
      const now = new Date();
      const startTime = new Date(examInfo.startTime);
      const diff = startTime.getTime() - now.getTime();

      if (diff <= 0) {
        setExamStatus('AVAILABLE');
        setTimeUntilStart('');
        updateStatusMessage('AVAILABLE');
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      if (days > 0) {
        setTimeUntilStart(`${days}d ${hours}h ${minutes}m`);
      } else if (hours > 0) {
        setTimeUntilStart(`${hours}h ${minutes}m ${seconds}s`);
      } else {
        setTimeUntilStart(`${minutes}m ${seconds}s`);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [examInfo, examStatus]);

  const updateStatusMessage = (status: ExamStatus) => {
    const messages: Record<ExamStatus, any> = {
      AVAILABLE: { type: 'success' as const, title: 'Exam Available!', message: 'You can start the exam now.' },
      UPCOMING: { 
        type: 'info' as const, 
        title: 'Exam Not Started Yet', 
        message: 'This exam is scheduled to start soon.',
        details: examInfo ? [
          `Starts: ${new Date(examInfo.startTime).toLocaleString()}`,
          `Ends: ${new Date(examInfo.endTime).toLocaleString()}`,
          timeUntilStart ? `Time remaining: ${timeUntilStart}` : ''
        ] : []
      },
      COMPLETED: { 
        type: 'warning' as const, 
        title: 'Exam Has Ended', 
        message: 'The exam period has passed.',
        details: examInfo ? [`Ended: ${new Date(examInfo.endTime).toLocaleString()}`] : [] 
      },
      DRAFT: { type: 'info' as const, title: 'Exam Not Published', message: 'This exam is still being prepared by your lecturer.' },
      ARCHIVED: { type: 'error' as const, title: 'Exam Archived', message: 'This exam is no longer available.' },
      NOT_FOUND: { 
        type: 'error' as const, 
        title: 'Exam Not Found', 
        message: 'No exam matches the code you entered.',
        details: ['Check for typos', 'Ensure you have the correct code', 'Contact your lecturer'] 
      },
      MAX_ATTEMPTS: { 
        type: 'error' as const, 
        title: 'Maximum Attempts Reached', 
        message: 'You have already taken this exam the maximum number of times.' 
      },
      UNAUTHORIZED: { 
        type: 'error' as const, 
        title: 'Access Denied', 
        message: 'You are not authorized to take this exam.' 
      },
    };

    setStatusMessage(messages[status]);
    setShowStatusModal(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setStatusMessage(null);
    setIsLoading(true);
    setExamInfo(null);
    setExamStatus(null);

    if (!code.trim()) {
      setError('Please enter an exam code');
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch(`/api/exams/validate?code=${code.toUpperCase().trim()}`);
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Invalid exam code');
        setExamStatus('NOT_FOUND');
        updateStatusMessage('NOT_FOUND');
        setIsLoading(false);
        return;
      }

      if (!data.valid) {
        setError(data.message || 'This exam is not available');
        setExamStatus(data.status || 'NOT_FOUND');
        updateStatusMessage(data.status || 'NOT_FOUND');
        setIsLoading(false);
        return;
      }

      setExamInfo(data.exam);
      setExamStatus(data.status);

      if (data.status === 'AVAILABLE') {
        setIsLoading(false);
      } else {
        updateStatusMessage(data.status);
        setIsLoading(false);
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  const handleStartExam = async () => {
    if (!examInfo) return;
    try {
      const res = await fetch(`/api/exams/${examInfo.id}/start`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to start exam');
        return;
      }
      router.push(`/student/exams/${examInfo.id}/take?attemptId=${data.attemptId}`);
    } catch (err) {
      setError('An error occurred. Please try again.');
    }
  };

  const StatusModal = () => {
    if (!showStatusModal || !statusMessage) return null;

    const getIcon = () => {
      switch (statusMessage.type) {
        case 'success': return <CheckCircle className="h-12 w-12 text-emerald-500" />;
        case 'info': return <Info className="h-12 w-12 text-blue-500" />;
        case 'warning': return <AlertTriangle className="h-12 w-12 text-amber-500" />;
        case 'error': return <AlertCircle className="h-12 w-12 text-red-500" />;
        default: return <Info className="h-12 w-12 text-blue-500" />;
      }
    };

    const getBgColor = () => {
      switch (statusMessage.type) {
        case 'success': return 'bg-emerald-50 border-emerald-200';
        case 'info': return 'bg-blue-50 border-blue-200';
        case 'warning': return 'bg-amber-50 border-amber-200';
        case 'error': return 'bg-red-50 border-red-200';
        default: return 'bg-zinc-50 border-zinc-200';
      }
    };

    return (
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
        <div className={`bg-white rounded-3xl w-full max-w-md shadow-2xl ${getBgColor()} border`}>
          <div className="p-8">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-4">
                {getIcon()}
                <div>
                  <h3 className="text-2xl font-semibold text-zinc-900">{statusMessage.title}</h3>
                  <p className="text-zinc-600 mt-1">{statusMessage.message}</p>
                </div>
              </div>
              <button onClick={() => setShowStatusModal(false)} className="p-2 hover:bg-zinc-100 rounded-full">
                <X className="h-6 w-6" />
              </button>
            </div>

            {statusMessage.details && statusMessage.details.length > 0 && (
              <div className="mt-6 p-5 bg-white rounded-2xl border text-sm text-zinc-600 space-y-2">
                {statusMessage.details.map((detail, i) => (
                  <div key={i} className="flex gap-2">
                    <span className="text-zinc-400">•</span>
                    <span>{detail}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-8 flex gap-3">
              <Button onClick={() => setShowStatusModal(false)} variant="outline" className="flex-1">Close</Button>
              {examStatus === 'AVAILABLE' && (
                <Button onClick={handleStartExam} className="flex-1">Start Exam Now</Button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-zinc-900 overflow-hidden">
      <Navbar />
      <div className="flex">
        <Sidebar role="STUDENT" />
        <main className="flex-1 p-8">
          <div className="max-w-3xl mx-auto">
            <div className="mb-12">
              <h1 className="text-4xl font-bold tracking-tighter">Take an Exam</h1>
              <p className="text-zinc-500 mt-3">Enter your exam code to begin</p>
            </div>

            {!examInfo || examStatus !== 'AVAILABLE' ? (
              <Card className="border-zinc-200 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <Lock className="h-6 w-6 text-teal-600" />
                    Enter Exam Code
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-2">
                  {error && <Alert variant="destructive" className="mb-6">{error}</Alert>}

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <Input
                        type="text"
                        value={code}
                        onChange={(e) => setCode(e.target.value.toUpperCase().trim())}
                        placeholder="Enter exam code (e.g. PHYS101FINAL)"
                        className="text-center text-3xl tracking-widest font-mono py-6"
                        maxLength={20}
                        required
                      />
                      <p className="text-xs text-zinc-500 text-center mt-2">
                        
                      </p>
                    </div>

                    <Button type="submit" className="w-full py-6 text-lg" disabled={isLoading || !code.trim()}>
                      {isLoading ? 'Validating...' : 'Access Exam'}
                    </Button>
                  </form>

                  <div className="mt-10 p-6 bg-white border border-zinc-100 rounded-2xl">
                    <h4 className="font-semibold mb-4 flex items-center gap-2">
                      <Info className="h-5 w-5 text-teal-600" /> Important Notes
                    </h4>
                    <ul className="space-y-3 text-sm text-zinc-600">
                      <li className="flex gap-3"><span className="text-teal-500">•</span> Use the exact code provided by your lecturer</li>
                      <li className="flex gap-3"><span className="text-teal-500">•</span> Codes are case-insensitive</li>
                      <li className="flex gap-3"><span className="text-teal-500">•</span> Stable internet connection required</li>
                      <li className="flex gap-3"><span className="text-teal-500">•</span> Do not share your exam code</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-zinc-200 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <BookOpen className="h-6 w-6 text-teal-600" />
                    Exam Ready
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-8">
                    <div>
                      <h2 className="text-3xl font-bold text-zinc-900">{examInfo.title}</h2>
                      <p className="text-zinc-500 mt-2">{examInfo.courseCode} • {examInfo.courseName}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div className="p-5 bg-zinc-50 rounded-2xl">
                        <p className="text-sm text-zinc-500">Duration</p>
                        <p className="text-3xl font-semibold mt-1">{examInfo.duration} minutes</p>
                      </div>
                      <div className="p-5 bg-zinc-50 rounded-2xl">
                        <p className="text-sm text-zinc-500">Total Marks</p>
                        <p className="text-3xl font-semibold mt-1">{examInfo.totalMarks}</p>
                      </div>
                    </div>

                    <Button onClick={handleStartExam} className="w-full py-7 text-lg">
                      <Zap className="h-6 w-6 mr-3" />
                      Start Exam Now
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </main>
      </div>

      <StatusModal />
    </div>
  );
}