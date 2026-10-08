import Link from "next/link";
import { HOURS } from "@/lib/data";
import type { Result } from "@/lib/recommend";

/* One opportunity as a compact tile, used in home shelves and the Explore grid. */
export default function OppTile({ r }: { r: Result }) {
  const { ec } = r;
  return (
    <Link href={`/activities/${ec.slug}`} className="opp-tile">
      <span className="opp-meta">{ec.type} · {ec.category}</span>
      <span className="opp-title">{ec.name}</span>
      <span className="opp-desc">{ec.description}</span>
      <span className="opp-foot">
        <span className="mono">{HOURS[ec.commitment]}</span>
        {r.grade && <span className="opp-grade mono" data-tier={r.grade[0]}>{r.grade}</span>}
      </span>
    </Link>
  );
}

export function TileSkeleton() {
  return (
    <span className="opp-tile sk-tile" aria-hidden="true">
      <span className="sk" style={{ width: "50%" }} />
      <span className="sk" style={{ width: "80%", height: 16 }} />
      <span className="sk" style={{ width: "90%" }} />
    </span>
  );
}
