import { motion } from 'framer-motion';
import { User, Mail, Calendar, Globe, Palette } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getTranslation } from '../utils/translations';

const Profile = () => {
  const { user, language, theme } = useAuth();
  const t = (key) => getTranslation(language, key);

  const profileItems = [
    {
      icon: Mail,
      label: t('email'),
      value: user?.email || 'Not provided',
    },
    {
      icon: Calendar,
      label: 'Member Since',
      value: user?.metadata?.creationTime
        ? new Date(user.metadata.creationTime).toLocaleDateString()
        : 'Unknown',
    },
    {
      icon: Globe,
      label: t('language'),
      value: language === 'en' ? 'English' : language === 'am' ? 'አማርኛ' : 'Oromiffa',
    },
    {
      icon: Palette,
      label: t('theme'),
      value: theme === 'dark' ? t('dark') : t('light'),
    },
  ];

  return (
    <div className="min-h-[calc(100vh-4rem)] px-4 py-8">
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">{t('profile')}</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage your account settings</p>
        </div>

        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl p-8"
        >
          {/* Avatar */}
          <div className="flex flex-col items-center mb-8">
            {user?.photoURL ? (
              <img
                src={user.photoURL}
                alt="Profile"
                className="w-24 h-24 rounded-full border-4 border-primary mb-4"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center mb-4">
                <User className="w-12 h-12 text-primary" />
              </div>
            )}
            <h2 className="text-2xl font-bold">{user?.displayName || 'User'}</h2>
          </div>

          {/* Profile Info */}
          <div className="space-y-4">
            {profileItems.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-4 p-4 bg-white/5 rounded-xl"
              >
                <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <item.icon className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-600 dark:text-gray-400">{item.label}</p>
                  <p className="font-semibold truncate">{item.value}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Settings Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass rounded-2xl p-6 text-center"
        >
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Use the toggles in the navigation bar to change your language and theme preferences.
            Your settings are automatically saved.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Profile;
