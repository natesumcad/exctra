import Finder from "./components/Finder";
import { ECS } from "@/lib/data";

export default function Home() {
  return (
    <main className="wrap">
      <section className="intro">
        <h1>Find extracurriculars that fit your major and what you're good at.</h1>
        <p className="lede">
          Answer three questions. We rank {ECS.length} common high school activities, show why each
          one matched, and give you a first step to get started.
        </p>
      </section>
      <Finder />
    </main>
  );
}
