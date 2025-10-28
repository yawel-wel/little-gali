"use client";

import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Title } from "@/components/title";
import { Button } from "@/components/ui/button";

export default function InspirationPage() {
  return (
    <div
      className="min-h-screen overflow-x-hidden"
      style={{ backgroundColor: "#F9F7EE" }}
    >
      <Header />

      <main className="flex-1 pt-20">
        {/* Section Title */}
        <section className="relative py-16 lg:py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <Title highlightText="השראה" size="xl" className="mb-4">
                השראה לספרונים
              </Title>
              <p className="text-lg font-body text-medium-gray max-w-2xl mx-auto">
                צפו בדוגמאות לסוגי ספרונים כדי לעזור לכם לבחור תמונות וליצור
                ספרון משלכם
              </p>
            </div>

            {/* Cards Section */}
            <div className="max-w-4xl mx-auto space-y-8">
              {/* Card 1: ספרון משפחה גרעינית */}
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="flex flex-col md:flex-row">
                  {/* Left Section - Text */}
                  <div className="w-full md:w-1/3 p-6 md:p-8 flex flex-col justify-center text-right">
                    <h3 className="text-2xl font-heading font-bold text-dark-gray mb-4">
                      ספרון משפחה גרעינית
                    </h3>
                    <p className="text-base font-body text-medium-gray leading-relaxed">
                      הפנים הקרובות ביותר לתינוק – אמא, אבא, ואולי גם אח, אחות
                      או הכלב המשפחתי. הספרון שמעניק לו תחושת רוגע וחיבור למשפחה
                    </p>
                  </div>

                  {/* Right Section - Illustrations Grid */}
                  <div className="w-full md:w-2/3 p-6 md:p-8">
                    <div className="grid grid-cols-2 gap-4">
                      {/* Top Left */}
                      <div className="aspect-square rounded-lg flex items-center justify-center p-4">
                        <img
                          src="/couple.png"
                          alt="Family illustration"
                          className="w-full h-full object-cover rounded-lg"
                        />
                      </div>
                      {/* Top Right */}
                      <div className="aspect-square rounded-lg flex items-center justify-center p-4">
                        <img
                          src="/family.png"
                          alt="Family illustration"
                          className="w-full h-full object-cover rounded-lg"
                        />
                      </div>
                      {/* Bottom Left */}
                      <div className="aspect-square rounded-lg flex items-center justify-center p-4">
                        <img
                          src="/dad-and-son.png"
                          alt="Family illustration"
                          className="w-full h-full object-cover rounded-lg"
                        />
                      </div>
                      {/* Bottom Right */}
                      <div className="aspect-square rounded-lg flex items-center justify-center p-4">
                        <img
                          src="/sister.png"
                          alt="Family illustration"
                          className="w-full h-full object-cover rounded-lg"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 2: הכירו את שאר המשפחה */}
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="flex flex-col md:flex-row">
                  {/* Left Section - Text */}
                  <div className="w-full md:w-1/3 p-6 md:p-8 flex flex-col justify-center text-right">
                    <h3 className="text-2xl font-heading font-bold text-dark-gray mb-4">
                      הכירו את שאר המשפחה
                    </h3>
                    <p className="text-base font-body text-medium-gray leading-relaxed">
                      סבים, סבתות, דודים ודודות – כל מי שאוהב ומכיר את התינוק.
                      דרך מתוקה לעודד היכרות וחיבור גם מרחוק
                    </p>
                  </div>

                  {/* Right Section - Illustrations Grid */}
                  <div className="w-full md:w-2/3 p-6 md:p-8">
                    <div className="grid grid-cols-2 gap-4">
                      {/* Top Left */}
                      <div className="aspect-square rounded-lg flex items-center justify-center p-4">
                        <img
                          src="/granpas-example.png"
                          alt="Extended family illustration"
                          className="w-full h-full object-cover rounded-lg"
                        />
                      </div>
                      {/* Top Right */}
                      <div className="aspect-square rounded-lg flex items-center justify-center p-4">
                        <img
                          src="/grandma.png"
                          alt="Extended family illustration"
                          className="w-full h-full object-cover rounded-lg"
                        />
                      </div>
                      {/* Bottom Left */}
                      <div className="aspect-square rounded-lg flex items-center justify-center p-4">
                        <img
                          src="/girl.png"
                          alt="Extended family illustration"
                          className="w-full h-full object-cover rounded-lg"
                        />
                      </div>
                      {/* Bottom Right */}
                      <div className="aspect-square rounded-lg flex items-center justify-center p-4">
                        <img
                          src="/grandpa-example.png"
                          alt="Extended family illustration"
                          className="w-full h-full object-cover rounded-lg"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 3: ספר תינוקי */}
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="flex flex-col md:flex-row">
                  {/* Left Section - Text */}
                  <div className="w-full md:w-1/3 p-6 md:p-8 flex flex-col justify-center text-right">
                    <h3 className="text-2xl font-heading font-bold text-dark-gray mb-4">
                      ספר תינוקי
                    </h3>
                    <p className="text-base font-body text-medium-gray leading-relaxed">
                      רגעים שונים של התינוק עצמו – חיוך, פליאה, מבט סקרן. ספרון
                      אישי ופשוט שמרתק כל תינוק
                    </p>
                  </div>

                  {/* Right Section - Illustrations Grid */}
                  <div className="w-full md:w-2/3 p-6 md:p-8">
                    <div className="grid grid-cols-2 gap-4">
                      {/* Top Left */}
                      <div className="aspect-square rounded-lg flex items-center justify-center p-4">
                        <img
                          src="/baby1.png"
                          alt="Baby moments illustration"
                          className="w-full h-full object-cover rounded-lg"
                        />
                      </div>
                      {/* Top Right */}
                      <div className="aspect-square rounded-lg flex items-center justify-center p-4">
                        <img
                          src="/baby2.png"
                          alt="Baby moments illustration"
                          className="w-full h-full object-cover rounded-lg"
                        />
                      </div>
                      {/* Bottom Left */}
                      <div className="aspect-square rounded-lg flex items-center justify-center p-4">
                        <img
                          src="/baby3.png"
                          alt="Baby moments illustration"
                          className="w-full h-full object-cover rounded-lg"
                        />
                      </div>
                      {/* Bottom Right */}
                      <div className="aspect-square rounded-lg flex items-center justify-center p-4">
                        <img
                          src="/baby4.png"
                          alt="Baby moments illustration"
                          className="w-full h-full object-cover rounded-lg"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* CTA Button */}
            <div className="text-center mt-12">
              <a href="/upload">
                <Button className="cursor-pointer bg-primary-orange hover:bg-primary-orange/90 text-white px-8 py-4 rounded-full font-body-bold text-base transition-all duration-200 transform hover:scale-105">
                  התחילו ליצור את הספרון שלכם
                </Button>
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
