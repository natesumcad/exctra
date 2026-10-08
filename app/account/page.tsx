"use client";

import Link from "next/link";
import { HOURS, findBySlug } from "@/lib/data";
import { STATUS_LABEL, useAccount, type Status } from "@/lib/auth";
import { pointsToLetter, subjectScores } from "@/lib/grades";
import { EMPTY, search, toQuery } from "@/lib/recommend";
import SaveButton from "@/app/components/SaveButton";

const ORDER: Status[] = ["joined", "considering", "passed"];

export default function Dashboard() {
  const { data, setStatus, toggleSaved } = useAccount();
  const { profile, saved, courses } = data;
  const scores = subjectScores(courses);
  const hasProfile = profile.majors.length > 0 || profile.strengths.length > 0;
  const filters = { ...EMPTY, majors: profile.majors, strengths: profile.strengths, time: profile.time };
  const savedSlugs = new Set(saved.map((s) => s.slug));
  const matches = hasProfile ? search(filters, scores).filter((r) => !savedSlugs.has(r.ec.slug)).slice(0, 6) : [];
  const topSubjects = Object.entries(scores).sort((a, b) => b[1] - a[1]).slice(0, 4);

  return (
    <main className="wrap-inner account-body dash">
      <div className="dash-main">
        <section className="panel-section">
          <div className="section-head">
            <div className="section-label">My activities</div>
            <Link href="/">Find more</Link>
          </div>
          {saved.length === 0 ? (
            <p className="empty-line">Nothing saved yet. Use the Save button on any opportunity.</p>
          ) : (
            ORDER.map((status) => {
              const items = saved.filter((s) => s.status === status);
              if (!items.length) return null;
              return (
                <div key={status} className="status-group">
                  <h3 className="status-title">{STATUS_LABEL[status]} <span className="mono muted">{items.length}</span></h3>
                  <ul className="mylist">
                    {items.map((s) => {
                      const ec = findBySlug(s.slug);
                      if (!ec) return null;
                      return (
                        <li key={s.slug}>
                          <div>
                            <Link href={`/activities/${s.slug}`} className="mylist-name">{ec.name}</Link>
                            <span className="muted">{ec.type} · {HOURS[ec.commitment]}</span>
                          </div>
                          <div className="mylist-actions">
                            <select aria-label={`Status for ${ec.name}`} value={s.status}
                              onChange={(e) => setStatus(s.slug, e.target.value as Status)}>
                              {ORDER.map((o) => <option key={o} value={o}>{STATUS_LABEL[o]}</option>)}
                            </select>
                            <button type="button" className="link small" onClick={() => toggleSaved(s.slug)}>Remove</button>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })
          )}
        </section>

        <section className="panel-section">
          <div className="section-head">
            <div className="section-label">Suggested for you</div>
            {hasProfile && <Link href={`/?${toQuery(filters)}`}>See all matches</Link>}
          </div>
          {!hasProfile ? (
            <p className="empty-line">
              <Link href="/account/profile">Add your majors</Link> and <Link href="/account/strengths">strengths</Link> to get suggestions here.
            </p>
          ) : matches.length === 0 ? (
            <p className="empty-line">You've saved every strong match. Try adding more strengths.</p>
          ) : (
            <ul className="mylist">
              {matches.map((r) => (
                <li key={r.ec.slug}>
                  <div>
                    <Link href={`/activities/${r.ec.slug}`} className="mylist-name">{r.ec.name}</Link>
                    <span className="muted"><span className="mono">{r.grade}</span> match · {r.ec.type} · {HOURS[r.ec.commitment]}</span>
                  </div>
                  <SaveButton slug={r.ec.slug} name={r.ec.name} />
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <aside className="dash-side">
        <section className="side-card">
          <div className="section-head">
            <div className="section-label">Profile</div>
            <Link href="/account/profile">Edit</Link>
          </div>
          <dl className="kv stacked">
            <dt>Grade</dt><dd>{profile.grade ? `${profile.grade}th` : "Not set"}</dd>
            <dt>Majors</dt><dd>{profile.majors.join(", ") || "Not set"}</dd>
            <dt>Time</dt><dd>{profile.time === "any" ? "Any amount" : HOURS[profile.time]}</dd>
          </dl>
        </section>
        <section className="side-card">
          <div className="section-head">
            <div className="section-label">Top subjects</div>
            <Link href="/account/strengths">Edit</Link>
          </div>
          {topSubjects.length === 0 ? (
            <p className="muted small-print">Log course grades to see your strongest subjects.</p>
          ) : (
            <ul className="mini-list">
              {topSubjects.map(([s, p]) => <li key={s}><span>{s}</span><span className="mono">{pointsToLetter(p)}</span></li>)}
            </ul>
          )}
        </section>
        <section className="side-card">
          <div className="section-label">College chances</div>
          <p className="muted small-print">See estimated odds at about 85 colleges from your grades, scores, and activities.</p>
          <Link href="/chances" className="btn top-gap">Open Chances</Link>
        </section>
      </aside>
    </main>
  );
}
