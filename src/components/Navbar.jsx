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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center gap-3">
            <img
              src="/assets/images/artboard-1.svg"
              alt="e-Scan Logo"
              className="w-10 h-10 sm:w-12 sm:h-12 object-contain"
            />
            <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-primary to-emerald-400 bg-clip-text text-transparent">
              {t('appName')}
            </span>
          </Link>

          <div className="flex items-center gap-2 sm:gap-4">
            <LanguageToggle />
            <ThemeToggle />
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/about')}
              className="p-2 rounded-lg glass hover:bg-white/20 dark:hover:bg-white/10 transition-colors"
              aria-label={t('about')}
            >
              <Info className="w-5 h-5" />
            </motion.button>
            
            {user && (
              <>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/dashboard')}
                  className="p-2 rounded-lg glass hover:bg-white/20 dark:hover:bg-white/10 transition-colors"
                  aria-label="Dashboard"
                >
                  <LayoutDashboard className="w-5 h-5" />
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/profile')}
                  className="p-2 rounded-lg glass hover:bg-white/20 dark:hover:bg-white/10 transition-colors"
                  aria-label="Profile"
                >
                  <User className="w-5 h-5" />
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSignOut}
                  className="p-2 rounded-lg glass hover:bg-white/20 dark:hover:bg-white/10 transition-colors"
                  aria-label={t('signOut')}
                >
                  <LogOut className="w-5 h-5" />
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
