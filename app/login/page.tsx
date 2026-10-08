"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAccount } from "@/lib/auth";

function nextPath() {
  const n = new URLSearchParams(window.location.search).get("next");
  // Only follow same-site paths.
  return n && n.startsWith("/") && !n.startsWith("//") ? n : "/account";
}

export default function Login() {
  const { ready, user, login } = useAccount();
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (ready && user) router.replace(nextPath());
  }, [ready, user, router]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (login(username, password)) router.replace(nextPath());
    else setError("That username and password don't match.");
  };

  return (
    <main className="wrap auth">
      <h1>Log in</h1>
      <p className="muted">Save activities, track what you've joined, and get matches from your profile.</p>
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
