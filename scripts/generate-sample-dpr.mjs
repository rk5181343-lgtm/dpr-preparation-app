#!/usr/bin/env node
/*
 * Generates the downloadable sample DPR pack in public/samples:
 *
 *   sample-dpr-earthmoving.pdf    print-ready, 8 pages
 *   sample-dpr-earthmoving.docx   editable text and tables
 *   sample-dpr-earthmoving.xlsx   financial model workbook
 *
 * The figures come from the same model the app screens use (src/lib/finance.ts),
 * so the downloadable example matches what a user sees on screen.
 *
 * No dependencies: the PDF is written directly, and DOCX/XLSX are zipped
 * Open XML packages built here.
 *
 * Run: npm run sample:dpr
 */

import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { deflateRawSync } from "node:zlib";

/* ------------------------------------------------------------------ model -- */

const ASSUMPTIONS = {
  loanAmount: 1000000,
  interestRate: 12,
  tenureMonths: 60,
  machineryWdv: 13.0,
  depreciationRate: 0.15,
  promoterCapital: 5.0,
  openingCash: 2.0,
  profitAfterReserve: [4.07, 5.5, 6.99, 8.56, 10.22],
  ownerDrawings: [1.8, 1.89, 1.98, 2.08, 2.19],
  rentalIncome: [12.96, 14.36, 15.88, 17.5, 19.25],
};

const calculateEmi = (principal, annualRate, months) => {
  const monthlyRate = annualRate / 100 / 12;
  if (monthlyRate === 0) return Math.round(principal / months);
  const factor = Math.pow(1 + monthlyRate, months);
  return Math.round((principal * monthlyRate * factor) / (factor - 1));
};

const buildLoanSchedule = (principal, annualRate, months, years = 5) => {
  const monthlyRate = annualRate / 100 / 12;
  const emi = calculateEmi(principal, annualRate, months);
  let balance = principal;
  const schedule = [];

  for (let year = 1; year <= years; year++) {
    const openingBalance = balance;
    let principalPaid = 0;
    let interestPaid = 0;

    for (let month = 1; month <= 12; month++) {
      const instalment = (year - 1) * 12 + month;
      if (instalment > months || balance <= 0) break;
      const interest = Math.round(balance * monthlyRate);
      const principalPart =
        instalment === months ? balance : Math.min(Math.round(emi - interest), balance);
      balance = Math.max(0, balance - principalPart);
      principalPaid += principalPart;
      interestPaid += interest;
    }

    schedule.push({ year, openingBalance, principalRepaid: principalPaid, interestPaid, closingBalance: balance });
  }

  return schedule;
};

const buildYears = () => {
  const loans = buildLoanSchedule(ASSUMPTIONS.loanAmount, ASSUMPTIONS.interestRate, ASSUMPTIONS.tenureMonths);
  let wdv = ASSUMPTIONS.machineryWdv;
  let capital = ASSUMPTIONS.promoterCapital;
  let cash = ASSUMPTIONS.openingCash;
  let previousReceivables = 0;

  return ASSUMPTIONS.profitAfterReserve.map((profit, index) => {
    const loan = loans[index];
    const principalRepaid = loan.principalRepaid / 100000;
    const interestPaid = loan.interestPaid / 100000;

    const depreciation = wdv * ASSUMPTIONS.depreciationRate;
    wdv -= depreciation;

    const receivables = ASSUMPTIONS.rentalIncome[index] / 12;
    const increaseInReceivables = receivables - previousReceivables;
    previousReceivables = receivables;

    const operatingCashAfterInterest = profit + depreciation - increaseInReceivables;
    const openingCash = cash;
    cash = openingCash + operatingCashAfterInterest - principalRepaid - ASSUMPTIONS.ownerDrawings[index];

    capital = capital + profit - ASSUMPTIONS.ownerDrawings[index];
    const termLoanOutstanding = loan.closingBalance / 100000;

    return {
      year: index + 1,
      profit,
      depreciation,
      closingWdv: wdv,
      receivables,
      increaseInReceivables,
      operatingCashAfterInterest,
      openingCash,
      closingCash: cash,
      principalRepaid,
      interestPaid,
      termLoanOutstanding,
      ownerDrawings: ASSUMPTIONS.ownerDrawings[index],
      proprietorCapital: capital,
      totalAssets: wdv + receivables + cash,
      totalCapitalLiabilities: capital + termLoanOutstanding,
    };
  });
};

const YEARS = buildYears();
const EMI = calculateEmi(ASSUMPTIONS.loanAmount, ASSUMPTIONS.interestRate, ASSUMPTIONS.tenureMonths);

const rental = [...ASSUMPTIONS.rentalIncome];
const pat = [...ASSUMPTIONS.profitAfterReserve];
const depreciation = YEARS.map((y) => y.depreciation);
const interest = YEARS.map((y) => y.interestPaid);
const principal = YEARS.map((y) => y.principalRepaid);
const pbt = pat.map((value) => value / 0.75);
const taxReserve = pbt.map((value, i) => value - pat[i]);
const ebitda = pbt.map((value, i) => value + depreciation[i] + interest[i]);
const operatingExpenses = rental.map((value, i) => value - ebitda[i]);
const dscr = YEARS.map((y, i) => {
  const denominator = principal[i] + interest[i];
  return denominator === 0 ? 0 : Math.round(((pat[i] + depreciation[i] + interest[i]) / denominator) * 100) / 100;
});

const fixedCostY1 = operatingExpenses[0] * 0.4 + depreciation[0] + interest[0];
const variableCostY1 = operatingExpenses[0] * 0.6;
const contributionRatio = (rental[0] - variableCostY1) / rental[0];
const breakEvenRevenue = fixedCostY1 / contributionRatio;

const PROJECT = {
  title: "Earthmoving Equipment Rental",
  subtitle: "Hire of excavators and backhoe loaders on hourly and daily rates",
  promoter: "Sri K. Ramesh, Proprietor",
  location: "Medchal, Hyderabad, Telangana",
  activity: "Earthmoving equipment rental",
  loan: 10.0,
  promoterContribution: 5.0,
  totalCost: 15.0,
  machinery: 12.0,
  refurbishment: 1.0,
  workingCapital: 2.0,
  machines: [
    { name: "Hydraulic excavator, 14 tonne", qty: 2, unit: 4.5, total: 9.0 },
    { name: "Backhoe loader (JCB type), 3CX class", qty: 1, unit: 3.0, total: 3.0 },
  ],
  documents: [
    { name: "PAN Card", status: "Received", note: "Verified against application form" },
    { name: "Aadhaar Card", status: "Received", note: "Address matches electricity bill" },
    { name: "Address Proof", status: "Received", note: "Rental agreement, 11 months" },
    { name: "Bank Statements", status: "Received", note: "Last 6 months, current account" },
    { name: "Machine Quotation", status: "Optional", note: "Available, supports machinery cost" },
    { name: "Insurance Proposal", status: "Optional", note: "To be purchased on disbursement" },
    { name: "Registration Permissions", status: "Optional", note: "Applied after purchase" },
  ],
  schedule: [
    { stage: "Quotation and equipment inspection", timing: "Weeks 1-2", owner: "Promoter" },
    { stage: "Application with bank", timing: "Week 3", owner: "Promoter" },
    { stage: "Bank appraisal and sanction", timing: "Subject to lender", owner: "Bank" },
    { stage: "Promoter contribution and disbursement", timing: "After sanction", owner: "Promoter / bank" },
    { stage: "Machinery purchase and insurance", timing: "Within 2 weeks of disbursement", owner: "Promoter" },
    { stage: "Commercial operations", timing: "After equipment readiness", owner: "Promoter / operator" },
  ],
  risks: [
    { risk: "Rental demand falls during monsoon", mitigation: "Site contracts of 3-6 months, two customer segments" },
    { risk: "Diesel price increase", mitigation: "Fuel clause in hire rate, quarterly revision" },
    { risk: "Machine breakdown", mitigation: "Operator-led daily checks, service contract, spare fund" },
    { risk: "Payment delays from customers", mitigation: "30-day credit limit, monthly follow-up, receivables of 1 month only" },
  ],
};

