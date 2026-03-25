import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Upload, Loader } from 'lucide-react';
import { analyzeImage, translateScanResult } from '../utils/gemini';
import { saveScanResult } from '../firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { getTranslation } from '../utils/translations';
import { canUpload, recordUpload } from '../utils/uploadTracker';
import ScanResult from '../components/ScanResult';
import CameraCapture from '../components/CameraCapture';
import UploadLimitModal from '../components/UploadLimitModal';
import AdBanner from '../components/AdBanner';
import toast from 'react-hot-toast';

const Scan = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [showCamera, setShowCamera] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(canUpload());
  const [translating, setTranslating] = useState(false);
  const fileInputRef = useRef(null);
  const { user, language } = useAuth();
  const t = useCallback((key) => getTranslation(language, key), [language]);

  // Real-time translation when language changes
  useEffect(() => {
    const translateCurrentResult = async () => {
      // Only translate if we have a result and not currently analyzing
      if (!result || analyzing) return;

      // Check if result is already in the target language
      if (result.originalLanguage === language || result.translatedTo === language) {
        return;
      }

      setTranslating(true);
      try {
        const translated = await translateScanResult(result, language);
        setResult(translated);
      } catch (error) {
        // Silently fail - keep original result
        console.error('Translation failed:', error);
      } finally {
        setTranslating(false);
      }
    };

    translateCurrentResult();
  }, [language]); // Only depend on language - will check result inside

  const handleImageSelect = useCallback(async (file) => {
    if (!file) return;

    // Check upload limit
    const status = canUpload();
    setUploadStatus(status);

    if (!status.allowed) {
      setShowLimitModal(true);
      return;
    }

    // Show warning if close to limit
    if (status.remaining <= 3 && status.remaining > 0) {
      setShowLimitModal(true);
      // Continue with upload after showing warning
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setSelectedImage(reader.result);
    };
    reader.readAsDataURL(file);

    setAnalyzing(true);
    setResult(null);

    try {
      const analysisResult = await analyzeImage(file, language);
      setResult(analysisResult);

      // Record successful upload
      recordUpload();
      setUploadStatus(canUpload());

      // Save to Firestore with image and language
      await saveScanResult(user.uid, {
        itemName: analysisResult.itemName,
        isRecyclable: analysisResult.isRecyclable,
        material: analysisResult.material,
        recyclingSteps: analysisResult.recyclingSteps,
        upcyclingIdeas: analysisResult.upcyclingIdeas,
        confidence: analysisResult.confidence,
        imageUrl: reader.result, // Save the base64 image
        originalLanguage: language, // Store the language it was analyzed in
      });

      toast.success('Analysis complete!');
    } catch (error) {
      if (error.message === 'RATE_LIMIT') {
        toast.error('Processing your request. Please wait a moment...', { duration: 5000 });
      } else {
        toast.error(t('error'));
      }
    } finally {
      setAnalyzing(false);
    }
  }, [language, user, t]);

  const handleFileChange = useCallback((e) => {
    const file = e.target.files?.[0];
    if (file) handleImageSelect(file);
  }, [handleImageSelect]);

  const handleCameraCapture = useCallback((file) => {
    handleImageSelect(file);
  }, [handleImageSelect]);

  const resetScan = useCallback(() => {
    setSelectedImage(null);
    setResult(null);
  }, []);

  return (
    <div className="min-h-[calc(100vh-4rem)] px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">{t('scan')}</h1>
          <p className="text-gray-600 dark:text-gray-400">
            {t('uploadOrCapture')}
          </p>
          {/* Upload Status */}
          <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-black/80 rounded-full text-sm border dark:border-gray-700">
            <span className="text-gray-600 dark:text-gray-400">Today's scans:</span>
            <span className="font-semibold text-primary">{uploadStatus.used} / {uploadStatus.total}</span>
          </div>
        </div>

        {/* Upload Buttons */}
        {!analyzing && !result && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowCamera(true)}
              className="glass rounded-2xl p-8 hover:bg-white/10 dark:hover:bg-white/5 transition-colors"
            >
              <Camera className="w-12 h-12 mx-auto mb-4 text-primary" />
              <p className="font-semibold">{t('takePhoto')}</p>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => fileInputRef.current?.click()}
              className="glass rounded-2xl p-8 hover:bg-white/10 dark:hover:bg-white/5 transition-colors"
            >
              <Upload className="w-12 h-12 mx-auto mb-4 text-primary" />
              <p className="font-semibold">{t('uploadImage')}</p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </motion.button>
          </div>
        )}

        {/* Selected Image Preview */}
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass rounded-2xl p-4 overflow-hidden"
          >
            <img
              src={selectedImage}
              alt="Selected"
              className="w-full max-h-96 object-contain rounded-lg"
            />
          </motion.div>
        )}

        {/* Loading State */}
        {analyzing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="inline-block">
              <Loader className="w-12 h-12 text-primary animate-spin mb-4" />
              <p className="text-lg font-semibold">{t('analyzing')}</p>
              <div className="mt-4 space-y-2">
                <div className="skeleton h-4 w-64 rounded mx-auto" />
                <div className="skeleton h-4 w-48 rounded mx-auto" />
              </div>
            </div>
          </motion.div>
        )}

        {/* Translation Loading State */}
        {translating && !analyzing && result && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-4"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full">
              <Loader className="w-4 h-4 text-primary animate-spin" />
              <span className="text-sm text-primary font-medium">{t('analyzing')}...</span>
            </div>
          </motion.div>
        )}

        {/* Result */}
        {result && !analyzing && (
          <>
            <ScanResult result={result} />
            
            <div className="text-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={resetScan}
                className="px-6 py-3 bg-primary hover:bg-emerald-600 text-white rounded-full font-semibold transition-colors"
              >
                {t('scanAnother')}
              </motion.button>
            </div>

            {/* Ad Banner below results */}
            <AdBanner />
          </>
        )}
      </div>

      {/* Camera Modal */}
      <AnimatePresence>
        {showCamera && (
          <CameraCapture
            onCapture={handleCameraCapture}
            onClose={() => setShowCamera(false)}
          />
        )}
      </AnimatePresence>

      {/* Upload Limit Modal */}
      <UploadLimitModal
        isOpen={showLimitModal}
        onClose={() => setShowLimitModal(false)}
        remaining={uploadStatus.remaining}
        total={uploadStatus.total}
        used={uploadStatus.used}
      />
    </div>
  );
};

export default Scan;
