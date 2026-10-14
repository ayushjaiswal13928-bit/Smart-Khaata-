import { LandUnitSettings, Lang } from "./types";
export type { LandUnitSettings };

export const LAND_SETTINGS_KEY = "smart-khaata-land-settings-v1";
export const LAND_SETTINGS_CHANGED_EVENT = "smart-khaata-land-settings-changed";

export interface RegionPreset {
  id: string;
  nameHi: string;
  nameEn: string;
  descriptionHi: string;
  descriptionEn: string;
  bighaPerAcre: number;
  biswaPerBigha: number; // Biswa, Katha, or Guntha
  subUnitNameHi: string;
  subUnitNameEn: string;
}

export const REGION_PRESETS: RegionPreset[] = [
  {
    id: "up_east_bihar",
    nameHi: "उत्तर प्रदेश (पूर्व) व बिहार",
    nameEn: "UP (East) & Bihar",
    descriptionHi: "पक्का बीघा: 1 एकड़ = 1.6 बीघा (1 बीघा = 20 कट्ठा/बिस्वा)",
    descriptionEn: "Pucca Bigha: 1 Acre = 1.6 Bigha (1 Bigha = 20 Kattha)",
    bighaPerAcre: 1.6,
    biswaPerBigha: 20,
    subUnitNameHi: "कट्ठा/बिस्वा",
    subUnitNameEn: "Kattha",
  },
  {
    id: "up_west_haryana",
    nameHi: "उत्तर प्रदेश (पश्चिम) व हरियाणा",
    nameEn: "UP (West) & Haryana",
    descriptionHi: "कच्चा बीघा: 1 एकड़ = 5.0 बीघा (1 बीघा = 20 बिस्वा, 8067 वर्गफुट)",
    descriptionEn: "Kaccha Bigha: 1 Acre = 5.0 Bigha (1 Bigha = 20 Biswa)",
    bighaPerAcre: 5.0,
    biswaPerBigha: 20,
    subUnitNameHi: "बिस्वा",
    subUnitNameEn: "Biswa",
  },
  {
    id: "mp_standard",
    nameHi: "मध्य प्रदेश (मानक)",
    nameEn: "Madhya Pradesh",
    descriptionHi: "मानक बीघा: 1 एकड़ = 2.5 बीघा (1 बीघा = 20 बिस्वा)",
    descriptionEn: "Standard: 1 Acre = 2.5 Bigha (1 Bigha = 20 Biswa)",
    bighaPerAcre: 2.5,
    biswaPerBigha: 20,
    subUnitNameHi: "बिस्वा",
    subUnitNameEn: "Biswa",
  },
  {
    id: "rajasthan_kaccha",
    nameHi: "राजस्थान (कच्चा बीघा)",
    nameEn: "Rajasthan (Kaccha)",
    descriptionHi: "कच्चा बीघा: 1 एकड़ = 2.5 बीघा (1 बीघा = 20 बिस्वा)",
    descriptionEn: "1 Acre = 2.5 Bigha (1 Bigha = 20 Biswa)",
    bighaPerAcre: 2.5,
    biswaPerBigha: 20,
    subUnitNameHi: "बिस्वा",
    subUnitNameEn: "Biswa",
  },
  {
    id: "rajasthan_pucca",
    nameHi: "राजस्थान (पक्का बीघा)",
    nameEn: "Rajasthan (Pucca)",
    descriptionHi: "पक्का बीघा: 1 एकड़ = 1.61 बीघा (1 बीघा = 27,225 वर्गफुट)",
    descriptionEn: "Pucca Bigha: 1 Acre = 1.61 Bigha",
    bighaPerAcre: 1.61,
    biswaPerBigha: 20,
    subUnitNameHi: "बिस्वा",
    subUnitNameEn: "Biswa",
  },
  {
    id: "punjab_killa",
    nameHi: "पंजाब (किल्ला / कनाल)",
    nameEn: "Punjab (Killa/Kanal)",
    descriptionHi: "1 एकड़ = 4.0 बीघा (या 1 किल्ला = 8 कनाल = 1 एकड़)",
    descriptionEn: "1 Acre = 4.0 Bigha (1 Killa = 8 Kanal = 1 Acre)",
    bighaPerAcre: 4.0,
    biswaPerBigha: 20,
    subUnitNameHi: "कनाल",
    subUnitNameEn: "Kanal",
  },
  {
    id: "gujarat_guntha",
    nameHi: "गुजरात (गुंठा)",
    nameEn: "Gujarat (Guntha)",
    descriptionHi: "1 एकड़ = 2.4 बीघा (1 बीघा = 16.6 गुंठा, 1 एकड़ = 40 गुंठा)",
    descriptionEn: "1 Acre = 2.4 Bigha (1 Acre = 40 Guntha)",
    bighaPerAcre: 2.4,
    biswaPerBigha: 16.67,
    subUnitNameHi: "गुंठा",
    subUnitNameEn: "Guntha",
  },
  {
    id: "bengal_assam",
    nameHi: "पश्चिम बंगाल व असम",
    nameEn: "Bengal & Assam",
    descriptionHi: "1 एकड़ = 3.025 बीघा (1 बीघा = 20 कट्ठा = 14,400 वर्गफुट)",
    descriptionEn: "1 Acre = 3.025 Bigha (1 Bigha = 20 Kattha)",
    bighaPerAcre: 3.025,
    biswaPerBigha: 20,
    subUnitNameHi: "कट्ठा",
    subUnitNameEn: "Kattha",
  },
];

