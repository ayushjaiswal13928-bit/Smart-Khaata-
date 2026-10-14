export interface ParsedVoiceResult {
  type?: "Expense" | "Sale" | "Yield";
  crop?: string;
  expenseCategory?: string;
  amount?: number;
  quantity?: number;
  unit?: string;
  note?: string;
}

const CROP_KEYWORDS: Record<string, string> = {
  गेहूं: "Wheat",
  गेहू: "Wheat",
  wheat: "Wheat",
  सोयाबीन: "Soybean",
  सोया: "Soybean",
  soybean: "Soybean",
  चना: "Gram",
  चने: "Gram",
  gram: "Gram",
  सरसों: "Mustard",
  राई: "Mustard",
  mustard: "Mustard",
  लहसुन: "Garlic",
  लहसन: "Garlic",
  garlic: "Garlic",
  प्याज: "Onion",
  कांदा: "Onion",
  onion: "Onion",
  आलू: "Potato",
  batata: "Potato",
  potato: "Potato",
  मक्का: "Maize",
  भुट्टा: "Maize",
  maize: "Maize",
  धान: "Rice",
  चावल: "Rice",
  paddy: "Rice",
  कपास: "Cotton",
  रूई: "Cotton",
  cotton: "Cotton",
  मूंगफली: "Groundnut",
  मूंग: "Peas",
  मटर: "Peas",
  गन्ना: "Sugarcane",
  sugarcane: "Sugarcane",
};

const EXPENSE_CATEGORIES: Record<string, string> = {
  बीज: "बीज",
  seed: "बीज",
  खाद: "खाद",
  डीएपी: "खाद",
  यूरिया: "खाद",
  पोटाश: "खाद",
  fertilizer: "खाद",
  दवा: "कीटनाशक",
  दवाई: "कीटनाशक",
  कीटनाशक: "कीटनाशक",
  स्प्रे: "कीटनाशक",
  pesticide: "कीटनाशक",
  डीजल: "डीजल/ट्रैक्टर",
  ट्रैक्टर: "डीजल/ट्रैक्टर",
  जुताई: "डीजल/ट्रैक्टर",
  हकाई: "डीजल/ट्रैक्टर",
  diesel: "डीजल/ट्रैक्टर",
  मजदूर: "मजदूरी",
  मजदूरी: "मजदूरी",
  लेबर: "मजदूरी",
  labor: "मजदूरी",
  सिंचाई: "सिंचाई",
  पानी: "सिंचाई",
  पलेवा: "सिंचाई",
  बिजली: "बिजली",
  लाइट: "बिजली",
  ढुलाई: "ढुलाई",
  भाड़ा: "ढुलाई",
  किराया: "ढुलाई",
  ट्रॉली: "ढुलाई",
};

export function parseVoiceInput(text: string): ParsedVoiceResult {
  const result: ParsedVoiceResult = {};
  const lower = text.toLowerCase();
  result.note = text.trim();

  // Detect Type
  if (lower.includes("बिक्री") || lower.includes("बेचा") || lower.includes("बेची") || lower.includes("सेल") || lower.includes("sale") || lower.includes("मंडी")) {
    result.type = "Sale";
  } else if (lower.includes("पैदावार") || lower.includes("उपज") || lower.includes("कटाई") || lower.includes("निकली") || lower.includes("थ्रेशिंग") || lower.includes("yield")) {
    result.type = "Yield";
  } else if (lower.includes("खर्च") || lower.includes("लागत") || lower.includes("खरीदा") || lower.includes("डाला") || lower.includes("छिड़काव") || lower.includes("expense")) {
    result.type = "Expense";
  }

  // Detect Crop
  for (const [kw, c] of Object.entries(CROP_KEYWORDS)) {
    if (lower.includes(kw)) {
      result.crop = c;
      break;
    }
  }

  // Detect Expense Category
  for (const [kw, cat] of Object.entries(EXPENSE_CATEGORIES)) {
    if (lower.includes(kw)) {
      result.expenseCategory = cat;
      if (!result.type) result.type = "Expense";
      break;
    }
  }

  // Detect Quantity and Unit
  const qtlMatch = lower.match(/(\d+(?:\.\d+)?)\s*(?:क्विंटल|qtl|quintal|कट्टे|बोरी|बोरे)/i);
  if (qtlMatch) {
    result.quantity = parseFloat(qtlMatch[1]);
    result.unit = lower.includes("बोरी") || lower.includes("कट्टे") ? "बोरी (Bags)" : "Quintal";
  } else {
    const kgMatch = lower.match(/(\d+(?:\.\d+)?)\s*(?:किलो|किग्रा|kg|kilogram)/i);
    if (kgMatch) {
      result.quantity = parseFloat(kgMatch[1]);
      result.unit = "Kg";
    } else {
      const literMatch = lower.match(/(\d+(?:\.\d+)?)\s*(?:लीटर|लिटर|liter|litre)/i);
      if (literMatch) {
        result.quantity = parseFloat(literMatch[1]);
        result.unit = "लीटर (Liters)";
      }
    }
  }

  // Detect Amount (Rupees)
  const rupeeMatch = lower.match(/(?:रुपये|रूपये|रु|₹|rs|inr)\s*(\d+(?:,\d+)*(?:\.\d+)?)/i) ||
                     lower.match(/(\d+(?:,\d+)*(?:\.\d+)?)\s*(?:रुपये|रूपये|रु|हजार|लाख|का)/i);
  if (rupeeMatch) {
    const cleanNum = rupeeMatch[1].replace(/,/g, "");
    let amt = parseFloat(cleanNum);
    if (lower.includes("हजार") && amt < 1000) amt *= 1000;
    if (lower.includes("लाख") && amt < 100) amt *= 100000;
    if (!isNaN(amt) && amt > 0) {
      result.amount = amt;
    }
  } else {
    // Look for standalone numbers that could be amounts (e.g. "डीजल 1200")
    const nums = lower.match(/\b\d{3,6}\b/g);
    if (nums && nums.length > 0) {
      result.amount = parseFloat(nums[0]);
    }
  }

  return result;
}
