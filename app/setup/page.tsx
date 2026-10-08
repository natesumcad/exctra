"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ECS, HOURS, LETTER_GRADES, LEVELS, MAJORS, STRENGTHS, SUBJECTS, type Commitment, type Level, type Subject } from "@/lib/data";
import { useAccount, type Profile } from "@/lib/auth";
import { AWARD_LEVELS, type AwardLevel } from "@/lib/chances";
import { COURSE_INDEX, inferSubject, unweightedGpa, type CourseGrade } from "@/lib/grades";

const STEPS = ["About you", "Majors", "Strengths", "Time", "Classes", "Scores", "Activities"] as const;
const toggleIn = <T,>(list: T[], x: T) => (list.includes(x) ? list.filter((y) => y !== x) : [...list, x]);
const LEVEL_SHORT: Record<Level, string> = { Regular: "Regular", Honors: "Honors", "AP / IB": "AP / IB", "Dual enrollment": "Dual" };

export default function Setup() {
  const router = useRouter();
  const { data, updateProfile } = useAccount();
  const [step, setStep] = useState(0);

  useEffect(() => {
    const n = Number(new URLSearchParams(window.location.search).get("step"));
    if (n >= 0 && n < STEPS.length) setStep(n);
  }, []);
  useEffect(() => {
    window.history.replaceState(null, "", `?step=${step}`);
    window.scrollTo(0, 0);
  }, [step]);

  const last = step === STEPS.length - 1;
  const finish = () => {
    updateProfile({ setupDone: true });
    router.push("/account");
  };

  return (
    <main className="setup">
      <div className="setup-progress" aria-hidden="true">
        <span style={{ width: `${((step + 1) / STEPS.length) * 100}%` }} />
      </div>
      <div className="setup-inner">
        <div className="setup-top">
          <span className="eyebrow">Step {step + 1} of {STEPS.length} · {STEPS[step]}</span>
          <button type="button" className="link small" onClick={() => (last ? finish() : setStep(step + 1))}>Skip</button>
        </div>

        {step === 0 && <AboutStep />}
        {step === 1 && <MajorsStep />}
        {step === 2 && <StrengthsStep />}
        {step === 3 && <TimeStep />}
        {step === 4 && <ClassesStep />}
        {step === 5 && <ScoresStep />}
        {step === 6 && <ActivitiesStep />}

        <div className="setup-nav">
          {step > 0 ? <button type="button" className="btn-ghost" onClick={() => setStep(step - 1)}>Back</button> : <span />}
          <button type="button" className="btn" onClick={() => (last ? finish() : setStep(step + 1))}>
            {last ? (data.profile.setupDone ? "Save and finish" : "Finish setup") : "Next"}
          </button>
        </div>
        <ol className="setup-steps">
          {STEPS.map((s, i) => (
            <li key={s}>
              <button type="button" aria-current={i === step ? "step" : undefined} onClick={() => setStep(i)}>{s}</button>
            </li>
          ))}
        </ol>
      </div>
    </main>
  );
}

function Tile({ on, onClick, children, sub }: { on: boolean; onClick: () => void; children: React.ReactNode; sub?: string }) {
  return (
    <button type="button" className="tile-option" aria-pressed={on} onClick={onClick}>
      <span>{children}</span>
      {sub && <span className="tile-sub">{sub}</span>}
    </button>
  );
}

function AboutStep() {
  const { data, updateProfile } = useAccount();
  const p = data.profile;
  return (
    <>
      <h1 className="setup-q">Let&apos;s start with you.</h1>
      <label className="field big-field">
        <span>First name</span>
        <input value={p.name} maxLength={40} autoFocus placeholder="Your first name" onChange={(e) => updateProfile({ name: e.target.value })} />
      </label>
      <p className="setup-label">What grade are you in?</p>
      <div className="tile-grid four">
        {(["9", "10", "11", "12"] as const).map((g) => (
          <Tile key={g} on={p.grade === g} onClick={() => updateProfile({ grade: p.grade === g ? "" : g })} sub={{ "9": "Freshman", "10": "Sophomore", "11": "Junior", "12": "Senior" }[g]}>
            {g}th
          </Tile>
        ))}
      </div>
    </>
  );
}

