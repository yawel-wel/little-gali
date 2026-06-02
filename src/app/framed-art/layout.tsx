import { redirect } from "next/navigation";
import { isFramedArtEnabled } from "@/lib/feature-flags";

export default function FramedArtLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!isFramedArtEnabled()) {
    redirect("/");
  }
  return children;
}
