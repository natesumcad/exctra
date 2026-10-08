"use client";

import Link from "next/link";
import { useState } from "react";
import {
  COURSES, LETTER_GRADES, LEVELS, STRENGTHS, SUBJECTS,
  type LetterGrade, type Level, type Strength, type Subject,
} from "@/lib/data";
import { useAccount } from "@/lib/auth";
import { pointsToLetter, subjectScores, type CourseGrade } from "@/lib/grades";

const toggleIn = <T,>(list: T[], x: T) => (list.includes(x) ? list.filter((y) => y !== x) : [...list, x]);

export default function StrengthsPage() {
  const { data, saveProfile, saveCourses } = useAccount();
  const { profile, courses } = data;
  const [subject, setSubject] = useState<Subject>("Math");
  const [course, setCourse] = useState(COURSES.Math[0]);
  const [custom, setCustom] = useState("");
  const [level, setLevel] = useState<Level>("Regular");
  const [grade, setGrade] = useState<LetterGrade>("A");

  const scores = subjectScores(courses);
  const ranked = (Object.entries(scores) as [Subject, number][]).sort((a, b) => b[1] - a[1]);

  const add = (e: React.FormEvent) => {
    e.preventDefault();
    const name = course === "__custom" ? custom.trim() : course;
    if (!name) return;
    saveCourses([...courses, { id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, course: name, subject, level, grade }]);
    setCustom("");
  };
  const edit = (id: string, patch: Partial<CourseGrade>) =>
    saveCourses(courses.map((c) => (c.id === id ? { ...c, ...patch } : c)));

  return (
    <main className="wrap-inner account-body">
      <section className="panel-section">
        <div className="section-head">
          <div>
            <div className="section-label">Course grades</div>
            <p className="muted">Log your grades and the search can sort opportunities by the subjects you do best in.</p>
          </div>
          {courses.length > 0 && <Link href="/?sort=grades" className="btn">Sort search by my grades</Link>}
        </div>

        <form onSubmit={add} className="course-form">
          <label className="field">
            <span>Subject</span>
            <select value={subject} onChange={(e) => { const s = e.target.value as Subject; setSubject(s); setCourse(COURSES[s][0]); }}>
              {SUBJECTS.map((s) => <option key={s}>{s}</option>)}
            </select>
          </label>
          <label className="field">
            <span>Course</span>
            <select value={course} onChange={(e) => setCourse(e.target.value)}>
              {COURSES[subject].map((c) => <option key={c}>{c}</option>)}
              <option value="__custom">Other (type it)</option>
            </select>
          </label>
          {course === "__custom" && (
            <label className="field">
              <span>Course name</span>
              <input value={custom} maxLength={60} onChange={(e) => setCustom(e.target.value)} required />
            </label>
          )}
          <label className="field">
            <span>Level</span>
            <select value={level} onChange={(e) => setLevel(e.target.value as Level)}>
              {LEVELS.map((l) => <option key={l}>{l}</option>)}
            </select>
          </label>
          <label className="field">
            <span>Grade</span>
            <select value={grade} onChange={(e) => setGrade(e.target.value as LetterGrade)}>
              {LETTER_GRADES.map((g) => <option key={g}>{g}</option>)}
            </select>
          </label>
          <button type="submit" className="btn">Add course</button>
        </form>

        {courses.length === 0 ? (
          <p className="empty-line">No courses yet. Add your first one above.</p>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr><th>Course</th><th>Subject</th><th>Level</th><th>Grade</th><th aria-label="Actions" /></tr>
              </thead>
              <tbody>
                {courses.map((c) => (
                  <tr key={c.id}>
                    <td>{c.course}</td>
                    <td className="muted">{c.subject}</td>
                    <td>
                      <select aria-label={`Level for ${c.course}`} value={c.level} onChange={(e) => edit(c.id, { level: e.target.value as Level })}>
                        {LEVELS.map((l) => <option key={l}>{l}</option>)}
                      </select>
                    </td>
                    <td>
                      <select aria-label={`Grade for ${c.course}`} value={c.grade} onChange={(e) => edit(c.id, { grade: e.target.value as LetterGrade })}>
                        {LETTER_GRADES.map((g) => <option key={g}>{g}</option>)}
                      </select>
                    </td>
                    <td><button type="button" className="link small" onClick={() => saveCourses(courses.filter((x) => x.id !== c.id))}>Remove</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {ranked.length > 0 && (
        <section className="panel-section">
          <div className="section-label">Subject strength</div>
          <p className="muted">Average of your grades in each subject, with a small boost for Honors, AP, IB, and dual enrollment.</p>
          <ul className="bars">
            {ranked.map(([s, pts]) => (
              <li key={s}>
                <span className="bar-label">{s}</span>
                <span className="bar-track"><span style={{ width: `${(pts / 4.3) * 100}%` }} /></span>
                <span className="bar-value mono">{pointsToLetter(pts)} <span className="muted">{pts.toFixed(2)}</span></span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="panel-section">
        <div className="section-label">Skills you're good at</div>
        <p className="muted">These feed the Use my profile button and your suggestions. Select all that apply.</p>
        <div className="check-cols">
          {STRENGTHS.map((s) => (
            <label key={s} className="check">
              <input type="checkbox" checked={profile.strengths.includes(s)}
                onChange={() => saveProfile({ ...profile, strengths: toggleIn<Strength>(profile.strengths, s) })} />
              <span>{s}</span>
            </label>
          ))}
        </div>
      </section>
    </main>
  );
}
