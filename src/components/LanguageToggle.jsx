import { Languages } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { getTranslation } from '../utils/translations';

const LanguageToggle = () => {
  const { language, setLanguage } = useAuth();

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'am', name: 'አማርኛ' },
    { code: 'om', name: 'Oromiffa' },
  ];

  return (
    <div className="relative group">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="p-2 rounded-lg glass hover:bg-white/20 dark:hover:bg-white/10 transition-colors flex items-center gap-2"
      >
        <Languages className="w-5 h-5" />
        <span className="text-sm font-medium hidden sm:inline">
          {languages.find(l => l.code === language)?.name}
        </span>
      </motion.button>
      
      <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-black rounded-lg shadow-lg border dark:border-gray-800 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => setLanguage(lang.code)}
            className={`w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-900 first:rounded-t-lg last:rounded-b-lg transition-colors ${
              language === lang.code ? 'bg-primary/10 text-primary' : ''
            }`}
          >
            {lang.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default LanguageToggle;
