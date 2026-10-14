import React from "react";
import { X, CheckCircle2, Sprout, TrendingUp, Users, Warehouse, ShieldCheck } from "lucide-react";
import { Lang } from "../../lib/types";

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Lang;
}

export function HelpModal({ isOpen, onClose, lang }: HelpModalProps) {
  if (!isOpen) return null;
  const isHi = lang === "hi";

  const steps = [
    {
      icon: Sprout,
      title: isHi ? "1. खेत व फसल जोड़ें" : "1. Add Field & Crop",
      desc: isHi
        ? "अपने खेत का रकबा (बीघा/एकड़) और बोई गई फसल दर्ज करें। एक ही खेत में एक से अधिक फसलें भी दर्ज कर सकते हैं।"
        : "Record field acreage and crops planted. You can also track multiple crops per field.",
    },
    {
      icon: TrendingUp,
      title: isHi ? "2. खर्च व बिक्री का हिसाब लिखें" : "2. Record Costs & Sales",
      desc: isHi
        ? "खाद, बीज, कीटनाशक, डीजल व मजदूरी तुरंत लिखें। फसल बिक्री पर खरीदार का नाम, प्राप्त नकद व बाकी उधारी भी दर्ज करें।"
        : "Log fertilizer, seed, diesel and labor expenses. Track sales with buyer names and pending credit balances.",
    },
    {
      icon: Users,
      title: isHi ? "3. बटाई (50-50) व साझीदार हिसाब" : "3. Batai & Partner Settlement",
      desc: isHi
        ? "साझीदार के साथ 50-50 या तिहाई बटाई का बहीखाता रखें और 1 क्लिक में WhatsApp पर हिसाब पर्चा भेजें।"
        : "Keep accurate 50-50 or custom share ledgers with one-click WhatsApp statement sharing.",
    },
    {
      icon: Warehouse,
      title: isHi ? "4. घर का स्टॉक व मंडी भाव" : "4. Home Stock & Mandi Valuation",
      desc: isHi
        ? "घर अथवा कोठी में रखी फसल का लाइव मंडी दरों पर बाजार मूल्य जानें ताकि उचित समय पर सही भाव में बेच सकें।"
        : "Monitor unsold grain at home with live market valuations to sell at the best rate.",
    },
    {
      icon: ShieldCheck,
      title: isHi ? "5. सुरक्षित बैकअप व PDF प्रिंट" : "5. Safe Backup & PDF Statements",
      desc: isHi
        ? "सेटिंग्स से कभी भी अपने डेटा का सुरक्षित JSON बैकअप लें या अदालत/बैंक हेतु प्रमाणित PDF पर्चा प्रिंट करें।"
        : "Download offline JSON backups anytime and print certified statements for banks or accounts.",
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-lg bg-[#0c1a13] border border-[#1e3c2c] rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
        <div className="px-5 py-4 border-b border-[#1a3525] flex items-center justify-between bg-[#07130e]">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span>🌾 {isHi ? "किसान साथी ऐप कैसे चलाएँ?" : "How to Use Smart Khaata?"}</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {isHi ? "खेती, मकान किराया व घरेलू हिसाब के 5 आसान चरण" : "5 simple steps to complete farm & household bookkeeping"}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-3.5 max-h-[70vh] overflow-y-auto text-xs">
          {steps.map((st, i) => {
            const Icon = st.icon;
            return (
              <div
                key={i}
                className="p-3.5 rounded-xl bg-[#07130e] border border-[#1e3c2c] flex items-start gap-3"
              >
                <div className="w-8 h-8 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Icon size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">{st.title}</h3>
                  <p className="text-slate-400 text-xs mt-1 leading-relaxed">{st.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="p-4 border-t border-[#1a3525] bg-[#07130e] flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition cursor-pointer"
          >
            {isHi ? "समझ गया, शुरू करें" : "Got it, Let's Start"}
          </button>
        </div>
      </div>
    </div>
  );
}
