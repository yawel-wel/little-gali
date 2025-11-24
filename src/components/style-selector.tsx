"use client";

export type StyleType = "cartoon" | "pencil";

interface StyleSelectorProps {
  selectedStyle: StyleType;
  onStyleChange: (style: StyleType) => void;
}

export function StyleSelector({
  selectedStyle,
  onStyleChange,
}: StyleSelectorProps) {
  return (
    <div className="flex flex-col items-center gap-5 w-full">
      {/* Heading and Subtitle Group */}
      <div className="flex flex-col items-center gap-2">
        <h3 className="text-lg font-body-bold text-dark-gray text-center">
          בחרו את הסגנון שלכם:
        </h3>

        {/* Subtitle */}
        <p className="text-md font-body text-medium-gray text-center">
          הסגנון ישפיע על הצד הצבעוני של התמונה
        </p>
      </div>

      {/* Style Options */}
      <div className="flex flex-row gap-4 sm:gap-6 justify-center w-full max-w-2xl px-4">
        {/* Cartoon Option */}
        <button
          onClick={() => {
            console.log("🎨 Style changed to: cartoon");
            onStyleChange("cartoon");
          }}
          className={`flex flex-col items-center gap-4 p-5 rounded-2xl transition-all duration-200 cursor-pointer flex-1 max-w-[240px] bg-white ${
            selectedStyle === "cartoon"
              ? "border-[4px] border-primary-orange"
              : "border-[2px] border-gray-300 hover:border-gray-400 hover:shadow-md"
          }`}
          style={{
            transform: "scale(1)",
            transition: "all 0.2s ease-in-out",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "scale(1.02)";
            if (selectedStyle !== "cartoon") {
              e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.1)";
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "scale(1)";
            e.currentTarget.style.boxShadow = "";
          }}
        >
          {/* Cartoon Example Image */}
          <div className="w-[160px] h-[160px] md:w-[180px] md:h-[180px] rounded-lg overflow-hidden bg-white">
            <img
              src="/style-example-cartoon.png"
              alt="קריקטורה - סגנון קריקטורה"
              className="w-full h-full object-cover"
              style={{ border: "none", outline: "none" }}
            />
          </div>
          {/* Label */}
          <span className="font-body-bold text-base md:text-lg text-dark-gray">
            קריקטורה
          </span>
        </button>

        {/* Pencil Option */}
        <button
          onClick={() => {
            console.log("🎨 Style changed to: pencil");
            onStyleChange("pencil");
          }}
          className={`flex flex-col items-center gap-4 p-5 rounded-2xl transition-all duration-200 cursor-pointer flex-1 max-w-[240px] bg-white ${
            selectedStyle === "pencil"
              ? "border-[4px] border-primary-orange"
              : "border-[2px] border-gray-300 hover:border-gray-400 hover:shadow-md"
          }`}
          style={{
            transform: "scale(1)",
            transition: "all 0.2s ease-in-out",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "scale(1.02)";
            if (selectedStyle !== "pencil") {
              e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.1)";
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "scale(1)";
            e.currentTarget.style.boxShadow = "";
          }}
        >
          {/* Pencil Example Image */}
          <div className="w-[160px] h-[160px] md:w-[180px] md:h-[180px] rounded-lg overflow-hidden bg-white">
            <img
              src="/style-example-pencil.png"
              alt="עיפרון - סגנון עיפרון"
              className="w-full h-full object-cover"
              style={{ border: "none", outline: "none" }}
            />
          </div>
          {/* Label */}
          <span className="font-body-bold text-base md:text-lg text-dark-gray">
            עיפרון
          </span>
        </button>
      </div>
    </div>
  );
}
