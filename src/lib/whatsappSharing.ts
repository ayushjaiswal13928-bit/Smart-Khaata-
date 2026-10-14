export function getWhatsAppUrl(text: string, phone?: string): string {
  const cleanPhone = (phone || "").replace(/\D/g, "");
  const encodedText = encodeURIComponent(text);
  if (cleanPhone) {
    const fullPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
    return `https://wa.me/${fullPhone}?text=${encodedText}`;
  }
  return `https://api.whatsapp.com/send?text=${encodedText}`;
}

export function shareViaWhatsApp(text: string, phone?: string): void {
  const url = getWhatsAppUrl(text, phone);
  if (typeof window !== "undefined") {
    window.open(url, "_blank");
  }
}

export async function copyToClipboard(text: string): Promise<boolean> {
  if (typeof navigator !== "undefined" && navigator.clipboard && navigator.clipboard.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // fallback below
    }
  }

  try {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.left = "-9999px";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const successful = document.execCommand("copy");
    document.body.removeChild(textArea);
    return successful;
  } catch {
    return false;
  }
}

export interface RecordWhatsAppOptions {
  crop: string;
  field?: string;
  type: string;
  amount: number;
  quantity?: number;
  unit?: string;
  price?: number;
  date: string;
  note?: string;
  buyerName?: string;
  worker?: string;
  remainingAmount?: number;
}

export function generateRecordWhatsAppMessage(opt: RecordWhatsAppOptions): string {
  const typeText = opt.type === "Sale" ? "फसल बिक्री (Sale)" : opt.type === "Expense" ? "लागत खर्च (Expense)" : "पैदावार (Harvest Yield)";
  const amtText = opt.type === "Yield" ? `${opt.quantity || 0} ${opt.unit || "क्विंटल"}` : `₹${Number(opt.amount || 0).toLocaleString("en-IN")}`;

  return `🌾 *किसान साथी - बहीखाता रसीद* 🌾
---------------------------------
📅 *दिनांक:* ${opt.date}
🌱 *फसल:* ${opt.crop}${opt.field ? ` (${opt.field})` : ""}
🏷️ *प्रकार:* ${typeText}
💰 *रकम / मात्रा:* ${amtText}
${opt.quantity && opt.price ? `⚖️ *मात्रा व भाव:* ${opt.quantity} ${opt.unit || "क्विंटल"} @ ₹${opt.price}\n` : ""}${opt.buyerName ? `🏪 *खरीदार / मंडी:* ${opt.buyerName}\n` : ""}${opt.worker ? `👤 *मजदूर / व्यक्ति:* ${opt.worker}\n` : ""}${opt.remainingAmount && opt.remainingAmount > 0 ? `⏳ *बाकी रकम:* ₹${opt.remainingAmount.toLocaleString("en-IN")}\n` : ""}${opt.note ? `📝 *विवरण:* ${opt.note}\n` : ""}---------------------------------
_स्मार्ट खाता / किसान साथी द्वारा प्रमाणित डिजिटल रसीद_`;
}

export interface PartnerWhatsAppOptions {
  partnerName: string;
  khetName?: string;
  cropName?: string;
  sharePercent: number;
  totalExpense: number;
  partnerCostShare: number;
  myExpensePaid: number;
  partnerExpensePaid: number;
  totalSales: number;
  partnerSalesShare: number;
  directCashGave: number;
  directCashReceived: number;
  netBalance: number;
}

export function generatePartnerWhatsAppSummary(opt: PartnerWhatsAppOptions): string {
  const isReceivable = opt.netBalance > 0;
  const isPayable = opt.netBalance < 0;
  const absBal = Math.abs(opt.netBalance);

  return `🤝 *साझेदारी / बटाई हिसाब पर्चा* 🤝
---------------------------------
👤 *साझीदार:* ${opt.partnerName}
🌱 *खेत / फसल:* ${opt.khetName || "साझा खेत"} ${opt.cropName ? `(${opt.cropName})` : ""}
⚖️ *हिस्सेदारी:* ${opt.sharePercent}% (अधिया)
📅 *दिनांक:* ${new Date().toLocaleDateString("hi-IN")}

1️⃣ *कुल खेती लागत खर्च:* ₹${opt.totalExpense.toLocaleString("en-IN")}
   • आपका ${opt.sharePercent}% हिस्सा: ₹${opt.partnerCostShare.toLocaleString("en-IN")}
   • मैंने खर्च दिया: ₹${opt.myExpensePaid.toLocaleString("en-IN")}
   • आपने खर्च दिया: ₹${opt.partnerExpensePaid.toLocaleString("en-IN")}

2️⃣ *कुल फसल बिक्री:* ₹${opt.totalSales.toLocaleString("en-IN")}
   • आपका ${opt.sharePercent}% बिक्री हिस्सा: ₹${opt.partnerSalesShare.toLocaleString("en-IN")}

3️⃣ *नकद पेशगी / लेनदेन (Advance):*
   • मैंने आपको नकद दिया: ₹${opt.directCashGave.toLocaleString("en-IN")}
   • आपसे नकद मिला: ₹${opt.directCashReceived.toLocaleString("en-IN")}

---------------------------------
🏁 *अंतिम शुद्ध हिसाब (Net Settlement):*
${
  isReceivable
    ? `🟢 *लेने हैं: ₹${absBal.toLocaleString("en-IN")}*\n(साझीदार से वसूली बाकी)`
    : isPayable
    ? `🔴 *देने हैं: ₹${absBal.toLocaleString("en-IN")}*\n(साझीदार को भुगतान करना है)`
    : `⚪ *हिसाब चुकता (₹0)*`
}
---------------------------------
_किसान साथी डिजिटल बहीखाता_`;
}
