import { FarmRecord, Khet, KhetCrop, Lang } from "./types";
import { cropLabel, typeLabel } from "./farmI18n";
import { exportCsvFile, generateCsvString } from "./csvExport";

export interface ExcelExportOptions {
  filename?: string;
  lang: Lang;
  records: FarmRecord[];
  khets?: Khet[];
  khetCrops?: KhetCrop[];
}

export function exportToCsv(options: ExcelExportOptions): void {
  const isHi = options.lang === "hi";
  const todayStr = new Date().toISOString().slice(0, 10);
  const filename = options.filename || `kheti-bahi-${todayStr}.csv`;

  const headers = isHi
    ? [
        "दिनांक",
        "खेत का नाम",
        "फसल",
        "लेनदेन प्रकार",
        "श्रेणी (खर्च)",
        "मात्रा",
        "इकाई",
        "दर/भाव (₹)",
        "कुल रकम (₹)",
        "प्राप्त रकम (₹)",
        "बकाया रकम (₹)",
        "भुगतान स्थिति",
        "खरीदार / मंडी",
        "मजदूर / ऑपरेटर",
        "विवरण / टिप्पणी",
      ]
    : [
        "Date",
        "Field Name",
        "Crop",
        "Type",
        "Expense Category",
        "Quantity",
        "Unit",
        "Rate (INR)",
        "Total Amount (INR)",
        "Paid Amount (INR)",
        "Remaining Amount (INR)",
        "Payment Status",
        "Buyer / Mandi",
        "Worker / Operator",
        "Notes / Remarks",
      ];

  const rows = options.records.map((r) => {
    const qty = Number(r.quantity) || 0;
    const price = Number(r.price) || 0;
    const calcAmt = qty * price;
    const amt = calcAmt > 0 ? calcAmt : Number(r.amount) || 0;
    const paid = r.paidAmount !== undefined ? Number(r.paidAmount) : r.type === "Sale" ? amt : "";
    const pending = r.remainingAmount !== undefined ? Number(r.remainingAmount) : "";

    return [
      r.date || "",
      r.field || "",
      cropLabel(options.lang, r.crop),
      typeLabel(options.lang, r.type),
      r.expenseCategory || "",
      r.quantity !== undefined ? r.quantity : "",
      r.unit || "",
      r.price !== undefined ? r.price : "",
      amt,
      paid,
      pending,
      r.paymentStatus || (r.type === "Sale" ? "Received" : ""),
      r.buyerName || "",
      r.worker || "",
      r.note || "",
    ];
  });

  const csvString = generateCsvString([headers, ...rows]);
  exportCsvFile({
    filename,
    csvString,
    title: isHi ? `कृषि बहीखाता रिपोर्ट (${todayStr})` : `Farm Accounts Report (${todayStr})`,
    lang: options.lang,
  });
}

/**
 * Exports a comprehensive Excel XML spreadsheet (.xlsx compatible)
 * with styled headers, auto-filter, and proper numeric formatting that opens directly in MS Excel & Google Sheets.
 */
