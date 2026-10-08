import type { Metadata } from "next";
import Link from "next/link";
import { IBM_Plex_Sans, Source_Serif_4 } from "next/font/google";
import "./globals.css";

const sans = IBM_Plex_Sans({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-sans" });
const serif = Source_Serif_4({ subsets: ["latin"], weight: ["500", "600"], variable: "--font-serif" });

export const metadata: Metadata = {
  title: { default: "Exctra: extracurriculars that fit you", template: "%s · Exctra" },
  description: "Pick your intended major, your strengths, and how much time you have. Exctra ranks 34 high school extracurriculars for you.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${serif.variable}`}>
      <body>
        <nav className="topbar">
          <Link href="/" className="wordmark">Exctra</Link>
          <Link href="/about">How scoring works</Link>
        </nav>
        {children}
        <footer className="footer">
          <span>Exctra is a free student project. Use it as a starting point, not a final answer.</span>
          <span className="footer-links">
            <Link href="/about">About</Link>
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Terms</Link>
          </span>
        </footer>
      </body>
    </html>
  );
}
