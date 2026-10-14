import { FarmRecord, Khet, KhetCrop } from "./types";

export interface CropFinancials {
  totalExpense: number;
  totalSales: number;
  paymentReceived: number;
  pendingDue: number;
  harvestedYieldQuintal: number;
  remainingStockQuintal: number;
  netProfit: number;
}

export interface KhetFinancials {
  totalExpense: number;
  totalSales: number;
  paymentReceived: number;
  pendingDue: number;
  netProfit: number;
  totalHarvestYieldQuintal: number;
  totalRemainingStockQuintal: number;
}

function toQuintals(qty: number, unit?: string): number {
  if (!qty || isNaN(qty)) return 0;
  const u = (unit || "").trim().toLowerCase();
  if (u.includes("kg") || u.includes("किलो")) return qty / 100;
  if (u.includes("ton") || u.includes("टन")) return qty * 10;
  if (u.includes("bag") || u.includes("बोरी") || u.includes("कट्टा")) return qty * 0.5;
  return qty;
}

export function calculateCropFinancials(
  records: FarmRecord[],
  crop: KhetCrop,
  khet: Khet
): CropFinancials {
  const khetNameLower = (khet.name || "").trim().toLowerCase();
  const cropNameLower = (crop.cropName || "").trim().toLowerCase();

  const matchingRecords = records.filter((r) => {
    if (r.cropId && r.cropId === crop.id) return true;
    const rField = (r.field || "").trim().toLowerCase();
    const rCrop = (r.crop || "").trim().toLowerCase();
    const fieldMatch = !rField || rField === khetNameLower || (r.khetId && r.khetId === khet.id);
    const cropMatch = rCrop === cropNameLower;
    return fieldMatch && cropMatch;
  });

  let totalExpense = 0;
  let totalSales = 0;
  let paymentReceived = 0;
  let pendingDue = 0;
  let harvestedYieldQuintal = 0;
  let soldYieldQuintal = 0;

  matchingRecords.forEach((r) => {
    const qty = Number(r.quantity) || 0;
    const price = Number(r.price) || 0;
    const calcAmt = qty * price;
    const amt = calcAmt > 0 ? calcAmt : Number(r.amount) || 0;

    if (r.type === "Expense") {
      totalExpense += amt;
    } else if (r.type === "Yield") {
      harvestedYieldQuintal += toQuintals(qty, r.unit);
    } else if (r.type === "Sale") {
      totalSales += amt;
      const paid = r.paidAmount !== undefined ? Number(r.paidAmount) : amt;
      const rem = r.remainingAmount !== undefined ? Number(r.remainingAmount) : Math.max(0, amt - paid);
      paymentReceived += paid;
      pendingDue += rem;
      soldYieldQuintal += toQuintals(qty, r.unit);
    }
  });

  const remainingStockQuintal = Math.max(0, Math.round((harvestedYieldQuintal - soldYieldQuintal) * 10) / 10);
  const netProfit = paymentReceived - totalExpense;

  return {
    totalExpense: Math.round(totalExpense),
    totalSales: Math.round(totalSales),
    paymentReceived: Math.round(paymentReceived),
    pendingDue: Math.round(pendingDue),
    harvestedYieldQuintal: Math.round(harvestedYieldQuintal * 10) / 10,
    remainingStockQuintal,
    netProfit: Math.round(netProfit),
  };
}

export function calculateKhetFinancials(
  records: FarmRecord[],
  khet: Khet,
  crops: KhetCrop[]
): KhetFinancials {
  const khetNameLower = (khet.name || "").trim().toLowerCase();
  const khetRecords = records.filter((r) => {
    if (r.khetId && r.khetId === khet.id) return true;
    return (r.field || "").trim().toLowerCase() === khetNameLower;
  });

  let totalExpense = 0;
  let totalSales = 0;
  let paymentReceived = 0;
  let pendingDue = 0;
  let totalHarvestYieldQuintal = 0;
  let totalSoldYieldQuintal = 0;

  khetRecords.forEach((r) => {
    const qty = Number(r.quantity) || 0;
    const price = Number(r.price) || 0;
    const calcAmt = qty * price;
    const amt = calcAmt > 0 ? calcAmt : Number(r.amount) || 0;

    if (r.type === "Expense") {
      totalExpense += amt;
    } else if (r.type === "Yield") {
      totalHarvestYieldQuintal += toQuintals(qty, r.unit);
    } else if (r.type === "Sale") {
      totalSales += amt;
      const paid = r.paidAmount !== undefined ? Number(r.paidAmount) : amt;
      const rem = r.remainingAmount !== undefined ? Number(r.remainingAmount) : Math.max(0, amt - paid);
      paymentReceived += paid;
      pendingDue += rem;
      totalSoldYieldQuintal += toQuintals(qty, r.unit);
    }
  });

  const totalRemainingStockQuintal = Math.max(
    0,
    Math.round((totalHarvestYieldQuintal - totalSoldYieldQuintal) * 10) / 10
  );
  const netProfit = paymentReceived - totalExpense;

  return {
    totalExpense: Math.round(totalExpense),
    totalSales: Math.round(totalSales),
    paymentReceived: Math.round(paymentReceived),
    pendingDue: Math.round(pendingDue),
    netProfit: Math.round(netProfit),
    totalHarvestYieldQuintal: Math.round(totalHarvestYieldQuintal * 10) / 10,
    totalRemainingStockQuintal,
  };
}
