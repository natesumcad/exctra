"use client";

import { useRouter } from "next/navigation";
import { useAccount } from "@/lib/auth";

export default function SaveButton({ slug, name }: { slug: string; name: string }) {
  const { ready, user, isSaved, toggleSaved } = useAccount();
  const router = useRouter();
  if (!ready) return null;
  const saved = user ? isSaved(slug) : false;
  return (
    <button
      type="button"
      className={saved ? "save on" : "save"}
      aria-pressed={saved}
      aria-label={saved ? `Remove ${name} from your list` : `Save ${name} to your list`}
      onClick={() => (user ? toggleSaved(slug) : router.push(`/login?next=${encodeURIComponent(window.location.pathname + window.location.search)}`))}
    >
      {saved ? "Saved" : "Save"}
    </button>
  );
}
