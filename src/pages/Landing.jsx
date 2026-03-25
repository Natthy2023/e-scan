import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Camera, Sparkles, TrendingUp, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getTranslation } from '../utils/translations';
import AdBanner from '../components/AdBanner';

const Landing = () => {
  const navigate = useNavigate();
  const { user, language } = useAuth();
  const t = (key) => getTranslation(language, key);

  const features = [
    { icon: Camera, text: t('step1') },
    { icon: Sparkles, text: t('step2') },
    { icon: CheckCircle, text: t('step3') },
    { icon: TrendingUp, text: t('step4') },
  ];

  const ethiopianEnvironment = [
    {
      title: t('gerdTitle'),
      description: t('gerdDesc'),
      image: '/assets/images/abay dam.png',
    },
    {
      title: t('highlandsTitle'),
      description: t('highlandsDesc'),
      image: '/assets/images/landscape.png',
    },
    {
      title: t('omoTitle'),
      description: t('omoDesc'),
      image: '/assets/images/omo-river-valley.png',
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 px-4 min-h-[600px] flex items-center">
        {/* Hero Background Image */}
        <div className="absolute inset-0">
          <img
            src="/assets/images/hero.png"
            alt="Ethiopia Environment"
            className="w-full h-full object-cover opacity-30 dark:opacity-15"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/60 to-white dark:via-black/60 dark:to-black" />
        </div>
        
        <div className="relative max-w-4xl mx-auto text-center z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.img
              src="/assets/images/artboard-1.svg"
              alt="e-Scan Logo"
              className="w-24 h-24 sm:w-32 sm:h-32 mx-auto mb-6 object-contain"
              animate={{ 
                y: [0, -10, 0],
                rotateY: [0, 5, 0, -5, 0]
              }}
              transition={{ 
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              style={{
                filter: 'drop-shadow(0 10px 20px rgba(16, 185, 129, 0.3))',
              }}
            />
            <motion.h1 
              className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-emerald-400 bg-clip-text text-transparent"
              style={{
                textShadow: '0 4px 12px rgba(16, 185, 129, 0.2)',
              }}
            >
              {t('appName')}
            </motion.h1>
            <motion.p 
              className="text-xl sm:text-2xl text-gray-700 dark:text-gray-200 mb-8 font-medium"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {t('tagline')}
            </motion.p>
            
            <motion.button
              whileHover={{ 
                scale: 1.05,
                boxShadow: '0 20px 40px rgba(16, 185, 129, 0.4)',
                y: -5
              }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate(user ? '/scan' : '/auth')}
              className="px-8 py-4 bg-primary hover:bg-emerald-600 text-white rounded-full text-lg font-semibold transition-all"
              style={{
                boxShadow: '0 10px 30px rgba(16, 185, 129, 0.3), inset 0 -2px 10px rgba(0, 0, 0, 0.2)',
              }}
            >
              {t('getStarted')}
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-4 bg-gray-50 dark:bg-black/50">
        <div className="max-w-6xl mx-auto">
          <motion.h2 
            className="text-3xl font-bold text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            {t('howItWorks')}
          </motion.h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20, rotateX: -15 }}
                whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                whileHover={{ 
                  y: -10,
                  rotateY: 5,
                  transition: { duration: 0.3 }
                }}
                className="bg-white dark:bg-black rounded-2xl p-6 text-center transition-all border border-gray-200 dark:border-gray-700"
                style={{
                  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
                  transform: 'perspective(1000px)',
                }}
              >
                <motion.div
                  animate={{ 
                    rotate: [0, 5, -5, 0],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ 
                    duration: 3,
                    repeat: Infinity,
                    delay: index * 0.2
                  }}
                >
                  <feature.icon className="w-12 h-12 mx-auto mb-4 text-primary" />
                </motion.div>
                <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300">{feature.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Ethiopian Environmental Heritage */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold mb-4">{t('protectingEthiopia')}</h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              {t('protectingEthiopiaDesc')}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {ethiopianEnvironment.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30, rotateX: -20 }}
                whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15, duration: 0.6 }}
                whileHover={{ 
                  y: -15,
                  rotateY: 5,
                  transition: { duration: 0.3 }
                }}
                className="bg-white dark:bg-black rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 group"
                style={{
                  boxShadow: '0 15px 40px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
                  transform: 'perspective(1000px)',
                }}
              >
                <div className="h-56 overflow-hidden relative">
                  <motion.img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    whileHover={{ scale: 1.1 }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                  <motion.h3 
                    className="absolute bottom-4 left-4 right-4 font-bold text-xl text-white"
                    style={{
                      textShadow: '0 4px 12px rgba(0, 0, 0, 0.8)',
                    }}
                  >
                    {item.title}
                  </motion.h3>
                </div>
                <div className="p-6">
                  <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Ad Banner */}
      <section className="py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <AdBanner />
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gray-50 dark:bg-black/50">
        <div className="max-w-2xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, rotateX: -15 }}
            whileInView={{ opacity: 1, scale: 1, rotateX: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-white dark:bg-black rounded-2xl p-8 border border-gray-200 dark:border-gray-700"
            style={{
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
              transform: 'perspective(1000px)',
            }}
          >
            <motion.h2 
              className="text-3xl font-bold mb-4"
              animate={{ 
                scale: [1, 1.02, 1]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              {t('readyToMakeDifference')}
            </motion.h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              {t('joinThousands')}
            </p>
            <motion.button
              whileHover={{ 
                scale: 1.05,
                boxShadow: '0 20px 40px rgba(16, 185, 129, 0.4)',
                y: -5
              }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate(user ? '/scan' : '/auth')}
              className="px-8 py-3 bg-primary hover:bg-emerald-600 text-white rounded-full font-semibold transition-all"
              style={{
                boxShadow: '0 10px 30px rgba(16, 185, 129, 0.3), inset 0 -2px 10px rgba(0, 0, 0, 0.2)',
              }}
            >
              {user ? t('scan') : t('signIn')}
            </motion.button>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Landing;
