"use client";
import { useEffect, useRef, useState } from "react";
import { Send, Sparkles } from "lucide-react";
import type { AnyLog } from "@/lib/types";
import { saiGreeting, saiReply, type SaiMessage } from "@/lib/sai";

interface Props {
  logs: AnyLog[];
}

export function SaiChat({ logs }: Props) {
  const [messages, setMessages] = useState<SaiMessage[]>([]);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages([saiGreeting(logs)]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  const send = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const userMsg: SaiMessage = {
      id: crypto.randomUUID(),
      role: "user",
      timestamp: Date.now(),
      text: trimmed,
    };
    const reply = saiReply(trimmed, logs);
    setMessages((m) => [...m, userMsg, reply]);
    setInput("");
  };

  return (
    <div className="flex flex-col h-[calc(100vh-180px)] bg-white rounded-3xl border border-[#e8eaed] overflow-hidden">
      <div className="px-4 py-3 border-b border-[#e8eaed] flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#4285F4] to-[#34A853] flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
        <div>
          <div className="text-[#202124]">SAI</div>
          <div className="text-xs text-[#5f6368]">
            Your Personal Defecation Coach
          </div>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-3"
      >
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-line ${
                m.role === "user"
                  ? "bg-[#4285F4] text-white rounded-br-sm"
                  : "bg-[#f1f3f4] text-[#202124] rounded-bl-sm"
              }`}
            >
              {m.text}
              {m.chips && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {m.chips.map((c) => (
                    <button
                      key={c}
                      onClick={() => send(c)}
                      className="px-2.5 py-1 rounded-full bg-white border border-[#dadce0] text-xs text-[#1967d2] hover:bg-[#e8f0fe]"
                    >
                      {c}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-[#e8eaed] p-3 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send(input)}
          placeholder="Ask SAI…"
          className="flex-1 px-4 py-2 rounded-full border border-[#dadce0] text-sm focus:outline-none focus:border-[#4285F4]"
        />
        <button
          onClick={() => send(input)}
          className="w-10 h-10 rounded-full bg-[#4285F4] text-white flex items-center justify-center"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}