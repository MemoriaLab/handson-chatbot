"use client";

import { useState, useRef, useEffect } from "react";
import ChatMessageContent from "@/components/ChatMessageContent";
import type { ChatMode } from "@/lib/ai";

type Message = {
  role: "user" | "bot";
  text: string;
};

const ERROR_MESSAGE =
  "回答を取得できませんでした。しばらくしてからお試しください。";

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [compareMode, setCompareMode] = useState(false);
  const [chatMode, setChatMode] = useState<ChatMode>("default");
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "bot",
      text: "こんにちは！Taskmateについてご質問があればお気軽にどうぞ。",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  async function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;

    setInput("");
    setMessages((prev) => [...prev, { role: "user", text: trimmed }]);
    setIsLoading(true);

    const mode = compareMode ? chatMode : "default";

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed, mode }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        const detail =
          typeof err.error === "string" ? err.error : ERROR_MESSAGE;
        setMessages((prev) => [...prev, { role: "bot", text: detail }]);
        return;
      }

      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { role: "bot", text: data.answer },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "bot", text: ERROR_MESSAGE },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  function handleSend() {
    sendMessage(input);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !e.nativeEvent.isComposing) handleSend();
  }

  const modeLabel =
    chatMode === "default"
      ? "通常（Chapter 6）"
      : chatMode === "base"
        ? "ベース"
        : chatMode === "prompt"
          ? "プロンプト版"
          : "fine-tuning版";

  return (
    <>
      {isOpen && (
        <div
          className="fixed bottom-24 right-6 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden z-50 border border-gray-200"
          style={{ height: compareMode ? "520px" : "480px" }}
        >
          <div className="bg-blue-600 px-4 py-3 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-white"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
                </svg>
              </div>
              <div>
                <p className="text-white text-sm font-semibold">
                  Taskmate サポート
                </p>
                <p className="text-blue-200 text-xs">
                  {compareMode ? `比較: ${modeLabel}` : "よくある質問にお答えします"}
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/70 hover:text-white transition-colors"
              aria-label="チャットを閉じる"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {compareMode && (
            <div className="px-3 py-2 border-b border-gray-100 bg-slate-50 flex-shrink-0">
              <select
                value={chatMode}
                onChange={(e) => setChatMode(e.target.value as ChatMode)}
                className="w-full text-xs rounded-lg border border-gray-200 px-2 py-1.5 bg-white"
                aria-label="比較モード"
              >
                <option value="base">ベースモデル</option>
                <option value="prompt">プロンプト版（Taskmate + ペルソナ）</option>
                <option value="tuned">fine-tuning 版（Vertex）</option>
              </select>
            </div>
          )}

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[78%] px-3 py-2 rounded-2xl text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-blue-600 text-white rounded-br-sm"
                      : "bg-gray-100 text-gray-800 rounded-bl-sm"
                  }`}
                >
                  {msg.role === "bot" ? (
                    <ChatMessageContent text={msg.text} />
                  ) : (
                    msg.text
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="max-w-[78%] px-3 py-2 rounded-2xl text-sm bg-gray-100 text-gray-500 rounded-bl-sm">
                  考え中…
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <div className="px-3 py-2 border-t border-gray-100 flex-shrink-0">
            <label className="flex items-center gap-2 text-xs text-gray-500 mb-2 cursor-pointer">
              <input
                type="checkbox"
                checked={compareMode}
                onChange={(e) => {
                  setCompareMode(e.target.checked);
                  if (e.target.checked && chatMode === "default") {
                    setChatMode("prompt");
                  }
                }}
                className="rounded"
              />
              Chapter 6.5 比較モード（キャラクター・安定性）
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="メッセージを入力..."
                disabled={isLoading}
                className="flex-1 text-sm bg-gray-100 rounded-full px-4 py-2 outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="w-9 h-9 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white rounded-full flex items-center justify-center transition-colors flex-shrink-0"
                aria-label="送信"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center transition-colors z-50"
        aria-label={isOpen ? "チャットを閉じる" : "チャットを開く"}
      >
        {isOpen ? (
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
          </svg>
        )}
      </button>
    </>
  );
}
