import type { Metadata } from "next";
import RequireLogin from "@/app/components/RequireLogin";

export const metadata: Metadata = { title: "College chances" };

export default function ChancesLayout({ children }: { children: React.ReactNode }) {
  return <RequireLogin>{children}</RequireLogin>;
}
