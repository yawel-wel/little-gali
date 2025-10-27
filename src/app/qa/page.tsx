"use client";

import { Header } from "@/components/header";
import { Title } from "@/components/title";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function QAPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="flex-1 pt-20">
        {/* Q&A Section */}
        <section
          className="relative py-16 lg:py-24"
          style={{ backgroundColor: "#F9F7EE" }}
        >
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            {/* Section Title */}
            <div className="text-center mb-16">
              <Title highlightText="אותנו" size="lg" className="mb-4">
                שאלו אותנו
              </Title>
              <p className="text-lg font-body text-medium-gray max-w-2xl mx-auto">
                התשובות לשאלות הנפוצות ביותר על הספרון והשירותים שלנו
              </p>
            </div>

            {/* Accordion */}
            <div className="max-w-4xl mx-auto">
              <Accordion type="single" collapsible className="space-y-4">
                <AccordionItem
                  value="item-1"
                  className="border border-soft-peach-light rounded-lg px-6 py-4 bg-white shadow-sm cursor-pointer"
                >
                  <AccordionTrigger className="text-right font-body-bold text-dark-gray hover:text-primary-orange transition-colors cursor-pointer">
                    ממה הספרון עשוי?
                  </AccordionTrigger>
                  <AccordionContent className="text-right font-body text-medium-gray leading-relaxed pt-4">
                    הספרון עשוי מנייר איכותי ועבה שנעבר למינציה.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem
                  value="item-2"
                  className="border border-soft-peach-light rounded-lg px-6 py-4 bg-white shadow-sm cursor-pointer"
                >
                  <AccordionTrigger className="text-right font-body-bold text-dark-gray hover:text-primary-orange transition-colors cursor-pointer">
                    כמה תמונות צריך לבחור?
                  </AccordionTrigger>
                  <AccordionContent className="text-right font-body text-medium-gray leading-relaxed pt-4">
                    5 תמונות בלבד. אותן תמונות מופיעות בצד אחד בשחור לבן ובצד
                    השני בצבעוני.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem
                  value="item-3"
                  className="border border-soft-peach-light rounded-lg px-6 py-4 bg-white shadow-sm cursor-pointer"
                >
                  <AccordionTrigger className="text-right font-body-bold text-dark-gray hover:text-primary-orange transition-colors cursor-pointer">
                    מי כדאי שיהיה בספרון?
                  </AccordionTrigger>
                  <AccordionContent className="text-right font-body text-medium-gray leading-relaxed pt-4">
                    אנשים קרובים שתינוקכם יכיר ויתחבר אליהם – הורים, סבים, אחים,
                    חבר קרוב ואפילו חיית המחמד המשפחתית.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem
                  value="item-4"
                  className="border border-soft-peach-light rounded-lg px-6 py-4 bg-white shadow-sm cursor-pointer"
                >
                  <AccordionTrigger className="text-right font-body-bold text-dark-gray hover:text-primary-orange transition-colors cursor-pointer">
                    איזה תמונה מתאימה?
                  </AccordionTrigger>
                  <AccordionContent className="text-right font-body text-medium-gray leading-relaxed pt-4">
                    תמונה ברורה של הפנים, בלי משקפי שמש ועדיף עם חיוך. לא קרובה
                    מדי לפנים. הימנעו מתמונות מטושטשות או עם תאורה גרועה.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem
                  value="item-5"
                  className="border border-soft-peach-light rounded-lg px-6 py-4 bg-white shadow-sm cursor-pointer"
                >
                  <AccordionTrigger className="text-right font-body-bold text-dark-gray hover:text-primary-orange transition-colors cursor-pointer">
                    אפשר לשים כמה אנשים בתמונה אחת?
                  </AccordionTrigger>
                  <AccordionContent className="text-right font-body text-medium-gray leading-relaxed pt-4">
                    כן, בהחלט! ניתן להעלות תמונה עם שני אנשים במידה והתמונה תהיה
                    ברורה ומוארת היטב. עדיף להימנע מתמונות עם יותר משני אנשים
                    מאחר ועיבוד התמונה עלול להיפגע וגם כי תמונה עם יותר מדיי
                    פרטים אינה מותאמת לתינוקות.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem
                  value="item-6"
                  className="border border-soft-peach-light rounded-lg px-6 py-4 bg-white shadow-sm cursor-pointer"
                >
                  <AccordionTrigger className="text-right font-body-bold text-dark-gray hover:text-primary-orange transition-colors cursor-pointer">
                    האם הרקע משנה?
                  </AccordionTrigger>
                  <AccordionContent className="text-right font-body text-medium-gray leading-relaxed pt-4">
                    לא. הרקע מוסר אוטומטית ומוחלף בלבן.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem
                  value="item-7"
                  className="border border-soft-peach-light rounded-lg px-6 py-4 bg-white shadow-sm cursor-pointer"
                >
                  <AccordionTrigger className="text-right font-body-bold text-dark-gray hover:text-primary-orange transition-colors cursor-pointer">
                    איך מנקים את הספרון?
                  </AccordionTrigger>
                  <AccordionContent className="text-right font-body text-medium-gray leading-relaxed pt-4">
                    אפשר לנגב בעדינות עם מטלית לחה. יש להימנע ממגע ישיר עם מים.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem
                  value="item-8"
                  className="border border-soft-peach-light rounded-lg px-6 py-4 bg-white shadow-sm cursor-pointer"
                >
                  <AccordionTrigger className="text-right font-body-bold text-dark-gray hover:text-primary-orange transition-colors cursor-pointer">
                    כמה זמן לוקח להכין את הספרון?
                  </AccordionTrigger>
                  <AccordionContent className="text-right font-body text-medium-gray leading-relaxed pt-4">
                    תהליך ההכנה לוקח 7-10 ימי עבודה מרגע קבלת התמונות. אנו
                    שולחים עדכון על התקדמות ומעדכנים אתכם כשהספרון מוכן לאיסוף
                    או למשלוח.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem
                  value="item-9"
                  className="border border-soft-peach-light rounded-lg px-6 py-4 bg-white shadow-sm cursor-pointer"
                >
                  <AccordionTrigger className="text-right font-body-bold text-dark-gray hover:text-primary-orange transition-colors cursor-pointer">
                    מה אם אני לא מרוצה מהספרון?
                  </AccordionTrigger>
                  <AccordionContent className="text-right font-body text-medium-gray leading-relaxed pt-4">
                    המטרה שלנו היא שתאהבו ותהיו מרוצים מהספרון שלכם. אם זה לא
                    המצב שאנחנו מאפשרים להחזיר את הספרון ולקבל את התשלום בחזרה.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>

            {/* Bottom CTA */}
            <div className="text-center mt-16">
              <a href="/contact" className="block">
                <p className="font-body text-medium-gray mb-6 cursor-pointer hover:text-dark-gray transition-colors">
                  לא מצאתם את התשובה שחיפשתם?
                </p>
                <Button className="cursor-pointer bg-soft-peach hover:bg-soft-peach/90 text-white px-8 py-3 rounded-full font-body-bold text-sm transition-all duration-200 transform hover:scale-105">
                  צרו איתנו קשר
                </Button>
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white">
        {/* Upper Section - White Background with Columns */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
            {/* Column 1: Logo/Brand (Right side) */}
            <div className="col-span-2 lg:col-span-1 order-1 lg:order-1">
              <div className="mb-4">
                <img src="/logo.png" alt="Little Gali" className="h-8 w-auto" />
              </div>
              <p className="font-body text-medium-gray text-sm leading-relaxed mb-6">
                Little Gali הופך תמונות רגילות ליצירות שחור-לבן עדינות שמתאימות
                במיוחד לראיית תינוקות. נולד מאמא שאהבה לראות את התינוקת שלה
                נמשכת לפנים מוכרות.
              </p>
              {/* Social Media Icons */}
              <div className="flex gap-3">
                <a
                  href="#"
                  className="w-10 h-10 rounded-lg bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
                  aria-label="Facebook"
                >
                  <svg
                    className="w-5 h-5 text-black"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </a>
                <a
                  href="#"
                  className="w-10 h-10 rounded-lg bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
                  aria-label="Instagram"
                >
                  <svg
                    className="w-5 h-5 text-black"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Column 2: Platform */}
            <div className="order-2 lg:order-2">
              <h3 className="font-heading text-dark-gray text-lg font-bold mb-4">
                פלטפורמה
              </h3>
              <ul className="space-y-3">
                <li>
                  <a
                    href="#"
                    className="font-body text-medium-gray hover:text-dark-gray transition-colors text-sm"
                  >
                    איך זה עובד
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="font-body text-medium-gray hover:text-dark-gray transition-colors text-sm"
                  >
                    מדריך בחירת תמונה
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="font-body text-medium-gray hover:text-dark-gray transition-colors text-sm"
                  >
                    גלריית השראה
                  </a>
                </li>
                <li>
                  <a
                    href="/qa"
                    className="font-body text-medium-gray hover:text-dark-gray transition-colors text-sm"
                  >
                    שאלות ותשובות
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="font-body text-medium-gray hover:text-dark-gray transition-colors text-sm"
                  >
                    ראיית תינוקות
                  </a>
                </li>
              </ul>
            </div>

            {/* Column 3: Policies */}
            <div className="order-3 lg:order-3">
              <h3 className="font-heading text-dark-gray text-lg font-bold mb-4">
                תקנונים
              </h3>
              <ul className="space-y-3">
                <li>
                  <a
                    href="/terms"
                    className="font-body text-medium-gray hover:text-dark-gray transition-colors text-sm"
                  >
                    תנאי שירות
                  </a>
                </li>
                <li>
                  <a
                    href="/privacy"
                    className="font-body text-medium-gray hover:text-dark-gray transition-colors text-sm"
                  >
                    פרטיות
                  </a>
                </li>
                <li>
                  <a
                    href="/shipping"
                    className="font-body text-medium-gray hover:text-dark-gray transition-colors text-sm"
                  >
                    משלוחים
                  </a>
                </li>
                <li>
                  <a
                    href="/returns"
                    className="font-body text-medium-gray hover:text-dark-gray transition-colors text-sm"
                  >
                    החזרות
                  </a>
                </li>
              </ul>
            </div>

            {/* Column 4: About */}
            <div className="order-4 lg:order-4">
              <h3 className="font-heading text-dark-gray text-lg font-bold mb-4">
                אודות
              </h3>
              <ul className="space-y-3">
                <li>
                  <a
                    href="#"
                    className="font-body text-medium-gray hover:text-dark-gray transition-colors text-sm"
                  >
                    מי אנחנו
                  </a>
                </li>
                <li>
                  <a
                    href="/contact"
                    className="font-body text-medium-gray hover:text-dark-gray transition-colors text-sm"
                  >
                    צרו קשר
                  </a>
                </li>
              </ul>
            </div>

            {/* Column 5: Contact US (Left side) */}
            <div className="order-5 lg:order-5">
              <h3 className="font-heading text-dark-gray text-lg font-bold mb-4">
                צרו קשר
              </h3>
              <a href="/contact">
                <Button className="cursor-pointer bg-black hover:bg-gray-800 text-white px-6 py-2 rounded-md font-body-bold text-sm transition-all duration-200">
                  צרו איתנו קשר
                </Button>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Section - Dark Gray Bar */}
        <div className="bg-gray-800 py-4">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <p className="text-center font-body text-white/80 text-sm">
              © Copyright Little Gali. כל הזכויות שמורות.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