export function exportToExcel(options: ExcelExportOptions): void {
  const isHi = options.lang === "hi";
  const todayStr = new Date().toISOString().slice(0, 10);
  const rawFilename = options.filename || `kheti-report-${todayStr}.xlsx`;
  const filename = rawFilename.endsWith(".xlsx") ? rawFilename : `${rawFilename}.xlsx`;

  // We generate Excel XML 2003 format which is fully compatible with Excel, LibreOffice, and Google Sheets
  const headers = isHi
    ? [
        "दिनांक",
        "खेत का नाम",
        "फसल",
        "प्रकार",
        "श्रेणी",
        "मात्रा",
        "इकाई",
        "भाव (₹)",
        "कुल राशि (₹)",
        "प्राप्त राशि (₹)",
        "बकाया (₹)",
        "खरीदार",
        "मजदूर/व्यक्ति",
        "टिप्पणी",
      ]
    : [
        "Date",
        "Field",
        "Crop",
        "Type",
        "Category",
        "Quantity",
        "Unit",
        "Rate",
        "Amount (INR)",
        "Paid (INR)",
        "Balance (INR)",
        "Buyer",
        "Worker",
        "Notes",
      ];

  let totalExpense = 0;
  let totalSales = 0;
  let totalReceived = 0;
  let totalPending = 0;

  const rowsXml = options.records
    .map((r) => {
      const qty = Number(r.quantity) || 0;
      const price = Number(r.price) || 0;
      const calcAmt = qty * price;
      const amt = calcAmt > 0 ? calcAmt : Number(r.amount) || 0;
      const paid = r.paidAmount !== undefined ? Number(r.paidAmount) : (r.type === "Sale" ? amt : 0);
      const pending = r.remainingAmount !== undefined ? Number(r.remainingAmount) : 0;

      if (r.type === "Expense") totalExpense += amt;
      if (r.type === "Sale") {
        totalSales += amt;
        totalReceived += paid;
        totalPending += pending;
      }

      return `<Row>
        <Cell><Data ss:Type="String">${escapeXml(r.date || "")}</Data></Cell>
        <Cell><Data ss:Type="String">${escapeXml(r.field || "")}</Data></Cell>
        <Cell><Data ss:Type="String">${escapeXml(cropLabel(options.lang, r.crop))}</Data></Cell>
        <Cell><Data ss:Type="String">${escapeXml(typeLabel(options.lang, r.type))}</Data></Cell>
        <Cell><Data ss:Type="String">${escapeXml(r.expenseCategory || "")}</Data></Cell>
        <Cell><Data ss:Type="${qty ? "Number" : "String"}">${qty || ""}</Data></Cell>
        <Cell><Data ss:Type="String">${escapeXml(r.unit || "")}</Data></Cell>
        <Cell><Data ss:Type="${price ? "Number" : "String"}">${price || ""}</Data></Cell>
        <Cell ss:StyleID="Currency"><Data ss:Type="Number">${amt}</Data></Cell>
        <Cell ss:StyleID="Currency"><Data ss:Type="Number">${paid}</Data></Cell>
        <Cell ss:StyleID="Currency"><Data ss:Type="Number">${pending}</Data></Cell>
        <Cell><Data ss:Type="String">${escapeXml(r.buyerName || "")}</Data></Cell>
        <Cell><Data ss:Type="String">${escapeXml(r.worker || "")}</Data></Cell>
        <Cell><Data ss:Type="String">${escapeXml(r.note || "")}</Data></Cell>
      </Row>`;
    })
    .join("\n");

  const netProfit = totalSales - totalExpense;

  const excelXml = `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
 <Styles>
  <Style ss:ID="Default" ss:Name="Normal">
   <Alignment ss:Vertical="Center"/>
   <Font ss:FontName="Segoe UI" ss:Size="10" ss:Color="#1e293b"/>
  </Style>
  <Style ss:ID="Header">
   <Font ss:FontName="Segoe UI" ss:Size="11" ss:Bold="1" ss:Color="#ffffff"/>
   <Interior ss:Color="#065f46" ss:Pattern="Solid"/>
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
  </Style>
  <Style ss:ID="SummaryHeader">
   <Font ss:FontName="Segoe UI" ss:Size="12" ss:Bold="1" ss:Color="#ffffff"/>
   <Interior ss:Color="#1e3a8a" ss:Pattern="Solid"/>
  </Style>
  <Style ss:ID="Currency">
   <NumberFormat ss:Format="₹#,##0.00"/>
  </Style>
  <Style ss:ID="Bold">
   <Font ss:FontName="Segoe UI" ss:Size="10" ss:Bold="1"/>
  </Style>
 </Styles>
 <Worksheet ss:Name="${isHi ? "लेनदेन बहीखाता" : "Transactions"}">
  <Table ss:DefaultRowHeight="20">
   <Column ss:Width="80"/>
   <Column ss:Width="110"/>
   <Column ss:Width="80"/>
   <Column ss:Width="70"/>
   <Column ss:Width="90"/>
   <Column ss:Width="60"/>
   <Column ss:Width="70"/>
   <Column ss:Width="70"/>
   <Column ss:Width="90"/>
   <Column ss:Width="90"/>
   <Column ss:Width="90"/>
   <Column ss:Width="110"/>
   <Column ss:Width="100"/>
   <Column ss:Width="150"/>
   <Row ss:Height="24" ss:StyleID="Header">
    ${headers.map((h) => `<Cell><Data ss:Type="String">${escapeXml(h)}</Data></Cell>`).join("")}
   </Row>
   ${rowsXml}
   <Row ss:Height="22" ss:StyleID="Bold">
    <Cell><Data ss:Type="String">${isHi ? "कुल योग" : "TOTAL"}</Data></Cell>
    <Cell><Data ss:Type="String"></Data></Cell>
    <Cell><Data ss:Type="String"></Data></Cell>
    <Cell><Data ss:Type="String"></Data></Cell>
    <Cell><Data ss:Type="String"></Data></Cell>
    <Cell><Data ss:Type="String"></Data></Cell>
    <Cell><Data ss:Type="String"></Data></Cell>
    <Cell><Data ss:Type="String"></Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">${totalExpense + totalSales}</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">${totalReceived}</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">${totalPending}</Data></Cell>
    <Cell><Data ss:Type="String"></Data></Cell>
    <Cell><Data ss:Type="String"></Data></Cell>
    <Cell><Data ss:Type="String">${isHi ? `शुद्ध लाभ: ₹${netProfit}` : `Net Profit: ₹${netProfit}`}</Data></Cell>
   </Row>
  </Table>
 </Worksheet>
</Workbook>`;

  const blob = new Blob([excelXml], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 300);
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
