/**
 * Generate quotation for Qasr Al Jawad Real Estate — Real Estate Emperor
 * Uses the EXACT same primitives from src/lib/docx/primitives.ts
 * (the same system used by the admin portal templates).
 *
 * Run: node scripts/generate_quotation_v2.js
 */
const path = require("path");
const fs = require("fs");

// ─── Load the primitives and templates from the actual project ──────────────
const primitivesPath = path.join(__dirname, "..", "audit", "phronesis-studio", "src", "lib", "docx", "primitives.ts");
const templatesPath = path.join(__dirname, "..", "audit", "phronesis-studio", "src", "lib", "docx", "templates.ts");

// Since we can't import TS directly, we'll use tsx/ts-node or compile.
// Simpler approach: use the docx library directly with the same design system.

const {
  Document, Packer, Paragraph, TextRun, ImageRun, HeadingLevel,
  AlignmentType, Table, TableRow, TableCell, WidthType, BorderStyle,
  ShadingType, Header, Footer, PageNumber,
} = require("docx");

// ─── Brand constants (from primitives.ts) ──────────────────────────────────
const COLORS = {
  TEAL: "0F5C5E", TEAL_LIGHT: "E8F2F2", TEAL_DEEP: "094547",
  GOLD: "B48D3C", GOLD_LIGHT: "F7EFD9", GOLD_DEEP: "8A6A2C",
  INK: "1A1A1A", INK_SOFT: "4A4A4A", INK_DIM: "8A8A8A",
  PAPER: "F5EFE4", PAPER_WARM: "EFE6D3", BORDER: "D8CFC0", BORDER_LIGHT: "EAE3D5",
  WHITE: "FFFFFF",
};
const FONT_DISPLAY = "Cambria";
const FONT_BODY = "Calibri";
const FONT_MONO = "Consolas";
const BRAND = {
  STUDIO: "STUDIO OF PHRONESIS",
  TAGLINE: "Educator · Systems Architect · Leadership",
  DOMAIN: "phronesis-studio.com",
  LOCATION: "Al Ain · United Arab Emirates",
  SIGNATURE: "Studio of Practical Wisdom",
  EMAIL: "ahmed@phronesis-studio.com",
};

// ─── Helpers (from primitives.ts) ───────────────────────────────────────────
function noBorder() {
  return { top:{style:BorderStyle.NONE,size:0,color:"FFFFFF"},bottom:{style:BorderStyle.NONE,size:0,color:"FFFFFF"},left:{style:BorderStyle.NONE,size:0,color:"FFFFFF"},right:{style:BorderStyle.NONE,size:0,color:"FFFFFF"},insideHorizontal:{style:BorderStyle.NONE,size:0,color:"FFFFFF"},insideVertical:{style:BorderStyle.NONE,size:0,color:"FFFFFF"} };
}
function bottomOnlyBorder(color=COLORS.BORDER,size=4) {
  return { top:{style:BorderStyle.NONE,size:0,color:"FFFFFF"},bottom:{style:BorderStyle.SINGLE,size,color},left:{style:BorderStyle.NONE,size:0,color:"FFFFFF"},right:{style:BorderStyle.NONE,size:0,color:"FFFFFF"} };
}

// ─── Eagle logo ─────────────────────────────────────────────────────────────
const logoPath = path.join(__dirname, "logo-eagle.png");
const logoData = fs.readFileSync(logoPath);
function eagleImage(h) {
  return new ImageRun({ data: logoData, transformation: { width: h, height: h }, type: "png" });
}

