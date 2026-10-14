"use client";

import { useState, useRef } from "react";
import {
  Camera,
  Upload,
  Sparkles,
  FileText,
  Wheat,
  Zap,
  CheckCircle2,
  RotateCcw,
  Copy,
  Plus,
  Loader2,
  Eye,
} from "lucide-react";
import { Lang, FarmRecord, HomeExpense } from "../../lib/types";

interface ImageScannerSectionProps {
  lang: Lang;
  onAddFarmRecord?: (record: Partial<FarmRecord>) => void;
  onAddHomeExpense?: (expense: Partial<HomeExpense>) => void;
  onNavigateToChat?: (query: string) => void;
}

const SAMPLE_PRESETS = [
  {
    id: "crop_rust",
    title: "🌾 गेहूं की पत्ती (Yellow Rust)",
    type: "crop_disease",
    description: "Crop disease leaf sample",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200" viewBox="0 0 300 200"><rect width="300" height="200" fill="#2d5a27"/><path d="M50 150 Q150 20 250 150" stroke="#a3c442" stroke-width="24" fill="none"/><circle cx="120" cy="80" r="12" fill="#d97706"/><circle cx="160" cy="70" r="16" fill="#f59e0b"/><circle cx="190" cy="90" r="10" fill="#b45309"/><text x="150" y="180" font-family="sans-serif" font-size="14" fill="#ffffff" text-anchor="middle">Wheat Leaf Sample</text></svg>`,
  },
  {
    id: "fertilizer_bill",
    title: "🧾 DAP खाद रसीद (Fertilizer Bill)",
    type: "receipt",
    description: "Farm expense receipt sample",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200" viewBox="0 0 300 200"><rect width="300" height="200" fill="#1e293b"/><rect x="40" y="20" width="220" height="160" rx="8" fill="#f8fafc"/><text x="150" y="50" font-family="sans-serif" font-weight="bold" font-size="14" fill="#0f172a" text-anchor="middle">KISAN SEVA KENDRA</text><text x="60" y="80" font-family="monospace" font-size="11" fill="#334155">DAP Fertilizer 50kg x 2</text><text x="60" y="105" font-family="monospace" font-size="11" fill="#334155">Rate: Rs. 1350/bag</text><text x="60" y="140" font-family="sans-serif" font-weight="bold" font-size="14" fill="#16a34a">TOTAL: Rs. 2700</text></svg>`,
  },
  {
    id: "meter_read",
    title: "⚡ बिजली मीटर (Meter 1420 kWh)",
    type: "meter",
    description: "Electricity meter reading sample",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200" viewBox="0 0 300 200"><rect width="300" height="200" fill="#0f172a"/><rect x="50" y="30" width="200" height="140" rx="12" fill="#334155" stroke="#64748b" stroke-width="3"/><rect x="80" y="70" width="140" height="50" rx="4" fill="#020617"/><text x="150" y="105" font-family="monospace" font-weight="bold" font-size="28" fill="#22c55e" text-anchor="middle">01420.5</text><text x="150" y="145" font-family="sans-serif" font-size="11" fill="#94a3b8" text-anchor="middle">kWh DIGITAL METER</text></svg>`,
  },
];

