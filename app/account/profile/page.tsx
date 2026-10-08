"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { HOURS, MAJORS, type Commitment } from "@/lib/data";
import { useAccount, type Profile } from "@/lib/auth";

const toggleIn = <T,>(list: T[], x: T) => (list.includes(x) ? list.filter((y) => y !== x) : [...list, x]);
const TIMES: (Commitment | "any")[] = ["any", "low", "medium", "high"];

export default function ProfilePage() {
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
    <main className="wrap-inner account-body">
      <form onSubmit={submit}>
        <section className="panel-section">
          <div className="section-label">About you</div>
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
        </section>

        <section className="panel-section">
          <div className="section-label">Intended majors</div>
          <p className="muted">Select all that apply.</p>
          <div className="check-cols three">
            {MAJORS.map((m) => (
              <label key={m} className="check">
                <input type="checkbox" checked={p.majors.includes(m)} onChange={() => set({ majors: toggleIn(p.majors, m) })} />
                <span>{m}</span>
              </label>
            ))}
          </div>
        </section>

        <section className="panel-section">
          <div className="section-label">Time per week</div>
          <div className="seg">
            {TIMES.map((t) => (
              <button type="button" key={t} aria-pressed={p.time === t} onClick={() => set({ time: t })}>
                {t === "any" ? "Any amount" : HOURS[t]}
              </button>
            ))}
          </div>
        </section>

        <div className="form-actions">
          <button type="submit" className="btn">Save profile</button>
          <Link href="/account">Cancel</Link>
          <span className="muted small-print">Skills and course grades live on the <Link href="/account/strengths">Strengths</Link> tab.</span>
        </div>
      </form>
    </main>
  );
}
