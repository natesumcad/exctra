"use client";

/*
 * Placeholder accounts. There is one demo account (username "1", password "1") and all
 * account data lives in this browser's localStorage. Swap this file for real auth later;
 * the rest of the app only uses useAccount().
 */
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { Commitment, Major, Strength } from "./data";
import type { CourseGrade } from "./grades";

export const DEMO_USERS: Record<string, string> = { "1": "1" };

export type Status = "considering" | "joined" | "passed";
export const STATUS_LABEL: Record<Status, string> = {
  considering: "Considering",
  joined: "Joined",
  passed: "Not for me",
};

export interface Profile {
  name: string;
  grade: "" | "9" | "10" | "11" | "12";
  majors: Major[];
  strengths: Strength[];
  time: Commitment | "any";
}

export interface SavedItem {
  slug: string;
  status: Status;
  savedAt: number;
}

interface AccountData {
  profile: Profile;
  saved: SavedItem[];
  courses: CourseGrade[];
  /** Profile photo as a small JPEG data URL. */
  avatar: string | null;
}

const EMPTY_DATA: AccountData = {
  profile: { name: "", grade: "", majors: [], strengths: [], time: "any" },
  saved: [],
  courses: [],
  avatar: null,
};

const SESSION_KEY = "exctra:session";
const dataKey = (u: string) => `exctra:user:${u}`;

function read<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}
function write(key: string, value: unknown): boolean {
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

function load(u: string): AccountData {
  const d = read<Partial<AccountData>>(dataKey(u)) ?? {};
  return { ...EMPTY_DATA, ...d, profile: { ...EMPTY_DATA.profile, ...d.profile } };
}

interface AccountContext {
  ready: boolean;
  user: string | null;
  data: AccountData;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  saveProfile: (p: Profile) => void;
  saveCourses: (c: CourseGrade[]) => void;
  setAvatar: (dataUrl: string | null) => boolean;
  clearData: () => void;
  isSaved: (slug: string) => boolean;
  toggleSaved: (slug: string) => void;
  setStatus: (slug: string, status: Status) => void;
}

const Ctx = createContext<AccountContext | null>(null);

export function AccountProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState<string | null>(null);
  const [data, setData] = useState<AccountData>(EMPTY_DATA);

  useEffect(() => {
    const u = read<string>(SESSION_KEY);
    if (u && u in DEMO_USERS) {
      setUser(u);
      setData(load(u));
    }
    setReady(true);
  }, []);

  const update = useCallback(
    (fn: (d: AccountData) => AccountData) =>
      setData((cur) => {
        const next = fn(cur);
        if (user) write(dataKey(user), next);
        return next;
      }),
    [user],
  );

  const value: AccountContext = {
    ready,
    user,
    data,
    login: (username, password) => {
      const u = username.trim();
      if (DEMO_USERS[u] === undefined || DEMO_USERS[u] !== password) return false;
      write(SESSION_KEY, u);
      setUser(u);
      setData(load(u));
      return true;
    },
    logout: () => {
      write(SESSION_KEY, null);
      setUser(null);
      setData(EMPTY_DATA);
    },
    saveProfile: (profile) => update((d) => ({ ...d, profile })),
    saveCourses: (courses) => update((d) => ({ ...d, courses })),
    setAvatar: (avatar) => {
      if (!user) return false;
      const next = { ...data, avatar };
      if (!write(dataKey(user), next)) return false; // storage full
      setData(next);
      return true;
    },
    clearData: () => {
      if (user) write(dataKey(user), null);
      setData(EMPTY_DATA);
    },
    isSaved: (slug) => data.saved.some((s) => s.slug === slug),
    toggleSaved: (slug) =>
      update((d) => ({
        ...d,
        saved: d.saved.some((s) => s.slug === slug)
          ? d.saved.filter((s) => s.slug !== slug)
          : [...d.saved, { slug, status: "considering", savedAt: Date.now() }],
      })),
    setStatus: (slug, status) =>
      update((d) => ({ ...d, saved: d.saved.map((s) => (s.slug === slug ? { ...s, status } : s)) })),
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAccount() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAccount must be used inside AccountProvider");
  return ctx;
}
