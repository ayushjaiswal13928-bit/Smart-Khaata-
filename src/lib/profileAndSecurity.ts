export interface FarmerProfile {
  name: string;
  phone: string;
  village: string;
  tehsil: string;
  district: string;
  state?: string;
}

export interface SecuritySettings {
  isLockEnabled: boolean;
  pin: string;
  biometricEnabled: boolean;
  autoLockMinutes: number;
}

export interface AppPreferences {
  theme: "dark" | "light" | "forest";
  textSize: "normal" | "large" | "huge";
  dateFormat: "DD/MM/YYYY" | "YYYY-MM-DD" | "DD-MMM-YYYY";
}

export interface FarmingPreferences {
  defaultAreaUnit: "बीघा" | "एकड़" | "हेक्टेयर";
  defaultSeason: "रबी" | "खरीफ" | "जायद";
  defaultBataiShare: number;
}

export interface MandiPreferences {
  favoriteCrops: string[];
  defaultMandi: string;
  dailyRateUpdates: boolean;
  pendingPaymentAlerts: boolean;
  lowStockReminder: boolean;
}

const PROFILE_KEY = "kisan-mitra-profile-v1";
const SECURITY_KEY = "kisan-mitra-security-v1";
const PREFS_KEY = "kisan-mitra-app-prefs-v1";
const FARMING_PREFS_KEY = "kisan-mitra-farming-prefs-v1";
const MANDI_PREFS_KEY = "kisan-mitra-mandi-prefs-v1";
const BACKUP_TIME_KEY = "kisan-mitra-last-backup-ts";

export const DEFAULT_PROFILE: FarmerProfile = {
  name: "रामेश्वर पाटीदार",
  phone: "9826012345",
  village: "कनार्दिया",
  tehsil: "सांवेर",
  district: "इन्दौर",
  state: "मध्य प्रदेश",
};

export const DEFAULT_SECURITY: SecuritySettings = {
  isLockEnabled: false,
  pin: "1234",
  biometricEnabled: false,
  autoLockMinutes: 5,
};

export const DEFAULT_APP_PREFS: AppPreferences = {
  theme: "dark",
  textSize: "normal",
  dateFormat: "DD/MM/YYYY",
};

export const DEFAULT_FARMING_PREFS: FarmingPreferences = {
  defaultAreaUnit: "बीघा",
  defaultSeason: "रबी",
  defaultBataiShare: 50,
};

export const DEFAULT_MANDI_PREFS: MandiPreferences = {
  favoriteCrops: ["Wheat", "Soybean", "Gram", "Garlic"],
  defaultMandi: "इन्दौर (Indore Mandi)",
  dailyRateUpdates: true,
  pendingPaymentAlerts: true,
  lowStockReminder: true,
};

export function getFarmerProfile(): FarmerProfile {
  if (typeof window === "undefined") return DEFAULT_PROFILE;
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    return raw ? { ...DEFAULT_PROFILE, ...JSON.parse(raw) } : DEFAULT_PROFILE;
  } catch {
    return DEFAULT_PROFILE;
  }
}

export function saveFarmerProfile(profile: FarmerProfile): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  } catch (e) {
    console.error("Failed to save farmer profile", e);
  }
}

export function getSecuritySettings(): SecuritySettings {
  if (typeof window === "undefined") return DEFAULT_SECURITY;
  try {
    const raw = localStorage.getItem(SECURITY_KEY);
    return raw ? { ...DEFAULT_SECURITY, ...JSON.parse(raw) } : DEFAULT_SECURITY;
  } catch {
    return DEFAULT_SECURITY;
  }
}

export function saveSecuritySettings(settings: SecuritySettings): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(SECURITY_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error("Failed to save security settings", e);
  }
}

export function getAppPreferences(): AppPreferences {
  if (typeof window === "undefined") return DEFAULT_APP_PREFS;
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    return raw ? { ...DEFAULT_APP_PREFS, ...JSON.parse(raw) } : DEFAULT_APP_PREFS;
  } catch {
    return DEFAULT_APP_PREFS;
  }
}

export function saveAppPreferences(prefs: AppPreferences): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
  } catch (e) {
    console.error("Failed to save app preferences", e);
  }
}

export function getFarmingPreferences(): FarmingPreferences {
  if (typeof window === "undefined") return DEFAULT_FARMING_PREFS;
  try {
    const raw = localStorage.getItem(FARMING_PREFS_KEY);
    return raw ? { ...DEFAULT_FARMING_PREFS, ...JSON.parse(raw) } : DEFAULT_FARMING_PREFS;
  } catch {
    return DEFAULT_FARMING_PREFS;
  }
}

export function saveFarmingPreferences(prefs: FarmingPreferences): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(FARMING_PREFS_KEY, JSON.stringify(prefs));
  } catch (e) {
    console.error("Failed to save farming preferences", e);
  }
}

export function getMandiPreferences(): MandiPreferences {
  if (typeof window === "undefined") return DEFAULT_MANDI_PREFS;
  try {
    const raw = localStorage.getItem(MANDI_PREFS_KEY);
    return raw ? { ...DEFAULT_MANDI_PREFS, ...JSON.parse(raw) } : DEFAULT_MANDI_PREFS;
  } catch {
    return DEFAULT_MANDI_PREFS;
  }
}

export function saveMandiPreferences(prefs: MandiPreferences): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(MANDI_PREFS_KEY, JSON.stringify(prefs));
  } catch (e) {
    console.error("Failed to save mandi preferences", e);
  }
}

export function getLastBackupTimestamp(): number | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(BACKUP_TIME_KEY);
  return raw ? parseInt(raw, 10) : null;
}

export function recordBackupTimestamp(): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(BACKUP_TIME_KEY, String(Date.now()));
}
