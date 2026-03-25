import { Link, useNavigate } from 'react-router-dom';
import { LogOut, LayoutDashboard, User, Info } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { signOut } from '../firebase/auth';
import { getTranslation } from '../utils/translations';
import ThemeToggle from './ThemeToggle';
import LanguageToggle from './LanguageToggle';
import { motion } from 'framer-motion';

const Navbar = () => {
  const { user, language } = useAuth();
  const navigate = useNavigate();
  const t = (key) => getTranslation(language, key);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-50 glass border-b border-white/10">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
        <div className="flex justify-between items-center h-14 sm:h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <img
              src="/assets/images/artboard-1.svg"
              alt="e-Scan Logo"
              className="w-8 h-8 sm:w-10 sm:h-10 object-contain"
            />
            <span className="text-lg sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-primary to-emerald-400 bg-clip-text text-transparent">
              {t('appName')}
            </span>
          </Link>

          {/* Navigation Icons */}
          <div className="flex items-center gap-1 sm:gap-2">
            <LanguageToggle />
            <ThemeToggle />
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/about')}
              className="p-1.5 sm:p-2 rounded-lg glass hover:bg-white/20 dark:hover:bg-white/10 transition-colors"
              aria-label={t('about')}
            >
              <Info className="w-4 h-4 sm:w-5 sm:h-5" />
            </motion.button>
            
            {user && (
              <>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/dashboard')}
                  className="p-1.5 sm:p-2 rounded-lg glass hover:bg-white/20 dark:hover:bg-white/10 transition-colors"
                  aria-label="Dashboard"
                >
                  <LayoutDashboard className="w-4 h-4 sm:w-5 sm:h-5" />
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/profile')}
                  className="p-1.5 sm:p-2 rounded-lg glass hover:bg-white/20 dark:hover:bg-white/10 transition-colors"
                  aria-label="Profile"
                >
                  <User className="w-4 h-4 sm:w-5 sm:h-5" />
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSignOut}
                  className="p-1.5 sm:p-2 rounded-lg glass hover:bg-white/20 dark:hover:bg-white/10 transition-colors"
                  aria-label={t('signOut')}
                >
                  <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
                </motion.button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
