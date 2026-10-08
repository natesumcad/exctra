"use client";

import Link from "next/link";
import { useAccount } from "@/lib/auth";
import Avatar from "./Avatar";

export default function NavAccount() {
  const { ready, user, data } = useAccount();
  if (!ready) return <span className="nav-placeholder" aria-hidden="true" />;
  if (!user) return <Link href="/login" className="nav-cta">Log in</Link>;
  return (
    <Link href="/account" className="nav-avatar" aria-label={`My account${data.profile.name ? ` (${data.profile.name})` : ""}`}>
      <Avatar size={34} />
    </Link>
  );
}