// ─── brandHeader() — exact copy from primitives.ts ──────────────────────────
function brandHeader() {
  return [
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: noBorder(),
      rows: [new TableRow({
        children: [
          new TableCell({ width:{size:14,type:WidthType.PERCENTAGE}, verticalAlign:"center", margins:{top:0,bottom:0,left:0,right:0}, children:[new Paragraph({alignment:AlignmentType.LEFT,children:[eagleImage(72)]})] }),
          new TableCell({ width:{size:86,type:WidthType.PERCENTAGE}, verticalAlign:"center", margins:{top:0,bottom:0,left:200,right:0}, children:[
            new Paragraph({ spacing:{after:30}, children:[new TextRun({text:BRAND.STUDIO,font:FONT_DISPLAY,size:22,characterSpacing:100,color:COLORS.INK,bold:true})] }),
            new Paragraph({ children:[new TextRun({text:BRAND.TAGLINE,font:FONT_BODY,size:16,color:COLORS.INK_DIM,italics:true})] }),
          ]}),
        ],
      })],
    }),
    new Paragraph({ spacing:{before:80,after:320}, border:bottomOnlyBorder(COLORS.GOLD,12), children:[new TextRun({text:""})] }),
  ];
}

// ─── brandFooter() — exact copy from primitives.ts ──────────────────────────
function brandFooter() {
  return [
    new Paragraph({ spacing:{before:480,after:120}, alignment:AlignmentType.CENTER, border:{top:{style:BorderStyle.SINGLE,size:8,color:COLORS.GOLD},bottom:{style:BorderStyle.NONE,size:0,color:"FFFFFF"},left:{style:BorderStyle.NONE,size:0,color:"FFFFFF"},right:{style:BorderStyle.NONE,size:0,color:"FFFFFF"}}, children:[eagleImage(48)] }),
    new Paragraph({ alignment:AlignmentType.CENTER, spacing:{before:0,after:40}, children:[new TextRun({text:BRAND.STUDIO,font:FONT_DISPLAY,size:18,characterSpacing:80,color:COLORS.INK,bold:true})] }),
    new Paragraph({ alignment:AlignmentType.CENTER, spacing:{before:0,after:40}, children:[new TextRun({text:BRAND.LOCATION,font:FONT_BODY,size:18,color:COLORS.INK_SOFT})] }),
    new Paragraph({ alignment:AlignmentType.CENTER, spacing:{before:0,after:40}, children:[new TextRun({text:`${BRAND.DOMAIN}   ·   ${BRAND.SIGNATURE}`,font:FONT_BODY,size:18,color:COLORS.GOLD_DEEP,italics:true})] }),
  ];
}

// ─── metadataTable() — exact copy from primitives.ts ────────────────────────
function metadataTable(rows) {
  return new Table({
    width:{size:100,type:WidthType.PERCENTAGE}, borders:noBorder(),
    rows: rows.map((r,i)=>new TableRow({cantSplit:true,children:[
      new TableCell({width:{size:32,type:WidthType.PERCENTAGE},shading:{type:ShadingType.CLEAR,fill:COLORS.PAPER_WARM},margins:{top:140,bottom:140,left:240,right:200},borders:{top:{style:BorderStyle.NONE,size:0,color:"FFFFFF"},bottom:i===rows.length-1?{style:BorderStyle.SINGLE,size:6,color:COLORS.GOLD}:{style:BorderStyle.SINGLE,size:2,color:COLORS.BORDER_LIGHT},left:{style:BorderStyle.NONE,size:0,color:"FFFFFF"},right:{style:BorderStyle.NONE,size:0,color:"FFFFFF"}},children:[new Paragraph({children:[new TextRun({text:r.label.toUpperCase(),font:FONT_MONO,size:15,characterSpacing:50,color:COLORS.TEAL,bold:true})]})]}),
      new TableCell({width:{size:68,type:WidthType.PERCENTAGE},margins:{top:140,bottom:140,left:240,right:200},borders:{top:{style:BorderStyle.NONE,size:0,color:"FFFFFF"},bottom:i===rows.length-1?{style:BorderStyle.SINGLE,size:6,color:COLORS.GOLD}:{style:BorderStyle.SINGLE,size:2,color:COLORS.BORDER_LIGHT},left:{style:BorderStyle.NONE,size:0,color:"FFFFFF"},right:{style:BorderStyle.NONE,size:0,color:"FFFFFF"}},children:[new Paragraph({children:[new TextRun({text:r.value,font:FONT_BODY,size:22,color:COLORS.INK})]})]}),
    ]})),
  });
}

