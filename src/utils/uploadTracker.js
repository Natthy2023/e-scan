// Daily Upload Tracker for Gemini API Free Tier

const STORAGE_KEY = 'escan_daily_uploads';
const MAX_DAILY_UPLOADS = 10; // Strict limit for 100+ users per day (Gemini free tier: 1,500 requests/day)

/**
 * Get today's date string (YYYY-MM-DD)
 */
const getTodayString = () => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};

/**
 * Get upload data from localStorage
 */
const getUploadData = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      return { date: getTodayString(), count: 0 };
    }
    return JSON.parse(data);
  } catch (error) {
    return { date: getTodayString(), count: 0 };
  }
};

/**
 * Save upload data to localStorage
 */
const saveUploadData = (data) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    // Silently fail if localStorage is not available
  }
};

/**
 * Check if user can upload (within daily limit)
 */
export const canUpload = () => {
  const data = getUploadData();
  const today = getTodayString();

  // Reset count if it's a new day
  if (data.date !== today) {
    return {
      allowed: true,
      remaining: MAX_DAILY_UPLOADS,
      total: MAX_DAILY_UPLOADS,
      used: 0,
    };
  }

  const remaining = MAX_DAILY_UPLOADS - data.count;
  return {
    allowed: remaining > 0,
    remaining: Math.max(0, remaining),
    total: MAX_DAILY_UPLOADS,
    used: data.count,
  };
};

/**
 * Record an upload
 */
export const recordUpload = () => {
  const data = getUploadData();
  const today = getTodayString();

  // Reset if new day
  if (data.date !== today) {
    saveUploadData({ date: today, count: 1 });
    return;
  }

  // Increment count
  data.count += 1;
  saveUploadData(data);
};

/**
 * Get time until reset (midnight)
 */
export const getTimeUntilReset = () => {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  
  const diff = tomorrow - now;
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  return { hours, minutes, totalMinutes: Math.floor(diff / (1000 * 60)) };
};

/**
 * Format time until reset
 */
export const formatTimeUntilReset = () => {
  const { hours, minutes } = getTimeUntilReset();
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
};
