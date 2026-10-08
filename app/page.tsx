"use client";

import { useState } from "react";
import { MAJORS, STRENGTHS, type Commitment, type Major, type Strength } from "../lib/data";
import { recommend, type Result } from "../lib/recommend";

const COMMITMENTS: { value: Commitment; label: string }[] = [
  { value: "low", label: "A few hours / week" },
  { value: "medium", label: "Several hours / week" },
  { value: "high", label: "It's my main thing" },
];

export default function Home() {
  const [major, setMajor] = useState<Major | "">("");
  const [strengths, setStrengths] = useState<Strength[]>([]);
  const [commitment, setCommitment] = useState<Commitment>("medium");
  const [results, setResults] = useState<Result[] | null>(null);

  const toggle = (s: Strength) =>
    setStrengths((cur) => (cur.includes(s) ? cur.filter((x) => x !== s) : [...cur, s]));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!major) return;
    setResults(recommend({ major, strengths, commitment }));
  };

  return (
    <main>
      <header>
        <h1>Exctra</h1>
        <p>Find the extracurriculars that fit your major and strengths.</p>
      </header>

      <form onSubmit={submit} className="card">
        <label className="field">
          <span>1. What do you want to major in?</span>
          <select value={major} onChange={(e) => setMajor(e.target.value as Major)} required>
            <option value="" disabled>Choose a major…</option>
            {MAJORS.map((m) => <option key={m}>{m}</option>)}
          </select>
        </label>

        <fieldset className="field">
          <legend>2. What are your strengths? (pick any)</legend>
          <div className="chips">
            {STRENGTHS.map((s) => (
              <button type="button" key={s} className={strengths.includes(s) ? "chip on" : "chip"}
                aria-pressed={strengths.includes(s)} onClick={() => toggle(s)}>
                {s}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset className="field">
          <legend>3. How much time can you commit?</legend>
          <div className="chips">
            {COMMITMENTS.map((c) => (
              <button type="button" key={c.value} className={commitment === c.value ? "chip on" : "chip"}
                aria-pressed={commitment === c.value} onClick={() => setCommitment(c.value)}>
                {c.label}
              </button>
            ))}
          </div>
        </fieldset>

        <button type="submit" className="primary" disabled={!major}>Show my ECs</button>
      </form>

      {results && (
        <section className="results">
          <h2>Your top matches</h2>
          {results.length === 0 && <p>No strong matches — try picking a few more strengths.</p>}
          {results.map(({ ec, reasons }, i) => (
            <article key={ec.name} className="card result">
              <div className="rank">{i + 1}</div>
              <div>
                <h3>{ec.name} <span className={`tag ${ec.commitment}`}>{ec.commitment} commitment</span></h3>
                <p>{ec.description}</p>
                <ul className="reasons">{reasons.map((r) => <li key={r}>{r}</li>)}</ul>
                <p className="tip">💡 {ec.tip}</p>
              </div>
            </article>
          ))}
        </section>
      )}
    </main>
  );
}
