import { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { X, Camera as CameraIcon, RotateCcw, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const CameraCapture = ({ onCapture, onClose }) => {
  const videoRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [error, setError] = useState(null);
  const [facingMode, setFacingMode] = useState('environment');
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [retryTrigger, setRetryTrigger] = useState(0);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  }, [stream]);

  useEffect(() => {
    let mounted = true;
    
    const initCamera = async () => {
      if (!mounted) return;
      
      setIsLoading(true);
      setError(null);
      setPermissionDenied(false);

      try {
        // Check if mediaDevices is supported
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error('Camera not supported on this device');
        }

        // Use simpler constraints for faster startup
        const constraints = {
          video: {
            facingMode: facingMode,
            width: { ideal: 1280 },
            height: { ideal: 720 }
          },
          audio: false,
        };

        const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
        
        if (!mounted) {
          mediaStream.getTracks().forEach(track => track.stop());
          return;
        }
        
        setStream(mediaStream);
        setIsLoading(false);
        
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (err) {
        if (!mounted) return;
        
        setIsLoading(false);
        
        // Handle specific errors
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          setPermissionDenied(true);
          setError('Camera permission denied. Please allow camera access in your browser settings.');
        } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
          setError('No camera found on this device.');
        } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
          setError('Camera is already in use by another application.');
        } else if (err.name === 'OverconstrainedError') {
          // Try again with basic constraints
          try {
            const basicStream = await navigator.mediaDevices.getUserMedia({
              video: { facingMode: facingMode },
              audio: false,
            });
            
            if (!mounted) {
              basicStream.getTracks().forEach(track => track.stop());
              return;
            }
            
            setStream(basicStream);
            setIsLoading(false);
            if (videoRef.current) {
              videoRef.current.srcObject = basicStream;
            }
          } catch (basicErr) {
            if (mounted) {
              setError('Unable to access camera. Please check permissions.');
            }
          }
        } else if (err.message === 'Camera not supported on this device') {
          setError('Camera is not supported on this browser. Please use a modern browser like Chrome, Safari, or Firefox.');
        } else {
          setError('Unable to access camera. Please check permissions and try again.');
        }
      }
    };
    
    initCamera();
    
    return () => {
      mounted = false;
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [facingMode, retryTrigger]); // Depend on facingMode and retryTrigger

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !stream) return;

    try {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      
      if (canvas.width === 0 || canvas.height === 0) {
        toast.error('Camera not ready. Please wait a moment.');
        return;
      }
      
      const ctx = canvas.getContext('2d');
      ctx.drawImage(videoRef.current, 0, 0);

      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], 'camera-photo.jpg', { type: 'image/jpeg' });
          stopCamera();
          onClose();
          // Call onCapture after closing to ensure proper state management
          setTimeout(() => {
            onCapture(file);
          }, 100);
        } else {
          toast.error('Failed to capture photo. Please try again.');
        }
      }, 'image/jpeg', 0.9);
    } catch (error) {
      toast.error('Failed to capture photo. Please try again.');
    }
  }, [onCapture, onClose, stopCamera, stream]);

  const switchCamera = useCallback(() => {
    // Stop current stream
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    // Toggle facing mode
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  }, [stream]);

  if (error) {
    return (
      <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white dark:bg-black rounded-2xl p-6 max-w-md w-full border dark:border-gray-800"
        >
          <div className="flex items-start gap-3 mb-4">
            <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-lg mb-2">Camera Access Error</h3>
              <p className="text-red-500 text-sm mb-4">{error}</p>
              
              {permissionDenied && (
                <div className="bg-gray-100 dark:bg-gray-900 rounded-lg p-3 text-xs space-y-2">
                  <p className="font-semibold">To enable camera:</p>
                  <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-400">
                    <li>Click the lock/info icon in your browser's address bar</li>
                    <li>Find "Camera" permissions</li>
                    <li>Select "Allow"</li>
                    <li>Refresh the page and try again</li>
                  </ul>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex gap-2">
            {!permissionDenied && (
              <button
                onClick={() => {
                  setError(null);
                  setRetryTrigger(prev => prev + 1); // Trigger useEffect to restart camera
                }}
                className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-emerald-600 transition-colors"
              >
                Try Again
              </button>
            )}
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black"
    >
      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black z-10">
          <div className="text-center">
            <CameraIcon className="w-16 h-16 text-white animate-pulse mx-auto mb-4" />
            <p className="text-white text-lg">Starting camera...</p>
          </div>
        </div>
      )}

      {/* Video Preview */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-full object-cover"
      />

      {/* Controls Overlay */}
      <div className="absolute inset-0 flex flex-col justify-between p-4">
        {/* Top Bar */}
        <div className="flex justify-between items-center">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="p-3 bg-black/50 rounded-full backdrop-blur-sm"
          >
            <X className="w-6 h-6 text-white" />
          </motion.button>
          
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={switchCamera}
            className="p-3 bg-black/50 rounded-full backdrop-blur-sm"
          >
            <RotateCcw className="w-6 h-6 text-white" />
          </motion.button>
        </div>

        {/* Bottom Bar - Capture Button */}
        <div className="flex justify-center pb-8">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={capturePhoto}
            className="w-20 h-20 bg-white rounded-full border-4 border-gray-300 flex items-center justify-center shadow-lg"
          >
            <div className="w-16 h-16 bg-white rounded-full border-2 border-gray-400" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default CameraCapture;
