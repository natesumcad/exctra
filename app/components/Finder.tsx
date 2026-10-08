"use client";

import { useEffect, useState } from "react";
import { MAJORS, STRENGTHS, type Commitment, type Major, type Strength } from "@/lib/data";
import { fromQuery, recommend, toQuery, type Answers } from "@/lib/recommend";

const TIME: { value: Commitment; label: string; hint: string }[] = [
  { value: "low", label: "Light", hint: "1 to 3 hrs a week" },
  { value: "medium", label: "Steady", hint: "4 to 8 hrs a week" },
  { value: "high", label: "All in", hint: "9+ hrs a week" },
];
const timeLabel = (c: Commitment) => TIME.find((t) => t.value === c)!.hint;
const MAX_SCORE = 5 + 4 * 2;

export default function Finder() {
  const [ready, setReady] = useState(false);
  const [major, setMajor] = useState<Major | "">("");
  const [strengths, setStrengths] = useState<Strength[]>([]);
  const [commitment, setCommitment] = useState<Commitment>("medium");
  const [submitted, setSubmitted] = useState<Answers | null>(null);
  const [copied, setCopied] = useState(false);

  // Restore answers from a shared link.
  useEffect(() => {
    const a = fromQuery(window.location.search);
    if (a) {
      setMajor(a.major);
      setStrengths(a.strengths);
      setCommitment(a.commitment);
      setSubmitted(a);
    }
    setReady(true);
  }, []);

  const toggle = (s: Strength) =>
    setStrengths((cur) => (cur.includes(s) ? cur.filter((x) => x !== s) : [...cur, s]));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!major) return;
    const a = { major, strengths, commitment };
    setSubmitted(a);
    setCopied(false);
    window.history.replaceState(null, "", `?${toQuery(a)}`);
    if (window.matchMedia("(max-width: 860px)").matches)
      document.getElementById("results")?.scrollIntoView({ behavior: "smooth" });
  };

  const reset = () => {
    setMajor("");
    setStrengths([]);
    setCommitment("medium");
    setSubmitted(null);
    window.history.replaceState(null, "", window.location.pathname);
  };

  const share = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
    } catch {
      window.prompt("Copy this link:", window.location.href);
    }
  };

  const results = submitted ? recommend(submitted) : [];

  return (
    <div className="finder">
      <form onSubmit={submit} className="panel">
        <div className="q">
          <label htmlFor="major" className="q-title"><span className="q-num">01</span>Intended major</label>
          <select id="major" value={major} onChange={(e) => setMajor(e.target.value as Major)} required>
            <option value="" disabled>Choose one</option>
            {MAJORS.map((m) => <option key={m}>{m}</option>)}
          </select>
        </div>

        <fieldset className="q">
          <legend className="q-title"><span className="q-num">02</span>Strengths <span className="muted">pick up to 4</span></legend>
          <div className="options">
            {STRENGTHS.map((s) => {
              const on = strengths.includes(s);
              return (
                <button type="button" key={s} className="opt" aria-pressed={on}
                  disabled={!on && strengths.length >= 4} onClick={() => toggle(s)}>
                  {s}
                </button>
              );
            })}
          </div>
        </fieldset>

        <fieldset className="q">
          <legend className="q-title"><span className="q-num">03</span>Time you can give</legend>
          <div className="seg">
            {TIME.map((t) => (
              <button type="button" key={t.value} aria-pressed={commitment === t.value}
                onClick={() => setCommitment(t.value)}>
                <strong>{t.label}</strong>
                <span>{t.hint}</span>
              </button>
            ))}
          </div>
        </fieldset>

        <div className="actions">
          <button type="submit" className="btn" disabled={!major}>Rank activities</button>
          {submitted && <button type="button" className="link" onClick={reset}>Start over</button>}
        </div>
      </form>

      <section id="results" className="results" aria-live="polite">
        {!ready ? (
          <Skeleton />
        ) : !submitted ? (
          <div className="empty">
            <p className="empty-title">Your ranked list shows up here.</p>
            <p>Each result explains which of your answers it matched, how many hours it usually takes, and one concrete way to start this month.</p>
          </div>
        ) : (
          <>
            <div className="results-head">
              <h2>{results.length ? `Top ${results.length} for ${submitted.major}` : "No strong matches"}</h2>
              {results.length > 0 && (
                <button type="button" className="link" onClick={share}>{copied ? "Link copied" : "Copy share link"}</button>
              )}
            </div>
            {results.length === 0 && <p>Try choosing more strengths or a bigger time budget.</p>}
            <ol className="list">
              {results.map((r, i) => (
                <li key={r.ec.name} className="item">
                  <span className="rank">{i + 1}</span>
                  <div className="item-body">
                    <h3>{r.ec.name}</h3>
                    <p className="desc">{r.ec.description}</p>
                    <div className="meter" aria-label={`Match score ${r.score} of ${MAX_SCORE}`}>
                      <span style={{ width: `${Math.min(100, (r.score / MAX_SCORE) * 100)}%` }} />
                    </div>
                    <dl className="facts">
                      <dt>Matched</dt>
                      <dd>
                        {[r.majorFit && submitted.major, ...r.matched].filter(Boolean).join(", ") || "General fit"}
                      </dd>
                      <dt>Time</dt>
                      <dd>
                        {timeLabel(r.ec.commitment)}
                        {r.overTime > 0 && <span className="warn"> (more than you planned)</span>}
                      </dd>
                      <dt>Start</dt>
                      <dd>{r.ec.tip}</dd>
                    </dl>
                  </div>
                </li>
              ))}
            </ol>
          </>
        )}
      </section>
    </div>
  );
}

function Skeleton() {
  return (
    <div aria-hidden="true">
      {[0, 1, 2].map((i) => (
        <div key={i} className="sk-row">
          <div className="sk" style={{ width: "45%", height: 18 }} />
          <div className="sk" style={{ width: "80%" }} />
          <div className="sk" style={{ width: "60%" }} />
        </div>
      ))}
    </div>
  );
}
