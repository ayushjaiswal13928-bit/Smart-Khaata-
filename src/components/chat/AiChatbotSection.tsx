"use client";

import { useState, useRef, useEffect } from "react";
import {
  Send,
  Bot,
  User,
  Sparkles,
  Zap,
  Brain,
  RefreshCw,
  Copy,
  Check,
} from "lucide-react";
import { Lang, ChatMessage } from "../../lib/types";

interface AiChatbotSectionProps {
  lang: Lang;
  onNavigateToScan?: () => void;
}

const DEFAULT_PROMPTS = {
  hi: [
    { text: "🌾 गेहूं में पीलापन आ रहा है, कौन सा खाद या स्प्रे डालें?", type: "complex" as const },
    { text: "⚡ किरायेदार का 180 यूनिट बिजली बिल ₹8 प्रति यूनिट से कितना बनेगा?", type: "fast" as const },
    { text: "💰 5 बीघा में सोयाबीन की अनुमानित लागत और संभावित मुनाफा कितना होगा?", type: "complex" as const },
    { text: "📄 किरायेदार को WhatsApp पर भेजने के लिए किराया रसीद का मैसेज लिखो", type: "general" as const },
    { text: "🏠 घरेलू मासिक बजट को 15% कम करने के आसान उपाय बताओ", type: "general" as const },
  ],
  en: [
    { text: "🌾 Wheat leaves are turning yellow, what fertilizer or spray should I use?", type: "complex" as const },
    { text: "⚡ Calculate electricity bill for 180 units at ₹8 per unit", type: "fast" as const },
    { text: "💰 What is the estimated cost and profit for soybean in 5 bigha?", type: "complex" as const },
    { text: "📄 Draft a polite WhatsApp rent reminder receipt message for tenant", type: "general" as const },
    { text: "🏠 Give 5 actionable tips to reduce household expenses by 15%", type: "general" as const },
  ],
};

