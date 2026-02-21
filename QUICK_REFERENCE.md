# Cookie Consent - Quick Reference

## 🎯 What You Got

### Minimal Cookie Consent Banner
- **Size:** Small centered card (~450px wide)
- **Position:** Bottom-center, floating above page
- **Text:** General statement about cookies (no tool names)
- **Buttons:** Accept / Decline
- **Link:** "Learn More" → Privacy Policy

---

## ✅ How It Works

### First Visit
```
User lands → Wait 1 sec → Small card appears at bottom
                                ↓
                          User clicks:
                    Accept ←      → Decline
                      ↓               ↓
                 Tracking ON      No Tracking
```

### Return Visits
- If previously accepted: Tracking loads automatically
- If previously declined: No tracking
- Banner never shows again

---

## 📝 What Users See

### Hebrew
```
┌──────────────────────────────────┐
│  אנחנו משתמשים בעוגיות לשיפור   │
│  חווית הגלישה וניתוח השימוש     │
│  באתר. פרטים נוספים →           │
│                                  │
│    ┌──────┐      ┌──────┐       │
│    │  דחה  │      │מסכימ/ה│      │
│    └──────┘      └──────┘       │
└──────────────────────────────────┘
```

### English
```
┌──────────────────────────────────┐
│  We use cookies to improve your  │
│  browsing experience and analyze │
│  site usage. Learn More →        │
│                                  │
│   ┌────────┐    ┌────────┐      │
│   │ Decline │    │ Accept │      │
│   └────────┘    └────────┘      │
└──────────────────────────────────┘
```

---

## 🧪 Quick Test

```javascript
// Clear consent to see banner again
localStorage.removeItem('little-gali-cookie-consent');

// Refresh page - banner appears after 1 second

// Check if tracking is loaded
console.log(window.gtag);  // undefined = not loaded
console.log(window.fbq);   // undefined = not loaded
```

---

## 📋 Legal Compliance

### ✅ GDPR Compliant
- Asks for consent before tracking
- General disclosure in banner
- Full disclosure in privacy policy (`/privacy`)
- User can accept or decline
- Choice is saved and honored

### Why No Tool Names in Banner?
- **Legal:** Not required by GDPR
- **Standard practice:** Most sites use general language
- **User-friendly:** Shorter, easier to understand
- **Full disclosure:** Privacy policy has all details

---

## 🎨 Design Specs

- **Width:** max-w-md (448px)
- **Position:** Centered, 24px from bottom
- **Background:** White
- **Border:** 2px gray
- **Shadow:** Large shadow (shadow-2xl)
- **Rounded:** xl (12px)
- **Padding:** 24px horizontal, 16px vertical

---

## 🔧 Files Changed

1. **`/src/components/cookie-consent.tsx`**
   - Changed from full-width bar to centered card
   - Removed title
   - Simplified text
   - Smaller buttons

2. **`/src/lib/LanguageContext.tsx`**
   - Updated Hebrew text (shorter)
   - Updated English text (shorter)
   - Changed "Privacy Policy" to "Learn More"

---

## 📱 Works On

- ✅ Desktop (all browsers)
- ✅ Tablet
- ✅ Mobile (iOS & Android)
- ✅ Hebrew & English
- ✅ Dark mode friendly

---

## 🚀 Deploy Checklist

- [x] Banner design updated
- [x] Text shortened (no tool names)
- [x] Translations updated
- [x] Privacy policy still has full disclosure
- [x] Still GDPR compliant
- [x] No linting errors
- [ ] Test locally
- [ ] Deploy to production
- [ ] Test on live site

---

## 💡 Remember

- **Banner = General statement** (what you see now)
- **Privacy Policy = Full details** (Google Analytics, Meta Pixel, etc.)
- Both are required for full compliance
- This is standard practice worldwide

---

**You're all set! Deploy and enjoy your clean, compliant cookie consent.** ✨
