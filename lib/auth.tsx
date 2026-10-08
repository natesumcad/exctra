"use client";

/*
 * Placeholder accounts. There is one demo account (username "1", password "1") and all
 * account data lives in this browser's localStorage. Swap this file for real auth later;
 * the rest of the app only uses useAccount().
 */
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { Commitment, Major, Strength } from "./data";
import type { CourseGrade } from "./grades";
import type { AwardLevel } from "./chances";

export const DEMO_USERS: Record<string, string> = { "1": "1" };

export interface Profile {
  name: string;
  grade: "" | "9" | "10" | "11" | "12";
  majors: Major[];
  strengths: Strength[];
  time: Commitment | "any";
  /** Slugs of opportunities the student has actually done. */
  activities: string[];
  award: AwardLevel;
  /** Set once the step-by-step setup has been finished. */
  setupDone: boolean;
}

export interface Scores {
  /** Major used on the Chances tab; falls back to the first profile major. */
  major: Major | "";
  /** Unweighted GPA override; blank means compute from classes. */
  gpa: string;
  sat: string;
  act: string;
}

export interface AccountData {
  profile: Profile;
  courses: CourseGrade[];
  scores: Scores;
  /** Profile photo as a small JPEG data URL. */
  avatar: string | null;
}

const EMPTY_DATA: AccountData = {
  profile: { name: "", grade: "", majors: [], strengths: [], time: "any", activities: [], award: "none", setupDone: false },
  courses: [],
  scores: { major: "", gpa: "", sat: "", act: "" },
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

/* Load saved data, carrying over fields from earlier versions of the account format. */
function load(u: string): AccountData {
  type Legacy = Partial<AccountData> & {
    saved?: { slug: string; status: string }[];
    academics?: { major?: Major | ""; gpa?: string; sat?: string; act?: string; award?: AwardLevel };
  };
  const d = read<Legacy>(dataKey(u)) ?? {};
  const legacyDone = (d.saved ?? []).filter((s) => s.status === "joined").map((s) => s.slug);
  const profile = { ...EMPTY_DATA.profile, ...d.profile };
  profile.activities = [...new Set([...(profile.activities ?? []), ...legacyDone])];
  if (d.academics?.award && profile.award === "none") profile.award = d.academics.award;
  const a = d.academics ?? {};
  return {
    profile,
    courses: (d.courses ?? []).map((c) => ({ ...c, apScore: c.apScore ?? null })),
    scores: d.scores ?? { major: a.major ?? "", gpa: a.gpa ?? "", sat: a.sat ?? "", act: a.act ?? "" },
    avatar: d.avatar ?? null,
  };
}

interface AccountContext {
  ready: boolean;
  user: string | null;
  data: AccountData;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  updateProfile: (patch: Partial<Profile>) => void;
  saveCourses: (c: CourseGrade[]) => void;
  updateScores: (patch: Partial<Scores>) => void;
  setAvatar: (dataUrl: string | null) => boolean;
  clearData: () => void;
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
      const loaded = load(u);
      setUser(u);
      setData(loaded);
      return true;
    },
    logout: () => {
      write(SESSION_KEY, null);
      setUser(null);
      setData(EMPTY_DATA);
    },
    updateProfile: (patch) => update((d) => ({ ...d, profile: { ...d.profile, ...patch } })),
    saveCourses: (courses) => update((d) => ({ ...d, courses })),
    updateScores: (patch) => update((d) => ({ ...d, scores: { ...d.scores, ...patch } })),
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
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAccount() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAccount must be used inside AccountProvider");
  return ctx;
}

/** True when the profile has enough to personalize results. */
export const hasPreferences = (p: Profile) => p.majors.length > 0 || p.strengths.length > 0;
