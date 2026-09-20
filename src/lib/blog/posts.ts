export type BlogLocale = "he" | "en";

export const SITE_ORIGIN = "https://www.littlegali.com";

export const BLOG_LISTING_SEO = {
  title: "הבלוג שלנו",
  description:
    "רעיונות למתנות לידה, וטיפים על ראיית תינוקות והתפתחות בחודשים הראשונים.",
} as const;

export type LocalizedText = {
  he: string;
  en: string;
};

export type BlogBlock =
  | { type: "paragraph"; text: string }
  | { type: "heading"; text: string }
  | { type: "subheading"; text: string }
  | {
      type: "image";
      src: string;
      alt: string;
      caption: string;
      width: number;
      height: number;
    };

export type BlogPostCopy = {
  title: string;
  excerpt: string;
  body: BlogBlock[];
};

export type BlogPost = {
  slug: string;
  publishedAt: string;
  image: {
    src: string;
    alt: LocalizedText;
  };
  tags: LocalizedText[];
  he: BlogPostCopy;
  en: BlogPostCopy;
};

function paragraph(text: string): BlogBlock {
  return { type: "paragraph", text };
}

function heading(text: string): BlogBlock {
  return { type: "heading", text };
}

function subheading(text: string): BlogBlock {
  return { type: "subheading", text };
}

function image(
  src: string,
  alt: string,
  caption: string,
  width: number,
  height: number
): BlogBlock {
  return { type: "image", src, alt, caption, width, height };
}

