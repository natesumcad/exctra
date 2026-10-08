import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ECS, HOURS, MAJORS, findBySlug } from "@/lib/data";
import BackLink from "@/app/components/BackLink";
import SaveButton from "@/app/components/SaveButton";

const MAJOR_INDEX = Object.fromEntries(MAJORS.map((m, i) => [m, i])) as Record<string, number>;

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return ECS.map((ec) => ({ slug: ec.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const ec = findBySlug((await params).slug);
  return ec ? { title: ec.name, description: ec.description } : {};
}

export default async function ActivityPage({ params }: Props) {
  const ec = findBySlug((await params).slug);
  if (!ec) notFound();
  const overlap = (x: typeof ec) => x.majors.filter((m) => ec.majors.includes(m)).length;
  const related = ECS.filter((x) => x !== ec && x.category === ec.category)
    .sort((a, b) => Number(b.curated) - Number(a.curated) || overlap(b) - overlap(a))
    .slice(0, 6);

  return (
    <main>
      <div className="page-head">
        <div className="wrap-inner">
          <p className="eyebrow"><BackLink /> / {ec.category} / {ec.type}</p>
          <div className="head-row">
            <div>
              <h1>{ec.name}</h1>
              <p className="lede">{ec.description}</p>
            </div>
            <SaveButton slug={ec.slug} name={ec.name} />
          </div>
        </div>
      </div>

      <div className="wrap-inner profile">
        <div className="profile-main">
          <dl className="facts-grid">
            <div><dt>Type</dt><dd>{ec.type}</dd></div>
            <div><dt>Field</dt><dd>{ec.category}</dd></div>
            <div><dt>Typical time</dt><dd>{HOURS[ec.commitment]}</dd></div>
            <div><dt>Format</dt><dd>{ec.format}</dd></div>
          </dl>

          <section className="block">
            <h2>How to get started</h2>
            <p>{ec.tip}</p>
            {ec.curated && <p className="muted small-print">Dates, costs, and eligibility change. Confirm details with the organizer.</p>}
          </section>

          <section className="block">
            <h2>Majors it supports</h2>
            <ul className="tags">
              {ec.majors.map((m) => <li key={m}><Link href={`/?m=${MAJOR_INDEX[m]}`}>{m}</Link></li>)}
            </ul>
          </section>

          <section className="block">
            <h2>Strengths it uses</h2>
            <ul className="tags">{ec.strengths.map((s) => <li key={s}>{s}</li>)}</ul>
          </section>

          <section className="block">
            <h2>Related school subjects</h2>
            <ul className="tags">{ec.subjects.map((s) => <li key={s}>{s}</li>)}</ul>
          </section>
        </div>

        {related.length > 0 && (
          <aside className="side-card">
            <div className="section-label">More in {ec.category}</div>
            <ul className="related">
              {related.map((r) => (
                <li key={r.slug}>
                  <Link href={`/activities/${r.slug}`}>{r.name}</Link>
                  <span className="muted">{r.type} · {HOURS[r.commitment]}</span>
                </li>
              ))}
            </ul>
          </aside>
        )}
      </div>
    </main>
  );
}
