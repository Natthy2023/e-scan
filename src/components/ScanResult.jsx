import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Lightbulb, Recycle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getTranslation } from '../utils/translations';
import confetti from 'canvas-confetti';
import { useEffect } from 'react';

const ScanResult = ({ result }) => {
  const { language } = useAuth();
  const t = (key) => getTranslation(language, key);

  useEffect(() => {
    if (result.isRecyclable) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10b981', '#34d399', '#6ee7b7'],
      });
    }
  }, [result.isRecyclable]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-2xl mx-auto"
    >
      <div className="glass rounded-2xl p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          {result.isRecyclable ? (
            <CheckCircle className="w-12 h-12 text-green-500 flex-shrink-0" />
          ) : (
            <XCircle className="w-12 h-12 text-red-500 flex-shrink-0" />
          )}
          <div>
            <h2 className="text-2xl font-bold">{result.itemName}</h2>
            <p className={`text-lg font-semibold ${result.isRecyclable ? 'text-green-500' : 'text-red-500'}`}>
              {result.isRecyclable ? t('recyclable') : t('notRecyclable')}
            </p>
          </div>
        </div>

        {/* Material & Confidence */}
        {result.material && (
          <div className="flex gap-4 text-sm">
            <span className="px-3 py-1 bg-primary/20 text-primary rounded-full">
              {result.material}
            </span>
            <span className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded-full">
              {result.confidence} {t('confidence')}
            </span>
          </div>
        )}

        {/* Recycling Steps */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Recycle className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold">{t('recyclingSteps')}</h3>
          </div>
          <ul className="space-y-2">
            {result.recyclingSteps?.map((step, index) => (
              <motion.li
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex gap-3 p-3 bg-white/5 rounded-lg"
              >
                <span className="flex-shrink-0 w-6 h-6 bg-primary rounded-full flex items-center justify-center text-sm font-bold">
                  {index + 1}
                </span>
                <span className="flex-1">{step}</span>
              </motion.li>
            ))}
          </ul>
        </div>

        {/* Upcycling Ideas */}
        {result.upcyclingIdeas && result.upcyclingIdeas.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-yellow-500" />
              <h3 className="text-lg font-semibold">{t('upcyclingIdeas')}</h3>
            </div>
            <ul className="space-y-2">
              {result.upcyclingIdeas.map((idea, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="flex gap-3 p-3 bg-yellow-500/10 rounded-lg"
                >
                  <span className="text-yellow-500">💡</span>
                  <span className="flex-1">{idea}</span>
                </motion.li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ScanResult;
