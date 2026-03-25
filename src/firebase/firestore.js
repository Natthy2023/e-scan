import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  doc,
  setDoc,
  getDoc,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './config';
import toast from 'react-hot-toast';
import { isValidUserId, sanitizeObject } from '../utils/security';

export const saveScanResult = async (userId, scanData) => {
  try {
    // Validate user ID
    if (!isValidUserId(userId)) {
      throw new Error('Invalid user ID');
    }

    // Sanitize scan data
    const sanitizedData = sanitizeObject(scanData);

    const scansRef = collection(db, 'scans');
    const docRef = await addDoc(scansRef, {
      userId,
      ...sanitizedData,
      timestamp: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    toast.error('Failed to save scan result');
    throw error;
  }
};

export const getUserScans = async (userId) => {
  try {
    // Validate user ID
    if (!isValidUserId(userId)) {
      throw new Error('Invalid user ID');
    }

    const scansRef = collection(db, 'scans');
    const q = query(
      scansRef,
      where('userId', '==', userId),
      orderBy('timestamp', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    toast.error('Failed to load scan history');
    throw error;
  }
};

export const getUserProfile = async (userId) => {
  try {
    // Validate user ID
    if (!isValidUserId(userId)) {
      throw new Error('Invalid user ID');
    }

    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    if (userDoc.exists()) {
      return userDoc.data();
    }
    return null;
  } catch (error) {
    toast.error('Failed to load user profile');
    throw error;
  }
};

export const updateUserProfile = async (userId, profileData) => {
  try {
    // Validate user ID
    if (!isValidUserId(userId)) {
      throw new Error('Invalid user ID');
    }

    // Sanitize profile data
    const sanitizedData = sanitizeObject(profileData);

    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, sanitizedData, { merge: true });
  } catch (error) {
    toast.error('Failed to update profile');
    throw error;
  }
};

export const getUserStats = async (userId) => {
  try {
    // Validate user ID
    if (!isValidUserId(userId)) {
      throw new Error('Invalid user ID');
    }

    const scans = await getUserScans(userId);
    const recyclableCount = scans.filter(scan => scan.isRecyclable).length;
    const co2Saved = recyclableCount * 0.5; // Estimate 0.5kg CO2 per recyclable item
    
    return {
      totalScans: scans.length,
      recyclableCount,
      nonRecyclableCount: scans.length - recyclableCount,
      co2Saved: co2Saved.toFixed(2),
    };
  } catch (error) {
    toast.error('Failed to load stats');
    throw error;
  }
};

export const deleteScan = async (scanId) => {
  try {
    // Validate scan ID format
    if (typeof scanId !== 'string' || scanId.length === 0) {
      throw new Error('Invalid scan ID');
    }

    const scanRef = doc(db, 'scans', scanId);
    await deleteDoc(scanRef);
    toast.success('Scan deleted successfully');
  } catch (error) {
    toast.error('Failed to delete scan');
    throw error;
  }
};
