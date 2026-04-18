// Centralized API service. Replace BASE_URL with your Azure VM endpoint.
// All functions return Promises and gracefully fall back to mock data
// so the UI is fully populated on first render.

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

const today = new Date();
const daysAgo = (n) => {
  const d = new Date(today);
  d.setDate(d.getDate() - n);
  return d.toISOString();
};

const MOCK_PROFILE = {
  id: "p_001",
  name: "Eleanor Hayes",
  age: 64,
  gender: "Female",
  heightCm: 165,
  weightKg: 72,
  diagnosis: "Type 2 Diabetes — Plantar ulcer (Right foot)",
  avatarUrl: "https://i.pravatar.cc/160?img=47",
};

const MOCK_TRAJECTORY = Array.from({ length: 30 }, (_, i) => {
  const day = i + 1;
  // smooth decay from 4.2cm² to ~1.1cm² with mild noise
  const base = 4.2 * Math.exp(-0.045 * i);
  const noise = Math.sin(i / 3) * 0.08;
  return {
    day,
    date: daysAgo(29 - i).slice(0, 10),
    sizeCm2: Math.max(0.9, +(base + noise).toFixed(2)),
  };
});

const SYMPTOM_PALETTE = {
  Redness: "red",
  Swelling: "orange",
  Pain: "purple",
  Discharge: "yellow",
  Odor: "blue",
  Numbness: "green",
};

const MOCK_TIMELINE = [
  { id: "e1", date: daysAgo(0), thumb: "https://images.unsplash.com/photo-1584467735815-f778f274e296?w=200&h=200&fit=crop", symptoms: ["Redness", "Swelling"], note: "Slight improvement vs. yesterday." },
  { id: "e2", date: daysAgo(1), thumb: "https://images.unsplash.com/photo-1530026405186-ed1f139313f8?w=200&h=200&fit=crop", symptoms: ["Pain"], note: "Pain rated 4/10 in morning." },
  { id: "e3", date: daysAgo(2), thumb: "https://images.unsplash.com/photo-1581595219315-a187dd40c322?w=200&h=200&fit=crop", symptoms: ["Redness", "Discharge"], note: "Light serous discharge." },
  { id: "e4", date: daysAgo(4), thumb: "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=200&h=200&fit=crop", symptoms: ["Swelling"], note: "Edema reduced after elevation." },
  { id: "e5", date: daysAgo(6), thumb: "https://images.unsplash.com/photo-1576765608535-5f04d1e3a289?w=200&h=200&fit=crop", symptoms: ["Redness", "Pain", "Swelling"], note: "Started new dressing protocol." },
  { id: "e6", date: daysAgo(9), thumb: "https://images.unsplash.com/photo-1559757175-08d8d6f1c6ea?w=200&h=200&fit=crop", symptoms: ["Odor"], note: "Mild odor noted; cleansed wound." },
  { id: "e7", date: daysAgo(12), thumb: "https://images.unsplash.com/photo-1550831107-1553da8c8464?w=200&h=200&fit=crop", symptoms: ["Pain"], note: "Pain 6/10, took prescribed analgesic." },
];

const MOCK_TIPS = [
  { id: "t1", icon: "Droplet", title: "Stay Hydrated", body: "Proper hydration supports tissue repair and circulation in extremities." },
  { id: "t2", icon: "Footprints", title: "Inspect Daily", body: "Check both feet each evening, including between toes, for any new spots." },
  { id: "t3", icon: "Sun", title: "Avoid Barefoot Walking", body: "Even at home, wear supportive footwear to prevent micro-injuries." },
];

// ---------- helpers ----------
const safeFetch = async (path, options, fallback) => {
  if (!BASE_URL) return fallback;
  try {
    const res = await fetch(`${BASE_URL}${path}`, options);
    if (!res.ok) throw new Error(`API ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn("[api] falling back to mock:", path, err);
    return fallback;
  }
};

// ---------- public API ----------
export const symptomColor = (s) => SYMPTOM_PALETTE[s] || "blue";

export const getProfile = () => safeFetch("/api/profile", undefined, MOCK_PROFILE);

export const getTrajectory = () => safeFetch("/api/trajectory", undefined, MOCK_TRAJECTORY);

export const getTimeline = () => safeFetch("/api/timeline", undefined, MOCK_TIMELINE);

export const getDailyTip = () =>
  safeFetch("/api/tips/today", undefined, MOCK_TIPS[Math.floor(Math.random() * MOCK_TIPS.length)]);

export const uploadWoundPhoto = async ({ file, symptoms }) => {
  if (!BASE_URL) {
    await new Promise((r) => setTimeout(r, 600));
    return {
      id: `e_${Date.now()}`,
      date: new Date().toISOString(),
      thumb: file ? URL.createObjectURL(file) : "https://images.unsplash.com/photo-1584467735815-f778f274e296?w=200&h=200&fit=crop",
      symptoms,
      note: "Uploaded just now (mock).",
    };
  }
  const fd = new FormData();
  if (file) fd.append("photo", file);
  fd.append("symptoms", JSON.stringify(symptoms));
  const res = await fetch(`${BASE_URL}/api/timeline`, { method: "POST", body: fd });
  return res.json();
};

export const deleteTimelineEntry = async (id) => {
  if (!BASE_URL) {
    await new Promise((r) => setTimeout(r, 200));
    return { success: true, id };
  }
  const res = await fetch(`${BASE_URL}/api/timeline/${id}`, { method: "DELETE" });
  return res.json();
};

export const updateReminderSetting = async (enabled) => {
  if (!BASE_URL) return { enabled };
  const res = await fetch(`${BASE_URL}/api/settings/reminders`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ enabled }),
  });
  return res.json();
};
