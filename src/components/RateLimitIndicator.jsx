import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, AlertCircle } from 'lucide-react';
import { getRateLimiterStatus } from '../utils/rateLimiter';

const RateLimitIndicator = () => {
  const [status, setStatus] = useState({ queueLength: 0, processing: false });
  const [showIndicator, setShowIndicator] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      const currentStatus = getRateLimiterStatus();
      setStatus(currentStatus);
      setShowIndicator(currentStatus.queueLength > 0 || currentStatus.processing);
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return (
    <AnimatePresence>
      {showIndicator && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-4 right-4 z-50"
        >
          <div className="glass rounded-xl p-4 shadow-lg max-w-sm">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Clock className="w-6 h-6 text-primary animate-pulse" />
                {status.processing && (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0"
                  >
                    <div className="w-full h-full border-2 border-primary border-t-transparent rounded-full" />
                  </motion.div>
                )}
              </div>
              
              <div className="flex-1">
                <p className="text-sm font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  Processing Request
                </p>
                {status.queueLength > 0 && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {status.queueLength} request{status.queueLength > 1 ? 's' : ''} in queue
                  </p>
                )}
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Please wait, preventing rate limits...
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default RateLimitIndicator;
