# ኢ - Scan Production Deployment Guide

## 🚀 Production-Ready Features

### 1. **Rate Limiting & Queue Management**
- Advanced queue system with priority handling
- Exponential backoff with jitter (prevents thundering herd)
- Circuit breaker pattern (auto-recovery after failures)
- Optimized for 400+ concurrent users
- 1.5s minimum delay between requests
- Automatic retry with 3 attempts max

### 2. **Caching Strategy**
- **Memory Cache**: LRU cache for 50 most recent items
- **IndexedDB**: Persistent storage for 7 days
- **Static Assets**: 1-year cache with immutable flag
- **HTML**: No cache, always revalidate
- Automatic cleanup of old entries

### 3. **Performance Optimizations**
- Code splitting (React, Firebase, UI vendors)
- Tree shaking and minification
- Console.log removal in production
- Lazy loading for images
- Web Vitals monitoring (FCP, LCP, FID, CLS)
- Bundle size optimization

### 4. **Security Measures**
- XSS prevention (input sanitization)
- SQL injection protection
- File upload validation (type, size)
- Firebase security rules with validation
- CSP headers
- Rate limiting per user

### 5. **Firebase Configuration**

#### Firestore Security Rules
```javascript
// Already configured in firestore.rules
- User isolation (users can only access their own data)
- Image size validation (max ~5MB base64)
- Data structure validation
- Rate limiting (max 20 writes per user per hour)
```

#### Firestore Indexes
```json
// firestore.indexes.json
{
  "indexes": [
    {
      "collectionGroup": "scans",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "userId", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    }
  ]
}
```

Deploy indexes:
```bash
firebase deploy --only firestore:indexes
```

#### Firebase Quotas (Free Tier)
- **Firestore Reads**: 50,000/day
- **Firestore Writes**: 20,000/day
- **Firestore Deletes**: 20,000/day
- **Storage**: 1 GB

**For 400 users:**
- 15 scans/user/day = 6,000 writes/day ✅
- Reading history = ~12,000 reads/day ✅
- Well within free tier limits

### 6. **Gemini AI Quotas**

#### Free Tier Limits
- **Requests per minute (RPM)**: 15
- **Requests per day (RPD)**: 1,500
- **Tokens per minute (TPM)**: 1,000,000

**For 400 users:**
- 15 scans/user/day = 6,000 requests/day
- **EXCEEDS FREE TIER** ❌

#### Solutions:
1. **Upgrade to Paid Tier** (Recommended)
   - Pay-as-you-go: $0.00025 per request
   - 6,000 requests/day = ~$1.50/day = $45/month
   
2. **Implement User Tiers**
   - Free: 5 scans/day
   - Premium: Unlimited scans
   
3. **Use Multiple API Keys**
   - Rotate between multiple free tier keys
   - Not recommended for production

### 7. **Scaling Strategy**

#### Current Setup (Free Tier)
- ✅ Up to 100 users comfortably
- ⚠️ 100-400 users: Need paid Gemini API
- ❌ 400+ users: Need infrastructure upgrade

#### Recommended Upgrades for 400+ Users

**Option A: Netlify + Firebase + Gemini Paid**
- Cost: ~$50-100/month
- Netlify: Free tier (100GB bandwidth)
- Firebase: Free tier sufficient
- Gemini: Pay-as-you-go (~$45/month)

**Option B: Add Backend Server**
- Deploy Node.js backend on Railway/Render
- Implement server-side rate limiting
- Queue management on server
- Cost: ~$20-50/month additional

**Option C: Enterprise Setup**
- Cloud Run/Lambda functions
- Redis for distributed caching
- Load balancer
- CDN (Cloudflare)
- Cost: ~$200-500/month

### 8. **Monitoring & Analytics**

#### Built-in Performance Monitoring
```javascript
import { getPerformanceReport } from './utils/performance';

// Get performance metrics
const report = getPerformanceReport();
console.log(report);
```

#### Recommended Tools
1. **Google Analytics 4** - User behavior
2. **Sentry** - Error tracking
3. **Firebase Performance Monitoring** - App performance
4. **Lighthouse CI** - Automated performance testing

### 9. **Deployment Checklist**

