# Rate Limiting Solution

## Overview

This application implements a comprehensive rate limiting solution to handle Gemini API quota limits and prevent "Too many requests" errors.

## Features

### 1. **Request Queue System**
- All API requests are queued and processed sequentially
- Prevents multiple simultaneous requests that could trigger rate limits
- Priority queue: High-priority requests (image analysis) are processed first

### 2. **Automatic Rate Limiting**
- Minimum 2-second delay between requests
- Prevents hitting API rate limits
- Transparent to the user - requests are queued automatically

### 3. **Exponential Backoff**
- Automatic retry with exponential backoff on rate limit errors
- Base backoff: 5 seconds
- Doubles with each retry (5s, 10s, 20s)
- Maximum 3 retry attempts

### 4. **Visual Feedback**
- Rate limit indicator shows when requests are being processed
- Queue length display
- Processing status indicator
- User-friendly messages

### 5. **Priority System**
- **High Priority**: Image analysis (user-initiated scans)
- **Normal Priority**: Translations (background operations)

## How It Works

### Request Flow

```
User Action → Rate Limiter Queue → Wait for Delay → API Call → Success/Retry
```

### Rate Limit Detection

The system detects rate limit errors by checking for:
- HTTP 429 status codes
- "rate limit" in error messages
- "quota" in error messages
- "too many requests" in error messages

### Retry Logic

When a rate limit error is detected:
1. Calculate backoff delay: `baseBackoff * 2^(retryCount - 1)`
2. Wait for backoff period
3. Re-queue request with high priority
4. Retry up to 3 times
5. If all retries fail, show error to user

## Usage

### For Developers

The rate limiter is automatically applied to all Gemini API calls:

```javascript
import { withRateLimit } from './utils/rateLimiter';

// Wrap any API call
const result = await withRateLimit(async () => {
  return await apiCall();
}, 'high'); // priority: 'high' or 'normal'
```

### Configuration

Edit `src/utils/rateLimiter.js` to adjust:

```javascript
this.minDelay = 2000;      // Minimum delay between requests (ms)
this.maxRetries = 3;       // Maximum retry attempts
this.baseBackoff = 5000;   // Base backoff delay (ms)
```

## User Experience

### What Users See

1. **Normal Operation**:
   - Requests are processed smoothly
   - Small delay between operations (2 seconds)
   - Rate limit indicator appears briefly

2. **During Rate Limiting**:
   - Toast notification: "Too many requests. Your request will be retried automatically. Please wait..."
   - Rate limit indicator shows queue status
   - Request is automatically retried

3. **After Max Retries**:
   - Error message: "Rate limit reached. Please wait a moment and try again."
   - User can try again after waiting

## Best Practices

### For Users

1. **Wait Between Scans**: Allow 2-3 seconds between scans
2. **Avoid Rapid Language Changes**: Changing language triggers translations
3. **Be Patient**: If you see the rate limit indicator, wait for it to complete

### For Developers

1. **Use Priority Wisely**: 
   - High priority for user-initiated actions
   - Normal priority for background operations

2. **Handle Errors Gracefully**:
   ```javascript
   try {
     const result = await analyzeImage(file, language);
   } catch (error) {
     if (error.message === 'RATE_LIMIT') {
       // Already handled by rate limiter
     } else {
       // Handle other errors
     }
   }
   ```

3. **Monitor Queue Status**:
   ```javascript
   import { getRateLimiterStatus } from './utils/rateLimiter';
   
   const status = getRateLimiterStatus();
   console.log('Queue length:', status.queueLength);
   ```

## Gemini API Limits

### Free Tier Limits (as of 2026)

- **Requests per minute**: 15 RPM
- **Requests per day**: 1,500 RPD
- **Tokens per minute**: 1 million TPM

### Our Solution

With 2-second minimum delay:
- Maximum 30 requests per minute (well below 15 RPM limit)
- Automatic backoff prevents hitting daily limits
- Queue system prevents burst requests

## Troubleshooting

### Issue: Still Getting Rate Limit Errors

**Solution**: Increase `minDelay` in `rateLimiter.js`:
```javascript
this.minDelay = 4000; // 4 seconds instead of 2
```

### Issue: Requests Taking Too Long

**Solution**: Check queue status and reduce concurrent operations:
```javascript
const status = getRateLimiterStatus();
if (status.queueLength > 5) {
  // Too many requests queued
  toast.info('Please wait, processing previous requests...');
}
```

### Issue: Translations Slow

**Solution**: Translations are queued with normal priority. This is intentional to prioritize user scans. Consider:
- Caching translations locally
- Translating only visible items
- Batch translation requests

## Performance Optimization

### Current Implementation

- ✅ Request queuing
- ✅ Exponential backoff
- ✅ Priority system
- ✅ Visual feedback
- ✅ Automatic retries

### Future Enhancements

- [ ] Local caching of translations
- [ ] Batch API requests
- [ ] WebSocket for real-time updates
- [ ] Service worker for offline support
- [ ] IndexedDB for persistent cache

## Monitoring

### Check Rate Limiter Status

```javascript
import { getRateLimiterStatus } from './utils/rateLimiter';

setInterval(() => {
  const status = getRateLimiterStatus();
  console.log('Rate Limiter Status:', {
    queueLength: status.queueLength,
    processing: status.processing,
    lastRequest: new Date(status.lastRequestTime).toLocaleTimeString()
  });
}, 5000);
```

## API Key Management

### Best Practices

1. **Use Environment Variables**: Never hardcode API keys
2. **Rotate Keys Regularly**: Change API keys every 90 days
3. **Monitor Usage**: Check Google Cloud Console for usage stats
4. **Set Quotas**: Configure custom quotas in Google Cloud Console

### Multiple API Keys (Advanced)

For high-traffic applications, consider rotating between multiple API keys:

```javascript
const API_KEYS = [
  process.env.VITE_GEMINI_API_KEY_1,
  process.env.VITE_GEMINI_API_KEY_2,
  process.env.VITE_GEMINI_API_KEY_3,
];

let currentKeyIndex = 0;

function getNextApiKey() {
  currentKeyIndex = (currentKeyIndex + 1) % API_KEYS.length;
  return API_KEYS[currentKeyIndex];
}
```

## Support

For issues or questions:
1. Check this documentation
2. Review `src/utils/rateLimiter.js`
3. Check browser console for rate limiter logs
4. Contact support with error details

## License

This rate limiting implementation is part of the ኢ - Scan application and follows the same license.
