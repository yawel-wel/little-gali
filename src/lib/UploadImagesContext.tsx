"use client";

import React, { createContext, useContext, useMemo, useState } from "react";

type UploadImagesContextValue = {
  images: string[];
  setImages: React.Dispatch<React.SetStateAction<string[]>>;
  clearImages: () => void;
};

const UploadImagesContext = createContext<UploadImagesContextValue | undefined>(
  undefined
);

export function UploadImagesProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [images, setImages] = useState<string[]>([]);

  const value = useMemo(
    () => ({ images, setImages, clearImages: () => setImages([]) }),
    [images]
  );

  return (
    <UploadImagesContext.Provider value={value}>
      {children}
    </UploadImagesContext.Provider>
  );
}

export function useUploadImages() {
  const ctx = useContext(UploadImagesContext);
  if (!ctx) {
    throw new Error("useUploadImages must be used within UploadImagesProvider");
  }
  return ctx;
}
