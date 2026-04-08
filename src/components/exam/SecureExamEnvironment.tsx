// src/components/exam/SecureExamEnvironment.tsx
'use client';

import { useEffect, useState, useCallback } from 'react';

interface SecureExamEnvironmentProps {
  children: React.ReactNode;
  attemptId: string;
  examId: string;
  durationSeconds: number;
  onAutoSubmit: (reason: string) => void;
  violationCount: number;
  isTabActive?: boolean;
}

export default function SecureExamEnvironment({
  children,
  attemptId,
  examId,
  durationSeconds,
  onAutoSubmit,
  violationCount,
  isTabActive = true
}: SecureExamEnvironmentProps) {
  const [timeLeft, setTimeLeft] = useState(durationSeconds);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [violations, setViolations] = useState<string[]>([]);
  const [isTabFocused, setIsTabFocused] = useState(true);
  const [clipboardAttempts, setClipboardAttempts] = useState(0);
  const [screenshotAttempts, setScreenshotAttempts] = useState(0);
  const [showWarning, setShowWarning] = useState(false);
  const [warningMessage, setWarningMessage] = useState('');

  // Safe substring function
  const safeSubstring = (str: string, length: number) => {
    if (!str) return 'N/A';
    return str.length > length ? `${str.substring(0, length)}...` : str;
  };

  // Format time for display
  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Add violation and check for auto-submit
  const addViolation = useCallback((type: string, description: string) => {
    const violation = `${new Date().toLocaleTimeString()}: ${type} - ${description}`;
    setViolations(prev => [...prev, violation]);
    
    // Show warning
    setWarningMessage(`⚠️ ${description}`);
    setShowWarning(true);
    setTimeout(() => setShowWarning(false), 5000);
  }, []);

  // Timer countdown
  useEffect(() => {
    if (timeLeft <= 0) {
      onAutoSubmit('Time expired');
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          onAutoSubmit('Time expired');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, onAutoSubmit]);

  // Check for 3 violations auto-submit
  useEffect(() => {
    if (violationCount >= 3) {
      onAutoSubmit('Exceeded maximum violations (3)');
    }
  }, [violationCount, onAutoSubmit]);

  // Fullscreen detection
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isFull = !!document.fullscreenElement;
      setIsFullscreen(isFull);
      
      if (!isFull) {
        addViolation('EXITED_FULLSCREEN', 'User exited fullscreen mode');
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, [addViolation]);

  // Tab focus detection
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIsTabFocused(false);
        addViolation('TAB_SWITCH', 'User switched to another tab/window');
      } else {
        setIsTabFocused(true);
      }
    };

    const handleBlur = () => {
      setIsTabFocused(false);
      addViolation('WINDOW_BLUR', 'User focused on another window');
    };

    const handleFocus = () => {
      setIsTabFocused(true);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', handleFocus);
    };
  }, [addViolation]);

  // Copy/paste prevention
  useEffect(() => {
    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      setClipboardAttempts(prev => prev + 1);
      addViolation('COPY_ATTEMPT', 'Copying is disabled during exam');
    };

    const handlePaste = (e: ClipboardEvent) => {
      e.preventDefault();
      setClipboardAttempts(prev => prev + 1);
      addViolation('PASTE_ATTEMPT', 'Pasting is disabled during exam');
    };

    const handleCut = (e: ClipboardEvent) => {
      e.preventDefault();
      addViolation('CUT_ATTEMPT', 'Cutting is disabled during exam');
    };

    document.addEventListener('copy', handleCopy);
    document.addEventListener('paste', handlePaste);
    document.addEventListener('cut', handleCut);

    return () => {
      document.removeEventListener('copy', handleCopy);
      document.removeEventListener('paste', handlePaste);
      document.removeEventListener('cut', handleCut);
    };
  }, [addViolation]);

  // Right-click prevention (for screenshot tools)
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      addViolation('RIGHT_CLICK', 'Context menu disabled during exam');
    };

    document.addEventListener('contextmenu', handleContextMenu);
    return () => document.removeEventListener('contextmenu', handleContextMenu);
  }, [addViolation]);

  // Screenshot key prevention
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Detect Print Screen key
      if (e.key === 'PrintScreen' || (e.ctrlKey && e.key === 'p')) {
        e.preventDefault();
        setScreenshotAttempts(prev => prev + 1);
        addViolation('SCREENSHOT_ATTEMPT', 'Screenshots are disabled during exam');
      }
      
      // Detect F12 (DevTools)
      if (e.key === 'F12') {
        e.preventDefault();
        addViolation('DEVTOOLS_ATTEMPT', 'Developer tools are disabled during exam');
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [addViolation]);

  // Request fullscreen on start
  useEffect(() => {
    const requestFullscreen = async () => {
      try {
        if (document.documentElement.requestFullscreen) {
          await document.documentElement.requestFullscreen();
          setIsFullscreen(true);
        }
      } catch (error) {
        console.log('Fullscreen not supported or denied:', error);
      }
    };

    // Request fullscreen after a short delay
    const timer = setTimeout(() => {
      requestFullscreen();
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Auto-submit when tab is closed
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = 'Are you sure you want to leave? Your exam will be submitted.';
      return e.returnValue;
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [onAutoSubmit]);

  return (
    <div className="secure-exam-environment">
      {/* Warning Toast */}
      {showWarning && (
        <div className="warning-toast">
          <div className="warning-content">
            <span className="warning-icon">⚠️</span>
            <span>{warningMessage}</span>
          </div>
        </div>
      )}

      {/* Security Header */}
      <div className="security-header">
        <div className="security-left">
          <div className="security-indicators">
            <span className={`security-indicator ${isTabFocused ? 'active' : 'violation'}`}>
              {isTabFocused ? '📱' : '⚠️'} {isTabFocused ? 'Tab Active' : 'Tab Switched'}
            </span>
            <span className={`security-indicator ${isFullscreen ? 'active' : 'violation'}`}>
              {isFullscreen ? '🔲' : '⚠️'} {isFullscreen ? 'Fullscreen' : 'Not Fullscreen'}
            </span>
            <span className={`security-indicator ${violationCount === 0 ? 'active' : 'violation'}`}>
              ⚠️ Violations: {violationCount}/3
            </span>
            <span className="security-indicator">
              🕒 Time: {formatTime(timeLeft)}
            </span>
          </div>
        </div>
        
        <div className="security-right">
          <div className="exam-info">
            <span className="info-item">Exam: {safeSubstring(examId, 6)}</span>
            <span className="info-divider">|</span>
            <span className="info-item">Attempt: {safeSubstring(attemptId, 6)}</span>
            {(clipboardAttempts > 0 || screenshotAttempts > 0) && (
              <>
                <span className="info-divider">|</span>
                <span className="info-item stats">
                  📋{clipboardAttempts} 📸{screenshotAttempts}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Violation Log (collapsible) */}
      {violations.length > 0 && (
        <div className="violation-log">
          <details>
            <summary>
              View Violation Log ({violations.length} violation{violations.length !== 1 ? 's' : ''})
            </summary>
            <div className="violation-list">
              {violations.map((violation, index) => (
                <div key={index} className="violation-item">
                  {violation}
                </div>
              ))}
            </div>
          </details>
        </div>
      )}

      {/* Exam Content */}
      <div className="exam-content">
        {children}
      </div>

      {/* Security Footer */}
      <div className="security-footer">
        <div className="footer-content">
          <span className="footer-text">
            🔒 Secure Exam Environment Active • Do not switch tabs or windows • 
            Copy/Paste disabled • Screenshots disabled • All actions are logged
          </span>
          {violationCount > 0 && (
            <span className="footer-warning">
              ⚠️ {3 - violationCount} warning{violationCount === 2 ? '' : 's'} remaining before auto-submit
            </span>
          )}
        </div>
      </div>

      <style jsx>{`
        .secure-exam-environment {
          border: 3px solid #dc2626;
          border-radius: 12px;
          padding: 0;
          margin: 20px 0;
          background: #fef2f2;
          position: relative;
          overflow: hidden;
        }

        .warning-toast {
          position: fixed;
          top: 20px;
          left: 50%;
          transform: translateX(-50%);
          background: #fbbf24;
          color: #78350f;
          padding: 12px 24px;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          z-index: 1000;
          animation: slideIn 0.3s ease-out;
        }

        @keyframes slideIn {
          from { transform: translate(-50%, -20px); opacity: 0; }
          to { transform: translate(-50%, 0); opacity: 1; }
        }

        .warning-content {
          display: flex;
          align-items: center;
          gap: 10px;
          font-weight: 500;
        }

        .security-header {
          background: linear-gradient(135deg, #dc2626, #b91c1c);
          color: white;
          padding: 12px 24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 14px;
          border-bottom: 2px solid #991b1b;
        }

        .security-left, .security-right {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .security-indicators {
          display: flex;
          gap: 20px;
        }

        .security-indicator {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 4px 12px;
          border-radius: 20px;
          background: rgba(255,255,255,0.1);
          transition: all 0.2s;
        }

        .security-indicator.active {
          background: rgba(34, 197, 94, 0.2);
        }

        .security-indicator.violation {
          background: rgba(239, 68, 68, 0.3);
          animation: pulse 1s infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }

        .exam-info {
          display: flex;
          align-items: center;
          gap: 12px;
          font-family: 'Courier New', monospace;
          background: rgba(0,0,0,0.2);
          padding: 6px 12px;
          border-radius: 6px;
        }

        .info-item {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .info-divider {
          opacity: 0.5;
        }

        .stats {
          font-size: 12px;
        }

        .violation-log {
          background: #fee2e2;
          border-bottom: 1px solid #fecaca;
          padding: 8px 24px;
        }

        .violation-log details {
          cursor: pointer;
        }

        .violation-log summary {
          color: #7f1d1d;
          font-weight: 500;
          list-style: none;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .violation-log summary::-webkit-details-marker {
          display: none;
        }

        .violation-list {
          margin-top: 8px;
          max-height: 200px;
          overflow-y: auto;
          background: white;
          border-radius: 6px;
          padding: 8px;
          border: 1px solid #fecaca;
        }

        .violation-item {
          padding: 6px 8px;
          border-bottom: 1px solid #f3f4f6;
          font-size: 12px;
          color: #6b7280;
          font-family: 'Courier New', monospace;
        }

        .violation-item:last-child {
          border-bottom: none;
        }

        .exam-content {
          padding: 24px;
          min-height: 500px;
        }

        .security-footer {
          background: #fed7d7;
          border-top: 1px solid #fecaca;
          padding: 10px 24px;
        }

        .footer-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 12px;
          color: #7f1d1d;
        }

        .footer-text {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .footer-warning {
          background: #fef3c7;
          color: #92400e;
          padding: 4px 12px;
          border-radius: 20px;
          font-weight: 600;
          animation: pulse 2s infinite;
        }

        @media (max-width: 1024px) {
          .security-header {
            flex-direction: column;
            gap: 12px;
            align-items: flex-start;
          }
          
          .security-left, .security-right {
            width: 100%;
            justify-content: space-between;
          }
          
          .security-indicators {
            flex-wrap: wrap;
            gap: 8px;
          }
          
          .footer-content {
            flex-direction: column;
            gap: 8px;
            align-items: flex-start;
          }
        }

        @media (max-width: 768px) {
          .security-indicators {
            flex-direction: column;
            gap: 6px;
          }
          
          .security-indicator {
            width: 100%;
            justify-content: center;
          }
          
          .exam-info {
            flex-wrap: wrap;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
}