export const DEFAULT_LAND_SETTINGS: LandUnitSettings = {
  presetId: "mp_standard",
  bighaPerAcre: 2.5,
  biswaPerBigha: 20,
  regionNameHi: "मध्य प्रदेश (1 एकड़ = 2.5 बीघा)",
  regionNameEn: "Madhya Pradesh (1 Acre = 2.5 Bigha)",
  isCustom: false,
};

export function getLandSettings(): LandUnitSettings {
  if (typeof window === "undefined") return DEFAULT_LAND_SETTINGS;
  try {
    const raw = localStorage.getItem(LAND_SETTINGS_KEY);
    if (!raw) return DEFAULT_LAND_SETTINGS;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed.bighaPerAcre === "number" && parsed.bighaPerAcre > 0) {
      return {
        ...DEFAULT_LAND_SETTINGS,
        ...parsed,
      };
    }
    return DEFAULT_LAND_SETTINGS;
  } catch {
    return DEFAULT_LAND_SETTINGS;
  }
}

export function saveLandSettings(settings: LandUnitSettings): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LAND_SETTINGS_KEY, JSON.stringify(settings));
    window.dispatchEvent(new CustomEvent(LAND_SETTINGS_CHANGED_EVENT, { detail: settings }));
  } catch (e) {
    console.error("Failed to save land settings", e);
  }
}

/**
 * Normalizes an area in any unit into standard Acre
 */
export function toAcre(area: number, unit: string = "बीघा", settings: LandUnitSettings = getLandSettings()): number {
  if (!area || isNaN(area) || area <= 0) return 0;
  const cleanUnit = (unit || "").trim().toLowerCase();
  const bighaPerAcre = settings.bighaPerAcre > 0 ? settings.bighaPerAcre : 2.5;

  if (cleanUnit === "एकड़" || cleanUnit === "acre" || cleanUnit === "acres") {
    return area;
  }
  if (cleanUnit === "हेक्टेयर" || cleanUnit === "hectare" || cleanUnit === "ha") {
    return area * 2.47105;
  }
  // Default to Bigha
  return area / bighaPerAcre;
}

/**
 * Normalizes an area in any unit into Bigha according to regional settings
 */
export function toBigha(area: number, unit: string = "बीघा", settings: LandUnitSettings = getLandSettings()): number {
  if (!area || isNaN(area) || area <= 0) return 0;
  const cleanUnit = (unit || "").trim().toLowerCase();
  const bighaPerAcre = settings.bighaPerAcre > 0 ? settings.bighaPerAcre : 2.5;

  if (cleanUnit === "बीघा" || cleanUnit === "bigha") {
    return area;
  }
  if (cleanUnit === "एकड़" || cleanUnit === "acre" || cleanUnit === "acres") {
    return area * bighaPerAcre;
  }
  if (cleanUnit === "हेक्टेयर" || cleanUnit === "hectare" || cleanUnit === "ha") {
    return area * 2.47105 * bighaPerAcre;
  }
  return area;
}

