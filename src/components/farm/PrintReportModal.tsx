import React, { useRef, useState } from 'react';
import { Printer, Download, FileSpreadsheet, X, CheckCircle, ShieldCheck, FileDown, Loader2 } from 'lucide-react';
import { FarmRecord, Khet, KhetCrop, Lang } from '../../lib/types';
import { cropLabel } from '../../lib/farmI18n';
import { exportToExcel, exportToCsv } from '../../lib/excelExport';
import { downloadPrintableHtml, exportElementToPdf, printElement } from '../../lib/pdfExport';

interface PrintReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Lang;
  records: FarmRecord[];
  khets: Khet[];
  khetCrops: KhetCrop[];
  selectedCrop?: string;
  selectedKhetId?: string;
}

export function PrintReportModal({
  isOpen,
  onClose,
  lang,
  records,
  khets,
  khetCrops,
  selectedCrop,
  selectedKhetId,
}: PrintReportModalProps) {
  const printAreaRef = useRef<HTMLDivElement>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const isHi = lang === 'hi';

  if (!isOpen) return null;

  // Filter records if crop or khet is specified
  const filteredRecords = records.filter((r) => {
    if (selectedCrop && selectedCrop !== 'all' && r.crop !== selectedCrop) {
      return false;
    }
    if (selectedKhetId && selectedKhetId !== 'all') {
      if (r.khetId && r.khetId !== selectedKhetId) return false;
      const khet = khets.find((k) => k.id === selectedKhetId);
      if (khet && r.field && r.field !== khet.name && !r.khetId) return false;
    }
    return true;
  });

  // Calculate totals
  let totalExpense = 0;
  let totalSales = 0;
  let totalReceived = 0;
  let totalPending = 0;
  let totalYieldQtl = 0;

  filteredRecords.forEach((r) => {
    const qty = Number(r.quantity || 0);
    const price = Number(r.price || 0);
    const calcAmt = qty * price;
    const amt = calcAmt > 0 ? calcAmt : Number(r.amount || 0);

    if (r.type === 'Expense') {
      totalExpense += amt;
    } else if (r.type === 'Yield') {
      let q = qty;
      if (r.unit === 'Kg' || r.unit === 'किलो') q = qty / 100;
      else if (r.unit === 'Ton' || r.unit === 'टन') q = qty * 10;
      else if (r.unit?.includes('बोरी') || r.unit?.includes('Bags')) q = qty * 0.5;
      totalYieldQtl += q;
    } else if (r.type === 'Sale') {
      totalSales += amt;
      const paid = r.paidAmount !== undefined ? Number(r.paidAmount) : amt;
      totalReceived += paid;
      const pending = r.remainingAmount !== undefined ? Number(r.remainingAmount) : Math.max(0, amt - paid);
      totalPending += pending;
    }
  });

  const netProfit = totalSales - totalExpense;
  const todayStr = new Date().toLocaleDateString(isHi ? 'hi-IN' : 'en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  const selectedKhetObj = selectedKhetId && selectedKhetId !== 'all'
    ? khets.find((k) => k.id === selectedKhetId)
    : null;

  const titleText = isHi
    ? `खेती बहीखाता वित्तीय पर्चा${selectedKhetObj ? ` - ${selectedKhetObj.name}` : ''}${
        selectedCrop && selectedCrop !== 'all' ? ` (${cropLabel('hi', selectedCrop)})` : ''
      }`
    : `Farm Financial Statement${selectedKhetObj ? ` - ${selectedKhetObj.name}` : ''}${
        selectedCrop && selectedCrop !== 'all' ? ` (${selectedCrop})` : ''
      }`;

  const subtitleText = isHi
    ? 'कृषि लागत खर्च, पैदावार व फसल बिक्री का प्रमाणित ब्यौरा'
    : 'Certified statement of farm inputs, harvest yield and crop sales';

  const handlePrint = () => {
    printElement(printAreaRef.current);
  };

  const handleSavePdf = async () => {
    if (!printAreaRef.current || isGeneratingPdf) return;
    try {
      setIsGeneratingPdf(true);
      const khetLabel = selectedKhetObj?.name ? selectedKhetObj.name.replace(/[/\\?%*:|"<> ]/g, '-') : 'khet';
      const cleanFileName = `khet-hisab-${khetLabel}-${new Date().toISOString().slice(0, 10)}.pdf`;
      await exportElementToPdf(printAreaRef.current, cleanFileName);
    } catch (err) {
      console.error('Failed to export PDF:', err);
      // Fallback to printElement
      printElement(printAreaRef.current);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleDownloadHtml = () => {
    downloadPrintableHtml({
      title: titleText,
      subtitle: subtitleText,
      lang,
      season: isHi ? 'कृषि वर्ष 2026' : 'Farm Year 2026',
      summaryCards: [
        {
          label: isHi ? 'कुल फसल बिक्री' : 'Total Sales',
          value: `₹${totalSales.toLocaleString('en-IN')}`,
          color: '#16a34a',
        },
        {
          label: isHi ? 'कुल लागत खर्च' : 'Total Expenses',
          value: `₹${totalExpense.toLocaleString('en-IN')}`,
          color: '#dc2626',
        },
        {
          label: isHi ? 'प्राप्त भुगतान' : 'Payment Received',
          value: `₹${totalReceived.toLocaleString('en-IN')}`,
          color: '#0284c7',
        },
        {
          label: isHi ? 'बकाया रकम' : 'Pending Due',
          value: `₹${totalPending.toLocaleString('en-IN')}`,
          color: '#d97706',
        },
        {
          label: isHi ? 'शुद्ध लाभ (Net Profit)' : 'Net Profit',
          value: `₹${netProfit.toLocaleString('en-IN')}`,
          color: netProfit >= 0 ? '#16a34a' : '#dc2626',
        },
      ],
      tableHeaders: isHi
        ? ['#', 'दिनांक', 'खेत', 'फसल', 'प्रकार', 'विवरण / श्रेणी', 'रकम (₹)', 'भुगतान स्थिति']
        : ['#', 'Date', 'Field', 'Crop', 'Type', 'Details / Category', 'Amount (₹)', 'Payment Status'],
      tableRows: filteredRecords.map((r, i) => {
        const amt = r.type === 'Yield' ? '-' : `₹${Number(r.amount || 0).toLocaleString('en-IN')}`;
        const typeBadge = isHi
          ? r.type === 'Expense'
            ? 'खर्च'
            : r.type === 'Yield'
            ? 'पैदावार'
            : 'बिक्री'
          : r.type;
        const details =
          r.type === 'Expense'
            ? `${r.expenseCategory || 'खर्च'}${r.note ? ` - ${r.note}` : ''}`
            : r.type === 'Yield'
            ? `${r.quantity || 0} ${r.unit || 'क्विंटल'}${r.note ? ` (${r.note})` : ''}`
            : `${r.quantity || 0} ${r.unit || 'क्विंटल'} @ ₹${r.price || 0} ${r.buyerName ? `[${r.buyerName}]` : ''}`;

        const status =
          r.type === 'Sale'
            ? (r.remainingAmount || 0) > 0
              ? isHi
                ? `बकाया ₹${r.remainingAmount}`
                : `Due ₹${r.remainingAmount}`
              : isHi
              ? 'पूर्ण चुकता'
              : 'Paid'
            : '-';

        return {
          cells: [
            i + 1,
            r.date || '-',
            r.field || (r.khetId ? khets.find((k) => k.id === r.khetId)?.name || '-' : '-'),
            cropLabel(lang, r.crop),
            typeBadge,
            details,
            amt,
            status,
          ],
        };
      }),
      footerNotes: isHi
        ? 'किसान साथी डिजिटल कृषि बहीखाता द्वारा प्रमाणित रिपोर्ट'
        : 'Certified statement generated by Kisan Sathi Digital Farm Ledger',
    });
  };

  const handleDownloadExcel = () => {
    exportToExcel({
      lang,
      records: filteredRecords,
      khets,
      khetCrops,
    });
  };

  const handleDownloadCsv = () => {
    exportToCsv({
      lang,
      records: filteredRecords,
      khets,
      khetCrops,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto print:p-0 print:bg-white print:static">
      <div className="relative w-full max-w-4xl bg-[#0c1a13] border border-[#1e3c2c] rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden print:max-h-none print:border-none print:shadow-none print:bg-white print:w-full">
        {/* MODAL HEADER - Hidden during browser print */}
        <div className="px-4 py-3 border-b border-[#1a3525] flex items-center justify-between bg-[#07130e] print:hidden">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Printer size={16} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">
                {isHi ? 'PDF प्रिंट एवं रिपोर्ट डाउनलोड' : 'Print PDF & Download Statement'}
              </h2>
              <p className="text-[11px] text-slate-400">
                {isHi ? 'प्रिंट, PDF सेव, Excel (.xlsx) और CSV' : 'Print preview, PDF, Excel (.xlsx) and CSV'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
              title="बंद करें"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* ACTION TOOLBAR - Hidden during browser print */}
        <div className="px-4 py-2.5 bg-[#0a1811] border-b border-[#1a3525] flex flex-wrap items-center justify-between gap-2 print:hidden">
          <div className="flex items-center gap-1.5 text-xs text-slate-300">
            <ShieldCheck size={14} className="text-emerald-400 shrink-0" />
            <span className="font-semibold">{isHi ? `कुल रिकॉर्ड: ${filteredRecords.length}` : `Records: ${filteredRecords.length}`}</span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* 1. Direct Print / Save as PDF */}
            <button
              type="button"
              onClick={handlePrint}
              className="h-8 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
              title={isHi ? "प्रिंटर से प्रिंट करें या ब्राउज़र से Save as PDF करें" : "Open Print Dialog or Save as PDF"}
            >
              <Printer size={14} />
              <span>{isHi ? '🖨️ प्रिंट / Save as PDF' : 'Print / Save PDF'}</span>
            </button>

            {/* 2. Direct PDF File Download (Instant .pdf) */}
            <button
              type="button"
              onClick={handleSavePdf}
              disabled={isGeneratingPdf}
              className="h-8 px-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95 disabled:opacity-60"
              title={isHi ? "सीधे प्रमाणित PDF फाइल डाउनलोड करें" : "Direct Download PDF file"}
            >
              {isGeneratingPdf ? (
                <>
                  <Loader2 size={13} className="animate-spin" />
                  <span>{isHi ? 'PDF बन रहा है...' : 'Saving PDF...'}</span>
                </>
              ) : (
                <>
                  <FileDown size={14} />
                  <span>{isHi ? '📄 PDF डाउनलोड करें' : 'Download PDF'}</span>
                </>
              )}
            </button>

            {/* 3. Download Standalone HTML File */}
            <button
              type="button"
              onClick={handleDownloadHtml}
              className="h-8 px-2.5 rounded-lg border border-[#1e3c2c] bg-[#0c1a13] hover:bg-[#152e20] text-emerald-300 text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer active:scale-95"
              title="ऑफलाइन पर्चा फाइल डाउनलोड करें"
            >
              <Download size={13} />
              <span>{isHi ? 'HTML पर्चा' : 'HTML'}</span>
            </button>

            {/* 4. Export to Excel (.xlsx) */}
            <button
              type="button"
              onClick={handleDownloadExcel}
              className="h-8 px-2.5 rounded-lg border border-[#1e3c2c] bg-[#0c1a13] hover:bg-[#152e20] text-emerald-300 text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer active:scale-95"
              title="Microsoft Excel (.xlsx) फाइल डाउनलोड करें"
            >
              <FileSpreadsheet size={13} className="text-emerald-400" />
              <span>Excel (.xlsx)</span>
            </button>

            {/* 5. Export to CSV */}
            <button
              type="button"
              onClick={handleDownloadCsv}
              className="h-8 px-2.5 rounded-lg border border-[#1e3c2c] bg-[#0c1a13] hover:bg-[#152e20] text-slate-300 text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer active:scale-95"
              title="CSV फाइल डाउनलोड करें"
            >
              <Download size={13} />
              <span>CSV</span>
            </button>
          </div>
        </div>

        {/* REPORT CONTENT (Formatted White Statement for printing & preview) */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-6 bg-slate-950/50 print:p-0 print:overflow-visible print:bg-white">
          <div
            ref={printAreaRef}
            id="printable-farm-report"
            className="w-full max-w-3xl mx-auto bg-white text-slate-900 rounded-xl p-4 sm:p-8 shadow-md border border-slate-200 text-xs font-sans print:border-none print:shadow-none print:p-0 print:max-w-none"
          >
            {/* STATEMENT HEADER */}
            <div className="border-b-2 border-emerald-600 pb-3 mb-4 flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xl">🌾</span>
                  <h1 className="text-lg sm:text-xl font-bold text-emerald-800 leading-tight">
                    {titleText}
                  </h1>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">{subtitleText}</p>
              </div>
              <div className="text-right shrink-0">
                <div className="text-[11px] font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded">
                  {isHi ? 'दिनांक' : 'Date'}: {todayStr}
                </div>
                <div className="text-[10px] text-emerald-700 font-semibold mt-1">
                  {isHi ? 'सत्र: 2025-2026' : 'Season: 2025-2026'}
                </div>
              </div>
            </div>

            {/* 5-KPI FINANCIAL BANNER */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-5">
              <div className="bg-emerald-50/70 border border-emerald-200 rounded-lg p-2">
                <span className="text-[10px] text-emerald-800 font-semibold block">{isHi ? 'कुल बिक्री' : 'Total Sales'}</span>
                <span className="text-sm font-bold text-emerald-900 font-mono">₹{totalSales.toLocaleString('en-IN')}</span>
              </div>
              <div className="bg-red-50/70 border border-red-200 rounded-lg p-2">
                <span className="text-[10px] text-red-800 font-semibold block">{isHi ? 'कुल खर्च' : 'Total Expenses'}</span>
                <span className="text-sm font-bold text-red-900 font-mono">₹{totalExpense.toLocaleString('en-IN')}</span>
              </div>
              <div className="bg-sky-50/70 border border-sky-200 rounded-lg p-2">
                <span className="text-[10px] text-sky-800 font-semibold block">{isHi ? 'प्राप्त भुगतान' : 'Received'}</span>
                <span className="text-sm font-bold text-sky-900 font-mono">₹{totalReceived.toLocaleString('en-IN')}</span>
              </div>
              <div className="bg-amber-50/70 border border-amber-200 rounded-lg p-2">
                <span className="text-[10px] text-amber-800 font-semibold block">{isHi ? 'बकाया रकम' : 'Pending Due'}</span>
                <span className="text-sm font-bold text-amber-900 font-mono">₹{totalPending.toLocaleString('en-IN')}</span>
              </div>
              <div className={`col-span-2 sm:col-span-1 rounded-lg p-2 border ${netProfit >= 0 ? 'bg-emerald-100/80 border-emerald-300' : 'bg-red-100/80 border-red-300'}`}>
                <span className={`text-[10px] font-bold block ${netProfit >= 0 ? 'text-emerald-900' : 'text-red-900'}`}>
                  {isHi ? 'शुद्ध मुनाफा' : 'Net Profit'}
                </span>
                <span className={`text-sm font-bold font-mono ${netProfit >= 0 ? 'text-emerald-950' : 'text-red-950'}`}>
                  ₹{netProfit.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* STATEMENT TABLE */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-[11px]">
                <thead>
                  <tr className="bg-slate-100 border-y border-slate-300 text-slate-700">
                    <th className="py-2 px-2 text-left font-semibold">#</th>
                    <th className="py-2 px-2 text-left font-semibold">{isHi ? 'दिनांक' : 'Date'}</th>
                    <th className="py-2 px-2 text-left font-semibold">{isHi ? 'खेत / फसल' : 'Field / Crop'}</th>
                    <th className="py-2 px-2 text-left font-semibold">{isHi ? 'प्रकार' : 'Type'}</th>
                    <th className="py-2 px-2 text-left font-semibold">{isHi ? 'विवरण / मात्रा' : 'Details / Qty'}</th>
                    <th className="py-2 px-2 text-right font-semibold">{isHi ? 'रकम (₹)' : 'Amount (₹)'}</th>
                    <th className="py-2 px-2 text-center font-semibold">{isHi ? 'स्थिति' : 'Status'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredRecords.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400">
                        {isHi ? 'इस फ़िल्टर में कोई प्रविष्टि नहीं मिली' : 'No records found matching filters'}
                      </td>
                    </tr>
                  ) : (
                    filteredRecords.map((r, idx) => {
                      const qty = Number(r.quantity || 0);
                      const price = Number(r.price || 0);
                      const calcAmt = qty * price;
                      const amt = calcAmt > 0 ? calcAmt : Number(r.amount || 0);

                      const isSale = r.type === 'Sale';
                      const isExp = r.type === 'Expense';
                      const khetName = r.field || (r.khetId ? khets.find((k) => k.id === r.khetId)?.name : '-');

                      return (
                        <tr key={r.id || idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                          <td className="py-2 px-2 font-mono text-slate-400">{idx + 1}</td>
                          <td className="py-2 px-2 whitespace-nowrap text-slate-600">{r.date}</td>
                          <td className="py-2 px-2 font-medium text-slate-800">
                            <div>{cropLabel(lang, r.crop)}</div>
                            {khetName && <div className="text-[10px] text-slate-500">{khetName}</div>}
                          </td>
                          <td className="py-2 px-2">
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                isExp
                                  ? 'bg-red-100 text-red-800'
                                  : isSale
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {isHi
                                ? isExp
                                  ? 'खर्च'
                                  : isSale
                                  ? 'बिक्री'
                                  : 'पैदावार'
                                : r.type}
                            </span>
                          </td>
                          <td className="py-2 px-2 text-slate-700">
                            {isExp ? (
                              <div>
                                <span className="font-semibold">{r.expenseCategory || 'कृषि लागत'}</span>
                                {r.note && <span className="text-slate-500"> - {r.note}</span>}
                              </div>
                            ) : isSale ? (
                              <div>
                                <span className="font-semibold">{qty} {r.unit || 'क्विंटल'} @ ₹{price}</span>
                                {r.buyerName && <span className="text-slate-500"> ({r.buyerName})</span>}
                              </div>
                            ) : (
                              <div>
                                <span className="font-semibold">{qty} {r.unit || 'क्विंटल'} कटाई</span>
                                {r.note && <span className="text-slate-500"> ({r.note})</span>}
                              </div>
                            )}
                          </td>
                          <td className="py-2 px-2 text-right font-mono font-semibold">
                            {r.type === 'Yield' ? (
                              '-'
                            ) : (
                              <span className={isSale ? 'text-emerald-700' : 'text-slate-800'}>
                                {isSale ? '+' : '-'} ₹{amt.toLocaleString('en-IN')}
                              </span>
                            )}
                          </td>
                          <td className="py-2 px-2 text-center">
                            {isSale ? (
                              (r.remainingAmount || 0) > 0 ? (
                                <span className="text-amber-700 font-semibold text-[10px]">
                                  बाकी ₹{r.remainingAmount}
                                </span>
                              ) : (
                                <span className="text-emerald-700 font-semibold text-[10px]">
                                  ✓ चुकता
                                </span>
                              )
                            ) : (
                              <span className="text-slate-400">-</span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-100 font-bold border-t-2 border-slate-300 text-slate-800">
                    <td colSpan={5} className="py-2 px-2 text-right">
                      {isHi ? 'कुल बिक्री / कुल खर्च:' : 'Total Sales / Expenses:'}
                    </td>
                    <td className="py-2 px-2 text-right font-mono text-emerald-800">
                      ₹{totalSales.toLocaleString('en-IN')} / ₹{totalExpense.toLocaleString('en-IN')}
                    </td>
                    <td className="py-2 px-2 text-center text-emerald-800">
                      {isHi ? `लाभ: ₹${netProfit.toLocaleString('en-IN')}` : `Profit: ₹${netProfit.toLocaleString('en-IN')}`}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* STATEMENT FOOTER & SIGNATURE */}
            <div className="mt-8 pt-4 border-t border-dashed border-slate-300 flex items-end justify-between text-[11px] text-slate-500">
              <div>
                <div className="flex items-center gap-1 font-semibold text-slate-700">
                  <CheckCircle size={13} className="text-emerald-600" />
                  <span>{isHi ? 'किसान साथी डिजिटल कृषि बहीखाता द्वारा प्रमाणित' : 'Certified by Kisan Sathi Digital Farm Ledger'}</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  {isHi ? 'कंप्यूटरीकृत बहीखाता रिकॉर्ड | किसान का डिजिटल साथी' : 'Computerized Farm Record'}
                </div>
              </div>
              <div className="text-center w-40 pt-6 border-t border-slate-400">
                <span className="text-slate-700 font-semibold text-[10px]">
                  {isHi ? 'किसान / व्यवस्थापक हस्ताक्षर' : 'Authorized Signature'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
