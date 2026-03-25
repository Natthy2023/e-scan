# Security Policy

## Overview

ኢ - Scan takes security seriously. This document outlines the security measures implemented in the application.

## Security Features

### 1. Cross-Site Scripting (XSS) Prevention

- **Input Sanitization**: All user inputs are sanitized using custom security utilities
- **HTML Escaping**: Special characters are escaped to prevent script injection
- **Script Removal**: Dangerous tags (`<script>`, `<iframe>`, `<object>`, `<embed>`) are automatically removed
- **Event Handler Blocking**: Inline event handlers (onclick, onerror, etc.) are stripped

### 2. SQL Injection Prevention

- **Firebase Firestore**: Uses NoSQL database which is not vulnerable to traditional SQL injection
- **Parameterized Queries**: All database queries use Firebase's built-in parameterization
- **User ID Validation**: All user IDs are validated against Firebase UID format
- **Input Validation**: All inputs are validated before database operations

### 3. Content Security Policy (CSP)

Implemented via Netlify headers:
- Restricts script sources to trusted domains
- Blocks inline scripts except where necessary for third-party integrations
- Prevents loading resources from untrusted sources
- Enforces HTTPS for all connections

### 4. Security Headers

- **X-Frame-Options**: DENY - Prevents clickjacking attacks
- **X-Content-Type-Options**: nosniff - Prevents MIME type sniffing
- **X-XSS-Protection**: Enables browser XSS filtering
- **Referrer-Policy**: Controls referrer information
- **Permissions-Policy**: Restricts access to sensitive browser features

### 5. File Upload Security

- **File Type Validation**: Only JPEG, PNG, and WebP images allowed
- **File Size Limits**: Maximum 10MB per upload
- **MIME Type Checking**: Validates actual file content, not just extension
- **Image Compression**: Reduces file size before processing

### 6. Rate Limiting

- **Client-Side Rate Limiting**: Prevents abuse of API endpoints
- **Configurable Limits**: 5 attempts per 60 seconds by default
- **Automatic Blocking**: Temporary blocks after exceeding limits

### 7. Authentication Security

- **Firebase Authentication**: Industry-standard authentication
- **Secure Token Management**: JWT tokens with automatic refresh
- **Session Management**: Secure session handling via Firebase
- **Protected Routes**: Authentication required for sensitive operations

### 8. Data Privacy

- **User Data Isolation**: Each user can only access their own data
- **Firestore Security Rules**: Server-side access control
- **No PII Logging**: Personal information is never logged
- **Secure API Keys**: Environment variables for sensitive data

## Security Utilities

### `src/utils/security.js`

Provides the following functions:

- `sanitizeHTML(input)` - Escapes HTML special characters
- `removeScripts(input)` - Removes dangerous scripts and tags
- `isValidUserId(userId)` - Validates Firebase UID format
- `validateImageFile(file)` - Validates image uploads
- `sanitizeObject(obj)` - Recursively sanitizes objects
- `checkRateLimit(key, maxAttempts, windowMs)` - Rate limiting

## Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Scans can only be accessed by the owner
    match /scans/{scanId} {
      allow read, delete: if request.auth != null && 
        request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && 
        request.auth.uid == request.resource.data.userId;
      allow update: if request.auth != null && 
        request.auth.uid == resource.data.userId;
    }
  }
}
```

## Environment Variables

Never commit these to version control:

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_GEMINI_API_KEY`

## Reporting Security Issues

If you discover a security vulnerability, please email: [your-email@example.com]

**Do not** create public GitHub issues for security vulnerabilities.

## Security Checklist for Deployment

- [ ] All environment variables are set in Netlify
- [ ] Firestore security rules are deployed
- [ ] CSP headers are configured
- [ ] HTTPS is enforced
- [ ] API keys are rotated regularly
- [ ] Dependencies are up to date
- [ ] Security headers are verified
- [ ] Rate limiting is tested
- [ ] File upload validation is working
- [ ] Authentication flows are secure

## Best Practices

1. **Keep Dependencies Updated**: Regularly update npm packages
2. **Monitor Logs**: Check for suspicious activity
3. **Rotate API Keys**: Change API keys periodically
4. **Review Code**: Conduct security code reviews
5. **Test Security**: Perform regular security testing
6. **Educate Users**: Inform users about security best practices

## Compliance

This application follows:
- OWASP Top 10 security guidelines
- Firebase security best practices
- Web security standards (CSP, CORS, etc.)

## Updates

This security policy is reviewed and updated regularly. Last updated: 2026-03-25
