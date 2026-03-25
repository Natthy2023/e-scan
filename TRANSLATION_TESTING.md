# Translation Testing Guide

## How Translation Works

### Current Scan Result Translation
**File**: `src/pages/Scan.jsx`

When you change the language using the language toggle:
1. The `useEffect` hook detects the language change
2. Checks if the current result needs translation
3. Shows "Analyzing..." indicator
4. Calls `translateScanResult()` from Gemini API
5. Updates the result with translated content
6. All fields are translated:
   - Item name
   - Material type
   - Recycling steps (all steps)
   - Upcycling ideas (all ideas)

### Scan History Translation
**File**: `src/components/ScanHistory.jsx`

When you change the language:
1. The component detects language change
2. Iterates through all scans in history
3. Translates each scan that's not in the current language
4. Caches translations to avoid re-translating
5. Updates the display with translated content

## Testing Steps

### Test 1: Current Scan Result Translation

1. **Sign in** to the app
2. **Scan an item** (or upload an image)
3. Wait for AI analysis to complete
4. **Note the language** of the result (e.g., English)
5. **Change language** using the toggle (e.g., to Amharic)
6. **Observe**:
   - "Analyzing..." indicator appears briefly
   - Item name translates to Amharic
   - Material type translates to Amharic
   - ALL recycling steps translate to Amharic
   - ALL upcycling ideas translate to Amharic
7. **Change language again** (e.g., to Oromiffa)
8. **Verify** all content translates to Oromiffa

### Test 2: Scan History Translation

1. **Go to Dashboard** (with existing scan history)
2. **Note the language** of scan items
3. **Change language** using the toggle
4. **Observe**:
   - Brief "Analyzing..." message may appear
   - All scan items in the list translate
   - Item names translate
   - Material badges translate
   - Recyclable/Not Recyclable status translates
5. **Click on a scan** to view details
6. **Verify** in the modal:
   - Item name is translated
   - Material is translated
   - ALL recycling steps are translated
   - ALL upcycling ideas are translated
7. **Change language again** and verify all content updates

### Test 3: Real-Time Translation

1. **Have a scan result displayed** on Scan page
2. **Rapidly switch languages**: English → Amharic → Oromiffa → English
3. **Verify**:
   - Each language change triggers translation
   - No duplicate translations occur
   - Content updates smoothly
   - No errors in console

### Test 4: Multiple Scans in History

1. **Scan 3-5 different items** in English
2. **Go to Dashboard**
3. **Change language to Amharic**
4. **Verify** all scans translate
5. **Click on each scan** and verify details are translated
6. **Change to Oromiffa**
7. **Verify** all scans translate again

## Expected Behavior

### ✅ What Should Happen

1. **Immediate Response**: Language change triggers translation within 1-2 seconds
2. **Complete Translation**: ALL text content translates (item name, material, steps, ideas)
3. **Visual Feedback**: "Analyzing..." indicator shows during translation
4. **No Errors**: No console errors or failed translations
5. **Caching**: Switching back to a previous language is instant (cached)
6. **Rate Limiting**: Translations are queued and rate-limited properly

### ❌ What Should NOT Happen

1. **Partial Translation**: Some fields remain in original language
2. **Mixed Languages**: English and Amharic mixed in same result
3. **Infinite Loops**: Continuous translation requests
4. **UI Freezing**: App becomes unresponsive during translation
5. **Lost Data**: Original scan data is lost or corrupted

## Troubleshooting

### Issue: Translation Not Working

**Symptoms**: Language changes but content stays in original language

**Solutions**:
1. Check browser console for errors
2. Verify Gemini API key is valid
3. Check rate limiter status (Performance Monitor in dev mode)
4. Verify internet connection
5. Check if rate limit is exceeded

### Issue: Partial Translation

**Symptoms**: Some fields translate, others don't

**Solutions**:
1. Check `translateScanResult()` function in `src/utils/gemini.js`
2. Verify all fields are included in translation prompt
3. Check API response in network tab
4. Verify sanitization isn't removing content

### Issue: Slow Translation

**Symptoms**: Takes more than 5 seconds to translate

**Solutions**:
1. Check rate limiter queue (Performance Monitor)
2. Verify API quota isn't exceeded
3. Check network speed
4. Consider upgrading Gemini API tier

### Issue: Translation Errors

**Symptoms**: Console shows translation errors

**Solutions**:
1. Check Gemini API quota
2. Verify API key is correct
3. Check rate limiter circuit breaker status
4. Review error messages in console

## Technical Details

### Translation Flow

```
User Changes Language
    ↓
useEffect Detects Change
    ↓
Check if Translation Needed
    ↓
Set Translating State (true)
    ↓
Call translateScanResult()
    ↓
Rate Limiter Queues Request
    ↓
Gemini API Translates Content
    ↓
Update Result/Scan State
    ↓
Set Translating State (false)
    ↓
UI Updates with Translated Content
```

### Caching Strategy

**Current Scan Result**:
- Stores `originalLanguage` and `translatedTo` in result object
- Checks before translating to avoid duplicates
- No persistent cache (resets on new scan)

**Scan History**:
- Caches translations in component state
- Key format: `${scanId}_${language}`
- Persists during component lifecycle
- Clears on page refresh

### Rate Limiting

- Translations use "normal" priority (scans use "high")
- Queued with 1.5s minimum delay between requests
- Automatic retry up to 3 times on failure
- Circuit breaker prevents cascade failures

## Performance Metrics

### Expected Performance

- **Single Translation**: 2-4 seconds
- **History (5 scans)**: 10-20 seconds (sequential)
- **Cache Hit**: < 100ms (instant)
- **Rate Limit Queue**: Adds 1.5s per request

### Optimization Tips

1. **Batch Translations**: Consider translating multiple scans in parallel
2. **Persistent Cache**: Store translations in IndexedDB
3. **Lazy Translation**: Only translate visible scans
4. **Debounce**: Delay translation if user rapidly switches languages

## API Usage

### Gemini API Calls

**Per Translation**:
- 1 API call per scan
- ~500-1000 tokens per request
- ~$0.00025 per translation (paid tier)

**Daily Usage (400 users)**:
- Scans: 6,000 requests/day
- Translations: ~2,000 requests/day (estimated)
- Total: ~8,000 requests/day
- Cost: ~$2/day = $60/month

## Success Criteria

### Translation is Working If:

1. ✅ All text content translates when language changes
2. ✅ Recycling steps translate (all steps, not just first)
3. ✅ Upcycling ideas translate (all ideas)
4. ✅ Material and item name translate
5. ✅ Scan history items translate
6. ✅ Modal details translate
7. ✅ No console errors
8. ✅ Visual feedback during translation
9. ✅ Caching works (instant on re-select)
10. ✅ Rate limiting prevents API overload

---

**Last Updated**: March 2026
**Version**: 1.0.0