// ─── sectionHeading() — exact copy ──────────────────────────────────────────
function sectionHeading(text,color=COLORS.TEAL) {
  return new Paragraph({heading:HeadingLevel.HEADING_2,spacing:{before:400,after:180},children:[
    new TextRun({text:"•  ",font:FONT_DISPLAY,size:22,color:COLORS.GOLD}),
    new TextRun({text:text.toUpperCase(),font:FONT_DISPLAY,size:22,characterSpacing:60,color,bold:true}),
  ]});
}

// ─── body() — exact copy ────────────────────────────────────────────────────
function body(text,opts={}) {
  return new Paragraph({alignment:opts.align==="center"?AlignmentType.CENTER:opts.align==="right"?AlignmentType.RIGHT:AlignmentType.LEFT,spacing:{before:0,after:180,line:320},children:[
    new TextRun({text,font:FONT_BODY,size:opts.size??22,color:opts.color??COLORS.INK,italics:opts.italic,bold:opts.bold}),
  ]});
}

// ─── bullet() — exact copy ──────────────────────────────────────────────────
function bullet(text,color=COLORS.TEAL) {
  return new Paragraph({alignment:AlignmentType.LEFT,spacing:{before:0,after:100,line:300},indent:{left:480,hanging:280},children:[
    new TextRun({text:"•  ",font:FONT_BODY,size:22,color:COLORS.GOLD,bold:true}),
    new TextRun({text,font:FONT_BODY,size:22,color:COLORS.INK}),
  ]});
}

// ─── valueTable() — exact copy ──────────────────────────────────────────────
function valueTable(rows,opts={}) {
  const fcw=opts.firstColumnWidth??40;
  return new Table({width:{size:100,type:WidthType.PERCENTAGE},borders:noBorder(),rows:rows.map((r,i)=>new TableRow({cantSplit:true,children:[
    new TableCell({width:{size:fcw,type:WidthType.PERCENTAGE},shading:r.valueColor?{type:ShadingType.CLEAR,fill:COLORS.TEAL_LIGHT}:opts.zebra&&i%2===1?{type:ShadingType.CLEAR,fill:COLORS.PAPER}:{type:ShadingType.CLEAR,fill:COLORS.PAPER_WARM},margins:{top:120,bottom:120,left:240,right:200},borders:{top:{style:BorderStyle.NONE,size:0,color:"FFFFFF"},bottom:{style:BorderStyle.SINGLE,size:2,color:COLORS.BORDER_LIGHT},left:{style:BorderStyle.NONE,size:0,color:"FFFFFF"},right:{style:BorderStyle.NONE,size:0,color:"FFFFFF"}},children:[new Paragraph({children:[new TextRun({text:r.label,font:FONT_BODY,size:20,color:COLORS.INK_SOFT,bold:true})]})]}),
    new TableCell({width:{size:100-fcw,type:WidthType.PERCENTAGE},shading:r.valueColor?{type:ShadingType.CLEAR,fill:COLORS.TEAL_LIGHT}:opts.zebra&&i%2===1?{type:ShadingType.CLEAR,fill:COLORS.PAPER}:undefined,margins:{top:120,bottom:120,left:240,right:200},borders:{top:{style:BorderStyle.NONE,size:0,color:"FFFFFF"},bottom:{style:BorderStyle.SINGLE,size:2,color:COLORS.BORDER_LIGHT},left:{style:BorderStyle.NONE,size:0,color:"FFFFFF"},right:{style:BorderStyle.NONE,size:0,color:"FFFFFF"}},children:[new Paragraph({children:[new TextRun({text:r.value,font:FONT_BODY,size:22,color:r.valueColor??COLORS.INK,bold:Boolean(r.valueColor)})]})]}),
  ]}))});
}

