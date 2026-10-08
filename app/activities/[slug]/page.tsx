import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ECS, HOURS, MAJORS, findBySlug, slugify } from "@/lib/data";
import BackLink from "@/app/components/BackLink";
import SaveButton from "@/app/components/SaveButton";

const MAJOR_INDEX = Object.fromEntries(MAJORS.map((m, i) => [m, i])) as Record<string, number>;

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return ECS.map((ec) => ({ slug: slugify(ec.name) }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const ec = findBySlug((await params).slug);
  return ec ? { title: ec.name, description: ec.description } : {};
}

export default async function ActivityPage({ params }: Props) {
  const ec = findBySlug((await params).slug);
  if (!ec) notFound();
  const related = ECS.filter((x) => x.category === ec.category && x !== ec).slice(0, 4);

  return (
    <main>
      <div className="page-head">
        <div className="wrap-inner">
          <p className="crumb"><BackLink /> / {ec.category}</p>
          <div className="head-row">
            <div>
              <h1>{ec.name}</h1>
              <p className="lede">{ec.description}</p>
            </div>
            <SaveButton slug={slugify(ec.name)} name={ec.name} />
          </div>
        </div>
      </div>

      <div className="wrap-inner profile">
        <div className="profile-main">
          <section className="block">
            <h2>Quick facts</h2>
            <dl className="facts-grid">
              <div><dt>Type</dt><dd>{ec.category}</dd></div>
              <div><dt>Typical time</dt><dd>{HOURS[ec.commitment]}</dd></div>
              <div><dt>Good for</dt><dd>{ec.majors.length} majors</dd></div>
            </dl>
          </section>

          <section className="block">
            <h2>How to get started</h2>
            <p>{ec.tip}</p>
          </section>

          <section className="block">
            <h2>Majors it supports</h2>
            <ul className="tags">
              {ec.majors.map((m) => <li key={m}><Link href={`/?m=${encodeURIComponent(String(MAJOR_INDEX[m]))}`}>{m}</Link></li>)}
            </ul>
          </section>

          <section className="block">
            <h2>Strengths it uses</h2>
            <ul className="tags">{ec.strengths.map((s) => <li key={s}>{s}</li>)}</ul>
          </section>
        </div>

        {related.length > 0 && (
          <aside className="profile-side">
            <h2>More in {ec.category}</h2>
            <ul className="related">
              {related.map((r) => (
                <li key={r.name}>
                  <Link href={`/activities/${slugify(r.name)}`}>{r.name}</Link>
                  <span className="muted">{HOURS[r.commitment]}</span>
                </li>
              ))}
            </ul>
          </aside>
        )}
      </div>
    </main>
  );
}
