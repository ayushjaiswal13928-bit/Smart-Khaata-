export type Lang = "hi" | "en";

export type FarmRecordType = "Expense" | "Sale" | "Yield";

export interface KhetCrop {
  id: string;
  khetId: string;
  cropName: string;
  cropNameHi?: string;
  season?: string;
  sowingDate?: string;
  harvestDate?: string;
  allocatedArea: number;
  areaUnit?: string;
  status: "sown" | "growing" | "harvested";
  expectedYield?: number;
  notes?: string;
}

export interface Khet {
  id: string;
  name: string;
  crop?: string;
  totalArea?: number;
  area: number;
  areaUnit: string;
  sowingDate?: string;
  season?: string;
  soilType?: string;
  irrigationSource?: string;
  crops?: KhetCrop[];
}

export interface FarmRecord {
  id: string;
  date: string;
  type: FarmRecordType;
  crop: string;
  khetId?: string;
  cropId?: string;
  expenseCategory?: string;
  amount: number;
  quantity?: number;
  unit?: string;
  price?: number;
  note?: string;
  field?: string;
  area?: number;
  areaUnit?: string;
  worker?: string;
  machine?: string;
  season?: string;
  // Enhanced real profit & sales settlement fields
  paidAmount?: number;
  remainingAmount?: number;
  paymentStatus?: "Received" | "Pending" | "Partial";
  buyerName?: string;
  ratePerQuintal?: number;
  // Partnership & Batai fields
  partnerId?: string;
  paidBy?: "me" | "partner" | "shared";
  partnerSharePercent?: number;
}

export interface Partner {
  id: string;
  name: string;
  phone?: string;
  relationship?: "batai_50_50" | "batai_third" | "other" | string;
  sharePercent: number;
  khetName?: string;
  crop?: string;
  season?: string;
  startDate?: string;
  notes?: string;
}

export interface PartnerCashEntry {
  id: string;
  partnerId: string;
  date: string;
  type: "gave_to_partner" | "received_from_partner";
  amount: number;
  mode?: "cash" | "online" | "bank";
  note?: string;
}

export interface CropStock {
  id: string;
  crop: string;
  quantity: number;
  unit: string;
  bagCount?: number;
  location?: string;
  harvestSeason?: string;
  storedDate?: string;
  quality?: "A-Grade" | "B-Grade" | "C-Grade" | string;
  notes?: string;
}

export interface LandUnitSettings {
  presetId: string;
  bighaPerAcre: number;
  biswaPerBigha: number;
  regionNameHi: string;
  regionNameEn: string;
  isCustom?: boolean;
}

export interface HomeExpense {
  id: string;
  date: string;
  category: string;
  note?: string;
  amount: number;
}

export type RentStatus = "Received" | "Pending" | "Partial";

export interface RentRecord {
  id: string;
  date: string;
  tenant: string;
  month: string;
  whatsapp: string;
  amount: number;
  prevReading: number;
  currentReading: number;
  ratePerUnit: number;
  units: number;
  lightBill: number;
  total: number;
  paidAmount?: number;
  remainingAmount?: number;
  status: RentStatus;
  note: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  modelUsed?: string;
}