/**
 * Formats an area with both Bigha and Acre displayed side-by-side
 * e.g. "4 बीघा (1.6 एकड़)" or "2 एकड़ (5 बीघा)"
 */
export function formatDualArea(
  area: number,
  unit: string = "बीघा",
  settings: LandUnitSettings = getLandSettings(),
  lang: Lang = "hi"
): {
  primary: string;
  secondary: string;
  bigha: number;
  acre: number;
  label: string;
} {
  const isHi = lang === "hi";
  if (!area || isNaN(area) || area <= 0) {
    return {
      primary: `0 ${unit || (isHi ? "बीघा" : "Bigha")}`,
      secondary: `0 ${isHi ? "एकड़" : "Acre"}`,
      bigha: 0,
      acre: 0,
      label: `0 ${unit || (isHi ? "बीघा" : "Bigha")}`,
    };
  }

  const bigha = toBigha(area, unit, settings);
  const acre = toAcre(area, unit, settings);

  const cleanUnit = (unit || "").trim().toLowerCase();
  const isOriginallyAcre = cleanUnit === "एकड़" || cleanUnit === "acre" || cleanUnit === "acres";

  const bighaFormatted = `${parseFloat(bigha.toFixed(2))} ${isHi ? "बीघा" : "Bigha"}`;
  const acreFormatted = `${parseFloat(acre.toFixed(2))} ${isHi ? "एकड़" : "Acre"}`;

  if (isOriginallyAcre) {
    return {
      primary: acreFormatted,
      secondary: bighaFormatted,
      bigha: Number(bigha.toFixed(2)),
      acre: Number(acre.toFixed(2)),
      label: `${acreFormatted} (${bighaFormatted})`,
    };
  }

  return {
    primary: bighaFormatted,
    secondary: acreFormatted,
    bigha: Number(bigha.toFixed(2)),
    acre: Number(acre.toFixed(2)),
    label: `${bighaFormatted} (${acreFormatted})`,
  };
}

/**
 * Calculates per-bigha and per-acre financial metrics
 */
export interface PerLandMetrics {
  totalBigha: number;
  totalAcre: number;
  costPerBigha: number;
  costPerAcre: number;
  realizedProfitPerBigha: number;
  realizedProfitPerAcre: number;
  salesPerBigha: number;
  salesPerAcre: number;
  yieldPerBighaKg: number;
  yieldPerAcreKg: number;
}

export function calculatePerLandMetrics(
  totalCost: number,
  totalSales: number,
  realizedProfit: number,
  yieldKg: number,
  area: number,
  unit: string = "बीघा",
  settings: LandUnitSettings = getLandSettings()
): PerLandMetrics {
  const bigha = toBigha(area, unit, settings);
  const acre = toAcre(area, unit, settings);

  const safeBigha = bigha > 0 ? bigha : 1;
  const safeAcre = acre > 0 ? acre : 1;

  return {
    totalBigha: bigha > 0 ? Number(bigha.toFixed(2)) : 0,
    totalAcre: acre > 0 ? Number(acre.toFixed(2)) : 0,
    costPerBigha: bigha > 0 ? Math.round(totalCost / safeBigha) : 0,
    costPerAcre: acre > 0 ? Math.round(totalCost / safeAcre) : 0,
    realizedProfitPerBigha: bigha > 0 ? Math.round(realizedProfit / safeBigha) : 0,
    realizedProfitPerAcre: acre > 0 ? Math.round(realizedProfit / safeAcre) : 0,
    salesPerBigha: bigha > 0 ? Math.round(totalSales / safeBigha) : 0,
    salesPerAcre: acre > 0 ? Math.round(totalSales / safeAcre) : 0,
    yieldPerBighaKg: bigha > 0 ? Math.round((yieldKg / safeBigha) * 10) / 10 : 0,
    yieldPerAcreKg: acre > 0 ? Math.round((yieldKg / safeAcre) * 10) / 10 : 0,
  };
}
