import type { Metadata } from "next";

export const metadata: Metadata = { title: "Privacy" };

export default function Privacy() {
  return (
    <main className="wrap prose">
      <h1>Privacy</h1>
      <p className="muted">Last updated October 8, 2026</p>
      <p>
        Exctra has no accounts and does not ask for your name, email, or school. Your answers are
        processed entirely in your browser and are not sent to or stored on our servers.
      </p>
      <h2>Share links</h2>
      <p>
        When you rank activities, your answers are added to the page address so you can share or
        bookmark them. Anyone with that link can see those answers, so only share it with people
        you choose.
      </p>
      <h2>Hosting</h2>
      <p>
        The site is hosted on Vercel, which may keep standard server logs (such as IP address and
        browser type) to run and secure the service. We don't use cookies, ads, or third-party
        trackers.
      </p>
      <h2>Changes</h2>
      <p>If this policy changes, the date at the top will change with it.</p>
    </main>
  );
}
