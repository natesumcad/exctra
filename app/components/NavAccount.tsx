"use client";

import Link from "next/link";
import { useAccount } from "@/lib/auth";

export default function NavAccount() {
  const { ready, user } = useAccount();
  if (!ready) return <span className="nav-placeholder" aria-hidden="true" />;
  return user ? <Link href="/account">My account</Link> : <Link href="/login">Log in</Link>;
}
