import type { Metadata } from "next";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { BlogIndex } from "@/components/blog-index";
import { BLOG_LISTING_SEO, SITE_ORIGIN } from "@/lib/blog/posts";

const listingUrl = `${SITE_ORIGIN}/blog`;
const listingImage = `${SITE_ORIGIN}/social-share.JPG`;

export const metadata: Metadata = {
  title: `${BLOG_LISTING_SEO.title} | Little Gali`,
  description: BLOG_LISTING_SEO.description,
  alternates: {
    canonical: listingUrl,
  },
  openGraph: {
    title: BLOG_LISTING_SEO.title,
    description: BLOG_LISTING_SEO.description,
    url: listingUrl,
    siteName: "Little Gali",
    locale: "he_IL",
    type: "website",
    images: [
      {
        url: listingImage,
        width: 6000,
        height: 4000,
        alt: "Little Gali",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: BLOG_LISTING_SEO.title,
    description: BLOG_LISTING_SEO.description,
    images: [listingImage],
  },
};

export default function BlogPage() {
  return (
    <div
      className="min-h-screen overflow-x-hidden"
      style={{ backgroundColor: "#F3EEE8" }}
    >
      <Header />
      <main
        id="main-content"
        className="flex-1"
        style={{ paddingTop: "calc(72px + var(--banner-height, 0px))" }}
      >
        <BlogIndex />
      </main>
      <Footer />
    </div>
  );
}
