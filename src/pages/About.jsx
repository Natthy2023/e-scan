import { motion } from 'framer-motion';
import { Recycle, Sparkles, Globe, Heart, Mail, Code } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getTranslation } from '../utils/translations';

const About = () => {
  const { language } = useAuth();
  const t = (key) => getTranslation(language, key);

  return (
    <div className="min-h-[calc(100vh-4rem)] px-4 py-12">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <h1 className="text-4xl md:text-5xl font-bold">{t('aboutTitle')}</h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            {t('aboutSubtitle')}
          </p>
        </motion.div>

        {/* Mission Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass rounded-2xl p-8 space-y-4"
        >
          <div className="flex items-center gap-3 mb-4">
            <Recycle className="w-8 h-8 text-primary" />
            <h2 className="text-2xl font-bold">{t('ourMission')}</h2>
          </div>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
            {t('missionDescription')}
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <div className="glass rounded-xl p-6 space-y-3">
            <Sparkles className="w-8 h-8 text-primary" />
            <h3 className="text-lg font-semibold">{t('aiPowered')}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t('aiPoweredDesc')}
            </p>
          </div>

          <div className="glass rounded-xl p-6 space-y-3">
            <Globe className="w-8 h-8 text-primary" />
            <h3 className="text-lg font-semibold">{t('multiLanguage')}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t('multiLanguageDesc')}
            </p>
          </div>

          <div className="glass rounded-xl p-6 space-y-3">
            <Heart className="w-8 h-8 text-primary" />
            <h3 className="text-lg font-semibold">{t('forEthiopia')}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t('forEthiopiaDesc')}
            </p>
          </div>
        </motion.div>

        {/* How It Works */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass rounded-2xl p-8 space-y-6"
        >
          <h2 className="text-2xl font-bold">{t('howItWorks')}</h2>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold">
                1
              </div>
              <div>
                <h3 className="font-semibold mb-1">{t('step1Title')}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{t('step1')}</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold">
                2
              </div>
              <div>
                <h3 className="font-semibold mb-1">{t('step2Title')}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{t('step2')}</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold">
                3
              </div>
              <div>
                <h3 className="font-semibold mb-1">{t('step3Title')}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{t('step3')}</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold">
                4
              </div>
              <div>
                <h3 className="font-semibold mb-1">{t('step4Title')}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{t('step4')}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Developer Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass rounded-2xl p-8 space-y-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <Code className="w-8 h-8 text-primary" />
            <h2 className="text-2xl font-bold">{t('developer')}</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-semibold mb-2">Natnael Asfaw</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {t('fullstackDeveloper')} & {t('softwareEngineer')}
              </p>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                {t('developerBio')}
              </p>
            </div>

            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <Mail className="w-5 h-5 text-primary" />
              <a
                href="mailto:natnaelasfaw2023@gmail.com"
                className="hover:text-primary transition-colors"
              >
                natnaelasfaw2023@gmail.com
              </a>
            </div>
          </div>
        </motion.div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-center space-y-4"
        >
          <h2 className="text-2xl font-bold">{t('readyToMakeDifference')}</h2>
          <p className="text-gray-600 dark:text-gray-400">
            {t('joinThousands')}
          </p>
          <motion.a
            href="/scan"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-block px-8 py-3 bg-primary hover:bg-emerald-600 text-white rounded-full font-semibold transition-colors"
          >
            {t('getStarted')}
          </motion.a>
        </motion.div>
      </div>
    </div>
  );
};

export default About;
