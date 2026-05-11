"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Title } from "@/components/title";
import { StyleSelector, type StyleType } from "@/components/style-selector";
import { useLanguage } from "@/lib/LanguageContext";
import { useCart } from "@/lib/CartContext";
import { compressImage } from "@/lib/utils";
import type { PreviewSessionPublicView } from "@/lib/preview-session/types";
import Button from "@mui/material/Button";
import { Loader2 } from "lucide-react";

type PreviewStep = "bw" | "style";

function createIdempotencyKey(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export default function PreviewPage() {
  const params = useParams<{ sessionId: string }>();
  const sessionId = params.sessionId;
  const router = useRouter();
  const { t, locale } = useLanguage();
  const { addToCart } = useCart();
  const [session, setSession] = useState<PreviewSessionPublicView | null>(null);
  const [step, setStep] = useState<PreviewStep>("bw");
  const [selectedStyle, setSelectedStyle] = useState<StyleType>("pencil");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingLineIndex, setLoadingLineIndex] = useState(0);
  const replaceInputRef = useRef<HTMLInputElement>(null);
  const replaceSlotRef = useRef<number | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const loadingLines = useMemo(
    () => [
      t("preview.loadingLine1"),
      t("preview.loadingLine2"),
      t("preview.loadingLine3"),
    ],
    [t],
  );

  const refreshSession = useCallback(async () => {
    const response = await fetch(`/api/preview-session/${sessionId}`);
    if (!response.ok) {
      throw new Error(t("preview.sessionError"));
    }
    const data = (await response.json()) as { session: PreviewSessionPublicView };
    setSession(data.session);
    if (
      data.session.phase === "bw_approved" ||
      data.session.phase === "style_selected"
    ) {
      setStep("style");
    }
    if (data.session.selectedColorStyle) {
      setSelectedStyle(data.session.selectedColorStyle);
    }
    return data.session;
  }, [sessionId, t]);

  useEffect(() => {
    refreshSession().catch((err: Error) => setError(err.message));
  }, [refreshSession]);

  useEffect(() => {
    const interval = setInterval(() => {
      setLoadingLineIndex((current) => (current + 1) % loadingLines.length);
    }, 2800);
    return () => clearInterval(interval);
  }, [loadingLines.length]);

  useEffect(() => {
    const shouldPoll = session?.slots.some((slot) => slot.inFlight);
    if (!shouldPoll) {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
      return;
    }

    if (!pollRef.current) {
      pollRef.current = setInterval(() => {
        refreshSession().catch(() => undefined);
      }, 2500);
    }

    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };
  }, [session, refreshSession]);

  const isInitialLoading =
    !session ||
    session.slots.some(
      (slot) =>
        slot.inFlight ||
        !slot.candidates.some((candidate) => candidate.previewUrl || candidate.error),
    );

  const handleRegenerate = async (slotIndex: number) => {
    if (!session?.canRegenerate) return;
    setIsSubmitting(true);
    setError(null);
    try {
      const response = await fetch(
        `/api/preview-session/${sessionId}/regenerate`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            slotIndex,
            idempotencyKey: createIdempotencyKey(),
          }),
        },
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || t("preview.sessionError"));
      }
      setSession(data.session);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("preview.sessionError"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReplaceClick = (slotIndex: number) => {
    replaceSlotRef.current = slotIndex;
    replaceInputRef.current?.click();
  };

  const handleReplaceFile = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    const slotIndex = replaceSlotRef.current;
    event.target.value = "";
    if (!file || slotIndex === null || !session?.canReplace) return;

    setIsSubmitting(true);
    setError(null);
    try {
      const compressed = await compressImage(URL.createObjectURL(file));
      const formData = new FormData();
      formData.append("images", compressed);
      const uploadResponse = await fetch("/api/upload-images", {
        method: "POST",
        body: formData,
      });
      if (!uploadResponse.ok) {
        throw new Error(t("upload.serverError"));
      }
      const uploadData = await uploadResponse.json();
      const originalUrl = uploadData.imageUrls?.[0];
      if (!originalUrl) {
        throw new Error(t("upload.serverError"));
      }

      const response = await fetch(`/api/preview-session/${sessionId}/replace`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slotIndex,
          originalUrl,
          idempotencyKey: createIdempotencyKey(),
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || t("preview.sessionError"));
      }
      setSession(data.session);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("preview.sessionError"));
    } finally {
      setIsSubmitting(false);
      replaceSlotRef.current = null;
    }
  };

  const handleSelectCandidate = async (
    slotIndex: number,
    candidateId: string,
  ) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const response = await fetch(`/api/preview-session/${sessionId}/select`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slotIndex, candidateId }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || t("preview.sessionError"));
      }
      setSession(data.session);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("preview.sessionError"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApproveBw = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      const response = await fetch(
        `/api/preview-session/${sessionId}/approve-bw`,
        { method: "POST" },
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || t("preview.sessionError"));
      }
      setSession(data.session);
      setStep("style");
    } catch (err) {
      setError(err instanceof Error ? err.message : t("preview.sessionError"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleContinueToCart = async () => {
    if (!session) return;
    setIsSubmitting(true);
    setError(null);
    try {
      const styleResponse = await fetch(
        `/api/preview-session/${sessionId}/style`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ style: selectedStyle }),
        },
      );
      const styleData = await styleResponse.json();
      if (!styleResponse.ok) {
        throw new Error(styleData.error || t("preview.sessionError"));
      }

      const latest = styleData.session as PreviewSessionPublicView;
      const originalUrls = latest.slots.map((slot) => slot.originalUrl);
      const generatedBwUrls = latest.slots.map((slot) => {
        const active = slot.candidates.find(
          (candidate) => candidate.id === slot.activeCandidateId,
        );
        if (!active?.cleanUrl) {
          throw new Error(t("preview.sessionError"));
        }
        return active.cleanUrl;
      });

      await addToCart(generatedBwUrls, 1, undefined, undefined, selectedStyle, {
        originalUrls,
        generatedBwUrls,
        previewSessionId: sessionId,
      });
      router.push("/cart");
    } catch (err) {
      setError(err instanceof Error ? err.message : t("preview.sessionError"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="min-h-screen overflow-x-hidden"
      style={{ backgroundColor: "#F3EEE8" }}
    >
      <Header />
      <main
        className="flex-1"
        style={{ paddingTop: "calc(72px + var(--banner-height, 0px))" }}
      >
        <section className="py-10 md:py-14">
          <div className="container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <Title
              highlightText={
                step === "bw" ? t("preview.title") : t("preview.styleTitle")
              }
              size="xl"
              roundedUnderline
              className="text-center text-2xl font-bold md:text-4xl"
            >
              {step === "bw" ? t("preview.title") : t("preview.styleTitle")}
            </Title>

            {error && (
              <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-center font-body-bold text-red-700">
                {error}
              </div>
            )}

            {isInitialLoading ? (
              <div className="mt-16 flex flex-col items-center justify-center gap-4 text-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary-orange" />
                <p className="font-body-bold text-xl text-dark-gray">
                  {t("preview.loadingTitle")}
                </p>
                <p className="font-body text-dark-gray">
                  {loadingLines[loadingLineIndex]}
                </p>
              </div>
            ) : step === "bw" && session ? (
              <div className="mt-8 space-y-8">
                <p
                  className={`font-body text-dark-gray ${
                    locale === "en" ? "text-center" : "text-right"
                  }`}
                >
                  {t("preview.subtitle")}
                </p>
                <p className="text-center font-body-bold text-dark-gray">
                  {t("preview.changesLeft")}: {session.changeCreditsRemaining}/3
                </p>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {session.slots.map((slot) => {
                    const active = slot.candidates.find(
                      (candidate) => candidate.id === slot.activeCandidateId,
                    );
                    return (
                      <div
                        key={slot.index}
                        className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
                      >
                        <div
                          className="relative mb-4 overflow-hidden rounded-xl bg-[#ebe6dc]"
                          style={{ aspectRatio: "72 / 84" }}
                        >
                          {slot.inFlight ? (
                            <div className="flex h-full flex-col items-center justify-center gap-2">
                              <Loader2 className="h-8 w-8 animate-spin text-primary-orange" />
                              <p className="font-body text-sm text-dark-gray">
                                {t("preview.slotBusy")}
                              </p>
                            </div>
                          ) : active?.previewUrl ? (
                            <img
                              src={active.previewUrl}
                              alt={`${t("preview.title")} ${slot.index + 1}`}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center px-4 text-center font-body text-sm text-dark-gray">
                              {active?.error?.message || t("preview.sessionError")}
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col gap-2">
                          <Button
                            variant="outlined"
                            disabled={!session.canRegenerate || slot.inFlight || isSubmitting}
                            onClick={() => handleRegenerate(slot.index)}
                          >
                            {slot.inFlight ? t("preview.slotBusy") : t("preview.regenerate")}
                          </Button>
                          <Button
                            variant="text"
                            disabled={!session.canReplace || slot.inFlight || isSubmitting}
                            onClick={() => handleReplaceClick(slot.index)}
                          >
                            {t("preview.replaceImage")}
                          </Button>
                        </div>

                        {slot.candidates.length > 1 && (
                          <div className="mt-4">
                            <p className="mb-2 font-body-bold text-sm text-dark-gray">
                              {t("preview.previousVersions")}
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {slot.candidates.map((candidate) => (
                                <button
                                  key={candidate.id}
                                  type="button"
                                  disabled={!candidate.previewUrl || Boolean(candidate.error)}
                                  onClick={() =>
                                    handleSelectCandidate(slot.index, candidate.id)
                                  }
                                  className={`overflow-hidden rounded-md border-2 ${
                                    candidate.id === slot.activeCandidateId
                                      ? "border-primary-orange"
                                      : "border-transparent"
                                  }`}
                                >
                                  {candidate.previewUrl ? (
                                    <img
                                      src={candidate.previewUrl}
                                      alt=""
                                      className="h-16 w-14 object-cover"
                                    />
                                  ) : (
                                    <div className="flex h-16 w-14 items-center justify-center bg-gray-100 px-1 text-[10px]">
                                      {candidate.error?.code === "safety" ? "!" : "?"}
                                    </div>
                                  )}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="flex flex-col items-center gap-3">
                  <p className="font-body text-dark-gray">
                    {t("preview.contactPrompt")}
                  </p>
                  <Button
                    variant="outlined"
                    onClick={() =>
                      router.push(`/contact?previewSessionId=${sessionId}`)
                    }
                  >
                    {t("preview.contactButton")}
                  </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    disabled={!session.canApproveBw || isSubmitting}
                    onClick={handleApproveBw}
                  >
                    {t("preview.approveBw")}
                  </Button>
                </div>
              </div>
            ) : session ? (
              <div className="mt-8 space-y-8">
                <p className="text-center font-body text-lg text-dark-gray">
                  {t("preview.colorSurprise")}
                </p>
                <div className="flex justify-center">
                  <StyleSelector
                    selectedStyle={selectedStyle}
                    onStyleChange={setSelectedStyle}
                  />
                </div>
                <div className="flex justify-center">
                  <Button
                    variant="contained"
                    color="primary"
                    disabled={isSubmitting}
                    onClick={handleContinueToCart}
                  >
                    {isSubmitting
                      ? t("preview.addingToCart")
                      : t("preview.continueToCart")}
                  </Button>
                </div>
              </div>
            ) : null}

            <input
              ref={replaceInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleReplaceFile}
            />
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
