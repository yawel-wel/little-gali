"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { AnimatePresence, MotionConfig, motion, type Variants } from "framer-motion";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/language-switcher";
import { useLanguage } from "@/lib/LanguageContext";

export type HeaderMenuItem = {
  nameKey: string;
  name: string;
  href: string;
  isAnchor: boolean;
  active: boolean;
};

type HeaderMenuProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: HeaderMenuItem[];
  onItemClick: (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string,
    isAnchor: boolean
  ) => void;
};

// Motion modelled on GreenSock's "Timeline .clear() and rebuild" menu demo:
// a floating card slides in with a single soft overshoot
// (GSAP back.out), links fade in with a short stagger (expo.out), and the
// close icon morphs from hamburger bars into an X. Closing is quick, no bounce.
const easeBackOut: [number, number, number, number] = [0.34, 1.56, 0.64, 1];
const easeExpoOut: [number, number, number, number] = [0.16, 1, 0.3, 1];
const easeIn: [number, number, number, number] = [0.4, 0, 1, 1];

const containerVariants: Variants = {
  open: { transition: { staggerChildren: 0.15 } },
  closed: { transition: { staggerChildren: 0.05, staggerDirection: -1 } },
};

const cardVariants: Variants = {
  closed: (offX: string) => ({
    x: offX,
    transition: { duration: 0.3, ease: easeIn },
  }),
  open: {
    x: 0,
    transition: {
      duration: 0.6,
      ease: easeBackOut,
      delayChildren: 0.1,
      staggerChildren: 0.03,
    },
  },
};

const itemVariants: Variants = {
  closed: (itemX: number) => ({
    opacity: 0,
    x: itemX,
    transition: { duration: 0.15 },
  }),
  open: {
    opacity: 1,
    x: 0,
    transition: { duration: 1.2, ease: easeExpoOut },
  },
};

const barTransition = { duration: 0.35, ease: easeBackOut, delay: 0.06 };

export function HeaderMenu({ open, onOpenChange, items, onItemClick }: HeaderMenuProps) {
  const { t, locale } = useLanguage();
  // The menu opens on the reading-start side: right in Hebrew, left in English.
  const fromRight = locale === "he";
  const offX = fromRight ? "110%" : "-110%";
  const itemX = fromRight ? -20 : 20;

  return (
    <MotionConfig reducedMotion="user">
      <Dialog.Root open={open} onOpenChange={onOpenChange}>
        <Dialog.Trigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="text-dark-gray hover:bg-[#D7D8DA] hover:text-dark-gray cursor-pointer rounded-full transition-all duration-200"
          >
            <Menu className="h-6 w-6" />
            <span className="sr-only">{t("accessibility.openMenu")}</span>
          </Button>
        </Dialog.Trigger>

        <AnimatePresence>
          {open && (
            <Dialog.Portal forceMount>
              <Dialog.Overlay asChild forceMount>
                <motion.div
                  className="fixed inset-0 z-50 bg-black/50"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1, transition: { duration: 0.4, ease: "easeOut" } }}
                  exit={{ opacity: 0, transition: { duration: 0.3, ease: "easeIn" } }}
                />
              </Dialog.Overlay>

              <Dialog.Content
                asChild
                forceMount
                aria-label={t("nav.menuAriaLabel")}
                aria-describedby={undefined}
              >
                <motion.div
                  className="fixed inset-0 z-50 flex flex-col items-start outline-none"
                  variants={containerVariants}
                  initial="closed"
                  animate="open"
                  exit="closed"
                  // Clicking the empty space around the cards closes the menu
                  onClick={(e) => {
                    if (e.target === e.currentTarget) onOpenChange(false);
                  }}
                >
                  <Dialog.Title className="sr-only">{t("nav.menuAriaLabel")}</Dialog.Title>

                  {/* Menu card */}
                  <motion.nav
                    custom={offX}
                    variants={cardVariants}
                    aria-label={t("nav.mainNavAriaLabel")}
                    // Extends 40px past the screen edge (-ms-10) so the bounce never opens a gap there
                    className="relative -ms-10 flex h-full w-[calc(60vw+40px)] min-w-[260px] max-w-[380px] flex-col overflow-y-auto rounded-e-2xl bg-background pb-6 pe-6 ps-16 pt-[calc(var(--banner-height,0px)+64px)] shadow-lg"
                  >
                    <Dialog.Close asChild>
                      <button
                        type="button"
                        // Offset by the banner height so the X lands where the hamburger is
                        className="absolute top-[calc(var(--banner-height,0px)+16px)] start-[52px] flex h-10 w-10 cursor-pointer items-center justify-center rounded-full text-dark-gray transition-colors duration-200 hover:bg-[#D7D8DA]"
                      >
                        <svg width="24" height="24" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                          <motion.line
                            stroke="currentColor"
                            strokeWidth="1.6"
                            strokeLinecap="round"
                            initial={{ x1: 3, y1: 6, x2: 17, y2: 6 }}
                            animate={{ x1: 5, y1: 5, x2: 15, y2: 15, transition: barTransition }}
                          />
                          <motion.line
                            x1={3}
                            y1={10}
                            x2={17}
                            y2={10}
                            stroke="currentColor"
                            strokeWidth="1.6"
                            strokeLinecap="round"
                            initial={{ opacity: 1 }}
                            animate={{ opacity: 0, transition: { duration: 0.15, delay: 0.06 } }}
                          />
                          <motion.line
                            stroke="currentColor"
                            strokeWidth="1.6"
                            strokeLinecap="round"
                            initial={{ x1: 3, y1: 14, x2: 17, y2: 14 }}
                            animate={{ x1: 15, y1: 5, x2: 5, y2: 15, transition: barTransition }}
                          />
                        </svg>
                        <span className="sr-only">{t("accessibility.close")}</span>
                      </button>
                    </Dialog.Close>

                    <div className="space-y-3 ps-2">
                      {items.map((item) => (
                        <motion.a
                          key={item.nameKey}
                          custom={itemX}
                          variants={itemVariants}
                          href={item.href}
                          onClick={(e) => {
                            onOpenChange(false);
                            onItemClick(e, item.href, item.isAnchor);
                          }}
                          className={`block cursor-pointer text-lg font-body-bold transition-colors duration-200 ${
                            item.active
                              ? "text-primary-orange"
                              : "text-dark-gray hover:text-primary-orange"
                          }`}
                          aria-current={item.active ? "page" : undefined}
                        >
                          {item.name}
                        </motion.a>
                      ))}
                      <motion.div custom={itemX} variants={itemVariants} className="pt-4">
                        <LanguageSwitcher
                          variant="mobile"
                          onLanguageChange={() => onOpenChange(false)}
                        />
                      </motion.div>
                    </div>
                  </motion.nav>
                </motion.div>
              </Dialog.Content>
            </Dialog.Portal>
          )}
        </AnimatePresence>
      </Dialog.Root>
    </MotionConfig>
  );
}
