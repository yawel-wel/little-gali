"use client";

import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Title } from "@/components/title";
import { useLanguage } from "@/lib/LanguageContext";

export default function PrivacyPage() {
  const { t, locale } = useLanguage();

  const isHebrew = locale === "he";

  return (
    <div className="overflow-x-hidden bg-warm-light">
      <Header />
      <main
        className="flex-1"
        style={{ paddingTop: "calc(72px + var(--banner-height, 0px))" }}
      >
        <section className="relative pb-16 lg:pb-24 pt-8">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              {/* Title */}
              <div className="mb-8 text-center">
                <Title
                  as="h1"
                  highlightText={isHebrew ? "פרטיות" : "Privacy"}
                  size="lg"
                >
                  {isHebrew ? "מדיניות פרטיות" : "Privacy Policy"}
                </Title>
              </div>

              {/* Content */}
              <div className="space-y-6 font-body text-medium-gray leading-relaxed">
                {isHebrew ? (
                  <>
                    <section>
                      <h2 className="text-xl font-heading font-bold text-dark-gray mb-3">
                        מבוא
                      </h2>
                      <p>
                        ב-Little Gali, אנחנו מחויבים להגנה על הפרטיות שלך. מסמך זה
                        מסביר כיצד אנו אוספים, משתמשים ומגנים על המידע האישי שלך.
                      </p>
                    </section>

                    <section>
                      <h2 className="text-xl font-heading font-bold text-dark-gray mb-3">
                        איזה מידע אנחנו אוספים?
                      </h2>
                      <ul className="list-disc list-inside space-y-2 mr-4">
                        <li>
                          <strong>מידע אישי:</strong> שם, כתובת אימייל, כתובת משלוח
                          ומספר טלפון שאתה מספק בעת ביצוע הזמנה.
                        </li>
                        <li>
                          <strong>תמונות:</strong> התמונות שאתה מעלה ליצירת הספרון
                          האישי שלך.
                        </li>
                        <li>
                          <strong>נתוני שימוש:</strong> מידע על האופן שבו אתה
                          משתמש באתר שלנו, הנאסף באמצעות Google Analytics ו-Meta
                          Pixel.
                        </li>
                        <li>
                          <strong>עוגיות:</strong> קבצים קטנים המאוחסנים במכשיר
                          שלך כדי לשפר את חווית המשתמש שלך.
                        </li>
                      </ul>
                    </section>

                    <section>
                      <h2 className="text-xl font-heading font-bold text-dark-gray mb-3">
                        איך אנחנו משתמשים במידע שלך?
                      </h2>
                      <ul className="list-disc list-inside space-y-2 mr-4">
                        <li>לעבד ולספק את ההזמנות שלך</li>
                        <li>לשפר את האתר ואת חווית המשתמש</li>
                        <li>לשלוח עדכונים על ההזמנות שלך</li>
                        <li>
                          לשלוח חומר שיווקי (רק אם נתת הסכמה)
                        </li>
                        <li>לנתח דפוסי שימוש כדי לשפר את השירותים שלנו</li>
                      </ul>
                    </section>

                    <section>
                      <h2 className="text-xl font-heading font-bold text-dark-gray mb-3">
                        כלי מעקב וניתוח
                      </h2>
                      <p className="mb-2">
                        אנו משתמשים בכלים הבאים כדי להבין טוב יותר איך
                        משתמשים באתר שלנו:
                      </p>
                      <ul className="list-disc list-inside space-y-2 mr-4">
                        <li>
                          <strong>Google Analytics:</strong> מעקב אחר תנועה באתר,
                          פעולות משתמשים ודפוסי שימוש.
                        </li>
                        <li>
                          <strong>Meta Pixel (Facebook Pixel):</strong> מעקב
                          אחר המרות, אופטימיזציה של מודעות ובניית קהלי יעד
                          לפרסום.
                        </li>
                      </ul>
                      <p className="mt-3">
                        אתה יכול לבחור לא לאפשר כלים אלו על ידי דחיית הודעת
                        העוגיות או על ידי שינוי הגדרות הדפדפן שלך.
                      </p>
                    </section>

                    <section>
                      <h2 className="text-xl font-heading font-bold text-dark-gray mb-3">
                        שיתוף מידע
                      </h2>
                      <p>
                        אנו לא מוכרים או משכירים את המידע האישי שלך לצדדים
                        שלישיים. אנו עשויים לשתף מידע עם:
                      </p>
                      <ul className="list-disc list-inside space-y-2 mr-4 mt-2">
                        <li>ספקי שירות המסייעים לנו בהפעלת האתר והעסק</li>
                        <li>שירותי משלוח לצורך הגשת ההזמנות שלך</li>
                        <li>רשויות משפטיות כאשר נדרש על פי חוק</li>
                      </ul>
                    </section>

                    <section>
                      <h2 className="text-xl font-heading font-bold text-dark-gray mb-3">
                        אבטחת המידע שלך
                      </h2>
                      <p>
                        אנו משתמשים באמצעי אבטחה טכניים וארגוניים להגנה על
                        המידע האישי שלך מפני גישה לא מורשית, אובדן או שימוש
                        לרעה. עם זאת, שום שיטת העברה דרך האינטרנט או אחסון
                        אלקטרוני אינה בטוחה ב-100%.
                      </p>
                    </section>

                    <section>
                      <h2 className="text-xl font-heading font-bold text-dark-gray mb-3">
                        הזכויות שלך
                      </h2>
                      <p>יש לך את הזכות:</p>
                      <ul className="list-disc list-inside space-y-2 mr-4 mt-2">
                        <li>לגשת למידע האישי שלך</li>
                        <li>לתקן מידע לא מדויק</li>
                        <li>לבקש מחיקת המידע שלך</li>
                        <li>להתנגד לעיבוד המידע שלך</li>
                        <li>למשוך הסכמה בכל עת</li>
                      </ul>
                      <p className="mt-3">
                        כדי לממש את הזכויות האלה, אנא צור איתנו קשר בכתובת{" "}
                        <a
                          href="mailto:yaelromashkano@gmail.com"
                          className="text-primary-orange hover:underline"
                        >
                          yaelromashkano@gmail.com
                        </a>
                      </p>
                    </section>

                    <section>
                      <h2 className="text-xl font-heading font-bold text-dark-gray mb-3">
                        שינויים במדיניות זו
                      </h2>
                      <p>
                        אנו עשויים לעדכן את מדיניות הפרטיות הזו מעת לעת. נודיע
                        לך על שינויים מהותיים על ידי פרסום המדיניות החדשה באתר
                        שלנו.
                      </p>
                    </section>

                    <section>
                      <h2 className="text-xl font-heading font-bold text-dark-gray mb-3">
                        צור קשר
                      </h2>
                      <p>
                        אם יש לך שאלות לגבי מדיניות הפרטיות שלנו, אנא צור איתנו
                        קשר:
                      </p>
                      <p className="mt-2">
                        <strong>אימייל:</strong>{" "}
                        <a
                          href="mailto:yaelromashkano@gmail.com"
                          className="text-primary-orange hover:underline"
                        >
                          yaelromashkano@gmail.com
                        </a>
                      </p>
                      <p className="mt-1">
                        <strong>עודכן לאחרונה:</strong> פברואר 2026
                      </p>
                    </section>
                  </>
                ) : (
                  <>
                    <section>
                      <h2 className="text-xl font-heading font-bold text-dark-gray mb-3">
                        Introduction
                      </h2>
                      <p>
                        At Little Gali, we are committed to protecting your
                        privacy. This document explains how we collect, use, and
                        protect your personal information.
                      </p>
                    </section>

                    <section>
                      <h2 className="text-xl font-heading font-bold text-dark-gray mb-3">
                        What Information Do We Collect?
                  </h2>
                      <ul className="list-disc list-inside space-y-2 ml-4">
                        <li>
                          <strong>Personal Information:</strong> Name, email
                          address, shipping address, and phone number you provide
                          when placing an order.
                        </li>
                        <li>
                          <strong>Photos:</strong> The images you upload to
                          create your personalized book.
                        </li>
                        <li>
                          <strong>Usage Data:</strong> Information about how you
                          use our website, collected through Google Analytics and
                          Meta Pixel.
                        </li>
                        <li>
                          <strong>Cookies:</strong> Small files stored on your
                          device to enhance your user experience.
                        </li>
                  </ul>
                    </section>

                    <section>
                      <h2 className="text-xl font-heading font-bold text-dark-gray mb-3">
                        How Do We Use Your Information?
                  </h2>
                      <ul className="list-disc list-inside space-y-2 ml-4">
                        <li>To process and fulfill your orders</li>
                        <li>To improve our website and user experience</li>
                        <li>To send updates about your orders</li>
                        <li>
                          To send marketing communications (only if you've
                          consented)
                        </li>
                        <li>To analyze usage patterns to improve our services</li>
                      </ul>
                    </section>

                    <section>
                      <h2 className="text-xl font-heading font-bold text-dark-gray mb-3">
                        Tracking and Analytics Tools
                  </h2>
                      <p className="mb-2">
                        We use the following tools to better understand how our
                        website is used:
                      </p>
                      <ul className="list-disc list-inside space-y-2 ml-4">
                        <li>
                          <strong>Google Analytics:</strong> Tracks website
                          traffic, user actions, and usage patterns.
                        </li>
                        <li>
                          <strong>Meta Pixel (Facebook Pixel):</strong> Tracks
                          conversions, optimizes ads, and builds audiences for
                          advertising.
                        </li>
                      </ul>
                      <p className="mt-3">
                        You can opt out of these tools by declining the cookie
                        notice or changing your browser settings.
                      </p>
                    </section>

                    <section>
                      <h2 className="text-xl font-heading font-bold text-dark-gray mb-3">
                        Information Sharing
                  </h2>
                      <p>
                        We do not sell or rent your personal information to
                        third parties. We may share information with:
                      </p>
                      <ul className="list-disc list-inside space-y-2 ml-4 mt-2">
                        <li>
                          Service providers who help us operate our website and
                          business
                        </li>
                        <li>Shipping services to fulfill your orders</li>
                        <li>Legal authorities when required by law</li>
                      </ul>
                    </section>

                    <section>
                      <h2 className="text-xl font-heading font-bold text-dark-gray mb-3">
                        Security of Your Information
                  </h2>
                  <p>
                        We use technical and organizational security measures to
                        protect your personal information from unauthorized
                        access, loss, or misuse. However, no method of
                        transmission over the internet or electronic storage is
                        100% secure.
                      </p>
                    </section>

                    <section>
                      <h2 className="text-xl font-heading font-bold text-dark-gray mb-3">
                        Your Rights
                      </h2>
                      <p>You have the right to:</p>
                      <ul className="list-disc list-inside space-y-2 ml-4 mt-2">
                        <li>Access your personal information</li>
                        <li>Correct inaccurate information</li>
                        <li>Request deletion of your information</li>
                        <li>Object to processing of your information</li>
                        <li>Withdraw consent at any time</li>
                      </ul>
                      <p className="mt-3">
                        To exercise these rights, please contact us at{" "}
                        <a
                          href="mailto:yaelromashkano@gmail.com"
                          className="text-primary-orange hover:underline"
                        >
                          yaelromashkano@gmail.com
                        </a>
                      </p>
                    </section>

                    <section>
                      <h2 className="text-xl font-heading font-bold text-dark-gray mb-3">
                        Changes to This Policy
                      </h2>
                      <p>
                        We may update this privacy policy from time to time. We
                        will notify you of any material changes by posting the
                        new policy on our website.
                      </p>
                    </section>

                    <section>
                      <h2 className="text-xl font-heading font-bold text-dark-gray mb-3">
                        Contact Us
                      </h2>
                      <p>
                        If you have any questions about our privacy policy,
                        please contact us:
                  </p>
                  <p className="mt-2">
                        <strong>Email:</strong>{" "}
                    <a
                          href="mailto:yaelromashkano@gmail.com"
                          className="text-primary-orange hover:underline"
                    >
                          yaelromashkano@gmail.com
                    </a>
                  </p>
                      <p className="mt-1">
                        <strong>Last Updated:</strong> February 2026
                      </p>
                    </section>
                  </>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
