"use client";

import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Title } from "@/components/title";
import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function PreviewPage() {
  const router = useRouter();
  const [images, setImages] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
    hearAbout: "",
  });

  useEffect(() => {
    // Get images from sessionStorage
    const storedImages = sessionStorage.getItem("previewImages");
    if (storedImages) {
      try {
        const parsedImages = JSON.parse(storedImages);
        setImages(parsedImages);
      } catch (error) {
        console.error("Error parsing images:", error);
      }
    }
  }, []);

  const handleGoBack = () => {
    router.push("/upload");
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Handle form submission here
    console.log("Form submitted:", formData);
    // You can add your API call or navigation logic here
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
    <div className="min-h-screen" style={{ backgroundColor: "#F3EEE8" }}>
      <Header />

      <main className="flex-1 pt-20">
        <section
          className="relative py-10 lg:py-16"
          style={{ backgroundColor: "#F3EEE8" }}
        >
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
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
                <h2 className="text-2xl font-bold text-dark-gray text-center mb-8">
                  התמונות שלך
                </h2>
                <div className="flex flex-nowrap justify-center gap-2 sm:gap-3 md:gap-4 w-full max-w-none mx-auto px-4 overflow-visible">
                  {images.map((url, index) => (
                    <div
                      key={index}
                      className="relative w-[80px] h-[80px] sm:w-[100px] sm:h-[100px] md:w-[120px] md:h-[120px] flex-shrink-0 rounded-lg overflow-hidden border-2 border-primary-orange"
                    >
                      <img
                        src={url}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-transparent text-right"
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-transparent text-right"
                    />
                    <p className="text-sm text-gray-500 mt-2">
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-transparent resize-none text-right"
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="w-full bg-primary-orange hover:bg-primary-orange/90 text-white font-body-bold text-lg py-4 rounded-xl transition-opacity shadow-md hover:shadow-lg cursor-pointer flex items-center justify-center gap-2"
                  >
                    יאללה תכינו לי את הספרון 🎉
                  </button>
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
