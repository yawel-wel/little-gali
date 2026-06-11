"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

export type Locale = "he" | "en";

function readSavedLocale(): Locale {
  if (typeof window === "undefined") {
    return "he";
  }
  try {
    const savedLocale = localStorage.getItem("locale");
    if (savedLocale === "he" || savedLocale === "en") {
      return savedLocale;
    }
  } catch {
    // Private mode / storage blocked — use default Hebrew
  }
  return "he";
}

function writeSavedLocale(locale: Locale): void {
  try {
    localStorage.setItem("locale", locale);
  } catch {
    // ignore quota / blocked storage
  }
}

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
  const [locale, setLocaleState] = useState<Locale>(() => readSavedLocale());

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
    writeSavedLocale(newLocale);
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
  "nav.fabricBook": "הרשמה לספרוני בד",
  "nav.contact": "צור קשר",
  "nav.createBook": "צרו ספרון",
  "nav.menuAriaLabel": "תפריט ניווט ראשי",
  "nav.mainNavAriaLabel": "ניווט ראשי",
  "nav.createBookAriaLabel": "עבור לעמוד יצירת ספרון",

  // Accessibility
  "accessibility.skipToMain": "דלג לתוכן הראשי",
  "accessibility.openMenu": "פתח תפריט",
  "accessibility.openCart": "פתח עגלת קניות",
  "accessibility.close": "סגור",
  "accessibility.changeLanguage": "שנה שפה",
  "accessibility.selectLanguage": "בחר שפה",
  "accessibility.cartTitle": "עגלת קניות",
  "accessibility.expandImage": "הגדל תמונה",
  "accessibility.homeLink": "Little Gali - דף הבית",

  // Top Banner
  "banner.shipping": "משלוחים לכל הארץ",
  "banner.freeCard": "הוספת כרטיס ברכה אישי בחינם",
  "banner.ariaLabel": "הודעות מבצעים",

  // Cart
  "cart.title": "עגלת הקניות",
  "cart.titleHighlight": "עגלה",
  "cart.empty": "העגלה שלך ריקה",
  "cart.total": "סה״כ:",
  "cart.checkout": "המשך לתשלום",
  "cart.viewFull": "צפה בעגלה המלאה",
  "cart.loading": "טוען...",
  "cart.addingItem": "מוסיפים לעגלה...",
  "cart.removeItem": "הסרת פריט מהעגלה",
  "cart.increaseQuantity": "הגדלת כמות",
  "cart.decreaseQuantity": "הקטנת כמות",
  "cart.removeConfirm": "האם אתה בטוח שברצונך להסיר את הפריט מהעגלה?",
  "cart.remove": "הסר",
  "cart.removeFailed": "לא הצלחנו להסיר את הפריט, נסו שוב",
  "cart.clearAll": "נקו עגלה והתחילו מחדש",
  "cart.quantityUpdateFailed": "לא הצלחנו לעדכן את הכמות. נקו את העגלה והתחילו מחדש.",
  "cart.cancel": "ביטול",
  "cart.quantity": "כמות:",
  "cart.styleLabel": "סגנון:",
  "cart.colorLabel": "צבע:",
  "cart.lineTotal": "סך הכל:",
  "cart.discountApplied": "הנחה חלה על המוצר 🎉",
  "cart.itemTotal": "סה״כ לפריט:",
  "cart.style": "סגנון:",
  "cart.colorStyle": "סגנון צבעוני:",
  "cart.style.cartoon": "קריקטורה",
  "cart.style.pencil": "עיפרון",
  "cart.style.watercolor": "צבעי מים",
  "cart.book": "ספר נייר",
  "cart.orderSummary": "סיכום הזמנה",
  "cart.itemsCount": "כמות פריטים:",
  "cart.deliveryTime": "זמן אספקה עד 14 ימי עסקים",
  "cart.shareConsent": "אפשר לשתף את הספרון שלי בעמוד של ליטל גלי כהשראה",
  "cart.shareConsentNote": "בלי שמות או פרטים מזהים",
  "cart.addGiftMessage": "הוסף ברכה למתנה",
  "cart.giftMessagePlaceholder": "הכניסו את הברכה שלכם (עד 200 אותיות)",
  "cart.readyMessage": "הודעה תשלח כשהספרון מוכן בשביל תיאום משלוח",
  "cart.checkoutProgress": "מעבר לתשלום...",
  "cart.addBook": "הוסף ספרון",
  "cart.secondBook": "כל ספרון שני ב-139 ₪ 🎉",
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

  // Styles Page
  "styles.title": "גלו את הסגנונות שלנו",
  "styles.titleHighlight": "שלנו",
  "styles.subtitle": "ראו כיצד תמונות אמיתיות הופכות לאמנות ייחודית בכל סגנון",
  "styles.hero.description": "כל ספרון מגיע עם צד שחור-לבן לגירוי ראייה (0-3 חודשים) וצד צבעוני בסגנון שבחרתם. הנה כמה דוגמאות:",
  "styles.bw.title": "שחור-לבן (אוטומטי)",
  "styles.bw.description": "כל ספרון כולל אוטומטית צד שחור-לבן המיועד לגירוי ראייה בחודשים הראשונים של התינוק (0-3 חודשים). הניגודיות החזקה עוזרת לפיתוח הראייה של התינוק.",
  "styles.bw.imageAlt": "דוגמה לתמונה בשחור-לבן",
  "styles.colorful.title": "הסגנונות הצבעוניים",
  "styles.colorful.description": "בחרו את הסגנון המועדף עליכם לצד הצבעוני:",
  "styles.cartoon.title": "קריקטורה",
  "styles.cartoon.subtitle": "צבעוני, חי ומלא אופי",
  "styles.cartoon.description": "איור צבעוני בהשראת ספרי ילדים. קווים חופשיים ומראה שמח וסיפורי, מושלם לתינוקות שאוהבים צבעים עזים וחיים.",
  "styles.pencil.title": "עיפרון",
  "styles.pencil.subtitle": "מדויק לפרטים, רך וטבעי",
  "styles.pencil.description": "סגנון עיפרון עדין עם קווים רכים וטבעיים. שומר על פרטים עדינים ומעניק מראה אמנותי ומתוחכם.",
  "styles.watercolor.title": "צבעי מים",
  "styles.watercolor.subtitle": "ציורי ואומנותי",
  "styles.watercolor.description": "סגנון צבעי מים אומנותי עם מעברי צבע רכים ומראה ציורי. יוצר אפקט חלומי ומרגיע.",
  "styles.before": "לפני",
  "styles.after": "אחרי",
  "styles.cta": "צרו את הספרון שלכם",
  "styles.ctaAriaLabel": "עבור לעמוד יצירת ספרון",
  "styles.backHome": "חזרה לדף הבית",

  // Terms of Service
  "terms.title": "תנאי השירות",
  "terms.intro.p1": "ברוכים הבאים לאתר Little Gali.",
  "terms.intro.p2":
    "השימוש באתר והשירותים הניתנים בו כפופים לתנאים המפורטים להלן. בעת גלישה באתר, שימוש בשירותים או ביצוע הזמנה, אתם מאשרים כי קראתם והסכמתם לתנאים אלה במלואם.",
  "terms.useOfSite.title": "שימוש באתר",
  "terms.useOfSite.p1":
    "האתר מאפשר הזמנת מוצרים מותאמים אישית המבוססים על תמונות שהמשתמש מעלה, לרבות ספרוני בד לתינוקות, איורים מודפסים ותמונות ממוסגרות.",
  "terms.useOfSite.p2": "השימוש באתר מותר למטרות אישיות ופרטיות בלבד.",
  "terms.useOfSite.p3":
    "חל איסור להשתמש באתר למטרות מסחריות ללא אישור מראש, להעלות תוכן פוגעני, בלתי חוקי או תמונות שאינן בבעלות המשתמש.",
  "terms.userResponsibility.title": "אחריות המשתמש",
  "terms.userResponsibility.p1":
    "המשתמש מצהיר כי יש בידיו את כל הזכויות וההרשאות הנדרשות לשימוש בתמונות שהוא מעלה לאתר.",
  "terms.userResponsibility.p2":
    "המשתמש אחראי לוודא כי השימוש בתמונות אינו מפר זכויות יוצרים, זכויות פרטיות או כל דין אחר.",
  "terms.userResponsibility.p3":
    "המשתמש אחראי לקבל את הסכמתם של כל האנשים המופיעים בתמונות, ככל שנדרש.",
  "terms.userResponsibility.p4":
    "כל האחריות המשפטית בגין התוכן שהועלה לאתר חלה על המשתמש בלבד.",
  "terms.ordersAndPayment.title": "הזמנות ותשלום",
  "terms.ordersAndPayment.p1":
    "המחירים באתר מוצגים במטבע המצוין בעמוד ההזמנה וכוללים מע״מ בהתאם לחוק, ככל שנדרש.",
  "terms.ordersAndPayment.p2": "התשלום מתבצע באמצעות מערכת סליקה מאובטחת.",
  "terms.ordersAndPayment.p3":
    "ההזמנה תיחשב סופית לאחר אישור התשלום וקבלת אישור ההזמנה.",
  "terms.ordersAndPayment.p4":
    "Little Gali שומרת לעצמה את הזכות לבטל הזמנה במקרה של טעות במחיר, תקלה טכנית, חוסר זמינות של מוצר, חשש לשימוש בלתי תקין באתר או כל סיבה סבירה אחרת.",
  "terms.productProduction.title": "הפקת המוצרים",
  "terms.productProduction.p1":
    "המוצרים באתר מיוצרים בהתאמה אישית על בסיס התמונות שהועלו ואושרו על ידי הלקוח במהלך תהליך ההזמנה.",
  "terms.productProduction.p2":
    "חלק מהמוצרים כוללים עיבוד דיגיטלי או יצירת איורים המבוססים על התמונות שהועלו. למרות שאנו שואפים לשמור על דמיון מרבי לתמונות המקור, ייתכנו הבדלים מסוימים בין התמונה המקורית לבין התוצאה הסופית.",
  "terms.productProduction.p3":
    "התצוגה באתר נועדה להמחשה בלבד, וייתכנו הבדלים קלים בין התצוגה הדיגיטלית לבין המוצר המודפס בפועל.",
  "terms.customProducts.title": "מוצרים מותאמים אישית",
  "terms.customProducts.p1":
    "מאחר שהמוצרים מיוצרים במיוחד עבור כל לקוח ובהתאם לתמונות שסופקו על ידו, לא ניתן לבטל, לשנות או להחזיר הזמנה לאחר אישור ההזמנה וביצוע התשלום, למעט במקרים המפורטים במדיניות ההחזרים של האתר או בהתאם להוראות הדין.",
  "terms.warrantyAndService.title": "אחריות ושירות",
  "terms.warrantyAndService.p1":
    "אנו משקיעים מאמצים רבים כדי לספק מוצרים איכותיים והדפסות באיכות גבוהה.",
  "terms.warrantyAndService.p2":
    "עם זאת, ייתכנו הבדלים קלים בגוונים, בצבעים, בחיתוך, במרקם, בניגודיות או במיקום האלמנטים בין התצוגה על מסכים שונים לבין המוצר המודפס בפועל.",
  "terms.warrantyAndService.p3":
    "הבדלים סבירים אלו אינם נחשבים לפגם ואינם מהווים עילה לביטול עסקה.",
  "terms.warrantyAndService.p4":
    "במקרה של פגם בייצור או נזק שנגרם במהלך המשלוח, ניתן לפנות אלינו ונפעל בהתאם למדיניות ההחזרים של האתר.",
  "terms.safeUse.title": "שימוש בטוח במוצרים",
  "terms.safeUse.books.title": "ספרוני בד לתינוקות",
  "terms.safeUse.books.p1": "הספרונים מיועדים לשימוש בהשגחת מבוגר בלבד.",
  "terms.safeUse.books.p2":
    "הספרונים עשויים מבד וכוללים תמונות מודפסות המוכנסות לכיסים ייעודיים.",
  "terms.safeUse.books.p3":
    "למרות שהספרונים מיועדים לשימוש על ידי תינוקות וילדים צעירים, מומלץ לבדוק את תקינותם מעת לעת ולהפסיק את השימוש במקרה של בלאי, קרע או נזק כלשהו.",
  "terms.safeUse.books.p4":
    "התמונות המודפסות מיועדות לשימוש כחלק מהספרון, ומומלץ להחזירן לכיסים הייעודיים לאחר השימוש.",
  "terms.safeUse.books.p5": "אין להשאיר את המוצר ללא השגחה בקרבת תינוק או פעוט.",
  "terms.safeUse.framed.title": "תמונות ממוסגרות",
  "terms.safeUse.framed.p1":
    "התמונות הממוסגרות מסופקות עם אמצעי תלייה בהתאם לדגם.",
  "terms.safeUse.framed.p2":
    "בעת שימוש במדבקות התלייה, מומלץ שלא להדביקן על טפטים, צבע מתקלף, קירות סדוקים, משטחים עדינים או משטחים שאינם מתאימים להדבקה.",
  "terms.safeUse.framed.p3":
    "למרות שהמדבקות מיועדות להסרה, הסרתן עלולה במקרים מסוימים לגרום לפגיעה קלה בצבע, בציפוי או במשטח הקיר.",
  "terms.safeUse.framed.p4":
    "האחריות לבחירת מיקום התלייה, התאמת המשטח ואופן ההתקנה מוטלת על הלקוח בלבד.",
  "terms.safeUse.framed.p5":
    "ניתן לתלות את המסגרות גם באמצעות מסמר או אמצעי תלייה חלופי המתאים לסוג הקיר.",
  "terms.safeUse.framed.p6":
    "מטעמי בטיחות, מומלץ שלא לתלות מסגרות מעל מיטות תינוק, עריסות או אזורי שינה של ילדים.",
  "terms.safeUse.framed.p7":
    "Little Gali אינה אחראית לנזק שייגרם לקירות, למשטחים, לחפצים או לאנשים כתוצאה מהתקנה לא נכונה, שימוש שלא בהתאם להוראות או אי התאמה של משטח ההתקנה.",
  "terms.intellectualProperty.title": "קניין רוחני",
  "terms.intellectualProperty.p1":
    "כל זכויות היוצרים, העיצובים, האיורים, התמונות, התוכן, סימני המסחר והקוד באתר שייכים ל-Little Gali או נמצאים בשימוש חוקי מטעמה.",
  "terms.intellectualProperty.p2":
    "אין להעתיק, להפיץ, לשכפל, לפרסם, למכור או לעשות כל שימוש בתוכן האתר ללא אישור מראש ובכתב.",
  "terms.liabilityLimitation.title": "הגבלת אחריות",
  "terms.liabilityLimitation.p1": "השימוש באתר ובמוצרים נעשה באחריות המשתמש בלבד.",
  "terms.liabilityLimitation.p2":
    "Little Gali אינה אחראית לנזקים עקיפים, אובדן מידע, אובדן רווחים או כל נזק תוצאתי אחר הנובע מהשימוש באתר, בשירותים או במוצרים.",
  "terms.liabilityLimitation.p3":
    "בכל מקרה, אחריותה של Little Gali לא תעלה על סכום ההזמנה ששולם בפועל על ידי הלקוח.",
  "terms.termsChanges.title": "שינוי תנאים",
  "terms.termsChanges.p1":
    "Little Gali שומרת לעצמה את הזכות לעדכן או לשנות את תנאי השירות מעת לעת.",
  "terms.termsChanges.p2":
    "הגרסה העדכנית תפורסם באתר, והמשך השימוש באתר לאחר פרסום העדכון יהווה הסכמה לתנאים המעודכנים.",
  "terms.contact.title": "יצירת קשר",
  "terms.contact.p1":
    "לשאלות, הבהרות או פניות בנושא תנאי השירות ניתן ליצור קשר באמצעות עמוד",
  "terms.contact.link": "צרו קשר",
  "terms.contact.p2": "באתר או בדוא״ל:",

  // Privacy Policy
  "privacy.title": "מדיניות פרטיות",
  "privacy.intro.title": "מבוא",
  "privacy.intro.p1":
    "ב-Little Gali אנו מכבדים את פרטיות לקוחותינו ומחויבים להגן על המידע האישי שנמסר לנו.",
  "privacy.intro.p2":
    "מדיניות פרטיות זו מסבירה אילו סוגי מידע אנו אוספים, כיצד אנו משתמשים בו, עם מי אנו עשויים לשתף אותו ומהן זכויותיך בקשר למידע זה.",
  "privacy.intro.p3": "השימוש באתר מהווה הסכמה למדיניות פרטיות זו.",
  "privacy.collection.title": "איזה מידע אנו אוספים?",
  "privacy.collection.youProvide.title": "מידע שאתה מוסר לנו",
  "privacy.collection.youProvide.p1":
    "בעת ביצוע הזמנה או יצירת קשר עם העסק, אנו עשויים לאסוף:",
  "privacy.collection.youProvide.li1": "שם מלא",
  "privacy.collection.youProvide.li2": "כתובת דואר אלקטרוני",
  "privacy.collection.youProvide.li3": "מספר טלפון",
  "privacy.collection.youProvide.li4": "כתובת למשלוח",
  "privacy.collection.youProvide.li5": "פרטי ההזמנה",
  "privacy.collection.youProvide.li6": "תמונות ותוכן שמועלים לאתר",
  "privacy.collection.youProvide.p2":
    "בעת שימוש בשירותי Little Gali, ניתן להעלות תמונות לצורך יצירת מוצרים מותאמים אישית, כגון ספרוני בד לתינוקות, איורים ותמונות ממוסגרות.",
  "privacy.collection.youProvide.p3":
    "התמונות משמשות לצורך הפקת המוצר שהוזמן בלבד.",
  "privacy.collection.technical.title": "מידע טכני ונתוני שימוש",
  "privacy.collection.technical.p1": "בעת הגלישה באתר אנו עשויים לאסוף מידע כגון:",
  "privacy.collection.technical.li1": "כתובת IP",
  "privacy.collection.technical.li2": "סוג הדפדפן והמכשיר",
  "privacy.collection.technical.li3": "עמודים שנצפו באתר",
  "privacy.collection.technical.li4": "זמן השהייה באתר",
  "privacy.collection.technical.li5":
    "פעולות שבוצעו במהלך השימוש באתר, כגון צפייה בעמודים, לחיצות על כפתורים, העלאת תמונות, התחלת תהליך הזמנה, השלמת הזמנה ושימוש בפיצ'רים שונים באתר",
  "privacy.usage.title": "כיצד אנו משתמשים במידע?",
  "privacy.usage.intro": "אנו משתמשים במידע שנאסף לצורך:",
  "privacy.usage.li1": "עיבוד והפקת ההזמנות",
  "privacy.usage.li2": "אספקת המוצרים והשירותים",
  "privacy.usage.li3": "יצירת איורים ועיבוד התמונות שהועלו",
  "privacy.usage.li4": "מתן שירות לקוחות ומענה לפניות",
  "privacy.usage.li5": "שיפור האתר וחוויית המשתמש",
  "privacy.usage.li6": "אבטחת האתר ומניעת שימוש לרעה",
  "privacy.usage.li7": "שליחת עדכונים הקשורים להזמנה",
  "privacy.usage.li8": "שליחת תוכן שיווקי, בכפוף להסכמה כאשר נדרשת",
  "privacy.imageProcessing.title": "עיבוד תמונות ויצירת איורים",
  "privacy.imageProcessing.p1":
    "לצורך יצירת המוצרים המותאמים אישית, התמונות המועלות לאתר עשויות לעבור עיבוד דיגיטלי או שימוש בכלים מבוססי בינה מלאכותית (AI).",
  "privacy.imageProcessing.p2":
    "העיבוד מבוצע אך ורק לצורך יצירת המוצר שהוזמן ואינו מקנה ל-Little Gali כל בעלות על התמונות שהועלו על ידי הלקוח.",
  "privacy.analytics.title": "כלי ניתוח ומעקב",
  "privacy.analytics.intro":
    "האתר משתמש בכלים המסייעים לנו להבין כיצד מבקרים משתמשים באתר ולשפר את השירותים והמוצרים שלנו.",
  "privacy.analytics.ga.title": "Google Analytics",
  "privacy.analytics.ga.p":
    "Google Analytics מספק מידע סטטיסטי על תנועת הגולשים באתר, עמודים שנצפו, מקורות תנועה ופעולות שבוצעו באתר.",
  "privacy.analytics.mixpanel.title": "Mixpanel",
  "privacy.analytics.mixpanel.p1":
    "Mixpanel הוא כלי ניתוח התנהגות משתמשים המסייע לנו להבין כיצד מבקרים משתמשים באתר ובתהליך ההזמנה.",
  "privacy.analytics.mixpanel.p2":
    "באמצעות Mixpanel אנו עשויים למדוד פעולות כגון צפייה בעמודים, לחיצות על כפתורים, התקדמות בשלבי ההזמנה, העלאת תמונות, יצירת תצוגות מקדימות ופעולות נוספות המתבצעות באתר.",
  "privacy.analytics.mixpanel.p3":
    "המידע משמש לצורך ניתוח ביצועים, זיהוי תקלות, שיפור חוויית המשתמש ושיפור תהליך ההזמנה.",
  "privacy.analytics.meta.title": "Meta Pixel",
  "privacy.analytics.meta.p":
    "Meta Pixel מאפשר למדוד את יעילות הפרסום שלנו בפייסבוק ובאינסטגרם, להבין אילו פעולות בוצעו באתר ולבצע אופטימיזציה של קמפיינים פרסומיים.",
  "privacy.analytics.cookiesNote":
    "כלים אלה עשויים לאסוף מידע באמצעות עוגיות (Cookies), מזהי מכשיר וטכנולוגיות דומות.",
  "privacy.cookies.title": "עוגיות (Cookies)",
  "privacy.cookies.intro": "האתר משתמש בעוגיות ובטכנולוגיות דומות לצורך:",
  "privacy.cookies.li1": "תפעול תקין של האתר",
  "privacy.cookies.li2": "שמירת העדפות משתמש",
  "privacy.cookies.li3": "מדידת ביצועים",
  "privacy.cookies.li4": "ניתוח תנועה",
  "privacy.cookies.li5": "שיווק ופרסום",
  "privacy.cookies.note":
    "ניתן לחסום או למחוק עוגיות באמצעות הגדרות הדפדפן, אולם פעולה זו עלולה להשפיע על חלק מפונקציות האתר.",
  "privacy.sharing.title": "שיתוף מידע עם צדדים שלישיים",
  "privacy.sharing.p1":
    "איננו מוכרים או משכירים מידע אישי לצדדים שלישיים.",
  "privacy.sharing.intro": "ייתכן שנשתף מידע עם:",
  "privacy.sharing.li1": "ספקי שירות טכנולוגיים המסייעים בהפעלת האתר",
  "privacy.sharing.li2": "ספקי אחסון ושירותי ענן",
  "privacy.sharing.li3": "שירותי סליקה ותשלומים",
  "privacy.sharing.li4": "חברות שילוח ואספקה",
  "privacy.sharing.li5": "ספקי ניתוח, מדידה ופרסום כגון Google, Mixpanel ו-Meta",
  "privacy.sharing.li6":
    "ספקי שירות המשמשים לעיבוד תמונות ויצירת איורים כחלק מתהליך הפקת המוצרים",
  "privacy.sharing.li7": "רשויות מוסמכות כאשר הדבר נדרש על פי דין",
  "privacy.sharing.p2":
    "כל שיתוף מידע יתבצע רק במידה הנדרשת לצורך מתן השירות.",
  "privacy.retention.title": "שמירת מידע",
  "privacy.retention.p1":
    "אנו שומרים מידע אישי למשך הזמן הנדרש לצורך אספקת השירות, עמידה בדרישות חוקיות, טיפול בפניות לקוחות וניהול העסק.",
  "privacy.retention.p2":
    "תמונות שהועלו לאתר עשויות להישמר למשך תקופה סבירה לאחר השלמת ההזמנה לצורך טיפול בפניות שירות, תיקונים, הפקת הזמנות חוזרות או אספקת עותקים נוספים לבקשת הלקוח.",
  "privacy.security.title": "אבטחת מידע",
  "privacy.security.p1":
    "אנו נוקטים באמצעי אבטחה סבירים ומקובלים לצורך הגנה על המידע האישי שברשותנו.",
  "privacy.security.p2":
    "עם זאת, אין אפשרות להבטיח אבטחה מוחלטת של מידע המועבר דרך האינטרנט, ולכן איננו יכולים להבטיח חסינות מלאה מפני גישה בלתי מורשית.",
  "privacy.rights.title": "הזכויות שלך",
  "privacy.rights.intro": "בכפוף להוראות הדין, באפשרותך:",
  "privacy.rights.li1": "לבקש גישה למידע אישי אודותיך",
  "privacy.rights.li2": "לבקש תיקון של מידע שגוי או לא מעודכן",
  "privacy.rights.li3": "לבקש מחיקת מידע אישי",
  "privacy.rights.li4": "לבקש להפסיק קבלת הודעות שיווקיות",
  "privacy.rights.li5": "למשוך הסכמה שניתנה בעבר, ככל שהדבר רלוונטי",
  "privacy.rights.contact": "למימוש זכויות אלה ניתן לפנות אלינו בדוא״ל:",
  "privacy.changes.title": "שינויים במדיניות הפרטיות",
  "privacy.changes.p1": "אנו רשאים לעדכן מדיניות זו מעת לעת.",
  "privacy.changes.p2":
    "הגרסה העדכנית ביותר תפורסם באתר ותיכנס לתוקף במועד פרסומה.",
  "privacy.contact.title": "יצירת קשר",
  "privacy.contact.p1":
    "לשאלות, בקשות או הבהרות בנוגע למדיניות הפרטיות ניתן לפנות אלינו:",
  "privacy.contact.lastUpdated": "עודכן לאחרונה: יוני 2026",

  // Shipping Policy
  "shipping.title": "מדיניות משלוחים",
  "shipping.deliveryTime.title": "זמן אספקה",
  "shipping.deliveryTime.p1":
    "כל מוצרי Little Gali מיוצרים בהתאמה אישית עבור כל לקוח לאחר ביצוע ההזמנה.",
  "shipping.deliveryTime.p2":
    "זמן ההפקה והאספקה המשוער הוא עד 14 ימי עסקים ממועד אישור ההזמנה והתשלום.",
  "shipping.deliveryTime.p3":
    "זמן האספקה המשוער כולל את זמן הייצור וההכנה של המוצר ואינו מהווה התחייבות למועד מסירה מדויק.",
  "shipping.deliveryTime.p4":
    "אנו עושות את מירב המאמצים לספק את ההזמנות מוקדם ככל האפשר, אולם ייתכנו עיכובים שאינם בשליטתנו, לרבות עומסים בתקופות חגים, עיכובים אצל ספקי שירות חיצוניים, תקלות טכניות או עיכובים מצד חברת השילוח.",
  "shipping.deliveryTime.p5":
    "במקרה של עיכוב חריג, ניצור קשר עם הלקוח ונעדכן לגבי סטטוס ההזמנה.",
  "shipping.costs.title": "עלויות משלוח",
  "shipping.costs.p1":
    "עלות המשלוח מוצגת במהלך תהליך הרכישה ומתווספת למחיר המוצרים.",
  "shipping.costs.p2":
    "המשלוחים מבוצעים באמצעות חברות שילוח חיצוניות בהתאם לאפשרויות הזמינות בעת ביצוע ההזמנה.",
  "shipping.costs.p3":
    "Little Gali שומרת לעצמה את הזכות לעדכן מעת לעת את אפשרויות המשלוח ואת עלויותיהן.",
  "shipping.details.title": "פרטי משלוח",
  "shipping.details.p1":
    "הלקוח אחראי לוודא שכל פרטי ההזמנה וכתובת המשלוח הוזנו בצורה מדויקת ומלאה.",
  "shipping.details.p2":
    "במקרה של כתובת שגויה, כתובת חלקית, מספר טלפון שגוי, אי-זמינות לקבלת המשלוח או כל סיבה אחרת שאינה תלויה ב-Little Gali, ייתכן שייגבה תשלום נוסף עבור משלוח חוזר.",
  "shipping.tracking.title": "מעקב אחר ההזמנה",
  "shipping.tracking.p1":
    "לאחר מסירת החבילה לחברת השילוח, יישלח ללקוח מספר מעקב או עדכון משלוח, בהתאם לשירות המשלוחים הרלוונטי.",
  "shipping.tracking.p2":
    "לאחר שהחבילה נמסרה לחברת השילוח, זמני האספקה בפועל נמצאים באחריות חברת המשלוחים.",
  "shipping.deliveryAreas.title": "אזורי משלוח",
  "shipping.deliveryAreas.p1": "נכון לעכשיו אנו מבצעות משלוחים בישראל בלבד.",
  "shipping.deliveryAreas.p2":
    "ייתכן שבעתיד נרחיב את השירות למדינות נוספות, והמידע יעודכן באתר בהתאם.",
  "shipping.damaged.title": "מוצר שניזוק במהלך המשלוח",
  "shipping.damaged.p1":
    "אם המוצר התקבל כשהוא פגום או ניזוק במהלך המשלוח, יש ליצור קשר בתוך 48 שעות ממועד קבלת ההזמנה.",
  "shipping.damaged.intro": "בפנייה יש לצרף:",
  "shipping.damaged.li1": "מספר הזמנה",
  "shipping.damaged.li2": "תיאור הנזק",
  "shipping.damaged.li3": "תמונות ברורות של המוצר",
  "shipping.damaged.li4": "תמונות של האריזה החיצונית, ככל שניתן",
  "shipping.damaged.p2":
    "לאחר בדיקת הפנייה, ובהתאם לנסיבות, נדאג להחלפת המוצר או למתן פתרון מתאים ללא עלות נוספת.",
  "shipping.undelivered.title": "מוצרים שלא נמסרו",
  "shipping.undelivered.p1":
    "אם חבילה הוחזרה אלינו עקב אי-איסוף, כתובת שגויה, פרטי קשר שגויים או חוסר זמינות של הלקוח, ניתן יהיה לתאם משלוח חוזר בכפוף לתשלום עלות משלוח נוספת.",
  "shipping.contact.title": "יצירת קשר",
  "shipping.contact.p1": "לשאלות או פניות בנושא משלוחים ניתן ליצור קשר באמצעות:",
  "shipping.contact.lastUpdated": "עודכן לאחרונה: יוני 2026",

  // Returns Policy
  "returns.title": "מדיניות החזרים וביטולים",
  "returns.intro":
    "אנו שואפות לספק מוצרים איכותיים ושירות מצוין. אם נתקלתם בבעיה בהזמנה, נשמח לעזור ולמצוא פתרון הוגן.",
  "returns.customized.title": "מוצרים מותאמים אישית",
  "returns.customized.p1":
    "כל מוצרי Little Gali מיוצרים בהתאמה אישית עבור כל לקוח, על בסיס התמונות שסופקו ואושרו במהלך תהליך ההזמנה.",
  "returns.customized.p2":
    "בהתאם לכך, לאחר אישור ההזמנה וביצוע התשלום לא ניתן לבטל, לשנות או להחזיר מוצרים שיוצרו במיוחד עבור הלקוח, למעט במקרים של פגם במוצר, נזק במהלך המשלוח או מקרים אחרים שבהם אנו מחויבים לכך על פי דין.",
  "returns.damage.title": "פגם במוצר או נזק במשלוח",
  "returns.damage.p1": "אנא בדקו את ההזמנה מיד עם קבלתה.",
  "returns.damage.p2":
    "אם המוצר התקבל פגום, ניזוק במהלך המשלוח או יוצר באופן שאינו תואם באופן מהותי את ההזמנה שאושרה על ידי הלקוח, יש ליצור קשר בתוך 48 שעות ממועד קבלת ההזמנה.",
  "returns.damage.intro": "בפנייה יש לצרף:",
  "returns.damage.li1": "מספר הזמנה",
  "returns.damage.li2": "תיאור הבעיה",
  "returns.damage.li3": "תמונות ברורות של המוצר",
  "returns.damage.li4": "תמונות של האריזה החיצונית, ככל שניתן",
  "returns.damage.p3":
    "לאחר בדיקת הפנייה, ובהתאם לנסיבות, נציע החלפה, תיקון, ייצור מחדש או החזר כספי מלא או חלקי, לפי שיקול דעתנו ובהתאם לדין.",
  "returns.unsatisfied.title": "אי־שביעות רצון מהמוצר",
  "returns.unsatisfied.p1":
    "מוצרי Little Gali מבוססים על תמונות המסופקות על ידי הלקוח ועל תהליך יצירה והפקה מותאם אישית.",
  "returns.unsatisfied.p2":
    "לפני השלמת ההזמנה, מוצגת ללקוח תצוגה מקדימה של האיור או העיצוב לצורך אישור.",
  "returns.unsatisfied.p3":
    "לפיכך, אי־שביעות רצון הנובעת מהעדפה אישית, טעם אישי או ציפייה שאינה תואמת את התצוגה שאושרה, אינה מהווה עילה להחזר כספי.",
  "returns.unsatisfied.p4":
    "עם זאת, אם קיימת בעיה חריגה במוצר, אנו מזמינים אתכם לפנות אלינו ונעשה מאמץ למצוא פתרון הוגן לשביעות רצונכם.",
  "returns.variations.title": "שונות טבעית בין תצוגה להדפסה",
  "returns.variations.p1":
    "ייתכנו הבדלים קלים בין התצוגה הדיגיטלית באתר לבין המוצר המודפס בפועל, לרבות הבדלים בגוונים, בצבעים, בחיתוך, בניגודיות, בחדות או באופן שבו צבעים מוצגים על מסכים שונים.",
  "returns.variations.p2":
    "הבדלים סבירים אלה אינם נחשבים לפגם ואינם מהווים עילה להחזר, החלפה או ביטול עסקה.",
  "returns.orderErrors.title": "טעויות בפרטי ההזמנה",
  "returns.orderErrors.p1":
    "באחריות הלקוח לוודא שכל התמונות, הפרטים האישיים וכתובת המשלוח שהוזנו בעת ביצוע ההזמנה נכונים ומלאים.",
  "returns.orderErrors.p2":
    "Little Gali אינה אחראית לטעויות שנגרמו עקב מידע שגוי שסופק על ידי הלקוח.",
  "returns.imageRights.title": "זכויות בתמונות",
  "returns.imageRights.p1":
    "הלקוח מצהיר כי הוא בעל הזכויות בתמונות שהועלו או שקיבל את כל ההרשאות הנדרשות לשימוש בהן.",
  "returns.imageRights.p2": "האחריות לכל תוכן שמועלה לאתר חלה על הלקוח בלבד.",
  "returns.contact.title": "יצירת קשר",
  "returns.contact.p1":
    "לשאלות או פניות בנושא החזרים, ביטולים או בעיות בהזמנה ניתן ליצור קשר באמצעות:",
  "returns.contact.lastUpdated": "עודכן לאחרונה: יוני 2026",

  // Language
  "lang.hebrew": "עברית",
  "lang.english": "English",

  // Home Page
  "home.hero.badge": "ספרון לתינוק מותאם אישית",
  "home.hero.title": "המתנה שתגדל איתם",
  "home.hero.titleHighlight": "איתם",
  "home.hero.subtitle":
    "ספרון אישי שנוצר מהתמונות שלכם - מהחודשים הראשונים ועד שלבי ההתפתחות הבאים",
  "home.hero.cta": "התחילו ליצור",
  "home.hero.ariaLabel": "קטע פתיחה",
  "home.hero.imageAlt": "דוגמאות לספרוני תינוקות",
  "home.hero.ctaAriaLabel": "עבור לעמוד יצירת ספרון",
  "home.gallery.ariaLabel": "גלריית תמונות מלקוחות",
  "home.gallery.imageAlt": "תמונת לקוח {num}",
  "home.book.bwSide": "ספרון בהיר",
  "home.book.colorSide": "ספרון כהה",
  "home.book.title": "הספרון שלנו",
  "home.book.titleHighlight": "שלנו",
  "home.book.subtitle": "ספרון אישי שנוצר מהאנשים|החשובים לכם",
  "home.book.description":
    "חיפשנו ספרון שיציג לתינוק את האנשים שאוהבים אותו - וכשלא מצאנו, יצרנו אחד. מעלים תמונות, אנחנו הופכים אותן לאיורים.",
  "home.book.pill.birthGift": "מתנת לידה",
  "home.book.pill.ai": "טכנולוגית AI",
  "home.book.pill.standards": "באישור מכון התקנים",
  "home.book.pill.stroller": "מתאים לעגלה",
  "home.book.pill.tummyTime": "זמן בטן",
  "home.book.price": "מחיר לספרון",
  "home.book.secondBook": "ספר שני ב-₪139",
  "home.book.discountNote": "הנחה אוטומטית בתשלום",
  "home.book.freePreview": "תצוגה מקדימה חינם לפני הרכישה",
  "home.book.promoLine": "ספר שני ב-₪{price} · הנחה אוטומטית בתשלום",
  "home.book.cta": "צרו את הספרון האישי שלכם",
  "home.book.ariaLabel": "פרטי המוצר - הספרון שלנו",
  "home.book.imageAlt": "תמונה של ספרון הבד",
  "home.book.ctaAriaLabel": "עבור לעמוד יצירת ספרון אישי",
  "home.framedArt.badge": "חדש!",
  "home.framedArt.title": "הפכו תמונה אהובה ליצירת אמנות אישית",
  "home.framedArt.titleHighlight": "אהובה",
  "home.framedArt.subtitle":
    "העלו תמונה, בחרו את סגנון האיור המועדף עליכם, ואנחנו נהפוך אותה לתמונה ממוסגרת ומוכנה לתלייה - ללא קידוח וללא נזק לקיר.",
  "home.framedArt.priceSingle": "תמונה בודדת:",
  "home.framedArt.priceTwo": "2 תמונות:",
  "home.framedArt.priceThree": "3 תמונות:",
  "home.framedArt.priceCardSingle": "תמונה בודדת",
  "home.framedArt.priceCardTwo": "2 תמונות",
  "home.framedArt.priceCardThree": "3 תמונות",
  "home.framedArt.pricePerPhoto": "₪{price} לתמונה",
  "home.framedArt.bestValue": "הכי משתלם",
  "home.framedArt.discountNote": "* ההנחה לסטים מתעדכנת אוטומטית בעגלה",
  "home.framedArt.cta": "התחילו ליצור",
  "home.framedArt.ctaAriaLabel": "עבור ליצירת איור ממוסגר",
  "home.framedArt.ariaLabel": "איור ממוסגר - מוצר חדש",
  "home.framedArt.imageAlt": "דוגמה לאיור ממוסגר",
  "home.framedArt.carouselDotAria": "עבור לתמונה {num} מתוך {total}",
  "home.framedArt.pill.patent": "פטנט ללא קידוח",
  "home.framedArt.pill.removable": "הסרה והזזה קלים",
  "home.framedArt.pill.illustrated": "תמונות מאוירות",
  "home.framedArt.pill.ai": "טכנולוגית AI",
  "home.framedArt.pill.gift": "מתנה מקורית",
  "home.framedArt.freePreview": "תצוגה מקדימה חינם לפני הרכישה",
  "home.framedArt.features.ariaLabel": "יתרונות האיור הממוסגר",
  "home.framedArt.features.noDrill.title": "ללא קידוחים וחורים",
  "home.framedArt.features.noDrill.subtitle":
    "התמונות מגיעות עם מדבקות מגנט מיוחדות להדבקה והזזה קלה",
  "home.framedArt.features.style.title": "איור לבחירתם",
  "home.framedArt.features.style.subtitle":
    "תוכלו לבחור בין שלושת סגנונות האיור שלנו - עפרונות צבעוניים, קריקטורה וצבעי מים",
  "home.framedArt.features.preview.title": "תצוגה מקדימה",
  "home.framedArt.features.preview.subtitle":
    "תוכלו לראות את האיור שלכם מוכן לפני ההזמנה ולוודא שהוא מוצא חן בעיניכם",
  "qa.tabs.books": "ספרוני תינוקות",
  "qa.tabs.framed": "איור ממוסגר",
  "qa.framed.q1": "מה הגודל של המסגרות?",
  "qa.framed.a1":
    "גודל המסגרות שתוכלו למצוא באתר שלנו הוא 20x20 סמ והעובי הוא 1.5 סמ",
  "qa.framed.q2": "ממה המסגרת עשויה?",
  "qa.framed.a2":
    "המסגרת עשויה MDF בגימור דמוי עץ בגוון אלון בהיר",
  "qa.framed.q3": "האם צריך לקדוח בקיר?",
  "qa.framed.a3":
    "לא. המסגרת מגיעה עם מערכת תלייה מגנטית ללא קידוח, כך שניתן לתלות אותה בקלות ללא מסמרים או ברגים.",
  "qa.framed.q4": "האם ניתן להסיר את התמונה ללא נזק לקיר?",
  "qa.framed.a4":
    "כן. המסגרת מגיעה עם מערכת תלייה מגנטית ייחודית ללא קידוח, המאפשרת להסיר ולהחזיר את המסגרת בקלות. ברוב סוגי הקירות ההסרה אינה משאירה סימנים או גורמת לנזק לקיר.\nכדי להימנע מנזק מומלץ לא להדביק את המדבקות על משטחים עדינים, טפטים וקירות סדוקים.",
  "qa.framed.q5": "האם אפשר להזמין סט של 2 או 3 תמונות?",
  "qa.framed.a5":
    "בהחלט. ניתן להזמין תמונה בודדת או סט של 2–3 תמונות וליצור קיר גלריה אישי ומיוחד.",
  "qa.framed.q6": "האם אפשר לבחור סגנון איור?",
  "qa.framed.a6": "עפרונות צבעוניים, צבעי מים, קריקטורה",
  "qa.framed.q7": "האם אפשר לראות את התוצאה המאוירת לפני הקנייה?",
  "qa.framed.a7":
    "כן. בוחרים סגנון, מעלים תמונה, ורואים את האיור שלכם בסגנון שבחרתם לפני אישור ההזמנה.",
  "qa.framed.q8": "האם האיור נראה בדיוק כמו התמונה?",
  "qa.framed.a8":
    "האיור מבוסס על התמונה שלכם ושומר על המאפיינים וההבעה של המצולמים, אך הוא נוצר בסגנון אמנותי ולכן לא יהיה זהה לחלוטין לתמונה המקורית. תוכלו לראות את התוצאה לפני אישור ההזמנה ולוודא שהיא מוצאת חן בעיניכם.",
  "qa.framed.q9": "מה אם אני לא מרוצה מהמוצר?",
  "qa.framed.a9":
    "אנחנו רוצים שתאהבו את התוצאה. אם קיבלתם מוצר פגום או שיש בעיה בהדפסה או במסגרת, נשמח לטפל בכך ולמצוא פתרון. מאחר שמדובר במוצר אישי המיוצר במיוחד עבורכם, לא ניתן להחזיר או לבטל הזמנות לאחר תחילת הייצור.",
  "framedArt.upload.styleTitle": "בחרו את סגנון האיור",
  "framedArt.upload.styleTitleHighlight": "סגנון",
  "framedArt.upload.continueToUpload": "המשך להעלאת תמונה",
  "framedArt.upload.title": "העלו תמונה לאיור ממוסגר",
  "framedArt.upload.titleHighlight": "תמונה",
  "framedArt.upload.uploadSubtitle":
    "בחרו סגנון איור, העלו תמונה אחת וחתכו אותה למסגרת",
  "framedArt.upload.selectStyleFirst": "בחרו סגנון איור לפני העלאת תמונה",
  "framedArt.upload.cropInstruction": "גררו והתאימו את התמונה למסגרת",
  "framedArt.upload.cropZoomHint":
    "הריבוע המסומן מראה איך התמונה תופיע במסגרת — אפשר לעשות זום פנימה והחוצה",
  "framedArt.upload.zoomIn": "זום פנימה",
  "framedArt.upload.zoomOut": "זום החוצה",
  "framedArt.upload.zoomSlider": "זום בתמונה",
  "framedArt.upload.lockedStyleLabel": "סגנון נבחר:",
  "framedArt.upload.subtitle": "בחרו תמונה אחת וחתכו אותה למסגרת",
  "framedArt.upload.remainingBadge": "נותרו לכם {count} עיצובים",
  "framedArt.upload.selectPhoto": "בחירת תמונה",
  "framedArt.upload.continue": "המשך",
  "framedArt.upload.createPreview": "צור תצוגה מקדימה",
  "framedArt.upload.invalidType": "ניתן להעלות קובצי JPG או PNG בלבד",
  "framedArt.upload.limitReached": "הגעתם למכסת העלאות ל-12 השעות האחרונות",
  "framedArt.upload.errorGeneric": "משהו השתבש, נסו שוב",
  "framedArt.preview.loadingTitle": "יוצרים את התמונה שלכם",
  "framedArt.preview.readyTitle": "האיור שלכם מוכן",
  "framedArt.preview.readyTitleHighlight": "שלכם",
  "framedArt.preview.loadingLine1": "מתחילים לעבוד על התמונה שלכם",
  "framedArt.preview.loadingLine2": "מורידים את הרקע",
  "framedArt.preview.loadingLine3": "בוחנים מי נמצא בתמונה",
  "framedArt.preview.loadingLine4": "יוצרים את האיור",
  "framedArt.preview.loadingLine5": "מוסיפים עוד קצת צבע",
  "framedArt.preview.loadingLine6": "בודקים שהכל נמצא במקום",
  "framedArt.preview.loadingLine7": "עוד קצת קסם",
  "framedArt.preview.loadingLine8": "פינישים אחרונים",
  "framedArt.preview.styleLabel": "סגנון האיור:",
  "framedArt.preview.cropTapHint": "לחצו על התמונה כדי להתאים את החיתוך.",
  "framedArt.preview.specialRequestBefore": "יש בקשה מיוחדת? מוזמנים ליצור ",
  "framedArt.preview.specialRequestLink": "איתנו קשר",
  "framedArt.preview.cropInstruction": "גררו והתאימו את האיור למסגרת",
  "framedArt.preview.cropZoomHint":
    "הריבוע המסומן מראה איך האיור יופיע במסגרת — אפשר לזום פנימה והחוצה",
  "framedArt.preview.cropSave": "שמירה",
  "framedArt.preview.savingCrop": "שומרים...",
  "framedArt.preview.regenerate": "יצירה מחדש",
  "framedArt.preview.addToCart": "הוספה לעגלה",
  "framedArt.preview.uploadDifferentPhoto": "החליפו תמונה",
  "framedArt.preview.addAnother": "הוספת מסגרת נוספת (מההתחלה)",
  "framedArt.preview.errorGeneric": "משהו השתבש, נסו שוב",
  "cart.framedArtTitle": "איור ממוסגר",
  "cart.addFramedArt": "הוסף איור ממוסגר",
  "cart.suggest.ariaLabel": "הצעות להשלמת ההזמנה",
  "cart.suggest.title": "הוספת מוצרים נוספים",
  "cart.suggest.subtitle": "השלימו את ההזמנה עם מוצרים נוספים",
  "cart.suggest.bookTitle": "ספרון",
  "cart.suggest.framedArtTitle": "איור ממוסגר",
  "cart.suggest.bookPromo": "שני ב-139₪",
  "cart.suggest.framedArtPromo": "שני ב89₪",
  "home.howItWorks.title": "איך זה עובד",
  "home.howItWorks.titleHighlight": "עובד",
  "home.howItWorks.subtitle":
    "כל מה שצריך זה כמה תמונות אהובות – אנחנו נדאג לכל השאר",
  "home.howItWorks.step1.label": "אתם עושים",
  "home.howItWorks.step1.title": "מעלים תמונות",
  "home.howItWorks.step1.description":
    "בחרו 5 תמונות שיופיעו בספרון",
  "home.howItWorks.step1.descriptionWithoutPreview":
    "בחרו 5 תמונות שיופיעו בספרון ואת הסגנון לצד הצבעוני",
  "home.howItWorks.step1.imageAlt": "דוגמה להעלאת תמונות",
  "home.howItWorks.step2.label": "אנחנו עושים",
  "home.howItWorks.step2.title": "יוצרים את הספרון",
  "home.howItWorks.step2.description":
    "אנחנו ניצור מהתמונות שלכם ספרון דו צדדי, נדפיס ונשלח אליכם",
  "home.howItWorks.step2.imageAlt": "דוגמה לתמונות מעובדות בספרון",
  "home.howItWorks.previewStep2.label": "אנחנו עושים",
  "home.howItWorks.previewStep2.title": "יוצרים את האיורים",
  "home.howItWorks.previewStep2.description":
    "רואים את האיורים, בוחרים סגנון וצבע לספרון",
  "home.howItWorks.previewStep2.imageAlt": "דוגמה לתמונות בתצוגה מקדימה",
  "home.howItWorks.previewStep3.label": "אנחנו עושים",
  "home.howItWorks.previewStep3.title": "מדפיסים ושולחים",
  "home.howItWorks.previewStep3.description":
    "מדפיסים, מרכיבים ושולחים את הספרון אליכם",
  "home.howItWorks.previewStep3.imageAlt": "דוגמה לספרון מודפס",
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
  "home.special.title": "למה little gali",
  "home.special.titleHighlight": "little gali",
  "home.special.subtitleLine1": "חיפשנו ולא מצאנו - אז המצאנו.",
  "home.special.ariaLabel": "למה little gali",
  "home.special.item1.title": "מבוסס על מה שמעניין תינוקות",
  "home.special.item1.description":
    "פנים מוכרות מושכות את תשומת הלב של תינוקות כבר מגיל צעיר.",
  "home.special.item1.imageAlt": "איור מדע",
  "home.special.item2.title": "כיף לתת, כיף לקבל",
  "home.special.item2.description":
    "מתנה אישית שנשארת כמזכרת גם הרבה אחרי החודשים הראשונים.",
  "home.special.item2.imageAlt": "איור מתנה",
  "home.special.item3.title": "זמן בטן עם הקרובים",
  "home.special.item3.description":
    "האנשים שהוא אוהב, גם בזמן הבטן ובטיול בעגלה.",
  "home.special.item3.imageAlt": "איור עגלה",
  "home.special.item4.title": "בטוח מהיום הראשון",
  "home.special.item4.description":
    "נבדק ואושר על ידי מכון התקנים הישראלי לשימוש מגיל לידה.",
  "home.special.item4.imageAlt": "איור אישור בטיחות",
  "home.about.brand": "little gali",
  "home.about.title": "מי אנחנו",
  "home.about.titleHighlight": "אנחנו",
  "home.about.imageAlt": "תמונת צוות little gali",
  "home.about.paragraph1":
    "היי, אני יעל, אמא של גלי והיוצרת של Little Gali.",
  "home.about.paragraph2":
    "כמה חודשים אחרי שגלי נולדה, עלה לי רעיון שלא עזב אותי. התחלתי לעבוד עליו מהצד, בעיקר בזמן שהיא ישנה עליי במנשא, רק כדי לראות אם אצליח להפוך אותו למשהו אמיתי.",
  "home.about.paragraph3":
    "התגובות שקיבלתי מחברות שילדו היו הרבה מעבר למה שציפיתי, ונתנו לי את הדחיפה להפוך את הרעיון לעסק.",
  "home.about.paragraph4":
    "היום Little Gali הוא המקום שבו אני יוצרת מוצרים אישיים ומקוריים, מתוך רצון להציע מתנות מיוחדות שמרגישות קצת אחרת.",
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
  "home.comingSoon.emailLabel": "כתובת אימייל",
  "home.comingSoon.emailPlaceholder": "כתובת המייל שלכם",
  "home.comingSoon.button": "עדכנו אותי",
  "home.comingSoon.submitting": "שולח...",
  "home.comingSoon.error": "כתובת אימייל לא תקינה",
  "home.comingSoon.errorGeneric": "משהו השתבש, נסו שוב",
  "home.comingSoon.success": "תודה! נעדכן אתכם ברגע שהמוצר יהיה זמין",
  "home.comingSoon.successTitle": "תודה רבה!",
  "home.comingSoon.successMessage": "נעדכן אתכם ברגע שספרוני הבד יגיעו",
  "home.comingSoon.imageAlt": "תמונה של מוצר בקרוב",

  // Style Examples Section
  "home.styleExamples.title": "הסגנונות שלנו",
  "home.styleExamples.titleHighlight": "שלנו",
  "home.styleExamples.subtitle": "כל ספרון כולל צד שחור-לבן וצד צבעוני בסגנון לבחירתכם",
  "home.styleExamples.description": "הצד השחור-לבן נוצר אוטומטית לגירוי ראייה. אתם בוחרים את הסגנון לצד הצבעוני:",
  "home.styleExamples.cartoon": "קריקטורה",
  "home.styleExamples.pencil": "עפרונות",
  "home.styleExamples.watercolor": "צבעי מים",
  "home.styleExamples.before": "התמונה המקורית",
  "home.styleExamples.after": "התוצאה",
  "home.styleExamples.cta": "עוד דוגמאות",
  "home.styleExamples.ctaAriaLabel": "עבור לעמוד דוגמאות סגנונות",
  "home.styleExamples.ariaLabel": "סגנונות העיבוד הזמינים",
  "home.styleExamples.slideLabel": "דוגמה {num}",

  "home.customerComments.title": "התגובות שלכם",
  "home.customerComments.titleHighlight": "שלכם",
  "home.customerComments.imageAlt": "תגובת לקוח",
  "home.customerComments.showMore": "הראה עוד",
  "home.testimonials.title": "מה אומרים עלינו",
  "home.testimonials.titleHighlight": "עלינו",
  "qa.questionPreview": "האם אפשר לראות את האיורים לפני ההזמנה?",
  "qa.answerPreview":
    "כן.\n\nלאחר העלאת התמונות תוכלו לראות את האיורים שנוצרו עבורכם ואת תצוגת הספרון לפני השלמת ההזמנה.\n\nאם תרצו, תוכלו ליצור מחדש איורים או ליצור איתנו קשר אם יש משהו שתרצו לשפר.",
  "qa.questionSafety": "האם הספרון בטיחותי לשימוש?",
  "qa.answerSafety":
    "כן.\n\nהספרון נבדק ואושר על ידי מכון התקנים הישראלי ועומד בדרישות הבטיחות למוצרים המיועדים לתינוקות וילדים.\n\nהוא מיוצר מחומרים איכותיים ועמידים, כדי שתוכלו ליהנות ממנו בביטחון ובשקט נפשי.\n\nכמו בכל מוצר המיועד לתינוקות, מומלץ להשתמש בו בהשגחת מבוגר.",
  "qa.questionPhotos": "אילו תמונות מתאימות ליצירת הספרון?",
  "qa.answerPhotos":
    "לקבלת התוצאה הטובה ביותר מומלץ לבחור תמונות חדות וברורות שבהן הפנים נראות היטב.\n\nתמונות קרובות בדרך כלל יניבו את התוצאות הטובות ביותר, אך ניתן להשתמש גם בתמונות של מספר אנשים יחד, כל עוד הפנים גלויות וברורות.",
  "qa.questionFromBirth": "האם הספרון מתאים מגיל לידה?",
  "qa.answerFromBirth":
    "כן.\n\nהספרון תוכנן במיוחד עבור תינוקות מגיל לידה. צד אחד כולל איורים בשחור־לבן עם ניגודיות גבוהה, המותאמים ליכולת הראייה של תינוקות בחודשים הראשונים, והצד השני כולל איורים צבעוניים שילוו את התינוק גם בהמשך.",
  "qa.questionDelivery": "כמה זמן לוקח לקבל את הספרון?",
  "qa.answerDelivery":
    "כל ספרון מיוצר באופן אישי לאחר ביצוע ההזמנה.\n\nזמן הייצור והמשלוח הוא עד 7 ימי עסקים.",
  "qa.questionSpecial": "מה הופך את הספרון של Little Gali למיוחד?",
  "qa.answerSpecial":
    "ספרון התינוקות של Little Gali נוצר במיוחד עבור התינוק שלכם.\n\nבמקום דמויות או איורים גנריים, הספרון מציג את האנשים שהוא מכיר ואוהב – הורים, אחים, סבים, סבתות ואנשים משמעותיים נוספים בחייו.\n\nהוא משלב בין התאמה לראיית תינוקות בחודשים הראשונים לבין חוויה אישית ורגשית, והופך למתנה ייחודית שנוצרה במיוחד עבור המשפחה שלכם.",
  "qa.questionPhotoCount": "כמה תמונות צריך לבחור?",
  "qa.answerPhotoCount":
    "כדי ליצור את הספרון יש לבחור 5 תמונות.\n\nאפשר לבחור אנשים שונים או מספר תמונות של אותו אדם – הבחירה לגמרי שלכם.",
  "qa.questionPeopleCount": "כמה אנשים יכולים להופיע בכל תמונה?",
  "qa.answerPeopleCount":
    "אין מגבלה על מספר האנשים בתמונה.\n\nהדבר החשוב ביותר הוא שהפנים יהיו ברורות וניתנות לזיהוי. ככל שהפנים גדולות וברורות יותר, כך התוצאה תהיה טובה יותר.",
  "qa.questionGift":
    "אני רוצה לקנות את הספרון כמתנה. האם חייבים לבחור את התמונות בעצמי?",
  "qa.answerGift":
    "לא.\n\nאפשר לרכוש כרטיס מתנה, וההורים יבחרו בעצמם את התמונות, ייצרו את האיורים ויזמינו את הספרון בזמן שמתאים להם.\n\nכך אפשר להעניק מתנה אישית ומרגשת, בלי לבחור עבורם את התמונות.",
  "qa.questionSimilarity": "האם האיורים באמת דומים לאנשים שבתמונות?",
  "qa.answerSimilarity":
    "כן.\n\nמערכת האיור שלנו נועדה לשמור על המאפיינים הייחודיים של כל אדם – תווי פנים, הבעות ושיער – תוך התאמת התמונה לסגנון האיור של הספרון.\n\nהמטרה היא ליצור איורים פשוטים וברורים לתינוקות, מבלי לאבד את המאפיינים שהופכים כל אדם למיוחד.",
  "qa.questionCleaning": "איך מנקים את הספרון?",
  "qa.answerCleaning":
    "ניתן לנגב את הספרון בעדינות באמצעות מטלית לחה.\n\nאין לכבס במכונה, להשרות במים או להשתמש בחומרי ניקוי חזקים.",
  "qa.questionUnsatisfied": "מה אם אני לא מרוצה מהספרון?",
  "qa.answerUnsatisfied.line1":
    "הספרון הסופי יהיה זהה בדיוק לספרון שתאשרו לפני הקניה.",
  "qa.answerUnsatisfied.beforeLink":
    "אם בכל זאת משהו לא עבד לכם כמו שציפיתם אתם מוזמנים לפנות ",
  "qa.answerUnsatisfied.linkText": "אלינו",
  "qa.notFound": "לא מצאתם את התשובה שחיפשתם?",
  "qa.contact": "צרו איתנו קשר",

  // Footer
  "footer.description":
    "ספרוני תינוקות מותאמים אישית\nעם איורים של האנשים שהתינוק\nשלכם הכי אוהב.",
  "footer.platform": "פלטפורמה",
  "footer.products": "מוצרים",
  "footer.information": "מידע",
  "footer.babyBooks": "ספרוני תינוקות",
  "footer.framedArt": "איור ממוסגר",
  "footer.howItWorks": "איך זה עובד",
  "footer.photoGuide": "מדריך בחירת תמונה",
  "footer.inspiration": "גלריית השראה",
  "footer.policies": "תקנונים",
  "footer.terms": "תנאי שירות",
  "footer.termsOfUse": "תנאי שימוש",
  "footer.privacy": "פרטיות",
  "footer.shipping": "משלוחים",
  "footer.returns": "החזרות",
  "footer.about": "אודות",
  "footer.whoWeAre": "מי אנחנו",
  "footer.contact": "צרו קשר",
  "footer.contactUs": "צרו איתנו קשר",
  "footer.contactUsAriaLabel": "עבור לעמוד צור קשר",
  "footer.copyright": "© Little Gali. כל הזכויות שמורות.",

  // Contact Page
  "contact.title": "צרו איתנו קשר",
  "contact.titleHighlight": "קשר",
  "contact.subtitle1": "מתלבטים בקשר לתמונות? יש לכם שאלה?",
  "contact.subtitle2": "מוזמנים ליצור איתנו קשר ונשמח לעזור בכל נושא",
  "contact.imageAlt": "צרו קשר",
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
  "contact.previewLinked":
    "התצוגה המקדימה שלכם תצורף להודעה זו בצורה אוטומטית כדי שנבין במה מדובר",
  "contact.attachments": "צירוף תמונות (לא חובה)",
  "contact.attachmentsLimitHint": "אפשר לצרף עד 5 תמונות",
  "contact.attachmentsChoose": "בחרו תמונות",
  "contact.attachmentsCount": "{count} מתוך 5",
  "contact.attachmentsRemove": "הסרה",
  "contact.attachmentsTooMany": "ניתן לצרף עד 5 תמונות בלבד",
  "contact.attachmentsInvalidType": "ניתן לצרף קבצי JPG או PNG בלבד",
  "contact.attachmentsFileTooLarge": "גודל מקסימלי לכל תמונה: 2MB",
  "contact.attachmentsTotalTooLarge": "גודל מקסימלי לכל התמונות יחד: 10MB",

  // Upload Page
  "upload.title": "בואו ניצור לתינוק שלכם ספרון אישי",
  "upload.titleHighlight": "אישי",
  "upload.description":
    "בחרו 5 תמונות שיופיעו בספרון.\nחמשת התמונות יופיעו בצד אחד בשחור לבן ובצד השני בצבעוני.",
  "upload.imagesCount": "מתוך 5 תמונות",
  "upload.selectExactly5": "אנא בחר בדיוק 5 תמונות",
  "upload.waitForUpload": "אנא המתן עד שהתמונות יסיימו להעלות",
  "upload.invalidType": "ניתן להעלות קובצי JPG או PNG בלבד (HEIC לא נתמך)",
  "upload.serverError": "שגיאה בשרת. אנא נסה שוב מאוחר יותר.",
  "upload.addingToCart": "מוסיף לעגלה...",
  "upload.uploading": "מעלה תמונות...",
  "upload.uploadingAndAdding": "מעלה תמונות ומוסיף לעגלה...",
  "upload.updating": "מעדכן...",
  "upload.addToCart": "הוסף לעגלה",
  "upload.tapToCrop": "לחצו על התמונה בשביל לערוך את החיתוך שלה",
  "upload.cropBackgroundTip": "טיפ: חתכו את התמונה כך שתכיל כמה שפחות רקע",
  "upload.titleReady": "העלאת תמונות",
  "upload.titleReadyHighlight": "תמונות",
  "upload.descriptionReady":
    "חמשת התמונות יופיעו בצד אחד בשחור לבן ובצד השני בצבעוני.",
  "upload.dragToReorder": "גררו את התמונות כדי לשנות את הסדר",
  "upload.cropInstruction": "גררו את התמונה כדי לשנות את הגודל והמיקום",
  "upload.cropInstructionTip":
    "לתוצאה מיטבית, מומלץ להשאיר כמה שפחות שטח ריק סביב המצולמים",
  "upload.cropDone": "סיימתי",
  "upload.analyzingPhoto": "מציעים חיתוך חכם…",
  "upload.cropFaceClipWarning":
    "נראה שחלק מפני האנשים בתמונה נחתכים בחיתוך. כדאי להזיז או להקטין את התמונה כדי שכולם ייכנסו למסגרת.",
  "upload.cropFaceClipTapDoneAgain":
    "אם זה מכוון, לחצו שוב על ״סיימתי״ כדי להמשיך.",
  "upload.changeImage": "החלף תמונה",
  "upload.startOver": "התחל מחדש",
  "upload.photoTip": "איזו תמונה כדאי להעלות?",
  "upload.photoNote":
    "אין צורך בתמונה מושלמת, אנחנו נדאג שהפנים, ההבעה והחום האנושי שבתמונה יבואו לידי ביטוי.",
  "upload.continueToPreview": "המשיכו לתצוגה מקדימה",
  "upload.continueWithoutPreview": "הוסף לעגלה ללא תצוגה מקדימה",
  "upload.withoutPreviewReassurance":
    "תוכלו ליצור איתנו קשר אם תרצו לראות את התוצאה אחרי התשלום",
  "upload.startingPreview": "מכינים את התצוגה המקדימה...",
  "upload.previewRateLimit":
    "ניתן ליצור עד {limit} תצוגות מקדימות בכל {windowHours} שעות. נסו שוב מאוחר יותר",
  "upload.previewLastGenerationWarning":
    "זו התצוגה המקדימה האחרונה שלכם ל-{windowHours} השעות הקרובות.",
  "upload.previewLastGenerationWarningWithReset":
    "זו התצוגה המקדימה האחרונה שלכם ל-{windowHours} השעות הקרובות. לאחר מכן תוכלו לנסות שוב ב-{resetTime} או ליצור איתנו קשר.",
  "upload.previewRateLimitWithoutPreviewHint":
    "בינתיים אפשר להוסיף לעגלה ללא תצוגה מקדימה באמצעות הכפתור למטה.",
  "upload.previewRateLimitOr": " או ",
  "upload.previewRateLimitContactLink": "צרו איתנו קשר",

  // Preview flow
  "preview.bwPhaseTitle": "הצד השחור לבן",
  "preview.colorPhaseTitle": "הספרון המלא שלכם",
  "preview.colorPhaseTitleHighlight": "שלכם",
  "preview.colorPhaseDescription":
    "עברו בין הצדדים של הספרון לצפייה בתוצאה המלאה.\nבצד הצבעוני ניתן לבחור בין שלושה סגנונות איור שונים.",
  "preview.bwPhaseDescription":
    "גרסאות השחור־לבן של התמונות שלכם מוכנות ✨\nשימו לב - לאחר המעבר לשלב הבא לא יהיה ניתן להעלות תמונות חדשות.",
  "preview.bwApproveAbove": "אהבתם? ממשיכים לצד הצבעוני",
  "preview.bwApproveBelowBefore": "משהו לא יצא כמו שציפיתם? ",
  "preview.approveBwButton": "לעבור לצד הצבעוני",
  "preview.colorCartAbove": "מוכנים להוסיף לעגלה?",
  "preview.bwLoadingTitle": "יוצרים את התמונות שלכם",
  "preview.bwLoadingLine1": "מעבדים את התמונות שלכם",
  "preview.bwLoadingLine2": "מכינים את הצד השחור-לבן",
  "preview.bwLoadingLine3": "מנתחים כל תמונה",
  "preview.bwLoadingLine4": "מגבירים את הקונטרסט",
  "preview.bwLoadingLine5": "בודקים שהכל נראה טוב",
  "preview.colorLoadingLine1": "יוצרים את הצד הצבעוני",
  "preview.colorLoadingLine2": "מכינים את כל הסגנונות",
  "preview.colorLoadingLine3": "מוסיפים עוד צבע",
  "preview.colorLoadingLine4": "בודקים שהכל במקום",
  "preview.colorLoadingLine5": "פינישים אחרונים",
  "preview.loadingTitle": "יוצרים את הספרון שלכם...",
  "preview.loadingLine1": "יוצרים מתנה מושלמת",
  "preview.loadingLine2": "מכינים את התמונות שלכם",
  "preview.loadingLine3": "ספרון כזה עוד לא היה לנו",
  "preview.loadingLine4": "משקיעים בכל תמונה עוד קצת",
  "preview.loadingLine5": "מוסיפים קסם",
  "preview.loadingLine6": "דברים טובים לוקחים זמן",
  "preview.loadingDuration": "זה לוקח בין 30 שניות לדקה",
  "preview.loadingSlow": "לוקח קצת יותר מהרגיל, כמעט שם...",
  "preview.title": "הנה הספרון שלכם",
  "preview.titleHighlight": "שלכם",
  "preview.subtitle": "ניתן לבצע עד 3 שינויים.",
  "preview.tabBw": "צד שחור לבן",
  "preview.tabColor": "צד צבעוני",
  "preview.zoom": "הגדלה",
  "preview.closeLightbox": "סגירת תצוגה מוגדלת",
  "preview.lightboxPrevious": "עמוד קודם",
  "preview.lightboxNext": "עמוד הבא",
  "preview.colorLoadingTitle": "יוצרים את הצד הצבעוני",
  "preview.colorStyleStrip.title": "3 סגנונות · לחצו להשוואה",
  "preview.bookColor.title": "בחרו את צבע הספרון",
  "preview.bookColor.dark": "שחור עם מסגרת מנומרת",
  "preview.bookColor.light": "בהיר עם מסגרת נקודות",
  "preview.bookColor.required": "איזה צבע ספרון בד תרצו?",
  "preview.changesLeft": "שינויים שנותרו",
  "preview.changesRemainingBadge": "נותרו לכם {count} שינויים",
  "preview.changesExhaustedLine1":
    "נגמרו השינויים להיום - אפשר לבחור מהתמונות שנוצרו,",
  "preview.changesExhaustedLine2Before": "או ",
  "preview.changesExhaustedContactLink": "ליצור איתנו קשר",
  "preview.changesExhaustedLine2After": " אם משהו לא יצא כמו שציפיתם",
  "preview.regenerate": "צרו גרסה חדשה",
  "preview.replaceImage": "החליפו תמונה",
  "preview.prohibitedContentLine1": "התמונה נחסמה על ידי המודל.",
  "preview.prohibitedContentLine2": "יש להעלות תמונה אחרת במקום.",
  "preview.prohibitedContentUpload": "העלה תמונה",
  "preview.slotRetryAgain": "נסה שוב",
  "preview.imageActions": "אפשרויות תמונה",
  "preview.originalImage": "השווה לתמונה מקורית",
  "preview.cropImage": "חיתוך תמונה",
  "preview.cropInstructionTip":
    "המלצה שלנו: התקרבו לדמויות וצמצמו אזורים לבנים מצידי התמונה במידה ויש",
  "preview.saveCrop": "שמור חיתוך",
  "preview.cancelCrop": "ביטול",
  "preview.cropError": "משהו השתבש, נסו שוב",
  "preview.cropSaving": "שומרים חיתוך...",
  "preview.originalPhoto": "תמונה מקורית",
  "preview.generatedImage": "התוצאה שנוצרה",
  "preview.previousVersions": "גרסאות קודמות",
  "preview.allVersions": "כל הגרסאות",
  "preview.approveBw": "מאשרים את הצד השחור-לבן",
  "preview.continueToColorSide": "המשיכו לצד הצבעוני",
  "preview.addToCart": "הוסף לעגלה",
  "preview.contactPrompt": "לא יצא כמו שציפיתם?",
  "preview.contactButton": "צרו קשר",
  "preview.styleTitle": "בחרו סגנון לצד הצבעוני",
  "preview.colorSurprise": "את הגרסה הצבעונית תגלו כשתקבלו את הספרון 🤍",
  "preview.continueToCart": "המשיכו לעגלה",
  "preview.slotBusy": "מייצרים תמונה...",
  "preview.sessionError": "לא הצלחנו לטעון את התצוגה המקדימה. יש לנו תקלה ואנחנו עובדים על תיקון בשבילה",
  "preview.generationRateLimit":
    "הגעתם למגבלת היצירות להיום. אפשר לנסות שוב מחר, או ",
  "preview.generationRateLimitAfter": " אם יש בעיה.",
  "preview.generationRateLimitContactLink": "צרו איתנו קשר",
  "preview.imageLoadFailed": "לא הצלחנו לטעון את התמונה.",
  "preview.imageLoadFailedNoCredits": "נגמרו השינויים. לעזרה,",
  "preview.sessionNotFound": "לא מצאנו את התצוגה המקדימה. ייתכן שהפג תוקפה או שהקישור לא תקין.",
  "preview.sessionUnauthorized": "אין גישה לתצוגה המקדימה הזו מהדפדפן הזה. נסו להתחיל שוב מהעלאת התמונות.",
  "preview.loadFailed": "משהו השתבש עם התצוגה המקדימה.\nקיבלנו הודעה בנושא ואנחנו עובדים על תיקון.",
  "preview.retry": "נסו שוב",
  "preview.continueWithoutPreview": "המשך ללא תצוגה",
  "preview.backToUpload": "חזרה להעלאת תמונות",
  "preview.addingToCart": "מוסיפים לעגלה...",

  // Style Selector
  "styleSelector.title": "בחרו את הסגנון שלכם:",
  "styleSelector.subtitle": "הסגנון ישפיע על הצד הצבעוני של התמונה",
  "styleSelector.learnMore": "לחצי בשביל לראות דוגמאות לכל סגנון",
  "styleSelector.closeExamples": "סגור דוגמאות",
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

  // Gift Cards
  "giftCard.title": "גיפט קארד",
  "giftCard.titleHighlight": "גיפט",
  "giftCard.description":
    "רוצים לתת מתנה אבל מעדיפים שהם יבחרו את התמונות בעצמם? הגיפט קארד שלנו מאפשר בדיוק את זה",
  "giftCard.selectOption": "בחרו אפשרות",
  "giftCard.emailNote": "הגיפט קארד יישלח במייל מיד לאחר הרכישה",
  "giftCard.addToCart": "הוסף לעגלה",
  "giftCard.adding": "מוסיף...",
  "giftCard.ariaLabel": "הוסף גיפט קארד לעגלה",
  "giftCard.option1": "ספרון אישי אחד ללא משלוח",
  "giftCard.option2": "ספרון אישי אחד כולל משלוח",
  "giftCard.option3": "שני ספרונים אישיים ללא משלוח",
  "giftCard.option4": "שני ספרונים אישיים כולל משלוח",
  "giftCard.feature1": "הספרון השני ב139₪",
  "giftCard.feature2": "בחירת 5 תמונות",
  "giftCard.feature3": "בחירת סגנון",
  "giftCard.feature4": "תוקף ללא הגבלה",

  // Cookie Consent
  "cookieConsent.title": "עוגיות ומעקב",
  "cookieConsent.line1":
    "אנו משתמשים בקבצי קוקיז לשיפור חווית הגלישה.",
  "cookieConsent.line2BeforeLink":
    "המשך שימוש באתר מהווה הסכמה בהתאם ",
  "cookieConsent.policyLink": "למדיניות",
  "cookieConsent.close": "סגור הודעת עוגיות",
  "cookieConsent.ariaLabel": "הודעת עוגיות ומעקב",
};

