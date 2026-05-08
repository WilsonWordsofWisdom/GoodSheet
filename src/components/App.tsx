"use client";
import { useEffect, useState } from "react";
import {
  MessageCircle,
  Settings as SettingsIcon,
  Bell,
} from "lucide-react";
import { Home } from "./Home";
import { Insights } from "./Insights";
import { SaiChat } from "./SaiChat";
import { Settings } from "./Settings";
import { Logger } from "./Logger";
import { Onboarding } from "./Onboarding";
import { AppIcon } from "./AppIcon";
import { NotificationPanel } from "./NotificationPanel";
import { ToiletIcon } from "./ToiletIcon";
import { ToiletRollIcon } from "./ToiletRollIcon";
import type { AnyLog, UserProfile } from "@/lib/types";
import {
  getAllLogs,
  getProfile,
  saveProfile,
  deleteLog,
} from "@/lib/storage";
import { checkReminders } from "@/lib/sai";

const NOTIF_SEEN_KEY = "goodshit_notif_seen";

function loadSeenNotifs(): string[] {
  try {
    return JSON.parse(localStorage.getItem(NOTIF_SEEN_KEY) ?? "[]");
  } catch {
    return [];
  }
}

type Tab = "home" | "insights" | "sai" | "settings";

export default function App() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [logs, setLogs] = useState<AnyLog[]>([]);
  const [tab, setTab] = useState<Tab>("home");
  const [loggerOpen, setLoggerOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [readNotifs, setReadNotifs] = useState<string[]>(loadSeenNotifs);

  useEffect(() => {
    (async () => {
      const [p, l] = await Promise.all([getProfile(), getAllLogs()]);
      setProfile(p);
      setLogs(l);
      setLoaded(true);
    })();
  }, []);

  const refreshLogs = async () => setLogs(await getAllLogs());

  const handleOnboard = async (p: UserProfile) => {
    await saveProfile(p);
    setProfile(p);
  };

  const handleDeleteLog = async (id: string) => {
    await deleteLog(id);
    refreshLogs();
  };

  const handleCleared = async () => {
    setProfile(null);
    setLogs([]);
  };

  const reminders = checkReminders(logs);
  const unreadCount = reminders.filter((r) => !readNotifs.includes(r)).length;

  const handleOpenNotifs = () => {
    setNotifOpen(true);
    // Mark all current reminders as read
    const merged = Array.from(new Set([...readNotifs, ...reminders]));
    setReadNotifs(merged);
    localStorage.setItem(NOTIF_SEEN_KEY, JSON.stringify(merged));
  };

  if (!loaded) {
    return (
      <div className="size-full flex items-center justify-center bg-white text-[#5f6368]">
        Loading…
      </div>
    );
  }

  if (!profile) {
    return <Onboarding onComplete={handleOnboard} />;
  }

  return (
    <div className="size-full bg-[#f8f9fa] flex flex-col">
      <header className="bg-white border-b border-[#e8eaed] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AppIcon size={32} />
          <h1 className="text-[#202124]">Goodsh!t</h1>
        </div>
        {/* Notification bell */}
        <button
          onClick={handleOpenNotifs}
          className="relative p-2 rounded-full hover:bg-[#f1f3f4] text-[#5f6368] hover:text-[#202124] transition-colors"
          aria-label="Notifications"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#EA4335] text-white text-[10px] font-bold flex items-center justify-center leading-none">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
      </header>

      <main className="flex-1 overflow-y-auto px-4 py-5 pb-28 max-w-2xl mx-auto w-full">
        {tab === "home" && (
          <Home
            logs={logs}
            reminders={reminders}
            onDeleteLog={handleDeleteLog}
            onLogEntry={() => setLoggerOpen(true)}
          />
        )}
        {tab === "insights" && <Insights logs={logs} />}
        {tab === "sai" && <SaiChat logs={logs} />}
        {tab === "settings" && (
          <Settings
            profile={profile}
            onProfileChange={setProfile}
            onCleared={handleCleared}
          />
        )}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#e8eaed] px-2 py-1 grid grid-cols-4 max-w-2xl mx-auto">
        <NavBtn
          active={tab === "home"}
          onClick={() => setTab("home")}
          icon={<ToiletIcon className="w-5 h-5" />}
          label="Home"
        />
        <NavBtn
          active={tab === "insights"}
          onClick={() => setTab("insights")}
          icon={<ToiletRollIcon className="w-5 h-5" />}
          label="Insights"
        />
        <NavBtn
          active={tab === "sai"}
          onClick={() => setTab("sai")}
          icon={<MessageCircle className="w-5 h-5" />}
          label="SAI"
        />
        <NavBtn
          active={tab === "settings"}
          onClick={() => setTab("settings")}
          icon={<SettingsIcon className="w-5 h-5" />}
          label="Settings"
        />
      </nav>

      <Logger
        open={loggerOpen}
        onClose={() => setLoggerOpen(false)}
        onSaved={refreshLogs}
        storeThumbnails={profile.storeThumbnails}
        userProfile={profile}
      />

      <NotificationPanel
        open={notifOpen}
        onClose={() => setNotifOpen(false)}
        notifications={reminders}
        readNotifs={readNotifs}
      />
    </div>
  );
}

function NavBtn({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-0.5 py-2 rounded-xl transition ${
        active ? "text-[#4285F4]" : "text-[#5f6368]"
      }`}
    >
      {icon}
      <span className="text-xs">{label}</span>
    </button>
  );
}