const lakh = (value) => value.toFixed(2);
const crores = (value) => (value / 100).toFixed(2);
const rs = (value) => value.toLocaleString("en-IN");

/* -------------------------------------------------------------------- PDF -- */

const P_W = 595.28;
const P_H = 841.89;
const MARGIN = 48;
const CONTENT_W = P_W - MARGIN * 2;

const C = {
  primary: [0.102, 0.212, 0.365],
  secondary: [0.176, 0.216, 0.282],
  accent: [0.839, 0.62, 0.18],
  muted: [0.42, 0.45, 0.5],
  rule: [0.84, 0.86, 0.9],
  band: [0.952, 0.96, 0.972],
  white: [1, 1, 1],
};

const winAnsi = (value) =>
  String(value)
    .replace(/\u20b9/g, "Rs.")
    .replace(/\u2022/g, "\x95")
    .replace(/[\u2013\u2014]/g, "-")
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201c\u201d]/g, '"')
    .replace(/[^\x09\x0a\x0d\x20-\xff]/g, "");

const escapePdf = (value) => winAnsi(value).replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");

const drawText = (ops, x, y, value, { size = 9.6, bold = false, color = C.secondary, align = "left" } = {}) => {
  const text = winAnsi(value);
  let startX = x;
  if (align !== "left") {
    const width = textWidth(text, size, bold) ;
    startX = align === "right" ? x - width : x - width / 2;
  }
  ops.push(
    `BT /${bold ? "F2" : "F1"} ${size} Tf ${color.join(" ")} rg 1 0 0 1 ${startX.toFixed(2)} ${y.toFixed(2)} Tm (${escapePdf(text)}) Tj ET`
  );
};

const drawRect = (ops, x, y, w, h, color) => {
  ops.push(`${color.join(" ")} rg ${x.toFixed(2)} ${y.toFixed(2)} ${w.toFixed(2)} ${h.toFixed(2)} re f`);
};

const drawLine = (ops, x1, y1, x2, y2, width, color) => {
  ops.push(
    `${color.join(" ")} RG ${width} w ${x1.toFixed(2)} ${y1.toFixed(2)} m ${x2.toFixed(2)} ${y2.toFixed(2)} l S`
  );
};

/* Helvetica approximation: wide enough that nothing spills past a cell. */
const charWidth = (size, bold) => size * (bold ? 0.555 : 0.508);
const textWidth = (value, size, bold) => winAnsi(value).length * charWidth(size, bold);

const wrapText = (value, maxWidth, size, bold = false) => {
  const words = winAnsi(value).split(/\s+/).filter(Boolean);
  const lines = [];
  let line = "";

  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (textWidth(candidate, size, bold) <= maxWidth || !line) {
      line = candidate;
    } else {
      lines.push(line);
      line = word;
    }
  }

  if (line) lines.push(line);
  return lines.length ? lines : [""];
};

class PdfDoc {
  constructor(title) {
    this.title = title;
    this.pages = [];
    this.ops = [];
    this.newPage({ header: false });
  }

  newPage({ header = true } = {}) {
    this.ops = [];
    this.pages.push(this.ops);
    this.y = P_H - (header ? 76 : 96);
    if (header) {
      drawText(this.ops, MARGIN, P_H - 50, this.title, { size: 8, color: C.muted });
      drawLine(this.ops, MARGIN, P_H - 58, P_W - MARGIN, P_H - 58, 0.6, C.rule);
    }
  }

  ensure(height) {
    if (this.y - height < 62) this.newPage();
  }

  heading(label) {
    this.ensure(52);
    this.y -= 10;
    drawText(this.ops, MARGIN, this.y, label, { size: 12.5, bold: true, color: C.primary });
    this.y -= 7;
    drawLine(this.ops, MARGIN, this.y, P_W - MARGIN, this.y, 0.9, C.accent);
    this.y -= 15;
  }

  subheading(label) {
    this.ensure(28);
    this.y -= 4;
    drawText(this.ops, MARGIN, this.y, label, { size: 10, bold: true, color: C.secondary });
    this.y -= 14;
  }

  paragraph(value, { size = 9.6, gap = 7, color = C.secondary } = {}) {
    const lines = wrapText(value, CONTENT_W, size);
    const lineHeight = size + 3.6;
    this.ensure(lines.length * lineHeight + 6);
    for (const line of lines) {
      drawText(this.ops, MARGIN, this.y, line, { size, color });
      this.y -= lineHeight;
    }
    this.y -= gap;
  }

  bullets(items) {
    for (const item of items) {
      const lines = wrapText(item, CONTENT_W - 14, 9.6);
      const lineHeight = 13.2;
      this.ensure(lines.length * lineHeight + 4);
      drawText(this.ops, MARGIN + 2, this.y, "\x95", { size: 9.6, color: C.accent });
      lines.forEach((line, index) => {
        drawText(this.ops, MARGIN + 14, this.y - index * lineHeight, line, { size: 9.6 });
      });
      this.y -= lines.length * lineHeight + 3;
    }
    this.y -= 4;
  }

  table({ widths, header, rows, fontSize = 8.8, aligns = [], boldRows = [], note }) {
    const totalWidth = widths.reduce((sum, width) => sum + width, 0);
    const scale = totalWidth > CONTENT_W ? CONTENT_W / totalWidth : 1;
    const cols = widths.map((width) => width * scale);
    const padding = 5;

    const layoutRow = (cells, bold) =>
      cells.map((cell, index) => wrapText(String(cell), cols[index] - padding * 2, fontSize, bold));

    const drawRow = (cells, { bold = false, fill = null, color = C.secondary } = {}) => {
      const lines = layoutRow(cells, bold);
      const lineHeight = fontSize + 2.9;
      const height = Math.max(...lines.map((cell) => cell.length)) * lineHeight + 7;
      this.ensure(height + 2);
      if (fill) drawRect(this.ops, MARGIN, this.y - height, CONTENT_W, height, fill);
      let x = MARGIN;
      lines.forEach((cellLines, index) => {
        const align = aligns[index] ?? (index === 0 ? "left" : "right");
        const cellX = align === "right" ? x + cols[index] - padding : x + padding;
        cellLines.forEach((line, lineIndex) => {
          drawText(this.ops, cellX, this.y - 11 - lineIndex * lineHeight, line, {
            size: fontSize,
            bold,
            color,
            align,
          });
        });
        x += cols[index];
      });
      this.y -= height;
      drawLine(this.ops, MARGIN, this.y, P_W - MARGIN, this.y, 0.4, C.rule);
    };

    const drawHeader = () => {
      if (header) drawRow(header, { bold: true, fill: C.primary, color: C.white });
    };

    drawHeader();
    rows.forEach((row, index) => {
      const before = this.pages.length;
      drawRow(row, { bold: boldRows.includes(index), fill: index % 2 === 1 ? C.band : null });
      if (this.pages.length !== before) drawHeader();
    });

    if (note) {
      this.y -= 4;
      drawText(this.ops, MARGIN, this.y, note, { size: 8, color: C.muted });
      this.y -= 12;
    }
    this.y -= 6;
  }

