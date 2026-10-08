"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { HOURS, MAJORS, STRENGTHS, type Commitment } from "@/lib/data";
import { useAccount, type Profile } from "@/lib/auth";
import RequireLogin from "@/app/components/RequireLogin";

const toggleIn = <T,>(list: T[], x: T) => (list.includes(x) ? list.filter((y) => y !== x) : [...list, x]);
const TIMES: (Commitment | "any")[] = ["any", "low", "medium", "high"];

export default function ProfilePage() {
  return (
    <RequireLogin>
      <ProfileForm />
    </RequireLogin>
  );
}

function ProfileForm() {
  const { data, saveProfile } = useAccount();
  const router = useRouter();
  const [p, setP] = useState<Profile>(data.profile);
  const set = (patch: Partial<Profile>) => setP((cur) => ({ ...cur, ...patch }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    saveProfile({ ...p, name: p.name.trim() });
    router.push("/account");
  };

  return (
    <main className="wrap prose">
      <p className="crumb"><Link href="/account">My account</Link> / Profile</p>
      <h1>Edit profile</h1>
      <p className="muted">This shapes the suggestions on your account page. You can change it any time.</p>

      <form onSubmit={submit} className="profile-form">
        <div className="two-col">
          <label className="field">
            <span>First name</span>
            <input value={p.name} maxLength={40} onChange={(e) => set({ name: e.target.value })} />
          </label>
          <label className="field">
            <span>Grade</span>
            <select value={p.grade} onChange={(e) => set({ grade: e.target.value as Profile["grade"] })}>
              <option value="">Not set</option>
              {["9", "10", "11", "12"].map((g) => <option key={g} value={g}>{g}th</option>)}
            </select>
          </label>
        </div>

        <fieldset className="field">
          <legend>Intended majors <span className="muted">select all that apply</span></legend>
          <div className="check-cols">
            {MAJORS.map((m) => (
              <label key={m} className="check">
                <input type="checkbox" checked={p.majors.includes(m)} onChange={() => set({ majors: toggleIn(p.majors, m) })} />
                <span>{m}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className="field">
          <legend>Strengths <span className="muted">select all that apply</span></legend>
          <div className="check-cols">
            {STRENGTHS.map((s) => (
              <label key={s} className="check">
                <input type="checkbox" checked={p.strengths.includes(s)} onChange={() => set({ strengths: toggleIn(p.strengths, s) })} />
                <span>{s}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className="field">
          <legend>Time per week</legend>
          {TIMES.map((t) => (
            <label key={t} className="check">
              <input type="radio" name="time" checked={p.time === t} onChange={() => set({ time: t })} />
              <span>{t === "any" ? "Any amount" : HOURS[t]}</span>
            </label>
          ))}
        </fieldset>

        <div className="form-actions">
          <button type="submit" className="btn">Save profile</button>
          <Link href="/account">Cancel</Link>
        </div>
      </form>
    </main>
  );
}
