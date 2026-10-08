import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Exctra – Find your best extracurriculars",
  description: "Get extracurricular recommendations based on your intended major and strengths.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