// ─── callout() — exact copy ─────────────────────────────────────────────────
function callout(title,paragraphs,variant="gold") {
  const colorMap={gold:{bg:COLORS.GOLD_LIGHT,accent:COLORS.GOLD,titleColor:COLORS.GOLD_DEEP},teal:{bg:COLORS.TEAL_LIGHT,accent:COLORS.TEAL,titleColor:COLORS.TEAL_DEEP},terracotta:{bg:"F8E4DC",accent:"B5462A",titleColor:"B5462A"}};
  const {bg,accent,titleColor}=colorMap[variant];
  return new Table({width:{size:100,type:WidthType.PERCENTAGE},borders:{top:{style:BorderStyle.SINGLE,size:32,color:accent},bottom:{style:BorderStyle.SINGLE,size:4,color:accent},left:{style:BorderStyle.SINGLE,size:4,color:accent},right:{style:BorderStyle.SINGLE,size:4,color:accent},insideHorizontal:{style:BorderStyle.NONE,size:0,color:"FFFFFF"},insideVertical:{style:BorderStyle.NONE,size:0,color:"FFFFFF"}},rows:[new TableRow({children:[new TableCell({shading:{type:ShadingType.CLEAR,fill:bg},margins:{top:280,bottom:280,left:400,right:400},children:[
    new Paragraph({spacing:{after:120},children:[new TextRun({text:title.toUpperCase(),font:FONT_DISPLAY,size:24,characterSpacing:80,color:titleColor,bold:true})]}),
    ...paragraphs.map((p,i)=>new Paragraph({spacing:{before:0,after:i===paragraphs.length-1?0:100,line:320},children:[new TextRun({text:p,font:FONT_BODY,size:22,color:COLORS.INK})]})),
  ]})]})]});
}

// ─── documentTitle / documentSubtitle — exact copies ────────────────────────
function documentTitle(text) {
  return new Paragraph({alignment:AlignmentType.CENTER,heading:HeadingLevel.HEADING_1,spacing:{before:200,after:80},children:[new TextRun({text,font:FONT_DISPLAY,size:40,color:COLORS.INK})]});
}
function documentSubtitle(text) {
  return new Paragraph({alignment:AlignmentType.CENTER,spacing:{before:0,after:360},border:bottomOnlyBorder(COLORS.GOLD,6),children:[new TextRun({text,font:FONT_BODY,size:18,color:COLORS.GOLD_DEEP,italics:true})]});
}
function spacer(after=200){return new Paragraph({spacing:{before:0,after},children:[new TextRun({text:""})]});}