  finish() {
    this.pages.forEach((ops, index) => {
      drawLine(ops, MARGIN, 56, P_W - MARGIN, 56, 0.6, C.rule);
      drawText(ops, MARGIN, 44, "DPR Preparation System - sample document, illustrative figures", { size: 7.5, color: C.muted });
      drawText(ops, P_W - MARGIN, 44, `Page ${index + 1} of ${this.pages.length}`, { size: 7.5, color: C.muted, align: "right" });
    });

    return buildPdf(this.pages);
  }
}

const buildPdf = (pages) => {
  const catalogId = 1;
  const pagesId = 2;
  const fontRegularId = 3;
  const fontBoldId = 4;
  let nextId = 5;
  const streamIds = [];
  const pageIds = [];

  pages.forEach(() => {
    streamIds.push(nextId++);
    pageIds.push(nextId++);
  });

  const bodies = new Array(nextId);
  bodies[catalogId] = `<< /Type /Catalog /Pages ${pagesId} 0 R >>`;
  bodies[pagesId] = `<< /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(" ")}] /Count ${pages.length} >>`;
  bodies[fontRegularId] = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>";
  bodies[fontBoldId] = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>";

  pages.forEach((ops, index) => {
    const stream = ops.join("\n");
    const streamId = streamIds[index];
    const pageId = pageIds[index];
    bodies[streamId] = `<< /Length ${Buffer.byteLength(stream, "latin1")} >>\nstream\n${stream}\nendstream`;
    bodies[pageId] =
      `<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 ${P_W} ${P_H}] ` +
      `/Resources << /Font << /F1 ${fontRegularId} 0 R /F2 ${fontBoldId} 0 R >> >> ` +
      `/Contents ${streamId} 0 R >>`;
  });

  let out = "%PDF-1.4\n";
  const offsets = new Array(nextId);

  for (let id = 1; id < nextId; id++) {
    offsets[id] = Buffer.byteLength(out, "latin1");
    out += `${id} 0 obj\n${bodies[id]}\nendobj\n`;
  }

  const xrefStart = Buffer.byteLength(out, "latin1");
  out += `xref\n0 ${nextId}\n0000000000 65535 f \n`;
  for (let id = 1; id < nextId; id++) {
    out += `${String(offsets[id]).padStart(10, "0")} 00000 n \n`;
  }
  out += `trailer\n<< /Size ${nextId} /Root ${catalogId} 0 R >>\nstartxref\n${xrefStart}\n%%EOF\n`;

  return Buffer.from(out, "latin1");
};

