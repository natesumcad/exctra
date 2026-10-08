import type { Metadata } from "next";
import Link from "next/link";
import { IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";
import "./globals.css";
import { AccountProvider } from "@/lib/auth";
import NavAccount from "./components/NavAccount";

const sans = IBM_Plex_Sans({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-sans" });
const mono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: { default: "Exctra: opportunities that fit you", template: "%s · Exctra" },
  description: "Search 1,400+ opportunities and scholarships and rank them by your intended majors, strengths, and grades.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${mono.variable}`}>
      <body>
        <AccountProvider>
          <header className="topbar-wrap">
            <nav className="topbar">
              <Link href="/" className="wordmark"><span className="mark" aria-hidden="true" />exctra</Link>
              <span className="nav-links">
                <Link href="/" className="hide-sm">Search</Link>
                <Link href="/chances">Chances</Link>
                <Link href="/about" className="hide-sm">How grades work</Link>
                <NavAccount />
              </span>
            </nav>
          </header>
          {children}
          <footer className="footer">
            <span>Exctra is a free student project. Use it as a starting point, not a final answer.</span>
            <span className="footer-links">
              <Link href="/about">About</Link>
              <Link href="/privacy">Privacy</Link>
              <Link href="/terms">Terms</Link>
            </span>
          </footer>
        </AccountProvider>
      </body>
    </html>
  );
}
