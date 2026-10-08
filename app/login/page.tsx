"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAccount } from "@/lib/auth";

function nextPath(setupDone: boolean) {
  const n = new URLSearchParams(window.location.search).get("next");
  // Only follow same-site paths.
  if (n && n.startsWith("/") && !n.startsWith("//")) return n;
  return setupDone ? "/account" : "/setup";
}

export default function Login() {
  const { ready, user, data, login } = useAccount();
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (ready && user) router.replace(nextPath(data.profile.setupDone));
  }, [ready, user, data.profile.setupDone, router]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!login(username, password)) setError("That username and password don't match.");
  };

  return (
    <main className="wrap auth">
      <h1>Log in</h1>
      <p className="muted">Get matches made for your major, strengths, and grades, and estimate your college chances.</p>
      <form onSubmit={submit} className="form-panel">
        <label className="field">
          <span>Username</span>
          <input autoComplete="username" value={username} onChange={(e) => setUsername(e.target.value)} required />
        </label>
        <label className="field">
          <span>Password</span>
          <input type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </label>
        {error && <p className="error" role="alert">{error}</p>}
        <button type="submit" className="btn">Log in</button>
      </form>
      <p className="note">
        Accounts are in testing. Use the demo account: username <strong>1</strong>, password <strong>1</strong>.
        Your saved data stays in this browser.
      </p>
    </main>
  );
}