export function AiChatbotSection({ lang, onNavigateToScan }: AiChatbotSectionProps) {
  const isHi = lang === "hi";

  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: "welcome-1",
      role: "assistant",
      content: isHi
        ? `नमस्ते! मैं **Smart Khaata AI सलाहकार** हूँ। 🌾🏡\n\nमैं आपकी खेती (फसल रोग, खाद, मंडी भाव), मकान किराया (मीटर रीडिंग, रसीद मैसेज) और घर के बजट की योजना में तुरंत मदद कर सकता हूँ।\n\nआप मुझसे कुछ भी पूछ सकते हैं या नीचे दिए गए सुझावों में से चुनें!`
        : `Hello! I am your **Smart Khaata AI Advisor & Assistant**. 🌾🏡\n\nI can help you with crop planning, disease diagnosis, tenant rental calculations, electricity bills, and household budget optimization.\n\nAsk me anything or tap one of the quick suggestions below!`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      modelUsed: "gemini-3.8-flash",
    },
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [taskType, setTaskType] = useState<"fast" | "general" | "complex">("general");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSend = async (textToSend?: string, overrideTaskType?: "fast" | "general" | "complex") => {
    const query = (textToSend || input).trim();
    if (!query || loading) return;

    const currentTask = overrideTaskType || taskType;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const historyPayload = messages.slice(-10).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      let modelName = "gemini-3.8-flash";
      if (currentTask === "complex") modelName = "gemini-3.1-pro-preview";
      else if (currentTask === "fast") modelName = "gemini-3.1-flash-lite";

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: historyPayload,
          prompt: query,
          taskType: currentTask,
          requestedModel: modelName,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to get AI response");
      }

      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: data.text || (isHi ? "उत्तर प्राप्त नहीं हो सका।" : "No response generated."),
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        modelUsed: data.model || modelName,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      console.error("AI Chat error:", err);
      const errorMessage: ChatMessage = {
        id: `err-${Date.now()}`,
        role: "assistant",
        content: isHi
          ? `⚠️ क्षमा करें, AI उत्तर में समस्या आई: ${err.message || "कृपया दोबारा प्रयास करें"}`
          : `⚠️ Sorry, unable to complete request: ${err.message || "Please try again"}`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const clearChat = () => {
    setMessages([
      {
        id: "welcome-reset",
        role: "assistant",
        content: isHi
          ? "बातचीत रीसेट हो गई है। आप खेती, किराया या घर खर्च से जुड़ा कोई भी नया प्रश्न पूछ सकते हैं।"
          : "Chat history cleared. You can ask fresh questions about farming, rent, or expenses.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        modelUsed: "gemini-3.8-flash",
      },
    ]);
  };

  const activePrompts = isHi ? DEFAULT_PROMPTS.hi : DEFAULT_PROMPTS.en;

  return (
    <div className="w-full max-w-[900px] mx-auto px-3 sm:px-4 pb-20 flex flex-col h-[calc(100vh-140px)] min-h-[550px]">
      {/* HEADER CONTROLS */}
      <div className="shrink-0 mb-3 flex flex-wrap items-center justify-between gap-2 border-b border-[var(--sk-border)] pb-3">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-green-600 to-emerald-500 flex items-center justify-center text-white shadow-md">
            <Bot size={20} />
          </div>
          <div>
            <h2 className="text-base font-bold text-[var(--sk-text)] flex items-center gap-1.5">
              Smart Khaata AI
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-500/15 text-green-400 font-semibold border border-green-500/20">
                Gemini Multi-Turn
              </span>
            </h2>
            <p className="text-[11px] text-[var(--sk-muted)]">
              {isHi ? "खेती, किराया और हिसाब-किताब का निजी सलाहकार" : "Farm, rent & budget conversational advisor"}
            </p>
          </div>
        </div>

        {/* TASK TYPE / MODEL SELECTOR */}
        <div className="flex items-center gap-1 bg-[var(--sk-card2)] p-1 rounded-xl border border-[var(--sk-border)] text-xs">
          <button
            type="button"
            onClick={() => setTaskType("fast")}
            title="gemini-3.1-flash-lite (Fast Tasks)"
            className={`px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1 transition cursor-pointer ${
              taskType === "fast" ? "bg-amber-500 text-white shadow-sm" : "text-[var(--sk-muted)] hover:text-white"
            }`}
          >
            <Zap size={12} />
            {isHi ? "तेज़ (Lite)" : "Fast"}
          </button>
          <button
            type="button"
            onClick={() => setTaskType("general")}
            title="gemini-3.8-flash (General Tasks)"
            className={`px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1 transition cursor-pointer ${
              taskType === "general" ? "bg-green-600 text-white shadow-sm" : "text-[var(--sk-muted)] hover:text-white"
            }`}
          >
            <Sparkles size={12} />
            {isHi ? "सामान्य (Flash)" : "General"}
          </button>
          <button
            type="button"
            onClick={() => setTaskType("complex")}
            title="gemini-3.1-pro-preview (Complex Tasks)"
            className={`px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1 transition cursor-pointer ${
              taskType === "complex" ? "bg-purple-600 text-white shadow-sm" : "text-[var(--sk-muted)] hover:text-white"
            }`}
          >
            <Brain size={12} />
            {isHi ? "गहन (Pro)" : "Complex Pro"}
          </button>

          <button
            type="button"
            onClick={clearChat}
            title={isHi ? "बातचीत साफ करें" : "Clear conversation"}
            className="p-1 text-[var(--sk-dim)] hover:text-red-400 hover:bg-white/5 rounded-lg ml-1 cursor-pointer"
          >
            <RefreshCw size={13} />
          </button>
        </div>
      </div>

      {/* QUICK PROMPT CHIPS */}
      <div className="shrink-0 mb-3 overflow-x-auto no-scrollbar flex items-center gap-2 py-1">
        {activePrompts.map((p, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSend(p.text, p.type)}
            className="shrink-0 text-[11px] px-3 py-1.5 rounded-full border border-[var(--sk-border)] bg-[var(--sk-card)] hover:border-green-500/50 hover:bg-green-500/10 text-[var(--sk-muted)] hover:text-[var(--sk-text)] transition cursor-pointer"
          >
            {p.text}
          </button>
        ))}
      </div>

      {/* CHAT MESSAGES SCROLLABLE THREAD */}
      <div className="flex-1 overflow-y-auto rounded-2xl border border-[var(--sk-border)] bg-[var(--sk-card3)] p-3 sm:p-4 space-y-4">
        {messages.map((m) => {
          const isUser = m.role === "user";
          return (
            <div
              key={m.id}
              className={`flex items-start gap-2.5 ${isUser ? "flex-row-reverse" : "flex-row"}`}
            >
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs ${
                  isUser
                    ? "bg-green-600 text-white"
                    : "bg-slate-800 text-green-400 border border-green-500/30"
                }`}
              >
                {isUser ? <User size={14} /> : <Bot size={14} />}
              </div>

              <div
                className={`max-w-[85%] sm:max-w-[80%] rounded-2xl p-3.5 text-xs sm:text-sm leading-relaxed shadow-sm ${
                  isUser
                    ? "bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-tr-none"
                    : "bg-[var(--sk-card)] text-[var(--sk-text)] border border-[var(--sk-border)] rounded-tl-none"
                }`}
              >
                <div className="whitespace-pre-wrap break-words">
                  {m.content}
                </div>

                <div className="mt-2 pt-1 border-t border-white/10 flex items-center justify-between text-[10px] text-[var(--sk-dim)]">
                  <span>
                    {m.timestamp} {m.modelUsed && `• ${m.modelUsed}`}
                  </span>
                  {!isUser && (
                    <button
                      type="button"
                      onClick={() => handleCopy(m.id, m.content)}
                      className="hover:text-white transition flex items-center gap-1 cursor-pointer"
                    >
                      {copiedId === m.id ? <Check size={11} className="text-green-400" /> : <Copy size={11} />}
                      {copiedId === m.id ? (isHi ? "कॉपी हुआ" : "Copied") : (isHi ? "कॉपी" : "Copy")}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex items-start gap-2.5">
            <div className="w-7 h-7 rounded-full bg-slate-800 border border-green-500/30 flex items-center justify-center text-green-400 shrink-0 animate-pulse">
              <Bot size={14} />
            </div>
            <div className="rounded-2xl rounded-tl-none bg-[var(--sk-card)] border border-[var(--sk-border)] p-3.5 text-xs text-[var(--sk-muted)] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-ping" />
              <span>
                {taskType === "complex"
                  ? isHi
                    ? "Gemini Pro गहन विश्लेषण कर रहा है..."
                    : "Gemini Pro is reasoning deeply..."
                  : isHi
                  ? "Smart Khaata AI उत्तर तैयार कर रहा है..."
                  : "Smart Khaata AI is thinking..."}
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* INPUT BAR */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="shrink-0 mt-3 flex items-center gap-2 bg-[var(--sk-card)] border border-[var(--sk-border)] rounded-2xl p-1.5 shadow-lg focus-within:border-green-500/60"
      >
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={
            isHi
              ? "खेती, किराया या खर्च के बारे में पूछें..."
              : "Ask about crops, rents, bills, or finances..."
          }
          className="flex-1 bg-transparent px-3 py-2 text-xs sm:text-sm text-[var(--sk-text)] outline-none placeholder:text-slate-500"
          disabled={loading}
        />

        <button
          type="submit"
          disabled={!input.trim() || loading}
          className="w-10 h-10 rounded-xl bg-green-600 hover:bg-green-500 text-white flex items-center justify-center shrink-0 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer shadow-md"
        >
          <Send size={16} />
        </button>
      </form>
    </div>
  );
}
