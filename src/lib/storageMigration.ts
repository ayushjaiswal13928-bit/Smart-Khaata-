import { Khet, KhetCrop, FarmRecord } from "./types";

export const STORAGE_KHETS_KEY = "kisan-mitra-khets-v1";
export const STORAGE_CROPS_KEY = "kisan-mitra-khet-crops-v1";
export const STORAGE_RECORDS_KEY = "kisan-mitra-records-v1";

const DEFAULT_SAMPLE_KHETS: Khet[] = [
  {
    id: "khet-sample-1",
    name: "खेत 1 (बड़ा खेत)",
    crop: "Wheat",
    totalArea: 4,
    area: 4,
    areaUnit: "बीघा",
    sowingDate: "2026-10-01",
    crops: [
      {
        id: "crop-khet-1-wheat",
        khetId: "khet-sample-1",
        cropName: "Wheat",
        cropNameHi: "गेहूं",
        season: "Rabi 2026",
        sowingDate: "2026-10-01",
        allocatedArea: 4,
        areaUnit: "बीघा",
        status: "growing",
        expectedYield: 40,
      },
    ],
  },
  {
    id: "khet-sample-2",
    name: "खेत 2 (सड़क वाला)",
    crop: "Soybean",
    totalArea: 3,
    area: 3,
    areaUnit: "बीघा",
    sowingDate: "2026-10-02",
    crops: [
      {
        id: "crop-khet-2-soybean",
        khetId: "khet-sample-2",
        cropName: "Soybean",
        cropNameHi: "सोयाबीन",
        season: "Kharif 2026",
        sowingDate: "2026-10-02",
        allocatedArea: 3,
        areaUnit: "बीघा",
        status: "harvested",
        expectedYield: 25,
      },
    ],
  },
];

export function loadAndMigrateKhets(): { khets: Khet[]; khetCrops: KhetCrop[] } {
  if (typeof window === "undefined") {
    return {
      khets: DEFAULT_SAMPLE_KHETS,
      khetCrops: DEFAULT_SAMPLE_KHETS.flatMap((k) => k.crops || []),
    };
  }

  try {
    const rawKhets =
      localStorage.getItem(STORAGE_KHETS_KEY) ||
      localStorage.getItem("sk-farms-v2") ||
      localStorage.getItem("sk-khets-v1");

    const rawCrops = localStorage.getItem(STORAGE_CROPS_KEY);

    let khets: Khet[] = rawKhets ? JSON.parse(rawKhets) : [];
    let khetCrops: KhetCrop[] = rawCrops ? JSON.parse(rawCrops) : [];

    if (!Array.isArray(khets) || khets.length === 0) {
      khets = DEFAULT_SAMPLE_KHETS;
      khetCrops = DEFAULT_SAMPLE_KHETS.flatMap((k) => k.crops || []);
      persistKhetsAndCrops(khets, khetCrops);
      return { khets, khetCrops };
    }

    // Ensure all khets have crops array & totalArea
    khets = khets.map((k) => {
      const areaVal = k.totalArea || k.area || 1;
      let crops = k.crops || [];
      if (!crops || crops.length === 0) {
        // Find in khetCrops or generate default crop
        const existingForKhet = khetCrops.filter((c) => c.khetId === k.id);
        if (existingForKhet.length > 0) {
          crops = existingForKhet;
        } else {
          const defaultCrop: KhetCrop = {
            id: `crop-${k.id}-1`,
            khetId: k.id,
            cropName: k.crop || "Wheat",
            season: k.season || "Rabi 2026",
            sowingDate: k.sowingDate || new Date().toISOString().slice(0, 10),
            allocatedArea: areaVal,
            areaUnit: k.areaUnit || "बीघा",
            status: "growing",
          };
          crops = [defaultCrop];
          khetCrops.push(defaultCrop);
        }
      }
      return {
        ...k,
        totalArea: areaVal,
        area: areaVal,
        crops,
      };
    });

    if (khetCrops.length === 0) {
      khetCrops = khets.flatMap((k) => k.crops || []);
    }

    persistKhetsAndCrops(khets, khetCrops);
    return { khets, khetCrops };
  } catch (err) {
    console.warn("Error migrating khets:", err);
    return {
      khets: DEFAULT_SAMPLE_KHETS,
      khetCrops: DEFAULT_SAMPLE_KHETS.flatMap((k) => k.crops || []),
    };
  }
}

export function loadAndMigrateRecords(khets: Khet[], khetCrops: KhetCrop[]): FarmRecord[] {
  if (typeof window === "undefined") return [];

  try {
    const raw =
      localStorage.getItem(STORAGE_RECORDS_KEY) ||
      localStorage.getItem("sk-records-v2") ||
      localStorage.getItem("sk-farm-records");

    if (!raw) return [];
    const list: FarmRecord[] = JSON.parse(raw);
    if (!Array.isArray(list)) return [];

    return list.map((r) => {
      // Connect khetId if field matches khet name
      let khetId = r.khetId;
      if (!khetId && r.field) {
        const foundKhet = khets.find(
          (k) => k.name.trim().toLowerCase() === r.field?.trim().toLowerCase()
        );
        if (foundKhet) khetId = foundKhet.id;
      }

      // Connect cropId
      let cropId = r.cropId;
      if (!cropId && khetId && r.crop) {
        const foundCrop = khetCrops.find(
          (c) => c.khetId === khetId && c.cropName.toLowerCase() === r.crop.toLowerCase()
        );
        if (foundCrop) cropId = foundCrop.id;
      }

      // Ensure paidAmount and remainingAmount for sales
      let paid = r.paidAmount;
      let remaining = r.remainingAmount;
      const amt = Number(r.amount) || 0;
      if (r.type === "Sale") {
        if (paid === undefined) paid = amt;
        if (remaining === undefined) remaining = Math.max(0, amt - paid);
      }

      return {
        ...r,
        khetId,
        cropId,
        paidAmount: paid,
        remainingAmount: remaining,
      };
    });
  } catch (err) {
    console.warn("Error migrating records:", err);
    return [];
  }
}

export function persistKhetsAndCrops(khets: Khet[], khetCrops: KhetCrop[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KHETS_KEY, JSON.stringify(khets));
    localStorage.setItem(STORAGE_CROPS_KEY, JSON.stringify(khetCrops));
    localStorage.setItem("sk-farms-v2", JSON.stringify(khets));
  } catch (e) {
    console.error("Failed to persist khets:", e);
  }
}

export function downloadPhysicalBackup(): void {
  if (typeof window === "undefined") return;
  const backupObject: Record<string, any> = {};

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key) {
      try {
        const val = localStorage.getItem(key);
        backupObject[key] = val ? JSON.parse(val) : null;
      } catch {
        backupObject[key] = localStorage.getItem(key);
      }
    }
  }

  const jsonStr = JSON.stringify(backupObject, null, 2);
  const todayStr = new Date().toISOString().slice(0, 10);
  const blob = new Blob([jsonStr], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `kisan-saathi-backup-${todayStr}.json`;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 400);
}
