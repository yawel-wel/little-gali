import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { BlogArticle } from "@/components/blog-article";
import {
  absoluteUrl,
  getAllPosts,
  getPostBySlug,
  SITE_ORIGIN,
} from "@/lib/blog/posts";

type BlogArticlePageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: BlogArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) {
    return {};
  }

  const url = absoluteUrl(`/blog/${post.slug}`);
  const imageUrl = absoluteUrl(post.image.src);

  return {
    title: `${post.he.title} | Little Gali`,
    description: post.he.excerpt,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: post.he.title,
      description: post.he.excerpt,
      url,
      siteName: "Little Gali",
      locale: "he_IL",
      type: "article",
      publishedTime: post.publishedAt,
      images: [
        {
          url: imageUrl,
          alt: post.image.alt.he,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: post.he.title,
      description: post.he.excerpt,
      images: [imageUrl],
    },
  };
}

export default async function BlogArticlePage({ params }: BlogArticlePageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) {
    notFound();
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.he.title,
    description: post.he.excerpt,
    image: absoluteUrl(post.image.src),
    datePublished: post.publishedAt,
    mainEntityOfPage: absoluteUrl(`/blog/${post.slug}`),
    publisher: {
      "@type": "Organization",
      name: "Little Gali",
      url: SITE_ORIGIN,
    },
    author: {
      "@type": "Person",
      name: "יעל רומשקנו",
      image: absoluteUrl("/about-us.jpg"),
    },
  };

  return (
    <div
      className="min-h-screen overflow-x-hidden"
      style={{ backgroundColor: "#F3EEE8" }}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Header />
      <main
        id="main-content"
        className="flex-1"
        style={{ paddingTop: "calc(72px + var(--banner-height, 0px))" }}
      >
        <BlogArticle post={post} />
      </main>
      <Footer />
    </div>
  );
}
