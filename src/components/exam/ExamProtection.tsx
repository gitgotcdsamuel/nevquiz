'use client';

import {
  useEffect,
  useRef,
  useState,
  useCallback,
  ReactNode,
} from 'react';
import { useSession } from 'next-auth/react';
import { Save, Loader2 } from 'lucide-react';

interface SecureExamEnvironmentProps {
  attemptId: string;
  durationSeconds: number;
  maxViolations?: number;               // default: 3
  snapshotIntervalSeconds?: number;     // default: 45
  snapshotQuality?: number;             // 0.1 to 1.0, default: 0.7
  autoSaveIntervalSeconds?: number;     // default: 60
  onAutoSubmit: (reason: string) => void;
  onViolationUpdate?: (count: number) => void;
  onSaveProgress?: (attemptId: string) => Promise<boolean>;
  children: ReactNode;
}

export default function SecureExamEnvironment({
  attemptId,
  durationSeconds,
  maxViolations = 3,
  snapshotIntervalSeconds = 45,
  snapshotQuality = 0.7,
  autoSaveIntervalSeconds = 60,
  onAutoSubmit,
  onViolationUpdate,
  onSaveProgress,
  children,
}: SecureExamEnvironmentProps) {
  const { data: session } = useSession();

  const [violationCount, setViolationCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(durationSeconds);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const saveIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const violationCooldownRef = useRef<Record<string, number>>({});

  // ── Helpers ─────────────────────────────────────────────────────────────
  const showNotification = useCallback((msg: string, durationMs = 5000) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), durationMs);
  }, []);

  const reportViolation = useCallback(
    async (type: string, description: string, severity: string = 'MEDIUM') => {
      const key = `${type}-${attemptId}`;
      const now = Date.now();

      // Debounce: ignore duplicate reports within 5 seconds
      if (now - (violationCooldownRef.current[key] || 0) < 5000) {
        return;
      }
      violationCooldownRef.current[key] = now;

      setViolationCount((prev) => {
        const newCount = prev + 1;
        onViolationUpdate?.(newCount);

        if (newCount >= maxViolations) {
          onAutoSubmit(`Maximum violations reached (${type})`);
        }

        return newCount;
      });

      showNotification(`${type} violation: ${description}`, 6000);

      try {
        await fetch('/api/violations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            attemptId,
            violationType: type,
            description,
            severity,
          }),
        });
      } catch (err) {
        console.error('Failed to report violation:', err);
      }
    },
    [attemptId, maxViolations, onAutoSubmit, onViolationUpdate, showNotification]
  );

  // ── Full-screen enforcement with cross-browser support ──────────────────
  const requestFullscreen = useCallback(async () => {
    const elem = document.documentElement;
    const methods = [
      'requestFullscreen',
      'webkitRequestFullscreen',
      'mozRequestFullScreen',
      'msRequestFullscreen',
    ];

    for (const method of methods) {
      if (typeof (elem as any)[method] === 'function') {
        try {
          await (elem as any)[method]();
          setIsFullScreen(true);
          return true;
        } catch (err) {
          console.warn(`Fullscreen method ${method} failed`, err);
        }
      }
    }
    showNotification('Fullscreen could not be activated. Some monitoring may be limited.', 8000);
    return false;
  }, [showNotification]);

  const handleFullscreenChange = useCallback(() => {
    const fullscreenElement =
      document.fullscreenElement ||
      (document as any).webkitFullscreenElement ||
      (document as any).mozFullScreenElement ||
      (document as any).msFullscreenElement;

    const nowFull = !!fullscreenElement;
    setIsFullScreen(nowFull);

    if (!nowFull) {
      reportViolation('FULLSCREEN_EXIT', 'Exited full-screen mode', 'HIGH');

      if (violationCount < maxViolations) {
        setTimeout(requestFullscreen, 800);
      }
    }
  }, [violationCount, maxViolations, requestFullscreen, reportViolation]);

  useEffect(() => {
    const events = [
      'fullscreenchange',
      'webkitfullscreenchange',
      'mozfullscreenchange',
      'MSFullscreenChange',
    ];

    events.forEach((ev) => document.addEventListener(ev, handleFullscreenChange));

    requestFullscreen();

    return () => {
      events.forEach((ev) => document.removeEventListener(ev, handleFullscreenChange));
    };
  }, [handleFullscreenChange, requestFullscreen]);

  // ── Tab / focus / window loss detection ─────────────────────────────────
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'hidden' || !document.hasFocus()) {
        reportViolation('TAB_SWITCH', 'Tab/window lost focus', 'MEDIUM');
      }
    };

    const handleBlur = () => {
      reportViolation('WINDOW_BLUR', 'Window focus lost', 'MEDIUM');
    };

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
      reportViolation('BROWSER_EXIT', 'Attempt to close browser or tab', 'HIGH');
    };

    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('blur', handleBlur);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [reportViolation]);

  // ── Input protection (copy/paste/right-click + advanced shortcuts) ──────
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      reportViolation('RIGHT_CLICK', 'Right-click attempted', 'LOW');
    };

    const handleClipboard = (e: ClipboardEvent, action: string) => {
      e.preventDefault();
      reportViolation('COPY_PASTE', `${action} attempt detected`, 'MEDIUM');
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Screenshot attempts
      if (e.key === 'PrintScreen') {
        reportViolation('SCREENSHOT_ATTEMPT', 'PrintScreen key pressed', 'HIGH');
      }

      // Mac screenshot shortcuts (Cmd/Ctrl + Shift + 3/4/5)
      if (
        (e.metaKey || e.ctrlKey) &&
        e.shiftKey &&
        ['3', '4', '5'].includes(e.key)
      ) {
        reportViolation('SCREENSHOT_ATTEMPT', 'System screenshot shortcut used', 'HIGH');
      }

      // Developer tools attempts
      if (
        e.key === 'F12' ||
        ((e.ctrlKey || e.metaKey) && e.shiftKey && ['I', 'J', 'C'].includes(e.key.toUpperCase()))
      ) {
        e.preventDefault();
        reportViolation('DEV_TOOLS_ATTEMPT', 'Developer tools access attempted', 'HIGH');
      }

      // Prevent opening new tabs/windows
      if ((e.ctrlKey || e.metaKey) && ['t', 'n', 'w'].includes(e.key.toLowerCase())) {
        e.preventDefault();
        reportViolation('NEW_TAB_ATTEMPT', 'Attempt to open new tab/window', 'MEDIUM');
      }
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('copy', (e) => handleClipboard(e, 'Copy'));
    document.addEventListener('paste', (e) => handleClipboard(e, 'Paste'));
    document.addEventListener('cut', (e) => handleClipboard(e, 'Cut'));
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('copy', handleClipboard as any);
      document.removeEventListener('paste', handleClipboard as any);
      document.removeEventListener('cut', handleClipboard as any);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [reportViolation, attemptId]);

  // ── Webcam & periodic snapshots ─────────────────────────────────────────
  useEffect(() => {
    let stream: MediaStream | null = null;
    let snapshotInterval: NodeJS.Timeout | null = null;
    let retryCount = 0;
    const MAX_RETRIES = 3;

    const startWebcam = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user' },
        });
        if (videoRef.current) videoRef.current.srcObject = stream;
        retryCount = 0;
      } catch (err: any) {
        if (retryCount < MAX_RETRIES) {
          retryCount++;
          setTimeout(startWebcam, 2000);
          return;
        }
        reportViolation('WEBCAM_DENIED', `Webcam access failed: ${err.message}`, 'HIGH');
        showNotification('Webcam is required for this exam. Please allow access and reload.', 10000);
      }
    };

    startWebcam();

    snapshotInterval = setInterval(() => {
      if (!videoRef.current || videoRef.current.videoWidth === 0) return;

      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0);
        const base64 = canvas.toDataURL('image/jpeg', snapshotQuality);

        fetch('/api/proctor/snapshot', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            attemptId,
            imageBase64: base64,
            timestamp: new Date().toISOString(),
          }),
        }).catch((err) => {
          console.warn('Snapshot upload failed', err);
        });
      }
    }, snapshotIntervalSeconds * 1000);

    return () => {
      if (snapshotInterval) clearInterval(snapshotInterval);
      if (stream) stream.getTracks().forEach((t) => t.stop());
    };
  }, [attemptId, snapshotIntervalSeconds, snapshotQuality, reportViolation, showNotification]);

  // ── Timer ────────────────────────────────────────────────────────────────
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0) {
          clearInterval(interval);
          onAutoSubmit('Time expired');
          return 0;
        }
        if (prev <= 60 && prev % 15 === 0) {
          showNotification(`Warning: ${prev} seconds remaining!`, 4000);
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [onAutoSubmit, showNotification]);

  // ── Auto-save ───────────────────────────────────────────────────────────
  const performSave = useCallback(async () => {
    if (!onSaveProgress) return false;

    if (Date.now() - lastSaveTimestampRef.current < 10000) return true;

    setIsSaving(true);
    try {
      const success = await onSaveProgress(attemptId);
      if (success) {
        lastSaveTimestampRef.current = Date.now();
        showNotification('Progress saved', 3000);
        return true;
      } else {
        showNotification('Auto-save failed — try manual save', 6000);
        return false;
      }
    } catch (err) {
      console.error('Save error:', err);
      showNotification('Save error occurred', 6000);
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [onSaveProgress, attemptId, showNotification]);

  useEffect(() => {
    if (!onSaveProgress) return;

    const initialSave = setTimeout(performSave, 8000);

    saveIntervalRef.current = setInterval(performSave, autoSaveIntervalSeconds * 1000);

    return () => {
      clearTimeout(initialSave);
      if (saveIntervalRef.current) clearInterval(saveIntervalRef.current);
    };
  }, [performSave, autoSaveIntervalSeconds, onSaveProgress]);

  // ── Heartbeat (light activity ping) ─────────────────────────────────────
  useEffect(() => {
    const heartbeat = setInterval(() => {
      fetch('/api/attempts/heartbeat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ attemptId }),
      }).catch(() => {});
    }, 15000);

    return () => clearInterval(heartbeat);
  }, [attemptId]);

  return (
    <div className="min-h-screen bg-gray-50 relative overflow-hidden">
      {/* Webcam preview */}
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        className="fixed bottom-6 right-6 w-56 h-42 border-4 border-red-600 rounded-xl shadow-2xl z-50 object-cover bg-black"
        aria-label="Your webcam preview (proctoring)"
      />

      {/* Header with timer, violations & save status */}
      <header className="fixed top-0 left-0 right-0 bg-red-800 text-white px-6 py-3 flex justify-between items-center z-50 shadow-lg">
        <div className="font-medium">
          Time remaining:{' '}
          <span className="font-bold">
            {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
          </span>
        </div>
        <div className="flex items-center gap-6 font-medium">
          <span>
            Violations: <span className="font-bold text-yellow-300">{violationCount}</span> / {maxViolations}
          </span>
          {isSaving && (
            <span className="text-yellow-300 flex items-center gap-1.5">
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving...
            </span>
          )}
        </div>
      </header>

      {/* Notification banner */}
      {notification && (
        <div className="fixed top-14 left-1/2 -translate-x-1/2 bg-yellow-600 text-white px-6 py-3 rounded-b-xl shadow-lg z-40 max-w-2xl text-center animate-fade-in">
          {notification}
        </div>
      )}

      {/* Proctoring notice */}
      <div className="fixed top-28 left-0 right-0 bg-red-600/80 text-white text-center py-2 z-40 text-sm font-medium">
        This exam is proctored. Webcam, browser activity, tab changes, input, and shortcuts are monitored.
      </div>

      {/* Main content */}
      <main className="mt-40 pb-40 px-4 md:px-8 max-w-6xl mx-auto">
        {children}
      </main>

      {/* Floating manual save button */}
      <button
        onClick={performSave}
        disabled={isSaving}
        className={`
          fixed bottom-8 right-8 z-50
          flex items-center gap-2
          ${isSaving 
            ? 'bg-gray-500 cursor-not-allowed' 
            : 'bg-indigo-600 hover:bg-indigo-700 active:scale-95'}
          text-white px-6 py-3.5 rounded-full shadow-xl transition-all duration-200
        `}
        aria-label="Save your current progress"
      >
        {isSaving ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <Save className="h-5 w-5" />
        )}
        {isSaving ? 'Saving...' : 'Save Progress'}
      </button>

      {/* Full-screen overlay */}
      {!isFullScreen && (
        <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-[100]">
          <div className="bg-white rounded-2xl p-10 max-w-lg w-full mx-4 text-center shadow-2xl">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Secure Exam Mode Required</h2>
            <p className="text-lg text-gray-700 mb-8 leading-relaxed">
              This exam requires full-screen mode. Click below to enter.<br />
              Exiting will be logged as a violation.
            </p>
            <button
              onClick={requestFullscreen}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xl font-semibold px-12 py-5 rounded-xl transition transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-300"
              aria-label="Enter full-screen mode"
            >
              Enter Full-Screen & Continue
            </button>
          </div>
        </div>
      )}
    </div>
  );
}