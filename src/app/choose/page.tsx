"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { UploadBookFlowChooser } from "@/components/upload-book-flow-chooser";
import { useUploadImages } from "@/lib/UploadImagesContext";
import type { BookFlow } from "@/lib/preview-session/book-flow";

export default function ChoosePage() {
  const router = useRouter();
  const { setImages, clearImages } = useUploadImages();

  const selectBookFlow = useCallback(
    (flow: BookFlow) => {
      clearImages();
      setImages([]);
      router.push(`/upload?mode=${flow}`);
    },
    [clearImages, router, setImages],
  );

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F3EEE8" }}>
      <Header />
      <main
        id="main-content"
        className="flex-1"
        style={{ paddingTop: "calc(72px + var(--banner-height, 0px))" }}
      >
        <section
          className="relative pb-10 lg:pb-16 pt-6 lg:pt-10"
          style={{ backgroundColor: "#F3EEE8" }}
        >
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <UploadBookFlowChooser onSelect={selectBookFlow} />
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
