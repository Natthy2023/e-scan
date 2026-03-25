import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase/config';
import { getUserProfile, updateUserProfile } from '../firebase/firestore';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState(
    () => localStorage.getItem('language') || 'en'
  );
  const [theme, setTheme] = useState(
    () => localStorage.getItem('theme') || 'dark'
  );

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      
      if (user) {
        try {
          const profile = await getUserProfile(user.uid);
          if (profile) {
            setUserProfile(profile);
            if (profile.language) setLanguage(profile.language);
            if (profile.theme) setTheme(profile.theme);
          } else {
            // Create initial profile
            const initialProfile = {
              language: language,
              theme: theme,
              createdAt: new Date().toISOString(),
            };
            await updateUserProfile(user.uid, initialProfile);
            setUserProfile(initialProfile);
          }
        } catch (error) {
          console.error('Error loading profile:', error);
        }
      } else {
        setUserProfile(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    localStorage.setItem('language', language);
    if (user) {
      updateUserProfile(user.uid, { language }).catch(console.error);
    }
  }, [language, user]);

  useEffect(() => {
    localStorage.setItem('theme', theme);
    document.documentElement.classList.toggle('dark', theme === 'dark');
    if (user) {
      updateUserProfile(user.uid, { theme }).catch(console.error);
    }
  }, [theme, user]);

  const value = {
    user,
    userProfile,
    loading,
    language,
    setLanguage,
    theme,
    setTheme,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
