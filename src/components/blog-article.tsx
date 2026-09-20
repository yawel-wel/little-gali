"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { BlogShareButton } from "@/components/blog-share-button";
import { BlogAuthor } from "@/components/blog-author";
import { useLanguage } from "@/lib/LanguageContext";
import {
  type BlogPost,
  absoluteUrl,
  formatBlogDate,
  getPostCopy,
} from "@/lib/blog/posts";

const easeOwlet = [0.16, 1, 0.3, 1];

function BlogRichText({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((part, index) =>
        part.startsWith("**") && part.endsWith("**") ? (
          <strong key={index} className="font-body-bold">
            {part.slice(2, -2)}
          </strong>
        ) : (
          <span key={index}>{part}</span>
        )
      )}
    </>
  );
}

type BlogArticleProps = {
  post: BlogPost;
};

export function BlogArticle({ post }: BlogArticleProps) {
  const prefersReducedMotion = useReducedMotion();
  const { t, locale } = useLanguage();
  const copy = getPostCopy(post, locale);
  const isHe = locale === "he";
  const dateLabel = formatBlogDate(post.publishedAt, locale);
  const shareUrl = absoluteUrl(`/blog/${post.slug}`);

  return (
    <motion.article
      className="relative pb-16 pt-4 lg:pb-24 lg:pt-6"
      style={{ backgroundColor: "#F3EEE8" }}
      initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
      animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
      transition={{ duration: 1.1, ease: easeOwlet }}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <nav
            aria-label={t("blog.breadcrumbAria")}
            className="mb-6 py-2 text-sm font-body text-medium-gray"
          >
            <ol
              dir={isHe ? "rtl" : "ltr"}
              className="flex flex-wrap items-center gap-1.5"
            >
              <li>
                <Link href="/" className="transition-colors hover:text-dark-gray">
                  {t("blog.breadcrumbHome")}
                </Link>
              </li>
              <li aria-hidden="true" className="text-light-gray">
                <span dir="ltr">{isHe ? "‹" : "›"}</span>
              </li>
              <li>
                <Link
                  href="/blog"
                  className="transition-colors hover:text-dark-gray"
                >
                  {t("blog.breadcrumbBlog")}
                </Link>
              </li>
              <li aria-hidden="true" className="text-light-gray">
                <span dir="ltr">{isHe ? "‹" : "›"}</span>
              </li>
              <li>
                <span className="text-dark-gray">{copy.title}</span>
              </li>
            </ol>
          </nav>

          <h1 className="mb-4 font-heading text-3xl leading-tight text-dark-gray lg:text-5xl">
            {copy.title}
          </h1>
          <div className="mb-8">
            <BlogAuthor dateLabel={dateLabel} />
          </div>

          <div className="relative mb-10 aspect-[16/10] w-full overflow-hidden rounded-2xl bg-[#E8E0D8]">
            <Image
              src={post.image.src}
              alt={post.image.alt[locale]}
              fill
              priority
              sizes="(min-width: 768px) 768px, 100vw"
              className="object-cover"
            />
          </div>

          <div className="font-body text-base leading-relaxed text-dark-gray sm:text-lg">
            {copy.body.map((block, index) =>
              block.type === "heading" ? (
                <h2
                  key={`${block.type}-${index}`}
                  className="mt-10 mb-4 font-heading text-2xl leading-snug text-dark-gray first:mt-0 sm:text-3xl"
                >
                  <BlogRichText text={block.text} />
                </h2>
              ) : block.type === "subheading" ? (
                <h3
                  key={`${block.type}-${index}`}
                  className="mt-8 mb-3 font-heading text-xl leading-snug text-dark-gray sm:text-2xl"
                >
                  <BlogRichText text={block.text} />
                </h3>
              ) : block.type === "image" ? (
                <figure
                  key={`${block.type}-${index}`}
                  className="my-8 flex flex-col items-center"
                >
                  <Image
                    src={block.src}
                    alt={block.alt}
                    width={block.width}
                    height={block.height}
                    sizes="(min-width: 640px) 16rem, 60vw"
                    className="h-auto w-full max-w-[16rem] object-contain"
                  />
                  <figcaption className="mt-2 max-w-xs text-center font-body text-sm text-medium-gray">
                    {block.caption}
                  </figcaption>
                </figure>
              ) : (
                <p key={`${block.type}-${index}`} className="mb-5 last:mb-0">
                  <BlogRichText text={block.text} />
                </p>
              )
            )}
          </div>

          <div className="mt-10">
            <BlogShareButton
              title={copy.title}
              text={copy.excerpt}
              url={shareUrl}
            />
          </div>

          <div className="mt-10">
            <h2 className="mb-3 font-heading text-lg text-dark-gray">
              {t("blog.tags")}
            </h2>
            <ul className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <li
                  key={tag.en}
                  className="rounded-full border border-dark-gray/30 px-4 py-1.5 font-body text-sm text-dark-gray"
                >
                  {tag[locale]}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </motion.article>
  );
}
