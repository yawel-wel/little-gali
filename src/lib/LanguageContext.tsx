"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

export type Locale = "he" | "en";

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
  mounted: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);

  // Initialize locale from localStorage immediately to avoid flash of wrong language
  const [locale, setLocaleState] = useState<Locale>(() => {
    if (typeof window !== "undefined") {
      const savedLocale = localStorage.getItem("locale") as Locale;
      if (savedLocale === "he" || savedLocale === "en") {
        return savedLocale;
      }
    }
    return "he";
  });

  // Mark as mounted and ensure HTML attributes are set
  useEffect(() => {
    setMounted(true);
    // Set HTML attributes immediately on mount
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === "he" ? "rtl" : "ltr";
    document.documentElement.setAttribute("data-locale", locale);
  }, []);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem("locale", newLocale);
    // Update HTML lang and dir attributes
    document.documentElement.lang = newLocale;
    document.documentElement.dir = newLocale === "he" ? "rtl" : "ltr";
    document.documentElement.setAttribute("data-locale", newLocale);
  };

  // Update HTML attributes when locale changes
  useEffect(() => {
    if (mounted) {
      document.documentElement.lang = locale;
      document.documentElement.dir = locale === "he" ? "rtl" : "ltr";
      document.documentElement.setAttribute("data-locale", locale);
    }
  }, [locale, mounted]);

  // Translation function
  const t = (key: string): string => {
    const translations =
      locale === "he" ? hebrewTranslations : englishTranslations;
    return translations[key as keyof typeof translations] || key;
  };

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t, mounted }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}

