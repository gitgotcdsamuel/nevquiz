'use client';

import { useEffect, useState, useRef, useCallback } from 'react';

interface ProctoringViolation {
  type: string;
  timestamp: Date;
  details: string;
}

interface UseExamProctoringProps {
  examId: string;
  attemptId: string;
  maxViolations?: number;
  onViolation?: (violation: ProctoringViolation) => void;
  onMaxViolations?: () => void;
  useFaceProctoring?: boolean;
  videoRef?: React.RefObject<HTMLVideoElement>;
  canvasRef?: React.RefObject<HTMLCanvasElement>;
}

export default function useExamProctoring({
  examId,
  attemptId,
  maxViolations = 3,
  onViolation,
  onMaxViolations,
  useFaceProctoring = false,
  videoRef,
  canvasRef,
}: UseExamProctoringProps) {
  const [violations, setViolations] = useState<ProctoringViolation[]>([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isTabActive, setIsTabActive] = useState(true);
  const [clipboardAttempts, setClipboardAttempts] = useState(0);
  const [screenshotAttempts, setScreenshotAttempts] = useState(0);
  const [faceStatus, setFaceStatus] = useState<'loading' | 'present' | 'missing' | 'disabled'>(
    useFaceProctoring ? 'loading' : 'disabled'
  );
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Stable refs to prevent re-renders and race conditions
  const mountedRef = useRef(true);
  const streamRef = useRef<MediaStream | null>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const initializingRef = useRef(false);
  const cameraActiveRef = useRef(false);
  const videoElementRef = useRef<HTMLVideoElement | null>(null);
  const healthCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const addViolation = useCallback(
    (type: string, details: string) => {
      const violation: ProctoringViolation = {
        type,
        timestamp: new Date(),
        details,
      };

      setViolations((prev) => {
        const newViolations = [...prev, violation];
        if (newViolations.length >= maxViolations && onMaxViolations) {
          onMaxViolations();
        }
        return newViolations;
      });
      onViolation?.(violation);
    },
    [maxViolations, onViolation, onMaxViolations]
  );

  const stopCamera = useCallback(() => {
    console.log('[Proctoring] Stopping camera...');
    
    cameraActiveRef.current = false;
    
    // Clear health check interval
    if (healthCheckIntervalRef.current) {
      clearInterval(healthCheckIntervalRef.current);
      healthCheckIntervalRef.current = null;
    }
    
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }
    
    // Stop all tracks
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        if (track.readyState === 'live') {
          track.stop();
          console.log('[Proctoring] Stopped track:', track.kind);
        }
      });
      streamRef.current = null;
    }
    
    // Clean up video element
    if (videoElementRef.current || videoRef?.current) {
      const video = videoElementRef.current || videoRef.current;
      if (video) {
        // Remove event listeners
        video.onloadedmetadata = null;
        video.onerror = null;
        video.onplaying = null;
        
        // Pause and clear source
        try {
          video.pause();
        } catch (err) {
          // Ignore pause errors
        }
        
        video.srcObject = null;
      }
    }
    
    setCameraReady(false);
    if (useFaceProctoring) {
      setFaceStatus('missing');
    }
  }, [videoRef, useFaceProctoring]);

  const initializeCamera = useCallback(async () => {
    // Prevent multiple simultaneous initializations
    if (initializingRef.current) {
      console.log('[Proctoring] Already initializing, skipping...');
      return false;
    }
    
    if (!useFaceProctoring) {
      console.log('[Proctoring] Face proctoring disabled');
      return false;
    }
    
    if (cameraActiveRef.current) {
      console.log('[Proctoring] Camera already active');
      return true;
    }
    
    const video = videoRef?.current;
    if (!video) {
      console.log('[Proctoring] Video ref not ready');
      return false;
    }
    
    videoElementRef.current = video;
    initializingRef.current = true;
    
    try {
      console.log('[Proctoring] Starting camera initialization...');
      
      // Stop any existing camera first
      stopCamera();
      
      // Wait for cleanup
      await new Promise((resolve) => setTimeout(resolve, 100));
      
      if (!mountedRef.current) {
        console.log('[Proctoring] Component unmounted');
        initializingRef.current = false;
        return false;
      }
      
      // Request camera access
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        } 
      });
      
      if (!mountedRef.current) {
        stream.getTracks().forEach(track => track.stop());
        initializingRef.current = false;
        return false;
      }
      
      // Set up video element
      video.srcObject = stream;
      streamRef.current = stream;
      
      // Wait for video to be ready
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Video ready timeout'));
        }, 5000);
        
        const onPlaying = () => {
          clearTimeout(timeout);
          video.removeEventListener('playing', onPlaying);
          resolve(true);
        };
        
        video.addEventListener('playing', onPlaying);
        
        // Start playing
        video.play().catch(reject);
      });
      
      console.log('[Proctoring] Camera initialized successfully');
      cameraActiveRef.current = true;
      setCameraReady(true);
      setFaceStatus('present');
      setCameraError(null);
      initializingRef.current = false;
      
      // Start health check interval
      if (healthCheckIntervalRef.current) {
        clearInterval(healthCheckIntervalRef.current);
      }
      
      healthCheckIntervalRef.current = setInterval(() => {
        const currentVideo = videoRef?.current;
        if (cameraActiveRef.current && currentVideo) {
          // Check if video is still playing
          if (currentVideo.paused || currentVideo.ended || currentVideo.readyState < 2) {
            console.log('[Proctoring] Camera health check failed, restarting...');
            stopCamera();
            initializeCamera();
          }
        }
      }, 5000);
      
      return true;
      
    } catch (err: any) {
      console.error('[Proctoring] Camera initialization failed:', err);
      
      let errorMsg = '';
      if (err.name === 'NotAllowedError') {
        errorMsg = 'Camera permission denied. Please allow camera access and refresh.';
      } else if (err.name === 'NotReadableError') {
        errorMsg = 'Camera is in use by another application. Please close other apps and retry.';
      } else if (err.name === 'NotFoundError') {
        errorMsg = 'No camera found. Please connect a camera.';
      } else {
        errorMsg = `Camera error: ${err.message || 'Unknown error'}`;
      }
      
      setCameraError(errorMsg);
      setCameraReady(false);
      setFaceStatus('missing');
      cameraActiveRef.current = false;
      initializingRef.current = false;
      
      // Clean up on error
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      
      if (video) {
        video.srcObject = null;
      }
      
      return false;
    }
  }, [useFaceProctoring, videoRef, stopCamera]);

  const retryCamera = useCallback(() => {
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
    }
    
    if (initializingRef.current) {
      console.log('[Proctoring] Already initializing, will retry after');
      retryTimeoutRef.current = setTimeout(() => {
        if (mountedRef.current) {
          initializeCamera();
        }
        retryTimeoutRef.current = null;
      }, 1000);
      return;
    }
    
    setCameraError(null);
    setCameraReady(false);
    setFaceStatus('loading');
    cameraActiveRef.current = false;
    
    retryTimeoutRef.current = setTimeout(() => {
      if (mountedRef.current) {
        initializeCamera();
      }
      retryTimeoutRef.current = null;
    }, 500);
  }, [initializeCamera]);

  // Initialize camera when enabled
  useEffect(() => {
    mountedRef.current = true;
    
    if (useFaceProctoring && !cameraActiveRef.current) {
      console.log('[Proctoring] Enabling face proctoring');
      // Small delay to ensure DOM is ready
      const timer = setTimeout(() => {
        if (mountedRef.current) {
          initializeCamera();
        }
      }, 500);
      
      return () => {
        clearTimeout(timer);
      };
    } else if (!useFaceProctoring && cameraActiveRef.current) {
      console.log('[Proctoring] Disabling face proctoring');
      stopCamera();
      setFaceStatus('disabled');
    }
    
    return () => {
      mountedRef.current = false;
    };
  }, [useFaceProctoring, initializeCamera, stopCamera]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      console.log('[Proctoring] Component unmounting, cleaning up...');
      mountedRef.current = false;
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
      if (healthCheckIntervalRef.current) {
        clearInterval(healthCheckIntervalRef.current);
      }
      stopCamera();
    };
  }, [stopCamera]);

  // Tab switching detection
  useEffect(() => {
    const handleVisibilityChange = () => {
      const hidden = document.hidden;
      setIsTabActive(!hidden);
      
      // Restart camera when tab becomes active again if it should be on
      if (!hidden && useFaceProctoring && !cameraActiveRef.current && mountedRef.current) {
        console.log('[Proctoring] Tab active, restarting camera...');
        initializeCamera();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [useFaceProctoring, initializeCamera]);

  // Fullscreen detection
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isFull = !!document.fullscreenElement;
      setIsFullscreen(isFull);
      if (!isFull && useFaceProctoring && cameraReady) {
        addViolation('FULLSCREEN_EXIT', 'User exited fullscreen');
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, [addViolation, useFaceProctoring, cameraReady]);

  // Clipboard detection
  useEffect(() => {
    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      setClipboardAttempts((prev) => prev + 1);
      addViolation('COPY_ATTEMPT', 'User attempted to copy');
      alert('Copying is disabled during exam!');
    };

    const handleCut = (e: ClipboardEvent) => {
      e.preventDefault();
      setClipboardAttempts((prev) => prev + 1);
      addViolation('CUT_ATTEMPT', 'User attempted to cut');
      alert('Cutting is disabled during exam!');
    };

    const handlePaste = (e: ClipboardEvent) => {
      e.preventDefault();
      setClipboardAttempts((prev) => prev + 1);
      addViolation('PASTE_ATTEMPT', 'User attempted to paste');
      alert('Pasting is disabled during exam!');
    };

    document.addEventListener('copy', handleCopy);
    document.addEventListener('cut', handleCut);
    document.addEventListener('paste', handlePaste);

    return () => {
      document.removeEventListener('copy', handleCopy);
      document.removeEventListener('cut', handleCut);
      document.removeEventListener('paste', handlePaste);
    };
  }, [addViolation]);

  // Screenshot detection
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'PrintScreen') {
        e.preventDefault();
        setScreenshotAttempts((prev) => prev + 1);
        addViolation('SCREENSHOT_ATTEMPT', 'User pressed PrintScreen');
        alert('Screenshots are disabled during exam!');
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [addViolation]);

  // Right-click detection
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      addViolation('RIGHT_CLICK', 'Right-click attempt');
    };

    document.addEventListener('contextmenu', handleContextMenu);
    return () => document.removeEventListener('contextmenu', handleContextMenu);
  }, [addViolation]);

  return {
    violations,
    violationCount: violations.length,
    isFullscreen,
    isTabActive,
    clipboardAttempts,
    screenshotAttempts,
    faceStatus,
    livenessPassed: true,
    modelsLoaded: true,
    cameraReady,
    cameraError,
    resetViolations: () => setViolations([]),
    retryCamera,
  };
}