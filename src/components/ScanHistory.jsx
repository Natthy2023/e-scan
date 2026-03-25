import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, Calendar, X, Trash2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getTranslation } from '../utils/translations';
import { deleteScan } from '../firebase/firestore';
import { translateScanResult } from '../utils/gemini';
import ScanResult from './ScanResult';
import toast from 'react-hot-toast';

const ScanHistory = ({ scans, onScanDeleted }) => {
  const { language } = useAuth();
  const t = (key) => getTranslation(language, key);
  const [selectedScan, setSelectedScan] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [translatedScans, setTranslatedScans] = useState({});
  const [translating, setTranslating] = useState(false);

  // Translate scans when language changes
  useEffect(() => {
    const translateScans = async () => {
      if (!scans || scans.length === 0) {
        setTranslating(false);
        return;
      }
      
      // Check if we need to translate anything
      let needsTranslation = false;
      for (const scan of scans) {
        if (scan.originalLanguage !== language) {
          const cachedKey = `${scan.id}_${language}`;
          if (!translatedScans[cachedKey]) {
            needsTranslation = true;
            break;
          }
        }
      }

      if (!needsTranslation) {
        setTranslating(false);
        return;
      }
      
      setTranslating(true);
      const newTranslations = {};
      
      for (const scan of scans) {
        if (scan.originalLanguage !== language) {
          const cachedKey = `${scan.id}_${language}`;
          
          // Skip if already translated and cached
          if (translatedScans[cachedKey]) {
            continue;
          }
          
          try {
            const translated = await translateScanResult(scan, language);
            newTranslations[cachedKey] = translated;
          } catch (error) {
            // Silent fail - use original on error
            newTranslations[cachedKey] = scan;
          }
        }
      }
      
      if (Object.keys(newTranslations).length > 0) {
        setTranslatedScans(prev => ({ ...prev, ...newTranslations }));
      }
      setTranslating(false);
    };

    translateScans();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scans, language]); // Remove translatedScans from dependencies

  // Get translated version of scan or original
  const getDisplayScan = (scan) => {
    const translatedKey = `${scan.id}_${language}`;
    return translatedScans[translatedKey] || scan;
  };

  const handleDelete = async (scanId, e) => {
    e.stopPropagation();
    setDeleteConfirm(scanId);
  };

  const confirmDelete = async (scanId, e) => {
    e.stopPropagation();
    setIsDeleting(true);
    try {
      await deleteScan(scanId);
      setDeleteConfirm(null);
      setSelectedScan(null);
      if (onScanDeleted) {
        onScanDeleted();
      }
    } catch (error) {
      toast.error('Failed to delete scan');
    } finally {
      setIsDeleting(false);
    }
  };

  const cancelDelete = (e) => {
    e.stopPropagation();
    setDeleteConfirm(null);
  };

  if (!scans || scans.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400 mb-2">{t('noHistory')}</p>
        <p className="text-sm text-gray-400 dark:text-gray-500">{t('startScanning')}</p>
      </div>
    );
  }

  return (
    <>
      {translating && (
        <div className="text-center py-2 mb-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">{t('analyzing')}...</p>
        </div>
      )}
      
      <div className="space-y-4">
        {scans.map((scan, index) => {
          const displayScan = getDisplayScan(scan);
          return (
            <motion.div
              key={scan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => setSelectedScan(scan)}
              className="glass rounded-xl p-4 hover:bg-white/10 dark:hover:bg-white/5 transition-colors cursor-pointer relative"
            >
            {/* Delete Confirmation Overlay */}
            {deleteConfirm === scan.id && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 bg-black/80 backdrop-blur-sm rounded-xl flex items-center justify-center z-10 p-4"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="text-center">
                  <p className="text-white mb-4 text-sm">{t('confirmDelete')}</p>
                  <div className="flex gap-2 justify-center">
                    <button
                      onClick={(e) => confirmDelete(scan.id, e)}
                      disabled={isDeleting}
                      className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium disabled:opacity-50"
                    >
                      {isDeleting ? '...' : t('delete')}
                    </button>
                    <button
                      onClick={cancelDelete}
                      disabled={isDeleting}
                      className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg text-sm font-medium disabled:opacity-50"
                    >
                      {t('cancel')}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            <div className="flex items-start gap-4">
              {/* Thumbnail Image */}
              {displayScan.imageUrl && (
                <img
                  src={displayScan.imageUrl}
                  alt={displayScan.itemName}
                  className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                />
              )}
              
              {displayScan.isRecyclable ? (
                <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
              ) : (
                <XCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-1" />
              )}
              
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-lg truncate">{displayScan.itemName}</h3>
                <p className={`text-sm ${displayScan.isRecyclable ? 'text-green-500' : 'text-red-500'}`}>
                  {displayScan.isRecyclable ? t('recyclable') : t('notRecyclable')}
                </p>
                
                {scan.timestamp && (
                  <div className="flex items-center gap-1 mt-2 text-xs text-gray-500 dark:text-gray-400">
                    <Calendar className="w-3 h-3" />
                    <span>
                      {new Date(scan.timestamp.seconds * 1000).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-2 flex-shrink-0">
                {displayScan.material && (
                  <span className="px-2 py-1 bg-primary/20 text-primary text-xs rounded-full">
                    {displayScan.material}
                  </span>
                )}
                <button
                  onClick={(e) => handleDelete(scan.id, e)}
                  className="p-2 hover:bg-red-500/20 text-red-500 rounded-lg transition-colors"
                  title={t('delete')}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        );
      })}
      </div>

      {/* Modal for full scan details */}
      <AnimatePresence>
        {selectedScan && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedScan(null)}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-black rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border dark:border-gray-800"
            >
              {/* Header */}
              <div className="sticky top-0 bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800 p-4 flex items-center justify-between z-10">
                <h2 className="text-xl font-bold">{t('scanDetails')}</h2>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => handleDelete(selectedScan.id, e)}
                    className="p-2 hover:bg-red-500/20 text-red-500 rounded-lg transition-colors"
                    title={t('delete')}
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setSelectedScan(null)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Scanned Image */}
                {getDisplayScan(selectedScan).imageUrl && (
                  <div className="glass rounded-2xl p-4 overflow-hidden">
                    <img
                      src={getDisplayScan(selectedScan).imageUrl}
                      alt={getDisplayScan(selectedScan).itemName}
                      className="w-full max-h-96 object-contain rounded-lg"
                    />
                  </div>
                )}

                {/* Scan Date */}
                {selectedScan.timestamp && (
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {t('scannedOn')} {new Date(selectedScan.timestamp.seconds * 1000).toLocaleString()}
                    </span>
                  </div>
                )}

                {/* Scan Result Component with translated data */}
                <ScanResult result={getDisplayScan(selectedScan)} />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ScanHistory;
