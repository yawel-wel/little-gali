"use client";

import { useState } from "react";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission here
    console.log("Form submitted:", formData);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F9F7EE" }}>
      <Header />

      <main className="flex-1 pt-20">
        <section
          className="relative py-16 lg:py-24"
          style={{ backgroundColor: "#F9F7EE" }}
        >
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
              <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
                {/* Left Side - Title and Image Placeholder */}
                <div className="order-1 lg:order-1">
                  <div className="space-y-6">
                    {/* Title */}
                    <div>
                      <h1 className="text-3xl lg:text-4xl font-black text-dark-gray leading-tight">
                        צרו איתנו{" "}
                        <span className="relative inline-block">
                          <span className="relative z-10">קשר</span>
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
                        </span>
                      </h1>
                    </div>

                    {/* Image */}
                    <div className="w-full h-64 lg:h-80 rounded-lg overflow-hidden md:mt-20">
                      <img
                        src="/contact-us.png"
                        alt="Contact Us"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                </div>

                {/* Right Side - Form */}
                <div className="order-2 lg:order-2">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Name Field */}
                    <div>
                      <label
                        htmlFor="name"
                        className="block text-sm font-body-bold text-dark-gray mb-2"
                      >
                        שם <span className="text-primary-orange">*</span>
                      </label>
                      <Input
                        type="text"
                        id="name"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:border-primary-orange focus:ring-2 focus:ring-primary-orange/20 bg-white"
                        placeholder="הכנס את שמך"
                      />
                    </div>

                    {/* Email Field */}
                    <div>
                      <label
                        htmlFor="email"
                        className="block text-sm font-body-bold text-dark-gray mb-2"
                      >
                        אימייל <span className="text-primary-orange">*</span>
                      </label>
                      <Input
                        type="email"
                        id="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:border-primary-orange focus:ring-2 focus:ring-primary-orange/20 bg-white"
                        placeholder="הכנס את כתובת האימייל שלך"
                      />
                    </div>

                    {/* Message Field */}
                    <div>
                      <label
                        htmlFor="message"
                        className="block text-sm font-body-bold text-dark-gray mb-2"
                      >
                        הודעה <span className="text-primary-orange">*</span>
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        required
                        value={formData.message}
                        onChange={handleChange}
                        rows={8}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-primary-orange focus:ring-2 focus:ring-primary-orange/20 bg-white resize-none font-body text-dark-gray"
                        placeholder="השאר את הודעתך כאן..."
                      />
                    </div>

                    {/* Submit Button */}
                    <div>
                      <Button
                        type="submit"
                        className="cursor-pointer bg-primary-orange hover:bg-primary-orange/90 text-white px-8 py-3 rounded-full font-body-bold text-base transition-all duration-200 transform hover:scale-105"
                      >
                        שלח הודעה
                      </Button>
                    </div>
                  </form>
                </div>
              </div>
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
              <Button className="cursor-pointer bg-black hover:bg-gray-800 text-white px-6 py-2 rounded-md font-body-bold text-sm transition-all duration-200">
                צרו איתנו קשר
              </Button>
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
