"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ECS, HOURS, findBySlug, slugify } from "@/lib/data";
import { STATUS_LABEL, useAccount, type Status } from "@/lib/auth";
import { EMPTY, search, toQuery } from "@/lib/recommend";
import RequireLogin from "@/app/components/RequireLogin";
import SaveButton from "@/app/components/SaveButton";

const ORDER: Status[] = ["joined", "considering", "passed"];

export default function AccountPage() {
  return (
    <RequireLogin>
      <Dashboard />
    </RequireLogin>
  );
}

function Dashboard() {
  const { user, data, logout, setStatus, toggleSaved } = useAccount();
  const router = useRouter();
  const { profile, saved } = data;
  const hasProfile = profile.majors.length > 0 || profile.strengths.length > 0;
  const filters = { ...EMPTY, majors: profile.majors, strengths: profile.strengths, time: profile.time };
  const matches = hasProfile ? search(filters).filter((r) => !saved.some((s) => s.slug === slugify(r.ec.name))).slice(0, 5) : [];
  const joined = saved.filter((s) => s.status === "joined").length;

  return (
    <main>
      <div className="page-head">
        <div className="wrap-inner head-row">
          <div>
            <p className="crumb">My account</p>
            <h1>{profile.name ? `Hi, ${profile.name}` : "Welcome back"}</h1>
            <p className="lede">
              {saved.length === 0
                ? "Save activities from search to start your list."
                : `${saved.length} saved · ${joined} joined`}
            </p>
          </div>
          <button type="button" className="link" onClick={() => { logout(); router.push("/"); }}>Log out</button>
        </div>
      </div>

      <div className="wrap-inner profile">
        <div className="profile-main">
          <section className="block">
            <div className="block-head">
              <h2>My activities</h2>
              <Link href="/">Find more</Link>
            </div>
            {saved.length === 0 ? (
              <p className="muted">Nothing saved yet. Use the Save button on any activity.</p>
            ) : (
              ORDER.map((status) => {
                const items = saved.filter((s) => s.status === status);
                if (!items.length) return null;
                return (
                  <div key={status} className="status-group">
                    <h3 className="status-title">{STATUS_LABEL[status]} <span className="muted">{items.length}</span></h3>
                    <ul className="mylist">
                      {items.map((s) => {
                        const ec = findBySlug(s.slug);
                        if (!ec) return null;
                        return (
                          <li key={s.slug}>
                            <div>
                              <Link href={`/activities/${s.slug}`} className="mylist-name">{ec.name}</Link>
                              <span className="muted">{ec.category} · {HOURS[ec.commitment]}</span>
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

          <section className="block">
            <div className="block-head">
              <h2>Suggested for you</h2>
              {hasProfile && <Link href={`/?${toQuery(filters)}`}>See all matches</Link>}
            </div>
            {!hasProfile ? (
              <p className="muted">
                <Link href="/account/profile">Add your majors and strengths</Link> and we'll suggest
                activities here.
              </p>
            ) : matches.length === 0 ? (
              <p className="muted">You've saved every strong match. Try adding more strengths to your profile.</p>
            ) : (
              <ul className="mylist">
                {matches.map((r) => {
                  const slug = slugify(r.ec.name);
                  return (
                    <li key={slug}>
                      <div>
                        <Link href={`/activities/${slug}`} className="mylist-name">{r.ec.name}</Link>
                        <span className="muted">{r.grade} match · {HOURS[r.ec.commitment]}</span>
                      </div>
                      <SaveButton slug={slug} name={r.ec.name} />
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </div>

        <aside className="profile-side">
          <div className="block-head">
            <h2>My profile</h2>
            <Link href="/account/profile">Edit</Link>
          </div>
          <dl className="side-facts">
            <dt>Username</dt><dd>{user}</dd>
            <dt>Grade</dt><dd>{profile.grade ? `${profile.grade}th` : "Not set"}</dd>
            <dt>Majors</dt><dd>{profile.majors.join(", ") || "Not set"}</dd>
            <dt>Strengths</dt><dd>{profile.strengths.join(", ") || "Not set"}</dd>
            <dt>Time</dt><dd>{profile.time === "any" ? "Any amount" : HOURS[profile.time]}</dd>
          </dl>
          <p className="muted small-print">{ECS.length} activities in the catalog.</p>
        </aside>
      </div>
    </main>
  );
}
