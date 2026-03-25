import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Recycle, XCircle, Leaf } from 'lucide-react';
import { getUserScans, getUserStats } from '../firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { getTranslation } from '../utils/translations';
import ScanHistory from '../components/ScanHistory';
import AdBanner from '../components/AdBanner';

const Dashboard = () => {
  const [scans, setScans] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user, language } = useAuth();
  const t = (key) => getTranslation(language, key);

  const loadData = async () => {
    if (!user) return;
    
    try {
      const [scansData, statsData] = await Promise.all([
        getUserScans(user.uid),
        getUserStats(user.uid),
      ]);
      setScans(scansData);
      setStats(statsData);
    } catch (error) {
      // Error already handled by firestore functions
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleScanDeleted = () => {
    loadData();
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="space-y-4 w-full max-w-4xl px-4">
          <div className="skeleton h-32 rounded-2xl" />
          <div className="skeleton h-32 rounded-2xl" />
          <div className="skeleton h-32 rounded-2xl" />
        </div>
      </div>
    );
  }

  const statCards = [
    {
      icon: TrendingUp,
      label: t('totalScans'),
      value: stats?.totalScans || 0,
      color: 'text-gray-700 dark:text-gray-300',
      bg: 'bg-gray-200 dark:bg-gray-700',
    },
    {
      icon: Recycle,
      label: t('recyclable'),
      value: stats?.recyclableCount || 0,
      color: 'text-green-500',
      bg: 'bg-green-500/20',
    },
    {
      icon: XCircle,
      label: t('notRecyclable'),
      value: stats?.nonRecyclableCount || 0,
      color: 'text-red-500',
      bg: 'bg-red-500/20',
    },
    {
      icon: Leaf,
      label: t('co2Saved'),
      value: `${stats?.co2Saved || 0} ${t('kg')}`,
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/20',
    },
  ];

  return (
    <div className="min-h-[calc(100vh-4rem)] w-full overflow-x-hidden px-3 sm:px-4 py-6 sm:py-8">
      <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8">
        <div className="text-center px-2">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">{t('dashboard')}</h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">{t('trackImpact')}</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {statCards.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20, rotateX: -15 }}
              animate={{ opacity: 1, y: 0, rotateX: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              whileHover={{ 
                y: -10,
                rotateY: 5,
                transition: { duration: 0.3 }
              }}
              className="bg-white dark:bg-black rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gray-200 dark:border-gray-700"
              style={{
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
                transform: 'perspective(1000px)',
              }}
            >
              <motion.div 
                className={`w-10 h-10 sm:w-12 sm:h-12 ${stat.bg} rounded-lg sm:rounded-xl flex items-center justify-center mb-3 sm:mb-4`}
                animate={{ 
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ 
                  duration: 3,
                  repeat: Infinity,
                  delay: index * 0.2
                }}
              >
                <stat.icon className={`w-5 h-5 sm:w-6 sm:h-6 ${stat.color}`} />
              </motion.div>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1 truncate">{stat.label}</p>
              <p className="text-lg sm:text-2xl font-bold truncate">{stat.value}</p>
            </motion.div>
          ))}
        </div>

        {/* Ad Banner in sidebar area */}
        <div className="lg:hidden">
          <AdBanner />
        </div>

        {/* Scan History */}
        <motion.div 
          className="bg-white dark:bg-black rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gray-200 dark:border-gray-700 overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          style={{
            boxShadow: '0 15px 40px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
          }}
        >
          <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">{t('scanHistory')}</h2>
          <ScanHistory scans={scans} onScanDeleted={handleScanDeleted} />
        </motion.div>

        {/* Desktop Sidebar Ad */}
        <div className="hidden lg:block">
          <AdBanner />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