// Translation objects
const hebrewTranslations = {
  // Navigation
  "nav.home": "בית",
  "nav.about": "אודותינו",
  "nav.giftCard": "גיפט קארד",
  "nav.qa": "שאלות ותשובות",
  "nav.inspiration": "השראה",
  "nav.contact": "צור קשר",
  "nav.createBook": "צרו ספרון",
  "nav.menuAriaLabel": "תפריט ניווט ראשי",
  "nav.mainNavAriaLabel": "ניווט ראשי",
  "nav.createBookAriaLabel": "עבור לעמוד יצירת ספרון",

  // Accessibility
  "accessibility.skipToMain": "דלג לתוכן הראשי",

  // Top Banner
  "banner.shipping": "משלוחים לכל הארץ",

  // Cart
  "cart.title": "עגלת הקניות",
  "cart.titleHighlight": "עגלה",
  "cart.empty": "העגלה שלך ריקה",
  "cart.total": "סה״כ:",
  "cart.checkout": "המשך לתשלום",
  "cart.viewFull": "צפה בעגלה המלאה",
  "cart.loading": "טוען...",
  "cart.removeItem": "הסרת פריט מהעגלה",
  "cart.removeConfirm": "האם אתה בטוח שברצונך להסיר את הספר מהעגלה?",
  "cart.remove": "הסר",
  "cart.cancel": "ביטול",
  "cart.quantity": "כמות:",
  "cart.itemTotal": "סה״כ לפריט:",
  "cart.style": "סגנון:",
  "cart.colorStyle": "סגנון צבעוני:",
  "cart.style.cartoon": "קריקטורה",
  "cart.style.pencil": "עיפרון",
  "cart.style.watercolor": "צבעי מים",
  "cart.book": "ספר נייר",
  "cart.orderSummary": "סיכום הזמנה",
  "cart.itemsCount": "כמות פריטים:",
  "cart.deliveryTime": "זמן אספקה - עד 14 ימי עסקים",
  "cart.shareConsent": "אפשר לשתף את הספרון שלי בעמוד של ליטל גלי כהשראה",
  "cart.shareConsentNote": "בלי שמות או פרטים מזהים",
  "cart.addGiftMessage": "הוסף ברכה למתנה",
  "cart.giftMessagePlaceholder": "הכניסו את הברכה שלכם (עד 200 אותיות)",
  "cart.readyMessage": "הודעה תשלח כשהספרון מוכן בשביל תיאום משלוח",
  "cart.checkoutProgress": "מעבר לתשלום...",
  "cart.addBook": "הוסף ספרון",
  "cart.secondBook": "כל ספרון שני ב-99 ₪ 🎉",
  "cart.discountNote": "* ההנחה מתעדכנת אוטומטית בעמוד התשלום",
  "cart.startCreating": "התחל ליצור ספרון מותאם אישית",
  "cart.giftCardTitle": "גיפט קארד",
  "cart.createBook": "צרו ספרון",

  // Inspiration Page
  "inspiration.title": "השראה לספרונים",
  "inspiration.titleHighlight": "השראה",
  "inspiration.subtitle":
    "צפו בדוגמאות לסוגי ספרונים כדי לעזור לכם לבחור תמונות וליצור ספרון משלכם",
  "inspiration.colorful": "צבעוני",
  "inspiration.blackWhite": "שחור לבן",
  "inspiration.switchToBlackWhite": "החלף לצד שחור לבן",
  "inspiration.switchToColorful": "החלף לצד צבעוני",
  "inspiration.card1.title": "ספרון משפחה גרעינית",
  "inspiration.card1.description":
    "הפנים הקרובות ביותר לתינוק – אמא, אבא, ואולי גם אח, אחות או הכלב המשפחתי. הספרון שמעניק לו תחושת רוגע וחיבור למשפחה",
  "inspiration.card2.title": "הכירו את שאר המשפחה",
  "inspiration.card2.description":
    "סבים, סבתות, דודים, בני דודים – כל מי שאוהב ומכיר את התינוק. דרך מתוקה לעודד היכרות וחיבור גם מרחוק",
  "inspiration.card3.title": "ספר תינוקי",
  "inspiration.card3.description":
    "רגעים שונים של התינוק עצמו – חיוך, פליאה, מבט סקרן. ספרון אישי ופשוט שמרתק כל תינוק",
  "inspiration.cta": "התחילו ליצור את הספרון שלכם",

  // Terms of Service
  "terms.title": "תנאי השירות",
  "terms.intro":
    "ברוכים הבאים לאתר Little Gali. השימוש באתר והשירותים הניתנים בו כפופים לתנאים המפורטים להלן. בעת גלישה באתר וביצוע הזמנה, אתם מאשרים כי קראתם והסכמתם לתנאים אלה במלואם.",
  "terms.useOfSite.title": "שימוש באתר",
  "terms.useOfSite.p1":
    "האתר מאפשר הזמנת ספרונים אישיים לתינוקות המבוססים על תמונות שהמשתמש מעלה. השימוש באתר מותר למטרות אישיות ופרטיות בלבד.",
  "terms.useOfSite.p2":
    "חל איסור להשתמש באתר למטרות מסחריות שאינן באישורנו, להעלות תוכן פוגעני, לא חוקי, או תמונות שאינן בבעלות המשתמש.",
  "terms.userResponsibility.title": "אחריות המשתמש",
  "terms.userResponsibility.p1":
    "המשתמש מצהיר כי יש לו זכויות מלאות על התמונות שהוא מעלה, וכי השימוש בהן לצורך הפקת הספרון אינו מפר זכויות יוצרים, פרטיות או כל דין אחר.",
  "terms.userResponsibility.p2":
    "המשתמש מאשר כי לא יעלה תמונות של קטינים או צדדים שלישיים ללא הסכמתם, וכי כל האחריות המשפטית בגין התוכן שהועלה חלה עליו בלבד.",
  "terms.ordersAndPayment.title": "הזמנות ותשלום",
  "terms.ordersAndPayment.p1":
    "המחירים באתר מוצגים במטבע המצוין בעמוד ההזמנה וכוללים מע״מ בהתאם לחוק. התשלום מתבצע באמצעות מערכת סליקה מאובטחת, וההזמנה תיחשב סופית לאחר אישור התשלום.",
  "terms.ordersAndPayment.p2":
    "החברה שומרת לעצמה את הזכות לבטל הזמנה במקרה של טעות במחיר, תקלה טכנית, חוסר זמינות או שימוש שאינו תקין באתר.",
  "terms.productProduction.title": "הפקת המוצר",
  "terms.productProduction.p1":
    "כל ספרון מופק בהתאמה אישית על בסיס התמונות שהועלו.",
  "terms.productProduction.p2":
    "מאחר שמדובר במוצר ייחודי ומותאם אישית, לא ניתן לשנות, לבטל או לבקש החזר לאחר ביצוע ההזמנה, למעט בהתאם למדיניות ההחזרים של האתר.",
  "terms.warrantyAndService.title": "אחריות ושירות",
  "terms.warrantyAndService.p1":
    "אנו מקפידות על איכות גבוהה של הדפסה וייצור, אך ייתכנו הבדלים קלים בגוון, חיתוך או ניגודיות בין התצוגה במסך לבין ההדפסה בפועל. הבדלים אלה נחשבים תקינים ואינם מהווים עילה לביטול עסקה.",
  "terms.warrantyAndService.p2":
    "במקרה של מוצר פגום או נזק במשלוח, נטפל בכך בהתאם למדיניות ההחזרים שלנו.",
  "terms.safeUse.title": "שימוש בטוח במוצרים לתינוקות",
  "terms.safeUse.p1": "מוצרי Little Gali נועדו לשימוש הורי ולהשגחת מבוגר בלבד.",
  "terms.safeUse.p2":
    "הספרונים עשויים מנייר עבה (300 גרם) עם למינציה לשמירה על עמידות, אך אינם מיועדים לנשיכה, לעיסה או מגע ממושך עם רוק או נוזלים אחרים. אין להשאיר את המוצר ללא השגחה בקרבת תינוק או פעוט.",
  "terms.safeUse.p3":
    "החברה אינה אחראית לכל נזק, ישיר או עקיף, שייגרם עקב שימוש שאינו בהתאם להנחיות אלו. השימוש במוצר מהווה אישור לכך שהלקוח/ה קרא/ה את ההנחיות ומקבל/ת אחריות מלאה לשימוש בטוח ומושכל.",
  "terms.intellectualProperty.title": "קניין רוחני",
  "terms.intellectualProperty.p1":
    "כל זכויות היוצרים, העיצוב, התמונות, התוכן והקוד באתר שייכים ל־Little Gali, ואין להעתיק, להפיץ, לשכפל או להשתמש בהם ללא אישור מראש ובכתב.",
  "terms.liabilityLimitation.title": "הגבלת אחריות",
  "terms.liabilityLimitation.p1":
    "השימוש באתר ובמוצרים נעשה באחריות המשתמש בלבד. Little Gali אינה אחראית לנזקים עקיפים, אובדן מידע, הפסדים או כל נזק תוצאתי אחר שנגרם עקב שימוש באתר, בשירות או במוצרים.",
  "terms.termsChanges.title": "שינוי תנאים",
  "terms.termsChanges.p1":
    "אנו שומרות לעצמנו את הזכות לעדכן או לשנות את תנאי השירות מעת לעת. הגרסה העדכנית תפורסם באתר, והמשך השימוש מהווה הסכמה לתנאים המעודכנים.",
  "terms.contact.title": "יצירת קשר",
  "terms.contact.p1":
    "לשאלות או הבהרות בנושא תנאי השירות ניתן לפנות אלינו באמצעות עמוד",
  "terms.contact.link": "צור קשר",
  "terms.contact.p2": "או במייל:",

  // Privacy Policy
  "privacy.title": "מדיניות פרטיות",
  "privacy.intro":
    "אנו מכבדות את פרטיותכם ומתחייבות לשמור על המידע האישי שלכם ועל התמונות שתעלו לאתר. השימוש במידע ובתמונות נעשה אך ורק לצורך מתן השירות, הפקת הספרון האישי והשלמת ההזמנה – ולא לכל מטרה אחרת.",
  "privacy.personalInfo.title": "מידע אישי",
  "privacy.personalInfo.p1":
    "בעת ביצוע הזמנה באתר נאסף מידע בסיסי כגון שם, כתובת, פרטי תשלום וכתובת דוא״ל. המידע משמש לצורך:",
  "privacy.personalInfo.li1": "עיבוד ותיעוד ההזמנה,",
  "privacy.personalInfo.li2": "משלוח המוצר,",
  "privacy.personalInfo.li3": "ומתן שירות לקוחות.",
  "privacy.personalInfo.p2":
    "המידע נשמר בצורה מאובטחת ואינו נמסר לצדדים שלישיים, למעט במקרים הנדרשים לצורך ביצוע התשלום או משלוח המוצר, ובהתאם להסכמי סודיות ושמירת פרטיות.",
  "privacy.imageUse.title": "שימוש בתמונות",
  "privacy.imageUse.p1":
    "התמונות שתעלו לאתר ישמשו אך ורק לצורך יצירת הספרון האישי שלכם.",
  "privacy.imageUse.p2":
    "התמונות נשמרות באופן מאובטח בענן לצורך הפקת המוצר, הצגת תצוגה מקדימה, מתן שירות לקוחות או שחזור במקרה של תקלה, גם אם לא הושלמה רכישה בפועל.",
  "privacy.imageUse.p3":
    "לא ייעשה בתמונות כל שימוש נוסף, פרסום או העברה לצדדים שלישיים.",
  "privacy.imageUse.p4":
    "ניתן לפנות אלינו בכל עת בבקשה למחיקת התמונות לאחר סיום ההפקה או במקרה של אי־רכישה, ואנו נטפל בכך בהתאם לשיקולים טכניים של גיבוי ותמיכה.",
  "privacy.dataSecurity.title": "אבטחת מידע",
  "privacy.dataSecurity.p1":
    "האתר משתמש באמצעי אבטחה מתקדמים, לרבות הצפנת נתונים ואחסון בשרתים מאובטחים, לצורך הגנה על פרטיותכם. יחד עם זאת, יש לזכור כי אף מערכת אינטרנטית אינה חסינה לחלוטין, ואיננו יכולים להבטיח הגנה מוחלטת מפני חדירה או שימוש לא מורשה.",
  "privacy.userRights.title": "זכויות המשתמש",
  "privacy.userRights.p1":
    "כל משתמש רשאי לפנות בכל עת בבקשה לעיון, עדכון, תיקון או מחיקה של המידע האישי שלו, בכפוף להוראות הדין ולצרכים תפעוליים של האתר.",
  "privacy.contact.title": "יצירת קשר",
  "privacy.contact.p1":
    "לשאלות, בקשות או בירורים בנושא פרטיות ניתן לפנות אלינו בעמוד",
  "privacy.contact.link": "צור קשר",
  "privacy.contact.p2": "באתר או במייל:",

  // Shipping Policy
  "shipping.title": "מדיניות משלוחים",
  "shipping.deliveryTime.title": "זמן אספקה",
  "shipping.deliveryTime.p1":
    "הספרון האישי שלכם מופק במיוחד עבורכם בתהליך ייצור אישי וייחודי. זמן ההפקה והמשלוח המשוער הוא עד 14 ימי עסקים ממועד ביצוע ההזמנה.",
  "shipping.deliveryTime.p2":
    "אנו עושות את מירב המאמצים לעמוד בזמנים אלו, אך ייתכנו עיכובים שאינם בשליטתנו (כגון עיכובי דואר, תקלה טכנית או עומסים אצל חברת השילוח).",
  "shipping.deliveryTime.p3":
    "במקרים חריגים של עיכוב ממושך, נעדכן אתכם במייל או בהודעה.",
  "shipping.costs.title": "עלויות משלוח",
  "shipping.costs.p1":
    "עלות המשלוח מוצגת ללקוח בעת ההזמנה ומתווספת למחיר הספרון. המשלוחים מבוצעים באמצעות דואר ישראל או שליח עד הבית, בהתאם לאפשרויות הקיימות בעת ההזמנה.",
  "shipping.costs.p2":
    "במקרה של הזנה שגויה של כתובת או פרטים לא מדויקים, עלול להיגבות תשלום נוסף עבור משלוח חוזר.",
  "shipping.tracking.title": "מעקב משלוח",
  "shipping.tracking.p1":
    "לאחר שההזמנה נשלחת, תישלח אליכם הודעה עם פרטי מעקב או אישור משלוח. האחריות למעקב אחר סטטוס המשלוח לאחר יציאתו מהסטודיו חלה על הלקוח.",
  "shipping.deliveryAreas.title": "אזורי משלוח",
  "shipping.deliveryAreas.p1":
    "נכון לעכשיו אנו מבצעות משלוחים בישראל בלבד. בהמשך נרחיב את השירות למדינות נוספות, והמידע יתעדכן בעמוד זה.",
  "shipping.damaged.title": "מוצר שניזוק במשלוח",
  "shipping.damaged.p1":
    "אם הספרון הגיע פגום עקב תהליך המשלוח, יש ליצור קשר תוך 48 שעות מקבלת ההזמנה ולצרף תמונות ברורות של הנזק, באמצעות עמוד",
  "shipping.damaged.link": "צור קשר",
  "shipping.damaged.p2": "או במייל:",
  "shipping.damaged.p3": "לאחר האימות נדאג להחליף את המוצר ללא עלות נוספת.",

  // Returns Policy
  "returns.title": "מדיניות החזרים",
  "returns.intro":
    "אנחנו רוצות שתהיו מרוצים לחלוטין מההזמנה שלכם — ואם משהו אינו תקין או לא עומד בציפיותיכם, אנחנו כאן כדי לעזור.",
  "returns.customized.title": "ספרון אישי ומותאם אישית",
  "returns.customized.p1":
    "כל ספרון מיוצר במיוחד עבורכם, בהתאם לתמונות שתעלו לאתר.\n\nמאחר שמדובר במוצר בהתאמה אישית, לא ניתן לבטל, לשנות או לבקש החזר לאחר ביצוע ההזמנה — למעט במקרים של פגם, נזק במשלוח או אי־שביעות רצון מהמוצר, כפי שמפורט להלן.",
  "returns.damage.title": "פגמים או נזק במשלוח",
  "returns.damage.p1":
    "אנא בדקו את ההזמנה מיד עם קבלתה.\n\nאם הספרון הגיע פגום, ניזוק במשלוח או הודפס בצורה לא תקינה, יש לפנות אלינו תוך 48 שעות דרך עמוד",
  "returns.damage.link": "צור קשר",
  "returns.damage.p2": "או במייל:",
  "returns.damage.p3":
    ", ולצרף תמונות ברורות של הפגם או הנזק.\n\nלאחר בדיקה, נחליף את המוצר ללא עלות נוספת.\n\nמוצרים שיוחזרו ללא תיאום מראש לא יתקבלו.",
  "returns.damage.p4": "",
  "returns.unsatisfied.title": "לא מרוצים מהמוצר?",
  "returns.unsatisfied.p1":
    "אנחנו מבינות שלפעמים התוצאה הסופית אינה בדיוק כפי שדמיינתם.\n\nאם אינכם מרוצים מהמוצר שקיבלתם, תוכלו לפנות אלינו תוך 7 ימים מקבלת ההזמנה ולפרט את סיבת אי־שביעות הרצון.",
  "returns.unsatisfied.p2":
    "לאחר בחינת הפנייה, אם תאושר, נבקש להחזיר את הספרון (באריזתו המקורית וללא נזק) לכתובת שתימסר.\n\nעם קבלת המוצר, יינתן החזר כספי מלא למחיר הספרון (לא כולל עלות המשלוח חזרה, אלא אם מדובר בפגם במוצר).",
  "returns.variations.title": "שונות טבעית ודגשים טכניים",
  "returns.variations.p1":
    "ייתכנו הבדלים קלים בגוון, חיתוך או ניגודיות בין התמונה על המסך לבין ההדפסה בפועל.\n\nשונות זו נחשבת תקינה ואינה מהווה עילה להחזר או החלפה.",
  "returns.variations.p2": "",
  "returns.imageRights.title": "זכויות תמונה",
  "returns.imageRights.p1":
    "הלקוח מצהיר כי יש לו זכויות שימוש בתמונות שהועלו וכי הן אינן מפרות זכויות יוצרים או פרטיות של צד שלישי.",

  // Language
  "lang.hebrew": "עברית",
  "lang.english": "English",

  // Home Page
  "home.hero.title": "ספרון לתינוק|מהתמונות שלכם",
  "home.hero.titleHighlight": "שלכם",
  "home.hero.cta": "צרו ספרון עכשיו",
  "home.hero.ariaLabel": "קטע פתיחה - ספרון לתינוק",
  "home.hero.ctaAriaLabel": "עבור לעמוד יצירת ספרון",
  "home.book.title": "ספרון הנייר שלנו",
  "home.book.titleHighlight": "הנייר",
  "home.book.subtitle": "ספרון אישי לתינוק – עם תמונות המשפחה שלכם",
  "home.book.description":
    "ספרון דו־צדדי עם תמונות מעובדות ב־AI שנוצרות מהתמונות המשפחתיות שלכם.\nצד אחד בשחור־לבן לגירוי ראייה לתינוקות בני 0–3 חודשים, וצד שני צבעוני, להמשך ההתפתחות.\nמושלם לזמן בטן, לשידת ההחתלה או למתנה אישית במיוחד.",
  "home.book.price": "מחיר לספר",
  "home.book.secondBook": "ספר שני ב-₪99 בלבד",
  "home.book.discountNote": "* ההנחה מתעדכנת אוטומטית בעמוד התשלום",
  "home.book.cta": "צרו עכשיו את הספרון האישי שלכם",
  "home.book.ariaLabel": "פרטי המוצר - ספרון הנייר שלנו",
  "home.book.imageAlt": "תמונה של ספרון הנייר",
  "home.book.ctaAriaLabel": "עבור לעמוד יצירת ספרון אישי",
  "home.howItWorks.title": "איך זה עובד",
  "home.howItWorks.titleHighlight": "עובד",
  "home.howItWorks.subtitle":
    "כל מה שצריך זה כמה תמונות אהובות – אנחנו נדאג לכל השאר",
  "home.howItWorks.step1.label": "אתם עושים",
  "home.howItWorks.step1.title": "מעלים תמונות",
  "home.howItWorks.step1.description":
    "בחרו 5 תמונות שיופיעו בספרון ובחרו את הסגנון שאהבתם לצד הצבעוני",
  "home.howItWorks.step1.imageAlt": "דוגמה להעלאת תמונות",
  "home.howItWorks.step2.label": "אנחנו עושים",
  "home.howItWorks.step2.title": "יוצרים את הספרון",
  "home.howItWorks.step2.description":
    "אנחנו ניצור מהתמונות ספרון דו צדדי.\nצד אחד עם חמשת התמונות בשחור לבן, וצד שני עם \nאותם חמש תמונות בעיבוד צבעוני.",
  "home.howItWorks.step2.imageAlt": "דוגמה לתמונות מעובדות בספרון",
  "home.howItWorks.step3.label": "אנחנו עושים",
  "home.howItWorks.step3.title": "מדפיסים את הספרון",
  "home.howItWorks.step3.description":
    "אנחנו מדפיסים את הספרון האישי שלכם באיכות גבוהה ושולחים אותו עד הבית – מוכן לשימוש ולמזכרת.",
  "home.howItWorks.cta": "התחילו עכשיו",
  "home.howItWorks.ctaAriaLabel": "התחל ליצור ספרון עכשיו",
  "home.dualDesign.title": "התמונה שלכם – גם לפוקוס הראשון וגם לצבעים הראשונים",
  "home.dualDesign.titleHighlight": "שלכם",
  "home.dualDesign.description":
    "אנחנו ממירים כל תמונה לשתי גרסאות – אחת בשחור־לבן שמיועדת לגירוי הראייה הראשוני, ואחת צבעונית שמתאימה לשלב שבו התינוק כבר מזהה צבעים.",
  "home.dualDesign.bw.title": "שחור לבן",
  "home.dualDesign.bw.description":
    "הצד הזה מתאים במיוחד לתינוקות מהלידה ועד גיל 3 חודשים — בדיוק בשלב שבו הם מתחילים לזהות ניגודים חזקים.",
  "home.dualDesign.color.title": "צבעוני",
  "home.dualDesign.color.description":
    "הצד הצבעוני מושלם לגיל 3 חודשים ומעלה – כשהראייה מתפתחת והעולם סביבם מתחיל להתמלא בצבעים.",
  "home.dualDesign.moreExamples": "רוצים לראות עוד דוגמאות?",
  "home.dualDesign.moreExamplesLink": "גלו כאן",
  "home.special.title": "מה הופך את הספרון שלנו למיוחד",
  "home.special.titleHighlight": "למיוחד",
  "home.special.ariaLabel": "מה מיוחד בספרון שלנו",
  "home.special.item1.title": "להסתכל על הקרובים ביותר",
  "home.special.item1.description":
    "הפנים של המטפלים העיקריים מוכרות לתינוק ומרגיעות אותו כבר מימיו הראשונים",
  "home.special.item1.imageAlt": "זוג צעיר",
  "home.special.item2.title": "להכיר את המשפחה",
  "home.special.item2.description":
    "הזדמנות להיחשף ולהסתכל על המשפחה אליה נכנס התינוק",
  "home.special.item2.imageAlt": "אחות צעירה",
  "home.special.item3.title": "מזכרת מתוקה",
  "home.special.item3.description":
    "ספרון שהוא אישי ומהווה מזכרת לתקופה קצרה ומופלאה בחיי התינוק",
  "home.special.item3.imageAlt": "הורה ובן",
  "home.special.item4.title": "לא עוד מוצר גנרי",
  "home.special.item4.description":
    "במקום להסתכל על צורות ותבניות, תנו לתינוק להסתכל על המשפחה",
  "home.special.item4.imageAlt": "אבא ובן",
  "home.about.brand": "ליטל גלי",
  "home.about.title": "מי אנחנו",
  "home.about.titleHighlight": "אנחנו",
  "home.about.imageAlt": "תמונת צוות ליטל גלי",
  "home.about.paragraph1":
    "את Little Gali פתחתי כחודשיים אחרי שגלי נולדה, בעיקר מתוך סקרנות ורצון ליצור משהו חדש. מצאתי את עצמי משקיעה בזה יותר ויותר: חושבת על המוצר, מעצבת, בונה את האתר, ובעיקר מתרגשת מכל הזמנה מחדש.",
  "home.about.paragraph2":
    "מהר מאוד הבנתי שזה לא רק תהליך יצירתי בשבילי. התגובות של אמהות שקיבלו את הספרון חידדו שיש כאן משהו אחר - אישי ומיוחד. מוצר שגם אני הייתי בוחרת עבור גלי שלי, אולי בגלל זה היא ממשיכה לקבל עוד ועוד ספרונים עד עכשיו.",
  "home.about.paragraph3":
    "הספרון נולד כמוצר לתינוק, אבל גם כמתנה מקורית: כזו שיש בה מחשבה וקשר אישי, וכזו שרוצים להשאיר בבית לא רק לשימוש — אלא גם כחפץ שנעים לראות.",
  "home.qa.title": "שאלו אותנו",
  "home.qa.titleHighlight": "אותנו",
  "home.qa.subtitle": "התשובות לשאלות הנפוצות ביותר על הספרון והשירותים שלנו",
  "home.qa.cta": "לכל השאלות והתשובות",
  "home.qa.ctaAriaLabel": "עבור לעמוד שאלות ותשובות המלא",
  "home.comingSoon.title": "משהו מיוחד בדרך",
  "home.comingSoon.titleHighlight": "מיוחד",
  "home.comingSoon.comingSoon": "בקרוב",
  "home.comingSoon.productName": "ספרוני בד מיוחדים",
  "home.comingSoon.subtitle":
    "ספרונים מבד שמכילים את התמונות שלכם.\nהשאירו מייל ואנחנו נדאג לעדכן אתכם ראשונים כשהם יגיעו.",
  "home.comingSoon.emailPlaceholder": "כתובת המייל שלכם",
  "home.comingSoon.button": "עדכנו אותי",
  "home.comingSoon.submitting": "שולח...",
  "home.comingSoon.error": "כתובת אימייל לא תקינה",
  "home.comingSoon.errorGeneric": "משהו השתבש, נסו שוב",
  "home.comingSoon.success": "תודה! נעדכן אתכם ברגע שהמוצר יהיה זמין",
  "home.comingSoon.successTitle": "תודה רבה!",
  "home.comingSoon.successMessage": "נעדכן אתכם ברגע שספרוני הבד יגיעו",
  "home.comingSoon.imageAlt": "תמונה של מוצר בקרוב",
  "home.testimonials.title": "מה אומרים עלינו",
  "home.testimonials.titleHighlight": "עלינו",
  "qa.question1": "ממה הספרון עשוי?",
  "qa.answer1": "הספרון עשוי מנייר איכותי ועבה שנעבר למינציה. הספרון יציב וניתן להעמיד אותו בקלות.",
  "qa.question2": "כמה תמונות צריך לבחור?",
  "qa.answer2":
    "5 תמונות בלבד. אותן תמונות מופיעות בצד אחד בשחור לבן ובצד השני בצבעוני.",
  "qa.question3": "מי כדאי שיהיה בספרון?",
  "qa.answer3":
    "כל מי שאתם רוצים להראות לתינוק. כמה רעיונות: משפחה קרובה, משפחה רחוקה, חברים, חיות מחמד.",
  "qa.question4": "איזה תמונה מתאימה?",
  "qa.answer4":
    "מבחינה טכנית, התמונות הטובות ביותר הן אלו שרואים בהן בבירור את הפנים, לא בפרופיל ובתאורה טובה. מבחינה לא טכנית, התמונות שיוצאות הכי יפה הן אלו ש״תופסות״ רגע מיוחד, תמונות של חיוך ושל כיף. מסוג הדברים שקשה להסביר במילים אבל קל להרגיש.",
  "qa.question5": "אפשר לשים כמה אנשים בתמונה אחת?",
  "qa.answer5":
    "כן בהחלט. רק שימו לב שכל הפנים של האנשים בתמונה נראים באופן ברור ושהיא לא עמוסה מדיי כי זה יכול לפגוע באיכות התוצאה.",
  "qa.question6": "האם הרקע משנה?",
  "qa.answer6": "לא. הרקע מוסר אוטומטית ומוחלף בלבן.",
  "qa.question7": "איך מנקים את הספרון?",
  "qa.answer7": "אפשר לנגב בעדינות עם מטלית לחה. יש להימנע ממגע ישיר עם מים.",
  "qa.question8": "כמה זמן לוקח להכין את הספרון?",
  "qa.answer8":
    "תהליך ההכנה לוקח עד 14 ימי עבודה מרגע קבלת התמונות. אנו נעדכן אתכם כשהספרון מוכן לאיסוף או למשלוח.",
  "qa.question9": "מה אם אני לא מרוצה מהספרון?",
  "qa.answer9":
    "המטרה שלנו היא שתאהבו ותהיו מרוצים מהספרון שלכם. אם קיבלתם את הספרון ומשהו בו לא עבד לכם כמו שציפיתם, מוזמנים לפנות אליי.",
  "qa.notFound": "לא מצאתם את התשובה שחיפשתם?",
  "qa.contact": "צרו איתנו קשר",

  // Footer
  "footer.description":
    "Little Gali הופך תמונות רגילות ליצירות שחור-לבן עדינות שמתאימות במיוחד לראיית תינוקות. נולד מאמא שאהבה לראות את התינוקת שלה נמשכת לפנים מוכרות.",
  "footer.platform": "פלטפורמה",
  "footer.howItWorks": "איך זה עובד",
  "footer.photoGuide": "מדריך בחירת תמונה",
  "footer.inspiration": "גלריית השראה",
  "footer.policies": "תקנונים",
  "footer.terms": "תנאי שירות",
  "footer.privacy": "פרטיות",
  "footer.shipping": "משלוחים",
  "footer.returns": "החזרות",
  "footer.about": "אודות",
  "footer.whoWeAre": "מי אנחנו",
  "footer.contact": "צרו קשר",
  "footer.contactUs": "צרו איתנו קשר",
  "footer.copyright": "© Copyright Little Gali. כל הזכויות שמורות.",

  // Contact Page
  "contact.title": "צרו איתנו קשר",
  "contact.titleHighlight": "קשר",
  "contact.name": "שם",
  "contact.email": "אימייל",
  "contact.message": "הודעה",
  "contact.namePlaceholder": "הכנס את שמך",
  "contact.emailPlaceholder": "הכנס את כתובת האימייל שלך",
  "contact.messagePlaceholder": "השאר את הודעתך כאן...",
  "contact.submit": "שלח הודעה",
  "contact.submitting": "שולח...",
  "contact.success": "ההודעה נשלחה בהצלחה!",
  "contact.error": "שגיאה בשליחת ההודעה. אנא נסה שוב.",
  "contact.serverError": "שגיאה בשרת. אנא נסה שוב מאוחר יותר.",

  // Upload Page
  "upload.title": "בואו ניצור לתינוק שלכם ספרון אישי",
  "upload.titleHighlight": "אישי",
  "upload.description":
    "בחרו 5 תמונות שיופיעו בספרון.\nחמשת התמונות יופיע בצד אחד בשחור לבן ובצד השני בצבעוני.",
  "upload.imagesCount": "מתוך 5 תמונות",
  "upload.selectExactly5": "אנא בחר בדיוק 5 תמונות",
  "upload.waitForUpload": "אנא המתן עד שהתמונות יסיימו להעלות",
  "upload.serverError": "שגיאה בשרת. אנא נסה שוב מאוחר יותר.",
  "upload.addingToCart": "מוסיף לעגלה...",
  "upload.uploading": "מעלה תמונות...",
  "upload.uploadingAndAdding": "מעלה תמונות ומוסיף לעגלה...",
  "upload.updating": "מעדכן...",
  "upload.addToCart": "הוסף לעגלה",
  "upload.dragToReorder": "הזיזו את התמונות בשביל לבחור את הסדר שיופיע בספרון",
  "upload.startOver": "התחל מחדש",
  "upload.photoTip": "איזו תמונה כדאי להעלות?",
  "upload.photoNote":
    "אין צורך בתמונה מושלמת, אנחנו נדאג שהפנים, ההבעה והחום האנושי שבתמונה יבואו לידי ביטוי.",

  // Style Selector
  "styleSelector.title": "בחרו את הסגנון שלכם:",
  "styleSelector.subtitle": "הסגנון ישפיע על הצד הצבעוני של התמונה",
  "styleSelector.cartoon": "קריקטורה",
  "styleSelector.pencil": "עיפרון",
  "styleSelector.watercolor": "צבעי מים",
  "styleSelector.cartoonDescription": "צבעוני, חי ומלא אופי",
  "styleSelector.pencilDescription": "מדויק לפרטים, רך וטבעי",
  "styleSelector.watercolorDescription": "ציורי ואומנותי",
  "styleSelector.cartoonAlt": "קריקטורה - סגנון קריקטורה",
  "styleSelector.pencilAlt": "עיפרון - סגנון עיפרון",
  "styleSelector.watercolorAlt": "צבעי מים - סגנון צבעי מים",
  "styleSelector.modal.title": "מה ההבדל?",
  "styleSelector.modal.subtitle": "בחרו את הסגנון המועדף עליכם לצד הצבעוני:",
  "styleSelector.modal.cartoon.bold": "איור צבעוני בהשראת ספרי ילדים",
  "styleSelector.modal.cartoon.vibrant": "קווים חופשיים ומראה שמח וסיפורי",
  "styleSelector.modal.cartoon.modern": "מדגיש אופי ותחושה על פני פרטים קטנים",
  "styleSelector.modal.cartoon.stylized": "מתאים למי שמחפשת סגנון מאויר ומשחקי",
  "styleSelector.modal.pencil.soft": "איור בעפרונות צבעוניים",
  "styleSelector.modal.pencil.delicate": "מראה רך, טבעי ואמנותי",
  "styleSelector.modal.pencil.handDrawn": "שומר על פרטים, הבעות וזיהוי הדמות",
  "styleSelector.modal.pencil.realistic": "מתאים למי שחשוב לה שהתוצאה תהיה קרובה לתמונה המקורית",
  "styleSelector.modal.watercolor.artistic": "איור בצבעי מים",
  "styleSelector.modal.watercolor.colorful": "מראה אומנותי, רך וייחודי",
  "styleSelector.modal.watercolor.fluid": "מדגיש הבעות, אור ורגש",
  "styleSelector.modal.watercolor.unique": "עובד במיוחד טוב בצילומי תקריב",
  "styleSelector.modal.watercolor.notSuitable": "פחות מתאים לתמונות עם הרבה אנשים",
  "styleSelector.modal.bottomNote": "שני הסגנונות יוצאים יפים ומוקפדים – הבחירה היא בין דיוק למראה מאויר.",
  "styleSelector.modal.gotIt": "הבנתי!",

  // Upload Modal
  "uploadModal.title": "איזה תמונה כדאי לבחור",
  "uploadModal.subtitle": "בחרו תמונה שהפנים של כל האנשים בה נראות בבירור.",
  "uploadModal.facingCamera": "הפנים פונות למצלמה (לא בפרופיל)",
  "uploadModal.eyesVisible": "רואים את העיניים בבירור",
  "uploadModal.facesNotCut": "הפנים שלמות ולא חתוכות",
  "uploadModal.goodLightingClear": "תאורה טובה וברורה (לא חשוך או מוצל מדי)",
  "uploadModal.choose": "כדאי לבחור",
  "uploadModal.avoid": "כדאי להימנע",
  "uploadModal.clearFaces": "פנים ברורות",
  "uploadModal.visibleEyes": "רואים את העיניים",
  "uploadModal.goodLighting": "תאורה טובה",
  "uploadModal.oneOrTwo": "אדם אחד או שניים בתמונה",
  "uploadModal.naturalSmile": "חיוך טבעי",
  "uploadModal.noBWFilter": "פילטר שחור-לבן",
  "uploadModal.notTooClose": "קרוב מדי לפנים",
  "uploadModal.notBlurry": "מטושטשת או רחוקה",
  "uploadModal.noGroup": "תמונה קבוצתית",
  "uploadModal.noSunglasses": "משקפי שמש או כובע",
  "uploadModal.important": "חשוב:",
  "uploadModal.importantNote": "הפנים בתמונה צריכות להיראות בבירור",
  "uploadModal.chooseFromDevice": "בחירה מהמכשיר",
  "uploadModal.privacy": "התמונות ישמשו רק ליצירת הספרון האישי שלכם",
  "uploadModal.tooCloseExample": "דוגמה קרובה מדי",
  "uploadModal.groupExample": "דוגמה קבוצתית",
  "uploadModal.goodExample1": "דוגמה טובה 1",
  "uploadModal.goodExample2": "דוגמה טובה 2",

  // Top Banner
  "banner.shipping": "משלוחים לכל הארץ",
  "banner.freeCard": "הוספת כרטיס ברכה אישי בחינם",

  // Gift Cards
  "giftCard.title": "גיפט קארד לספרון אישי",
  "giftCard.titleHighlight": "גיפט קארד",
  "giftCard.description": "רוצים לתת את הספרון שלנו בתור מתנה אבל מעדיפים לאפשר להם לבחור תמונות וסגנון בעצמם?\nבדיוק בשביל זה יש לנו את הגיפט קארד שלנו.\nבסיום התשלום תקבלו למייל את פרטי הגיפט קארד אותו תוכלו להעביר כמתנה אישית ומיוחדת.",
  "giftCard.selectOption": "בחרו אפשרות:",
  "giftCard.addToCart": "הוסף לעגלה",
  "giftCard.adding": "מוסיף...",
  "giftCard.ariaLabel": "הוסף גיפט קארד לעגלה",
  "giftCard.option1": "ספרון אישי אחד ללא משלוח",
  "giftCard.option2": "ספרון אישי אחד כולל משלוח",
  "giftCard.option3": "שני ספרונים אישיים ללא משלוח",
  "giftCard.option4": "שני ספרונים אישיים כולל משלוח",
  "giftCard.feature1": "הספרון השני ב99₪",
  "giftCard.feature2": "בחירת 5 תמונות",
  "giftCard.feature3": "בחירת סגנון",
  "giftCard.feature4": "תוקף ללא הגבלה",

  // Cookie Consent
  "cookieConsent.title": "עוגיות ומעקב",
  "cookieConsent.description": "אנחנו משתמשים בעוגיות לשיפור חווית הגלישה וניתוח השימוש באתר.",
  "cookieConsent.accept": "מסכימ/ה",
  "cookieConsent.decline": "דחה",
  "cookieConsent.learnMore": "פרטים נוספים",
  "cookieConsent.ariaLabel": "הודעת עוגיות ומעקב",
};

