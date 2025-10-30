import { Button } from "@/components/ui/button";

export function Footer() {
  return (
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
              במיוחד לראיית תינוקות. נולד מאמא שאהבה לראות את התינוקת שלה נמשכת
              לפנים מוכרות.
            </p>
            {/* Social Media Icons - temporarily disabled */}
            {/**
            <div className="flex gap-3">
              ... icons ...
            </div>
            **/}
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
  );
}
