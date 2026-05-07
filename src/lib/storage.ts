import type { AnyLog, UserProfile } from "./types";

const DB_NAME = "gutloop";
const DB_VERSION = 1;
const LOGS_STORE = "logs";
const META_STORE = "meta";

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(LOGS_STORE)) {
        const store = db.createObjectStore(LOGS_STORE, { keyPath: "id" });
        store.createIndex("timestamp", "timestamp");
        store.createIndex("type", "type");
      }
      if (!db.objectStoreNames.contains(META_STORE)) {
        db.createObjectStore(META_STORE, { keyPath: "key" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function saveLog(log: AnyLog): Promise<void> {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(LOGS_STORE, "readwrite");
    tx.objectStore(LOGS_STORE).put(log);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function deleteLog(id: string): Promise<void> {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(LOGS_STORE, "readwrite");
    tx.objectStore(LOGS_STORE).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getAllLogs(): Promise<AnyLog[]> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(LOGS_STORE, "readonly");
    const req = tx.objectStore(LOGS_STORE).getAll();
    req.onsuccess = () => {
      const all = (req.result as AnyLog[]).sort((a, b) => b.timestamp - a.timestamp);
      resolve(all);
    };
    req.onerror = () => reject(req.error);
  });
}

export async function getProfile(): Promise<UserProfile | null> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(META_STORE, "readonly");
    const req = tx.objectStore(META_STORE).get("profile");
    req.onsuccess = () => resolve(req.result?.value ?? null);
    req.onerror = () => reject(req.error);
  });
}

export async function saveProfile(profile: UserProfile): Promise<void> {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(META_STORE, "readwrite");
    tx.objectStore(META_STORE).put({ key: "profile", value: profile });
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function clearAll(): Promise<void> {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction([LOGS_STORE, META_STORE], "readwrite");
    tx.objectStore(LOGS_STORE).clear();
    tx.objectStore(META_STORE).clear();
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function exportJson(): Promise<string> {
  const [logs, profile] = await Promise.all([getAllLogs(), getProfile()]);
  return JSON.stringify({ exportedAt: Date.now(), profile, logs }, null, 2);
}

function csvEscape(v: unknown): string {
  if (v === undefined || v === null) return "";
  const s = String(v);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export async function exportCsv(): Promise<string> {
  const logs = await getAllLogs();
  const headers = [
    "Entry Date",
    "Entry Time",
    "Entry Type",
    "Food Name",
    "Activity Name",
    "Activity Intensity",
    "Activity Duration",
    "Stool Type (Bristol Scale)",
    "Stool Urgency",
    "Stool Ease of Passage",
    "Notes",
  ];

  const rows = logs
    .slice()
    .sort((a, b) => a.timestamp - b.timestamp)
    .map((log) => {
      const d = new Date(log.timestamp);
      const date = d.toLocaleDateString("en-CA");
      const time = d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
      let type = "";
      let foodName = "";
      let activityName = "";
      let activityIntensity = "";
      let activityDuration = "";
      let bristol = "";
      let urgency = "";
      let ease = "";
      const notes = log.note ?? "";

      if (log.type === "meal") {
        type = "Food";
        foodName = log.foodName ?? "";
      } else if (log.type === "exercise") {
        type = "Activity";
        activityName = log.activity ?? "";
        activityIntensity = log.intensity ?? "";
        activityDuration = log.durationMin ? `${log.durationMin} min` : "";
      } else if (log.type === "stool") {
        type = "Stool";
        bristol = log.bristol ? String(log.bristol) : "";
        urgency = log.urgency ?? "";
        ease = log.ease ?? "";
      }

      return [
        date,
        time,
        type,
        foodName,
        activityName,
        activityIntensity,
        activityDuration,
        bristol,
        urgency,
        ease,
        notes,
      ].map(csvEscape).join(",");
    });

  return [headers.join(","), ...rows].join("\r\n");
}