const buildSamplePdf = () => {
  const doc = new PdfDoc("Detailed Project Report - Earthmoving Equipment Rental");

  /* Cover */
  drawRect(doc.ops, 0, P_H - 250, P_W, 250, C.primary);
  drawText(doc.ops, MARGIN, P_H - 120, "DETAILED PROJECT REPORT", { size: 24, bold: true, color: C.white });
  drawText(doc.ops, MARGIN, P_H - 148, PROJECT.title, { size: 15, color: C.white });
  drawText(doc.ops, MARGIN, P_H - 172, PROJECT.subtitle, { size: 10, color: [0.85, 0.88, 0.92] });
  drawRect(doc.ops, MARGIN, P_H - 190, 120, 3, C.accent);
  drawText(doc.ops, MARGIN, P_H - 222, "Term loan application for bank appraisal", { size: 10.5, color: C.white });

  doc.y = P_H - 300;
  doc.table({
    widths: [190, 300],
    rows: [
      ["Promoter", PROJECT.promoter],
      ["Project location", PROJECT.location],
      ["Activity", PROJECT.activity],
      ["Project cost", `Rs. ${lakh(PROJECT.totalCost)} lakh`],
      ["Term loan applied", `Rs. ${lakh(PROJECT.loan)} lakh`],
      ["Promoter contribution", `Rs. ${lakh(PROJECT.promoterContribution)} lakh (33%)`],
      ["Repayment", `${ASSUMPTIONS.tenureMonths} months at ${ASSUMPTIONS.interestRate}% p.a., EMI Rs. ${rs(EMI)}`],
    ],
  });

  doc.subheading("What this document is");
  doc.paragraph(
    "This is a completed example of the report the application prepares. Every section a bank expects in a term loan proposal is filled in with consistent figures: cost of the project, means of finance, five year profitability, cash flow, balance sheet, repayment capacity, break even point, implementation plan and the document checklist."
  );
  doc.paragraph(
    "The example project is a three machine earthmoving rental business financed with a Rs. 10.00 lakh term loan and Rs. 5.00 lakh of promoter money. Replace the names, locations and figures with your own before submitting anything to a lender."
  );

  doc.y -= 6;
  drawRect(doc.ops, MARGIN, doc.y - 62, CONTENT_W, 62, C.band);
  drawText(doc.ops, MARGIN + 14, doc.y - 22, "Sample document", { size: 10, bold: true, color: C.primary });
  drawText(doc.ops, MARGIN + 14, doc.y - 38, "Figures are illustrative and internally consistent, not a real sanction or appraisal.", { size: 8.6, color: C.muted });
  drawText(doc.ops, MARGIN + 14, doc.y - 52, "Prepared by DPR Preparation System. No personal identity details are included.", { size: 8.6, color: C.muted });

  /* Page 2 */
  doc.newPage();
  doc.heading("1. Project at a glance");
  doc.table({
    widths: [180, 320],
    rows: [
      ["Proposed activity", "Renting out earthmoving machines with operator to site contractors"],
      ["Machines", "2 hydraulic excavators and 1 backhoe loader"],
      ["Capacity", "200 billable hours per machine per month at 60% utilisation"],
      ["Hire rate", "Rs. 180 per hour, dry and wet hire as per site contract"],
      ["Total cost of project", `Rs. ${lakh(PROJECT.totalCost)} lakh`],
      ["Term loan", `Rs. ${lakh(PROJECT.loan)} lakh`],
      ["Promoter contribution", `Rs. ${lakh(PROJECT.promoterContribution)} lakh`],
      ["Year 1 rental income", `Rs. ${lakh(rental[0])} lakh`],
      ["Year 1 net profit after reserve", `Rs. ${lakh(pat[0])} lakh`],
      ["Minimum DSCR", `${Math.min(...dscr).toFixed(2)}x in year ${dscr.indexOf(Math.min(...dscr)) + 1}`],
      ["Repayment period", `${ASSUMPTIONS.tenureMonths} months`],
    ],
  });

  doc.heading("2. Executive summary");
  doc.paragraph(
    "The promoter proposes to buy two hydraulic excavators and one backhoe loader and hire them out to civil contractors, road contractors and real estate developers around Hyderabad. The machines are bought with a Rs. 10.00 lakh term loan and Rs. 5.00 lakh of promoter money, of which Rs. 2.00 lakh is kept as working capital for diesel, spares and operator wages."
  );
  doc.bullets([
    `Year 1 rental income of Rs. ${lakh(rental[0])} lakh from 7,200 billable machine hours, growing to Rs. ${lakh(rental[4])} lakh in year 5 as hire rates and utilisation improve.`,
    `Net profit after tax and reserve of Rs. ${lakh(pat[0])} lakh in year 1, rising to Rs. ${lakh(pat[4])} lakh in year 5.`,
    `Debt service coverage of ${dscr[0].toFixed(2)}x in year 1 and never below ${Math.min(...dscr).toFixed(2)}x, against the 1.50x a lender normally asks for.`,
    `The loan closes exactly at zero in the sixtieth month, cash balance grows every year and the balance sheet balances in all five years.`,
    "Only identity and bank records are mandatory in the checklist; quotations and other paperwork are collected when available.",
  ]);

  /* Page 3 */
  doc.newPage();
  doc.heading("3. Promoter and project profile");
  doc.paragraph(
    "Sri K. Ramesh is a proprietor with eight years of site supervision experience on road and building contracts. He already holds a light commercial vehicle permit and has worked with two of the three customers listed as prospective hirers. The business will operate from a rented yard at Medchal with space for three machines, a fuel point and a small workshop."
  );
  doc.table({
    widths: [180, 320],
    rows: [
      ["Constitution", "Proprietorship"],
      ["Business name", "Sri Ramesh Earthmovers"],
      ["Registered address", "Medchal, Hyderabad, Telangana"],
      ["Experience", "8 years in site supervision and equipment operation"],
      ["Premises", "Rented yard, 2,000 sq ft, lease of 11 months"],
      ["Employees", "3 operators and 1 part time mechanic"],
      ["Proposed loan", "Mudra Tarun term loan of Rs. 10.00 lakh"],
    ],
  });

  doc.heading("4. Market and demand");
  doc.paragraph(
    "Earthmoving machines are hired by road contractors, layout developers, agricultural land levelling work and small builders. Demand around the proposed location is driven by the outer ring road works, industrial shed construction in Medchal and Medak, and land development in neighbouring mandals. Contractors prefer hiring over owning because a single machine costs more than most small contracts."
  );
  doc.paragraph(
    "Three customers have given written enquiries for a combined 380 hours a month, which is 63% of the billable capacity of 600 hours a month. The remaining hours are met from spot hire through the local operator network. Hire rates for a 14 tonne excavator ranged between Rs. 160 and Rs. 220 per hour in the last twelve months, and the projection uses Rs. 180 per hour."
  );

  /* Page 4 */
  doc.newPage();
  doc.heading("5. Machinery and technical details");
  doc.table({
    widths: [250, 60, 80, 90],
    header: ["Machine", "Qty", "Unit cost (Rs. lakh)", "Total (Rs. lakh)"],
    rows: [
      ...PROJECT.machines.map((machine) => [machine.name, String(machine.qty), lakh(machine.unit), lakh(machine.total)]),
      ["Sub total machinery", "", "", lakh(PROJECT.machinery)],
      ["Refurbishment, transport and registration", "", "", lakh(PROJECT.refurbishment)],
      ["Total fixed assets", "", "", lakh(PROJECT.machinery + PROJECT.refurbishment)],
    ],
    boldRows: [3, 5],
  });

  doc.subheading("Operating assumptions");
  doc.table({
    widths: [250, 250],
    rows: [
      ["Working hours per machine per month", "200"],
      ["Utilisation", "60%"],
      ["Billable hours per year", "7,200"],
      ["Hire rate per hour", "Rs. 180"],
      ["Diesel consumption", "6 litres per hour"],
      ["Diesel price assumed", "Rs. 92 per litre"],
      ["Operator salary", "Rs. 22,000 per month each"],
      ["Maintenance and spares", "Rs. 90,000 per year"],
      ["Insurance", "Rs. 45,000 per year per machine"],
    ],
  });

  doc.paragraph(
    "Each machine carries an operator, a daily check sheet and a service schedule every 250 hours. Fuel is billed to the customer where the site supplies diesel, otherwise it is recovered in the hire rate. A spare parts fund of Rs. 60,000 is held to avoid idle time during breakdowns."
  );

  /* Page 5 */
  doc.newPage();
  doc.heading("6. Cost of the project");
  doc.table({
    widths: [300, 100, 100],
    header: ["Particulars", "Rs. lakh", "% of cost"],
    rows: [
      ["Machinery", lakh(PROJECT.machinery), `${((PROJECT.machinery / PROJECT.totalCost) * 100).toFixed(0)}%`],
      ["Refurbishment, transport and registration", lakh(PROJECT.refurbishment), `${((PROJECT.refurbishment / PROJECT.totalCost) * 100).toFixed(0)}%`],
      ["Working capital margin (diesel, spares, wages)", lakh(PROJECT.workingCapital), `${((PROJECT.workingCapital / PROJECT.totalCost) * 100).toFixed(0)}%`],
      ["Total cost of project", lakh(PROJECT.totalCost), "100%"],
    ],
    boldRows: [3],
  });

  doc.heading("7. Means of finance");
  doc.table({
    widths: [300, 100, 100],
    header: ["Particulars", "Rs. lakh", "% of cost"],
    rows: [
      ["Term loan from bank", lakh(PROJECT.loan), `${((PROJECT.loan / PROJECT.totalCost) * 100).toFixed(0)}%`],
      ["Promoter contribution", lakh(PROJECT.promoterContribution), `${((PROJECT.promoterContribution / PROJECT.totalCost) * 100).toFixed(0)}%`],
      ["Total", lakh(PROJECT.totalCost), "100%"],
    ],
    boldRows: [2],
  });

  doc.heading("8. Loan terms and repayment");
  doc.table({
    widths: [250, 250],
    rows: [
      ["Loan amount", `Rs. ${lakh(PROJECT.loan)} lakh`],
      ["Interest rate", `${ASSUMPTIONS.interestRate}% per annum on reducing balance`],
      ["Tenure", `${ASSUMPTIONS.tenureMonths} months`],
      ["Monthly instalment (EMI)", `Rs. ${rs(EMI)}`],
      ["Total interest over tenure", `Rs. ${lakh(YEARS.reduce((sum, y) => sum + y.interestPaid, 0))} lakh`],
      ["Moratorium", "None assumed; repayment starts in month 13 after commissioning buffer"],
      ["Security", "Hypothecation of machines and personal guarantee of proprietor"],
    ],
  });

  /* Page 6 */
  doc.newPage();
  doc.heading("9. Five year profitability projection");
  doc.table({
    widths: [190, 65, 65, 65, 65, 65],
    header: ["Rs. lakh", "Year 1", "Year 2", "Year 3", "Year 4", "Year 5"],
    rows: [
      ["Rental income", ...rental.map(lakh)],
      ["Operating expenses", ...operatingExpenses.map(lakh)],
      ["EBITDA", ...ebitda.map(lakh)],
      ["Depreciation", ...depreciation.map(lakh)],
      ["Interest on term loan", ...interest.map(lakh)],
      ["Profit before tax", ...pbt.map(lakh)],
      ["Tax and reserve", ...taxReserve.map(lakh)],
      ["Net profit after reserve", ...pat.map(lakh)],
      ["Principal repaid", ...principal.map(lakh)],
      ["DSCR", ...dscr.map((value) => `${value.toFixed(2)}x`)],
    ],
    boldRows: [2, 7, 9],
    fontSize: 8.4,
  });

  doc.paragraph(
    `Operating expenses cover diesel, operator wages, maintenance, insurance and administration, and fall from ${((operatingExpenses[0] / rental[0]) * 100).toFixed(0)}% of income in year 1 to ${((operatingExpenses[4] / rental[4]) * 100).toFixed(0)}% in year 5 as fixed costs are spread over more billable hours. Depreciation is charged on written down value at 15%.`
  );

  doc.heading("10. Cash flow statement");
  doc.table({
    widths: [190, 65, 65, 65, 65, 65],
    header: ["Rs. lakh", "Year 1", "Year 2", "Year 3", "Year 4", "Year 5"],
    rows: [
      ["Opening cash", ...YEARS.map((y) => lakh(y.openingCash))],
      ["Operating cash after interest", ...YEARS.map((y) => lakh(y.operatingCashAfterInterest))],
      ["Principal repaid", ...YEARS.map((y) => `(${lakh(y.principalRepaid)})`)],
      ["Owner drawings", ...YEARS.map((y) => `(${lakh(y.ownerDrawings)})`)],
      ["Closing cash", ...YEARS.map((y) => lakh(y.closingCash))],
    ],
    boldRows: [4],
  });

  /* Page 7 */
  doc.newPage();
  doc.heading("11. Projected balance sheet");
  doc.table({
    widths: [190, 65, 65, 65, 65, 65],
    header: ["Rs. lakh", "Year 1", "Year 2", "Year 3", "Year 4", "Year 5"],
    rows: [
      ["Machinery at WDV", ...YEARS.map((y) => lakh(y.closingWdv))],
      ["Receivables", ...YEARS.map((y) => lakh(y.receivables))],
      ["Cash and bank", ...YEARS.map((y) => lakh(y.closingCash))],
      ["Total assets", ...YEARS.map((y) => lakh(y.totalAssets))],
      ["Proprietor capital", ...YEARS.map((y) => lakh(y.proprietorCapital))],
      ["Term loan outstanding", ...YEARS.map((y) => lakh(y.termLoanOutstanding))],
      ["Total capital and liabilities", ...YEARS.map((y) => lakh(y.totalCapitalLiabilities))],
    ],
    boldRows: [3, 6],
  });
  doc.paragraph(
    `Assets equal liabilities in every year. The term loan reduces from Rs. ${lakh(PROJECT.loan)} lakh to nil by the end of year 5, while cash builds from Rs. ${lakh(YEARS[0].closingCash)} lakh to Rs. ${lakh(YEARS[4].closingCash)} lakh.`
  );

  doc.heading("12. Break even analysis");
  doc.table({
    widths: [300, 200],
    rows: [
      ["Fixed costs in year 1 (wages, insurance, depreciation, interest)", `Rs. ${lakh(fixedCostY1)} lakh`],
      ["Variable costs in year 1 (diesel, maintenance)", `Rs. ${lakh(variableCostY1)} lakh`],
      ["Contribution margin", `${(contributionRatio * 100).toFixed(0)}%`],
      ["Break even rental income", `Rs. ${lakh(breakEvenRevenue)} lakh`],
      ["Margin of safety on year 1 income", `${(((rental[0] - breakEvenRevenue) / rental[0]) * 100).toFixed(0)}%`],
      ["Break even billable hours", `${Math.round((breakEvenRevenue * 100000) / 180)} hours`],
    ],
    boldRows: [3],
  });

  doc.heading("13. Implementation schedule");
  doc.table({
    widths: [280, 130, 90],
    header: ["Stage", "Indicative timing", "Responsibility"],
    rows: PROJECT.schedule.map((item) => [item.stage, item.timing, item.owner]),
    fontSize: 8.4,
  });

  /* Page 8 */
  doc.newPage();
  doc.heading("14. Risk assessment and mitigation");
  doc.table({
    widths: [230, 270],
    header: ["Risk", "Mitigation"],
    rows: PROJECT.risks.map((item) => [item.risk, item.mitigation]),
    fontSize: 8.4,
  });

  doc.heading("15. Document checklist");
  doc.table({
    widths: [190, 100, 210],
    header: ["Document", "Status", "Remarks"],
    rows: PROJECT.documents.map((item) => [item.name, item.status, item.note]),
    fontSize: 8.4,
  });
  doc.paragraph(
    "Only PAN, Aadhaar, address proof and bank statements are mandatory. The remaining documents are optional and improve the appraisal but do not block submission."
  );

  doc.heading("16. Conclusion");
  doc.paragraph(
    `The proposal needs Rs. ${lakh(PROJECT.loan)} lakh of term finance against a total project cost of Rs. ${lakh(PROJECT.totalCost)} lakh, with the promoter bringing Rs. ${lakh(PROJECT.promoterContribution)} lakh. Year 1 rental income of Rs. ${lakh(rental[0])} lakh supports debt service of ${dscr[0].toFixed(2)}x, the lowest coverage in the five year period is ${Math.min(...dscr).toFixed(2)}x, and the loan is fully repaid within the tenure. On these assumptions the project is viable and the loan is repayable.`
  );
  doc.paragraph(
    "Disclaimer: this is a sample prepared by DPR Preparation System to show the expected structure and depth of a bank proposal. The figures are illustrative, no personal identity details are included, and any real submission must use the applicant's own verified data."
  );

  return doc.finish();
};

