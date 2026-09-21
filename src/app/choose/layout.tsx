import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "איזה ספרון תרצו ליצור",
};

export default function ChooseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
