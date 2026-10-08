"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { useAccount } from "@/lib/auth";
import Avatar from "@/app/components/Avatar";

const SIZE = 256;

/* Center-crop any image the browser can decode to a small square JPEG. */
async function toAvatar(file: File): Promise<string> {
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.src = url;
    await img.decode();
    const side = Math.min(img.naturalWidth, img.naturalHeight);
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = SIZE;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(img, (img.naturalWidth - side) / 2, (img.naturalHeight - side) / 2, side, side, 0, 0, SIZE, SIZE);
    return canvas.toDataURL("image/jpeg", 0.85);
  } finally {
    URL.revokeObjectURL(url);
  }
}

export default function SettingsPage() {
  const { user, data, setAvatar, logout, clearData } = useAccount();
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<{ kind: "ok" | "error" | "busy"; text: string } | null>(null);

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (file.size > 25 * 1024 * 1024) return setStatus({ kind: "error", text: "That file is over 25 MB. Try a smaller image." });
    setStatus({ kind: "busy", text: "Processing image" });
    try {
      const dataUrl = await toAvatar(file);
      setStatus(setAvatar(dataUrl)
        ? { kind: "ok", text: "Profile photo updated." }
        : { kind: "error", text: "Your browser storage is full, so the photo couldn't be saved." });
    } catch {
      setStatus({ kind: "error", text: "This browser can't read that image format. Try a JPG, PNG, WEBP, or GIF." });
    }
  };

  return (
    <main className="wrap-inner account-body">
      <section className="panel-section">
        <div className="section-label">Profile photo</div>
        <div className="photo-row">
          <Avatar size={112} />
          <div className="photo-actions">
            <p className="muted">Upload any image. We crop it to a circle and shrink it to 256 × 256.</p>
            <div className="row-gap">
              <button type="button" className="btn" onClick={() => input.current?.click()} disabled={status?.kind === "busy"}>
                {data.avatar ? "Change photo" : "Upload photo"}
              </button>
              {data.avatar && (
                <button type="button" className="btn-ghost" onClick={() => { setAvatar(null); setStatus({ kind: "ok", text: "Photo removed." }); }}>
                  Remove
                </button>
              )}
            </div>
            <input ref={input} type="file" accept="image/*" hidden onChange={onFile} />
            {status && <p className={`status-msg ${status.kind}`} role="status">{status.text}</p>}
          </div>
        </div>
      </section>

      <section className="panel-section">
        <div className="section-label">Account</div>
        <dl className="kv">
          <dt>Username</dt><dd className="mono">{user}</dd>
          <dt>Storage</dt><dd>This test account saves to this browser only.</dd>
        </dl>
        <div className="row-gap">
          <button type="button" className="btn-ghost" onClick={() => { logout(); router.push("/"); }}>Log out</button>
        </div>
      </section>

      <section className="panel-section danger">
        <div className="section-label">Reset</div>
        <p className="muted">Delete your profile, grades, saved activities, and photo from this browser.</p>
        <button type="button" className="btn-ghost danger-btn"
          onClick={() => { if (window.confirm("Delete all of your account data on this device?")) { clearData(); setStatus(null); } }}>
          Delete my data
        </button>
      </section>
    </main>
  );
}