/* ------------------------------------------------------------------- DOCX -- */

const xmlEscape = (value) =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const dParagraph = (text, { bold = false, size = 20, color = "1A365D", after = 120, align = "left" } = {}) =>
  `<w:p><w:pPr><w:spacing w:after="${after}"/><w:jc w:val="${align}"/></w:pPr><w:r><w:rPr>${
    bold ? "<w:b/>" : ""
  }<w:sz w:val="${size}"/><w:color w:val="${color}"/></w:rPr><w:t xml:space="preserve">${xmlEscape(text)}</w:t></w:r></w:p>`;

const dHeading = (text) => dParagraph(text, { bold: true, size: 28, after: 160 });

const dTable = (rows, widths) => {
  const total = widths.reduce((sum, width) => sum + width, 0);
  const grid = widths.map((width) => `<w:gridCol w:w="${Math.round((width / total) * 9360)}"/>`).join("");
  const body = rows
    .map((cells, rowIndex) => {
      const isHeader = rowIndex === 0;
      const cellsXml = cells
        .map((cell, index) => {
          const width = Math.round((widths[index] / total) * 9360);
          const shade = isHeader ? '<w:shd w:val="clear" w:color="auto" w:fill="1A365D"/>' : "";
          const color = isHeader ? "FFFFFF" : "2D3748";
          return (
            `<w:tc><w:tcPr><w:tcW w:w="${width}" w:type="dxa"/>${shade}</w:tcPr>` +
            `<w:p><w:pPr><w:spacing w:after="0"/></w:pPr><w:r><w:rPr>${isHeader ? "<w:b/>" : ""}` +
            `<w:sz w:val="18"/><w:color w:val="${color}"/></w:rPr>` +
            `<w:t xml:space="preserve">${xmlEscape(cell)}</w:t></w:r></w:p></w:tc>`
          );
        })
        .join("");
      return `<w:tr>${cellsXml}</w:tr>`;
    })
    .join("");

  return (
    `<w:tbl><w:tblPr><w:tblW w:w="9360" w:type="dxa"/><w:tblBorders>` +
    ["top", "left", "bottom", "right", "insideH", "insideV"]
      .map((side) => `<w:${side} w:val="single" w:sz="4" w:space="0" w:color="CBD5E0"/>`)
      .join("") +
    `</w:tblBorders><w:tblCellMar><w:top w:w="60" w:type="dxa"/><w:bottom w:w="60" w:type="dxa"/>` +
    `<w:left w:w="90" w:type="dxa"/><w:right w:w="90" w:type="dxa"/></w:tblCellMar></w:tblPr>` +
    `<w:tblGrid>${grid}</w:tblGrid>${body}</w:tbl><w:p><w:pPr><w:spacing w:after="80"/></w:pPr></w:p>`
  );
};

