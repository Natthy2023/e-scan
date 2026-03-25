import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, Clock, TrendingUp, X } from 'lucide-react';
import { formatTimeUntilReset } from '../utils/uploadTracker';

const UploadLimitModal = ({ isOpen, onClose, remaining, total, used }) => {
  const isLimitReached = remaining === 0;
  const timeUntilReset = formatTimeUntilReset();

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-black rounded-2xl max-w-md w-full p-6 border border-gray-200 dark:border-gray-700"
            style={{
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.3)',
            }}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  isLimitReached 
                    ? 'bg-red-100 dark:bg-red-900/30' 
                    : 'bg-yellow-100 dark:bg-yellow-900/30'
                }`}>
                  <AlertCircle className={`w-6 h-6 ${
                    isLimitReached ? 'text-red-600 dark:text-red-400' : 'text-yellow-600 dark:text-yellow-400'
                  }`} />
                </div>
                <div>
                  <h3 className="text-xl font-bold">
                    {isLimitReached ? 'Daily Limit Reached' : 'Upload Limit Notice'}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Free Tier</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="space-y-4">
              {/* Progress Bar */}
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600 dark:text-gray-400">Today's Usage</span>
                  <span className="font-semibold">{used} / {total}</span>
                </div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(used / total) * 100}%` }}
                    transition={{ duration: 0.5 }}
                    className={`h-full rounded-full ${
                      isLimitReached 
                        ? 'bg-red-500' 
                        : remaining <= 3 
                          ? 'bg-yellow-500' 
                          : 'bg-primary'
                    }`}
                  />
                </div>
              </div>

              {/* Message */}
              <div className="bg-gray-50 dark:bg-black/80 rounded-xl p-4 border dark:border-gray-800">
                {isLimitReached ? (
                  <>
                    <p className="text-gray-700 dark:text-gray-300 mb-3">
                      You've reached your daily limit of <strong>{total} scans</strong> for the free tier.
                    </p>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Clock className="w-4 h-4" />
                      <span>Resets in <strong>{timeUntilReset}</strong></span>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="text-gray-700 dark:text-gray-300 mb-2">
                      You have <strong className="text-primary">{remaining} scans</strong> remaining today.
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Free tier includes {total} scans per day. Resets at midnight.
                    </p>
                  </>
                )}
              </div>

              {/* Tips */}
              <div className="bg-primary/10 dark:bg-primary/20 rounded-xl p-4">
                <div className="flex items-start gap-2">
                  <TrendingUp className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-primary mb-1">Pro Tip</p>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {isLimitReached 
                        ? 'Come back tomorrow for more scans, or consider upgrading for unlimited access.'
                        : 'Make the most of your remaining scans by taking clear, well-lit photos.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onClose}
                className="w-full px-6 py-3 bg-primary hover:bg-emerald-600 text-white rounded-xl font-semibold transition-colors"
              >
                {isLimitReached ? 'Got it' : 'Continue'}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default UploadLimitModal;
