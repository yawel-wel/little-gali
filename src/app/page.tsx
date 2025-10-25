import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative bg-[#F3EEE8] py-8 lg:py-12 overflow-hidden">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center space-y-4">
              {/* Welcome text */}
              <div>
                <div
                  className="inline-block px-6 py-2 rounded-full"
                  style={{ backgroundColor: "#F8D9C4" }}
                >
                  <p className="text-sm font-body-bold text-black uppercase tracking-widest">
                    הדפסה אישית באיכות גבוהה
                  </p>
                </div>

                {/* Main headline - made bigger and added more space */}
                <h1 className="text-4xl sm:text-4xl md:text-5xl lg:text-7xl font-black text-dark-gray leading-tight max-w-4xl mx-auto mt-4">
                  ספרון תינוקות מותאם באופן{" "}
                  <span className="relative inline-block">
                    <span className="relative z-10">אישי</span>
                    <span
                      className="absolute bottom-0 left-0 right-0 transform -rotate-1 rounded-full"
                      style={{
                        height: "8px",
                        borderRadius: "4px",
                        transform: "rotate(-1deg) translateY(0px)",
                        background:
                          "linear-gradient(90deg, rgba(229, 84, 61, 0.6) 0%, rgba(229, 84, 61, 0.8) 50%, rgba(229, 84, 61, 0.6) 100%)",
                        boxShadow: "0 2px 4px rgba(229, 84, 61, 0.3)",
                        width: "110%",
                        left: "-5%",
                      }}
                    ></span>
                  </span>
                </h1>

                {/* Description */}
                <p
                  className="text-base sm:text-lg md:text-xl font-normal text-medium-gray leading-relaxed max-w-xl mx-auto mt-6 text-center"
                  style={{
                    fontFamily: "'Inter', 'Helvetica Neue', sans-serif",
                    letterSpacing: "0.5px",
                  }}
                >
                  הדרך הכי מתוקה להכיר לתינוק את המשפחה
                </p>
              </div>

              {/* Hero Image with Arrow */}
              <div className="w-full max-w-6xl mx-auto relative">
                <img
                  src="/musicians.png"
                  alt="Baby book example"
                  className="w-full h-auto object-contain"
                  style={{ maxHeight: "220px" }}
                />

                {/* Decorative Arrow - Right side */}
                <div className="absolute top-1/2 right-36 transform -translate-y-1/2 hidden lg:block">
                  {/* Text above arrow */}
                  <div
                    className="absolute -top-6 left-26 transform -translate-x-1/2 text-dark-gray text-sm"
                    style={{
                      fontFamily: "'Playpen Sans Hebrew', cursive",
                      fontWeight: "600",
                      letterSpacing: "0.5px",
                      transform: "translateX(-50%) rotate(5deg)",
                      lineHeight: "1.2",
                      whiteSpace: "nowrap",
                    }}
                  >
                    <div>מותאם לראיית</div>
                    <div>תינוקות</div>
                  </div>

                  {/* Arrow */}
                  <svg
                    width="100"
                    height="80"
                    viewBox="0 0 100 80"
                    className="text-dark-gray"
                    style={{ transform: "rotate(180deg)" }}
                  >
                    <path
                      d="M10 40 Q50 20 90 50"
                      stroke="currentColor"
                      strokeWidth="3"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M75 35 L90 50 L75 65"
                      stroke="currentColor"
                      strokeWidth="3"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </div>

              {/* CTA Button with Arrow */}
              <div className="pt-1 relative flex items-center justify-center">
                {/* Hand-drawn Arrow and Text - Left side */}
                <div className="hidden lg:block absolute right-1/2 mr-20 top-1/2 transform -translate-y-1/2">
                  {/* Arrow */}
                  <svg
                    width="80"
                    height="40"
                    viewBox="0 0 80 40"
                    className="text-dark-gray"
                    style={{ transform: "rotate(-26deg)" }}
                  >
                    <path
                      d="M8 30 Q25 20 50 25"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M45 15 L50 25 L45 35"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>

                  {/* Text */}
                  <div
                    className="absolute -top-2 left-1/2 transform -translate-x-1/2 text-dark-gray text-sm"
                    style={{
                      transform: "translateX(-50%) rotate(-32deg)",
                      fontFamily: "'Playpen Sans Hebrew', cursive",
                      fontWeight: "600",
                      letterSpacing: "0.5px",
                      lineHeight: "1.2",
                      whiteSpace: "nowrap",
                    }}
                  >
                    <div>זה לוקח</div>
                    <div>דקה</div>
                  </div>
                </div>

                {/* Centered Button */}
                <Button
                  size="lg"
                  className="cursor-pointer bg-primary-orange hover:bg-primary-orange/90 text-white px-8 py-3 rounded-full font-black text-base text-sm transition-all duration-200 transform hover:scale-105 shadow-lg"
                >
                  צרו ספרון עכשיו
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Choose Your Path Section */}
        <section className="relative bg-[#F9F7EE] py-16 lg:py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            {/* Section Title */}
            <div className="text-center mb-12">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-dark-gray leading-tight max-w-3xl mx-auto">
                כי תינוקות רואים{" "}
                <span className="relative inline-block">
                  <span className="relative z-10">אחרת</span>
                  <span
                    className="absolute bottom-0 left-0 right-0 transform -rotate-1"
                    style={{
                      height: "6px",
                      borderRadius: "6px 6px 0 0",
                      transform: "rotate(-2deg) translateY(0px)",
                      background:
                        "linear-gradient(90deg, rgba(229, 84, 61, 0.6) 0%, rgba(229, 84, 61, 0.8) 50%, rgba(229, 84, 61, 0.6) 100%)",
                      boxShadow: "0 2px 4px rgba(229, 84, 61, 0.3)",
                      width: "110%",
                      left: "-5%",
                    }}
                  ></span>
                </span>{" "}
                מאיתנו
              </h2>
            </div>

            {/* 4 Column Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 max-w-6xl mx-auto">
              {/* Column 1 */}
              <div className="text-center">
                {/* Image */}
                <div className="w-48 h-48 md:w-64 md:h-64 mx-auto mb-6">
                  <img
                    src="/couple.png"
                    alt="Couple"
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>

                {/* Title */}
                <h3 className="font-heading text-dark-gray text-lg mb-2">
                  להסתכל על הקרובים ביותר{" "}
                </h3>

                {/* Subtitle */}
                <p className="font-body text-medium-gray text-sm leading-relaxed">
                  הפנים של המטפלים העיקריים מוכרות לתינוק ומרגיעות אותו כבר
                  מימיו הראשונים
                </p>
              </div>

              {/* Column 2 */}
              <div className="text-center">
                {/* Image */}
                <div className="w-48 h-48 md:w-64 md:h-64 mx-auto mb-6">
                  <img
                    src="/sister.png"
                    alt="Young Sister"
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>

                {/* Title */}
                <h3 className="font-heading text-dark-gray text-lg mb-2">
                  להכיר את המשפחה
                </h3>

                {/* Subtitle */}
                <p className="font-body text-medium-gray text-sm leading-relaxed">
                  הזדמנות להיחשף ולהסתכל על המשפחה אליה נכנס התינוק
                </p>
              </div>

              {/* Column 3 */}
              <div className="text-center">
                {/* Image */}
                <div className="w-48 h-48 md:w-64 md:h-64 mx-auto mb-6">
                  <img
                    src="/baby.png"
                    alt="Baby"
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>

                {/* Title */}
                <h3 className="font-heading text-dark-gray text-lg mb-2">
                  מזכרת מתוקה
                </h3>

                {/* Subtitle */}
                <p className="font-body text-medium-gray text-sm leading-relaxed">
                  ספרון שהוא אישי ומהווה מזכרת לתקופה קצרה ומופלאה בחיי התינוק
                </p>
              </div>

              {/* Column 4 */}
              <div className="text-center">
                {/* Image */}
                <div className="w-48 h-48 md:w-64 md:h-64 mx-auto mb-6">
                  <img
                    src="/dad-and-son.png"
                    alt="Dad and Son"
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>

                {/* Title */}
                <h3 className="font-heading text-dark-gray text-lg mb-2">
                  לא עוד מוצר גנרי
                </h3>

                {/* Subtitle */}
                <p className="font-body text-medium-gray text-sm leading-relaxed">
                  במקום להסתכל על צורות ותבניות, תנו לתינוק להסתכל על המשפחה
                </p>
              </div>
            </div>

            {/* CTA Section */}
            <div className="text-center mt-16">
              <p className="font-body text-medium-gray text-sm">
                מעוניינים לדעת עוד על ראיית תינוקות?{" "}
                <a
                  href="#"
                  className="text-[#F4A261] hover:text-[#F4A261]/80 underline cursor-pointer transition-colors duration-200"
                >
                  גלו כאן
                </a>
              </p>
            </div>
          </div>
        </section>

        {/* Dual Design Section */}
        <section className="relative bg-white py-8 lg:py-12">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            {/* Section Title */}
            <div className="text-center mb-8">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-dark-gray leading-tight max-w-2xl mx-auto">
                תמונה אחת,{" "}
                <span className="relative inline-block">
                  <span className="relative z-10">שני</span>
                  <span
                    className="absolute bottom-0 left-0 right-0 transform -rotate-1"
                    style={{
                      height: "4px",
                      borderRadius: "4px 4px 0 0",
                      transform: "rotate(-2deg) translateY(0px)",
                      background:
                        "linear-gradient(90deg, rgba(229, 84, 61, 0.6) 0%, rgba(229, 84, 61, 0.8) 50%, rgba(229, 84, 61, 0.6) 100%)",
                      boxShadow: "0 2px 4px rgba(229, 84, 61, 0.3)",
                      width: "110%",
                      left: "-5%",
                    }}
                  ></span>
                </span>{" "}
                עיצובים
              </h2>
              <p className="text-base sm:text-lg font-body text-medium-gray leading-relaxed max-w-xl mx-auto mt-4">
                אנחנו נעבד את התמונה וניצור ממנה שתי גרסאות שונות
              </p>
            </div>

            {/* Mobile Carousel / Desktop Grid */}
            <div className="max-w-4xl mx-auto relative mt-16 md:mt-24">
              {/* Center Image - Overlapping both mobile and desktop */}
              <div
                className="absolute top-12 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20 md:top-0 md:-translate-y-3/4"
                style={{ top: "38px" }}
              >
                <div className="w-26 h-26 md:w-32 md:h-32 rounded-full overflow-hidden border-4 border-white shadow-lg">
                  <img
                    src="/original-example.jpeg"
                    alt="Original Example"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Mobile Carousel */}
              <div className="md:hidden">
                <div className="relative overflow-hidden">
                  <div
                    className="flex transition-transform duration-300 ease-in-out pt-12"
                    id="carousel-container"
                  >
                    {/* Slide 1 - Colorful (Left) */}
                    <div className="w-4/5 flex-shrink-0 pr-4">
                      <div className="bg-orange-100 rounded-2xl p-6 text-center">
                        <h3 className="text-lg font-heading text-dark-gray mb-2 mt-9 md:mt-0">
                          צבעוני
                        </h3>
                        <p className="text-xs font-body text-medium-gray mb-4">
                          מתאים מגיל 3 חודשים ומעלה
                        </p>
                        <div className="w-40 h-40 mx-auto">
                          <img
                            src="/colorful-example.png"
                            alt="Colorful Example"
                            className="w-full h-full object-cover rounded-lg"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Slide 2 - Black and White (Right) */}
                    <div className="w-4/5 flex-shrink-0 pr-4">
                      <div className="bg-gray-100 rounded-2xl p-6 text-center">
                        <h3 className="text-lg font-heading text-dark-gray mb-2 mt-9 md:mt-0">
                          שחור לבן
                        </h3>
                        <p className="text-xs font-body text-medium-gray mb-4">
                          מתאים במיוחד מגיל לידה ועד גיל 3 חודשים
                        </p>
                        <div className="w-40 h-40 mx-auto">
                          <img
                            src="/black-and-white-example.png"
                            alt="Black and White Example"
                            className="w-full h-full object-cover rounded-lg"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Pagination Dots */}
                <div className="flex justify-center mt-6 space-x-2">
                  <button
                    className="w-3 h-3 rounded-full bg-[#F4A261] transition-all duration-200 cursor-pointer"
                    data-slide="0"
                  ></button>
                  <button
                    className="w-3 h-3 rounded-full bg-gray-300 hover:bg-[#F4A261] transition-all duration-200 cursor-pointer"
                    data-slide="1"
                  ></button>
                </div>
              </div>

              {/* Desktop Grid */}
              <div className="hidden md:grid md:grid-cols-2 gap-0 relative">
                {/* Left Side - Black and White */}
                <div className="bg-gray-100 rounded-l-2xl p-8 text-center relative pt-16">
                  <h3 className="text-xl font-heading text-dark-gray mb-2">
                    שחור לבן
                  </h3>
                  <p className="text-sm font-body text-medium-gray mb-4">
                    מתאים במיוחד מגיל לידה ועד גיל 3 חודשים
                  </p>
                  <div className="w-56 h-56 mx-auto">
                    <img
                      src="/black-and-white-example.png"
                      alt="Black and White Example"
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </div>
                </div>

                {/* Right Side - Colorful */}
                <div className="bg-orange-100 rounded-r-2xl p-8 text-center relative pt-16">
                  <h3 className="text-xl font-heading text-dark-gray mb-2">
                    צבעוני
                  </h3>
                  <p className="text-sm font-body text-medium-gray mb-4">
                    מתאים מגיל 3 חודשים ומעלה
                  </p>
                  <div className="w-56 h-56 mx-auto">
                    <img
                      src="/colorful-example.png"
                      alt="Colorful Example"
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Carousel Script */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              function initCarousel() {
                const container = document.getElementById('carousel-container');
                const dots = document.querySelectorAll('[data-slide]');
                
                console.log('Carousel container:', container);
                console.log('Dots found:', dots.length);
                
                if (container && dots.length > 0) {
                  // Set initial position to show first slide
                  container.style.transform = 'translateX(0%)';
                  
                  dots.forEach((dot, index) => {
                    dot.addEventListener('click', (e) => {
                      e.preventDefault();
                      
                      // Update active dot
                      dots.forEach(d => {
                        d.className = 'w-3 h-3 rounded-full bg-gray-300 hover:bg-[#F4A261] transition-all duration-200 cursor-pointer';
                      });
                      dot.className = 'w-3 h-3 rounded-full bg-[#F4A261] transition-all duration-200 cursor-pointer';
                      
                      // Move carousel - index 0 = first slide, index 1 = second slide
                      if (index === 0) {
                        // Show first slide (black & white) - move right to show left image
                        container.style.transform = 'translateX(0%)';
                        } else if (index === 1) {
                          // Show second slide (black & white) - move right to show black & white with hint of colorful
                          container.style.transform = 'translateX(60%)';
                        }
                    });
                  });
                } else {
                  console.log('Carousel elements not found, retrying...');
                  setTimeout(initCarousel, 100);
                }
              }
              
              // Try multiple times to ensure DOM is ready
              document.addEventListener('DOMContentLoaded', initCarousel);
              if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', initCarousel);
              } else {
                initCarousel();
              }
            `,
          }}
        />

        {/* Meet Dr. Jazmine Section */}
        <section className="relative bg-white py-16 lg:py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center max-w-6xl mx-auto">
              {/* Left Column - Image */}
              <div className="relative">
                {/* Organic shaped image container */}
                <div className="relative">
                  {/* Placeholder for portrait image with organic shape */}
                  <div className="relative w-full h-96 lg:h-[500px] bg-gradient-to-br from-soft-peach-light to-soft-blue-light rounded-3xl overflow-hidden">
                    {/* Organic shape using CSS clip-path */}
                    <div
                      className="w-full h-full bg-gradient-to-br from-soft-peach to-soft-blue rounded-3xl"
                      style={{
                        clipPath:
                          "polygon(0% 20%, 30% 0%, 100% 0%, 100% 100%, 0% 100%)",
                      }}
                    >
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="text-center space-y-4">
                          <div className="w-24 h-24 bg-white rounded-full mx-auto flex items-center justify-center">
                            <svg
                              className="w-12 h-12 text-soft-peach"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                                clipRule="evenodd"
                              ></path>
                            </svg>
                          </div>
                          <p className="text-white font-body text-sm">
                            ד"ר ג'זמין
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Decorative crescent moon */}
                  <div className="absolute -bottom-6 -right-6 w-16 h-8 bg-soft-peach rounded-full opacity-60"></div>
                </div>
              </div>

              {/* Right Column - Text Content */}
              <div className="relative">
                {/* Decorative flower - top left */}
                <div className="absolute -top-4 -right-4 w-8 h-8 text-soft-peach opacity-60">
                  <svg viewBox="0 0 100 100" className="w-full h-full">
                    <path
                      d="M50,10 L55,35 L80,35 L60,50 L65,75 L50,60 L35,75 L40,50 L20,35 L45,35 Z"
                      fill="currentColor"
                    />
                  </svg>
                </div>

                {/* Decorative lightbulb - top right */}
                <div className="absolute -top-2 -left-4 w-6 h-8 text-soft-green opacity-60">
                  <svg
                    viewBox="0 0 24 24"
                    className="w-full h-full"
                    fill="currentColor"
                  >
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.87-3.13-7-7-7zM9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1z" />
                  </svg>
                </div>

                {/* Content */}
                <div className="space-y-6">
                  {/* Subtitle */}
                  <div className="text-soft-peach font-body-bold text-sm uppercase tracking-wide">
                    פסיכולוגית ומחנכת
                  </div>

                  {/* Main heading with highlight */}
                  <h2 className="text-3xl lg:text-4xl font-heading text-dark-gray leading-tight">
                    הכירו את{" "}
                    <span className="relative">
                      ד"ר ג'זמין
                      <span className="absolute -bottom-1 right-0 left-0 h-3 bg-soft-green-light -z-10 rounded-sm"></span>
                    </span>
                  </h2>

                  {/* Body text */}
                  <div className="space-y-4">
                    <p className="font-body text-medium-gray leading-relaxed">
                      לורם איפסום דולור סיט amet, consectetur adipiscing elit.
                      Sed do eiusmod tempor incididunt ut labore et dolore magna
                      aliqua. Ut enim ad minim veniam, quis nostrud exercitation
                      ullamco laboris nisi ut aliquip ex ea commodo consequat.
                    </p>
                    <p className="font-body text-medium-gray leading-relaxed">
                      Duis aute irure dolor in reprehenderit in voluptate velit
                      esse cillum dolore eu fugiat nulla pariatur. Excepteur
                      sint occaecat cupidatat non proident, sunt in culpa qui
                      officia deserunt mollit anim id est laborum.
                    </p>
                  </div>

                  {/* CTA Button */}
                  <div className="pt-4">
                    <Button className="bg-soft-peach hover:bg-soft-peach/90 text-white px-8 py-3 rounded-full font-body-bold text-sm transition-all duration-200 transform hover:scale-105">
                      למדו עוד
                      <svg
                        className="mr-2 w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M9 5l7 7-7 7"
                        ></path>
                      </svg>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="relative bg-gradient-to-br from-soft-peach-light to-soft-blue-light py-16 lg:py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            {/* Section Title */}
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-heading text-dark-gray mb-4">
                איך זה עובד?
              </h2>
              <p className="text-lg font-body text-medium-gray max-w-2xl mx-auto">
                תהליך פשוט ומהנה שיעזור לכם להפוך להורים טובים יותר
              </p>
            </div>

            {/* Steps Grid */}
            <div className="grid md:grid-cols-3 gap-8 lg:gap-12 max-w-6xl mx-auto">
              {/* Step 1 */}
              <div className="text-center relative">
                {/* Step Number */}
                <div className="relative inline-block mb-6">
                  <div className="w-16 h-16 bg-primary-orange rounded-full flex items-center justify-center mx-auto">
                    <span className="text-white font-heading text-xl font-bold">
                      1
                    </span>
                  </div>
                  {/* Decorative elements */}
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-soft-yellow rounded-full opacity-60"></div>
                  <div className="absolute -bottom-1 -left-1 w-4 h-4 bg-soft-green rounded-full opacity-40"></div>
                </div>

                {/* Step Content */}
                <div className="space-y-4">
                  <h3 className="text-xl font-heading text-dark-gray">
                    הרשמה והתחברות
                  </h3>
                  <p className="font-body text-medium-gray leading-relaxed">
                    הירשמו לאתר שלנו וקבלו גישה לכל התוכן והקורסים שלנו. התהליך
                    פשוט ומהיר!
                  </p>
                </div>

                {/* Connecting line to next step */}
                <div className="hidden md:block absolute top-8 left-full w-full h-0.5 bg-gradient-to-r from-primary-orange to-soft-peach opacity-30"></div>
              </div>

              {/* Step 2 */}
              <div className="text-center relative">
                {/* Step Number */}
                <div className="relative inline-block mb-6">
                  <div className="w-16 h-16 bg-soft-peach rounded-full flex items-center justify-center mx-auto">
                    <span className="text-white font-heading text-xl font-bold">
                      2
                    </span>
                  </div>
                  {/* Decorative elements */}
                  <div className="absolute -top-3 -left-2 w-5 h-5 bg-soft-blue rounded-full opacity-50"></div>
                  <div className="absolute -bottom-2 -right-2 w-3 h-3 bg-soft-yellow rounded-full opacity-60"></div>
                </div>

                {/* Step Content */}
                <div className="space-y-4">
                  <h3 className="text-xl font-heading text-dark-gray">
                    בחירת הקורס
                  </h3>
                  <p className="font-body text-medium-gray leading-relaxed">
                    בחרו את הקורס המתאים לכם מתוך המגוון הרחב שלנו. כל קורס
                    מותאם לגיל הילד ולצרכים שלכם.
                  </p>
                </div>

                {/* Connecting line to next step */}
                <div className="hidden md:block absolute top-8 left-full w-full h-0.5 bg-gradient-to-r from-soft-peach to-soft-blue opacity-30"></div>
              </div>

              {/* Step 3 */}
              <div className="text-center relative">
                {/* Step Number */}
                <div className="relative inline-block mb-6">
                  <div className="w-16 h-16 bg-soft-blue rounded-full flex items-center justify-center mx-auto">
                    <span className="text-white font-heading text-xl font-bold">
                      3
                    </span>
                  </div>
                  {/* Decorative elements */}
                  <div className="absolute -top-2 -right-3 w-4 h-4 bg-soft-green rounded-full opacity-50"></div>
                  <div className="absolute -bottom-1 -left-2 w-6 h-6 bg-soft-peach rounded-full opacity-40"></div>
                </div>

                {/* Step Content */}
                <div className="space-y-4">
                  <h3 className="text-xl font-heading text-dark-gray">
                    למידה והתקדמות
                  </h3>
                  <p className="font-body text-medium-gray leading-relaxed">
                    למדו בקצב שלכם, תרגלו את החומר, וקבלו תמיכה מלאה לאורך כל
                    הדרך. אתם לא לבד!
                  </p>
                </div>
              </div>
            </div>

            {/* Bottom CTA */}
            <div className="text-center mt-16">
              <Button className="bg-primary-orange hover:bg-primary-orange/90 text-white px-8 py-4 rounded-full font-body-bold text-lg transition-all duration-200 transform hover:scale-105">
                התחילו עכשיו
                <svg
                  className="mr-2 w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 5l7 7-7 7"
                  ></path>
                </svg>
              </Button>
            </div>

            {/* Decorative background elements */}
            <div className="absolute top-10 left-10 w-20 h-20 bg-soft-yellow rounded-full opacity-20"></div>
            <div className="absolute bottom-10 right-10 w-16 h-16 bg-soft-green rounded-full opacity-20"></div>
            <div className="absolute top-1/2 left-4 w-8 h-8 bg-soft-peach rounded-full opacity-30"></div>
            <div className="absolute top-1/3 right-8 w-12 h-12 bg-soft-blue rounded-full opacity-25"></div>
          </div>
        </section>

        {/* Q&A Section */}
        <section className="relative bg-white py-16 lg:py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            {/* Section Title */}
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-heading text-dark-gray mb-4">
                שאלו אותנו
              </h2>
              <p className="text-lg font-body text-medium-gray max-w-2xl mx-auto">
                התשובות לשאלות הנפוצות ביותר על הקורסים והשירותים שלנו
              </p>
            </div>

            {/* Accordion */}
            <div className="max-w-4xl mx-auto">
              <Accordion type="single" collapsible className="space-y-4">
                <AccordionItem
                  value="item-1"
                  className="border border-soft-peach-light rounded-lg px-6 py-4 bg-white shadow-sm"
                >
                  <AccordionTrigger className="text-right font-body-bold text-dark-gray hover:text-primary-orange transition-colors">
                    איך הספרון נראה?
                  </AccordionTrigger>
                  <AccordionContent className="text-right font-body text-medium-gray leading-relaxed pt-4">
                    הספרון שלנו מעוצב במיוחד עבור ילדים עם תמונות צבעוניות וטקסט
                    ברור. הוא כולל דפים עבים ועמידים, איורים ידידותיים,
                    ופעילויות אינטראקטיביות שיעזרו לילדכם ללמוד ולהתפתח.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem
                  value="item-2"
                  className="border border-soft-peach-light rounded-lg px-6 py-4 bg-white shadow-sm"
                >
                  <AccordionTrigger className="text-right font-body-bold text-dark-gray hover:text-primary-orange transition-colors">
                    כמה תמונות צריך לבחור?
                  </AccordionTrigger>
                  <AccordionContent className="text-right font-body text-medium-gray leading-relaxed pt-4">
                    אנו ממליצים לבחור 5-8 תמונות איכותיות שמציגות את הילד במצבים
                    שונים. התמונות צריכות להיות ברורות, מוארות היטב, ולהציג את
                    הילד במצבים טבעיים ונוחים.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem
                  value="item-3"
                  className="border border-soft-peach-light rounded-lg px-6 py-4 bg-white shadow-sm"
                >
                  <AccordionTrigger className="text-right font-body-bold text-dark-gray hover:text-primary-orange transition-colors">
                    מי כדאי שיהיה בספרון?
                  </AccordionTrigger>
                  <AccordionContent className="text-right font-body text-medium-gray leading-relaxed pt-4">
                    הספרון מיועד לילדכם, אבל אנו מעודדים את כל המשפחה להשתתף.
                    אחים, הורים, וסבים יכולים להיות חלק מהתהליך, מה שיעזור לילד
                    להרגיש בטוח ואהוב.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem
                  value="item-4"
                  className="border border-soft-peach-light rounded-lg px-6 py-4 bg-white shadow-sm"
                >
                  <AccordionTrigger className="text-right font-body-bold text-dark-gray hover:text-primary-orange transition-colors">
                    איזה תמונה מתאימה?
                  </AccordionTrigger>
                  <AccordionContent className="text-right font-body text-medium-gray leading-relaxed pt-4">
                    תמונות שמציגות את הילד במצבים חיוביים, עם הבעות פנים שמחות,
                    ופעילויות שהוא אוהב. הימנעו מתמונות מטושטשות או עם תאורה
                    גרועה.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem
                  value="item-5"
                  className="border border-soft-peach-light rounded-lg px-6 py-4 bg-white shadow-sm"
                >
                  <AccordionTrigger className="text-right font-body-bold text-dark-gray hover:text-primary-orange transition-colors">
                    אפשר לשים כמה אנשים בתמונה אחת?
                  </AccordionTrigger>
                  <AccordionContent className="text-right font-body text-medium-gray leading-relaxed pt-4">
                    כן, בהחלט! תמונות משפחתיות או עם חברים יכולות להיות נהדרות.
                    העיקר שהילד יהיה במרכז התמונה ושהתמונה תהיה ברורה ומוארת
                    היטב.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem
                  value="item-6"
                  className="border border-soft-peach-light rounded-lg px-6 py-4 bg-white shadow-sm"
                >
                  <AccordionTrigger className="text-right font-body-bold text-dark-gray hover:text-primary-orange transition-colors">
                    האם הרקע משנה?
                  </AccordionTrigger>
                  <AccordionContent className="text-right font-body text-medium-gray leading-relaxed pt-4">
                    הרקע חשוב אבל לא קריטי. רקע פשוט ונטול הסחות דעת יעזור
                    להדגיש את הילד. אם הרקע צבעוני מדי, אנו יכולים לעזור לערוך
                    אותו.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem
                  value="item-7"
                  className="border border-soft-peach-light rounded-lg px-6 py-4 bg-white shadow-sm"
                >
                  <AccordionTrigger className="text-right font-body-bold text-dark-gray hover:text-primary-orange transition-colors">
                    איך מנקים את הספרון?
                  </AccordionTrigger>
                  <AccordionContent className="text-right font-body text-medium-gray leading-relaxed pt-4">
                    הספרון עשוי מחומרים עמידים וניתן לניקוי. השתמשו במטלית לחה
                    עדינה או במגבונים לחים. הימנעו מחומרי ניקוי אגרסיביים
                    שעלולים לפגוע בדפים.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem
                  value="item-8"
                  className="border border-soft-peach-light rounded-lg px-6 py-4 bg-white shadow-sm"
                >
                  <AccordionTrigger className="text-right font-body-bold text-dark-gray hover:text-primary-orange transition-colors">
                    כמה זמן לוקח להכין את הספרון?
                  </AccordionTrigger>
                  <AccordionContent className="text-right font-body text-medium-gray leading-relaxed pt-4">
                    תהליך ההכנה לוקח 7-10 ימי עבודה מרגע קבלת התמונות. אנו
                    שולחים עדכון על התקדמות ומעדכנים אתכם כשהספרון מוכן לאיסוף
                    או למשלוח.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>

            {/* Bottom CTA */}
            <div className="text-center mt-16">
              <p className="font-body text-medium-gray mb-6">
                לא מצאתם את התשובה שחיפשתם?
              </p>
              <Button className="bg-soft-peach hover:bg-soft-peach/90 text-white px-8 py-3 rounded-full font-body-bold text-sm transition-all duration-200 transform hover:scale-105">
                צרו איתנו קשר
                <svg
                  className="mr-2 w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 5l7 7-7 7"
                  ></path>
                </svg>
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gradient-to-br from-[#1e3a8a] to-[#1e293b] text-white py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-8">
            {/* Logo */}
            <div className="flex justify-center">
              <img
                src="/logo-white.png"
                alt="Little Gali"
                width={200}
                height={60}
                className="h-16 w-auto"
              />
            </div>

            {/* Main Text Content */}
            <div className="max-w-4xl mx-auto">
              <p className="text-lg font-body leading-relaxed text-center">
                Little Gali הופך תמונות רגילות ליצירות שחור-לבן עדינות שמתאימות
                במיוחד לראיית תינוקות. נולד מאמא שאהבה לראות את התינוקת שלה
                נמשכת לפנים מוכרות - והפך למזכרת אישית, חמה ופשוטה ליצירה. מודפס
                באיכות גבוהה בבית דפוס מקומי.
              </p>
            </div>

            {/* Copyright */}
            <div className="pt-8 border-t border-white/20">
              <p className="text-sm font-body text-white/80">
                © Little Gali 2025. כל הזכויות שמורות.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
