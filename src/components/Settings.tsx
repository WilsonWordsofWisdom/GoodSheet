"use client";
import { useState } from "react";
import { Download, Trash2, Camera, Pencil } from "lucide-react";
import type { UserProfile } from "@/lib/types";
import { exportCsv, clearAll, saveProfile } from "@/lib/storage";
import { EditProfile } from "./EditProfile";

interface Props {
  profile: UserProfile;
  onProfileChange: (p: UserProfile) => void;
  onCleared: () => void;
}

export function Settings({ profile, onProfileChange, onCleared }: Props) {
  const [editing, setEditing] = useState(false);

  const handleProfileSave = async (next: UserProfile) => {
    await saveProfile(next);
    onProfileChange(next);
  };

  const toggleThumbs = async () => {
    const next = { ...profile, storeThumbnails: !profile.storeThumbnails };
    await saveProfile(next);
    onProfileChange(next);
  };

  const handleExport = async () => {
    const csv = await exportCsv();
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `gutloop-export-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClear = async () => {
    if (!confirm("Delete all logs and reset onboarding? This cannot be undone.")) return;
    await clearAll();
    onCleared();
  };

  return (
    <div className="space-y-4">
      <Section title="Profile">
        <Row label="Age" value={profile.age ? `${profile.age}` : "—"} />
        <Row label="Weight" value={profile.weightKg ? `${profile.weightKg} kg` : "—"} />
        <Row label="Height" value={profile.heightCm ? `${profile.heightCm} cm` : "—"} />
        <Row label="Goals" value={profile.goals.length ? profile.goals.join(", ") : "—"} />
        <button
          onClick={() => setEditing(true)}
          className="w-full flex items-center justify-end gap-2 py-3 text-xs text-[#1967d2]"
        >
          <Pencil className="w-3.5 h-3.5" />Edit profile
        </button>
      </Section>

      {editing && (
        <EditProfile
          profile={profile}
          onClose={() => setEditing(false)}
          onSave={handleProfileSave}
        />
      )}

      <Section title="Photos">
        <button onClick={toggleThumbs} className="w-full flex items-center justify-between py-3">
          <div className="flex items-center gap-3">
            <Camera className="w-5 h-5 text-[#5f6368]" />
            <div className="text-left">
              <div className="text-[#202124]">Store thumbnails</div>
              <div className="text-xs text-[#5f6368]">Compressed copies for visual recall</div>
            </div>
          </div>
          <div className={`w-11 h-6 rounded-full p-0.5 ${profile.storeThumbnails ? "bg-[#34A853]" : "bg-[#dadce0]"}`}>
            <div className={`w-5 h-5 rounded-full bg-white transition-transform ${profile.storeThumbnails ? "translate-x-5" : ""}`} />
          </div>
        </button>
      </Section>

      <Section title="Data">
        <button onClick={handleExport} className="w-full flex items-center justify-between py-3 text-[#1967d2]">
          <span className="flex items-center gap-3"><Download className="w-5 h-5" />Export all data for medical reference (csv)</span>
        </button>
        <button onClick={handleClear} className="w-full flex items-center justify-between py-3 text-[#a50e0e]">
          <span className="flex items-center gap-3"><Trash2 className="w-5 h-5" />Delete everything</span>
        </button>
      </Section>

      <p className="text-xs text-[#9aa0a6] text-center">
        Circle Of Life · Zero-Cloud · v0.1 MVP
      </p>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-[#e8eaed] overflow-hidden">
      <div className="px-4 pt-3 pb-1 text-xs uppercase tracking-wide text-[#5f6368]">{title}</div>
      <div className="px-4 divide-y divide-[#f1f3f4]">{children}</div>
    </div>
  );
}

function Row({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-3">
      <span className="flex items-center gap-2 text-[#202124]">{icon}{label}</span>
      <span className="text-sm text-[#5f6368]">{value}</span>
    </div>
  );
}
