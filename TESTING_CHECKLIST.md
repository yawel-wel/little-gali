# Cookie Consent Testing Checklist

## ✅ Pre-Deployment Checklist

Before deploying to production, verify the following:

### 1. Environment Variables
- [ ] `NEXT_PUBLIC_META_PIXEL_ID` is set in your environment
- [ ] Google Analytics ID is `G-7NHYLBNE1J` (already hardcoded)

### 2. Files Created
- [ ] `/src/components/cookie-consent.tsx` exists
- [ ] `/src/components/conditional-tracking-scripts.tsx` exists
- [ ] `/src/app/privacy/page.tsx` exists

### 3. Files Modified
- [ ] `/src/app/layout.tsx` updated (tracking scripts removed from head)
- [ ] `/src/lib/LanguageContext.tsx` has cookie consent translations

### 4. Visual Check
- [ ] Banner appears at bottom of screen
- [ ] Banner has two buttons: Accept and Decline
- [ ] Banner text is in correct language (Hebrew/English)
- [ ] Banner has link to privacy policy
- [ ] Banner has nice animation when appearing

## 🧪 Testing Steps

### Test 1: First Visit (No Consent Yet)
```javascript
// In browser console:
localStorage.removeItem('little-gali-cookie-consent');
// Then refresh the page
```

**Expected:**
- [ ] Page loads normally
- [ ] After 1 second, banner slides up from bottom
- [ ] Banner text is clear and readable
- [ ] Both buttons are visible
- [ ] "Privacy Policy" link is visible
- [ ] Check console - NO tracking scripts should load yet
- [ ] Check: `window.gtag` should be `undefined`
- [ ] Check: `window.fbq` should be `undefined`

### Test 2: Accept Tracking
With banner visible:

**Action:** Click "Accept" (מסכימ/ה) button

**Expected:**
- [ ] Banner disappears with animation
- [ ] Page reloads automatically
- [ ] After reload, banner does NOT appear again
- [ ] Check console: `window.gtag` should be a function
- [ ] Check console: `window.fbq` should be a function
- [ ] Check console: You should see Google Analytics loading
- [ ] Check console: You should see Meta Pixel loading
- [ ] Check localStorage: `little-gali-cookie-consent` = "accepted"

### Test 3: Decline Tracking
```javascript
// Reset first:
localStorage.removeItem('little-gali-cookie-consent');
// Refresh page, wait for banner
```

**Action:** Click "Decline" (לא מסכימ/ה) button

**Expected:**
- [ ] Banner disappears with animation
- [ ] Page does NOT reload
- [ ] Check console: `window.gtag` should be `undefined`
- [ ] Check console: `window.fbq` should be `undefined`
- [ ] No tracking scripts should load
- [ ] Check localStorage: `little-gali-cookie-consent` = "declined"
- [ ] Refresh page - banner should NOT appear again

### Test 4: Privacy Policy
**Action:** Click "Privacy Policy" link in banner

**Expected:**
- [ ] Navigates to `/privacy` page
- [ ] Privacy policy loads correctly
- [ ] Content is in correct language
- [ ] Header and footer are present
- [ ] All sections are readable

### Test 5: Language Switch
**Action:** 
1. Clear localStorage
2. View banner in Hebrew
3. Switch to English
4. View banner in English

**Expected:**
- [ ] Banner text changes to English
- [ ] All button text is translated
- [ ] Privacy policy link text is translated
- [ ] Switching back to Hebrew works correctly

### Test 6: Mobile Responsive
**Action:** Test on mobile device or use browser dev tools

**Expected:**
- [ ] Banner fits screen width
- [ ] Text is readable on small screens
- [ ] Buttons are clickable (not too small)
- [ ] Banner doesn't block important content
- [ ] Animation works smoothly on mobile

### Test 7: Return Visitor (Already Accepted)
```javascript
// Set consent as if user already accepted:
localStorage.setItem('little-gali-cookie-consent', 'accepted');
// Refresh page
```

**Expected:**
- [ ] Banner does NOT appear
- [ ] Tracking scripts load automatically
- [ ] Check console: `window.gtag` is a function
- [ ] Check console: `window.fbq` is a function
- [ ] Site works normally

### Test 8: Return Visitor (Already Declined)
```javascript
// Set consent as if user already declined:
localStorage.setItem('little-gali-cookie-consent', 'declined');
// Refresh page
```

**Expected:**
- [ ] Banner does NOT appear
- [ ] Tracking scripts do NOT load
- [ ] Check console: `window.gtag` is undefined
- [ ] Check console: `window.fbq` is undefined
- [ ] Site works normally (no tracking)

## 🔍 Advanced Testing

### Check Network Requests
1. Open browser DevTools → Network tab
2. Refresh page with accepted consent
3. Look for:
   - [ ] Request to `googletagmanager.com/gtag/js`
   - [ ] Request to `facebook.net/fbevents.js`

### Check Analytics Events
1. Accept cookies
2. Navigate around the site
3. Check browser console for analytics events
4. Verify events are being tracked

### Browser Compatibility
Test on:
- [ ] Chrome/Edge (Desktop)
- [ ] Firefox (Desktop)
- [ ] Safari (Desktop)
- [ ] Chrome (Mobile)
- [ ] Safari (iOS)

## ⚠️ Common Issues & Solutions

### Issue: Banner doesn't appear
**Solution:**
```javascript
localStorage.removeItem('little-gali-cookie-consent');
// Then hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
```

### Issue: Tracking loads without consent
**Check:**
- Are scripts in `<head>` of layout.tsx? (They shouldn't be)
- Is `ConditionalTrackingScripts` component present?
- Check console for errors

### Issue: Translations not working
**Check:**
- LanguageContext.tsx has all translations
- `t()` function is being called correctly
- Language is properly set

### Issue: Banner shows even after accepting
**Check:**
- localStorage value is exactly "accepted" (not "Accepted" or " accepted ")
- No JavaScript errors in console
- Browser allows localStorage

## 📊 Success Criteria

All of the following should be true:

✅ Banner appears only on first visit
✅ Accept button loads tracking scripts
✅ Decline button blocks tracking scripts  
✅ User choice persists across sessions
✅ Privacy policy is accessible and complete
✅ Works in both Hebrew and English
✅ Mobile responsive
✅ No console errors
✅ Tracking only works after consent
✅ Site works perfectly with or without tracking

## 🚀 Ready for Production

Once all tests pass:
1. Commit changes to version control
2. Deploy to production
3. Test on live site
4. Monitor for any issues

## 📝 Notes for Future

- If you add new tracking tools, update:
  1. Cookie consent description
  2. Privacy policy page
  3. ConditionalTrackingScripts component
  
- Keep privacy policy updated with:
  1. New data collection methods
  2. New third-party services
  3. Changes to data usage

## 🆘 Need Help?

Refer to:
- `COOKIE_CONSENT.md` - Technical documentation
- `IMPLEMENTATION_SUMMARY.md` - Overview of what was done
- This file - Testing procedures

---

**Date Created:** February 21, 2026
**Last Updated:** February 21, 2026