const buildSampleDocx = () => {
  const blocks = [];
  blocks.push(dParagraph("DETAILED PROJECT REPORT", { bold: true, size: 40, after: 60, align: "center" }));
  blocks.push(dParagraph(PROJECT.title, { size: 28, after: 60, align: "center" }));
  blocks.push(dParagraph(PROJECT.subtitle, { size: 20, color: "4A5568", after: 240, align: "center" }));
  blocks.push(
    dParagraph("Sample document prepared by DPR Preparation System - illustrative figures, no personal identity details.", {
      size: 18,
      color: "718096",
      after: 360,
      align: "center",
    })
  );

  blocks.push(dHeading("1. Project at a glance"));
  blocks.push(
    dTable(
      [
        ["Particulars", "Details"],
        ["Promoter", PROJECT.promoter],
        ["Location", PROJECT.location],
        ["Activity", PROJECT.activity],
        ["Machines", "2 hydraulic excavators and 1 backhoe loader"],
        ["Total cost of project", `Rs. ${lakh(PROJECT.totalCost)} lakh`],
        ["Term loan", `Rs. ${lakh(PROJECT.loan)} lakh`],
        ["Promoter contribution", `Rs. ${lakh(PROJECT.promoterContribution)} lakh`],
        ["Repayment", `${ASSUMPTIONS.tenureMonths} months at ${ASSUMPTIONS.interestRate}% p.a., EMI Rs. ${rs(EMI)}`],
        ["Minimum DSCR", `${Math.min(...dscr).toFixed(2)}x`],
      ],
      [260, 500]
    )
  );

  blocks.push(dHeading("2. Executive summary"));
  blocks.push(
    dParagraph(
      "The promoter proposes to buy two hydraulic excavators and one backhoe loader and hire them out to civil and road contractors. The project costs Rs. 15.00 lakh, financed by a Rs. 10.00 lakh term loan and Rs. 5.00 lakh of promoter money, including Rs. 2.00 lakh of working capital."
    )
  );
  blocks.push(dParagraph(`Year 1 rental income of Rs. ${lakh(rental[0])} lakh from 7,200 billable machine hours at Rs. 180 per hour.`, { size: 18, color: "2D3748", after: 60 }));
  blocks.push(dParagraph(`Net profit after reserve rises from Rs. ${lakh(pat[0])} lakh in year 1 to Rs. ${lakh(pat[4])} lakh in year 5.`, { size: 18, color: "2D3748", after: 60 }));
  blocks.push(dParagraph(`Debt service coverage is ${dscr[0].toFixed(2)}x in year 1 and never below ${Math.min(...dscr).toFixed(2)}x.`, { size: 18, color: "2D3748", after: 240 }));

  blocks.push(dHeading("3. Cost of the project"));
  blocks.push(
    dTable(
      [
        ["Particulars", "Rs. lakh"],
        ["Machinery", lakh(PROJECT.machinery)],
        ["Refurbishment, transport and registration", lakh(PROJECT.refurbishment)],
        ["Working capital margin", lakh(PROJECT.workingCapital)],
        ["Total cost of project", lakh(PROJECT.totalCost)],
      ],
      [520, 240]
    )
  );

  blocks.push(dHeading("4. Means of finance"));
  blocks.push(
    dTable(
      [
        ["Particulars", "Rs. lakh"],
        ["Term loan from bank", lakh(PROJECT.loan)],
        ["Promoter contribution", lakh(PROJECT.promoterContribution)],
        ["Total", lakh(PROJECT.totalCost)],
      ],
      [520, 240]
    )
  );

  blocks.push(dHeading("5. Machinery"));
  blocks.push(
    dTable(
      [
        ["Machine", "Qty", "Unit cost (Rs. lakh)", "Total (Rs. lakh)"],
        ...PROJECT.machines.map((machine) => [machine.name, String(machine.qty), lakh(machine.unit), lakh(machine.total)]),
        ["Total machinery", "", "", lakh(PROJECT.machinery)],
      ],
      [320, 60, 140, 140]
    )
  );

  blocks.push(dHeading("6. Five year profitability projection (Rs. lakh)"));
  blocks.push(
    dTable(
      [
        ["Particulars", "Year 1", "Year 2", "Year 3", "Year 4", "Year 5"],
        ["Rental income", ...rental.map(lakh)],
        ["Operating expenses", ...operatingExpenses.map(lakh)],
        ["EBITDA", ...ebitda.map(lakh)],
        ["Depreciation", ...depreciation.map(lakh)],
        ["Interest", ...interest.map(lakh)],
        ["Profit before tax", ...pbt.map(lakh)],
        ["Tax and reserve", ...taxReserve.map(lakh)],
        ["Net profit after reserve", ...pat.map(lakh)],
        ["Principal repaid", ...principal.map(lakh)],
        ["DSCR", ...dscr.map((value) => `${value.toFixed(2)}x`)],
      ],
      [200, 78, 78, 78, 78, 78]
    )
  );

  blocks.push(dHeading("7. Cash flow and balance sheet highlights (Rs. lakh)"));
  blocks.push(
    dTable(
      [
        ["Particulars", "Year 1", "Year 2", "Year 3", "Year 4", "Year 5"],
        ["Opening cash", ...YEARS.map((y) => lakh(y.openingCash))],
        ["Operating cash after interest", ...YEARS.map((y) => lakh(y.operatingCashAfterInterest))],
        ["Closing cash", ...YEARS.map((y) => lakh(y.closingCash))],
        ["Machinery at WDV", ...YEARS.map((y) => lakh(y.closingWdv))],
        ["Term loan outstanding", ...YEARS.map((y) => lakh(y.termLoanOutstanding))],
        ["Total assets", ...YEARS.map((y) => lakh(y.totalAssets))],
        ["Total capital and liabilities", ...YEARS.map((y) => lakh(y.totalCapitalLiabilities))],
      ],
      [200, 78, 78, 78, 78, 78]
    )
  );

  blocks.push(dHeading("8. Break even analysis"));
  blocks.push(
    dTable(
      [
        ["Particulars", "Year 1"],
        ["Fixed costs", `Rs. ${lakh(fixedCostY1)} lakh`],
        ["Variable costs", `Rs. ${lakh(variableCostY1)} lakh`],
        ["Contribution margin", `${(contributionRatio * 100).toFixed(0)}%`],
        ["Break even rental income", `Rs. ${lakh(breakEvenRevenue)} lakh`],
        ["Margin of safety", `${(((rental[0] - breakEvenRevenue) / rental[0]) * 100).toFixed(0)}%`],
      ],
      [520, 240]
    )
  );

  blocks.push(dHeading("9. Implementation schedule"));
  blocks.push(
    dTable(
      [["Stage", "Timing", "Responsibility"], ...PROJECT.schedule.map((item) => [item.stage, item.timing, item.owner])],
      [400, 220, 220]
    )
  );

  blocks.push(dHeading("10. Risk assessment and mitigation"));
  blocks.push(dTable([["Risk", "Mitigation"], ...PROJECT.risks.map((item) => [item.risk, item.mitigation])], [360, 400]));

  blocks.push(dHeading("11. Document checklist"));
  blocks.push(
    dTable(
      [["Document", "Status", "Remarks"], ...PROJECT.documents.map((item) => [item.name, item.status, item.note])],
      [280, 140, 420]
    )
  );
  blocks.push(
    dParagraph("Only PAN, Aadhaar, address proof and bank statements are mandatory; the rest are optional.", {
      size: 18,
      color: "4A5568",
      after: 200,
    })
  );

  blocks.push(dHeading("12. Conclusion"));
  blocks.push(
    dParagraph(
      `The proposal needs Rs. ${lakh(PROJECT.loan)} lakh of term finance against a project cost of Rs. ${lakh(PROJECT.totalCost)} lakh. Year 1 rental income of Rs. ${lakh(rental[0])} lakh supports debt service of ${dscr[0].toFixed(2)}x and the loan is repaid within ${ASSUMPTIONS.tenureMonths} months. On these assumptions the project is viable and the loan is repayable.`
    )
  );
  blocks.push(
    dParagraph(
      "Disclaimer: sample document for illustration. Figures are illustrative and any real submission must use the applicant's own verified data.",
      { size: 18, color: "718096", after: 120 }
    )
  );

  const documentXml =
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
    `<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">` +
    `<w:body>${blocks.join("")}` +
    `<w:sectPr><w:pgSz w:w="11906" w:h="16838"/>` +
    `<w:pgMar w:top="1134" w:right="1134" w:bottom="1134" w:left="1134" w:header="708" w:footer="708" w:gutter="0"/>` +
    `</w:sectPr></w:body></w:document>`;

  const contentTypes =
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
    `<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">` +
    `<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>` +
    `<Default Extension="xml" ContentType="application/xml"/>` +
    `<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>` +
    `</Types>`;

  const rels =
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
    `<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">` +
    `<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>` +
    `</Relationships>`;

  return zip([
    { name: "[Content_Types].xml", data: Buffer.from(contentTypes, "utf8") },
    { name: "_rels/.rels", data: Buffer.from(rels, "utf8") },
    { name: "word/document.xml", data: Buffer.from(documentXml, "utf8") },
  ]);
};

