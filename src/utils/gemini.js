import toast from 'react-hot-toast';
import { withRateLimit } from './rateLimiter';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || 'AIzaSyA4-xC7vWOqwlZoQyVrThIperlfdXnrlD0';

// Sanitize user input to prevent XSS attacks
const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  
  // Remove potentially dangerous characters and scripts
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .trim();
};

// Compress image before sending to Gemini
export const compressImage = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800;
        const scaleSize = MAX_WIDTH / img.width;
        canvas.width = MAX_WIDTH;
        canvas.height = img.height * scaleSize;
        
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        canvas.toBlob(
          (blob) => {
            resolve(blob);
          },
          'image/jpeg',
          0.8
        );
      };
      img.onerror = reject;
    };
    reader.onerror = reject;
  });
};

export const analyzeImage = async (imageFile, language = 'en') => {
  // Wrap the entire function in rate limiter
  return withRateLimit(async () => {
    try {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!validTypes.includes(imageFile.type)) {
        throw new Error('Invalid file type. Please upload a valid image.');
      }

      // Validate file size (max 10MB)
      const maxSize = 10 * 1024 * 1024;
      if (imageFile.size > maxSize) {
        throw new Error('File too large. Maximum size is 10MB.');
      }

      // Sanitize language input
      const validLanguages = ['en', 'am', 'om'];
      const sanitizedLanguage = validLanguages.includes(language) ? language : 'en';
      
      // Compress image
      const compressedBlob = await compressImage(imageFile);
    
    // Convert to base64
    const base64Image = await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      };
      reader.readAsDataURL(compressedBlob);
    });

    const languageInstructions = {
      en: 'You must respond in English language only. All text in your response must be in English.',
      am: 'You must respond in Amharic (አማርኛ) language only. All text in your response must be in Amharic script.',
      om: 'You must respond in Oromiffa/Oromo (Afaan Oromoo) language only. All text in your response must be in Oromo language.',
    };

    const prompt = `${languageInstructions[sanitizedLanguage] || languageInstructions.en}

Analyze this waste item image and provide a JSON response with the following structure:
{
  "itemName": "name of the item in ${sanitizedLanguage === 'en' ? 'English' : sanitizedLanguage === 'am' ? 'Amharic' : 'Oromo'}",
  "isRecyclable": true or false,
  "recyclingSteps": ["step 1 in ${sanitizedLanguage === 'en' ? 'English' : sanitizedLanguage === 'am' ? 'Amharic' : 'Oromo'}", "step 2", "step 3"],
  "upcyclingIdeas": ["idea 1 in ${sanitizedLanguage === 'en' ? 'English' : sanitizedLanguage === 'am' ? 'Amharic' : 'Oromo'}", "idea 2", "idea 3"],
  "material": "primary material type in ${sanitizedLanguage === 'en' ? 'English' : sanitizedLanguage === 'am' ? 'Amharic' : 'Oromo'}",
  "confidence": "high/medium/low"
}

IMPORTANT: 
- ALL text fields (itemName, recyclingSteps, upcyclingIdeas, material) must be written in ${sanitizedLanguage === 'en' ? 'English' : sanitizedLanguage === 'am' ? 'Amharic (አማርኛ)' : 'Oromiffa/Oromo (Afaan Oromoo)'} language.
- Be specific and practical. 
- If not recyclable, explain why in recyclingSteps in the specified language.
- Do not mix languages - use only ${sanitizedLanguage === 'en' ? 'English' : sanitizedLanguage === 'am' ? 'Amharic' : 'Oromo'}.`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;

    // Use the REST API directly with v1beta endpoint
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: prompt },
              {
                inline_data: {
                  mime_type: 'image/jpeg',
                  data: base64Image,
                },
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.error?.message || `API request failed with status ${response.status}`;
      
      // Show detailed error in development
      if (process.env.NODE_ENV === 'development') {
        console.error('Gemini API Error:', errorMessage, errorData);
      }
      
      throw new Error(errorMessage);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    // Parse JSON response with fallback
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        
        // Sanitize all text fields
        return {
          itemName: sanitizeInput(parsed.itemName),
          isRecyclable: Boolean(parsed.isRecyclable),
          recyclingSteps: Array.isArray(parsed.recyclingSteps) 
            ? parsed.recyclingSteps.map(step => sanitizeInput(step))
            : [],
          upcyclingIdeas: Array.isArray(parsed.upcyclingIdeas)
            ? parsed.upcyclingIdeas.map(idea => sanitizeInput(idea))
            : [],
          material: sanitizeInput(parsed.material),
          confidence: sanitizeInput(parsed.confidence),
        };
      }
      throw new Error('No JSON found in response');
    } catch (parseError) {
      // Fallback response
      return {
        itemName: 'Unknown Item',
        isRecyclable: false,
        recyclingSteps: ['Unable to analyze. Please try again with a clearer image.'],
        upcyclingIdeas: ['Try taking a photo with better lighting', 'Ensure the item is clearly visible', 'Remove any obstructions'],
        material: 'Unknown',
        confidence: 'low',
      };
    }
  } catch (error) {
    if (error.message?.includes('429') || error.message?.includes('quota') || error.message?.includes('rate limit')) {
      toast.error('Too many requests. Please wait a moment and try again.');
      throw new Error('RATE_LIMIT');
    }
    
    if (error.message?.includes('Invalid file') || error.message?.includes('File too large')) {
      toast.error(error.message);
      throw error;
    }
    
    if (error.message?.includes('API_KEY_INVALID') || error.message?.includes('API key') || error.message?.includes('API configuration')) {
      toast.error('Gemini API key is invalid or expired. Please get a new key from https://aistudio.google.com/apikey');
      throw error;
    }
    
    if (error.message?.includes('404') || error.message?.includes('not found')) {
      toast.error('Gemini API service unavailable. Please try again later.');
      throw error;
    }
    
    if (error.message?.includes('403') || error.message?.includes('permission')) {
      toast.error('API key does not have permission. Check API key restrictions in Google Cloud Console.');
      throw error;
    }
    
    // Generic error
    toast.error('Failed to analyze image. Please try again.');
    
    // Log error in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Analysis error:', error);
    }
    
    throw error;
  }
  }, 'high'); // High priority for image analysis
};


