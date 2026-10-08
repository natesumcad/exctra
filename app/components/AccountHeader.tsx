"use client";

import { useAccount } from "@/lib/auth";
import AccountTabs from "./AccountTabs";
import Avatar from "./Avatar";

export default function AccountHeader() {
  const { user, data } = useAccount();
  return (
    <div className="page-head account-head">
      <div className="wrap-inner">
        <div className="account-id">
          <Avatar size={72} />
          <div>
            <p className="eyebrow">Account / @{user}</p>
            <h1>{data.profile.name ? `Hi, ${data.profile.name}` : "Welcome back"}</h1>
            <p className="lede mono">
              {data.profile.activities.length} activities · {data.courses.length} classes · {data.profile.majors.length} majors
            </p>
          </div>
        </div>
        <AccountTabs />
      </div>
    </div>
  );
}
