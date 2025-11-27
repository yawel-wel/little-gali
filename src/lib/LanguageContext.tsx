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
  "nav.qa": "שאלות ותשובות",
  "nav.inspiration": "השראה",
  "nav.contact": "צור קשר",
  "nav.createBook": "צרו ספרון",

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
  "cart.style.cartoon": "קריקטורה",
  "cart.style.pencil": "עיפרון",
  "cart.book": "ספר",
  "cart.orderSummary": "סיכום הזמנה",
  "cart.itemsCount": "כמות פריטים:",
  "cart.deliveryTime": "זמן אספקה - עד 14 ימי עסקים",
  "cart.readyMessage": "הודעה תשלח כשהספרון מוכן בשביל תיאום לאיסוף",
  "cart.checkoutProgress": "מעבר לתשלום...",
  "cart.addBook": "הוסף ספרון",
  "cart.secondBook": "ספרון שני ב-99 ₪ 🎉",
  "cart.discountNote": "* ההנחה מתעדכנת אוטומטית בעמוד התשלום",
  "cart.startCreating": "התחל ליצור ספרון מותאם אישית",
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
  "home.hero.title": "ספרון תינוקות מותאם באופן אישי",
  "home.hero.titleHighlight": "אישי",
  "home.hero.cta": "צרו ספרון עכשיו",
  "home.book.title": "הספרון שלנו",
  "home.book.titleHighlight": "הספרון",
  "home.book.subtitle": "ספרון אישי לתינוק – עם תמונות המשפחה שלכם",
  "home.book.description":
    "ספרון דו־צדדי עם תמונות מעובדות ב־AI שנוצרות מהתמונות המשפחתיות שלכם.\nצד אחד בשחור־לבן לגירוי ראייה לתינוקות בני 0–3 חודשים, וצד שני צבעוני, להמשך ההתפתחות.\nמושלם לזמן בטן, לשידת ההחתלה או למתנה אישית במיוחד.",
  "home.book.price": "מחיר לספר",
  "home.book.secondBook": "ספר שני ב-₪99 בלבד",
  "home.book.discountNote": "* ההנחה מתעדכנת אוטומטית בעמוד התשלום",
  "home.book.cta": "צרו עכשיו את הספרון האישי שלכם",
  "home.howItWorks.title": "איך זה עובד – בשלושה צעדים פשוטים",
  "home.howItWorks.titleHighlight": "עובד",
  "home.howItWorks.subtitle":
    "כל מה שצריך זה כמה תמונות אהובות – אנחנו נדאג לכל השאר",
  "home.howItWorks.step1.label": "אתם עושים",
  "home.howItWorks.step1.title": "מעלים תמונות",
  "home.howItWorks.step1.description":
    "מעלים 5 תמונות אהובות של התינוק או המשפחה – זה לוקח פחות מדקה",
  "home.howItWorks.step2.label": "אנחנו עושים",
  "home.howItWorks.step2.title": "מעבדים את התמונות",
  "home.howItWorks.step2.description":
    "בעזרת בינה מלאכותית (AI) אנחנו ממירים את התמונות לגרסאות ברורות וידידותיות לתינוק – בשחור-לבן ובצבע.",
  "home.howItWorks.step3.label": "אנחנו עושים",
  "home.howItWorks.step3.title": "מדפיסים את הספרון",
  "home.howItWorks.step3.description":
    "אנחנו מדפיסים את הספרון האישי שלכם באיכות גבוהה ושולחים אותו עד הבית – מוכן לשימוש ולמזכרת.",
  "home.howItWorks.cta": "התחילו עכשיו",
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
  "home.special.item1.title": "להסתכל על הקרובים ביותר",
  "home.special.item1.description":
    "הפנים של המטפלים העיקריים מוכרות לתינוק ומרגיעות אותו כבר מימיו הראשונים",
  "home.special.item2.title": "להכיר את המשפחה",
  "home.special.item2.description":
    "הזדמנות להיחשף ולהסתכל על המשפחה אליה נכנס התינוק",
  "home.special.item3.title": "מזכרת מתוקה",
  "home.special.item3.description":
    "ספרון שהוא אישי ומהווה מזכרת לתקופה קצרה ומופלאה בחיי התינוק",
  "home.special.item4.title": "לא עוד מוצר גנרי",
  "home.special.item4.description":
    "במקום להסתכל על צורות ותבניות, תנו לתינוק להסתכל על המשפחה",
  "home.about.brand": "ליטל גלי",
  "home.about.title": "מי אנחנו",
  "home.about.titleHighlight": "אנחנו",
  "home.about.paragraph1":
    "התחלתי לעבוד על הפרויקט אחרי שגלי נולדה. מצאתי את עצמי נשאבת לזה – חושבת על זה, מתכננת, מעצבת את האתר, ובכל פעם שמישהי העלתה תמונות לספרון – זה היה הדבר הראשון שרציתי לראות.",
  "home.about.paragraph2":
    "נהניתי מהתהליך עצמו, מליצור משהו חדש, ובעיקר מלראות את התגובות של האמהות כשהספרונים הגיעו אליהן. הרגשתי שאני עושה משהו מיוחד, שיש לו מקום, ושגם אני הייתי רוצה אותו בשביל גלי שלי (ואל דאגה – הכנתי לה כבר כמה וכמה ספרונים משלה).",
  "home.about.paragraph3":
    "אני מקווה שכמוני יהיו עוד אמהות שימצאו בספרון הזה ערך, שירצו אחד כזה לתינוק שלהן. ובסוף – זה גם בשבילנו. לראות את התינוק שלנו מסתכל על התמונות של המשפחה בסקרנות ולהתרגש בכל פעם מחדש.",
  "home.qa.title": "שאלו אותנו",
  "home.qa.titleHighlight": "אותנו",
  "home.qa.subtitle": "התשובות לשאלות הנפוצות ביותר על הספרון והשירותים שלנו",
  "home.qa.cta": "לכל השאלות והתשובות",
  "qa.question1": "ממה הספרון עשוי?",
  "qa.answer1": "הספרון עשוי מנייר איכותי ועבה שנעבר למינציה.",
  "qa.question2": "כמה תמונות צריך לבחור?",
  "qa.answer2":
    "5 תמונות בלבד. אותן תמונות מופיעות בצד אחד בשחור לבן ובצד השני בצבעוני.",
  "qa.question3": "מי כדאי שיהיה בספרון?",
  "qa.answer3":
    "אנשים קרובים שתינוקכם יכיר ויתחבר אליהם – הורים, סבים, אחים, חבר קרוב ואפילו חיית המחמד המשפחתית.",
  "qa.question4": "איזה תמונה מתאימה?",
  "qa.answer4":
    "תמונה ברורה של הפנים, בלי משקפי שמש ועדיף עם חיוך. לא קרובה מדי לפנים. הימנעו מתמונות מטושטשות או עם תאורה גרועה.",
  "qa.question5": "אפשר לשים כמה אנשים בתמונה אחת?",
  "qa.answer5":
    "כן, בהחלט! ניתן להעלות תמונה עם שני אנשים במידה והתמונה תהיה ברורה ומוארת היטב. עדיף להימנע מתמונות עם יותר משני אנשים מאחר ועיבוד התמונה עלול להיפגע וגם כי תמונה עם יותר מדיי פרטים אינה מותאמת לתינוקות.",
  "qa.question6": "האם הרקע משנה?",
  "qa.answer6": "לא. הרקע מוסר אוטומטית ומוחלף בלבן.",
  "qa.question7": "איך מנקים את הספרון?",
  "qa.answer7": "אפשר לנגב בעדינות עם מטלית לחה. יש להימנע ממגע ישיר עם מים.",
  "qa.question8": "כמה זמן לוקח להכין את הספרון?",
  "qa.answer8":
    "תהליך ההכנה לוקח 7-10 ימי עבודה מרגע קבלת התמונות. אנו שולחים עדכון על התקדמות ומעדכנים אתכם כשהספרון מוכן לאיסוף או למשלוח.",
  "qa.question9": "מה אם אני לא מרוצה מהספרון?",
  "qa.answer9":
    "המטרה שלנו היא שתאהבו ותהיו מרוצים מהספרון שלכם. אם זה לא המצב שאנחנו מאפשרים להחזיר את הספרון ולקבל את התשלום בחזרה.",
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
    "בחרו 5 תמונות שיופיעו בספרון.\nאין צורך בתמונה מושלמת, אנחנו נדאג שהפנים, ההבעה והחום האנושי שבתמונה יבואו לידי ביטוי.",
  "upload.imagesCount": "מתוך 5 תמונות",
  "upload.selectExactly5": "אנא בחר בדיוק 5 תמונות",
  "upload.waitForUpload": "אנא המתן עד שהתמונות יסיימו להעלות",
  "upload.serverError": "שגיאה בשרת. אנא נסה שוב מאוחר יותר.",
  "upload.addingToCart": "מוסיף לעגלה...",
  "upload.updating": "מעדכן...",
  "upload.addToCart": "הוסף לעגלה",
  "upload.startOver": "התחל מחדש",
  "upload.photoTip": "איזו תמונה כדאי להעלות?",

  // Style Selector
  "styleSelector.title": "בחרו את הסגנון שלכם:",
  "styleSelector.subtitle": "הסגנון ישפיע על הצד הצבעוני של התמונה",
  "styleSelector.cartoon": "קריקטורה",
  "styleSelector.pencil": "עיפרון",
  "styleSelector.cartoonAlt": "קריקטורה - סגנון קריקטורה",
  "styleSelector.pencilAlt": "עיפרון - סגנון עיפרון",
  "styleSelector.modal.title": "מה ההבדל?",
  "styleSelector.modal.subtitle": "בחרו את הסגנון המועדף עליכם לצד הצבעוני:",
  "styleSelector.modal.cartoon.bold": "סגנון איורי",
  "styleSelector.modal.cartoon.vibrant": "משחקי וחמוד",
  "styleSelector.modal.cartoon.modern": "צבעים עזים",
  "styleSelector.modal.cartoon.stylized": "פחות מדויק לפרטים",
  "styleSelector.modal.pencil.soft": "סגנון עפרונות צבעוניים",
  "styleSelector.modal.pencil.delicate": "רך ואומנותי",
  "styleSelector.modal.pencil.handDrawn": "פסטלים עדינים",
  "styleSelector.modal.pencil.realistic": "מדויק לפרטים",
  "styleSelector.modal.gotIt": "הבנתי!",

  // Upload Modal
  "uploadModal.title": "איך לבחור תמונה לספרון?",
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
};

