import Image from "next/image";
import Link from "next/link";
import { BlogAuthor } from "@/components/blog-author";

type BlogCardProps = {
  href: string;
  imageSrc: string;
  imageAlt: string;
  title: string;
  dateLabel: string;
  excerpt: string;
};

export function BlogCard({
  href,
  imageSrc,
  imageAlt,
  title,
  dateLabel,
  excerpt,
}: BlogCardProps) {
  return (
    <article>
      <Link href={href} className="group block">
        <div className="relative mb-5 aspect-[16/10] w-full overflow-hidden rounded-2xl bg-[#E8E0D8]">
          <Image
            src={imageSrc}
            alt={imageAlt}
            fill
            sizes="(min-width: 768px) 50vw, 100vw"
            className="object-cover transition-opacity duration-200 group-hover:opacity-90"
          />
        </div>
        <h2 className="mb-2 font-heading text-xl text-dark-gray transition-colors duration-200 group-hover:text-primary-orange sm:text-2xl">
          {title}
        </h2>
        <BlogAuthor size="sm" className="mb-3" dateLabel={dateLabel} />
        <p className="line-clamp-2 font-body text-base leading-relaxed text-dark-gray">
          {excerpt}
        </p>
      </Link>
    </article>
  );
}
