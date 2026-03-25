# ኢ - Scan Deployment Checklist

## Pre-Deployment Steps

### 1. Environment Setup
- [ ] Create `.env` file with all required variables
- [ ] Verify Firebase project is created
- [ ] Verify Gemini API key is active
- [ ] Test all API keys locally

### 2. Firebase Configuration
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize project (if not done)
firebase init

# Deploy security rules
firebase deploy --only firestore:rules

# Deploy indexes
firebase deploy --only firestore:indexes
```

### 3. Build & Test
```bash
# Install dependencies
npm install

# Add bundle analyzer
npm install --save-dev rollup-plugin-visualizer

# Build for production
npm run build

# Preview production build
npm run preview

# Analyze bundle size
npm run analyze
```

### 4. Netlify Setup
- [ ] Create Netlify account
- [ ] Connect GitHub repository
- [ ] Configure build settings:
  - Build command: `npm run build`
  - Publish directory: `dist`
  - Node version: 20

### 5. Environment Variables (Netlify)
Add these in Netlify Dashboard → Site Settings → Environment Variables:
```
VITE_FIREBASE_API_KEY=your_key
VITE_FIREBASE_AUTH_DOMAIN=your_domain
VITE_FIREBASE_PROJECT_ID=your_project
VITE_FIREBASE_STORAGE_BUCKET=your_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_GEMINI_API_KEY=your_gemini_key
```

### 6. Security Verification
- [ ] Test Firebase security rules
- [ ] Verify CSP headers are working
- [ ] Test XSS prevention
- [ ] Verify file upload limits
- [ ] Test rate limiting

### 7. Performance Testing
- [ ] Run Lighthouse audit (target: 90+ score)
- [ ] Test on mobile devices
- [ ] Verify caching is working
- [ ] Check bundle size (< 200KB gzipped)
- [ ] Test with slow 3G connection

### 8. Functionality Testing
- [ ] User registration/login
- [ ] Image upload
- [ ] Camera capture
- [ ] AI analysis
- [ ] Translation (all 3 languages)
- [ ] Scan history
- [ ] Delete scans
- [ ] Dark/light mode
- [ ] Language switching

## Deployment Commands

### Option 1: Netlify CLI
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy to production
netlify deploy --prod
```

### Option 2: Git Push (Recommended)
```bash
# Commit changes
git add .
git commit -m "Production ready"

# Push to main branch
git push origin main

# Netlify will auto-deploy
```

## Post-Deployment Steps

### 1. Verify Deployment
- [ ] Visit production URL
- [ ] Test all features
- [ ] Check console for errors
- [ ] Verify service worker is registered
- [ ] Test offline functionality

### 2. Monitor Performance
- [ ] Check Netlify analytics
- [ ] Monitor Firebase usage
- [ ] Check Gemini API quota
- [ ] Review error logs

### 3. Set Up Monitoring
```bash
# Optional: Add Sentry for error tracking
npm install @sentry/react

# Optional: Add Google Analytics
# Add GA4 tracking code to index.html
```

### 4. Configure Custom Domain (Optional)
- [ ] Purchase domain
- [ ] Add domain in Netlify
- [ ] Configure DNS records
- [ ] Enable HTTPS (automatic with Netlify)

## Scaling Checklist (400+ Users)

### Immediate Actions
- [ ] Upgrade Gemini API to paid tier
- [ ] Monitor Firebase quotas daily
- [ ] Set up alerts for quota limits
- [ ] Implement user tiers (free/premium)

### Performance Optimizations
- [ ] Enable Netlify Analytics
- [ ] Set up CDN for images
- [ ] Implement lazy loading
- [ ] Add image compression
- [ ] Enable HTTP/2 push

### Cost Management
- [ ] Set up billing alerts
- [ ] Monitor API usage
- [ ] Optimize API calls
- [ ] Implement caching strategy
- [ ] Consider backend server for queue

## Troubleshooting

### Build Fails
```bash
# Clear cache
rm -rf node_modules package-lock.json
npm install

# Check Node version
node --version  # Should be 20+

# Try legacy peer deps
npm install --legacy-peer-deps
```

### Firebase Rules Error
```bash
# Validate rules locally
firebase deploy --only firestore:rules --debug

# Check rules in Firebase Console
# Firestore → Rules → Test rules
```

### Rate Limit Issues
- Check queue status in browser console
- Verify rate limiter is working
- Consider upgrading API tier
- Implement user-side caching

### Performance Issues
- Run Lighthouse audit
- Check bundle size
- Verify caching headers
- Test on different devices
- Use Performance Monitor (dev mode)

## Maintenance Schedule

### Daily
- [ ] Check error logs
- [ ] Monitor API quota
- [ ] Review user feedback

### Weekly
- [ ] Analyze performance metrics
- [ ] Review security logs
- [ ] Update dependencies (if needed)
- [ ] Backup Firestore data

### Monthly
- [ ] Security audit
- [ ] Performance optimization
- [ ] Cost analysis
- [ ] Feature planning

## Emergency Contacts

- Firebase Support: https://firebase.google.com/support
- Netlify Support: https://www.netlify.com/support
- Gemini API Support: https://ai.google.dev/support

## Success Metrics

### Performance Targets
- Lighthouse Score: > 90
- FCP: < 1.8s
- LCP: < 2.5s
- FID: < 100ms
- CLS: < 0.1

### Business Metrics
- User Retention: > 40%
- Daily Active Users: Track growth
- Scan Success Rate: > 95%
- Error Rate: < 0.1%

## Rollback Plan

If deployment fails:
```bash
# Revert to previous deployment (Netlify)
netlify rollback

# Or redeploy previous commit
git revert HEAD
git push origin main
```

---

**Last Updated**: March 2026
**Version**: 1.0.0
**Status**: Production Ready ✅
