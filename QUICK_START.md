# ኢ - Scan Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Install Bundle Analyzer (for production optimization)
```bash
npm install --save-dev rollup-plugin-visualizer
```

### Step 3: Configure Environment Variables
Create a `.env` file in the root directory:
```env
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_GEMINI_API_KEY=your_gemini_api_key
```

### Step 4: Deploy Firebase Rules
```bash
# Install Firebase CLI (if not installed)
npm install -g firebase-tools

# Login to Firebase
firebase login

# Deploy security rules
firebase deploy --only firestore:rules

# Deploy indexes
firebase deploy --only firestore:indexes
```

### Step 5: Run Development Server
```bash
npm run dev
```

Visit: http://localhost:3000

## 📦 Production Deployment

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

### Analyze Bundle Size
```bash
npm run analyze
```

### Deploy to Netlify

#### Option 1: Netlify CLI
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy
netlify deploy --prod
```

#### Option 2: Git Push (Recommended)
1. Push code to GitHub
2. Connect repository in Netlify
3. Configure build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Node version: 20
4. Add environment variables in Netlify dashboard
5. Deploy automatically on push

## 🔧 Configuration

### Netlify Environment Variables
Add these in: Site Settings → Environment Variables
```
VITE_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID
VITE_GEMINI_API_KEY
```

### Firebase Configuration
1. Create Firebase project: https://console.firebase.google.com
2. Enable Authentication (Email/Password)
3. Create Firestore database
4. Deploy security rules (see Step 4 above)

### Gemini API Configuration
1. Get API key: https://ai.google.dev
2. Enable Gemini API
3. Add to environment variables

## 🎯 Features Overview

### Rate Limiting
- Automatic queue management
- Exponential backoff
- Circuit breaker pattern
- Handles 400+ concurrent users

### Caching
- Memory cache (50 items)
- IndexedDB (7 days)
- Static asset caching (1 year)
- Automatic cleanup

### Performance
- Code splitting
- Tree shaking
- Minification
- Bundle size < 200KB

### Security
- XSS prevention
- Input sanitization
- File upload validation
- Firebase security rules
- CSP headers

### Offline Support
- Service worker
- Cache-first for assets
- Network-first for HTML
- Background sync ready

## 📊 Monitoring

### Development Mode
- Performance Monitor (bottom-right corner)
- Web Vitals tracking
- Rate limiter status
- Cache statistics

### Production Mode
- Netlify Analytics
- Firebase Console
- Gemini API Dashboard
- Browser DevTools

## 🐛 Troubleshooting

### Build Fails
```bash
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
npm run build
```

### Firebase Rules Error
```bash
firebase deploy --only firestore:rules --debug
```

### Rate Limit Issues
- Check browser console for queue status
- Verify Gemini API quota
- Consider upgrading to paid tier

### Performance Issues
```bash
npm run analyze
# Check dist/stats.html for bundle size
```

## 📚 Documentation

- **PRODUCTION_GUIDE.md**: Comprehensive production guide
- **DEPLOYMENT_CHECKLIST.md**: Step-by-step deployment
- **PRODUCTION_SUMMARY.md**: Implementation summary
- **RATE_LIMITING.md**: Rate limiting details
- **SECURITY.md**: Security measures

## 💡 Tips

1. **Development**: Use Performance Monitor to track metrics
2. **Testing**: Test on mobile devices and slow connections
3. **Optimization**: Run `npm run analyze` to check bundle size
4. **Monitoring**: Check Firebase and Gemini quotas daily
5. **Scaling**: Upgrade Gemini API when reaching 100+ users

## 🎉 You're Ready!

Your app is now configured and ready to deploy. Follow the deployment checklist for production launch.

**Need help?** Check the documentation files or open an issue.

---

**Version**: 1.0.0
**Last Updated**: March 2026