const englishTranslations = {
  // Navigation
  "nav.home": "Home",
  "nav.about": "About Us",
  "nav.giftCard": "Gift Card",
  "nav.qa": "Q&A",
  "nav.inspiration": "Inspiration",
  "nav.fabricBook": "Fabric Book Signup",
  "nav.contact": "Contact",
  "nav.createBook": "Create Book",
  "nav.menuAriaLabel": "Main navigation menu",
  "nav.mainNavAriaLabel": "Main navigation",
  "nav.createBookAriaLabel": "Go to book creation page",

  // Accessibility
  "accessibility.skipToMain": "Skip to main content",
  "accessibility.openMenu": "Open menu",
  "accessibility.openCart": "Open cart",
  "accessibility.close": "Close",
  "accessibility.changeLanguage": "Change language",
  "accessibility.selectLanguage": "Select language",
  "accessibility.cartTitle": "Shopping cart",
  "accessibility.expandImage": "Expand image",
  "accessibility.homeLink": "Little Gali - Home",

  // Top Banner
  "banner.shipping": "Free Shipping Nationwide",
  "banner.freeCard": "Free Personalized Greeting Card",
  "banner.ariaLabel": "Promotional announcements",

  // Cart
  "cart.title": "Shopping Cart",
  "cart.titleHighlight": "Cart",
  "cart.empty": "Your cart is empty",
  "cart.total": "Total:",
  "cart.checkout": "Continue to Checkout",
  "cart.viewFull": "View Full Cart",
  "cart.loading": "Loading...",
  "cart.addingItem": "Adding to cart...",
  "cart.removeItem": "Remove Item from Cart",
  "cart.increaseQuantity": "Increase quantity",
  "cart.decreaseQuantity": "Decrease quantity",
  "cart.removeConfirm":
    "Are you sure you want to remove this item from your cart?",
  "cart.remove": "Remove",
  "cart.removeFailed": "Couldn't remove this item, please try again",
  "cart.clearAll": "Clear cart and start over",
  "cart.quantityUpdateFailed":
    "Couldn't update quantity. Clear the cart and start over.",
  "cart.cancel": "Cancel",
  "cart.quantity": "Quantity:",
  "cart.styleLabel": "Style:",
  "cart.colorLabel": "Color:",
  "cart.lineTotal": "Total:",
  "cart.discountApplied": "A discount applies to this item 🎉",
  "cart.itemTotal": "Item Total:",
  "cart.style": "Style:",
  "cart.colorStyle": "Color Style:",
  "cart.style.cartoon": "Cartoon",
  "cart.style.pencil": "Pencil",
  "cart.style.watercolor": "Watercolor",
  "cart.book": "Paper Book",
  "cart.orderSummary": "Order Summary",
  "cart.itemsCount": "Number of items:",
  "cart.deliveryTime": "Delivery time up to 14 business days",
  "cart.shareConsent": "You can share my book on Little Gali's page as inspiration",
  "cart.shareConsentNote": "Without names or identifying details",
  "cart.addGiftMessage": "Add a gift message",
  "cart.giftMessagePlaceholder": "Enter your message (up to 200 characters)",
  "cart.readyMessage":
    "A message will be sent when the book is ready for pickup coordination",
  "cart.checkoutProgress": "Redirecting to payment...",
  "cart.addBook": "Add Book",
  "cart.secondBook": "Every second book for ₪139 🎉",
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

  // Styles Page
  "styles.title": "Discover Our Styles",
  "styles.titleHighlight": "Styles",
  "styles.subtitle": "See how real photos transform into unique art in each style",
  "styles.hero.description": "Every book comes with a black & white side for visual stimulation (0-3 months) and a colorful side in your chosen style. Here are some examples:",
  "styles.bw.title": "Black & White (Automatic)",
  "styles.bw.description": "Every book automatically includes a black & white side designed for visual stimulation in baby's first months (0-3 months). The high contrast helps develop baby's vision.",
  "styles.bw.imageAlt": "Black and white photo example",
  "styles.colorful.title": "Colorful Styles",
  "styles.colorful.description": "Choose your preferred style for the colorful side:",
  "styles.cartoon.title": "Cartoon",
  "styles.cartoon.subtitle": "Colorful, vibrant, full of character",
  "styles.cartoon.description": "Colorful illustration inspired by children's books. Free-flowing lines and a cheerful, storytelling appearance, perfect for babies who love bold and lively colors.",
  "styles.pencil.title": "Pencil",
  "styles.pencil.subtitle": "Precise details, soft and natural",
  "styles.pencil.description": "Delicate pencil style with soft, natural lines. Preserves fine details and provides an artistic, sophisticated look.",
  "styles.watercolor.title": "Watercolor",
  "styles.watercolor.subtitle": "Painterly and artistic",
  "styles.watercolor.description": "Artistic watercolor style with soft color transitions and a painterly appearance. Creates a dreamy, calming effect.",
  "styles.before": "Before",
  "styles.after": "After",
  "styles.cta": "Create Your Book",
  "styles.ctaAriaLabel": "Go to book creation page",
  "styles.backHome": "Back to Home",

  // Terms of Service
  "terms.title": "Terms of Service",
  "terms.intro.p1": "Welcome to the Little Gali website.",
  "terms.intro.p2":
    "Use of the website and the services provided on it is subject to the terms set out below. By browsing the website, using the services, or placing an order, you confirm that you have read and fully agree to these terms.",
  "terms.useOfSite.title": "Use of the Website",
  "terms.useOfSite.p1":
    "The website allows you to order personalized products based on images you upload, including fabric baby books, printed illustrations, and framed pictures.",
  "terms.useOfSite.p2": "Use of the website is permitted for personal and private purposes only.",
  "terms.useOfSite.p3":
    "You may not use the website for commercial purposes without prior approval, upload offensive or illegal content, or upload images you do not own.",
  "terms.userResponsibility.title": "User Responsibility",
  "terms.userResponsibility.p1":
    "You declare that you have all rights and permissions required to use the images you upload to the website.",
  "terms.userResponsibility.p2":
    "You are responsible for ensuring that use of the images does not infringe copyright, privacy rights, or any other law.",
  "terms.userResponsibility.p3":
    "You are responsible for obtaining the consent of everyone appearing in the images, where required.",
  "terms.userResponsibility.p4":
    "All legal liability for content uploaded to the website rests solely with the user.",
  "terms.ordersAndPayment.title": "Orders and Payment",
  "terms.ordersAndPayment.p1":
    "Prices on the website are shown in the currency indicated on the order page and include VAT as required by law.",
  "terms.ordersAndPayment.p2": "Payment is processed through a secure payment system.",
  "terms.ordersAndPayment.p3":
    "An order is considered final after payment is confirmed and an order confirmation is received.",
  "terms.ordersAndPayment.p4":
    "Little Gali reserves the right to cancel an order in case of a pricing error, technical failure, product unavailability, concern about improper use of the website, or any other reasonable cause.",
  "terms.productProduction.title": "Product Production",
  "terms.productProduction.p1":
    "Products on the website are made to order based on images uploaded and approved by the customer during the ordering process.",
  "terms.productProduction.p2":
    "Some products include digital processing or illustrations created from uploaded images. Although we strive for maximum similarity to the original photos, some differences between the original image and the final result may occur.",
  "terms.productProduction.p3":
    "On-screen previews are for illustration only; slight differences may occur between the digital preview and the printed product.",
  "terms.customProducts.title": "Personalized Products",
  "terms.customProducts.p1":
    "Because products are made specifically for each customer based on images they provide, orders cannot be canceled, changed, or returned after the order is confirmed and payment is completed, except as set out in the website's returns policy or as required by law.",
  "terms.warrantyAndService.title": "Warranty and Service",
  "terms.warrantyAndService.p1":
    "We invest significant effort to provide quality products and high-quality prints.",
  "terms.warrantyAndService.p2":
    "However, slight differences in shades, colors, trimming, texture, contrast, or element placement may occur between on-screen display and the printed product.",
  "terms.warrantyAndService.p3":
    "Such reasonable differences are not considered defects and are not grounds for canceling a transaction.",
  "terms.warrantyAndService.p4":
    "If there is a production defect or damage during shipping, please contact us and we will act in accordance with the website's returns policy.",
  "terms.safeUse.title": "Safe Use of Products",
  "terms.safeUse.books.title": "Fabric Baby Books",
  "terms.safeUse.books.p1": "Books are intended for use under adult supervision only.",
  "terms.safeUse.books.p2":
    "The books are made of fabric and include printed photos inserted into dedicated pockets.",
  "terms.safeUse.books.p3":
    "Although the books are intended for use by babies and young children, we recommend checking them periodically and discontinuing use if there is wear, tearing, or any damage.",
  "terms.safeUse.books.p4":
    "The printed photos are intended for use as part of the book; we recommend returning them to their dedicated pockets after use.",
  "terms.safeUse.books.p5":
    "Do not leave the product unsupervised near a baby or toddler.",
  "terms.safeUse.framed.title": "Framed Pictures",
  "terms.safeUse.framed.p1":
    "Framed pictures are supplied with hanging hardware according to the model.",
  "terms.safeUse.framed.p2":
    "When using adhesive hanging strips, we recommend not applying them to wallpaper, peeling paint, cracked walls, delicate surfaces, or surfaces unsuitable for adhesion.",
  "terms.safeUse.framed.p3":
    "Although the strips are designed to be removable, removal may in some cases cause minor damage to paint, coating, or the wall surface.",
  "terms.safeUse.framed.p4":
    "Responsibility for choosing the hanging location, surface suitability, and installation method rests solely with the customer.",
  "terms.safeUse.framed.p5":
    "Frames may also be hung using a nail or alternative hanging hardware suitable for the wall type.",
  "terms.safeUse.framed.p6":
    "For safety, we recommend not hanging frames above cribs, bassinets, or children's sleeping areas.",
  "terms.safeUse.framed.p7":
    "Little Gali is not responsible for damage to walls, surfaces, property, or people resulting from incorrect installation, use not in accordance with instructions, or unsuitable installation surfaces.",
  "terms.intellectualProperty.title": "Intellectual Property",
  "terms.intellectualProperty.p1":
    "All copyrights, designs, illustrations, images, content, trademarks, and code on the website belong to Little Gali or are used lawfully on its behalf.",
  "terms.intellectualProperty.p2":
    "You may not copy, distribute, reproduce, publish, sell, or otherwise use website content without prior written approval.",
  "terms.liabilityLimitation.title": "Limitation of Liability",
  "terms.liabilityLimitation.p1":
    "Use of the website and products is at the user's sole responsibility.",
  "terms.liabilityLimitation.p2":
    "Little Gali is not liable for indirect damages, loss of information, loss of profits, or any other consequential damage arising from use of the website, services, or products.",
  "terms.liabilityLimitation.p3":
    "In any case, Little Gali's liability shall not exceed the amount actually paid by the customer for the order.",
  "terms.termsChanges.title": "Changes to Terms",
  "terms.termsChanges.p1":
    "Little Gali reserves the right to update or change these terms of service from time to time.",
  "terms.termsChanges.p2":
    "The current version will be published on the website; continued use of the website after an update constitutes agreement to the updated terms.",
  "terms.contact.title": "Contact",
  "terms.contact.p1":
    "For questions, clarifications, or inquiries about these terms of service, please contact us via the",
  "terms.contact.link": "Contact Us",
  "terms.contact.p2": "page on the website or by email:",

  // Privacy Policy
  "privacy.title": "Privacy Policy",
  "privacy.intro.title": "Introduction",
  "privacy.intro.p1":
    "At Little Gali, we respect our customers' privacy and are committed to protecting the personal information you provide to us.",
  "privacy.intro.p2":
    "This privacy policy explains what types of information we collect, how we use it, with whom we may share it, and your rights regarding that information.",
  "privacy.intro.p3":
    "Use of the website constitutes acceptance of this privacy policy.",
  "privacy.collection.title": "What Information Do We Collect?",
  "privacy.collection.youProvide.title": "Information You Provide to Us",
  "privacy.collection.youProvide.p1":
    "When placing an order or contacting the business, we may collect:",
  "privacy.collection.youProvide.li1": "Full name",
  "privacy.collection.youProvide.li2": "Email address",
  "privacy.collection.youProvide.li3": "Phone number",
  "privacy.collection.youProvide.li4": "Shipping address",
  "privacy.collection.youProvide.li5": "Order details",
  "privacy.collection.youProvide.li6": "Photos and content uploaded to the website",
  "privacy.collection.youProvide.p2":
    "When using Little Gali services, you may upload photos to create personalized products such as fabric baby books, illustrations, and framed pictures.",
  "privacy.collection.youProvide.p3":
    "Photos are used solely to produce the ordered product.",
  "privacy.collection.technical.title": "Technical Information and Usage Data",
  "privacy.collection.technical.p1":
    "When browsing the website, we may collect information such as:",
  "privacy.collection.technical.li1": "IP address",
  "privacy.collection.technical.li2": "Browser and device type",
  "privacy.collection.technical.li3": "Pages viewed on the website",
  "privacy.collection.technical.li4": "Time spent on the website",
  "privacy.collection.technical.li5":
    "Actions taken while using the website, such as viewing pages, clicking buttons, uploading photos, starting the ordering process, completing an order, and using various website features",
  "privacy.usage.title": "How Do We Use the Information?",
  "privacy.usage.intro": "We use the collected information to:",
  "privacy.usage.li1": "Process and fulfill orders",
  "privacy.usage.li2": "Deliver products and services",
  "privacy.usage.li3": "Create illustrations and process uploaded photos",
  "privacy.usage.li4": "Provide customer service and respond to inquiries",
  "privacy.usage.li5": "Improve the website and user experience",
  "privacy.usage.li6": "Secure the website and prevent misuse",
  "privacy.usage.li7": "Send order-related updates",
  "privacy.usage.li8": "Send marketing content, subject to consent where required",
  "privacy.imageProcessing.title": "Photo Processing and Illustration Creation",
  "privacy.imageProcessing.p1":
    "To create personalized products, photos uploaded to the website may undergo digital processing or use of AI-based tools.",
  "privacy.imageProcessing.p2":
    "Processing is performed solely to create the ordered product and does not grant Little Gali any ownership of photos uploaded by the customer.",
  "privacy.analytics.title": "Analytics and Tracking Tools",
  "privacy.analytics.intro":
    "The website uses tools that help us understand how visitors use the site and improve our services and products.",
  "privacy.analytics.ga.title": "Google Analytics",
  "privacy.analytics.ga.p":
    "Google Analytics provides statistical information about website traffic, pages viewed, traffic sources, and actions taken on the site.",
  "privacy.analytics.mixpanel.title": "Mixpanel",
  "privacy.analytics.mixpanel.p1":
    "Mixpanel is a user behavior analytics tool that helps us understand how visitors use the website and the ordering process.",
  "privacy.analytics.mixpanel.p2":
    "Through Mixpanel, we may measure actions such as page views, button clicks, progress through ordering steps, photo uploads, preview generation, and other actions performed on the website.",
  "privacy.analytics.mixpanel.p3":
    "The information is used for performance analysis, issue detection, improving user experience, and improving the ordering process.",
  "privacy.analytics.meta.title": "Meta Pixel",
  "privacy.analytics.meta.p":
    "Meta Pixel allows us to measure the effectiveness of our advertising on Facebook and Instagram, understand which actions were taken on the website, and optimize advertising campaigns.",
  "privacy.analytics.cookiesNote":
    "These tools may collect information through cookies, device identifiers, and similar technologies.",
  "privacy.cookies.title": "Cookies",
  "privacy.cookies.intro": "The website uses cookies and similar technologies for:",
  "privacy.cookies.li1": "Proper operation of the website",
  "privacy.cookies.li2": "Saving user preferences",
  "privacy.cookies.li3": "Performance measurement",
  "privacy.cookies.li4": "Traffic analysis",
  "privacy.cookies.li5": "Marketing and advertising",
  "privacy.cookies.note":
    "You can block or delete cookies through your browser settings; however, doing so may affect some website functionality.",
  "privacy.sharing.title": "Sharing Information with Third Parties",
  "privacy.sharing.p1":
    "We do not sell or rent personal information to third parties.",
  "privacy.sharing.intro": "We may share information with:",
  "privacy.sharing.li1": "Technology service providers that help operate the website",
  "privacy.sharing.li2": "Storage and cloud service providers",
  "privacy.sharing.li3": "Payment processing services",
  "privacy.sharing.li4": "Shipping and delivery companies",
  "privacy.sharing.li5":
    "Analytics, measurement, and advertising providers such as Google, Mixpanel, and Meta",
  "privacy.sharing.li6":
    "Service providers used for photo processing and illustration creation as part of the product production process",
  "privacy.sharing.li7": "Authorized authorities when required by law",
  "privacy.sharing.p2":
    "Any sharing of information will be done only to the extent necessary to provide the service.",
  "privacy.retention.title": "Data Retention",
  "privacy.retention.p1":
    "We retain personal information for as long as necessary to provide the service, comply with legal requirements, handle customer inquiries, and manage the business.",
  "privacy.retention.p2":
    "Photos uploaded to the website may be retained for a reasonable period after order completion for customer service, corrections, repeat orders, or providing additional copies at the customer's request.",
  "privacy.security.title": "Information Security",
  "privacy.security.p1":
    "We take reasonable and accepted security measures to protect the personal information in our possession.",
  "privacy.security.p2":
    "However, it is not possible to guarantee absolute security of information transmitted over the internet; therefore, we cannot guarantee complete immunity from unauthorized access.",
  "privacy.rights.title": "Your Rights",
  "privacy.rights.intro": "Subject to applicable law, you may:",
  "privacy.rights.li1": "Request access to personal information about you",
  "privacy.rights.li2": "Request correction of incorrect or outdated information",
  "privacy.rights.li3": "Request deletion of personal information",
  "privacy.rights.li4": "Request to stop receiving marketing messages",
  "privacy.rights.li5": "Withdraw previously given consent, where applicable",
  "privacy.rights.contact":
    "To exercise these rights, please contact us by email:",
  "privacy.changes.title": "Changes to the Privacy Policy",
  "privacy.changes.p1": "We may update this policy from time to time.",
  "privacy.changes.p2":
    "The most current version will be published on the website and will take effect upon publication.",
  "privacy.contact.title": "Contact",
  "privacy.contact.p1":
    "For questions, requests, or clarifications regarding this privacy policy, please contact us:",
  "privacy.contact.lastUpdated": "Last updated: June 2026",

  // Shipping Policy
  "shipping.title": "Shipping Policy",
  "shipping.deliveryTime.title": "Delivery Time",
  "shipping.deliveryTime.p1":
    "All Little Gali products are made to order for each customer after the order is placed.",
  "shipping.deliveryTime.p2":
    "The estimated production and delivery time is up to 14 business days from order confirmation and payment.",
  "shipping.deliveryTime.p3":
    "The estimated delivery time includes product manufacturing and preparation and does not constitute a commitment to an exact delivery date.",
  "shipping.deliveryTime.p4":
    "We make every effort to deliver orders as early as possible; however, delays beyond our control may occur, including holiday season volume, delays with external service providers, technical issues, or delays by the shipping company.",
  "shipping.deliveryTime.p5":
    "In the event of an unusual delay, we will contact the customer and provide an update on the order status.",
  "shipping.costs.title": "Shipping Costs",
  "shipping.costs.p1":
    "Shipping cost is displayed during checkout and added to the product price.",
  "shipping.costs.p2":
    "Shipments are handled by external shipping companies according to the options available at the time of order.",
  "shipping.costs.p3":
    "Little Gali reserves the right to update shipping options and their costs from time to time.",
  "shipping.details.title": "Shipping Details",
  "shipping.details.p1":
    "The customer is responsible for ensuring that all order details and the shipping address are entered accurately and in full.",
  "shipping.details.p2":
    "In case of an incorrect address, incomplete address, wrong phone number, unavailability to receive the shipment, or any other reason not attributable to Little Gali, an additional charge may apply for reshipment.",
  "shipping.tracking.title": "Order Tracking",
  "shipping.tracking.p1":
    "After the package is handed over to the shipping company, the customer will receive a tracking number or shipping update, depending on the relevant shipping service.",
  "shipping.tracking.p2":
    "Once the package has been handed over to the shipping company, actual delivery times are the responsibility of the shipping company.",
  "shipping.deliveryAreas.title": "Delivery Areas",
  "shipping.deliveryAreas.p1": "We currently ship within Israel only.",
  "shipping.deliveryAreas.p2":
    "We may expand service to additional countries in the future; information will be updated on the website accordingly.",
  "shipping.damaged.title": "Product Damaged During Shipping",
  "shipping.damaged.p1":
    "If the product was received damaged during shipping, please contact us within 48 hours of receiving the order.",
  "shipping.damaged.intro": "Your message should include:",
  "shipping.damaged.li1": "Order number",
  "shipping.damaged.li2": "Description of the damage",
  "shipping.damaged.li3": "Clear photos of the product",
  "shipping.damaged.li4": "Photos of the outer packaging, if possible",
  "shipping.damaged.p2":
    "After reviewing your request and depending on the circumstances, we will arrange a product replacement or another appropriate solution at no additional cost.",
  "shipping.undelivered.title": "Undelivered Products",
  "shipping.undelivered.p1":
    "If a package is returned to us due to non-collection, an incorrect address, incorrect contact details, or customer unavailability, a reshipment can be arranged subject to payment of an additional shipping fee.",
  "shipping.contact.title": "Contact",
  "shipping.contact.p1":
    "For questions or inquiries about shipping, please contact us at:",
  "shipping.contact.lastUpdated": "Last updated: June 2026",

  // Returns Policy
  "returns.title": "Returns & Cancellation Policy",
  "returns.intro":
    "We strive to provide quality products and excellent service. If you encounter a problem with your order, we will be happy to help and find a fair solution.",
  "returns.customized.title": "Personalized Products",
  "returns.customized.p1":
    "All Little Gali products are made to order for each customer, based on the photos provided and approved during the ordering process.",
  "returns.customized.p2":
    "Accordingly, after order confirmation and payment, products made specifically for the customer cannot be canceled, changed, or returned, except in cases of product defects, shipping damage, or other cases where we are required to do so by law.",
  "returns.damage.title": "Product Defect or Shipping Damage",
  "returns.damage.p1": "Please check your order immediately upon receipt.",
  "returns.damage.p2":
    "If the product was received damaged, damaged during shipping, or produced in a way that materially does not match the order approved by the customer, please contact us within 48 hours of receiving the order.",
  "returns.damage.intro": "Your message should include:",
  "returns.damage.li1": "Order number",
  "returns.damage.li2": "Description of the issue",
  "returns.damage.li3": "Clear photos of the product",
  "returns.damage.li4": "Photos of the outer packaging, if possible",
  "returns.damage.p3":
    "After reviewing your request and depending on the circumstances, we may offer a replacement, repair, re-production, or a full or partial refund, at our discretion and in accordance with applicable law.",
  "returns.unsatisfied.title": "Dissatisfaction with the Product",
  "returns.unsatisfied.p1":
    "Little Gali products are based on photos provided by the customer and a personalized creation and production process.",
  "returns.unsatisfied.p2":
    "Before completing the order, the customer is shown a preview of the illustration or design for approval.",
  "returns.unsatisfied.p3":
    "Therefore, dissatisfaction arising from personal preference, personal taste, or expectations that do not match the approved preview does not constitute grounds for a refund.",
  "returns.unsatisfied.p4":
    "However, if there is an unusual issue with the product, we invite you to contact us and we will make an effort to find a fair solution for your satisfaction.",
  "returns.variations.title": "Natural Variations Between Preview and Print",
  "returns.variations.p1":
    "There may be minor differences between the digital preview on the website and the printed product, including differences in tones, colors, cropping, contrast, sharpness, or how colors appear on different screens.",
  "returns.variations.p2":
    "Reasonable differences of this kind are not considered defects and do not constitute grounds for a refund, replacement, or cancellation.",
  "returns.orderErrors.title": "Order Detail Errors",
  "returns.orderErrors.p1":
    "It is the customer's responsibility to ensure that all photos, personal details, and shipping address entered when placing the order are correct and complete.",
  "returns.orderErrors.p2":
    "Little Gali is not responsible for errors caused by incorrect information provided by the customer.",
  "returns.imageRights.title": "Photo Rights",
  "returns.imageRights.p1":
    "The customer declares that they own the rights to the uploaded photos or have obtained all required permissions to use them.",
  "returns.imageRights.p2":
    "Responsibility for all content uploaded to the website rests solely with the customer.",
  "returns.contact.title": "Contact",
  "returns.contact.p1":
    "For questions or inquiries about returns, cancellations, or order issues, please contact us at:",
  "returns.contact.lastUpdated": "Last updated: June 2026",

  // Language
  "lang.hebrew": "עברית",
  "lang.english": "English",

  // Home Page
  "home.hero.badge": "Personalized baby book",
  "home.hero.title": "The gift that grows with them",
  "home.hero.titleHighlight": "them",
  "home.hero.subtitle":
    "A personal book created from your photos — from the first months through later developmental stages",
  "home.hero.cta": "Start creating",
  "home.hero.ariaLabel": "Hero section",
  "home.hero.imageAlt": "Baby book examples",
  "home.hero.ctaAriaLabel": "Go to book creation page",
  "home.gallery.ariaLabel": "Customer photo gallery",
  "home.gallery.imageAlt": "Customer photo {num}",
  "home.book.bwSide": "Light booklet",
  "home.book.colorSide": "Dark booklet",
  "home.book.title": "Our Book",
  "home.book.titleHighlight": "Our",
  "home.book.subtitle": "A personal book created from the people|who matter to you",
  "home.book.description":
    "We looked for a book that would show your baby the people who love them — when we couldn't find one, we made one. Upload photos, we turn them into illustrations.",
  "home.book.pill.birthGift": "Birth gift",
  "home.book.pill.ai": "AI technology",
  "home.book.pill.standards": "Standards Institute approved",
  "home.book.pill.stroller": "Stroller-friendly",
  "home.book.pill.tummyTime": "Tummy time",
  "home.book.price": "Price per book",
  "home.book.secondBook": "Second book for ₪139",
  "home.book.discountNote": "Automatic discount at checkout",
  "home.book.freePreview": "Free preview before purchase",
  "home.book.promoLine": "Second book for ₪{price} · Automatic discount at checkout",
  "home.book.cta": "Create your personal book",
  "home.book.ariaLabel": "Product details - Our book",
  "home.book.imageAlt": "Image of the fabric book",
  "home.book.ctaAriaLabel": "Go to personal book creation page",
  "home.framedArt.badge": "New!",
  "home.framedArt.title": "Turn a cherished photo into personal wall art",
  "home.framedArt.titleHighlight": "cherished photo",
  "home.framedArt.subtitle":
    "Upload a photo, choose your favorite illustration style, and we'll turn it into a framed photo ready to hang — no drilling and no damage to your wall.",
  "home.framedArt.priceSingle": "Single frame:",
  "home.framedArt.priceTwo": "2 frames:",
  "home.framedArt.priceThree": "3 frames:",
  "home.framedArt.priceCardSingle": "Single frame",
  "home.framedArt.priceCardTwo": "2 frames",
  "home.framedArt.priceCardThree": "3 frames",
  "home.framedArt.pricePerPhoto": "₪{price} per frame",
  "home.framedArt.bestValue": "Best value",
  "home.framedArt.discountNote": "* Set discounts apply automatically in the cart",
  "home.framedArt.cta": "Start creating",
  "home.framedArt.ctaAriaLabel": "Create framed illustration",
  "home.framedArt.ariaLabel": "Framed illustration product",
  "home.framedArt.imageAlt": "Framed illustration example",
  "home.framedArt.carouselDotAria": "Go to image {num} of {total}",
  "home.framedArt.pill.patent": "Patented, no drilling",
  "home.framedArt.pill.removable": "Easy to remove and reposition",
  "home.framedArt.pill.illustrated": "Illustrated photos",
  "home.framedArt.pill.ai": "AI technology",
  "home.framedArt.pill.gift": "Original gift",
  "home.framedArt.freePreview": "Free preview before purchase",
  "home.framedArt.features.ariaLabel": "Framed art benefits",
  "home.framedArt.features.noDrill.title": "No drilling or holes",
  "home.framedArt.features.noDrill.subtitle":
    "Frames come with special magnetic stickers for easy mounting and repositioning.",
  "home.framedArt.features.style.title": "Illustration of your choice",
  "home.framedArt.features.style.subtitle":
    "Choose from our three illustration styles — colored pencils, cartoon, and watercolor.",
  "home.framedArt.features.preview.title": "Preview first",
  "home.framedArt.features.preview.subtitle":
    "See your finished illustration before you order and make sure you love it.",
  "qa.tabs.books": "Baby books",
  "qa.tabs.framed": "Framed illustration",
  "qa.framed.q1": "What size are the frames?",
  "qa.framed.a1": "Our frames are 20×20 cm with a 1.5 cm depth.",
  "qa.framed.q2": "What are the frames made of?",
  "qa.framed.a2": "MDF with a light oak wood-look finish.",
  "qa.framed.q3": "Do I need to drill the wall?",
  "qa.framed.a3":
    "No. The frame includes a no-drill magnetic hanging system.",
  "qa.framed.q4": "Can I remove the photo without damaging the wall?",
  "qa.framed.a4":
    "Yes. The frame comes with a unique no-drill magnetic hanging system that lets you remove and rehang easily. On most wall types, removal leaves no marks or damage.\nTo avoid damage, we recommend not sticking the adhesive on delicate surfaces, wallpaper, or cracked walls.",
  "qa.framed.q5": "Can I order a set of 2 or 3?",
  "qa.framed.a5":
    "Yes. Order one frame at a time and build a gallery wall of 2–3 pieces.",
  "qa.framed.q6": "Can I choose an illustration style?",
  "qa.framed.a6": "Color pencils, watercolor, or cartoon.",
  "qa.framed.q7": "Can I see the illustration before buying?",
  "qa.framed.a7":
    "Yes. Pick a style, upload your photo, and preview your illustration in that style before checkout.",
  "qa.framed.q8": "Will it look exactly like the photo?",
  "qa.framed.a8":
    "It is based on your photo but rendered artistically, so it will not be identical. You approve the preview before ordering.",
  "qa.framed.q9": "What if I am not happy with the product?",
  "qa.framed.a9":
    "We want you to love it. Defects or print/frame issues will be handled. Personalized items cannot be returned once production starts.",
  "framedArt.upload.styleTitle": "Choose your illustration style",
  "framedArt.upload.styleTitleHighlight": "style",
  "framedArt.upload.continueToUpload": "Continue to upload",
  "framedArt.upload.title": "Upload a photo for framed art",
  "framedArt.upload.titleHighlight": "photo",
  "framedArt.upload.uploadSubtitle":
    "Choose an illustration style, upload one photo, and crop it for the frame",
  "framedArt.upload.selectStyleFirst": "Choose an illustration style before uploading",
  "framedArt.upload.cropInstruction": "Drag and position your photo in the frame",
  "framedArt.upload.cropZoomHint":
    "The marked square shows how your photo will appear in the frame — zoom in or out as needed",
  "framedArt.upload.zoomIn": "Zoom in",
  "framedArt.upload.zoomOut": "Zoom out",
  "framedArt.upload.zoomSlider": "Photo zoom",
  "framedArt.upload.lockedStyleLabel": "Selected style:",
  "framedArt.upload.subtitle": "Choose one photo and crop it for the frame",
  "framedArt.upload.remainingBadge": "You have {count} designs left",
  "framedArt.upload.selectPhoto": "Choose photo",
  "framedArt.upload.continue": "Continue",
  "framedArt.upload.createPreview": "Create preview",
  "framedArt.upload.invalidType": "Only JPG or PNG files are allowed",
  "framedArt.upload.limitReached": "Upload limit reached for the last 12 hours",
  "framedArt.upload.errorGeneric": "Something went wrong, please try again",
  "framedArt.preview.loadingTitle": "Creating your image",
  "framedArt.preview.readyTitle": "Your illustration is ready",
  "framedArt.preview.readyTitleHighlight": "Your",
  "framedArt.preview.loadingLine1": "Starting work on your image",
  "framedArt.preview.loadingLine2": "Removing the background",
  "framedArt.preview.loadingLine3": "Checking who's in the photo",
  "framedArt.preview.loadingLine4": "Creating the illustration",
  "framedArt.preview.loadingLine5": "Adding a bit more color",
  "framedArt.preview.loadingLine6": "Making sure everything is in place",
  "framedArt.preview.loadingLine7": "A little more magic",
  "framedArt.preview.loadingLine8": "Final touches",
  "framedArt.preview.styleLabel": "Illustration style:",
  "framedArt.preview.cropTapHint": "Tap the image to adjust the crop.",
  "framedArt.preview.specialRequestBefore": "Have a special request? Feel free to ",
  "framedArt.preview.specialRequestLink": "contact us",
  "framedArt.preview.cropInstruction": "Drag and position your illustration in the frame",
  "framedArt.preview.cropZoomHint":
    "The marked square shows how your art will appear in the frame — zoom in or out as needed",
  "framedArt.preview.cropSave": "Save",
  "framedArt.preview.savingCrop": "Saving...",
  "framedArt.preview.regenerate": "Regenerate",
  "framedArt.preview.addToCart": "Add to cart",
  "framedArt.preview.uploadDifferentPhoto": "Replace photo",
  "framedArt.preview.addAnother": "Add another frame (start over)",
  "framedArt.preview.errorGeneric": "Something went wrong, please try again",
  "cart.framedArtTitle": "Framed illustration",
  "cart.addFramedArt": "Add framed art",
  "cart.suggest.ariaLabel": "Order add-on suggestions",
  "cart.suggest.title": "Add more products",
  "cart.suggest.subtitle": "Complete your order with additional products",
  "cart.suggest.bookTitle": "Booklet",
  "cart.suggest.framedArtTitle": "Framed illustration",
  "cart.suggest.bookPromo": "2 for ₪139",
  "cart.suggest.framedArtPromo": "2 for ₪89",
  "home.howItWorks.title": "How it works",
  "home.howItWorks.titleHighlight": "works",
  "home.howItWorks.subtitle":
    "All you need are a few favorite photos – we'll take care of the rest",
  "home.howItWorks.step1.label": "You do",
  "home.howItWorks.step1.title": "Upload photos",
  "home.howItWorks.step1.description":
    "Choose 5 photos to appear in the book",
  "home.howItWorks.step1.descriptionWithoutPreview":
    "Choose 5 photos for the book and a style for the colorful side",
  "home.howItWorks.step1.imageAlt": "Example of photo upload",
  "home.howItWorks.step2.label": "We do",
  "home.howItWorks.step2.title": "Process the images",
  "home.howItWorks.step2.description":
    "We'll create a double-sided book from your photos, print it, and ship it to you",
  "home.howItWorks.step2.imageAlt": "Example of processed images in book",
  "home.howItWorks.previewStep2.label": "We do",
  "home.howItWorks.previewStep2.title": "We create the images",
  "home.howItWorks.previewStep2.description":
    "You can preview the illustrations and choose the style and book color before purchasing.",
  "home.howItWorks.previewStep2.imageAlt": "Example of preview images",
  "home.howItWorks.previewStep3.label": "We do",
  "home.howItWorks.previewStep3.title": "We print and ship",
  "home.howItWorks.previewStep3.description":
    "We print the images and assemble the book that will be shipped to your home.",
  "home.howItWorks.previewStep3.imageAlt": "Example of a printed book",
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
  "home.special.title": "Why Little Gali",
  "home.special.titleHighlight": "Little Gali",
  "home.special.subtitleLine1": "We searched and couldn't find it - so we invented it.",
  "home.special.ariaLabel": "Why Little Gali",
  "home.special.item1.title": "Based on what interests babies",
  "home.special.item1.description":
    "Familiar faces capture babies' attention from a young age.",
  "home.special.item1.imageAlt": "Science illustration",
  "home.special.item2.title": "Fun to give, fun to receive",
  "home.special.item2.description":
    "A personal gift that remains a keepsake long after the first months.",
  "home.special.item2.imageAlt": "Gift illustration",
  "home.special.item3.title": "Tummy time with loved ones",
  "home.special.item3.description":
    "The people they love, during tummy time and stroller walks too.",
  "home.special.item3.imageAlt": "Stroller illustration",
  "home.special.item4.title": "Safe from day one",
  "home.special.item4.description":
    "Tested and approved by the Israel Standards Institute for use from birth.",
  "home.special.item4.imageAlt": "Safety certification illustration",
  "home.about.brand": "Little Gali",
  "home.about.title": "Who We Are",
  "home.about.titleHighlight": "We",
  "home.about.imageAlt": "Little Gali team photo",
  "home.about.paragraph1":
    "Hi, I'm Yael — Gali's mom and the creator of Little Gali.",
  "home.about.paragraph2":
    "A few months after Gali was born, an idea came to me that wouldn't let go. I started working on it on the side, mostly while she slept on me in the carrier, just to see if I could turn it into something real.",
  "home.about.paragraph3":
    "The responses I got from friends who had given birth went far beyond what I expected, and gave me the push to turn the idea into a business.",
  "home.about.paragraph4":
    "Today Little Gali is where I create personal, original products, with a desire to offer special gifts that feel a little different.",
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
  "home.comingSoon.emailLabel": "Email address",
  "home.comingSoon.emailPlaceholder": "Your email address",
  "home.comingSoon.button": "Notify Me",
  "home.comingSoon.submitting": "Sending...",
  "home.comingSoon.error": "Invalid email address",
  "home.comingSoon.errorGeneric": "Something went wrong, please try again",
  "home.comingSoon.success": "Thank you! We'll update you when the product is available",
  "home.comingSoon.successTitle": "Thank You!",
  "home.comingSoon.successMessage": "We'll update you when the fabric books arrive",
  "home.comingSoon.imageAlt": "Coming soon product image",

  // Style Examples Section
  "home.styleExamples.title": "Our Styles",
  "home.styleExamples.titleHighlight": "Styles",
  "home.styleExamples.subtitle": "Every book includes a black & white side and a colorful side in your chosen style",
  "home.styleExamples.description": "The black & white side is created automatically for visual stimulation. You choose the style for the colorful side:",
  "home.styleExamples.cartoon": "Cartoon",
  "home.styleExamples.pencil": "Pencil",
  "home.styleExamples.watercolor": "Watercolor",
  "home.styleExamples.before": "Original Photo",
  "home.styleExamples.after": "Result",
  "home.styleExamples.cta": "See More Style Examples",
  "home.styleExamples.ctaAriaLabel": "Go to style examples page",
  "home.styleExamples.ariaLabel": "Available processing styles",
  "home.styleExamples.slideLabel": "Example {num}",

  "home.customerComments.title": "Your Reactions",
  "home.customerComments.titleHighlight": "Reactions",
  "home.customerComments.imageAlt": "Customer review",
  "home.customerComments.showMore": "Show More",
  "home.testimonials.title": "What People Say About Us",
  "home.testimonials.titleHighlight": "Say",
  "qa.questionPreview": "Can I see the illustrations before placing my order?",
  "qa.answerPreview":
    "Yes.\n\nAfter uploading your photos, you can see the illustrations created for you and a preview of the book before completing your order.\n\nIf you'd like, you can regenerate illustrations or contact us if there's anything you'd like to improve.",
  "qa.questionSafety": "Is the book safe to use?",
  "qa.answerSafety":
    "Yes.\n\nThe book has been tested and approved by the Standards Institution of Israel and meets safety requirements for products intended for babies and children.\n\nIt is made from quality, durable materials so you can enjoy it with confidence and peace of mind.\n\nAs with any product intended for babies, adult supervision is recommended.",
  "qa.questionPhotos": "What photos are suitable for creating the book?",
  "qa.answerPhotos":
    "For the best results, we recommend choosing sharp, clear photos where faces are clearly visible.\n\nClose-up photos usually yield the best results, but you can also use photos of several people together, as long as the faces are visible and clear.",
  "qa.questionFromBirth": "Is the book suitable from birth?",
  "qa.answerFromBirth":
    "Yes.\n\nThe book was designed especially for babies from birth. One side features high-contrast black and white illustrations, adapted for babies' vision in their first months, and the other side features colorful illustrations that will accompany your baby as they grow.",
  "qa.questionDelivery": "How long does it take to receive the book?",
  "qa.answerDelivery":
    "Each book is made to order after you place your order.\n\nProduction and delivery time is up to 7 business days.",
  "qa.questionSpecial": "What makes the Little Gali book special?",
  "qa.answerSpecial":
    "The Little Gali baby book is created especially for your baby.\n\nInstead of generic characters or illustrations, the book features the people they know and love – parents, siblings, grandparents, and other meaningful people in their life.\n\nIt combines adaptation for baby vision in the first months with a personal, emotional experience, making it a unique gift created especially for your family.",
  "qa.questionPhotoCount": "How many photos do I need to choose?",
  "qa.answerPhotoCount":
    "To create the book, you need to choose 5 photos.\n\nYou can choose different people or multiple photos of the same person – it's entirely up to you.",
  "qa.questionPeopleCount": "How many people can appear in each photo?",
  "qa.answerPeopleCount":
    "There is no limit on the number of people in a photo.\n\nThe most important thing is that faces are clear and recognizable. The larger and clearer the faces, the better the result.",
  "qa.questionGift":
    "I want to buy the book as a gift. Do I have to choose the photos myself?",
  "qa.answerGift":
    "No.\n\nYou can purchase a gift card, and the parents will choose the photos themselves, create the illustrations, and order the book when it suits them.\n\nThis way you can give a personal and meaningful gift without choosing the photos for them.",
  "qa.questionSimilarity": "Do the illustrations really look like the people in the photos?",
  "qa.answerSimilarity":
    "Yes.\n\nOur illustration system is designed to preserve each person's unique features – facial features, expressions, and hair – while adapting the image to the book's illustration style.\n\nThe goal is to create simple, clear illustrations for babies without losing the features that make each person special.",
  "qa.questionCleaning": "How do I clean the book?",
  "qa.answerCleaning":
    "You can gently wipe the book with a damp cloth.\n\nDo not machine wash, soak in water, or use harsh cleaning agents.",
  "qa.questionUnsatisfied": "What if I'm not satisfied with the book?",
  "qa.answerUnsatisfied.line1":
    "The final book will be exactly the same as the book you approved before purchase.",
  "qa.answerUnsatisfied.beforeLink":
    "If something still didn't turn out as you expected, feel free to contact ",
  "qa.answerUnsatisfied.linkText": "us",
  "qa.notFound": "Didn't find the answer you were looking for?",
  "qa.contact": "Contact Us",

  // Footer
  "footer.description":
    "Personalized baby books\ncustom-made with illustrations\nof the people your baby loves most.",
  "footer.platform": "Platform",
  "footer.products": "Products",
  "footer.information": "Information",
  "footer.babyBooks": "Baby Books",
  "footer.framedArt": "Framed Illustration",
  "footer.howItWorks": "How It Works",
  "footer.photoGuide": "Photo Selection Guide",
  "footer.inspiration": "Inspiration Gallery",
  "footer.policies": "Policies",
  "footer.terms": "Terms of Service",
  "footer.termsOfUse": "Terms of Use",
  "footer.privacy": "Privacy",
  "footer.shipping": "Shipping",
  "footer.returns": "Returns",
  "footer.about": "About",
  "footer.whoWeAre": "Who We Are",
  "footer.contact": "Contact",
  "footer.contactUs": "Contact Us",
  "footer.contactUsAriaLabel": "Go to contact page",
  "footer.copyright": "© Little Gali. All rights reserved.",

  // Contact Page
  "contact.title": "Contact Us",
  "contact.titleHighlight": "Contact",
  "contact.subtitle1": "Unsure about your photos? Have a question?",
  "contact.subtitle2": "Feel free to reach out — we're happy to help with anything",
  "contact.imageAlt": "Contact us",
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
  "contact.previewLinked": "Your message will include your preview session",
  "contact.attachments": "Attach images (not required)",
  "contact.attachmentsLimitHint": "You can attach up to 5 images",
  "contact.attachmentsChoose": "Choose images",
  "contact.attachmentsCount": "{count} of 5",
  "contact.attachmentsRemove": "Remove",
  "contact.attachmentsTooMany": "You can attach up to 5 images only",
  "contact.attachmentsInvalidType": "Only JPG or PNG files are allowed",
  "contact.attachmentsFileTooLarge": "Maximum size per image: 2MB",
  "contact.attachmentsTotalTooLarge": "Maximum total size for all images: 10MB",

  // Upload Page
  "upload.title": "Let's Create a Personalized Book for Your Baby",
  "upload.titleHighlight": "Personalized",
  "upload.description":
    "Select 5 photos that will appear in the book.\nThe five photos will appear on one side in black and white and on the other in color.",
  "upload.imagesCount": "out of 5 photos",
  "upload.selectExactly5": "Please select exactly 5 photos",
  "upload.waitForUpload": "Please wait until photos finish uploading",
  "upload.invalidType": "Only JPG or PNG files are allowed (HEIC is not supported)",
  "upload.serverError": "Server error. Please try again later.",
  "upload.addingToCart": "Adding to cart...",
  "upload.uploading": "Uploading photos...",
  "upload.uploadingAndAdding": "Uploading photos and adding to cart...",
  "upload.updating": "Updating...",
  "upload.addToCart": "Add to Cart",
  "upload.tapToCrop": "Tap an image to edit its crop",
  "upload.cropBackgroundTip": "Tip: crop the image so it contains as little background as possible",
  "upload.titleReady": "Upload photos",
  "upload.titleReadyHighlight": "photos",
  "upload.descriptionReady":
    "The five photos will appear on one side in black and white and on the other in color.",
  "upload.dragToReorder": "Drag the photos to change their order",
  "upload.cropInstruction":
    "Drag the image to adjust size and position.",
  "upload.cropInstructionTip":
    "For best results, leave as little empty space around your subjects as possible.",
  "upload.cropDone": "Done",
  "upload.analyzingPhoto": "Suggesting a smart crop…",
  "upload.cropFaceClipWarning":
    "It looks like part of someone’s face may be cut off by this crop. Try moving or zooming so everyone fits in the frame.",
  "upload.cropFaceClipTapDoneAgain":
    "If this is intentional, tap “Done” again to continue.",
  "upload.changeImage": "Change Image",
  "upload.startOver": "Start Over",
  "upload.photoTip": "What kind of photo should I upload?",
  "upload.photoNote":
    "No need for a perfect photo, we'll make sure the faces, expressions, and human warmth in the photo come through.",
  "upload.continueToPreview": "Continue to preview",
  "upload.continueWithoutPreview": "Continue without preview",
  "upload.withoutPreviewReassurance": "We'll make sure your photos look amazing",
  "upload.startingPreview": "Preparing your preview...",
  "upload.previewRateLimit":
    "You can only generate {limit} previews every {windowHours} hours. Please try again later.",
  "upload.previewLastGenerationWarning":
    "This is your last preview for the next {windowHours} hours.",
  "upload.previewLastGenerationWarningWithReset":
    "This is your last preview for the next {windowHours} hours. After this you can try again at {resetTime} or contact us.",
  "upload.previewRateLimitWithoutPreviewHint":
    "You can still add to cart without a preview using the button below.",
  "upload.previewRateLimitOr": "Or ",
  "upload.previewRateLimitContactLink": "contact us",

  // Preview flow
  "preview.bwPhaseTitle": "The Black & White Side",
  "preview.colorPhaseTitle": "Your Complete Booklet",
  "preview.colorPhaseTitleHighlight": "Your",
  "preview.colorPhaseDescription":
    "Switch between the book sides to view the full result.\nOn the color side you can choose between three different illustration styles.",
  "preview.bwPhaseDescription":
    "Your black & white versions are ready ✨\nNote: after moving to the next step, you won't be able to upload new photos.",
  "preview.bwApproveAbove": "Happy with it? Continue to the color side",
  "preview.bwApproveBelowBefore": "Something didn't turn out as expected? ",
  "preview.approveBwButton": "Move to the color side",
  "preview.colorCartAbove": "Ready to add to cart?",
  "preview.bwLoadingTitle": "Creating your images",
  "preview.bwLoadingLine1": "Processing your photos",
  "preview.bwLoadingLine2": "Preparing the black & white side",
  "preview.bwLoadingLine3": "Analyzing each photo",
  "preview.bwLoadingLine4": "Boosting the contrast",
  "preview.bwLoadingLine5": "Making sure everything looks great",
  "preview.colorLoadingLine1": "Creating the color side",
  "preview.colorLoadingLine2": "Preparing all the styles",
  "preview.colorLoadingLine3": "Adding more color",
  "preview.colorLoadingLine4": "Making sure everything is in place",
  "preview.colorLoadingLine5": "Final touches",
  "preview.loadingTitle": "Creating your booklet...",
  "preview.loadingLine1": "Creating the perfect gift",
  "preview.loadingLine2": "Preparing your photos",
  "preview.loadingLine3": "We have never made a booklet quite like this",
  "preview.loadingLine4": "Giving every photo a little extra care",
  "preview.loadingLine5": "Adding magic",
  "preview.loadingLine6": "Good things take time",
  "preview.loadingDuration": "This takes between 30 seconds and a minute",
  "preview.loadingSlow": "Taking a little longer than usual, almost there...",
  "preview.title": "Here is your booklet",
  "preview.titleHighlight": "your",
  "preview.subtitle": "You can make up to 3 changes.",
  "preview.tabBw": "Black & white side",
  "preview.tabColor": "Color side",
  "preview.zoom": "Zoom",
  "preview.closeLightbox": "Close enlarged view",
  "preview.lightboxPrevious": "Previous page",
  "preview.lightboxNext": "Next page",
  "preview.colorLoadingTitle": "Creating the color side",
  "preview.colorStyleStrip.title": "3 styles · tap to compare",
  "preview.bookColor.title": "Choose your book color",
  "preview.bookColor.dark": "Black with spotted border",
  "preview.bookColor.light": "Light with dotted border",
  "preview.bookColor.required": "Which book fabric color would you like?",
  "preview.changesLeft": "Changes left",
  "preview.changesRemainingBadge": "You have {count} changes left",
  "preview.changesExhaustedLine1":
    "You've used today's changes — you can choose from the images created,",
  "preview.changesExhaustedLine2Before": "or ",
  "preview.changesExhaustedContactLink": "contact us",
  "preview.changesExhaustedLine2After":
    " if something didn't turn out as you expected",
  "preview.regenerate": "Generate again",
  "preview.replaceImage": "Replace photo",
  "preview.prohibitedContentLine1": "The photo was blocked by the model.",
  "preview.prohibitedContentLine2": "Please upload a different photo instead.",
  "preview.prohibitedContentUpload": "Upload photo",
  "preview.slotRetryAgain": "Try again",
  "preview.imageActions": "Image options",
  "preview.originalImage": "Compare with original image",
  "preview.cropImage": "Crop image",
  "preview.cropInstructionTip":
    "Our recommendation: zoom in on the subjects and trim white areas on the sides of the image when you can.",
  "preview.saveCrop": "Save crop",
  "preview.cancelCrop": "Cancel",
  "preview.cropError": "Something went wrong, please try again",
  "preview.cropSaving": "Saving crop...",
  "preview.originalPhoto": "Original photo",
  "preview.generatedImage": "Generated result",
  "preview.previousVersions": "Previous versions",
  "preview.allVersions": "All versions",
  "preview.approveBw": "Approve black & white",
  "preview.continueToColorSide": "Continue to the color side",
  "preview.addToCart": "Add to cart",
  "preview.contactPrompt": "Didn't turn out as expected?",
  "preview.contactButton": "Contact us",
  "preview.styleTitle": "Choose a style for the colorful side",
  "preview.colorSurprise": "You'll discover the colorful version when your book arrives",
  "preview.continueToCart": "Continue to cart",
  "preview.slotBusy": "Generating image...",
  "preview.sessionError": "We couldn't load your preview. Please try again.",
  "preview.generationRateLimit":
    "You've reached today's generation limit. You can try again tomorrow, or ",
  "preview.generationRateLimitAfter": " if something seems wrong.",
  "preview.generationRateLimitContactLink": "contact us",
  "preview.imageLoadFailed": "We couldn't load this image.",
  "preview.imageLoadFailedNoCredits": "You've used all your changes. For help,",
  "preview.sessionNotFound": "We couldn't find this preview. It may have expired or the link is invalid.",
  "preview.sessionUnauthorized": "This browser can't access that preview. Start again from the upload page.",
  "preview.loadFailed": "Something went wrong with the preview.\nWe've received a notification and are working on a fix.",
  "preview.retry": "Try again",
  "preview.continueWithoutPreview": "Continue without preview",
  "preview.backToUpload": "Back to upload",
  "preview.addingToCart": "Adding to cart...",

  // Style Selector
  "styleSelector.title": "Choose Your Style:",
  "styleSelector.subtitle":
    "The style will affect the colorful side of the image",
  "styleSelector.learnMore": "Click to see examples of each style",
  "styleSelector.closeExamples": "Close Examples",
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

  // Gift Cards
  "giftCard.title": "Gift Card for Personalized Book",
  "giftCard.titleHighlight": "Gift Card",
  "giftCard.description":
    "Want to give a gift but prefer they choose the photos themselves? Our gift card allows exactly that.",
  "giftCard.selectOption": "Select an option",
  "giftCard.emailNote": "The gift card will be sent by email immediately after purchase",
  "giftCard.addToCart": "Add to Cart",
  "giftCard.adding": "Adding...",
  "giftCard.ariaLabel": "Add gift card to cart",
  "giftCard.option1": "One Personalized Book (No Shipping)",
  "giftCard.option2": "One Personalized Book (With Shipping)",
  "giftCard.option3": "Two Personalized Books (No Shipping)",
  "giftCard.option4": "Two Personalized Books (With Shipping)",
  "giftCard.feature1": "Second book for ₪139",
  "giftCard.feature2": "Choice of 5 photos",
  "giftCard.feature3": "Choice of style",
  "giftCard.feature4": "No expiration date",

  // Cookie Consent
  "cookieConsent.title": "Cookies & Tracking",
  "cookieConsent.line1":
    "We use cookies to improve your browsing experience.",
  "cookieConsent.line2BeforeLink":
    "Continued use of the site constitutes consent in accordance with ",
  "cookieConsent.policyLink": "the policy",
  "cookieConsent.close": "Close cookie notice",
  "cookieConsent.ariaLabel": "Cookie and tracking notice",
};