function MajorsStep() {
  const { data, updateProfile } = useAccount();
  const p = data.profile;
  const [q, setQ] = useState("");
  const shown = MAJORS.filter((m) => m.toLowerCase().includes(q.trim().toLowerCase()));
  return (
    <>
      <h1 className="setup-q">What might you study?</h1>
      <p className="setup-help">Tap all that fit. Not sure is fine too.</p>
      <input className="setup-search" placeholder="Type to filter majors" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Filter majors" />
      <div className="tile-grid">
        {shown.map((m) => (
          <Tile key={m} on={p.majors.includes(m)} onClick={() => updateProfile({ majors: toggleIn(p.majors, m) })}>{m}</Tile>
        ))}
      </div>
      {shown.length === 0 && <p className="setup-help">No match. Try a broader word, or pick Undecided.</p>}
    </>
  );
}

function StrengthsStep() {
  const { data, updateProfile } = useAccount();
  const p = data.profile;
  return (
    <>
      <h1 className="setup-q">What are you good at?</h1>
      <p className="setup-help">Tap all that fit.</p>
      <div className="tile-grid">
        {STRENGTHS.map((s) => (
          <Tile key={s} on={p.strengths.includes(s)} onClick={() => updateProfile({ strengths: toggleIn(p.strengths, s) })}>{s}</Tile>
        ))}
      </div>
    </>
  );
}

function TimeStep() {
  const { data, updateProfile } = useAccount();
  const p = data.profile;
  const options: [Profile["time"], string, string][] = [
    ["low", "A little", HOURS.low],
    ["medium", "A steady amount", HOURS.medium],
    ["high", "A lot", HOURS.high],
    ["any", "Show me everything", "No limit"],
  ];
  return (
    <>
      <h1 className="setup-q">How much time can you give each week?</h1>
      <div className="tile-grid two">
        {options.map(([v, label, sub]) => (
          <Tile key={v} on={p.time === v} onClick={() => updateProfile({ time: v as Commitment | "any" })} sub={sub}>{label}</Tile>
        ))}
      </div>
    </>
  );
}

