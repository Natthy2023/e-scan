# ኢ - Scan

An AI-powered recycling assistant for Ethiopia that helps users identify waste items, learn how to recycle them correctly, and discover creative upcycling ideas — available in English, Amharic, and Oromiffa.

## Features

- 🤖 AI-powered waste identification using Gemini 2.5 Flash
- ♻️ Instant recyclability analysis with multi-language support
- 📝 Step-by-step recycling instructions
- 💡 Creative upcycling ideas
- 🌍 Multi-language support (English, Amharic, Oromiffa)
- 📊 Personal impact dashboard with CO₂ tracking
- 🗑️ Scan history with delete functionality
- 📸 Camera capture with image preview
- 🌓 Dark/Light mode
- 📱 Mobile-first responsive design
- 💾 Cloud-synced scan history with images
- 🇪🇹 Ethiopian environmental themes and colors

## Tech Stack

- **Frontend**: React 19 + Vite + Tailwind CSS
- **AI**: Google Gemini 2.5 Flash (free tier)
- **Auth & Database**: Firebase (Spark plan - free)
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Monetization**: Google AdSense

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a \`.env\` file in the root directory:

```env
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_GEMINI_API_KEY=your_gemini_api_key
\`\`\`

### 3. Firebase Setup

1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable Authentication (Google & Email/Password)
3. Create a Firestore database
4. Add your web app and copy the config values to \`.env\`

### 4. Gemini API Setup

1. Get a free API key from [ai.google.dev](https://ai.google.dev)
2. Add it to your \`.env\` file

### 5. Google AdSense Setup

1. Apply for AdSense at [google.com/adsense](https://www.google.com/adsense)
2. Once approved, replace \`ca-pub-XXXXXXXX\` in \`index.html\` with your publisher ID
3. Update ad slot IDs in \`AdBanner\` components

### 6. Run Development Server

```bash
npm run dev
```

### 7. Build for Production

```bash
npm run build
```

## Deployment

### Netlify (Recommended)

1. Push your code to GitHub
2. Import project in Netlify
3. Configure build settings:
   - Build command: ```npm run build```
   - Publish directory: ```dist```
   - Node version: 20
4. Add environment variables in Netlify dashboard
5. Deploy

The ```netlify.toml``` file is already configured with:
- Security headers (CSP, XSS protection, etc.)
- Redirects for SPA routing
- Cache optimization
- Node.js 20 specification

### Firebase Hosting

```bash
npm install -g firebase-tools
firebase login
firebase init hosting
npm run build
firebase deploy
```

## Firestore Security Rules

Add these rules in Firebase Console:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    match /scans/{scanId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null;
    }
  }
}
```

## Usage

1. Sign in with Google or Email
2. Navigate to Scan page
3. Upload or capture a photo of waste item
4. View AI analysis with recycling steps and upcycling ideas
5. Track your impact on the Dashboard

## Revenue Model

The app uses Google AdSense display ads placed strategically:
- Bottom of landing page
- Below scan results
- Dashboard sidebar

Ads are non-intrusive and the app remains fully functional without them.

## License

MIT

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.


## Security

This application implements comprehensive security measures:

- **XSS Prevention**: Input sanitization and HTML escaping
- **SQL Injection Prevention**: Parameterized queries and input validation  
- **Content Security Policy**: Strict CSP headers via Netlify
- **File Upload Security**: Type and size validation (max 10MB, JPEG/PNG/WebP only)
- **Rate Limiting**: Client-side rate limiting for API calls
- **Authentication**: Firebase Authentication with secure token management
- **Data Privacy**: User data isolation with Firestore security rules
- **Security Headers**: X-Frame-Options, X-Content-Type-Options, X-XSS-Protection

See [SECURITY.md](SECURITY.md) for detailed security documentation.

## Node.js Version

This project requires Node.js 20 or higher. The version is specified in:
- `package.json` (engines field)
- `.nvmrc` file
- `netlify.toml` (build environment)

To use the correct Node version with nvm:
```bash
nvm use
```

## Translation System

The app features a comprehensive multi-language system:
- All UI text translates instantly when language changes
- AI-generated scan results are automatically translated using Gemini AI
- Translations are cached for performance
- Supports English, Amharic (አማርኛ), and Oromiffa (Afaan Oromoo)

## Rate Limiting Solution

The app implements advanced rate limiting to prevent "Too many requests" errors:

- **Request Queue System**: All API requests are queued and processed sequentially
- **Automatic Rate Limiting**: Minimum 2-second delay between requests
- **Exponential Backoff**: Automatic retry with exponential backoff (5s, 10s, 20s)
- **Priority System**: High priority for scans, normal priority for translations
- **Visual Feedback**: Rate limit indicator shows queue status
- **Smart Retries**: Up to 3 automatic retries on rate limit errors

See [RATE_LIMITING.md](RATE_LIMITING.md) for detailed documentation.

### Handling Rate Limits

The system automatically:
1. Queues requests to prevent simultaneous API calls
2. Adds delays between requests (2 seconds minimum)
3. Retries failed requests with exponential backoff
4. Shows visual feedback during processing
5. Prioritizes user-initiated scans over background translations
