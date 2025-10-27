"use client";

import { useState } from "react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus({ type: null, message: "" });

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setSubmitStatus({
          type: "success",
          message: data.message || "ההודעה נשלחה בהצלחה!",
        });
        // Reset form
        setFormData({
          name: "",
          email: "",
          message: "",
        });
      } else {
        setSubmitStatus({
          type: "error",
          message: data.error || "שגיאה בשליחת ההודעה. אנא נסה שוב.",
        });
      }
    } catch (error) {
      setSubmitStatus({
        type: "error",
        message: "שגיאה בשרת. אנא נסה שוב מאוחר יותר.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // Clear status when user starts typing
    if (submitStatus.type) {
      setSubmitStatus({ type: null, message: "" });
    }
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

                    {/* Status Messages */}
                    {submitStatus.type && (
                      <div
                        className={`p-4 rounded-lg ${
                          submitStatus.type === "success"
                            ? "bg-green-50 border border-green-200 text-green-800"
                            : "bg-red-50 border border-red-200 text-red-800"
                        }`}
                      >
                        <p className="font-body text-sm">
                          {submitStatus.message}
                        </p>
                      </div>
                    )}

                    {/* Submit Button */}
                    <div>
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="cursor-pointer bg-primary-orange hover:bg-primary-orange/90 text-white px-8 py-3 rounded-full font-body-bold text-base transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                      >
                        {isSubmitting ? "שולח..." : "שלח הודעה"}
                      </Button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
