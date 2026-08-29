"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { isAiPreviewEnabled } from "@/lib/feature-flags";
import type { PreviewLimitsSnapshot } from "@/lib/preview-session/full-generation-limits";

export type PreviewLimitsState = PreviewLimitsSnapshot & {
  previewEnabled: boolean;
  isLoading: boolean;
};

const DEFAULT_LIMITS: PreviewLimitsState = {
  previewEnabled: false,
  windowHours: 12,
  fullGenerationLimit: 2,
  fullGenerationsUsed: 0,
  fullGenerationsRemaining: 2,
  isLastFullGenerationAvailable: false,
  resetAt: null,
  limitsBypassed: false,
  limitsEnforced: true,
  devResetAvailable: false,
  isLoading: true,
};

type PreviewLimitsContextValue = {
  limits: PreviewLimitsState;
  refreshLimits: () => Promise<void>;
};

const PreviewLimitsContext = createContext<PreviewLimitsContextValue | undefined>(
  undefined,
);

export function PreviewLimitsProvider({ children }: { children: ReactNode }) {
  const [limits, setLimits] = useState<PreviewLimitsState>(DEFAULT_LIMITS);

  const refreshLimits = useCallback(async () => {
    if (!isAiPreviewEnabled()) {
      setLimits({
        ...DEFAULT_LIMITS,
        previewEnabled: false,
        isLoading: false,
      });
      return;
    }

    setLimits((current) => ({ ...current, isLoading: true }));
    try {
      const response = await fetch("/api/preview/limits", {
        method: "GET",
        cache: "no-store",
      });
      if (!response.ok) {
        throw new Error("Failed to load preview limits");
      }
      const data = (await response.json()) as PreviewLimitsSnapshot & {
        previewEnabled?: boolean;
      };
      setLimits({
        previewEnabled: data.previewEnabled ?? true,
        windowHours: data.windowHours,
        fullGenerationLimit: data.fullGenerationLimit,
        fullGenerationsUsed: data.fullGenerationsUsed,
        fullGenerationsRemaining: data.fullGenerationsRemaining,
        isLastFullGenerationAvailable: data.isLastFullGenerationAvailable,
        resetAt: data.resetAt,
        limitsBypassed: data.limitsBypassed ?? false,
        limitsEnforced: data.limitsEnforced ?? true,
        devResetAvailable: data.devResetAvailable ?? false,
        isLoading: false,
      });
    } catch {
      setLimits((current) => ({ ...current, isLoading: false }));
    }
  }, []);

  useEffect(() => {
    void refreshLimits();
  }, [refreshLimits]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const onRefresh = () => {
      void refreshLimits();
    };
    window.addEventListener("lg:preview-limits-refresh", onRefresh);
    return () => {
      window.removeEventListener("lg:preview-limits-refresh", onRefresh);
    };
  }, [refreshLimits]);

  const value = useMemo(
    () => ({ limits, refreshLimits }),
    [limits, refreshLimits],
  );

  return (
    <PreviewLimitsContext.Provider value={value}>
      {children}
    </PreviewLimitsContext.Provider>
  );
}

export function usePreviewLimits(): PreviewLimitsContextValue {
  const context = useContext(PreviewLimitsContext);
  if (!context) {
    throw new Error("usePreviewLimits must be used within PreviewLimitsProvider");
  }
  return context;
}
