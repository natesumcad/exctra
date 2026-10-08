import type { Metadata } from "next";
import RequireLogin from "@/app/components/RequireLogin";

export const metadata: Metadata = { title: "Set up your profile" };

export default function SetupLayout({ children }: { children: React.ReactNode }) {
  return <RequireLogin>{children}</RequireLogin>;
}
