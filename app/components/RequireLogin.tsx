"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAccount } from "@/lib/auth";

/* Shows a placeholder until the session is known, then sends logged-out visitors to /login. */
export default function RequireLogin({ children }: { children: React.ReactNode }) {
  const { ready, user } = useAccount();
  const router = useRouter();
  useEffect(() => {
    if (ready && !user) router.replace(`/login?next=${encodeURIComponent(window.location.pathname)}`);
  }, [ready, user, router]);
  if (!ready || !user)
    return (
      <div className="wrap-inner sk-page" aria-hidden="true">
        <div className="sk" style={{ width: "35%", height: 28 }} />
        <div className="sk" style={{ width: "60%" }} />
        <div className="sk" style={{ width: "50%" }} />
      </div>
    );
  return <>{children}</>;
}
