"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  ["/account", "Overview"],
  ["/setup", "Edit profile"],
  ["/chances", "Chances"],
  ["/account/settings", "Settings"],
] as const;

export default function AccountTabs() {
  const path = usePathname();
  return (
    <nav className="tabs" aria-label="Account">
      {TABS.map(([href, label]) => (
        <Link key={href} href={href} aria-current={path === href ? "page" : undefined}>{label}</Link>
      ))}
    </nav>
  );
}
