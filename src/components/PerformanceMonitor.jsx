import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, X, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { getPerformanceReport } from '../utils/performance';
import { getRateLimiterStatus } from '../utils/rateLimiter';
import { getCacheStats } from '../utils/cache';

const PerformanceMonitor = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [metrics, setMetrics] = useState(null);
  const [rateLimiter, setRateLimiter] = useState(null);
  const [cache, setCache] = useState(null);

  useEffect(() => {
    if (isOpen) {
      updateMetrics();
      const interval = setInterval(updateMetrics, 2000);
      return () => clearInterval(interval);
    }
  }, [isOpen]);

  const updateMetrics = async () => {
    const perf = getPerformanceReport();
    const rl = getRateLimiterStatus();
    const c = await getCacheStats();
    
    setMetrics(perf);
    setRateLimiter(rl);
    setCache(c);
  };

  const getScoreIcon = (score) => {
    if (score === 'good') return <TrendingUp className="w-4 h-4 text-green-500" />;
    if (score === 'needs-improvement') return <Minus className="w-4 h-4 text-yellow-500" />;
    return <TrendingDown className="w-4 h-4 text-red-500" />;
  };

  const getScoreColor = (score) => {
    if (score === 'good') return 'text-green-500';
    if (score === 'needs-improvement') return 'text-yellow-500';
    return 'text-red-500';
  };

  // Only show in development
  if (import.meta.env.PROD) return null;

  return (
    <>
      {/* Floating Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 z-50 p-3 bg-primary text-white rounded-full shadow-lg hover:bg-emerald-600 transition-colors"
        title="Performance Monitor"
      >
        <Activity className="w-6 h-6" />
      </motion.button>

      {/* Monitor Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 400 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 400 }}
            className="fixed top-0 right-0 bottom-0 w-96 bg-white dark:bg-black border-l border-gray-200 dark:border-gray-800 shadow-2xl z-50 overflow-y-auto"
          >
            <div className="p-4 space-y-4">
              {/* Header */}
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">Performance Monitor</h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Web Vitals */}
              {metrics?.webVitals && (
                <div className="space-y-2">
                  <h3 className="font-semibold text-sm text-gray-600 dark:text-gray-400">
                    Web Vitals
                  </h3>
                  <div className="space-y-2">
                    <MetricRow
                      label="FCP"
                      value={`${metrics.webVitals.firstContentfulPaint}ms`}
                      score={metrics.webVitals.scores.fcp}
                      icon={getScoreIcon(metrics.webVitals.scores.fcp)}
                    />
                    <MetricRow
                      label="LCP"
                      value={`${metrics.webVitals.largestContentfulPaint}ms`}
                      score={metrics.webVitals.scores.lcp}
                      icon={getScoreIcon(metrics.webVitals.scores.lcp)}
                    />
                    <MetricRow
                      label="FID"
                      value={`${metrics.webVitals.firstInputDelay}ms`}
                      score={metrics.webVitals.scores.fid}
                      icon={getScoreIcon(metrics.webVitals.scores.fid)}
                    />
                    <MetricRow
                      label="CLS"
                      value={metrics.webVitals.cumulativeLayoutShift}
                      score={metrics.webVitals.scores.cls}
                      icon={getScoreIcon(metrics.webVitals.scores.cls)}
                    />
                  </div>
                </div>
              )}

              {/* API Calls */}
              {metrics?.apiCalls && (
                <div className="space-y-2">
                  <h3 className="font-semibold text-sm text-gray-600 dark:text-gray-400">
                    API Performance
                  </h3>
                  <div className="space-y-2">
                    <MetricRow
                      label="Total Calls"
                      value={metrics.apiCalls.count}
                    />
                    <MetricRow
                      label="Avg Duration"
                      value={`${metrics.apiCalls.averageDuration}ms`}
                    />
                    <MetricRow
                      label="Success Rate"
                      value={metrics.apiCalls.successRate}
                    />
                  </div>
                </div>
              )}

              {/* Rate Limiter */}
              {rateLimiter && (
                <div className="space-y-2">
                  <h3 className="font-semibold text-sm text-gray-600 dark:text-gray-400">
                    Rate Limiter
                  </h3>
                  <div className="space-y-2">
                    <MetricRow
                      label="Queue Length"
                      value={rateLimiter.queueLength}
                    />
                    <MetricRow
                      label="Processing"
                      value={rateLimiter.processing ? 'Yes' : 'No'}
                    />
                    <MetricRow
                      label="Circuit"
                      value={rateLimiter.circuitOpen ? 'Open' : 'Closed'}
                    />
                    {rateLimiter.metrics && (
                      <>
                        <MetricRow
                          label="Success Rate"
                          value={rateLimiter.metrics.successRate}
                        />
                        <MetricRow
                          label="Avg Wait"
                          value={`${rateLimiter.metrics.averageWaitTime}ms`}
                        />
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Cache */}
              {cache && (
                <div className="space-y-2">
                  <h3 className="font-semibold text-sm text-gray-600 dark:text-gray-400">
                    Cache Status
                  </h3>
                  <div className="space-y-2">
                    <MetricRow
                      label="Memory"
                      value={`${cache.memorySize}/${cache.maxMemorySize}`}
                    />
                    <MetricRow
                      label="IndexedDB"
                      value={cache.dbSize}
                    />
                  </div>
                </div>
              )}

              {/* Legend */}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  <span className="text-green-500">●</span> Good
                  <span className="ml-3 text-yellow-500">●</span> Needs Improvement
                  <span className="ml-3 text-red-500">●</span> Poor
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

const MetricRow = ({ label, value, score, icon }) => (
  <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-900 rounded-lg">
    <span className="text-sm text-gray-600 dark:text-gray-400">{label}</span>
    <div className="flex items-center gap-2">
      <span className="text-sm font-semibold">{value}</span>
      {icon}
    </div>
  </div>
);

export default PerformanceMonitor;
