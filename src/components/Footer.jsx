import { Link } from 'react-router-dom';
import { Mail, Heart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getTranslation } from '../utils/translations';

const Footer = () => {
  const { language } = useAuth();
  const t = (key) => getTranslation(language, key);

  return (
    <footer className="bg-white dark:bg-black border-t border-gray-200 dark:border-gray-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About Section */}
          <div>
            <h3 className="text-lg font-bold mb-4">{t('appName')}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              {t('tagline')}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t('footerDescription')}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold mb-4">{t('quickLinks')}</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link to="/scan" className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary transition-colors">
                  Scan
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary transition-colors">
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-bold mb-4">{t('contact')}</h3>
            <div className="space-y-3">
              <a
                href="mailto:natnaelasfaw2023@gmail.com"
                className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-primary transition-colors"
              >
                <Mail className="w-4 h-4" />
                natnaelasfaw2023@gmail.com
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center md:text-left">
              © {new Date().getFullYear()} {t('appName')}. {t('allRightsReserved')}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
              {t('madeWith')} <Heart className="w-4 h-4 text-red-500 fill-current" /> {t('inEthiopia')}
            </p>
          </div>
          <p className="text-xs text-center text-gray-500 dark:text-gray-500 mt-4">
            {t('developedBy')} <span className="font-semibold">Natnael Asfaw</span> - {t('fullstackDeveloper')}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
