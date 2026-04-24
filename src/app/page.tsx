"use client";

import { useChat } from "@ai-sdk/react";
import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Send,
  Mic,
  Volume2,
  VolumeX,
  Loader2,
  Square,
  Trash2,
  X,
  Sparkles,
  User,
} from "lucide-react";

const SUGGESTIONS = [
  "Who is Killua Zoldyck?",
  "Explain the Nen system",
  "Who built this chatbot?",
];

export default function Chat() {
  const {
    messages,
    sendMessage,
    status,
    error,
    stop,
    setMessages,
    clearError,
  } = useChat();
  const [input, setInput] = useState("");
  const isStreaming = status === "streaming";
  const isLoading = status === "submitted" || isStreaming;
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Speech Recognition state
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  // TTS state
  const [isTTSActive, setIsTTSActive] = useState(false);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Auto-resize textarea
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight, 180) + "px";
  }, [input]);

  // Handle TTS for new bot messages
  useEffect(() => {
    if (!isTTSActive || isLoading || messages.length === 0) return;
    const lastMsg = messages[messages.length - 1];
    if (lastMsg.role === "assistant") {
      const text = lastMsg.parts
        .filter((p: any) => p.type === "text")
        .map((p: any) => p.text)
        .join(" ");
      if (!text) return;
      const utterance = new SpeechSynthesisUtterance(text);
      const voices = window.speechSynthesis.getVoices();
      const voice = voices.find(v => v.name.includes("Google") || v.lang.includes("en")) || voices[0];
      if (voice) utterance.voice = voice;
      window.speechSynthesis.speak(utterance);
    }
  }, [messages, isLoading, isTTSActive]);

  // Init Speech Recognition
  useEffect(() => {
    if (typeof window !== "undefined" && ("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(prev => (prev ? prev + " " : "") + transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = () => setIsListening(false);
      recognitionRef.current.onend = () => setIsListening(false);
    }
  }, []);

  const toggleListen = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  const submit = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;
    sendMessage({ text: trimmed });
    setInput("");
  };

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    submit(input);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit(input);
    }
  };

  const clearChat = () => {
    if (isLoading) stop();
    setMessages([]);
    clearError?.();
  };

  return (
    <main className="flex h-dvh w-full flex-col items-center justify-center p-2 sm:p-6">
      {/* Background decoration */}
      <div className="pointer-events-none fixed top-[-15%] left-[-10%] h-[28rem] w-[28rem] rounded-full bg-[var(--color-hxh-green)] opacity-15 blur-[160px]" />
      <div className="pointer-events-none fixed bottom-[-15%] right-[-10%] h-[28rem] w-[28rem] rounded-full bg-[var(--color-hxh-accent)] opacity-15 blur-[160px]" />

      <div className="glass relative z-10 flex h-full w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-white/10 shadow-2xl sm:rounded-3xl">

        {/* Header */}
        <header className="flex items-center justify-between gap-3 border-b border-white/10 bg-black/40 px-4 py-3 backdrop-blur-md sm:px-6 sm:py-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--color-hxh-green)] to-[var(--color-hxh-accent)] shadow-[0_0_18px_rgba(0,255,136,0.35)]">
              <Sparkles size={20} className="text-black" strokeWidth={2.5} />
            </div>
            <div className="min-w-0">
              <h1 className="truncate text-base font-semibold tracking-tight text-white sm:text-lg">
                <span className="bg-gradient-to-r from-[var(--color-hxh-green)] to-[var(--color-hxh-accent)] bg-clip-text text-transparent">
                  Hunter x Hunter
                </span>
                <span className="ml-2 text-white/70">Nen Database</span>
              </h1>
              <p className="truncate text-[11px] text-white/45 sm:text-xs">
                Specialized RAG assistant · HxH lore & team info
              </p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            <button
              onClick={() => setIsTTSActive(!isTTSActive)}
              className={`rounded-lg p-2 transition-colors ${
                isTTSActive
                  ? "bg-[var(--color-hxh-green)]/15 text-[var(--color-hxh-green)] ring-1 ring-[var(--color-hxh-green)]/40"
                  : "text-white/55 hover:bg-white/5 hover:text-white"
              }`}
              title={isTTSActive ? "Disable voice output" : "Enable voice output"}
              aria-label="Toggle voice output"
            >
              {isTTSActive ? <Volume2 size={18} /> : <VolumeX size={18} />}
            </button>
            <button
              onClick={clearChat}
              disabled={messages.length === 0 && !error}
              className="rounded-lg p-2 text-white/55 transition-colors hover:bg-white/5 hover:text-white disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-white/55"
              title="Clear conversation"
              aria-label="Clear conversation"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </header>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto px-3 py-5 sm:px-6 sm:py-6">
          {messages.length === 0 && !error ? (
            <div className="flex h-full flex-col items-center justify-center px-4 text-center">
              <div className="relative mb-6 flex h-20 w-20 items-center justify-center">
                <div className="absolute inset-0 rounded-full border border-dashed border-[var(--color-hxh-green)]/40 animate-spin-slow" />
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[var(--color-hxh-green)] to-[var(--color-hxh-accent)] shadow-[0_0_22px_rgba(0,255,136,0.4)]">
                  <Sparkles size={22} className="text-black" strokeWidth={2.5} />
                </div>
              </div>
              <h2 className="mb-2 text-lg font-semibold text-white sm:text-xl">
                How can I help you today?
              </h2>
              <p className="mb-6 max-w-md text-sm text-white/60">
                Ask about the Hunter x Hunter universe, the Nen system, characters, or the team that built this bot.
              </p>
              <div className="flex w-full max-w-xl flex-wrap justify-center gap-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => submit(s)}
                    className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-white/75 transition-colors hover:border-[var(--color-hxh-green)]/40 hover:bg-[var(--color-hxh-green)]/[0.06] hover:text-white"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <ul className="space-y-5">
              {messages.map((m) => {
                const isUser = m.role === "user";
                const text = m.parts
                  .map((p: any) => (p.type === "text" ? p.text : ""))
                  .join("");
                return (
                  <li
                    key={m.id}
                    className={`flex animate-fade-in-up gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}
                  >
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                        isUser
                          ? "bg-white/[0.07] text-white/80 ring-1 ring-white/10"
                          : "bg-gradient-to-br from-[var(--color-hxh-green)] to-[var(--color-hxh-accent)] text-black shadow-[0_0_12px_rgba(0,255,136,0.3)]"
                      }`}
                      aria-hidden
                    >
                      {isUser ? <User size={15} /> : <Sparkles size={15} strokeWidth={2.5} />}
                    </div>
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm sm:text-[15px] ${
                        isUser
                          ? "rounded-tr-md bg-[var(--color-hxh-green)]/12 text-white ring-1 ring-[var(--color-hxh-green)]/25"
                          : "rounded-tl-md bg-white/[0.04] text-white/90 ring-1 ring-white/10"
                      }`}
                    >
                      {isUser ? (
                        <div className="whitespace-pre-wrap break-words leading-relaxed">{text}</div>
                      ) : (
                        <div className="prose break-words">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>{text}</ReactMarkdown>
                        </div>
                      )}
                    </div>
                  </li>
                );
              })}
              {isLoading && (
                <li className="flex animate-fade-in-up gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[var(--color-hxh-green)] to-[var(--color-hxh-accent)] text-black shadow-[0_0_12px_rgba(0,255,136,0.3)]">
                    <Sparkles size={15} strokeWidth={2.5} />
                  </div>
                  <div className="rounded-2xl rounded-tl-md bg-white/[0.04] px-4 py-3 ring-1 ring-white/10">
                    <span className="typing-dot" />
                    <span className="typing-dot" />
                    <span className="typing-dot" />
                  </div>
                </li>
              )}
            </ul>
          )}
          {error && (
            <div className="mt-4 flex animate-fade-in-up items-start justify-between gap-3 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              <div className="min-w-0">
                <div className="mb-0.5 font-semibold">Something went wrong</div>
                <div className="whitespace-pre-wrap break-words text-red-200/80">{error.message}</div>
              </div>
              <button
                onClick={() => clearError?.()}
                className="shrink-0 rounded-md p-1 text-red-200/70 hover:bg-red-500/15 hover:text-red-100"
                aria-label="Dismiss error"
              >
                <X size={16} />
              </button>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-white/10 bg-black/40 px-3 py-3 backdrop-blur-md sm:px-4 sm:py-4">
          <form onSubmit={onSubmit}>
            <div className="flex items-end gap-2 rounded-2xl border border-white/10 bg-black/50 p-2 transition-colors focus-within:border-[var(--color-hxh-green)]/50 focus-within:ring-1 focus-within:ring-[var(--color-hxh-green)]/30">
              <button
                type="button"
                onClick={toggleListen}
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors ${
                  isListening
                    ? "bg-red-500/15 text-red-300 ring-1 ring-red-500/40"
                    : "text-white/55 hover:bg-white/5 hover:text-[var(--color-hxh-green)]"
                }`}
                title="Voice input"
                aria-label="Voice input"
              >
                <Mic size={18} />
              </button>
              <textarea
                ref={textareaRef}
                rows={1}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Ask about Hunter x Hunter or the team…"
                className="max-h-[180px] flex-1 resize-none bg-transparent px-2 py-2 text-sm text-white placeholder-white/35 focus:outline-none sm:text-[15px]"
              />
              {isLoading ? (
                <button
                  type="button"
                  onClick={() => stop()}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/[0.07] text-white/85 ring-1 ring-white/15 transition-colors hover:bg-white/[0.12]"
                  title="Stop generating"
                  aria-label="Stop generating"
                >
                  {isStreaming ? <Square size={16} fill="currentColor" /> : <Loader2 size={18} className="animate-spin" />}
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={!input.trim()}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--color-hxh-green)] to-[var(--color-hxh-accent)] text-black shadow-[0_0_14px_rgba(0,255,136,0.3)] transition-all hover:shadow-[0_0_22px_rgba(0,255,136,0.5)] disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
                  title="Send"
                  aria-label="Send message"
                >
                  <Send size={17} />
                </button>
              )}
            </div>
            <p className="mt-2 px-1 text-center text-[11px] text-white/35">
              Press <kbd className="rounded border border-white/10 bg-white/5 px-1 py-0.5 text-[10px] text-white/55">Enter</kbd> to send · <kbd className="rounded border border-white/10 bg-white/5 px-1 py-0.5 text-[10px] text-white/55">Shift</kbd>+<kbd className="rounded border border-white/10 bg-white/5 px-1 py-0.5 text-[10px] text-white/55">Enter</kbd> for newline
            </p>
          </form>
        </div>
      </div>
    </main>
  );
}
