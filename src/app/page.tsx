"use client";

import { useChat } from "@ai-sdk/react";
import { useEffect, useRef, useState } from "react";
import { Send, Mic, Volume2, VolumeX, Image as ImageIcon, Loader2 } from "lucide-react";

export default function Chat() {
  const { messages, sendMessage, status, error } = useChat();
  const [input, setInput] = useState("");
  const isLoading = status === "submitted" || status === "streaming";
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Speech Recognition state
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  // TTS state
  const [isTTSActive, setIsTTSActive] = useState(false);

  // File state (Optional Bonus)
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || isLoading) return;
    sendMessage({ text });
    setInput("");
    setFile(null);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-8">
      {/* Background decoration */}
      <div className="fixed top-[-10%] left-[-10%] w-96 h-96 bg-[var(--color-hxh-green)] rounded-full blur-[150px] opacity-20 pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] w-96 h-96 bg-[var(--color-hxh-accent)] rounded-full blur-[150px] opacity-20 pointer-events-none" />

      <div className="glass w-full max-w-4xl flex flex-col rounded-3xl overflow-hidden shadow-2xl border border-white/10 h-[90vh] z-10 relative">
        
        {/* Header */}
        <div className="bg-black/40 border-b border-white/10 p-6 flex justify-between items-center backdrop-blur-md">
          <div>
            <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-hxh-green)] to-[var(--color-hxh-accent)] animate-glow inline-block">
              Hunter x Hunter 
            </h1>
            <span className="ml-2 text-white/80 font-medium">RAG Terminal</span>
            <p className="text-xs text-white/50 mt-1">Specialized Knowledge Base & Team Info</p>
          </div>
          <button 
            onClick={() => setIsTTSActive(!isTTSActive)}
            className={`p-3 rounded-full transition-all duration-300 ${isTTSActive ? 'bg-[var(--color-hxh-green)] text-black shadow-[0_0_15px_rgba(0,255,136,0.5)]' : 'bg-white/5 text-white/60 hover:bg-white/10'}`}
            title={isTTSActive ? "Voice Output Active" : "Enable Voice Output"}
          >
            {isTTSActive ? <Volume2 size={20} /> : <VolumeX size={20} />}
          </button>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full opacity-60 text-center">
              <div className="w-24 h-24 mb-6 rounded-full border-2 border-[var(--color-hxh-green)] border-dashed animate-spin-slow flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-[var(--color-hxh-green)] opacity-20 animate-ping" />
              </div>
              <h2 className="text-xl font-bold text-[var(--color-hxh-green)] mb-2">System Online</h2>
              <p className="text-white/70 max-w-md">
                You can ask me anything about the Hunter x Hunter universe, the Nen system, characters, or details about the development team!
              </p>
            </div>
          ) : (
            messages.map((m) => (
              <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-2xl p-5 ${
                  m.role === 'user' 
                    ? 'bg-gradient-to-br from-[var(--color-hxh-green)] to-[var(--color-hxh-accent)] text-black rounded-tr-sm shadow-lg' 
                    : 'bg-black/60 border border-[var(--color-hxh-green)]/20 text-white/90 rounded-tl-sm glass-glow'
                }`}>
                  <div className="flex items-center mb-2 opacity-80">
                    <span className="text-xs font-bold uppercase tracking-wider">
                      {m.role === 'user' ? 'Hunter (User)' : 'Nen Database (AI)'}
                    </span>
                  </div>
                  <div className="prose prose-invert whitespace-pre-wrap text-sm sm:text-base">
                    {m.parts.map((part: any, i: number) =>
                      part.type === "text" ? <span key={i}>{part.text}</span> : null
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-black/60 border border-[var(--color-hxh-green)]/20 rounded-2xl p-5 rounded-tl-sm flex items-center space-x-3 glass-glow">
                <Loader2 className="animate-spin text-[var(--color-hxh-green)]" size={20} />
                <span className="text-[var(--color-hxh-green)] text-sm animate-pulse">Retrieving knowledge...</span>
              </div>
            </div>
          )}
          {error && (
            <div className="flex justify-start">
              <div className="bg-red-500/10 border border-red-500/40 text-red-300 rounded-2xl p-5 rounded-tl-sm text-sm">
                <div className="font-bold mb-1">Error</div>
                <div className="whitespace-pre-wrap">{error.message}</div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-black/40 border-t border-white/10 backdrop-blur-md">
          {file && (
            <div className="mb-3 px-4 py-2 bg-white/5 rounded-lg flex items-center justify-between border border-white/10">
              <span className="text-sm text-white/70 truncate">{file.name}</span>
              <button onClick={() => setFile(null)} className="text-red-400 hover:text-red-300 text-sm font-medium">Remove</button>
            </div>
          )}
          <form onSubmit={onSubmit} className="flex gap-2 relative">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-4 rounded-xl bg-white/5 text-white/60 hover:text-[var(--color-hxh-green)] hover:bg-white/10 transition-colors"
              title="Upload Character Image"
            >
              <ImageIcon size={22} />
            </button>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  setFile(e.target.files[0]);
                }
              }}
            />
            
            <input
              className="flex-1 bg-black/50 border border-white/20 text-white placeholder-white/40 rounded-xl px-5 py-4 focus:outline-none focus:border-[var(--color-hxh-green)] focus:ring-1 focus:ring-[var(--color-hxh-green)] transition-all shadow-inner"
              value={input}
              placeholder="Ask about Hunter x Hunter or the team..."
              onChange={(e) => setInput(e.target.value)}
            />

            <button
              type="button"
              onClick={toggleListen}
              className={`p-4 rounded-xl transition-all ${isListening ? 'bg-red-500/20 text-red-400 border border-red-500/50 animate-pulse' : 'bg-white/5 text-white/60 hover:text-[var(--color-hxh-green)] hover:bg-white/10'}`}
              title="Voice Input"
            >
              <Mic size={22} />
            </button>

            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="bg-gradient-to-r from-[var(--color-hxh-green)] to-[var(--color-hxh-accent)] text-black p-4 rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-[0_0_20px_rgba(0,255,136,0.4)] transition-all flex items-center justify-center w-16"
            >
              <Send size={22} className={isLoading ? "animate-bounce" : ""} />
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
