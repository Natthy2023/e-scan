// Security utility functions to prevent XSS and injection attacks

/**
 * Sanitize HTML to prevent XSS attacks
 * @param {string} input - User input to sanitize
 * @returns {string} - Sanitized string
 */
export const sanitizeHTML = (input) => {
  if (typeof input !== 'string') return input;
  
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };
  
  return input.replace(/[&<>"'/]/g, (char) => map[char]);
};

/**
 * Remove dangerous scripts and tags
 * @param {string} input - User input to clean
 * @returns {string} - Cleaned string
 */
export const removeScripts = (input) => {
  if (typeof input !== 'string') return input;
  
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
    .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .replace(/data:text\/html/gi, '')
    .trim();
};

/**
 * Validate and sanitize user ID (Firebase UID format)
 * @param {string} userId - User ID to validate
 * @returns {boolean} - Whether the user ID is valid
 */
export const isValidUserId = (userId) => {
  if (typeof userId !== 'string') return false;
  
  // Firebase UIDs are alphanumeric and 28 characters long
  const uidRegex = /^[a-zA-Z0-9]{20,128}$/;
  return uidRegex.test(userId);
};

/**
 * Validate image file
 * @param {File} file - File to validate
 * @returns {Object} - Validation result with isValid and error message
 */
export const validateImageFile = (file) => {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  const maxSize = 10 * 1024 * 1024; // 10MB

  if (!file) {
    return { isValid: false, error: 'No file provided' };
  }

  if (!validTypes.includes(file.type)) {
    return { isValid: false, error: 'Invalid file type. Please upload JPEG, PNG, or WebP images only.' };
  }

  if (file.size > maxSize) {
    return { isValid: false, error: 'File too large. Maximum size is 10MB.' };
  }

  return { isValid: true };
};

/**
 * Sanitize object recursively
 * @param {Object} obj - Object to sanitize
 * @returns {Object} - Sanitized object
 */
export const sanitizeObject = (obj) => {
  if (typeof obj !== 'object' || obj === null) {
    return typeof obj === 'string' ? removeScripts(obj) : obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item));
  }

  const sanitized = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      sanitized[key] = sanitizeObject(obj[key]);
    }
  }
  return sanitized;
};

/**
 * Rate limiting helper
 * @param {string} key - Unique key for the action
 * @param {number} maxAttempts - Maximum attempts allowed
 * @param {number} windowMs - Time window in milliseconds
 * @returns {boolean} - Whether the action is allowed
 */
export const checkRateLimit = (key, maxAttempts = 5, windowMs = 60000) => {
  const now = Date.now();
  const storageKey = `rateLimit_${key}`;
  
  try {
    const data = JSON.parse(localStorage.getItem(storageKey) || '{"attempts":[],"blocked":false}');
    
    // Remove old attempts outside the window
    data.attempts = data.attempts.filter(timestamp => now - timestamp < windowMs);
    
    // Check if blocked
    if (data.blocked && data.blockedUntil > now) {
      return false;
    }
    
    // Check attempts
    if (data.attempts.length >= maxAttempts) {
      data.blocked = true;
      data.blockedUntil = now + windowMs;
      localStorage.setItem(storageKey, JSON.stringify(data));
      return false;
    }
    
    // Add new attempt
    data.attempts.push(now);
    data.blocked = false;
    localStorage.setItem(storageKey, JSON.stringify(data));
    
    return true;
  } catch (error) {
    // If localStorage fails, allow the action
    return true;
  }
};