const englishTranslations = {
  // Navigation
  "nav.home": "Home",
  "nav.about": "About Us",
  "nav.giftCard": "Gift Card",
  "nav.qa": "Q&A",
  "nav.inspiration": "Inspiration",
  "nav.contact": "Contact",
  "nav.createBook": "Create Book",
  "nav.menuAriaLabel": "Main navigation menu",
  "nav.mainNavAriaLabel": "Main navigation",
  "nav.createBookAriaLabel": "Go to book creation page",

  // Accessibility
  "accessibility.skipToMain": "Skip to main content",

  // Top Banner
  "banner.shipping": "Shipping Nationwide",

  // Cart
  "cart.title": "Shopping Cart",
  "cart.titleHighlight": "Cart",
  "cart.empty": "Your cart is empty",
  "cart.total": "Total:",
  "cart.checkout": "Continue to Checkout",
  "cart.viewFull": "View Full Cart",
  "cart.loading": "Loading...",
  "cart.removeItem": "Remove Item from Cart",
  "cart.removeConfirm":
    "Are you sure you want to remove this book from your cart?",
  "cart.remove": "Remove",
  "cart.cancel": "Cancel",
  "cart.quantity": "Quantity:",
  "cart.itemTotal": "Item Total:",
  "cart.style": "Style:",
  "cart.colorStyle": "Color Style:",
  "cart.style.cartoon": "Cartoon",
  "cart.style.pencil": "Pencil",
  "cart.style.watercolor": "Watercolor",
  "cart.book": "Paper Book",
  "cart.orderSummary": "Order Summary",
  "cart.itemsCount": "Number of items:",
  "cart.deliveryTime": "Delivery time - up to 14 business days",
  "cart.shareConsent": "You can share my book on Little Gali's page as inspiration",
  "cart.shareConsentNote": "Without names or identifying details",
  "cart.addGiftMessage": "Add a gift message",
  "cart.giftMessagePlaceholder": "Enter your message (up to 200 characters)",
  "cart.readyMessage":
    "A message will be sent when the book is ready for pickup coordination",
  "cart.checkoutProgress": "Redirecting to payment...",
  "cart.addBook": "Add Book",
  "cart.secondBook": "Every second book for ₪99 🎉",
  "cart.discountNote": "* Discount is automatically applied at checkout",
  "cart.startCreating": "Start creating a personalized book",
  "cart.giftCardTitle": "Gift Card",
  "cart.createBook": "Create Book",

  // Inspiration Page
  "inspiration.title": "Book Inspiration",
  "inspiration.titleHighlight": "Inspiration",
  "inspiration.subtitle":
    "View examples of different types of books to help you choose photos and create your own book",
  "inspiration.colorful": "Colorful",
  "inspiration.blackWhite": "Black and White",
  "inspiration.switchToBlackWhite": "Switch to black and white side",
  "inspiration.switchToColorful": "Switch to colorful side",
  "inspiration.card1.title": "Core Family Book",
  "inspiration.card1.description":
    "The faces closest to the baby – mom, dad, and maybe also a sibling or the family dog. The book that gives them a sense of calm and connection to the family",
  "inspiration.card2.title": "Meet the Rest of the Family",
  "inspiration.card2.description":
    "Grandparents, aunts, uncles, cousins – everyone who loves and knows the baby. A sweet way to encourage familiarity and connection even from afar",
  "inspiration.card3.title": "Baby Book",
  "inspiration.card3.description":
    "Different moments of the baby itself – smile, wonder, curious gaze. A personal and simple book that captivates every baby",
  "inspiration.cta": "Start Creating Your Book",

  // Terms of Service
  "terms.title": "Terms of Service",
  "terms.intro":
    "Welcome to the Little Gali website. The use of the website and the services provided are subject to the terms detailed below. By browsing the website and placing an order, you confirm that you have read and fully agree to these terms.",
  "terms.useOfSite.title": "Use of Site",
  "terms.useOfSite.p1":
    "The website allows ordering personalized baby books based on images uploaded by the user. Use of the website is permitted for personal and private purposes only.",
  "terms.useOfSite.p2":
    "It is prohibited to use the website for commercial purposes not approved by us, to upload offensive, illegal content, or images that are not owned by the user.",
  "terms.userResponsibility.title": "User Responsibility",
  "terms.userResponsibility.p1":
    "The user declares that they have full rights to the images they upload, and that their use for the production of the book does not violate copyright, privacy, or any other law.",
  "terms.userResponsibility.p2":
    "The user confirms that they will not upload images of minors or third parties without their consent, and that all legal responsibility for the uploaded content rests solely with them.",
  "terms.ordersAndPayment.title": "Orders and Payment",
  "terms.ordersAndPayment.p1":
    "Prices on the website are displayed in the currency indicated on the order page and include VAT according to law. Payment is made through a secure payment system, and the order will be considered final after payment confirmation.",
  "terms.ordersAndPayment.p2":
    "The company reserves the right to cancel an order in case of a pricing error, technical failure, unavailability, or improper use of the website.",
  "terms.productProduction.title": "Product Production",
  "terms.productProduction.p1":
    "Each book is produced on a personalized basis based on the uploaded images.",
  "terms.productProduction.p2":
    "Since this is a unique and personalized product, it cannot be changed, canceled, or refunded after placing the order, except in accordance with the website's returns policy.",
  "terms.warrantyAndService.title": "Warranty and Service",
  "terms.warrantyAndService.p1":
    "We maintain high quality of printing and production, but there may be slight differences in tone, cutting, or contrast between screen display and actual printing. These differences are considered normal and do not constitute grounds for transaction cancellation.",
  "terms.warrantyAndService.p2":
    "In case of a defective product or shipping damage, we will handle it according to our returns policy.",
  "terms.safeUse.title": "Safe Use of Baby Products",
  "terms.safeUse.p1":
    "Little Gali products are intended for parental use and adult supervision only.",
  "terms.safeUse.p2":
    "The books are made of thick paper (300 grams) with lamination for durability, but are not intended for biting, chewing, or prolonged contact with saliva or other liquids. Do not leave the product unsupervised near a baby or toddler.",
  "terms.safeUse.p3":
    "The company is not responsible for any damage, direct or indirect, caused by use not in accordance with these guidelines. Use of the product constitutes confirmation that the customer has read the guidelines and accepts full responsibility for safe and prudent use.",
  "terms.intellectualProperty.title": "Intellectual Property",
  "terms.intellectualProperty.p1":
    "All copyrights, design, images, content, and code on the website belong to Little Gali, and may not be copied, distributed, reproduced, or used without prior written approval.",
  "terms.liabilityLimitation.title": "Liability Limitation",
  "terms.liabilityLimitation.p1":
    "Use of the website and products is at the user's sole responsibility. Little Gali is not responsible for indirect damages, information loss, losses, or any consequential damage caused by use of the website, service, or products.",
  "terms.termsChanges.title": "Terms Changes",
  "terms.termsChanges.p1":
    "We reserve the right to update or change the terms of service from time to time. The updated version will be published on the website, and continued use constitutes agreement to the updated terms.",
  "terms.contact.title": "Contact",
  "terms.contact.p1":
    "For questions or clarifications regarding the terms of service, please contact us through the",
  "terms.contact.link": "Contact Us",
  "terms.contact.p2": "page or by email:",

  // Privacy Policy
  "privacy.title": "Privacy Policy",
  "privacy.intro":
    "We respect your privacy and are committed to protecting your personal information and the images you upload to the website. Use of information and images is solely for the purpose of providing the service, producing the personal book, and completing the order – and for no other purpose.",
  "privacy.personalInfo.title": "Personal Information",
  "privacy.personalInfo.p1":
    "When placing an order on the website, basic information is collected such as name, address, payment details, and email address. The information is used for:",
  "privacy.personalInfo.li1": "Processing and recording the order,",
  "privacy.personalInfo.li2": "Shipping the product,",
  "privacy.personalInfo.li3": "and providing customer service.",
  "privacy.personalInfo.p2":
    "The information is stored securely and is not shared with third parties, except in cases required for payment processing or product shipping, and in accordance with confidentiality and privacy agreements.",
  "privacy.imageUse.title": "Image Use",
  "privacy.imageUse.p1":
    "Images you upload to the website will be used solely for creating your personal book.",
  "privacy.imageUse.p2":
    "Images are stored securely in the cloud for product production, preview display, customer service, or recovery in case of failure, even if a purchase was not completed.",
  "privacy.imageUse.p3":
    "No additional use, publication, or transfer to third parties will be made with the images.",
  "privacy.imageUse.p4":
    "You may contact us at any time to request deletion of images after production completion or in case of non-purchase, and we will handle it according to technical considerations of backup and support.",
  "privacy.dataSecurity.title": "Data Security",
  "privacy.dataSecurity.p1":
    "The website uses advanced security measures, including data encryption and storage on secure servers, to protect your privacy. However, please remember that no internet system is completely immune, and we cannot guarantee absolute protection against intrusion or unauthorized use.",
  "privacy.userRights.title": "User Rights",
  "privacy.userRights.p1":
    "Any user may contact us at any time with a request to view, update, correct, or delete their personal information, subject to legal requirements and operational needs of the website.",
  "privacy.contact.title": "Contact",
  "privacy.contact.p1":
    "For questions, requests, or inquiries regarding privacy, please contact us through the",
  "privacy.contact.link": "Contact Us",
  "privacy.contact.p2": "page on the website or by email:",

  // Shipping Policy
  "shipping.title": "Shipping Policy",
  "shipping.deliveryTime.title": "Delivery Time",
  "shipping.deliveryTime.p1":
    "Your personal book is produced especially for you through a personal and unique production process. The estimated production and shipping time is up to 14 business days from the order date.",
  "shipping.deliveryTime.p2":
    "We make every effort to meet these deadlines, but there may be delays beyond our control (such as postal delays, technical failures, or shipping company overload).",
  "shipping.deliveryTime.p3":
    "In exceptional cases of prolonged delay, we will update you by email or message.",
  "shipping.costs.title": "Shipping Costs",
  "shipping.costs.p1":
    "Shipping costs are displayed to the customer at the time of order and are added to the book price. Shipping is done through Israel Post or courier to home, according to options available at the time of order.",
  "shipping.costs.p2":
    "In case of incorrect address entry or inaccurate details, additional payment may be charged for return shipping.",
  "shipping.tracking.title": "Shipping Tracking",
  "shipping.tracking.p1":
    "After the order is shipped, you will receive a message with tracking details or shipping confirmation. Responsibility for tracking shipping status after it leaves the studio rests with the customer.",
  "shipping.deliveryAreas.title": "Delivery Areas",
  "shipping.deliveryAreas.p1":
    "Currently we ship to Israel only. In the future we will expand the service to additional countries, and information will be updated on this page.",
  "shipping.damaged.title": "Product Damaged in Shipping",
  "shipping.damaged.p1":
    "If the book arrived damaged due to the shipping process, please contact us within 48 hours of receiving the order and attach clear photos of the damage through the",
  "shipping.damaged.link": "Contact Us",
  "shipping.damaged.p2": "page or by email:",
  "shipping.damaged.p3":
    "After verification, we will replace the product at no additional cost.",

  // Returns Policy
  "returns.title": "Returns & Refund Policy",
  "returns.intro":
    "We want you to be completely happy with your Little Gali book — and if something isn't right or doesn't meet your expectations, we're here to help.",
  "returns.customized.title": "Personalized and Custom Product",
  "returns.customized.p1":
    "Each book is produced especially for you, based on the images you upload to the website.\n\nSince this is a personalized product, it cannot be canceled, changed, or refunded after placing the order — except in cases of defects, shipping damage, or customer dissatisfaction, as detailed below.",
  "returns.damage.title": "Defects or Shipping Damage",
  "returns.damage.p1":
    "Please check your order immediately upon receipt.\n\nIf the book arrived damaged, was damaged during shipping, or was printed incorrectly, please contact us within 48 hours through the",
  "returns.damage.link": "Contact Us",
  "returns.damage.p2": "page or by email:",
  "returns.damage.p3":
    ", and attach clear photos of the defect or damage.\n\nAfter inspection, we will replace the product at no additional cost.\n\nProducts returned without prior coordination will not be accepted.",
  "returns.damage.p4": "",
  "returns.unsatisfied.title": "Not Satisfied with the Product?",
  "returns.unsatisfied.p1":
    "We understand that sometimes the final result is not exactly as you imagined.\n\nIf you're not satisfied with the product you received, you may contact us within 7 days of receiving the order and specify the reason for dissatisfaction.",
  "returns.unsatisfied.p2":
    "After reviewing the request, if approved, we will ask you to return the book (in its original packaging and undamaged) to an address we will provide.\n\nUpon receipt of the product, a full refund will be issued for the book price (excluding return shipping costs, unless it's a product defect).",
  "returns.variations.title": "Natural Variations and Technical Notes",
  "returns.variations.p1":
    "There may be slight differences in tone, cropping, or contrast between the image on screen and the actual printing.\n\nThis variation is considered normal and does not constitute grounds for refund or replacement.",
  "returns.variations.p2": "",
  "returns.imageRights.title": "Image Rights",
  "returns.imageRights.p1":
    "By uploading images, you confirm that you hold full usage rights and that they do not infringe on copyright or privacy of any third party.",

  // Language
  "lang.hebrew": "עברית",
  "lang.english": "English",

  // Home Page
  "home.hero.title": "Personalized Baby Book",
  "home.hero.titleHighlight": "Personalized",
  "home.hero.cta": "Create Your Book Now",
  "home.hero.ariaLabel": "Hero section - Personalized baby book",
  "home.hero.ctaAriaLabel": "Go to book creation page",
  "home.book.title": "Our Paper Book",
  "home.book.titleHighlight": "Paper",
  "home.book.subtitle": "Personal baby book – with your family photos",
  "home.book.description":
    "A double-sided book with AI-processed images created from your family photos.\nOne side in black and white for visual stimulation for babies 0-3 months old, and a colorful side for continued development.\nPerfect for tummy time, the changing table, or as a special personalized gift.",
  "home.book.price": "Price per book",
  "home.book.secondBook": "Every second book for only ₪99",
  "home.book.discountNote": "* Discount is automatically applied at checkout",
  "home.book.cta": "Create Your Personal Book Now",
  "home.book.ariaLabel": "Product details - Our paper book",
  "home.book.imageAlt": "Image of the paper book",
  "home.book.ctaAriaLabel": "Go to personal book creation page",
  "home.howItWorks.title": "How it works",
  "home.howItWorks.titleHighlight": "works",
  "home.howItWorks.subtitle":
    "All you need are a few favorite photos – we'll take care of the rest",
  "home.howItWorks.step1.label": "You do",
  "home.howItWorks.step1.title": "Upload photos",
  "home.howItWorks.step1.description":
    "Upload 5 favorite photos of the baby or family – it takes less than a minute",
  "home.howItWorks.step1.imageAlt": "Example of photo upload",
  "home.howItWorks.step2.label": "We do",
  "home.howItWorks.step2.title": "Process the images",
  "home.howItWorks.step2.description":
    "Using artificial intelligence (AI), we convert the images into clear, baby-friendly versions – in black and white and in color.",
  "home.howItWorks.step2.imageAlt": "Example of processed images in book",
  "home.howItWorks.step3.label": "We do",
  "home.howItWorks.step3.title": "Print the book",
  "home.howItWorks.step3.description":
    "We print your personal book in high quality and ship it to your home – ready to use and cherish.",
  "home.howItWorks.cta": "Get Started Now",
  "home.howItWorks.ctaAriaLabel": "Start creating a book now",
  "home.dualDesign.title": "Your Photo – For First Focus and First Colors",
  "home.dualDesign.titleHighlight": "Your",
  "home.dualDesign.description":
    "We convert each photo into two versions – one in black and white designed for initial visual stimulation, and one colorful that's suitable for when the baby already recognizes colors.",
  "home.dualDesign.bw.title": "Black and White",
  "home.dualDesign.bw.description":
    "This side is especially suitable for babies from birth to 3 months old — exactly when they begin to recognize strong contrasts.",
  "home.dualDesign.color.title": "Colorful",
  "home.dualDesign.color.description":
    "The colorful side is perfect for 3 months and up – when vision develops and the world around them begins to fill with colors.",
  "home.dualDesign.moreExamples": "Want to see more examples?",
  "home.dualDesign.moreExamplesLink": "Discover here",
  "home.special.title": "What Makes Our Book Special",
  "home.special.titleHighlight": "Special",
  "home.special.ariaLabel": "What makes our book special",
  "home.special.item1.title": "Look at the closest ones",
  "home.special.item1.description":
    "The faces of the primary caregivers are familiar to the baby and soothe them from their first days",
  "home.special.item1.imageAlt": "Young couple",
  "home.special.item2.title": "Meet the family",
  "home.special.item2.description":
    "An opportunity to be exposed to and look at the family the baby is joining",
  "home.special.item2.imageAlt": "Young sister",
  "home.special.item3.title": "Sweet keepsake",
  "home.special.item3.description":
    "A book that is personal and serves as a keepsake for a short and wonderful period in the baby's life",
  "home.special.item3.imageAlt": "Parent and son",
  "home.special.item4.title": "No more generic products",
  "home.special.item4.description":
    "Instead of looking at shapes and patterns, let your baby look at the family",
  "home.special.item4.imageAlt": "Dad and son",
  "home.about.brand": "Little Gali",
  "home.about.title": "Who We Are",
  "home.about.titleHighlight": "We",
  "home.about.imageAlt": "Little Gali team photo",
  "home.about.paragraph1":
    "I opened Little Gali about two months after Gali was born, mainly out of curiosity and a desire to create something new. I found myself investing more and more into it: thinking about the product, designing, building the website, and especially getting excited about every new order.",
  "home.about.paragraph2":
    "Very quickly I understood this wasn't just a creative process for me. The feedback from mothers who received the book highlighted that there's something else here - personal and special. A product that I would also choose for my Gali, maybe that's why she continues to receive more and more books until now.",
  "home.about.paragraph3":
    "The book was born as a product for babies, but also as an original gift: one with thought and personal connection, and one you want to keep at home not just for use — but also as an object that's pleasant to look at.",
  "home.qa.title": "Ask Us",
  "home.qa.titleHighlight": "Us",
  "home.qa.subtitle":
    "Answers to the most common questions about our book and services",
  "home.qa.cta": "All Questions and Answers",
  "home.qa.ctaAriaLabel": "Go to full Q&A page",
  "home.comingSoon.title": "Something Special Coming Soon",
  "home.comingSoon.titleHighlight": "Special",
  "home.comingSoon.comingSoon": "Coming Soon",
  "home.comingSoon.productName": "Special Fabric Books",
  "home.comingSoon.subtitle":
    "Fabric books that contain your photos.\nLeave your email and we'll make sure to update you first when they arrive",
  "home.comingSoon.emailPlaceholder": "Your email address",
  "home.comingSoon.button": "Notify Me",
  "home.comingSoon.submitting": "Sending...",
  "home.comingSoon.error": "Invalid email address",
  "home.comingSoon.errorGeneric": "Something went wrong, please try again",
  "home.comingSoon.success": "Thank you! We'll update you when the product is available",
  "home.comingSoon.successTitle": "Thank You!",
  "home.comingSoon.successMessage": "We'll update you when the fabric books arrive",
  "home.comingSoon.imageAlt": "Coming soon product image",
  "home.testimonials.title": "What People Say About Us",
  "home.testimonials.titleHighlight": "Say",
  "qa.question1": "What is the book made of?",
  "qa.answer1":
    "The book is made of high-quality, thick paper that has been laminated. The book is stable and can be easily stood up.",
  "qa.question2": "How many photos should I choose?",
  "qa.answer2":
    "Only 5 photos. The same photos appear on one side in black and white and on the other side in color.",
  "qa.question3": "Who should be in the book?",
  "qa.answer3":
    "Anyone you want to show your baby. Some ideas: close family, extended family, friends, pets.",
  "qa.question4": "What kind of photo is suitable?",
  "qa.answer4":
    "Technically speaking, the best photos are those where you can clearly see the faces, not in profile and with good lighting. Non-technically, the photos that turn out most beautiful are those that \"capture\" a special moment, photos of smiles and fun. The kind of things that are hard to explain in words but easy to feel.",
  "qa.question5": "Can I put multiple people in one photo?",
  "qa.answer5":
    "Yes, absolutely. Just make sure that all the faces of the people in the photo are clearly visible and that it's not too crowded, as this can affect the quality of the result.",
  "qa.question6": "Does the background matter?",
  "qa.answer6":
    "No. The background is automatically removed and replaced with white.",
  "qa.question7": "How do I clean the book?",
  "qa.answer7":
    "You can gently wipe with a damp cloth. Avoid direct contact with water.",
  "qa.question8": "How long does it take to prepare the book?",
  "qa.answer8":
    "The preparation process takes up to 14 business days from the moment we receive the photos. We will notify you when the book is ready for pickup or shipping.",
  "qa.question9": "What if I'm not satisfied with the book?",
  "qa.answer9":
    "Our goal is for you to love and be satisfied with your book. If you received the book and something didn't work for you as you expected, feel free to reach out to me.",
  "qa.notFound": "Didn't find the answer you were looking for?",
  "qa.contact": "Contact Us",

  // Footer
  "footer.description":
    "Little Gali transforms regular photos into delicate black and white creations that are especially suitable for baby vision. Born from a mother who loved seeing her baby drawn to familiar faces.",
  "footer.platform": "Platform",
  "footer.howItWorks": "How It Works",
  "footer.photoGuide": "Photo Selection Guide",
  "footer.inspiration": "Inspiration Gallery",
  "footer.policies": "Policies",
  "footer.terms": "Terms of Service",
  "footer.privacy": "Privacy",
  "footer.shipping": "Shipping",
  "footer.returns": "Returns",
  "footer.about": "About",
  "footer.whoWeAre": "Who We Are",
  "footer.contact": "Contact",
  "footer.contactUs": "Contact Us",
  "footer.copyright": "© Copyright Little Gali. All rights reserved.",

  // Contact Page
  "contact.title": "Contact Us",
  "contact.titleHighlight": "Contact",
  "contact.name": "Name",
  "contact.email": "Email",
  "contact.message": "Message",
  "contact.namePlaceholder": "Enter your name",
  "contact.emailPlaceholder": "Enter your email address",
  "contact.messagePlaceholder": "Leave your message here...",
  "contact.submit": "Send Message",
  "contact.submitting": "Sending...",
  "contact.success": "Message sent successfully!",
  "contact.error": "Error sending message. Please try again.",
  "contact.serverError": "Server error. Please try again later.",

  // Upload Page
  "upload.title": "Let's Create a Personalized Book for Your Baby",
  "upload.titleHighlight": "Personalized",
  "upload.description":
    "Select 5 photos that will appear in the book.\nThe five photos will appear on one side in black and white and on the other in color.",
  "upload.imagesCount": "out of 5 photos",
  "upload.selectExactly5": "Please select exactly 5 photos",
  "upload.waitForUpload": "Please wait until photos finish uploading",
  "upload.serverError": "Server error. Please try again later.",
  "upload.addingToCart": "Adding to cart...",
  "upload.uploading": "Uploading photos...",
  "upload.uploadingAndAdding": "Uploading photos and adding to cart...",
  "upload.updating": "Updating...",
  "upload.addToCart": "Add to Cart",
  "upload.dragToReorder": "Drag the images to choose the order that will appear in the booklet",
  "upload.startOver": "Start Over",
  "upload.photoTip": "What kind of photo should I upload?",
  "upload.photoNote":
    "No need for a perfect photo, we'll make sure the faces, expressions, and human warmth in the photo come through.",

  // Style Selector
  "styleSelector.title": "Choose Your Style:",
  "styleSelector.subtitle":
    "The style will affect the colorful side of the image",
  "styleSelector.cartoon": "Cartoon",
  "styleSelector.pencil": "Pencil",
  "styleSelector.watercolor": "Watercolor",
  "styleSelector.cartoonDescription": "Colorful, vibrant and full of character",
  "styleSelector.pencilDescription": "Detailed, soft and natural",
  "styleSelector.watercolorDescription": "Artistic, colorful",
  "styleSelector.cartoonAlt": "Cartoon - Cartoon style",
  "styleSelector.pencilAlt": "Pencil - Pencil style",
  "styleSelector.watercolorAlt": "Watercolor - Watercolor style",
  "styleSelector.modal.title": "What's the difference?",
  "styleSelector.modal.subtitle":
    "Choose your preferred style for the colorful side:",
  "styleSelector.modal.cartoon.bold": "Colorful illustration inspired by children's books",
  "styleSelector.modal.cartoon.vibrant": "Free lines with a happy, storytelling look",
  "styleSelector.modal.cartoon.modern": "Emphasizes character and feeling over small details",
  "styleSelector.modal.cartoon.stylized": "Perfect for those seeking an illustrated, playful style",
  "styleSelector.modal.pencil.soft": "Colored pencil illustration",
  "styleSelector.modal.pencil.delicate": "Soft, natural and artistic look",
  "styleSelector.modal.pencil.handDrawn": "Preserves details, expressions and character recognition",
  "styleSelector.modal.pencil.realistic": "Perfect for those who want results close to the original photo",
  "styleSelector.modal.watercolor.artistic": "Watercolor illustration",
  "styleSelector.modal.watercolor.colorful": "Artistic, soft and unique look",
  "styleSelector.modal.watercolor.fluid": "Emphasizes expressions, light and emotion",
  "styleSelector.modal.watercolor.unique": "Works especially well with close-up shots",
  "styleSelector.modal.watercolor.notSuitable": "Less suitable for photos with many people",
  "styleSelector.modal.bottomNote": "Both styles produce beautiful, quality results – the choice is between accuracy and illustrated look.",
  "styleSelector.modal.gotIt": "Got it!",

  // Upload Modal
  "uploadModal.title": "Which Photo Should You Choose?",
  "uploadModal.subtitle": "Choose a photo where everyone's faces are clearly visible.",
  "uploadModal.facingCamera": "Faces facing the camera (not in profile)",
  "uploadModal.eyesVisible": "Eyes are clearly visible",
  "uploadModal.facesNotCut": "Faces are complete and not cut off",
  "uploadModal.goodLightingClear": "Good and clear lighting (not too dark or shadowed)",
  "uploadModal.choose": "Recommended to Choose",
  "uploadModal.avoid": "Recommended to Avoid",
  "uploadModal.clearFaces": "Clear faces",
  "uploadModal.visibleEyes": "Eyes are visible",
  "uploadModal.goodLighting": "Good lighting",
  "uploadModal.oneOrTwo": "One or two people in the photo",
  "uploadModal.naturalSmile": "Natural smile",
  "uploadModal.noBWFilter": "Black and white filter",
  "uploadModal.notTooClose": "Too close to the face",
  "uploadModal.notBlurry": "Blurry or far away",
  "uploadModal.noGroup": "Group photo",
  "uploadModal.noSunglasses": "Sunglasses or hat",
  "uploadModal.important": "Important:",
  "uploadModal.importantNote":
    "The faces in the photo should be clearly visible",
  "uploadModal.chooseFromDevice": "Choose from Device",
  "uploadModal.privacy":
    "The photos will only be used to create your personalized booklet",
  "uploadModal.tooCloseExample": "Too close example",
  "uploadModal.groupExample": "Group example",
  "uploadModal.goodExample1": "Good example 1",
  "uploadModal.goodExample2": "Good example 2",

  // Top Banner
  "banner.shipping": "Free Shipping Nationwide",
  "banner.freeCard": "Free Personalized Greeting Card",

  // Gift Cards
  "giftCard.title": "Gift Card for Personalized Book",
  "giftCard.titleHighlight": "Gift Card",
  "giftCard.description": "Want to give our book as a gift but prefer to let them choose the photos and style themselves?\nThat's exactly what our gift card is for.\nAfter payment, you'll receive the gift card details by email which you can pass on as a personal and special gift.",
  "giftCard.selectOption": "Select Option:",
  "giftCard.addToCart": "Add to Cart",
  "giftCard.adding": "Adding...",
  "giftCard.ariaLabel": "Add gift card to cart",
  "giftCard.option1": "One Personalized Book (No Shipping)",
  "giftCard.option2": "One Personalized Book (With Shipping)",
  "giftCard.option3": "Two Personalized Books (No Shipping)",
  "giftCard.option4": "Two Personalized Books (With Shipping)",
  "giftCard.feature1": "Second book for ₪99",
  "giftCard.feature2": "Choice of 5 photos",
  "giftCard.feature3": "Choice of style",
  "giftCard.feature4": "No expiration date",

  // Cookie Consent
  "cookieConsent.title": "Cookies & Tracking",
  "cookieConsent.description": "We use cookies to improve your browsing experience and analyze site usage.",
  "cookieConsent.accept": "Accept",
  "cookieConsent.decline": "Decline",
  "cookieConsent.learnMore": "Learn More",
  "cookieConsent.ariaLabel": "Cookie and tracking notice",
};
