"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Title } from "@/components/title";
import { BlogCard } from "@/components/blog-card";
import { useLanguage } from "@/lib/LanguageContext";
import { formatBlogDate, getAllPosts, getPostCopy } from "@/lib/blog/posts";

const easeOwlet = [0.16, 1, 0.3, 1];

export function BlogIndex() {
  const prefersReducedMotion = useReducedMotion();
  const { t, locale } = useLanguage();
  const posts = getAllPosts();

  return (
    <motion.section
      className="relative pb-16 pt-8 lg:pb-24 lg:pt-10"
      style={{ backgroundColor: "#F3EEE8" }}
      initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
      whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
      transition={{ duration: 1.1, ease: easeOwlet }}
      viewport={{ once: true, amount: 0.15 }}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center md:mb-14">
          <Title
            as="h1"
            highlightText={t("blog.titleHighlight")}
            size="lg"
            className="mb-4"
          >
            {t("blog.title")}
          </Title>
          <p className="mx-auto max-w-2xl font-body text-base leading-relaxed text-medium-gray">
            {t("blog.subtitle")}
          </p>
        </div>

        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-10 md:grid-cols-2 md:gap-x-10 md:gap-y-14">
          {posts.map((post) => {
            const copy = getPostCopy(post, locale);
            return (
              <BlogCard
                key={post.slug}
                href={`/blog/${post.slug}`}
                imageSrc={post.image.src}
                imageAlt={post.image.alt[locale]}
                title={copy.title}
                dateLabel={formatBlogDate(post.publishedAt, locale)}
                excerpt={copy.excerpt}
              />
            );
          })}
        </div>
      </div>
    </motion.section>
  );
}
