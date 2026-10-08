"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { LAST_SEARCH_KEY } from "@/lib/recommend";

/* Returns to the last search the visitor ran, filters intact. */
export default function BackLink() {
  const [href, setHref] = useState<string | null>(null);
  useEffect(() => {
    try {
      const q = sessionStorage.getItem(LAST_SEARCH_KEY);
      if (q !== null) setHref(q ? `/explore?${q}` : "/explore");
    } catch {}
  }, []);
  return href ? <Link href={href}>Back to results</Link> : <Link href="/">Home</Link>;
}