#### Before Deployment
- [ ] Update environment variables in Netlify
- [ ] Deploy Firebase security rules
- [ ] Deploy Firestore indexes
- [ ] Test with production API keys
- [ ] Run `npm run build` locally
- [ ] Check bundle size (`dist/stats.html`)
- [ ] Test on mobile devices
- [ ] Verify CSP headers

#### Environment Variables (Netlify)
```bash
VITE_FIREBASE_API_KEY=your_key
VITE_FIREBASE_AUTH_DOMAIN=your_domain
VITE_FIREBASE_PROJECT_ID=your_project
VITE_FIREBASE_STORAGE_BUCKET=your_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_GEMINI_API_KEY=your_gemini_key
```

#### Deploy Commands
```bash
# Install dependencies
npm install

# Build for production
npm run build

# Deploy to Netlify (if using CLI)
netlify deploy --prod

# Deploy Firebase rules
firebase deploy --only firestore:rules,firestore:indexes
```

### 10. **Performance Targets**

#### Web Vitals Goals
- **FCP** (First Contentful Paint): < 1.8s ✅
- **LCP** (Largest Contentful Paint): < 2.5s ✅
- **FID** (First Input Delay): < 100ms ✅
- **CLS** (Cumulative Layout Shift): < 0.1 ✅

#### Bundle Size Goals
- **Initial JS**: < 200KB (gzipped) ✅
- **Total Assets**: < 1MB ✅
- **Images**: Optimized to < 100KB each ✅

### 11. **Cost Estimation**

#### Scenario: 400 Active Users

**Monthly Costs:**
- Netlify: $0 (free tier, 100GB bandwidth)
- Firebase: $0 (within free tier)
- Gemini API: $45 (6,000 requests/day)
- Domain: $12/year = $1/month
- **Total: ~$46/month**

**Revenue Options:**
- AdSense: $50-200/month (depends on traffic)
- Premium tier: $2.99/month × 50 users = $150/month
- **Potential profit: $100-300/month**

### 12. **Backup & Recovery**

#### Automated Backups
```bash
# Export Firestore data
gcloud firestore export gs://your-bucket/backups/$(date +%Y%m%d)

# Schedule with cron (weekly)
0 0 * * 0 gcloud firestore export gs://your-bucket/backups/$(date +%Y%m%d)
```

#### Data Retention
- Scans: 7 days in cache, permanent in Firestore
- User profiles: Permanent
- Analytics: 14 months (GA4)

### 13. **Troubleshooting**

#### Common Issues

**1. Rate Limit Errors**
- Check queue status in browser console
- Verify rate limiter is working
- Consider upgrading Gemini API tier

**2. Slow Performance**
- Check bundle size in `dist/stats.html`
- Verify caching headers
- Use Lighthouse for diagnostics

**3. Firebase Quota Exceeded**
- Monitor usage in Firebase Console
- Implement pagination for history
- Add data cleanup for old scans

**4. High Costs**
- Optimize image compression
- Reduce API calls with caching
- Implement user tiers

### 14. **Maintenance Tasks**

#### Daily
- Monitor error rates (Sentry)
- Check API quota usage
- Review user feedback

#### Weekly
- Analyze performance metrics
- Review security logs
- Update dependencies (if needed)

#### Monthly
- Backup Firestore data
- Review costs and optimize
- Update documentation
- Security audit

### 15. **Support & Documentation**

#### User Support
- FAQ page (add to website)
- Email support: support@escan.com
- Response time: 24-48 hours

#### Developer Documentation
- API documentation
- Architecture diagrams
- Deployment procedures
- Troubleshooting guides

---

## 🎯 Quick Start Commands

```bash
# Development
npm install
npm run dev

# Production Build
npm run build
npm run preview

# Deploy
netlify deploy --prod
firebase deploy --only firestore:rules,firestore:indexes

# Monitor
npm run analyze  # View bundle size
```

## 📊 Success Metrics

- **Uptime**: > 99.9%
- **Response Time**: < 3s average
- **Error Rate**: < 0.1%
- **User Satisfaction**: > 4.5/5 stars

---

**Last Updated**: March 2026
**Version**: 1.0.0
**Maintainer**: ኢ - Scan Team