// Translate existing scan result to a different language
export const translateScanResult = async (scanResult, targetLanguage) => {
  // Wrap translation in rate limiter with normal priority
  return withRateLimit(async () => {
    try {
      // Validate inputs
      const validLanguages = ['en', 'am', 'om'];
      if (!validLanguages.includes(targetLanguage)) {
        return scanResult;
      }

      // If already in target language, return as is
      if (scanResult.originalLanguage === targetLanguage) {
        return scanResult;
      }

    const languageNames = {
      en: 'English',
      am: 'Amharic (አማርኛ)',
      om: 'Oromiffa/Oromo (Afaan Oromoo)',
    };

    // Sanitize inputs
    const sanitizedItemName = sanitizeInput(scanResult.itemName || '');
    const sanitizedMaterial = sanitizeInput(scanResult.material || '');
    const sanitizedSteps = Array.isArray(scanResult.recyclingSteps)
      ? scanResult.recyclingSteps.map(step => sanitizeInput(step))
      : [];
    const sanitizedIdeas = Array.isArray(scanResult.upcyclingIdeas)
      ? scanResult.upcyclingIdeas.map(idea => sanitizeInput(idea))
      : [];

    const prompt = `Translate the following recycling scan result to ${languageNames[targetLanguage]}. 
You must respond ONLY in ${languageNames[targetLanguage]} language.

Original data:
Item Name: ${sanitizedItemName}
Material: ${sanitizedMaterial}
Recycling Steps: ${JSON.stringify(sanitizedSteps)}
Upcycling Ideas: ${JSON.stringify(sanitizedIdeas)}

Provide a JSON response with this exact structure:
{
  "itemName": "translated item name in ${languageNames[targetLanguage]}",
  "material": "translated material in ${languageNames[targetLanguage]}",
  "recyclingSteps": ["translated step 1", "translated step 2", ...],
  "upcyclingIdeas": ["translated idea 1", "translated idea 2", ...]
}

IMPORTANT: ALL text must be in ${languageNames[targetLanguage]} only. Do not mix languages.`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error('Translation failed');
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const translated = JSON.parse(jsonMatch[0]);
      return {
        ...scanResult,
        itemName: sanitizeInput(translated.itemName),
        material: sanitizeInput(translated.material),
        recyclingSteps: Array.isArray(translated.recyclingSteps)
          ? translated.recyclingSteps.map(step => sanitizeInput(step))
          : scanResult.recyclingSteps,
        upcyclingIdeas: Array.isArray(translated.upcyclingIdeas)
          ? translated.upcyclingIdeas.map(idea => sanitizeInput(idea))
          : scanResult.upcyclingIdeas,
        translatedTo: targetLanguage,
      };
    }
    
    // If translation fails, return original
    return scanResult;
  } catch (error) {
    // Return original on error
    return scanResult;
  }
  }, 'normal'); // Normal priority for translations
};
