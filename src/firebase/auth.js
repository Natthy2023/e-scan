import {
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
} from 'firebase/auth';
import { auth } from './config';
import toast from 'react-hot-toast';

const googleProvider = new GoogleAuthProvider();

// Detect if device is mobile or tablet
const isMobile = () => {
  // Check user agent
  const userAgent = navigator.userAgent || navigator.vendor || window.opera;
  const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile|CriOS/i;
  
  // Also check for touch support and small screen
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  const isSmallScreen = window.innerWidth <= 768;
  
  return mobileRegex.test(userAgent) || (isTouchDevice && isSmallScreen);
};

export const signInWithGoogle = async () => {
  try {
    // Always use redirect on mobile for better compatibility
    if (isMobile()) {
      // Set persistence before redirect
      await signInWithRedirect(auth, googleProvider);
      // The redirect will happen, result handled on return
      return null;
    } else {
      // Use popup on desktop
      try {
        const result = await signInWithPopup(auth, googleProvider);
        return result.user;
      } catch (popupError) {
        // If popup fails on desktop, try redirect as fallback
        if (popupError.code === 'auth/popup-blocked') {
          toast.error('Popup blocked. Redirecting...');
          await signInWithRedirect(auth, googleProvider);
          return null;
        }
        throw popupError;
      }
    }
  } catch (error) {
    // Handle specific Firebase auth errors
    if (error.code === 'auth/unauthorized-domain') {
      toast.error('Authentication error. Please contact support.');
      // Keep this console.error for admin debugging
      if (process.env.NODE_ENV === 'development') {
        console.error('Domain not authorized in Firebase Console. Add your domain to Firebase → Authentication → Settings → Authorized domains');
      }
    } else if (error.code === 'auth/popup-blocked') {
      // Already handled above
    } else if (error.code === 'auth/popup-closed-by-user') {
      // User closed popup - don't show error, this is intentional
      return null;
    } else if (error.code === 'auth/cancelled-popup-request') {
      // User opened multiple popups, ignore this error
      return null;
    } else if (error.code === 'auth/network-request-failed') {
      toast.error('Network error. Please check your connection.');
    } else if (error.code === 'auth/internal-error') {
      toast.error('Authentication error. Please try again or use email sign-in.');
    } else {
      toast.error('Sign-in failed. Please try again.');
    }
    throw error;
  }
};

// Handle redirect result (call this on app initialization)
export const handleRedirectResult = async () => {
  try {
    const result = await getRedirectResult(auth);
    if (result) {
      return result.user;
    }
    return null;
  } catch (error) {
    if (error.code === 'auth/unauthorized-domain') {
      toast.error('Authentication error. Please contact support.');
      if (process.env.NODE_ENV === 'development') {
        console.error('Domain not authorized in Firebase Console');
      }
    } else if (error.code === 'auth/network-request-failed') {
      toast.error('Network error. Please check your connection.');
    } else if (error.code !== 'auth/popup-closed-by-user') {
      toast.error('Sign-in failed. Please try again.');
    }
    return null;
  }
};

export const signInWithEmail = async (email, password) => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return result.user;
  } catch (error) {
    // Handle specific Firebase auth errors
    if (error.code === 'auth/user-not-found') {
      toast.error('No account found with this email.');
    } else if (error.code === 'auth/wrong-password') {
      toast.error('Incorrect password.');
    } else if (error.code === 'auth/invalid-email') {
      toast.error('Invalid email address.');
    } else if (error.code === 'auth/user-disabled') {
      toast.error('This account has been disabled.');
    } else if (error.code === 'auth/too-many-requests') {
      toast.error('Too many failed attempts. Please try again later.');
    } else {
      toast.error('Sign-in failed. Please try again.');
    }
    throw error;
  }
};

export const signUpWithEmail = async (email, password) => {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    return result.user;
  } catch (error) {
    // Handle specific Firebase auth errors
    if (error.code === 'auth/email-already-in-use') {
      toast.error('An account with this email already exists.');
    } else if (error.code === 'auth/invalid-email') {
      toast.error('Invalid email address.');
    } else if (error.code === 'auth/weak-password') {
      toast.error('Password should be at least 6 characters.');
    } else if (error.code === 'auth/operation-not-allowed') {
      toast.error('Email/password sign-up is not enabled.');
    } else {
      toast.error('Sign-up failed. Please try again.');
    }
    throw error;
  }
};

export const signOut = async () => {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    toast.error(error.message);
    throw error;
  }
};