function ClassesStep() {
  const { data, saveCourses } = useAccount();
  const courses = data.courses;
  const [q, setQ] = useState("");
  const words = q.trim().toLowerCase();
  const suggestions = words
    ? COURSE_INDEX.filter((c) => c.course.toLowerCase().includes(words) && !courses.some((x) => x.course === c.course))
        .sort((a, b) => Number(!a.course.toLowerCase().startsWith(words)) - Number(!b.course.toLowerCase().startsWith(words)))
        .slice(0, 6)
    : [];

  const add = (name: string) => {
    const course = name.trim();
    if (!course) return;
    const level: Level = /^ap\b|\bib\b/i.test(course) ? "AP / IB" : /honors/i.test(course) ? "Honors" : "Regular";
    saveCourses([...courses, {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      course, subject: inferSubject(course) ?? ("" as Subject), level, grade: null, apScore: null,
    }]);
    setQ("");
  };
  const edit = (id: string, patch: Partial<CourseGrade>) => saveCourses(courses.map((c) => (c.id === id ? { ...c, ...patch } : c)));

  return (
    <>
      <h1 className="setup-q">What classes have you taken?</h1>
      <p className="setup-help">Type a class and press Enter, then tap your grade. Add as many as you like.</p>
      <form onSubmit={(e) => { e.preventDefault(); add(suggestions[0]?.course ?? q); }}>
        <input className="setup-search" placeholder="e.g. AP Calculus BC, Biology, Spanish 2" value={q}
          onChange={(e) => setQ(e.target.value)} aria-label="Add a class" />
      </form>
      {words && (
        <div className="chip-row">
          {suggestions.map((s) => (
            <button key={s.course} type="button" className="chip" onClick={() => add(s.course)}>
              {s.course} <span className="mono muted">{s.subject}</span>
            </button>
          ))}
          {!suggestions.some((s) => s.course.toLowerCase() === words) && (
            <button type="button" className="chip chip-new" onClick={() => add(q)}>Add &ldquo;{q.trim()}&rdquo;</button>
          )}
        </div>
      )}

      {courses.length > 0 && (
        <ul className="class-list">
          {[...courses].reverse().map((c) => (
            <li key={c.id} className={c.grade ? "" : "needs-grade"}>
              <div className="class-head">
                <strong>{c.course}</strong>
                {c.subject && <span className="mono muted">{c.subject}</span>}
                <button type="button" className="link small" onClick={() => saveCourses(courses.filter((x) => x.id !== c.id))}>Remove</button>
              </div>
              {!c.subject && (
                <div className="pick-row">
                  <span className="pick-label">Subject</span>
                  {SUBJECTS.map((s) => <button key={s} type="button" className="mini-chip" onClick={() => edit(c.id, { subject: s })}>{s}</button>)}
                </div>
              )}
              <div className="pick-row">
                <span className="pick-label">Level</span>
                {LEVELS.map((l) => (
                  <button key={l} type="button" className="mini-chip" aria-pressed={c.level === l}
                    onClick={() => edit(c.id, { level: l, apScore: l === "AP / IB" ? c.apScore : null })}>{LEVEL_SHORT[l]}</button>
                ))}
              </div>
              <div className="pick-row">
                <span className="pick-label">Grade</span>
                {LETTER_GRADES.map((g) => (
                  <button key={g} type="button" className="mini-chip mono" aria-pressed={c.grade === g} onClick={() => edit(c.id, { grade: g })}>{g}</button>
                ))}
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

function ScoresStep() {
  const { data, saveCourses, updateScores } = useAccount();
  const { scores, courses } = data;
  const auto = unweightedGpa(courses);
  const apCourses = courses.filter((c) => c.level === "AP / IB");
  return (
    <>
      <h1 className="setup-q">Any scores to add?</h1>
      <p className="setup-help">All optional. These power your college chances.</p>
      <div className="score-grid">
        <label className="field big-field">
          <span>Unweighted GPA</span>
          <input inputMode="decimal" placeholder={auto !== null ? auto.toFixed(2) : "e.g. 3.85"} value={scores.gpa}
            onChange={(e) => updateScores({ gpa: e.target.value })} />
          <span className="field-note">{auto !== null ? `Leave blank to use ${auto.toFixed(2)} from your classes.` : "4.0 scale."}</span>
        </label>
        <label className="field big-field">
          <span>SAT</span>
          <input inputMode="numeric" placeholder="400 to 1600" value={scores.sat} onChange={(e) => updateScores({ sat: e.target.value })} />
        </label>
        <label className="field big-field">
          <span>ACT</span>
          <input inputMode="numeric" placeholder="1 to 36" value={scores.act} onChange={(e) => updateScores({ act: e.target.value })} />
        </label>
      </div>

      <p className="setup-label">AP exam scores</p>
      {apCourses.length === 0 ? (
        <p className="setup-help">Classes marked AP / IB in the Classes step show up here so you can tap your exam score.</p>
      ) : (
        <ul className="class-list">
          {apCourses.map((c) => (
            <li key={c.id}>
              <div className="pick-row">
                <span className="pick-label wide">{c.course}</span>
                {[5, 4, 3, 2, 1].map((n) => (
                  <button key={n} type="button" className="mini-chip mono" aria-pressed={c.apScore === n}
                    onClick={() => saveCourses(courses.map((x) => (x.id === c.id ? { ...x, apScore: x.apScore === n ? null : n } : x)))}>{n}</button>
                ))}
                <span className="mono muted small">{c.apScore ? "" : "not taken yet"}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

function ActivitiesStep() {
  const { data, updateProfile } = useAccount();
  const p = data.profile;
  const [q, setQ] = useState("");
  const words = q.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const results = useMemo(
    () => (words.length ? ECS.filter((ec) => !p.activities.includes(ec.slug) && words.every((w) => ec.name.toLowerCase().includes(w))).slice(0, 8) : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [q, p.activities],
  );
  const done = p.activities.map((s) => ECS.find((e) => e.slug === s)).filter((e) => e !== undefined);
  return (
    <>
      <h1 className="setup-q">What have you already done?</h1>
      <p className="setup-help">Search for activities, clubs, jobs, and awards you&apos;ve taken part in. They count toward your college chances.</p>
      <input className="setup-search" placeholder="e.g. robotics, debate, hospital, USACO" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search activities" />
      {results.length > 0 && (
        <ul className="pick-results">
          {results.map((ec) => (
            <li key={ec.slug}>
              <button type="button" onClick={() => { updateProfile({ activities: [...p.activities, ec.slug] }); setQ(""); }}>
                <span>{ec.name}</span>
                <span className="mono muted">{ec.type}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
      {words.length > 0 && results.length === 0 && <p className="setup-help">Nothing matches that yet. Try one word, like &ldquo;debate&rdquo;.</p>}
      {done.length > 0 && (
        <div className="chip-row">
          {done.map((ec) => (
            <span key={ec.slug} className="chip on">
              {ec.name}
              <button type="button" aria-label={`Remove ${ec.name}`} onClick={() => updateProfile({ activities: p.activities.filter((s) => s !== ec.slug) })}>×</button>
            </span>
          ))}
        </div>
      )}

      <p className="setup-label">Highest award or recognition so far</p>
      <div className="tile-grid three">
        {(Object.keys(AWARD_LEVELS) as AwardLevel[]).map((k) => (
          <Tile key={k} on={p.award === k} onClick={() => updateProfile({ award: k })}>{AWARD_LEVELS[k].label}</Tile>
        ))}
      </div>
    </>
  );
}
