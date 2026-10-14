import { Lang } from "./types";

export const STRINGS: Record<
  Lang,
  {
    appTitle: string;
    dashboard: string;
    farmTitle: string;
    rentTitle: string;
    homeTitle: string;
    aiTitle: string;
    scanTitle: string;
    reportsTitle: string;
    groceryCat: string;
    billsCat: string;
    medicalCat: string;
    transportCat: string;
    educationCat: string;
    otherCat: string;
    date: string;
    category: string;
    amount: string;
    note: string;
    save: string;
    cancel: string;
    delete: string;
    edit: string;
    status: string;
    actions: string;
  }
> = {
  hi: {
    appTitle: "स्मार्ट खाता",
    dashboard: "डैशबोर्ड",
    farmTitle: "खेती (Khet)",
    rentTitle: "किराया व मीटर",
    homeTitle: "घरेलू खर्च",
    aiTitle: "AI सलाहकार",
    scanTitle: "फोटो स्कैनर",
    reportsTitle: "रिपोर्ट्स",
    groceryCat: "राशन / किराना",
    billsCat: "बिजली / पानी बिल",
    medicalCat: "दवाई / स्वास्थ्य",
    transportCat: "पेट्रोल / आवागमन",
    educationCat: "शिक्षा / स्कूल",
    otherCat: "अन्य खर्च",
    date: "तारीख",
    category: "श्रेणी",
    amount: "राशि (₹)",
    note: "विवरण / नोट",
    save: "सहेजें",
    cancel: "रद्द करें",
    delete: "हटाएं",
    edit: "संपादित करें",
    status: "स्थिति",
    actions: "कार्य",
  },
  en: {
    appTitle: "Smart Khaata",
    dashboard: "Dashboard",
    farmTitle: "Farm & Crops",
    rentTitle: "Rent & Bills",
    homeTitle: "Home Expenses",
    aiTitle: "AI Advisor",
    scanTitle: "Photo Scanner",
    reportsTitle: "Reports",
    groceryCat: "Groceries",
    billsCat: "Bills & Utilities",
    medicalCat: "Medical & Health",
    transportCat: "Travel & Fuel",
    educationCat: "Education",
    otherCat: "Other Expenses",
    date: "Date",
    category: "Category",
    amount: "Amount (₹)",
    note: "Remarks / Note",
    save: "Save",
    cancel: "Cancel",
    delete: "Delete",
    edit: "Edit",
    status: "Status",
    actions: "Actions",
  },
};
