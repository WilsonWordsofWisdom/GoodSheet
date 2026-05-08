"use client";
import { X, Bell, CheckCheck } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface Props {
  open: boolean;
  onClose: () => void;
  notifications: string[];
  readNotifs: string[];
}

export function NotificationPanel({ open, onClose, notifications, readNotifs }: Props) {
  const isEmpty = notifications.length === 0;

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="notif-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Panel — slides up from bottom */}
          <motion.div
            key="notif-panel"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 320 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl shadow-2xl max-w-2xl mx-auto max-h-[75vh] flex flex-col"
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1 shrink-0">
              <div className="w-10 h-1 rounded-full bg-[#e8eaed]" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-[#e8eaed] shrink-0">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-[#FBBC05]" />
                <h2 className="text-base font-semibold text-[#202124]">Notifications</h2>
                {notifications.length > 0 && (
                  <span className="text-xs font-medium bg-[#fef7e0] text-[#b06000] px-2 py-0.5 rounded-full">
                    {notifications.length}
                  </span>
                )}
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-[#f1f3f4] text-[#5f6368] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* List */}
            <div className="overflow-y-auto flex-1 px-5 py-3 space-y-2">
              {isEmpty ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3 text-center">
                  <div className="w-14 h-14 rounded-full bg-[#f1f3f4] flex items-center justify-center">
                    <CheckCheck className="w-7 h-7 text-[#34A853]" />
                  </div>
                  <p className="text-sm font-medium text-[#202124]">All clear!</p>
                  <p className="text-xs text-[#5f6368] max-w-[220px]">
                    No nudges right now. Keep logging to stay on track.
                  </p>
                </div>
              ) : (
                notifications.map((msg, i) => {
                  const isRead = readNotifs.includes(msg);
                  return (
                    <div
                      key={i}
                      className={`flex items-start gap-3 rounded-2xl p-4 transition-colors ${
                        isRead
                          ? "bg-[#f8f9fa] border border-[#e8eaed]"
                          : "bg-[#fef7e0] border border-[#f9c845]/40"
                      }`}
                    >
                      <div className="shrink-0 mt-0.5">
                        {isRead ? (
                          <div className="w-2 h-2 rounded-full bg-[#bdc1c6]" />
                        ) : (
                          <div className="w-2 h-2 rounded-full bg-[#FBBC05]" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm leading-relaxed ${isRead ? "text-[#5f6368]" : "text-[#b06000] font-medium"}`}>
                          {msg}
                        </p>
                        <p className="text-xs text-[#bdc1c6] mt-1">
                          {isRead ? "Read" : "New"}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Bottom safe area padding */}
            <div className="h-6 shrink-0" />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
