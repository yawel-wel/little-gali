# Cookie Consent Implementation

## Overview

A GDPR-compliant cookie consent banner has been implemented for the Little Gali website. This is **legally required** because the site uses tracking technologies (Google Analytics and Meta Pixel) that collect personal data.

## Why This Is Necessary

### Legal Requirements

1. **GDPR (EU General Data Protection Regulation)**
   - Applies to ANY website that has EU visitors
   - Requires explicit consent BEFORE loading tracking scripts
   - Users must be able to decline non-essential cookies
   - Must provide clear information about data collection

2. **Meta Pixel & Google Analytics**
   - Both are tracking technologies that collect personal data
   - Cannot be loaded without user consent under GDPR
   - Violations can result in significant fines (up to €20 million or 4% of global revenue)

3. **Best Practices**
   - Transparency about data collection builds trust
   - Following regulations protects your business
   - Many countries have similar privacy laws

## Implementation Details

### Components Created

1. **`/src/components/cookie-consent.tsx`**
   - Main cookie consent banner component
   - Appears on first visit after 1 second delay
   - Saves user preference to localStorage
   - Triggers script loading on acceptance
   - Bilingual (Hebrew/English) support

2. **`/src/components/conditional-tracking-scripts.tsx`**
   - Client component that conditionally loads tracking scripts
   - Only loads Google Analytics and Meta Pixel if user has consented
   - Uses Next.js Script component for optimal loading

3. **`/src/app/privacy/page.tsx`**
   - Privacy policy page
   - Explains data collection and usage
   - Linked from cookie consent banner
   - Bilingual content

### Files Modified

1. **`/src/app/layout.tsx`**
   - Removed direct loading of Google Analytics and Meta Pixel
   - Added `<CookieConsent />` component
   - Added `<ConditionalTrackingScripts />` component
   - Scripts now only load after user consent

2. **`/src/lib/LanguageContext.tsx`**
   - Added translations for cookie consent banner
   - Hebrew: `cookieConsent.*`
   - English: `cookieConsent.*`

## How It Works

### User Flow

1. **First Visit**
   - User lands on the site
   - After 1 second, cookie consent banner appears at the bottom
   - No tracking scripts are loaded yet

2. **User Accepts**
   - Preference saved to localStorage: `little-gali-cookie-consent = "accepted"`
   - Page reloads to load tracking scripts
   - Google Analytics and Meta Pixel start tracking
   - Banner doesn't appear again

3. **User Declines**
   - Preference saved to localStorage: `little-gali-cookie-consent = "declined"`
   - No tracking scripts are loaded
   - Banner doesn't appear again
   - User can still use the site normally

4. **Return Visits**
   - Banner doesn't appear (preference already saved)
   - Tracking scripts load automatically if previously accepted
   - No tracking if previously declined

### Technical Implementation

```typescript
// Check consent status
const consent = localStorage.getItem("little-gali-cookie-consent");

if (consent === "accepted") {
  // Load Google Analytics
  // Load Meta Pixel
} else if (consent === "declined") {
  // Don't load any tracking
} else {
  // Show banner (no preference yet)
}
```

## Translations

### Hebrew
- Title: "עוגיות ומעקב"
- Description: "אנחנו משתמשים בעוגיות וכלי מעקב כמו Google Analytics ו-Meta Pixel כדי לשפר את חווית המשתמש שלך ולהבין טוב יותר איך משתמשים באתר. האם את/ה מסכימ/ה?"
- Accept: "מסכימ/ה"
- Decline: "לא מסכימ/ה"
- Learn More: "מדיניות פרטיות"

### English
- Title: "Cookies & Tracking"
- Description: "We use cookies and tracking tools like Google Analytics and Meta Pixel to improve your user experience and better understand how the site is used. Do you agree?"
- Accept: "Accept"
- Decline: "Decline"
- Learn More: "Privacy Policy"

## Compliance Features

✅ **Explicit Consent**: Users must take action before tracking starts
✅ **Clear Information**: Explains what tracking tools are used
✅ **Easy to Decline**: Decline option is equally prominent
✅ **Persistent Choice**: User's decision is remembered
✅ **Privacy Policy**: Link to detailed privacy information
✅ **No Pre-Checked Boxes**: True opt-in, not opt-out
✅ **Accessibility**: Proper ARIA labels and keyboard navigation

## Testing

### How to Test

1. **Clear localStorage**:
   ```javascript
   localStorage.removeItem('little-gali-cookie-consent');
   ```

2. **Refresh the page**: Banner should appear after 1 second

3. **Test Accept Flow**:
   - Click "Accept"
   - Page should reload
   - Check browser console - you should see GA and Meta Pixel loading
   - Refresh page - banner should not appear again

4. **Test Decline Flow**:
   - Clear localStorage again
   - Refresh page
   - Click "Decline"
   - Check browser console - no tracking scripts should load
   - Refresh page - banner should not appear again

### Verify Tracking Scripts

**Check if Google Analytics is loaded**:
```javascript
console.log(window.gtag); // Should be a function if loaded
console.log(window.dataLayer); // Should be an array if loaded
```

**Check if Meta Pixel is loaded**:
```javascript
console.log(window.fbq); // Should be a function if loaded
```

## Privacy Policy

A comprehensive privacy policy has been created at `/privacy` that includes:

- What data is collected
- How data is used
- Tracking tools used (Google Analytics, Meta Pixel)
- User rights (access, correction, deletion)
- Contact information
- Data security measures

## Customization

### Change Banner Appearance Delay

Edit `/src/components/cookie-consent.tsx`:
```typescript
setTimeout(() => {
  setShowBanner(true);
}, 1000); // Change to desired milliseconds
```

### Add More Tracking Tools

Edit `/src/components/conditional-tracking-scripts.tsx` and add your script inside the consent check:
```typescript
if (consent === "accepted") {
  // Add your tracking script here
}
```

### Modify Banner Text

Edit translations in `/src/lib/LanguageContext.tsx`:
```typescript
"cookieConsent.description": "Your custom text here",
```

## Important Notes

⚠️ **Do Not Remove**: This cookie consent is legally required due to GDPR and similar privacy regulations.

⚠️ **Keep Updated**: If you add new tracking tools, update:
1. The cookie consent description
2. The privacy policy
3. The conditional tracking scripts

⚠️ **Testing Environment**: The consent requirement applies to production. For development, you may want to bypass it.

## Resources

- [GDPR Official Text](https://gdpr-info.eu/)
- [Google Analytics & GDPR](https://support.google.com/analytics/answer/9019185)
- [Meta Pixel & Privacy](https://developers.facebook.com/docs/meta-pixel/implementation/gdpr)
- [Cookie Consent Guide](https://gdpr.eu/cookies/)

## Support

For questions about the cookie consent implementation, contact the development team or refer to this documentation.
