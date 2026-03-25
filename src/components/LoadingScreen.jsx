import { motion } from 'framer-motion';
import { useEffect, useState, useRef } from 'react';

const LoadingScreen = ({ onLoadComplete }) => {
  const [progress, setProgress] = useState(0);
  const [videoEnded, setVideoEnded] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 2;
      });
    }, 30);

    return () => clearInterval(interval);
  }, []);

  // Wait for both progress to complete AND video to end
  useEffect(() => {
    if (progress === 100 && videoEnded) {
      setTimeout(() => onLoadComplete?.(), 500);
    }
  }, [progress, videoEnded, onLoadComplete]);

  const handleVideoEnded = () => {
    setVideoEnded(true);
  };

  const handleVideoError = () => {
    // If video fails to load, proceed after progress completes
    setVideoEnded(true);
  };

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 z-[9999] bg-gradient-to-br from-emerald-50 via-white to-teal-50 dark:from-black dark:via-black dark:to-black flex flex-col items-center justify-center overflow-hidden"
    >
      {/* Animated Background Circles */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [360, 180, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-emerald-400/10 to-transparent rounded-full blur-3xl"
        />
      </div>

      {/* Logo Video Container - Mobile Frame */}
      <div className="relative z-10 mb-8 flex items-center justify-center">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative"
        >
          {/* Mobile Phone Frame - Smaller Size */}
          <div className="relative w-48 h-96 sm:w-56 sm:h-[28rem] md:w-64 md:h-[32rem]">
            {/* Phone Body */}
            <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 rounded-[3rem] shadow-2xl border-8 border-gray-700">
              {/* Notch */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-gray-900 rounded-b-3xl z-10" />
              
              {/* Screen */}
              <div className="absolute inset-4 bg-black rounded-[2.5rem] overflow-hidden">
                {/* Video inside phone screen */}
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  playsInline
                  onEnded={handleVideoEnded}
                  onError={handleVideoError}
                  className="w-full h-full object-cover"
                >
                  <source src="/assets/videos/Untitled-2.mp4" type="video/mp4" />
                </video>

                {/* Fallback static logo if video doesn't load */}
                {!videoRef.current && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/20 to-emerald-500/20">
                    <img
                      src="/assets/images/Artboard 1.svg"
                      alt="e-Scan Logo"
                      className="w-3/4 h-3/4 object-contain"
                      onLoad={() => setVideoEnded(true)}
                    />
                  </div>
                )}
              </div>

              {/* Home Button */}
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full border-2 border-gray-600" />
            </div>

            {/* Phone Shadow/Glow */}
            <motion.div
              animate={{
                opacity: [0.3, 0.6, 0.3],
                scale: [1, 1.05, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute inset-0 bg-primary/20 rounded-[3rem] blur-3xl -z-10"
            />
          </div>
        </motion.div>
      </div>

      {/* App Name */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.8 }}
        className="text-center mb-8"
      >
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary via-emerald-500 to-teal-500 bg-clip-text text-transparent mb-2">
          e-Scan
        </h1>
        <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base">
          AI-Powered Recycling Assistant
        </p>
      </motion.div>

      {/* Progress Bar */}
      <motion.div
        initial={{ width: 0, opacity: 0 }}
        animate={{ width: "auto", opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="w-64 sm:w-80 relative"
      >
        {/* Progress Bar Background */}
        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-primary via-emerald-500 to-teal-500 rounded-full relative"
            style={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          >
            {/* Shimmer Effect */}
            <motion.div
              animate={{
                x: ['-100%', '200%'],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "linear",
              }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
            />
          </motion.div>
        </div>

        {/* Progress Text */}
        <motion.p
          className="text-center mt-3 text-sm font-medium text-gray-600 dark:text-gray-400"
          key={progress}
          initial={{ opacity: 0.5 }}
          animate={{ opacity: 1 }}
        >
          {progress < 30 && "Initializing..."}
          {progress >= 30 && progress < 60 && "Loading AI Models..."}
          {progress >= 60 && progress < 90 && "Preparing Interface..."}
          {progress >= 90 && progress < 100 && "Almost Ready..."}
          {progress === 100 && !videoEnded && "Finishing animation..."}
          {progress === 100 && videoEnded && "Ready!"}
        </motion.p>
      </motion.div>

      {/* Floating Particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-primary/20 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>
    </motion.div>
  );
};

export default LoadingScreen;