export function ImageScannerSection({
  lang,
  onAddFarmRecord,
  onAddHomeExpense,
  onNavigateToChat,
}: ImageScannerSectionProps) {
  const isHi = lang === "hi";

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>("image/jpeg");
  const [analysisType, setAnalysisType] = useState<"crop_disease" | "receipt" | "meter" | "general">("crop_disease");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [modelUsed, setModelUsed] = useState<string>("gemini-3.8-flash");
  const [customQuestion, setCustomQuestion] = useState("");
  const [copied, setCopied] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setMimeType(file.type || "image/jpeg");
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setSelectedImage(dataUrl);
      setResult(null);
    };
    reader.readAsDataURL(file);
  };

  const handleSelectPreset = (preset: typeof SAMPLE_PRESETS[0]) => {
    const svgBase64 = `data:image/svg+xml;base64,${btoa(preset.svg)}`;
    setSelectedImage(svgBase64);
    setMimeType("image/svg+xml");
    setAnalysisType(preset.type as any);
    setResult(null);
  };

  const runAnalysis = async () => {
    if (!selectedImage || loading) return;

    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/analyze-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: selectedImage,
          mimeType,
          analysisType,
          customPrompt: customQuestion.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to analyze image");
      }

      setResult(data.analysis || (isHi ? "विश्लेषण परिणाम उपलब्ध नहीं है।" : "Analysis completed."));
      setModelUsed(data.model || "gemini-3.8-flash");
    } catch (err: any) {
      console.error("Scan error:", err);
      setResult(`⚠️ ${isHi ? "विश्लेषण विफल रहा: " : "Analysis failed: "}${err.message || "Please try again"}`);
    } finally {
      setLoading(false);
    }
  };

  const copyResult = () => {
    if (!result) return;
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-[900px] mx-auto px-3 sm:px-5 pb-20 space-y-5">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-[var(--sk-border)] pb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--sk-text)] flex items-center gap-2">
            <Camera className="text-green-500" size={24} />
            {isHi ? "Gemini AI फोटो व बिल स्कैनर" : "Gemini AI Image Understanding"}
          </h2>
          <p className="text-xs sm:text-sm text-[var(--sk-muted)] mt-0.5">
            {isHi
              ? "फसल रोग पहचान, खाद/डीजल बिल OCR और बिजली मीटर रीडिंग"
              : "Analyze crop health, scan expense bills and read electric meters using Gemini multimodal"}
          </p>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-semibold self-start sm:self-auto">
          <Sparkles size={13} />
          gemini-3.8-flash
        </div>
      </div>

      {/* ANALYSIS TYPE SELECTOR */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {[
          { id: "crop_disease", label: isHi ? "🌾 फसल रोग व उपचार" : "🌾 Crop Disease", icon: Wheat },
          { id: "receipt", label: isHi ? "🧾 बिल / रसीद स्कैनर" : "🧾 Expense Receipt", icon: FileText },
          { id: "meter", label: isHi ? "⚡ मीटर रीडिंग" : "⚡ Electric Meter", icon: Zap },
          { id: "general", label: isHi ? "🔍 सामान्य विश्लेषण" : "🔍 General Analysis", icon: Eye },
        ].map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setAnalysisType(item.id as any)}
            className={`p-3 rounded-2xl border text-xs font-semibold flex flex-col items-center gap-1.5 transition cursor-pointer ${
              analysisType === item.id
                ? "border-green-500/70 bg-green-500/15 text-green-400 shadow-sm"
                : "border-[var(--sk-border)] bg-[var(--sk-card)] text-[var(--sk-muted)] hover:border-green-500/30"
            }`}
          >
            <item.icon size={18} />
            <span className="text-center">{item.label}</span>
          </button>
        ))}
      </div>

      {/* PHOTO CAPTURE / UPLOAD BOX */}
      <div className="rounded-2xl border-2 border-dashed border-[var(--sk-border2)] bg-[var(--sk-card)] p-5 text-center transition hover:border-green-500/50">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileChange}
          className="hidden"
        />

        {selectedImage ? (
          <div className="space-y-4">
            <div className="relative inline-block max-w-full overflow-hidden rounded-2xl border border-[var(--sk-border)] bg-black/40 shadow-lg">
              <img
                src={selectedImage}
                alt="Selected preview"
                className="max-h-[260px] sm:max-h-[320px] w-auto mx-auto object-contain rounded-xl"
              />
              <button
                type="button"
                onClick={() => {
                  setSelectedImage(null);
                  setResult(null);
                }}
                className="absolute top-2 right-2 p-1.5 rounded-full bg-black/70 text-white hover:bg-red-600 transition cursor-pointer"
                title="Remove photo"
              >
                <RotateCcw size={15} />
              </button>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2.5">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3.5 py-2 rounded-xl border border-[var(--sk-border)] bg-[var(--sk-card2)] text-xs font-semibold text-[var(--sk-text)] hover:bg-white/5 transition cursor-pointer"
              >
                {isHi ? "दूसरी फोटो चुनें" : "Change Photo"}
              </button>

              <button
                type="button"
                onClick={runAnalysis}
                disabled={loading}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold text-xs sm:text-sm shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                {loading
                  ? isHi
                    ? "Gemini AI विश्लेषण कर रहा है..."
                    : "Gemini analyzing..."
                  : isHi
                  ? "जांच शुरू करें (Analyze with Gemini)"
                  : "Analyze with Gemini"}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3 py-4">
            <div className="w-14 h-14 rounded-2xl bg-green-500/10 border border-green-500/20 text-green-400 mx-auto flex items-center justify-center">
              <Camera size={28} />
            </div>

            <div>
              <h3 className="text-sm sm:text-base font-bold text-[var(--sk-text)]">
                {isHi ? "कैमरा से फोटो खीचें या अपलोड करें" : "Take Photo or Upload Image"}
              </h3>
              <p className="text-xs text-[var(--sk-muted)] mt-1 max-w-md mx-auto">
                {isHi
                  ? "फसल की पत्ती, खाद की रसीद या बिजली मीटर की फोटो लें। Gemini AI इसका संपूर्ण विश्लेषण करेगा।"
                  : "Snap a photo of crop leaf disease, grocery/fertilizer receipt, or electricity meter reading."}
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2.5 rounded-xl bg-green-600 hover:bg-green-500 text-white font-bold text-xs shadow-md flex items-center gap-2 cursor-pointer"
              >
                <Camera size={16} />
                {isHi ? "फोटो लें / अपलोड करें" : "Snap / Upload Photo"}
              </button>
            </div>

            {/* PRESET SAMPLES */}
            <div className="pt-4 border-t border-[var(--sk-border)] text-left">
              <p className="text-[11px] font-semibold text-[var(--sk-muted)] mb-2 text-center">
                {isHi ? "⚡ तुरंत टेस्ट करने के लिए सैंपल चुनें:" : "⚡ Or tap a quick sample to test instantly:"}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {SAMPLE_PRESETS.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleSelectPreset(p)}
                    className="p-2.5 rounded-xl border border-[var(--sk-border)] bg-[var(--sk-card2)] hover:border-green-500/40 text-left transition cursor-pointer"
                  >
                    <div className="font-semibold text-xs text-[var(--sk-text)]">{p.title}</div>
                    <div className="text-[10px] text-[var(--sk-dim)] mt-0.5">{p.description}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* OPTIONAL CUSTOM QUESTION */}
      {selectedImage && !loading && (
        <div className="flex items-center gap-2 bg-[var(--sk-card)] border border-[var(--sk-border)] rounded-xl p-2">
          <input
            type="text"
            value={customQuestion}
            onChange={(e) => setCustomQuestion(e.target.value)}
            placeholder={
              isHi
                ? "वैकल्पिक: फोटो के बारे में कोई विशेष सवाल पूछें..."
                : "Optional: ask a specific question about this image..."
            }
            className="flex-1 bg-transparent px-2 text-xs text-[var(--sk-text)] outline-none"
          />
        </div>
      )}

      {/* ANALYSIS RESULT DISPLAY */}
      {result && (
        <div className="rounded-2xl border border-[var(--sk-border)] bg-[var(--sk-card)] p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between border-b border-[var(--sk-border)] pb-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="text-green-400" size={18} />
              <h3 className="font-bold text-sm sm:text-base text-[var(--sk-text)]">
                {isHi ? "Gemini AI विश्लेषण रिपोर्ट" : "Gemini AI Analysis Report"}
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-green-500/10 text-green-400 font-mono">
                {modelUsed}
              </span>
              <button
                type="button"
                onClick={copyResult}
                className="text-xs text-[var(--sk-muted)] hover:text-white flex items-center gap-1 cursor-pointer"
              >
                <Copy size={13} />
                {copied ? (isHi ? "कॉपी हुआ" : "Copied") : (isHi ? "कॉपी" : "Copy")}
              </button>
            </div>
          </div>

          <div className="text-xs sm:text-sm text-[var(--sk-text)] leading-relaxed whitespace-pre-wrap font-sans bg-[var(--sk-card2)] p-4 rounded-xl border border-[var(--sk-border)]">
            {result}
          </div>

          {/* QUICK ACTION BUTTONS */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            {analysisType === "receipt" && onAddFarmRecord && (
              <button
                type="button"
                onClick={() => {
                  onAddFarmRecord({
                    type: "Expense",
                    expenseCategory: "खाद",
                    note: isHi ? "स्कैन की गई रसीद" : "Scanned bill",
                  });
                }}
                className="px-3.5 py-2 rounded-xl bg-green-600 hover:bg-green-500 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Plus size={14} />
                {isHi ? "खेती खर्च में जोड़ें (Add to Farm)" : "Add to Farm Expense"}
              </button>
            )}

            {analysisType === "receipt" && onAddHomeExpense && (
              <button
                type="button"
                onClick={() => {
                  onAddHomeExpense({
                    category: "grocery",
                    note: isHi ? "स्कैन की गई रसीद" : "Scanned receipt",
                  });
                }}
                className="px-3.5 py-2 rounded-xl border border-[var(--sk-border)] bg-[var(--sk-card2)] text-[var(--sk-text)] hover:bg-white/5 text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer"
              >
                <Plus size={14} />
                {isHi ? "घर खर्च में जोड़ें (Add to Home)" : "Add to Home Expense"}
              </button>
            )}

            {onNavigateToChat && (
              <button
                type="button"
                onClick={() => onNavigateToChat(isHi ? "इस फोटो के बारे में मुझे और जानकारी दो" : "Tell me more about this photo analysis")}
                className="px-3.5 py-2 rounded-xl border border-green-500/40 bg-green-500/10 text-green-400 hover:bg-green-500/20 text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer ml-auto"
              >
                <Sparkles size={14} />
                {isHi ? "AI चैट में पूछें" : "Discuss in AI Chat"}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