/* ------------------------------------------------------------------- XLSX -- */

const columnLetter = (index) => {
  let letter = "";
  let value = index;
  while (value >= 0) {
    letter = String.fromCharCode((value % 26) + 65) + letter;
    value = Math.floor(value / 26) - 1;
  }
  return letter;
};

const sheetXml = (rows) => {
  const rowXml = rows
    .map((cells, rowIndex) => {
      const cellsXml = cells
        .map((cell, columnIndex) => {
          if (cell === null || cell === undefined || cell === "") return "";
          const ref = `${columnLetter(columnIndex)}${rowIndex + 1}`;
          if (typeof cell === "number") {
            return `<c r="${ref}"><v>${cell}</v></c>`;
          }
          return `<c r="${ref}" t="inlineStr"><is><t xml:space="preserve">${xmlEscape(cell)}</t></is></c>`;
        })
        .join("");
      return `<row r="${rowIndex + 1}">${cellsXml}</row>`;
    })
    .join("");

  return (
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
    `<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">` +
    `<sheetData>${rowXml}</sheetData></worksheet>`
  );
};

const buildSampleXlsx = () => {
  const summary = [
    ["Earthmoving Equipment Rental - sample DPR financial model"],
    ["All figures in Rs. lakh unless stated"],
    [],
    ["Project", PROJECT.title],
    ["Promoter", PROJECT.promoter],
    ["Location", PROJECT.location],
    [],
    ["Cost of the project", "Rs. lakh"],
    ["Machinery", PROJECT.machinery],
    ["Refurbishment, transport and registration", PROJECT.refurbishment],
    ["Working capital margin", PROJECT.workingCapital],
    ["Total cost of project", PROJECT.totalCost],
    [],
    ["Means of finance", "Rs. lakh", "% of cost"],
    ["Term loan from bank", PROJECT.loan, Math.round((PROJECT.loan / PROJECT.totalCost) * 100)],
    ["Promoter contribution", PROJECT.promoterContribution, Math.round((PROJECT.promoterContribution / PROJECT.totalCost) * 100)],
    ["Total", PROJECT.totalCost, 100],
    [],
    ["Loan terms", "Value"],
    ["Loan amount (Rs.)", ASSUMPTIONS.loanAmount],
    ["Interest rate (% p.a.)", ASSUMPTIONS.interestRate],
    ["Tenure (months)", ASSUMPTIONS.tenureMonths],
    ["EMI (Rs.)", EMI],
    ["Total interest over tenure (Rs. lakh)", Number(YEARS.reduce((sum, y) => sum + y.interestPaid, 0).toFixed(2))],
    [],
    ["Marchinery detail", "Quantity", "Unit cost (Rs. lakh)", "Total (Rs. lakh)"],
    ...PROJECT.machines.map((machine) => [machine.name, machine.qty, machine.unit, machine.total]),
  ];

  const projections = [
    ["Five year profitability projection (Rs. lakh)", "Year 1", "Year 2", "Year 3", "Year 4", "Year 5"],
    ["Rental income", ...rental.map((value) => Number(value.toFixed(2)))],
    ["Operating expenses", ...operatingExpenses.map((value) => Number(value.toFixed(2)))],
    ["EBITDA", ...ebitda.map((value) => Number(value.toFixed(2)))],
    ["Depreciation", ...depreciation.map((value) => Number(value.toFixed(2)))],
    ["Interest on term loan", ...interest.map((value) => Number(value.toFixed(2)))],
    ["Profit before tax", ...pbt.map((value) => Number(value.toFixed(2)))],
    ["Tax and reserve", ...taxReserve.map((value) => Number(value.toFixed(2)))],
    ["Net profit after reserve", ...pat.map((value) => Number(value.toFixed(2)))],
    ["Principal repaid", ...principal.map((value) => Number(value.toFixed(2)))],
    ["DSCR (times)", ...dscr.map((value) => Number(value.toFixed(2)))],
    [],
    ["Cash flow (Rs. lakh)", "Year 1", "Year 2", "Year 3", "Year 4", "Year 5"],
    ["Opening cash", ...YEARS.map((y) => Number(y.openingCash.toFixed(2)))],
    ["Operating cash after interest", ...YEARS.map((y) => Number(y.operatingCashAfterInterest.toFixed(2)))],
    ["Principal repaid", ...YEARS.map((y) => Number(y.principalRepaid.toFixed(2)))],
    ["Owner drawings", ...YEARS.map((y) => Number(y.ownerDrawings.toFixed(2)))],
    ["Closing cash", ...YEARS.map((y) => Number(y.closingCash.toFixed(2)))],
    [],
    ["Balance sheet (Rs. lakh)", "Year 1", "Year 2", "Year 3", "Year 4", "Year 5"],
    ["Machinery at WDV", ...YEARS.map((y) => Number(y.closingWdv.toFixed(2)))],
    ["Receivables", ...YEARS.map((y) => Number(y.receivables.toFixed(2)))],
    ["Cash and bank", ...YEARS.map((y) => Number(y.closingCash.toFixed(2)))],
    ["Total assets", ...YEARS.map((y) => Number(y.totalAssets.toFixed(2)))],
    ["Proprietor capital", ...YEARS.map((y) => Number(y.proprietorCapital.toFixed(2)))],
    ["Term loan outstanding", ...YEARS.map((y) => Number(y.termLoanOutstanding.toFixed(2)))],
    ["Total capital and liabilities", ...YEARS.map((y) => Number(y.totalCapitalLiabilities.toFixed(2)))],
  ];

  const schedule = [
    ["Year", "Opening loan balance (Rs.)", "Principal repaid (Rs.)", "Interest paid (Rs.)", "Closing loan balance (Rs.)"],
    ...buildLoanSchedule(ASSUMPTIONS.loanAmount, ASSUMPTIONS.interestRate, ASSUMPTIONS.tenureMonths).map((year) => [
      year.year,
      year.openingBalance,
      year.principalRepaid,
      year.interestPaid,
      year.closingBalance,
    ]),
    [],
    ["Break even (year 1)", "Value"],
    ["Fixed costs (Rs. lakh)", Number(fixedCostY1.toFixed(2))],
    ["Variable costs (Rs. lakh)", Number(variableCostY1.toFixed(2))],
    ["Contribution margin (%)", Math.round(contributionRatio * 100)],
    ["Break even rental income (Rs. lakh)", Number(breakEvenRevenue.toFixed(2))],
  ];

  const sheets = [
    { name: "Summary", rows: summary },
    { name: "Projections", rows: projections },
    { name: "Loan Schedule", rows: schedule },
  ];

  const workbook =
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
    `<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" ` +
    `xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets>` +
    sheets
      .map((sheet, index) => `<sheet name="${xmlEscape(sheet.name)}" sheetId="${index + 1}" r:id="rId${index + 1}"/>`)
      .join("") +
    `</sheets></workbook>`;

  const workbookRels =
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
    `<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">` +
    sheets
      .map(
        (_, index) =>
          `<Relationship Id="rId${index + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${index + 1}.xml"/>`
      )
      .join("") +
    `</Relationships>`;

  const contentTypes =
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
    `<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">` +
    `<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>` +
    `<Default Extension="xml" ContentType="application/xml"/>` +
    `<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>` +
    sheets
      .map(
        (_, index) =>
          `<Override PartName="/xl/worksheets/sheet${index + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`
      )
      .join("") +
    `</Types>`;

  const rels =
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
    `<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">` +
    `<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>` +
    `</Relationships>`;

  const entries = [
    { name: "[Content_Types].xml", data: Buffer.from(contentTypes, "utf8") },
    { name: "_rels/.rels", data: Buffer.from(rels, "utf8") },
    { name: "xl/workbook.xml", data: Buffer.from(workbook, "utf8") },
    { name: "xl/_rels/workbook.xml.rels", data: Buffer.from(workbookRels, "utf8") },
    ...sheets.map((sheet, index) => ({
      name: `xl/worksheets/sheet${index + 1}.xml`,
      data: Buffer.from(sheetXml(sheet.rows), "utf8"),
    })),
  ];

  return zip(entries);
};