const englishTranslations = {
  // Navigation
  "nav.home": "Home",
  "nav.about": "About Us",
  "nav.qa": "Q&A",
  "nav.inspiration": "Inspiration",
  "nav.contact": "Contact",
  "nav.createBook": "Create Book",

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
  "cart.style.cartoon": "Cartoon",
  "cart.style.pencil": "Pencil",
  "cart.book": "Book",
  "cart.orderSummary": "Order Summary",
  "cart.itemsCount": "Number of items:",
  "cart.deliveryTime": "Delivery time - up to 14 business days",
  "cart.readyMessage":
    "A message will be sent when the book is ready for pickup coordination",
  "cart.checkoutProgress": "Redirecting to payment...",
  "cart.addBook": "Add Book",
  "cart.secondBook": "Second book for ₪99 🎉",
  "cart.discountNote": "* Discount is automatically applied at checkout",
  "cart.startCreating": "Start creating a personalized book",
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
  "home.book.title": "Our Book",
  "home.book.titleHighlight": "Book",
  "home.book.subtitle": "Personal baby book – with your family photos",
  "home.book.description":
    "A double-sided book with AI-processed images created from your family photos.\nOne side in black and white for visual stimulation for babies 0-3 months old, and a colorful side for continued development.\nPerfect for tummy time, the changing table, or as a special personalized gift.",
  "home.book.price": "Price per book",
  "home.book.secondBook": "Second book for only ₪99",
  "home.book.discountNote": "* Discount is automatically applied at checkout",
  "home.book.cta": "Create Your Personal Book Now",
  "home.howItWorks.title": "How It Works – In Three Simple Steps",
  "home.howItWorks.titleHighlight": "Works",
  "home.howItWorks.subtitle":
    "All you need are a few favorite photos – we'll take care of the rest",
  "home.howItWorks.step1.label": "You do",
  "home.howItWorks.step1.title": "Upload photos",
  "home.howItWorks.step1.description":
    "Upload 5 favorite photos of the baby or family – it takes less than a minute",
  "home.howItWorks.step2.label": "We do",
  "home.howItWorks.step2.title": "Process the images",
  "home.howItWorks.step2.description":
    "Using artificial intelligence (AI), we convert the images into clear, baby-friendly versions – in black and white and in color.",
  "home.howItWorks.step3.label": "We do",
  "home.howItWorks.step3.title": "Print the book",
  "home.howItWorks.step3.description":
    "We print your personal book in high quality and ship it to your home – ready to use and cherish.",
  "home.howItWorks.cta": "Get Started Now",
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
  "home.special.item1.title": "Look at the closest ones",
  "home.special.item1.description":
    "The faces of the primary caregivers are familiar to the baby and soothe them from their first days",
  "home.special.item2.title": "Meet the family",
  "home.special.item2.description":
    "An opportunity to be exposed to and look at the family the baby is joining",
  "home.special.item3.title": "Sweet keepsake",
  "home.special.item3.description":
    "A book that is personal and serves as a keepsake for a short and wonderful period in the baby's life",
  "home.special.item4.title": "No more generic products",
  "home.special.item4.description":
    "Instead of looking at shapes and patterns, let your baby look at the family",
  "home.about.brand": "Little Gali",
  "home.about.title": "Who We Are",
  "home.about.titleHighlight": "We",
  "home.about.paragraph1":
    "I started working on this project after Gali was born. I found myself drawn to it – thinking about it, planning, designing the website, and every time someone uploaded photos for a book – it was the first thing I wanted to see.",
  "home.about.paragraph2":
    "I enjoyed the process itself, creating something new, and especially seeing the mothers' reactions when the books arrived. I felt I was doing something special, that had a place, and that I would want one for my Gali too (and don't worry – I've already made her several of her own books).",
  "home.about.paragraph3":
    "I hope that like me, there will be more mothers who find value in this book, who will want one for their baby. And in the end – it's also for us. To see our baby looking at the family photos with curiosity and getting excited every time.",
  "home.qa.title": "Ask Us",
  "home.qa.titleHighlight": "Us",
  "home.qa.subtitle":
    "Answers to the most common questions about our book and services",
  "home.qa.cta": "All Questions and Answers",
  "qa.question1": "What is the book made of?",
  "qa.answer1":
    "The book is made of high-quality, thick paper that has been laminated.",
  "qa.question2": "How many photos should I choose?",
  "qa.answer2":
    "Only 5 photos. The same photos appear on one side in black and white and on the other side in color.",
  "qa.question3": "Who should be in the book?",
  "qa.answer3":
    "Close people that your baby will recognize and connect with – parents, grandparents, siblings, a close friend, and even the family pet.",
  "qa.question4": "What kind of photo is suitable?",
  "qa.answer4":
    "A clear photo of the face, without sunglasses and preferably with a smile. Not too close to the face. Avoid blurry photos or photos with poor lighting.",
  "qa.question5": "Can I put multiple people in one photo?",
  "qa.answer5":
    "Yes, absolutely! You can upload a photo with two people as long as the photo is clear and well-lit. It's better to avoid photos with more than two people since image processing may be affected and also because a photo with too many details is not suitable for babies.",
  "qa.question6": "Does the background matter?",
  "qa.answer6":
    "No. The background is automatically removed and replaced with white.",
  "qa.question7": "How do I clean the book?",
  "qa.answer7":
    "You can gently wipe with a damp cloth. Avoid direct contact with water.",
  "qa.question8": "How long does it take to prepare the book?",
  "qa.answer8":
    "The preparation process takes 7-10 business days from the moment we receive the photos. We send updates on progress and notify you when the book is ready for pickup or shipping.",
  "qa.question9": "What if I'm not satisfied with the book?",
  "qa.answer9":
    "Our goal is for you to love and be satisfied with your book. If that's not the case, we allow you to return the book and receive a full refund.",
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
    "Select 5 photos that will appear in the book.\nNo need for a perfect photo, we'll make sure the faces, expressions, and human warmth in the photo come through.",
  "upload.imagesCount": "out of 5 photos",
  "upload.selectExactly5": "Please select exactly 5 photos",
  "upload.waitForUpload": "Please wait until photos finish uploading",
  "upload.serverError": "Server error. Please try again later.",
  "upload.addingToCart": "Adding to cart...",
  "upload.updating": "Updating...",
  "upload.addToCart": "Add to Cart",
  "upload.startOver": "Start Over",
  "upload.photoTip": "What kind of photo should I upload?",

  // Style Selector
  "styleSelector.title": "Choose Your Style:",
  "styleSelector.subtitle":
    "The style will affect the colorful side of the image",
  "styleSelector.cartoon": "Cartoon",
  "styleSelector.pencil": "Pencil",
  "styleSelector.cartoonAlt": "Cartoon - Cartoon style",
  "styleSelector.pencilAlt": "Pencil - Pencil style",
  "styleSelector.modal.title": "What's the difference?",
  "styleSelector.modal.subtitle":
    "Choose your preferred style for the colorful side:",
  "styleSelector.modal.cartoon.bold": "Bold & playful",
  "styleSelector.modal.cartoon.vibrant": "Vibrant colors",
  "styleSelector.modal.cartoon.modern": "Modern illustration style",
  "styleSelector.modal.cartoon.stylized": "Stylized features",
  "styleSelector.modal.pencil.soft": "Soft & artistic",
  "styleSelector.modal.pencil.delicate": "Delicate pastels",
  "styleSelector.modal.pencil.handDrawn": "Hand-drawn aesthetic",
  "styleSelector.modal.pencil.realistic": "Realistic details",
  "styleSelector.modal.gotIt": "Got it!",

  // Upload Modal
  "uploadModal.title": "How to Choose a Photo for the Book?",
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
};
