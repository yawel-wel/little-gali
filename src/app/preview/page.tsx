"use client";

import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Title } from "@/components/title";
import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useUploadImages } from "@/lib/UploadImagesContext";
import { blobToBase64 } from "@/lib/utils";

export default function PreviewPage() {
  const router = useRouter();
  const { images } = useUploadImages();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    hearAbout: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });

  const handleGoBack = () => {
    router.push("/upload");
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus({ type: null, message: "" });

    try {
      // Build multipart form data to avoid oversized JSON payloads
      const multipart = new FormData();
      multipart.append("fullName", formData.fullName);
      multipart.append("email", formData.email);
      multipart.append("phoneNumber", formData.phoneNumber);
      multipart.append("hearAbout", formData.hearAbout);

      // Append image blobs reconstructed from blob URLs
      // Limit to first 5 images (server enforces as well)
      const limitedImages = images.slice(0, 5);
      for (let i = 0; i < limitedImages.length; i++) {
        const url = limitedImages[i];
        const res = await fetch(url);
        const blob = await res.blob();
        const filename = `image-${i + 1}.${(
          blob.type.split("/")[1] || "jpg"
        ).replace("jpeg", "jpg")}`;
        multipart.append(
          "images",
          new File([blob], filename, { type: blob.type || "image/jpeg" })
        );
      }

      const response = await fetch("/api/order", {
        method: "POST",
        body: multipart,
      });

      const data = await response.json();

      if (response.ok) {
        setSubmitStatus({
          type: "success",
          message: data.message || "ההזמנה נשלחה בהצלחה!",
        });
        // Nothing to clear now; context will keep state until user navigates away
      } else {
        setSubmitStatus({
          type: "error",
          message: data.error || "שגיאה בשליחת ההזמנה. אנא נסה שוב.",
        });
      }
    } catch (error) {
      console.error("Submit error:", error);
      setSubmitStatus({
        type: "error",
        message: "שגיאה בשרת. אנא נסה שוב מאוחר יותר.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div
      className="min-h-screen overflow-x-hidden"
      style={{ backgroundColor: "#F3EEE8" }}
    >
      <Header />

      <main className="flex-1">
        <section
          className="relative py-10 lg:py-16 pt-20 md:pt-16"
          style={{ backgroundColor: "#F3EEE8" }}
        >
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-12 md:pt-16">
            <div className="max-w-3xl mx-auto space-y-8">
              {/* Back Button */}
              <button
                onClick={handleGoBack}
                className="flex items-center gap-2 text-dark-gray hover:text-primary-orange transition-colors mb-6 cursor-pointer"
              >
                <ArrowRight className="w-5 h-5" />
                <span className="font-body-bold">חזרה לעריכת תמונות</span>
              </button>

              {/* Title */}
              <div className="text-center space-y-4">
                <Title
                  highlightText="סיימנו"
                  size="xl"
                  roundedUnderline
                  className="text-2xl md:text-4xl font-bold"
                >
                  כמעט סיימנו
                </Title>
                <p className="text-lg text-dark-gray leading-relaxed">
                  הספרון המיוחד בדרך אליכם בעוד כמה רגעים
                </p>
              </div>

              {/* Preview Images */}
              <div className="mt-12">
                <h2 className="text-2xl font-bold text-dark-gray text-center mb-6">
                  התמונות שלך
                </h2>
                <div className="flex flex-nowrap justify-center gap-1 md:gap-4 w-full max-w-none mx-auto px-6 overflow-visible">
                  {images.map((url, index) => (
                    <div
                      key={index}
                      className="relative w-[72px] h-[72px] sm:w-[80px] sm:h-[80px] md:w-[120px] md:h-[120px] lg:w-[140px] lg:h-[140px] flex-shrink-0 mx-auto rounded-lg overflow-hidden border-2 border-primary-orange"
                    >
                      <img
                        src={url}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>

                {/* Order Details */}
                <div className="mt-6 text-center space-y-1">
                  <p className="text-base md:text-lg text-dark-gray font-body">
                    מחיר - 120 ₪
                  </p>
                  <p className="text-base md:text-lg text-dark-gray font-body">
                    זמן אספקה - עד 14 ימי עסקים
                  </p>
                  <p className="text-sm md:text-base text-medium-gray font-body">
                    הודעה תשלח כשהספרון מוכן בשביל תיאום לאיסוף
                  </p>
                </div>
              </div>

              {/* Contact Form */}
              <div className="mt-12 bg-white rounded-2xl shadow-lg p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Full Name Field */}
                  <div>
                    <label
                      htmlFor="fullName"
                      className="block font-body-bold text-dark-gray mb-2"
                    >
                      שם מלא *
                    </label>
                    <input
                      type="text"
                      id="fullName"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      placeholder="הכנס את שמך המלא"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-primary-orange text-right text-sm sm:text-base"
                    />
                  </div>

                  {/* Email Field */}
                  <div>
                    <label
                      htmlFor="email"
                      className="block font-body-bold text-dark-gray mb-2"
                    >
                      אימייל *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="name@example.com"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-primary-orange text-right text-sm sm:text-base"
                    />
                  </div>

                  {/* Phone Number Field */}
                  <div>
                    <label
                      htmlFor="phoneNumber"
                      className="block font-body-bold text-dark-gray mb-2"
                    >
                      מספר טלפון *
                    </label>
                    <input
                      type="tel"
                      id="phoneNumber"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleInputChange}
                      placeholder="050-1234567"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-primary-orange text-right text-sm sm:text-base"
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      כדי שנוכל לעדכן אותך כשהספרון מוכן
                    </p>
                  </div>

                  {/* How did you hear about us - Textarea */}
                  <div>
                    <label
                      htmlFor="hearAbout"
                      className="block font-body-bold text-dark-gray mb-2"
                    >
                      איך שמעת עלינו
                    </label>
                    <textarea
                      id="hearAbout"
                      name="hearAbout"
                      value={formData.hearAbout}
                      onChange={handleInputChange}
                      rows={3}
                      placeholder="שתף איתנו איך שמעת עלינו..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-primary-orange resize-none text-right text-sm sm:text-base"
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-primary-orange hover:bg-primary-orange/90 disabled:bg-primary-orange/70 disabled:cursor-not-allowed text-white font-body-bold text-base sm:text-lg py-3 sm:py-4 rounded-xl transition-opacity shadow-md hover:shadow-lg cursor-pointer flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? "שולח..." : "יאללה תכינו לי את הספרון 🎉"}
                  </button>

                  {/* Status Message */}
                  {submitStatus.type && (
                    <div
                      className={`w-full mt-4 p-4 rounded-lg text-center font-body-bold ${
                        submitStatus.type === "success"
                          ? "bg-green-50 text-green-700 border border-green-200"
                          : "bg-red-50 text-red-700 border border-red-200"
                      }`}
                    >
                      {submitStatus.message}
                    </div>
                  )}
                </form>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
