// Centralized API service connecting to the custom Azure VM backend.
const BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

// ---------- static / display-only mock data (not backed by API) ----------
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
  const base = 4.2 * Math.exp(-0.045 * i);
  const noise = Math.sin(i / 3) * 0.08;
  return {
    day: i + 1,
    date: daysAgo(29 - i).slice(0, 10),
    sizeCm2: Math.max(0.9, +(base + noise).toFixed(2)),
  };
});

const MOCK_TIPS = [
  { id: "t1", icon: "Droplet", title: "Stay Hydrated", body: "Proper hydration supports tissue repair and circulation in extremities." },
  { id: "t2", icon: "Footprints", title: "Inspect Daily", body: "Check both feet each evening, including between toes, for any new spots." },
  { id: "t3", icon: "Sun", title: "Avoid Barefoot Walking", body: "Even at home, wear supportive footwear to prevent micro-injuries." },
];

const SYMPTOM_PALETTE = {
  Redness: "red",
  Swelling: "orange",
  Pain: "purple",
  Discharge: "yellow",
  Odor: "blue",
  Numbness: "green",
};

export const symptomColor = (s) => SYMPTOM_PALETTE[s] || "blue";

// ---------- profile / trajectory / tips (still mocked locally) ----------
export const getProfile = async () => MOCK_PROFILE;
export const getTrajectory = async () => MOCK_TRAJECTORY;
export const getDailyTip = async () => MOCK_TIPS[Math.floor(Math.random() * MOCK_TIPS.length)];
export const updateReminderSetting = async (enabled) => ({ enabled });

// ---------- real backend endpoints ----------

/**
 * GET /api/wounds/:userId
 * Returns: Array<{ _id?, imageUrl, symptoms: string[], createdAt: string, note?: string }>
 * Normalized into the timeline entry shape consumed by the UI.
 */
export const getTimeline = async (userId) => {
  if (!BASE_URL) throw new Error("VITE_API_BASE_URL is not configured");
  if (!userId) throw new Error("userId is required");

  const res = await fetch(`${BASE_URL}/api/wounds/${encodeURIComponent(userId)}`);
  if (!res.ok) throw new Error(`Failed to load history (${res.status})`);
  const data = await res.json();

  return (Array.isArray(data) ? data : []).map((w, i) => ({
    id: w._id || w.id || `${w.createdAt}-${i}`,
    date: w.createdAt,
    thumb: w.imageUrl,
    symptoms: Array.isArray(w.symptoms) ? w.symptoms : [],
    note: w.note,
  }));
};

/**
 * POST /api/upload  (multipart/form-data)
 *   image: File
 *   userId: string
 *   symptoms: JSON-stringified string[]
 * Returns: { success: true, entry: {...} }
 */
export const uploadWoundPhoto = async ({ file, symptoms, userId }) => {
  if (!BASE_URL) throw new Error("VITE_API_BASE_URL is not configured");
  if (!userId) throw new Error("userId is required");
  if (!file) throw new Error("An image file is required");

  const fd = new FormData();
  fd.append("image", file);
  fd.append("userId", userId);
  fd.append("symptoms", JSON.stringify(symptoms || []));

  const res = await fetch(`${BASE_URL}/api/upload`, { method: "POST", body: fd });
  if (!res.ok) throw new Error(`Upload failed (${res.status})`);
  const data = await res.json();
  if (!data?.success) throw new Error("Upload was not successful");

  const e = data.entry || {};
  return {
    id: e._id || e.id || `e_${Date.now()}`,
    date: e.createdAt || new Date().toISOString(),
    thumb: e.imageUrl,
    symptoms: Array.isArray(e.symptoms) ? e.symptoms : symptoms || [],
    note: e.note,
  };
};
