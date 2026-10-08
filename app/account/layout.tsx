import RequireLogin from "@/app/components/RequireLogin";
import AccountHeader from "@/app/components/AccountHeader";

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireLogin>
      <AccountHeader />
      {children}
    </RequireLogin>
  );
}
