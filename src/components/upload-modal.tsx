"use client";

import { X, Check } from "lucide-react";

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  showUploadButton?: boolean;
  onUploadClick?: () => void;
}

export function UploadModal({
  isOpen,
  onClose,
  showUploadButton = true,
  onUploadClick,
}: UploadModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-2xl max-w-[680px] w-full max-h-[90vh] overflow-hidden mx-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>

        {/* Modal Content */}
        <div className="px-8 py-6">
          {/* Title */}
          <h2 className="text-xl font-semibold text-dark-gray mb-6 text-center">
            איך לבחור תמונה לספרון?
          </h2>

          {/* Two Column Layout */}
          <div className="grid grid-cols-2 gap-x-12 items-start mt-4 mb-6">
            {/* Left Column - What to Choose */}
            <div className="pt-1">
              <h3 className="text-md font-semibold text-dark-gray mb-2">
                כדאי לבחור
              </h3>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-[18px]">✅</span>
                  <p className="text-dark-gray font-body text-base leading-6">
                    פנים ברורות
                  </p>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[18px]">✅</span>
                  <p className="text-dark-gray font-body text-base leading-6">
                    רואים את העיניים
                  </p>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[18px]">✅</span>
                  <p className="text-dark-gray font-body text-base leading-6">
                    תאורה טובה
                  </p>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[18px]">✅</span>
                  <p className="text-dark-gray font-body text-base leading-6">
                    אדם אחד או שניים בתמונה
                  </p>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[18px]">✅</span>
                  <p className="text-dark-gray font-body text-base leading-6">
                    חיוך טבעי
                  </p>
                </li>
              </ul>
            </div>

            {/* Right Column - What to Avoid */}
            <div>
              <h3 className="text-md font-semibold text-dark-gray mb-2">
                כדאי להימנע
              </h3>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <span className="text-[18px]">🚫</span>
                  <p className="text-dark-gray font-body text-base leading-5">
                    פילטר שחור-לבן
                  </p>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-[18px]">🚫</span>
                  <p className="text-dark-gray font-body text-base leading-5">
                    קרוב מדי לפנים
                  </p>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-[18px]">🚫</span>
                  <p className="text-dark-gray font-body text-base leading-5">
                    מטושטשת או רחוקה
                  </p>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-[18px]">🚫</span>
                  <p className="text-dark-gray font-body text-base leading-5">
                    תמונה קבוצתית
                  </p>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-[18px]">🚫</span>
                  <p className="text-dark-gray font-body text-base leading-5">
                    משקפי שמש או כובע
                  </p>
                </li>
              </ul>
            </div>
          </div>

          {/* Important Note */}
          <div className="mt-5 mb-5 flex justify-start">
            <div className="bg-[#FFF8E6] text-gray-700 text-sm rounded-lg px-3 py-2 pl-4 inline-flex items-start gap-2">
              <span className="text-yellow-500 text-lg leading-none">💡</span>
              <span>
                <strong>חשוב:</strong> הפנים בתמונה צריכות להיראות בבירור
              </span>
            </div>
          </div>

          {/* Image Examples - Mixed (2 X + 2 Check) */}
          <div className="flex items-center justify-center gap-3 mt-6 mb-2">
            {/* Red X 1 - Too Close */}
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                <img
                  src="/too-close-example.jpg"
                  alt="Too close example"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center border-2 border-white">
                <X className="w-3 h-3 text-white" />
              </div>
            </div>

            {/* Red X 2 - Group */}
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                <img
                  src="/group-example.jpeg"
                  alt="Group example"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center border-2 border-white">
                <X className="w-3 h-3 text-white" />
              </div>
            </div>

            {/* Green Check 1 */}
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                <img
                  src="/good-example-1.jpg"
                  alt="Good example 1"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center border-2 border-white">
                <Check className="w-3 h-3 text-white" />
              </div>
            </div>

            {/* Green Check 2 */}
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                <img
                  src="/good-example-2.jpg"
                  alt="Good example 2"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center border-2 border-white">
                <Check className="w-3 h-3 text-white" />
              </div>
            </div>
          </div>

          {/* CTA Button */}
          {showUploadButton && (
            <div className="mt-4 flex justify-center">
              <button
                onClick={() => {
                  onUploadClick?.();
                  onClose();
                }}
                className="cursor-pointer w-full max-w-[280px] bg-[#E15B3A] hover:bg-[#D44E2E] text-white font-medium text-base h-11 px-6 rounded-xl shadow-md flex items-center justify-center gap-2 transition-opacity"
              >
                בחירה מהמכשיר
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </button>
            </div>
          )}

          {/* Privacy Statement */}
          <div className="text-center mt-2 mb-2">
            <p className="font-body text-sm text-gray-500">
              התמונות ישמשו רק ליצירת הספרון האישי שלכם
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
