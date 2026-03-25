import { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { X, Camera as CameraIcon, RotateCcw } from 'lucide-react';

const CameraCapture = ({ onCapture, onClose }) => {
  const videoRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [error, setError] = useState(null);
  const [facingMode, setFacingMode] = useState('environment');

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
  }, [stream]);

  const startCamera = useCallback(async (mode = 'environment') => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: mode },
        audio: false,
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error('Camera error:', err);
      setError('Unable to access camera. Please check permissions.');
    }
  }, []);

  useEffect(() => {
    startCamera(facingMode);
    return () => {
      stopCamera();
    };
  }, [facingMode, startCamera, stopCamera]);

  const capturePhoto = useCallback(() => {
    if (!videoRef.current) return;

    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
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
      }
    }, 'image/jpeg', 0.9);
  }, [onCapture, onClose, stopCamera]);

  const switchCamera = useCallback(() => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  }, []);

  if (error) {
    return (
      <div className="fixed inset-0 z-50 bg-black flex items-center justify-center p-4">
        <div className="bg-white dark:bg-black rounded-2xl p-6 max-w-md w-full border dark:border-gray-800">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-primary text-white rounded-lg"
          >
            Close
          </button>
        </div>
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
      {/* Video Preview */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
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