const posts: BlogPost[] = [
  {
    slug: "original-newborn-gift-ideas",
    publishedAt: "2026-10-20",
    image: {
      src: "/home-category-birth-packages.jpg",
      alt: {
        he: "מארז לידה של Little Gali",
        en: "A Little Gali birth gift set",
      },
    },
    tags: [
      { he: "מתנות לידה", en: "Newborn gifts" },
      { he: "הורות", en: "Parenting" },
    ],
    he: {
      title: "רעיונות למתנת לידה מקורית",
      excerpt:
        "יש משהו קצת מצחיק בחיפוש אחרי מתנת לידה. מצד אחד רוצים להביא משהו מיוחד, ומצד שני רוב ההורים לתינוק חדש באמת לא צריכים עוד עשרה דברים בבית.",
      body: [
        paragraph(
          "יש משהו קצת מצחיק בחיפוש אחרי מתנת לידה. מצד אחד רוצים להביא משהו מיוחד, ומצד שני רוב ההורים לתינוק חדש באמת לא צריכים עוד עשרה דברים בבית."
        ),
        paragraph(
          "אז במקום לחפש דווקא את הדבר הכי מקורי, אפשר לחשוב על מתנה שיש בה משהו קצת יותר אישי, שימושי, או פשוט כזה שממש כיף לקבל בתקופה הזאת."
        ),
        paragraph(
          "אספתי כאן כמה רעיונות שאני אוהבת במיוחד - חלקם דברים שקיבלתי בעצמי אחרי הלידה ושמחתי מהם מאוד."
        ),
        heading("אוכל. ואין דבר כזה יותר מדיי."),
        paragraph(
          "אותי הפחידו לפני הלידה להתכונן כי לא יהיה לי זמן לאכול יותר. זה לא היה המצב."
        ),
        paragraph(
          "אבל עדיין, אוכל שמגיע בלי שצריך לחשוב, לתכנן או להכין אותו הוא מתנה מעולה."
        ),
        paragraph(
          "אחת המחוות שאני זוכרת במיוחד מהתקופה אחרי הלידה הייתה דווקא ממש פשוטה: חברה באה אליי לצהריים ובדרך אספה טייק־אווי ממסעדה שאני אוהבת. ישבנו יחד, אכלנו אוכל טעים, דיברנו ואני לא הייתי צריכה לדאוג לכלום."
        ),
        paragraph(
          "אפשר לשלוח ארוחת בוקר, להגיע עם ארוחת צהריים טובה, למלא קצת את המקרר או להביא משהו שהכנתם בעצמכם. ואם אתם מכירים את היולדת מספיק טוב כדי לדעת בדיוק מה היא אוהבת לאכול - אפילו יותר טוב."
        ),
        heading("משהו שהוא רק בשביל האמא"),
        paragraph(
          "אחרי לידה מגיעים המון דברים לתינוק, ולכן לפעמים דווקא הכי כיף ומרגש לקבל משהו שמיועד לאמא."
        ),
        paragraph(
          "חלוק מפנק, נעלי בית טובות, כוס שתייה רב־פעמית שאפשר להסתובב איתה בבית כל היום, מוצר טיפוח שהיא אוהבת או כל דבר קטן ונעים שמרגיש כאילו חשבו גם עליה."
        ),
        paragraph(
          'לא חייבים לחפש משהו "ליולדת". לפעמים עדיף פשוט לחשוב מה החברה שלכם הייתה שמחה לקבל גם בלי קשר לזה שילדה.'
        ),
        heading("ספרון עם הפנים של המשפחה"),
        paragraph(
          "זה כמובן רעיון שאני קצת משוחדת לגביו, כי בדיוק מכאן נולד Little Gali."
        ),
        paragraph(
          "הרעיון הוא לקחת תמונות של האנשים שנמצאים בחיים של התינוק - הורים, אחים, סבא וסבתא, דודים ואפילו הכלב - ולהפוך אותן לספרון קטן שאפשר לפתוח ולהסתכל עליו יחד."
        ),
        paragraph(
          "אני אוהבת אותו כמתנת לידה בעיקר בגלל שהוא מאוד אישי, בלי שצריך לדעת איזו מידה התינוק לובש, איזה ציוד כבר יש בבית או מה ההורים כבר הספיקו לקנות."
        ),
        image(
          "/blog-family-fabric-book.png",
          "ספרון לתינוק עם איורים של המשפחה",
          "ספרון לתינוק של Little Gali",
          682,
          1024
        ),
        heading("משהו שיהיה כיף לעשות יחד בהמשך"),
        paragraph(
          "לא כל מתנת לידה חייבת להגיע בתוך קופסה, ולא חייבים להשתמש בה מיד."
        ),
        paragraph(
          "אפשר לתת מנוי לאימונים שאפשר להגיע אליהם עם התינוק, כרטיסייה לשחיית תינוקות או פעילות אחרת שמתאימה להורה ולתינוק יחד."
        ),
        paragraph(
          "זו יכולה להיות מתנה ממש כיפית דווקא לחודשים שאחרי התקופה הראשונית בבית - כשמתחילים לצאת קצת יותר, לחפש פעילויות ולבנות שגרה חדשה יחד."
        ),
        heading("משהו שהם רצו לקנות ולא קנו לעצמם"),
        paragraph("אם אתם קרובים מספיק, לפעמים שווה פשוט לברר."),
        paragraph(
          'אולי יש מנשא שווה שהם רוצים, צעצוע שראו, תיק לעגלה או משהו אחר שנשאר ברשימת ה"נקנה מתישהו".'
        ),
        paragraph(
          "זו אולי לא המתנה הכי מפתיעה בעולם, אבל יש משהו מאוד כיף בלקבל דווקא את הדבר שרצית ולא הצלחת להצדיק לעצמך לקנות."
        ),
        heading("מתנה עם משמעות לתינוק"),
        paragraph(
          'לא כל מתנה לתינוק חייבת להיות משהו ש"צריך". לפעמים דווקא כיף לבחור משהו קטן ואישי, שיש מאחוריו מחשבה ושאפשר לשמור לאורך זמן.'
        ),
        paragraph(
          "זה יכול להיות ספר ילדים עם מסר שאתם אוהבים במיוחד, בובה סרוגה בעבודת יד, שמיכי מיוחד או משהו אחר שבחרתם כי הוא הזכיר לכם את התינוק, את המשפחה שלו, בדיחה פרטית או משהו שאתם מאחלים לו."
        ),
        paragraph(
          "אני אוהבת במיוחד מתנות כאלה כשיש סיבה מאחורי הבחירה. אפילו פתק קטן שמספר למה בחרתם דווקא את הספר או את הבובה יכול להפוך מתנה יחסית פשוטה למשהו שההורים ירצו לשמור."
        ),
        heading("ואם באמת אין לכם מושג – גיפט קארד הוא לגמרי אופציה"),
        paragraph(
          "בעיני גיפט קארד כללי הוא פחות מרגש, אבל יאמר לזכותו שהוא מאוד פרקטי ובטוח יהיה בו שימוש."
        ),
        paragraph(
          "אם אתם יודעים שיש חנות שהיא אוהבת, מקום שהיא מזמינה ממנו הרבה או משהו שהיא בטוח תשתמש בו - האפשרות לבחור בעצמה יכולה להיות הרבה יותר מוצלחת ומוערכת מעוד משהו שנבחר בשבילה."
        ),
        heading("בסוף, המחשבה היא מה שהופך את המתנה לאישית"),
        paragraph(
          "כשאני חושבת על הדברים שהכי שמחתי לקבל בעצמי אחרי שגלי נולדה, אלה לא בהכרח היו המתנות הכי יקרות או מרשימות."
        ),
        paragraph(
          "חברה אחת שלחה לי הביתה משלוח מהדליקטסן עם דברים שהיא ידעה שאני אוהבת. מישהי שאני מאוד מעריכה בחרה לגלי ספר עם מסר שאני מתחברת אליו, ואני עדיין מחכה לרגע שבו אוכל להקריא לה אותו."
        ),
        paragraph(
          "ואולי זה בעצם מה שהופך מתנת לידה למוצלחת בעיניי - לא כמה היא עלתה או כמה היא מקורית, אלא התחושה שמישהו שמכיר אתכם בחר משהו במיוחד בשבילכם."
        ),
      ],
    },
    en: {
      title: "Original newborn gift ideas",
      excerpt:
        "There's something a little funny about looking for a newborn gift. On the one hand you want to bring something special, and on the other, most new parents really don't need ten more things in the house.",
      body: [
        paragraph(
          "There's something a little funny about looking for a newborn gift. On the one hand you want to bring something special, and on the other, most new parents really don't need ten more things in the house."
        ),
        paragraph(
          "So instead of hunting for the most original thing, it can help to think of a gift that's a little more personal, useful, or simply something that's a real pleasure to receive in this season."
        ),
        paragraph(
          "I gathered a few ideas I especially love — some of them things I received myself after giving birth, and was genuinely happy about."
        ),
        heading("Food. And there is no such thing as too much."),
        paragraph(
          "Before I gave birth, people warned me to prepare because I wouldn't have time to eat anymore. That wasn't how it went."
        ),
        paragraph(
          "Still, food that arrives without anyone having to think, plan, or cook is an excellent gift."
        ),
        paragraph(
          "One of the gestures I remember most from the weeks after birth was actually very simple: a friend came over for lunch and picked up takeout from a restaurant I love on the way. We sat together, ate something good, talked, and I didn't have to worry about a thing."
        ),
        paragraph(
          "You can send breakfast, show up with a good lunch, fill the fridge a little, or bring something you made yourself. And if you know the new mom well enough to know exactly what she likes to eat — even better."
        ),
        heading("Something that's just for the mom"),
        paragraph(
          "After a birth, a lot of things arrive for the baby, which is why it can feel especially nice — and moving — to get something meant for the mother."
        ),
        paragraph(
          "A cozy robe, good slippers, a reusable cup she can walk around the house with all day, a skincare product she loves, or any small, pleasant thing that feels like someone thought of her too."
        ),
        paragraph(
          'You don\'t have to look for something "for a new mom." Sometimes it\'s better to simply think what your friend would have been happy to receive even if she hadn\'t just given birth.'
        ),
        heading("A fabric book with the family's faces"),
        paragraph(
          "This is, of course, an idea I'm a little biased about, because this is exactly where Little Gali came from."
        ),
        paragraph(
          "The idea is to take photos of the people in the baby's life — parents, siblings, grandparents, aunts and uncles, even the dog — and turn them into a small book you can open and look at together."
        ),
        paragraph(
          "I love it as a newborn gift mainly because it's so personal, without needing to know what size the baby wears, what gear is already in the house, or what the parents have already managed to buy."
        ),
        image(
          "/blog-family-fabric-book.png",
          "A baby fabric book with family illustrations",
          "A Little Gali baby fabric book",
          682,
          1024
        ),
        heading("Something fun to do together later"),
        paragraph(
          "Not every newborn gift has to arrive in a box, and you don't have to use it right away."
        ),
        paragraph(
          "You could give a class pass for workouts she can come to with the baby, a punch card for baby swimming, or another activity that works for parent and baby together."
        ),
        paragraph(
          "That can be a really lovely gift for the months after the first stretch at home — when you start going out a little more, looking for activities, and building a new routine together."
        ),
        heading("Something they wanted and didn't buy for themselves"),
        paragraph(
          "If you're close enough, sometimes it's worth simply asking."
        ),
        paragraph(
          'Maybe there\'s a carrier they want, a toy they saw, a stroller bag, or something else still sitting on the "we\'ll buy it someday" list.'
        ),
        paragraph(
          "It might not be the most surprising gift in the world, but there's something really nice about receiving the exact thing you wanted and couldn't quite justify buying for yourself."
        ),
        heading("A gift with meaning for the baby"),
        paragraph(
          'Not every baby gift has to be something they "need." Sometimes it\'s more fun to choose something small and personal, with thought behind it, that can be kept for a long time.'
        ),
        paragraph(
          "It could be a children's book with a message you especially love, a handmade crocheted doll, a special lovey, or something else you chose because it reminded you of the baby, their family, a private joke, or something you wish for them."
        ),
        paragraph(
          "I especially love gifts like these when there's a reason behind the choice. Even a small note explaining why you picked that book or that doll can turn a fairly simple gift into something the parents will want to keep."
        ),
        heading("And if you really have no idea — a gift card is a real option"),
        paragraph(
          "To me, a generic gift card is less moving, but to its credit, it's very practical, and it will definitely get used."
        ),
        paragraph(
          "If you know there's a shop she loves, a place she orders from a lot, or something she'll definitely use — being able to choose for herself can be much more successful, and more appreciated, than yet another thing chosen for her."
        ),
        heading("In the end, the thought is what makes the gift personal"),
        paragraph(
          "When I think about the things I was happiest to receive myself after Gali was born, they weren't necessarily the most expensive or impressive gifts."
        ),
        paragraph(
          "One friend sent a delivery from the deli with things she knew I loved. Someone I really admire chose a book for Gali with a message I connect to, and I'm still waiting for the moment I can read it to her."
        ),
        paragraph(
          "And maybe that's what makes a newborn gift work, in my view — not how much it cost or how original it is, but the feeling that someone who knows you chose something especially for you."
        ),
      ],
    },
  },
  {
    slug: "how-to-choose-photos-for-a-baby-book",
    publishedAt: "2026-10-16",
    image: {
      src: "/how-it-works-step-1.jpg",
      alt: {
        he: "בחירת תמונות לספרון אישי לתינוק",
        en: "Choosing photos for a personal baby book",
      },
    },
    tags: [
      { he: "ספרון", en: "Fabric book" },
      { he: "תמונות", en: "Photos" },
    ],
    he: {
      title: "איך לבחור תמונות לספרון לתינוק של Little Gali?",
      excerpt:
        "אחד החלקים הכי כיפיים בהכנת ספרון אישי לתינוק הוא לבחור מי יופיע בו. מצד שני, ברגע שפותחים את הגלריה ומתחילים לעבור על מאות (או אלפי) תמונות, פתאום הבחירה יכולה להיות קצת פחות פשוטה.",
      body: [
        paragraph(
          "אחד החלקים הכי כיפיים בהכנת ספרון אישי לתינוק הוא לבחור מי יופיע בו. מצד שני, ברגע שפותחים את הגלריה ומתחילים לעבור על מאות (או אלפי) תמונות, פתאום הבחירה יכולה להיות קצת פחות פשוטה."
        ),
        paragraph(
          "אז מאיפה מתחילים? קודם מחליטים **מי נכנס לספרון**, ורק אחר כך מחפשים את התמונה הכי טובה של כל אחד."
        ),
        heading("קודם כל - מי יופיע בספרון?"),
        paragraph(
          "ב-Little Gali אפשר לבחור בין ספרון קלאסי לספרון צבעוני, וזה הדבר הראשון שכדאי להחליט עליו."
        ),
        paragraph(
          "בספרון הקלאסי יש מקום ל-5 תמונות. באופן טבעי, ברוב המקרים אלה יהיו האנשים מהמעגל הכי קרוב של התינוק - אמא, אבא, אחים, התינוק עצמו, ואצלנו לפחות ברור שגם הכלב המשפחתי נחשב בן משפחה."
        ),
        paragraph(
          "אפשר כמובן להכניס גם תמונה של סבא וסבתא, אבל כשיש רק חמש תמונות כנראה שלא יהיה מקום לכל הדודים, האחיינים והמשפחה משני הצדדים."
        ),
        paragraph(
          "בספרון הצבעוני יש מקום ל-9 תמונות, וכאן כבר אפשר לפתוח קצת את המעגל - להוסיף סבים וסבתות, דודים, בני דודים או אנשים אחרים שחשובים לכם ושתרצו שיהיו חלק מהספרון."
        ),
        paragraph(
          "אין כמובן רשימה נכונה. תחשבו פשוט על האנשים והפרצופים שאתם רוצים שהתינוק יראה כשהוא פותח את הספרון."
        ),
        paragraph(
          "**טיפ קטן לשלום בית:** אם החלטתם להכניס את סבא וסבתא מצד אחד, ואם יש מקום - שווה לזכור גם את הצד השני :)"
        ),
        subheading("הסתבכתם עם מי להכניס? לכו על פשוט"),
        paragraph("לא חייבים להכניס את כל המשפחה לספרון."),
        paragraph(
          "אפשר לבחור את ההורים והתינוק, ולמלא את הספרון בתמונות שונות שלהם - כל הורה בנפרד, ההורים יחד, עם התינוק או בלי התינוק."
        ),
        paragraph(
          "זה מספיק, זה יוצא מהמם, ולמעשה אלה גם רוב הספרונים שאנחנו מכינים. יש סיבה שהבחירה הפשוטה הזאת עובדת כל כך טוב."
        ),
        heading("בחרנו מי. עכשיו צריך לבחור תמונות"),
        paragraph("יש שני כללים שהכי כדאי לזכור כשמחפשים תמונות לספרון:"),
        paragraph("**1. חיוך**"),
        paragraph("**2. פנים גדולות וברורות**"),
        paragraph(
          "זה באמת הבסיס. אנחנו רוצים תמונה נעימה ושמחה, ובעיקר כזאת שאפשר לראות בה היטב את תווי הפנים."
        ),
        paragraph(
          "חפשו תמונה בתאורה טובה, שבה הפנים ברורות והעיניים גלויות. אם יש לכם אפשרות לבחור בין תמונה עם משקפי שמש לתמונה בלי - בדרך כלל נעדיף את זו שבלי."
        ),
        paragraph(
          "ועדיף לבחור תמונה יחסית קרובה. ככל שהפנים תופסות חלק גדול יותר מהתמונה ואפשר לראות יותר פרטים, העיבוד עובד טוב יותר וגם התוצאה בספרון יפה וברורה יותר."
        ),
        paragraph(
          "התמונה המקורית לא חייבת להיות מצולמת כקלוז-אפ. באתר אפשר לחתוך ולעשות זום בזמן העלאת התמונה, כך שאפשר לקחת תמונה שאתם אוהבים ולהתמקד רק בפנים."
        ),
        image(
          "/blog-smiling-parents-baby.png",
          "הורים מחייכים עם התינוק שלהם",
          "הפנים נראות בבירור. וחיוך.",
          1024,
          1024
        ),
        heading("ומה לגבי הרקע?"),
        paragraph("דווקא ממנו אפשר להתעלם."),
        paragraph(
          "הרקע מוסר כחלק מהעיבוד, אז אם מצאתם תמונה שבה החיוך והפנים בדיוק כמו שרציתם אבל מאחור יש מטבח מבולגן, אנשים שעוברים או סל כביסה שחיכה בדיוק לרגע הזה כדי להיכנס לפריים - זה ממש לא משנה."
        ),
        paragraph(
          "בחרו את התמונה לפי מי שמופיע בה, לא לפי מה שנמצא מאחוריו."
        ),
        heading("כמה אנשים יכולים להיות בתמונה?"),
        paragraph(
          "תמונות של אדם אחד, שניים ואפילו שלושה יכולות לעבוד מצוין."
        ),
        paragraph(
          "כשמכניסים יותר אנשים, בדרך כלל כל אחד מהם תופס חלק קטן יותר מהתמונה והתוצאה מתחילה להיות עמוסה. בנוסף, בתמונות של קבוצות גדולות בדרך כלל קשה יותר לראות היטב את תווי הפנים של כולם."
        ),
        paragraph(
          "אז אין חוק שאומר שאסור להכניס ארבעה או חמישה אנשים לתמונה, אבל כדאי לשאול את עצמכם דבר אחד: **האם רואים בבירור את הפנים והפרטים של כל מי שמופיע בה?**"
        ),
        paragraph("אם כן - שווה לנסות."),
        heading("אל תשכחו את בעלי החיים"),
        paragraph(
          "אם יש כלב או חתול שהם חלק מהמשפחה - מבחינתנו יש להם לגמרי מקום בספרון."
        ),
        paragraph(
          "בעלי חיים תמיד מקפיצים את הספרון והופכים אותו לעוד יותר אישי. ואם יש בבית תינוק וכלב שהוא חלק בלתי נפרד מהמשפחה, קשה לנו לחשוב על סיבה להשאיר אותו בחוץ."
        ),
        image(
          "/blog-dogs-black-white.png",
          "שני כלבים באיור שחור-לבן",
          "כלבים משדרגים כל ספרון",
          767,
          1024
        ),
        heading("יש מישהו שחשוב לכם שהתינוק יראה יותר?"),
        paragraph(
          "לא כל מי שמופיע בספרון חייב להיות מישהו שהתינוק פוגש כל יום."
        ),
        paragraph(
          "אולי סבא וסבתא גרים רחוק, דוד נמצא בחו\"ל או שיש בן משפחה אחר שחשוב לכם שיהיה מוכר ונוכח גם אם לא נפגשים איתו בתדירות גבוהה."
        ),
        paragraph(
          "אם יש מישהו שאתם רוצים שהתינוק יראה וייזכר בו שוב ושוב - זו יכולה להיות סיבה מצוינת לתת לו מקום בספרון."
        ),
        heading("אוהדים שרופים של קבוצת ספורט?"),
        paragraph(
          "אם יש בבית קבוצה שהיא כבר כמעט חלק מהמשפחה, אפשר להקדיש לה אחת מהתמונות ולהכניס את הלוגו שלה לספרון."
        ),
        paragraph(
          "אוהדי מכבי, הפועל, ברצלונה, ליברפול או כל קבוצה אחרת שהילד כנראה יכיר הרבה לפני שהוא בכלל יבין מה זה נבדל - זאת דרך קטנה וכיפית להפוך את הספרון לעוד יותר שלכם."
        ),
        heading("טיפ אחרון: תמונות שתופסות רגע"),
        paragraph(
          "קצת אמורפי אבל תהיו איתי רגע, יש משהו בתמונה שתופסת רגע שפשוט מעלה חיוך."
        ),
        paragraph(
          "קשה להגדיר במילים מה עושה תמונה לכזאת אבל כשרואים אחת - יודעים."
        ),
        paragraph(
          "תמונות כאלה יוסיפו עוד אופי וקסם לספרון שלכם."
        ),
        image(
          "/why-us-2.png",
          "סבא מחזיק את נכדו בכיסא יום ההולדת",
          "תמונה שתופסת רגע מתוק",
          896,
          1152
        ),
        heading("ולא בטוחים איך התמונות שבחרתם יעבדו?"),
        paragraph("בדיוק בשביל זה יש את הפריוויו באתר."),
        paragraph(
          "אפשר להעלות את התמונות, לחתוך ולעשות זום, ולראות איך כל אחת מהן נראית אחרי העיבוד עוד לפני שמזמינים."
        ),
        paragraph(
          "אז אם אתם מתלבטים בין שתי תמונות, לא בטוחים אם תמונה מסוימת קרובה מספיק או פשוט רוצים לראות אם הבחירה עובדת - לא צריך לנחש. אפשר לנסות ולראות בעצמכם, ולהחליף עד שאתם מרוצים מהספרון שיצרתם."
        ),
      ],
    },
    en: {
      title: "How to choose photos for a Little Gali baby fabric book?",
      excerpt:
        "One of the most fun parts of making a personal baby book is choosing who appears in it. On the other hand, the moment you open the gallery and start going through hundreds (or thousands) of photos, the choice can suddenly feel a little less simple.",
      body: [
        paragraph(
          "One of the most fun parts of making a personal baby book is choosing who appears in it. On the other hand, the moment you open the gallery and start going through hundreds (or thousands) of photos, the choice can suddenly feel a little less simple."
        ),
        paragraph(
          "So where do you start? First decide **who goes in the book**, and only then look for the best photo of each person."
        ),
        heading("First of all — who appears in the book?"),
        paragraph(
          "At Little Gali you can choose between a classic book and a colorful book, and that's the first thing worth deciding."
        ),
        paragraph(
          "The classic book has room for 5 photos. Naturally, in most cases those will be the people in the baby's closest circle — mom, dad, siblings, the baby, and at our house it's obvious the family dog counts as family too."
        ),
        paragraph(
          "You can of course include a photo of grandparents, but with only five photos there probably won't be room for all the aunts, uncles, cousins, and both sides of the family."
        ),
        paragraph(
          "The colorful book has room for 9 photos, and here you can open the circle a little — add grandparents, aunts and uncles, cousins, or other people who matter to you and who you want in the book."
        ),
        paragraph(
          "There's no correct list, of course. Just think about the people and faces you want the baby to see when they open the book."
        ),
        paragraph(
          "**A small tip for household peace:** if you decided to include grandparents from one side, and if there's room — it's worth remembering the other side too :)"
        ),
        subheading("Stuck on who to include? Keep it simple"),
        paragraph("You don't have to put the whole family in the book."),
        paragraph(
          "You can choose the parents and the baby, and fill the book with different photos of them — each parent on their own, the parents together, with the baby or without."
        ),
        paragraph(
          "That's enough, it comes out gorgeous, and in fact those are most of the books we make. There's a reason this simple choice works so well."
        ),
        heading("We've chosen who. Now we need to choose photos"),
        paragraph(
          "There are two rules most worth remembering when looking for photos for the book:"
        ),
        paragraph("**1. A smile**"),
        paragraph("**2. Faces that are large and clear**"),
        paragraph(
          "That's really the foundation. We want a pleasant, happy photo, and especially one where you can clearly see facial features."
        ),
        paragraph(
          "Look for a photo in good light, where the face is clear and the eyes are visible. If you can choose between a photo with sunglasses and one without — we usually prefer the one without."
        ),
        paragraph(
          "And it's better to choose a relatively close photo. The more of the photo the face takes up, and the more detail you can see, the better the processing works — and the result in the book is prettier and clearer too."
        ),
        paragraph(
          "The original photo doesn't have to be shot as a close-up. On the site you can crop and zoom while uploading, so you can take a photo you love and focus only on the face."
        ),
        image(
          "/blog-smiling-parents-baby.png",
          "smiling parents with their baby",
          "The faces are clearly visible. And a smile.",
          1024,
          1024
        ),
        heading("And what about the background?"),
        paragraph("You can actually ignore it."),
        paragraph(
          "The background is removed as part of the processing, so if you found a photo where the smile and face are exactly what you wanted, but behind them there's a messy kitchen, people walking by, or a laundry basket that waited for that exact moment to enter the frame — it really doesn't matter."
        ),
        paragraph(
          "Choose the photo by who appears in it, not by what's behind them."
        ),
        heading("How many people can be in a photo?"),
        paragraph(
          "Photos of one person, two, or even three can work great."
        ),
        paragraph(
          "When you include more people, each of them usually takes up a smaller part of the photo and the result starts to feel crowded. Also, in large group photos it's usually harder to see everyone's facial features clearly."
        ),
        paragraph(
          "So there's no rule that you can't put four or five people in a photo, but it's worth asking yourselves one thing: **can you clearly see the faces and details of everyone in it?**"
        ),
        paragraph("If yes — it's worth trying."),
        heading("Don't forget the pets"),
        paragraph(
          "If there's a dog or cat who's part of the family — as far as we're concerned, they absolutely belong in the book."
        ),
        paragraph(
          "Pets always lift the book and make it even more personal. And if there's a baby at home and a dog who's an inseparable part of the family, it's hard for us to think of a reason to leave them out."
        ),
        image(
          "/blog-dogs-black-white.png",
          "two dogs in black and white illustration",
          "Dogs upgrade every book",
          767,
          1024
        ),
        heading("Is there someone you especially want the baby to see?"),
        paragraph(
          "Not everyone who appears in the book has to be someone the baby sees every day."
        ),
        paragraph(
          "Maybe grandparents live far away, an uncle is abroad, or there's another family member you want to be familiar and present even if you don't see them often."
        ),
        paragraph(
          "If there's someone you want the baby to see and remember again and again — that can be an excellent reason to give them a place in the book."
        ),
        heading("Hardcore sports fans?"),
        paragraph(
          "If there's a team at home that's already almost part of the family, you can dedicate one of the photos to it and put its logo in the book."
        ),
        paragraph(
          "Fans of Maccabi, Hapoel, Barcelona, Liverpool, or any other team the child will probably know long before they even understand what offside is — that's a small, fun way to make the book even more yours."
        ),
        heading("One last tip: photos that capture a moment"),
        paragraph(
          "It's a little amorphous, but stay with me for a second — there's something about a photo that captures a moment that simply brings on a smile."
        ),
        paragraph(
          "It's hard to put into words what makes a photo like that, but when you see one — you know."
        ),
        paragraph(
          "Photos like these will add even more character and charm to your book."
        ),
        image(
          "/why-us-2.png",
          "grandparent holding his grandchild on his birthday chair",
          "A photo that captures a sweet moment",
          896,
          1152
        ),
        heading("Not sure how the photos you chose will work?"),
        paragraph("That's exactly what the preview on the site is for."),
        paragraph(
          "You can upload the photos, crop and zoom, and see how each one looks after processing before you order."
        ),
        paragraph(
          "So if you're deciding between two photos, not sure if a certain photo is close enough, or just want to see if the choice works — you don't have to guess. You can try it, see for yourself, and swap until you're happy with the book you made."
        ),
      ],
    },
  },
];

export function getAllPosts(): BlogPost[] {
  return [...posts].sort((a, b) =>
    a.publishedAt < b.publishedAt ? 1 : a.publishedAt > b.publishedAt ? -1 : 0
  );
}

export function getPostBySlug(slug: string): BlogPost | undefined {
  return posts.find((post) => post.slug === slug);
}

export function getPostCopy(post: BlogPost, locale: BlogLocale): BlogPostCopy {
  return locale === "en" ? post.en : post.he;
}

export function formatBlogDate(isoDate: string, locale: BlogLocale): string {
  const date = new Date(`${isoDate}T12:00:00`);
  return date.toLocaleDateString(locale === "he" ? "he-IL" : "en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function absoluteUrl(path: string): string {
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_ORIGIN}${normalized}`;
}
