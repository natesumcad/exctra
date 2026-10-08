"use client";

import { useAccount } from "@/lib/auth";

/* Round profile photo, or the first letter of the name when there's no photo. */
export default function Avatar({ size = 32 }: { size?: number }) {
  const { user, data } = useAccount();
  const initial = (data.profile.name || user || "?").trim().charAt(0).toUpperCase();
  return (
    <span className="avatar" style={{ width: size, height: size, fontSize: size * 0.42 }} aria-hidden="true">
      {data.avatar ? <img src={data.avatar} alt="" width={size} height={size} /> : initial}
    </span>
  );
}
