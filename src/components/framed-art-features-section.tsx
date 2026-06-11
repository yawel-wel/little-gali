"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEye,
  faMagnet,
  faPalette,
  type IconDefinition,
} from "@fortawesome/free-solid-svg-icons";
import { motion } from "framer-motion";
import { useLanguage } from "@/lib/LanguageContext";
import { useScrollReveal } from "@/lib/use-scroll-reveal";

const easeOwlet = [0.16, 1, 0.3, 1] as const;

function FeatureIcon({ icon }: { icon: IconDefinition }) {
  return (
    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-warm-cream">
      <FontAwesomeIcon icon={icon} className="h-7 w-7 text-primary-orange opacity-80" />
    </div>
  );
}

const FEATURES = [
  {
    icon: faMagnet,
    titleKey: "home.framedArt.features.noDrill.title" as const,
    subtitleKey: "home.framedArt.features.noDrill.subtitle" as const,
  },
  {
    icon: faPalette,
    titleKey: "home.framedArt.features.style.title" as const,
    subtitleKey: "home.framedArt.features.style.subtitle" as const,
  },
  {
    icon: faEye,
    titleKey: "home.framedArt.features.preview.title" as const,
    subtitleKey: "home.framedArt.features.preview.subtitle" as const,
  },
] as const;

function FeatureColumn({
  icon,
  title,
  subtitle,
  locale,
}: {
  icon: IconDefinition;
  title: string;
  subtitle: string;
  locale: string;
}) {
  const isHe = locale === "he";

  return (
    <div
      className={`flex items-start gap-4 sm:gap-5 ${
        isHe ? "flex-row" : "flex-row-reverse"
      }`}
    >
      <FeatureIcon icon={icon} />
      <div className={`min-w-0 flex-1 space-y-1.5 ${isHe ? "text-right" : "text-left"}`}>
        <h3 className="font-heading text-base font-bold leading-snug text-dark-gray sm:text-lg">
          {title}
        </h3>
        <p className="font-body text-sm leading-relaxed text-medium-gray sm:text-[15px]">
          {subtitle}
        </p>
      </div>
    </div>
  );
}

export function FramedArtFeaturesSection() {
  const { t, locale } = useLanguage();
  const reveal = useScrollReveal(easeOwlet);

  return (
    <motion.section
      id="framed-art-features"
      aria-label={t("home.framedArt.features.ariaLabel")}
      className="bg-[#FAF7F4] py-10 lg:py-12"
      {...reveal.section}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="mx-auto grid max-w-6xl grid-cols-1 gap-10 md:grid-cols-3 md:gap-8 lg:gap-12"
          dir={locale === "he" ? "rtl" : "ltr"}
          {...reveal.staggerContainer()}
        >
          {FEATURES.map((feature) => (
            <motion.div
              key={feature.titleKey}
              variants={{
                hidden: { opacity: 0, y: 20 },
                show: {
                  opacity: 1,
                  y: 0,
                  transition: { duration: 0.5, ease: easeOwlet },
                },
              }}
            >
              <FeatureColumn
                icon={feature.icon}
                title={t(feature.titleKey)}
                subtitle={t(feature.subtitleKey)}
                locale={locale}
              />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.section>
  );
}
