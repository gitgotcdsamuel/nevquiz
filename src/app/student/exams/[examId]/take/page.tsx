'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import SecureExamEnvironment from '@/components/exam/SecureExamEnvironment';
import QuestionRenderer from '@/components/exam/QuestionRenderer';
import useExamProctoring from '@/hooks/useExamProctoring';
import { sampleExams } from '@/data/sampleExamsData';

const DEMO_EMAILS = [
  'student@example.com',
  'admin@example.com',
  'lecturer@example.com',
  'demo@example.com',
  'test@example.com',
];

const DEMO_NAMES = [
  'Demo Student',
  'Test Student',
  'Demo User',
  'Student Demo',
  'jessie',
];

export default function TakeExamPage() {
  const { examId } = useParams<{ examId: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();

  const urlAttemptId = searchParams.get('attemptId');
  const forceDemoFromUrl = searchParams.get('demo') === 'true';

  const [examData, setExamData] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [timeSpent, setTimeSpent] = useState(0);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [isDemoStudent, setIsDemoStudent] = useState<boolean | null>(null);
  const [effectiveAttemptId, setEffectiveAttemptId] = useState<string | null>(null);
  const maxViolations = 3;

  const [showWebcamPrompt, setShowWebcamPrompt] = useState(true);
  const [useFaceProctoring, setUseFaceProctoring] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const answersRef = useRef(answers);
  const hasChangesRef = useRef(hasChanges);
  
  // Stability refs
  const proctoringEnabledRef = useRef(false);
  const cameraRetryCountRef = useRef(0);
  const MAX_CAMERA_RETRIES = 3;

  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  useEffect(() => {
    hasChangesRef.current = hasChanges;
  }, [hasChanges]);

  const proctoring = useExamProctoring({
    examId: examId as string,
    attemptId: effectiveAttemptId || '',
    maxViolations,
    onMaxViolations: () => handleSubmit(true, 'Maximum allowed violations exceeded (3)'),
    useFaceProctoring,
    videoRef,
    canvasRef,
  });

  const {
    violationCount,
    isTabActive,
    clipboardAttempts,
    screenshotAttempts,
    faceStatus,
    cameraReady,
    cameraError,
    retryCamera,
  } = proctoring;

  // Update proctoring enabled ref
  useEffect(() => {
    proctoringEnabledRef.current = useFaceProctoring;
  }, [useFaceProctoring]);

  const handleEnableCamera = async () => {
    console.log('📹 Enabling camera...');
    
    try {
      // First check if any camera is available
      const devices = await navigator.mediaDevices.enumerateDevices();
      const hasCamera = devices.some(device => device.kind === 'videoinput');
      
      if (!hasCamera) {
        alert('No camera detected on this device. Please connect a camera and refresh the page.');
        return;
      }
      
      // Test if we can get permission and access the camera
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      
      // Success - stop the test stream and enable proctoring
      stream.getTracks().forEach(track => track.stop());
      setUseFaceProctoring(true);
      setShowWebcamPrompt(false);
      cameraRetryCountRef.current = 0; // Reset retry count on success
    } catch (err: any) {
      console.error('Permission error:', err);
      
      if (err.name === 'NotAllowedError') {
        alert('Camera permission denied.\n\nPlease:\n1. Click the camera icon in your browser address bar\n2. Select "Allow" for camera access\n3. Click "Enable Camera" again');
      } else if (err.name === 'NotReadableError') {
        alert('Camera is being used by another application.\n\nPlease:\n1. Close any other apps using your camera (Zoom, Discord, Teams, etc.)\n2. Close other browser tabs that might use the camera\n3. Click "Enable Camera" again');
      } else if (err.name === 'NotFoundError') {
        alert('No camera found. Please connect a camera and refresh the page.');
      } else {
        alert('Could not access camera: ' + err.message);
      }
    }
  };

  // Update the retry handler with rate limiting - FIXED: removed setCameraError
  const handleRetryCamera = useCallback(() => {
    if (cameraRetryCountRef.current >= MAX_CAMERA_RETRIES) {
      console.log('[Page] Max camera retries reached');
      alert('Unable to start camera after multiple attempts. Please refresh the page.');
      return;
    }
    
    cameraRetryCountRef.current++;
    console.log(`[Page] Retrying camera (attempt ${cameraRetryCountRef.current}/${MAX_CAMERA_RETRIES})`);
    
    if (retryCamera) {
      retryCamera();
    }
    
    // Reset retry count after success
    setTimeout(() => {
      if (cameraReady) {
        cameraRetryCountRef.current = 0;
      }
    }, 2000);
  }, [retryCamera, cameraReady]);

  // Monitor camera stability
  useEffect(() => {
    if (!useFaceProctoring) return;
    
    let stabilityCheck: NodeJS.Timeout;
    let lastCameraState = cameraReady;
    
    stabilityCheck = setInterval(() => {
      // Log state changes for debugging
      if (lastCameraState !== cameraReady) {
        console.log(`[Page] Camera state changed: ${lastCameraState} -> ${cameraReady}`);
        lastCameraState = cameraReady;
        
        // If camera just turned off unexpectedly, retry
        if (!cameraReady && !cameraError && proctoringEnabledRef.current) {
          console.log('[Page] Camera turned off unexpectedly, retrying...');
          handleRetryCamera();
        }
      }
    }, 1000);
    
    return () => clearInterval(stabilityCheck);
  }, [useFaceProctoring, cameraReady, cameraError, handleRetryCamera]);

  useEffect(() => {
    if (sessionStatus === 'loading') return;

    const demoDetected =
      forceDemoFromUrl ||
      !urlAttemptId ||
      process.env.NODE_ENV === 'development' ||
      (session?.user &&
        (DEMO_EMAILS.some((e) => (session.user.email || '').toLowerCase().includes(e.toLowerCase())) ||
          DEMO_NAMES.some((n) => (session.user.name || '').toLowerCase().includes(n.toLowerCase())) ||
          (session.user.email || '').toLowerCase().includes('demo') ||
          (session.user.name || '').toLowerCase().includes('demo')));

    setIsDemoStudent(demoDetected);

    if (!urlAttemptId && demoDetected) {
      const mockId = `demo-attempt-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      setEffectiveAttemptId(mockId);
    } else {
      setEffectiveAttemptId(urlAttemptId);
    }
  }, [session, sessionStatus, urlAttemptId, forceDemoFromUrl]);

  useEffect(() => {
    if (!effectiveAttemptId || !examData || examData.status !== 'IN_PROGRESS') return;
    const timer = setInterval(() => setTimeSpent((prev) => prev + 1), 1000);
    return () => clearInterval(timer);
  }, [effectiveAttemptId, examData]);

  useEffect(() => {
    if (!effectiveAttemptId || !examData || !hasChangesRef.current || examData.status !== 'IN_PROGRESS') return;
    const interval = setInterval(() => handleSaveProgress(false), 30000);
    return () => clearInterval(interval);
  }, [effectiveAttemptId, examData]);

  useEffect(() => {
    if (sessionStatus === 'loading' || isDemoStudent === null || !effectiveAttemptId || !examId) return;

    const loadExam = async () => {
      setLoading(true);
      setError('');

      try {
        if (isDemoStudent) {
          const sampleExam = sampleExams[examId];
          if (!sampleExam) throw new Error(`Demo exam "${examId}" not found`);
          setExamData({
            ...sampleExam,
            lecturerName: 'Demo Lecturer',
            status: 'IN_PROGRESS',
            instructions: sampleExam.instructions?.join('\n') || '',
            isDemo: true,
          });
          setQuestions(sampleExam.questions || []);
          setAnswers({});
          setTimeSpent(0);
        } else {
          if (!session) throw new Error('Authentication required');
          const res = await fetch(`/api/exams/${examId}/attempt/${effectiveAttemptId}`, {
            credentials: 'include',
          });
          if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            throw new Error(errData.error || `HTTP ${res.status}`);
          }
          const data = await res.json();
          if (!data.success || !data.exam) throw new Error(data.error || 'Invalid response');
          setExamData(data.exam);
          setQuestions(data.exam.questions || []);
          setAnswers(data.answers || {});
          setTimeSpent(data.attempt?.timeSpent || 0);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load exam');
      } finally {
        setLoading(false);
      }
    };

    loadExam();
  }, [examId, effectiveAttemptId, session, sessionStatus, isDemoStudent]);

  const handleSaveProgress = useCallback(async (showToast = true) => {
    if (!hasChangesRef.current) return;

    if (isDemoStudent) {
      const now = new Date().toLocaleTimeString();
      setLastSaved(now);
      setHasChanges(false);
      if (showToast) alert(`Demo progress saved at ${now}`);
      return;
    }

    try {
      const res = await fetch(`/api/exams/${examId}/attempt/${effectiveAttemptId}/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: answersRef.current }),
      });
      if (!res.ok) throw new Error('Save failed');
      const now = new Date().toLocaleTimeString();
      setLastSaved(now);
      setHasChanges(false);
      if (showToast) alert(`Progress saved at ${now}`);
    } catch (err: any) {
      if (showToast) alert(`Failed to save: ${err.message}`);
    }
  }, [isDemoStudent, examId, effectiveAttemptId]);

  const calculateDemoScore = useCallback(() => {
    let score = 0;
    let total = 0;
    questions.forEach((q: any) => {
      const points = q.points || 1;
      total += points;
      const userAns = answers[q.id];
      if (userAns == null) return;

      if (q.type === 'mcq' || q.type === 'boolean') {
        if (userAns === q.correctAnswer) score += points;
      } else if (q.type === 'short') {
        if (typeof userAns !== 'string') return;
        const userText = userAns.trim();
        const correct = String(q.correctAnswer ?? '').trim();
        if (q.caseSensitive ? userText === correct : userText.toLowerCase() === correct.toLowerCase()) {
          score += points;
        }
      } else if (q.type === 'explain' && Array.isArray(q.keywords) && q.keywords.length > 0) {
        if (typeof userAns !== 'string') return;
        const text = userAns.toLowerCase();
        let matched = 0;
        q.keywords.forEach((kw: string) => {
          if (text.includes(kw.trim().toLowerCase())) matched++;
        });
        const pct = (matched / q.keywords.length) * 100;
        if (pct >= 60) score += points;
        else if (pct >= 30) score += points * 0.5;
      }
    });
    return { score, total };
  }, [questions, answers]);

  const handleSubmit = useCallback(async (auto = false, reason = '') => {
    if (isSubmitting) return;
    if (!auto && !window.confirm('Are you sure you want to submit?\nThis cannot be undone.')) return;

    setIsSubmitting(true);
    let redirectUrl = `/student/results?examId=${examId}&attemptId=${effectiveAttemptId}&submitted=true`;

    try {
      if (isDemoStudent) {
        const { score, total } = calculateDemoScore();
        const pct = total > 0 ? (score / total) * 100 : 0;
        const passingThreshold = (examData?.passingMarks / examData?.totalMarks) * 100 || 50;
        const passed = pct >= passingThreshold;
        redirectUrl += `&demo=true&score=${score}&total=${total}&passed=${passed}`;
        alert(
          `Demo Exam Submitted\n\nScore: ${score}/${total} (${pct.toFixed(1)}%)\nStatus: ${passed ? 'PASSED' : 'FAILED'}\n\nRedirecting...`
        );
      } else {
        const res = await fetch(`/api/exams/${examId}/attempt/${effectiveAttemptId}/submit`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            answers: answersRef.current,
            timeSpent,
            autoSubmitted: auto,
            terminationReason: reason || (auto ? 'Auto-submitted by system' : 'Manual submission'),
          }),
        });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || 'Submission failed');
        }
        alert('Exam submitted successfully.\nRedirecting to results page...');
      }

      if (document.exitFullscreen) await document.exitFullscreen().catch(() => {});
      router.replace(redirectUrl);
    } catch (err: any) {
      alert(`Submission failed: ${err.message || 'Unknown error'}`);
      setIsSubmitting(false);
    }
  }, [isSubmitting, isDemoStudent, calculateDemoScore, examData, examId, effectiveAttemptId, timeSpent, router]);

  const handleAnswerChange = useCallback((questionId: string, value: any) => {
    setAnswers((prev) => {
      if (prev[questionId] === value) return prev;
      return { ...prev, [questionId]: value };
    });
    setHasChanges(true);
  }, []);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  const timeRemaining = examData?.duration ? Math.max(0, examData.duration * 60 - timeSpent) : 0;

  if (sessionStatus === 'loading' || isDemoStudent === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg">Authenticating...</p>
        </div>
      </div>
    );
  }

  if (showWebcamPrompt) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
          <h2 className="text-2xl font-bold mb-6">Camera Permission Required</h2>
          <p className="text-gray-700 mb-8">
            This exam requires camera access for proctoring purposes.
            <br /><br />
            <strong className="text-red-600">Important:</strong> When your browser asks for camera permission, you MUST click <strong className="bg-yellow-200 px-2 py-1 rounded">ALLOW</strong>.
            <br /><br />
            If you accidentally blocked it, click the camera icon in your address bar and change the permission to Allow.
          </p>
          
          <div className="bg-blue-50 p-4 rounded-lg mb-6 text-left text-sm">
            <p className="font-semibold mb-2">📸 Need help?</p>
            <p className="mb-1"><strong>Chrome/Edge:</strong> Click the camera icon in the address bar → Select "Allow"</p>
            <p><strong>Firefox:</strong> Click the camera icon in the address bar → Select "Allow"</p>
          </div>
          
          <div className="flex flex-col gap-4">
            <button
              onClick={handleEnableCamera}
              className="px-8 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition"
            >
              Enable Camera & Start Exam
            </button>
            <button
              onClick={() => {
                setShowWebcamPrompt(false);
                setUseFaceProctoring(false);
              }}
              className="px-8 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition"
            >
              Continue Without Camera (Not Recommended)
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-xl font-medium">Loading exam...</p>
          {isDemoStudent && <p className="mt-2 text-purple-600">Demo Mode</p>}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-lg w-full bg-red-50 border border-red-200 rounded-xl p-8 text-center">
          <h2 className="text-2xl font-bold text-red-800 mb-4">Error Loading Exam</h2>
          <p className="text-red-700 mb-6">{error}</p>
          <button
            onClick={() => router.back()}
            className="px-8 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <SecureExamEnvironment
      attemptId={effectiveAttemptId || ''}
      examId={examId as string}
      durationSeconds={examData?.duration * 60 || 3600}
      onAutoSubmit={(reason) => handleSubmit(true, reason)}
      violationCount={violationCount}
      isTabActive={isTabActive}
    >
      {/* Camera Feed Overlay */}
      {useFaceProctoring && (
        <div
          className="fixed top-4 left-4 z-50 bg-black rounded-lg overflow-hidden shadow-2xl border-2 border-blue-500"
          style={{ width: '240px', height: '180px' }}
        >
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
            style={{ transform: 'scaleX(-1)' }}
            onError={(e) => {
              console.error('Video element error:', e);
            }}
          />
          
          {!cameraReady && !cameraError && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/70">
              <div className="text-white text-xs text-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mx-auto mb-2"></div>
                <p>Starting camera...</p>
              </div>
            </div>
          )}
          
          {cameraError && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/70 p-2">
              <div className="text-white text-xs text-center">
                <p className="text-red-400 font-bold mb-1">⚠️ Camera Error</p>
                <p className="text-[10px]">{cameraError.split('\n')[0]}</p>
                <button
                  onClick={handleRetryCamera}
                  className="mt-2 px-2 py-1 bg-blue-600 text-white text-[10px] rounded hover:bg-blue-700 transition-colors"
                >
                  Retry Camera ({cameraRetryCountRef.current}/{MAX_CAMERA_RETRIES})
                </button>
              </div>
            </div>
          )}
          
          <div className="absolute top-1 right-1 flex items-center gap-1 z-10">
            <div
              className={`w-2 h-2 rounded-full ${
                cameraReady ? 'bg-green-500 animate-pulse' : 'bg-red-500'
              }`}
            />
            <span className="text-[10px] text-white bg-black/50 px-1 rounded">
              {cameraReady ? 'LIVE' : 'OFF'}
            </span>
          </div>
          
          {faceStatus === 'present' && cameraReady && (
            <div className="absolute bottom-1 left-1 right-1 bg-black/60 text-white text-[10px] text-center rounded py-0.5 px-1">
              ✓ Camera active
            </div>
          )}
        </div>
      )}

      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-20 pb-32">
        <div className="bg-white rounded-xl shadow p-6 mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl sm:text-3xl font-bold">{examData?.title}</h1>
                {isDemoStudent && (
                  <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">DEMO</span>
                )}
              </div>
              <p className="text-gray-600 mt-1">
                {examData?.courseCode} • {examData?.courseName}
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-mono font-bold text-blue-700">
                {formatTime(timeRemaining)}
              </div>
              <div className="text-sm text-gray-500">remaining</div>
            </div>
          </div>

          <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm flex flex-wrap gap-4">
            <span>Violations: <strong>{violationCount}/{maxViolations}</strong></span>
            {screenshotAttempts > 0 && <span className="text-red-600">Screenshots: {screenshotAttempts}</span>}
            {clipboardAttempts > 0 && <span className="text-red-600">Clipboard: {clipboardAttempts}</span>}
            {cameraReady && <span className="text-green-600">✓ Camera active</span>}
            {cameraError && <span className="text-red-600">⚠️ Camera unavailable</span>}
          </div>
        </div>

        <div className="space-y-8 mb-28">
          {questions.map((q: any, index: number) => (
            <div key={`${q.id}-${index}`} className="bg-white border rounded-xl p-6 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold">
                  Question {index + 1}
                  <span className="ml-3 text-sm text-gray-500">
                    {q.type === 'mcq' ? 'Multiple Choice' :
                     q.type === 'boolean' ? 'True/False' :
                     q.type === 'short' ? 'Short Answer' : 'Explanation'}
                    {q.points && ` • ${q.points} marks`}
                  </span>
                </h3>
                {answers[q.id] != null && <span className="text-green-600 text-sm">Answered</span>}
              </div>

              <QuestionRenderer
                question={q}
                value={answers[q.id]}
                onChange={(val) => handleAnswerChange(q.id, val)}
              />
            </div>
          ))}
        </div>

        <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-2xl z-40 p-4 sm:p-6">
          <div className="max-w-5xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-sm text-gray-600">
              Answered: {Object.keys(answers).filter((k) => answers[k] != null).length} / {questions.length}
              {hasChanges && ' • Unsaved changes'}
              {lastSaved && ` • Last saved: ${lastSaved}`}
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => handleSaveProgress(true)}
                disabled={isSubmitting || !hasChanges}
                className={`px-6 py-3 rounded-lg font-medium ${
                  isSubmitting || !hasChanges
                    ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {isSubmitting ? 'Saving...' : 'Save Progress'}
              </button>

              <button
                onClick={() => handleSubmit(false)}
                disabled={isSubmitting}
                className={`px-8 py-3 rounded-lg font-medium ${
                  isSubmitting
                    ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Exam'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </SecureExamEnvironment>
  );
}