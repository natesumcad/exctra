"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { LAST_SEARCH_KEY } from "@/lib/recommend";

/* Returns to the last search the visitor ran, filters intact. */
export default function BackLink() {
  const [href, setHref] = useState("/");
  useEffect(() => {
    try {
      const q = sessionStorage.getItem(LAST_SEARCH_KEY);
      if (q) setHref(`/?${q}`);
    } catch {}
  }, []);
  return <Link href={href}>Back to results</Link>;
}