/* -------------------------------------------------------------------- zip -- */

const CRC_TABLE = (() => {
  const table = new Int32Array(256);
  for (let i = 0; i < 256; i++) {
    let value = i;
    for (let bit = 0; bit < 8; bit++) {
      value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
    }
    table[i] = value;
  }
  return table;
})();

const crc32 = (buffer) => {
  let crc = -1;
  for (let i = 0; i < buffer.length; i++) {
    crc = (crc >>> 8) ^ CRC_TABLE[(crc ^ buffer[i]) & 0xff];
  }
  return (crc ^ -1) >>> 0;
};

function zip(entries) {
  const locals = [];
  const central = [];
  let offset = 0;
  const dosTime = 0;
  const dosDate = (2026 - 1980) * 512 + 11 * 32 + 7;

  entries.forEach((entry) => {
    const name = Buffer.from(entry.name, "utf8");
    const data = entry.data;
    const compressed = deflateRawSync(data);
    const checksum = crc32(data);

    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4);
    local.writeUInt16LE(0, 6);
    local.writeUInt16LE(8, 8);
    local.writeUInt16LE(dosTime, 10);
    local.writeUInt16LE(dosDate, 12);
    local.writeUInt32LE(checksum, 14);
    local.writeUInt32LE(compressed.length, 18);
    local.writeUInt32LE(data.length, 22);
    local.writeUInt16LE(name.length, 26);
    local.writeUInt16LE(0, 28);

    locals.push(local, name, compressed);

    const record = Buffer.alloc(46);
    record.writeUInt32LE(0x02014b50, 0);
    record.writeUInt16LE(20, 4);
    record.writeUInt16LE(20, 6);
    record.writeUInt16LE(0, 8);
    record.writeUInt16LE(8, 10);
    record.writeUInt16LE(dosTime, 12);
    record.writeUInt16LE(dosDate, 14);
    record.writeUInt32LE(checksum, 16);
    record.writeUInt32LE(compressed.length, 20);
    record.writeUInt32LE(data.length, 24);
    record.writeUInt16LE(name.length, 28);
    record.writeUInt16LE(0, 30);
    record.writeUInt16LE(0, 32);
    record.writeUInt16LE(0, 34);
    record.writeUInt16LE(0, 36);
    record.writeUInt32LE(0, 38);
    record.writeUInt32LE(offset, 42);

    central.push(record, name);
    offset += local.length + name.length + compressed.length;
  });

  const centralBuffer = Buffer.concat(central);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(0, 4);
  end.writeUInt16LE(0, 6);
  end.writeUInt16LE(entries.length, 8);
  end.writeUInt16LE(entries.length, 10);
  end.writeUInt32LE(centralBuffer.length, 12);
  end.writeUInt32LE(offset, 16);
  end.writeUInt16LE(0, 20);

  return Buffer.concat([...locals, centralBuffer, end]);
}

/* ------------------------------------------------------------------- main -- */

const here = dirname(fileURLToPath(import.meta.url));
const outputDir = join(here, "..", "public", "samples");
mkdirSync(outputDir, { recursive: true });

const files = [
  { name: "sample-dpr-earthmoving.pdf", data: buildSamplePdf() },
  { name: "sample-dpr-earthmoving.docx", data: buildSampleDocx() },
  { name: "sample-dpr-earthmoving.xlsx", data: buildSampleXlsx() },
];

for (const file of files) {
  writeFileSync(join(outputDir, file.name), file.data);
  console.log(`${file.name}  ${(file.data.length / 1024).toFixed(1)} KB`);
}