// ─── Build the document ─────────────────────────────────────────────────────
const bodyElements = [
  metadataTable([
    { label: "Prepared for", value: "Qasr Al Jawad Real Estate — L.L.C" },
    { label: "Trade Licence", value: "CN-6024419" },
    { label: "Project", value: "Real Estate Emperor — Property Management Platform" },
    { label: "Valid until", value: "30 July 2026" },
  ]),
  spacer(240),

  sectionHeading("Project Overview"),
  body("Deployment of the Real Estate Emperor cloud platform for Qasr Al Jawad Real Estate, configured for two (2) users: Owner and Maintenance Manager. The platform provides a single dashboard for rent collection, tenant ledgers, expense tracking, contract management, and automated reporting. Purpose-built for UAE property portfolios, it replaces the fragile stack of Excel sheets, WhatsApp groups, and paper receipts with one auditable system that works from any browser."),

  sectionHeading("Scope of Work"),
  bullet("Cloud deployment, domain configuration, database initialization, and branding customization for Qasr Al Jawad."),
  bullet("Two (2) user accounts: Owner with full access, Maintenance Manager with operational permissions. Role-based access control ensures each user sees only what is relevant to their role."),
  bullet("Rent collection with payment allocation logic (current rent, advance, historical debt), multi-method support (cash, bank transfer, cheque), and per-building collection rate tracking. Every payment recorded with date, amount, method, and the staff member who entered it."),
  bullet("Tenant management: full tenant ledger, payment history, tenant scoring (0 to 100), multi-unit grouping, and deposit reservations. Tenant payment history available in two clicks to resolve disputes instantly."),
  bullet("Expense tracking: record and categorize expenses per building (maintenance, utilities, salaries, supplies). Each expense logged with date, amount, category, and receipt reference. Monthly expense summary per property."),
  bullet("Contract management: tenant lease contracts recorded with start date, end date, rent amount, payment frequency, and renewal reminders. Automatic alerts before contract expiry."),
  bullet("Daily reports: automated daily summary of all payments collected, expenses incurred, and tenant status changes, delivered to the Owner. Monthly reports: consolidated profit and loss per building, collection rate percentages, and tenant balance summaries, generated automatically at month-end."),
  spacer(120),
  body("Out of scope: any features not listed above will be quoted separately.", { italic: true, color: COLORS.INK_SOFT, size: 18 }),

  sectionHeading("Commercial"),
  valueTable([
    { label: "Platform Setup (one-time, discounted)", value: "5,000 AED", valueColor: COLORS.TEAL },
    { label: "Aug to Dec 2026: Setup installment + hosting", value: "1,200 AED / month", valueColor: COLORS.TEAL },
    { label: "Jan 2027 onwards: Hosting & maintenance", value: "200 AED / month", valueColor: COLORS.GOLD },
  ], { firstColumnWidth: 55 }),
  spacer(160),
  body("Setup fee discounted as a courtesy. Payable in five monthly installments (August to December 2026).", { italic: true, color: COLORS.INK_SOFT, size: 18 }),

  sectionHeading("Terms & Conditions"),
  bullet("This quotation is valid until 30 July 2026."),
  bullet("Platform setup will be completed within 14 days of receiving the first payment and all necessary property data."),
  bullet("Monthly payments are due by the 10th of each month."),
  bullet("Training is included for two (2) users: the Owner and the Maintenance Manager."),
  bullet("Monthly hosting includes cloud infrastructure, security updates, daily automated backups, and email support."),
  bullet("The platform is accessible from any web browser (desktop, tablet, mobile). No software installation required."),

  callout("Acceptance", [
    "This quotation is valid until 30 July 2026. To proceed, please sign and return this document, or send written confirmation by email.",
    "Monthly payments due by the 10th of each month. Setup installments: August through December 2026.",
  ], "teal"),
];

const doc = new Document({
  creator: BRAND.STUDIO,
  title: "Software Quotation",
  description: "Generated by the Studio of Phronesis admin portal",
  styles: {
    default: {
      document: { run: { font: FONT_BODY, size: 22, color: COLORS.INK } },
      heading1: { run: { font: FONT_DISPLAY, size: 40, color: COLORS.INK } },
      heading2: { run: { font: FONT_DISPLAY, size: 22, color: COLORS.TEAL, bold: true } },
    },
  },
  sections: [{
    properties: {
      page: { margin: { top: 1200, right: 1200, bottom: 1200, left: 1200 } },
    },
    children: [
      ...brandHeader(),
      documentTitle("Software Quotation"),
      documentSubtitle("Real Estate Emperor — Property Management Platform"),
      ...bodyElements,
      ...brandFooter(),
    ],
  }],
});

const outputPath = "/home/z/my-project/download/Quotation_QasrAlJawad_RealEstateEmperor.docx";
Packer.toBuffer(doc).then((buffer) => {
  fs.writeFileSync(outputPath, buffer);
  console.log(`Document saved: ${outputPath}`);
  console.log(`File size: ${(buffer.length / 1024).toFixed(1)} KB`);
});
