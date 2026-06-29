const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  WidthType, AlignmentType, BorderStyle, ShadingType, HeadingLevel,
  ImageRun, PageBreak, Header, Footer, PageNumber, NumberFormat,
  TabStopType, TabStopPosition, convertInchesToTwip } = require("docx");
const fs = require("fs");
const path = require("path");

// ─── Brand palette ─────────────────────────────────────────────────────────
const COLORS = {
  TEAL: "0F5C5E",
  TEAL_BRIGHT: "1A6E70",
  GOLD: "B48D3C",
  PAPER: "F5EFE4",
  PAPER_WARM: "FAF6EE",
  INK: "1A1A1A",
  INK_SOFT: "4A4A4A",
  INK_DIM: "8A8A8A",
  BORDER: "E5DDD0",
  WHITE: "FFFFFF",
};

// ─── Fonts ──────────────────────────────────────────────────────────────────
const FONT_DISPLAY = "Cambria";
const FONT_BODY = "Calibri";
const FONT_MONO = "Consolas";

// ─── Helper: no borders ─────────────────────────────────────────────────────
const noBorders = {
  top: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
  bottom: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
  left: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
  right: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
};

const thinBorder = (color = COLORS.BORDER) => ({
  top: { style: BorderStyle.SINGLE, size: 1, color },
  bottom: { style: BorderStyle.SINGLE, size: 1, color },
  left: { style: BorderStyle.SINGLE, size: 1, color },
  right: { style: BorderStyle.SINGLE, size: 1, color },
});

const goldTopBorder = {
  top: { style: BorderStyle.SINGLE, size: 3, color: COLORS.GOLD },
  bottom: { style: BorderStyle.SINGLE, size: 1, color: COLORS.BORDER },
  left: { style: BorderStyle.SINGLE, size: 1, color: COLORS.BORDER },
  right: { style: BorderStyle.SINGLE, size: 1, color: COLORS.BORDER },
};

// ─── Helper: cell with shading ──────────────────────────────────────────────
function shadedCell(children, color, width, borders) {
  return new TableCell({
    children,
    width: { size: width, type: WidthType.PERCENTAGE },
    shading: { type: ShadingType.CLEAR, fill: color, color: "auto" },
    borders: borders || thinBorder(),
    margins: { top: 80, bottom: 80, left: 120, right: 120 },
  });
}

// ─── Logo ───────────────────────────────────────────────────────────────────
const logoPath = path.join(__dirname, "logo-eagle.png");
const logoData = fs.readFileSync(logoPath);

// ─── Document ───────────────────────────────────────────────────────────────
const doc = new Document({
  sections: [
    // ── Section 1: Header with logo + quotation ───────────────────────────
    {
      properties: {
        page: {
          margin: { top: 720, right: 720, bottom: 720, left: 720 },
        },
      },
      headers: {
        default: new Header({
          children: [
            new Paragraph({
              alignment: AlignmentType.RIGHT,
              children: [
                new TextRun({ text: "Studio of Phronesis", font: FONT_DISPLAY, size: 18, color: COLORS.TEAL, italics: true }),
                new TextRun({ text: "  ·  ", font: FONT_BODY, size: 18, color: COLORS.INK_DIM }),
                new TextRun({ text: "Quotation", font: FONT_MONO, size: 16, color: COLORS.INK_DIM }),
              ],
            }),
          ],
        }),
      },
      footers: {
        default: new Footer({
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({ text: "Studio of Phronesis · Ahmed Ali · Al Ain, UAE · ahmed@phronesis-studio.com · +971 56 166 9766", font: FONT_BODY, size: 14, color: COLORS.INK_DIM }),
              ],
            }),
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({ text: "Page ", font: FONT_MONO, size: 14, color: COLORS.INK_DIM }),
                new TextRun({ children: [PageNumber.CURRENT], font: FONT_MONO, size: 14, color: COLORS.INK_DIM }),
                new TextRun({ text: " of ", font: FONT_MONO, size: 14, color: COLORS.INK_DIM }),
                new TextRun({ children: [PageNumber.TOTAL_PAGES], font: FONT_MONO, size: 14, color: COLORS.INK_DIM }),
              ],
            }),
          ],
        }),
      },
      children: [
        // ── Logo + Studio name ────────────────────────────────────────────
        new Paragraph({
          alignment: AlignmentType.LEFT,
          spacing: { after: 200 },
          children: [
            new ImageRun({
              data: logoData,
              transformation: { width: 60, height: 60 },
              type: "png",
            }),
          ],
        }),
        new Paragraph({
          spacing: { after: 60 },
          children: [
            new TextRun({ text: "STUDIO OF PHRONESIS", font: FONT_DISPLAY, size: 28, bold: true, color: COLORS.TEAL, characterSpacing: 40 }),
          ],
        }),
        new Paragraph({
          spacing: { after: 200 },
          children: [
            new TextRun({ text: "Philosopher · Educator · Systems Architect", font: FONT_DISPLAY, size: 18, italics: true, color: COLORS.INK_DIM }),
          ],
        }),
        // Gold rule
        new Paragraph({
          spacing: { after: 300 },
          border: {
            bottom: { style: BorderStyle.SINGLE, size: 6, color: COLORS.GOLD },
          },
          children: [],
        }),

        // ── Quotation title ───────────────────────────────────────────────
        new Paragraph({
          spacing: { after: 100 },
          children: [
            new TextRun({ text: "QUOTATION", font: FONT_DISPLAY, size: 36, bold: true, color: COLORS.INK }),
          ],
        }),
        new Paragraph({
          spacing: { after: 300 },
          children: [
            new TextRun({ text: "Real Estate Emperor — Property Management Platform", font: FONT_DISPLAY, size: 22, italics: true, color: COLORS.TEAL }),
          ],
        }),

        // ── Client + Quotation info table ────────────────────────────────
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          borders: {
            top: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
            bottom: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
            left: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
            right: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
            insideHorizontal: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
            insideVertical: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
          },
          rows: [
            new TableRow({
              children: [
                // Left: Client info
                new TableCell({
                  width: { size: 50, type: WidthType.PERCENTAGE },
                  borders: noBorders,
                  margins: { top: 40, bottom: 40, left: 0, right: 120 },
                  children: [
                    new Paragraph({ children: [new TextRun({ text: "PREPARED FOR", font: FONT_MONO, size: 14, color: COLORS.TEAL, bold: true, characterSpacing: 30 })] }),
                    new Paragraph({ spacing: { after: 40 }, children: [new TextRun({ text: "Qasr Al Jawad Real Estate — L.L.C", font: FONT_DISPLAY, size: 20, bold: true, color: COLORS.INK })] }),
                    new Paragraph({ spacing: { after: 20 }, children: [new TextRun({ text: "Trade Licence No. CN-6024419", font: FONT_BODY, size: 16, color: COLORS.INK_SOFT })] }),
                    new Paragraph({ spacing: { after: 20 }, children: [new TextRun({ text: "Registry No. 6641222", font: FONT_BODY, size: 16, color: COLORS.INK_SOFT })] }),
                    new Paragraph({ spacing: { after: 20 }, children: [new TextRun({ text: "Al Ain, Abu Dhabi, UAE", font: FONT_BODY, size: 16, color: COLORS.INK_SOFT })] }),
                    new Paragraph({ children: [new TextRun({ text: "Limited Liability Company", font: FONT_BODY, size: 16, color: COLORS.INK_DIM, italics: true })] }),
                  ],
                }),
                // Right: Quotation meta
                new TableCell({
                  width: { size: 50, type: WidthType.PERCENTAGE },
                  borders: noBorders,
                  margins: { top: 40, bottom: 40, left: 120, right: 0 },
                  children: [
                    new Paragraph({ children: [new TextRun({ text: "QUOTATION DETAILS", font: FONT_MONO, size: 14, color: COLORS.TEAL, bold: true, characterSpacing: 30 })] }),
                    new Paragraph({ spacing: { after: 40 }, children: [new TextRun({ text: "Quote #: REE-QASR-2026-001", font: FONT_DISPLAY, size: 20, bold: true, color: COLORS.INK })] }),
                    new Paragraph({ spacing: { after: 20 }, children: [new TextRun({ text: "Date: 14 July 2026", font: FONT_BODY, size: 16, color: COLORS.INK_SOFT })] }),
                    new Paragraph({ spacing: { after: 20 }, children: [new TextRun({ text: "Valid Until: 14 August 2026", font: FONT_BODY, size: 16, color: COLORS.INK_SOFT })] }),
                    new Paragraph({ spacing: { after: 20 }, children: [new TextRun({ text: "Prepared by: Ahmed Ali", font: FONT_BODY, size: 16, color: COLORS.INK_SOFT })] }),
                    new Paragraph({ children: [new TextRun({ text: "Studio of Phronesis", font: FONT_BODY, size: 16, color: COLORS.INK_DIM, italics: true })] }),
                  ],
                }),
              ],
            }),
          ],
        }),

        // Spacer
        new Paragraph({ spacing: { after: 300 }, children: [] }),

        // ── Section: Scope of Work ────────────────────────────────────────
        new Paragraph({
          spacing: { before: 200, after: 120 },
          border: { bottom: { style: BorderStyle.SINGLE, size: 2, color: COLORS.GOLD } },
          children: [
            new TextRun({ text: "SCOPE OF WORK", font: FONT_DISPLAY, size: 22, bold: true, color: COLORS.TEAL, characterSpacing: 20 }),
          ],
        }),
        new Paragraph({
          spacing: { after: 160 },
          children: [
            new TextRun({ text: "Deployment of the Real Estate Emperor cloud platform for Qasr Al Jawad Real Estate, configured for two (2) users: Owner and Maintenance Manager. The platform provides a single dashboard for rent collection, tenant ledgers, building P&L, and operational management.", font: FONT_BODY, size: 17, color: COLORS.INK_SOFT }),
          ],
        }),

        // ── Deliverables table ────────────────────────────────────────────
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            // Header row
            new TableRow({
              tableHeader: true,
              children: [
                shadedCell([new Paragraph({ children: [new TextRun({ text: "DELIVERABLE", font: FONT_MONO, size: 14, bold: true, color: COLORS.WHITE, characterSpacing: 20 })] })], COLORS.TEAL, 60, {
                  top: { style: BorderStyle.SINGLE, size: 1, color: COLORS.TEAL },
                  bottom: { style: BorderStyle.SINGLE, size: 1, color: COLORS.TEAL },
                  left: { style: BorderStyle.SINGLE, size: 1, color: COLORS.TEAL },
                  right: { style: BorderStyle.SINGLE, size: 1, color: COLORS.TEAL },
                }),
                shadedCell([new Paragraph({ children: [new TextRun({ text: "DESCRIPTION", font: FONT_MONO, size: 14, bold: true, color: COLORS.WHITE, characterSpacing: 20 })] })], COLORS.TEAL, 40, {
                  top: { style: BorderStyle.SINGLE, size: 1, color: COLORS.TEAL },
                  bottom: { style: BorderStyle.SINGLE, size: 1, color: COLORS.TEAL },
                  left: { style: BorderStyle.SINGLE, size: 1, color: COLORS.TEAL },
                  right: { style: BorderStyle.SINGLE, size: 1, color: COLORS.TEAL },
                }),
              ],
            }),
            // Rows
            ...[
              ["Platform Setup", "Cloud deployment, domain configuration, database initialization, and branding customization for Qasr Al Jawad."],
              ["User Accounts (2)", "Owner account with full access and Maintenance Manager account with operational permissions."],
              ["Rent Collection", "Payment recording with allocation logic (current rent, advance, historical debt), multi-method support (cash, bank transfer, cheque), and per-building collection rate tracking."],
              ["Tenant Management", "Full tenant ledger, payment history, tenant scoring, multi-unit grouping, and deposit reservations."],
              ["Building P&L", "Monthly profit & loss per property, expense tracking, recurring bills, and building-level performance dashboards."],
              ["Operations & Audit", "Role-based access control, full audit trail of all actions, automated daily backups, and 4-language interface (English, Arabic, Hindi, Urdu)."],
              ["Training & Handover", "On-site training session for both users, documentation, and 30-day post-launch support included."],
            ].map(([title, desc]) =>
              new TableRow({
                cantSplit: true,
                children: [
                  shadedCell([new Paragraph({ children: [new TextRun({ text: title, font: FONT_DISPLAY, size: 16, bold: true, color: COLORS.INK })] })], COLORS.PAPER_WARM, 60),
                  shadedCell([new Paragraph({ children: [new TextRun({ text: desc, font: FONT_BODY, size: 15, color: COLORS.INK_SOFT })] })], COLORS.WHITE, 40),
                ],
              })
            ),
          ],
        }),

        // Spacer
        new Paragraph({ spacing: { after: 300 }, children: [] }),

        // ── Section: Pricing ──────────────────────────────────────────────
        new Paragraph({
          spacing: { before: 200, after: 120 },
          border: { bottom: { style: BorderStyle.SINGLE, size: 2, color: COLORS.GOLD } },
          children: [
            new TextRun({ text: "PRICING & PAYMENT SCHEDULE", font: FONT_DISPLAY, size: 22, bold: true, color: COLORS.TEAL, characterSpacing: 20 }),
          ],
        }),
        new Paragraph({
          spacing: { after: 160 },
          children: [
            new TextRun({ text: "Setup fee discounted as a courtesy to a long-standing friend. Setup fee may be paid in monthly installments over five months (August–December 2026).", font: FONT_BODY, size: 16, color: COLORS.INK_SOFT, italics: true }),
          ],
        }),

        // Pricing table
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            // Header
            new TableRow({
              tableHeader: true,
              children: [
                shadedCell([new Paragraph({ children: [new TextRun({ text: "ITEM", font: FONT_MONO, size: 14, bold: true, color: COLORS.WHITE, characterSpacing: 20 })] })], COLORS.TEAL, 40, goldTopBorder),
                shadedCell([new Paragraph({ children: [new TextRun({ text: "PERIOD", font: FONT_MONO, size: 14, bold: true, color: COLORS.WHITE, characterSpacing: 20 })] })], COLORS.TEAL, 30, goldTopBorder),
                shadedCell([new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "AMOUNT (AED)", font: FONT_MONO, size: 14, bold: true, color: COLORS.WHITE, characterSpacing: 20 })] })], COLORS.TEAL, 30, goldTopBorder),
              ],
            }),
            // Setup fee row
            new TableRow({
              cantSplit: true,
              children: [
                shadedCell([new Paragraph({ children: [new TextRun({ text: "Platform Setup (discounted)", font: FONT_DISPLAY, size: 16, bold: true, color: COLORS.INK })] })], COLORS.PAPER_WARM, 40),
                shadedCell([new Paragraph({ children: [new TextRun({ text: "One-time", font: FONT_BODY, size: 15, color: COLORS.INK_SOFT })] })], COLORS.WHITE, 30),
                shadedCell([new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "5,000", font: FONT_MONO, size: 18, bold: true, color: COLORS.TEAL })] })], COLORS.WHITE, 30),
              ],
            }),
            // Monthly installments row
            new TableRow({
              cantSplit: true,
              children: [
                shadedCell([
                  new Paragraph({ children: [new TextRun({ text: "Setup Installment + Hosting", font: FONT_DISPLAY, size: 16, bold: true, color: COLORS.INK })] }),
                  new Paragraph({ spacing: { before: 40 }, children: [new TextRun({ text: "(1,000 setup + 200 hosting per month)", font: FONT_BODY, size: 13, color: COLORS.INK_DIM, italics: true })] }),
                ], COLORS.PAPER_WARM, 40),
                shadedCell([new Paragraph({ children: [new TextRun({ text: "Aug 2026 – Dec 2026", font: FONT_BODY, size: 15, color: COLORS.INK_SOFT })] })], COLORS.WHITE, 30),
                shadedCell([new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "1,200 / month", font: FONT_MONO, size: 18, bold: true, color: COLORS.TEAL })] })], COLORS.WHITE, 30),
              ],
            }),
            // Ongoing hosting row
            new TableRow({
              cantSplit: true,
              children: [
                shadedCell([
                  new Paragraph({ children: [new TextRun({ text: "Hosting & Maintenance", font: FONT_DISPLAY, size: 16, bold: true, color: COLORS.INK })] }),
                  new Paragraph({ spacing: { before: 40 }, children: [new TextRun({ text: "(cloud hosting, updates, security patches, support)", font: FONT_BODY, size: 13, color: COLORS.INK_DIM, italics: true })] }),
                ], COLORS.PAPER_WARM, 40),
                shadedCell([new Paragraph({ children: [new TextRun({ text: "Jan 2027 onwards", font: FONT_BODY, size: 15, color: COLORS.INK_SOFT })] })], COLORS.WHITE, 30),
                shadedCell([new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "200 / month", font: FONT_MONO, size: 18, bold: true, color: COLORS.TEAL })] })], COLORS.WHITE, 30),
              ],
            }),
          ],
        }),

        // Spacer
        new Paragraph({ spacing: { after: 200 }, children: [] }),

        // Summary box
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          borders: {
            top: { style: BorderStyle.SINGLE, size: 3, color: COLORS.GOLD },
            bottom: { style: BorderStyle.SINGLE, size: 1, color: COLORS.BORDER },
            left: { style: BorderStyle.SINGLE, size: 1, color: COLORS.BORDER },
            right: { style: BorderStyle.SINGLE, size: 1, color: COLORS.BORDER },
            insideHorizontal: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
            insideVertical: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
          },
          rows: [
            new TableRow({
              children: [
                new TableCell({
                  width: { size: 100, type: WidthType.PERCENTAGE },
                  shading: { type: ShadingType.CLEAR, fill: COLORS.PAPER, color: "auto" },
                  borders: {
                    top: { style: BorderStyle.SINGLE, size: 3, color: COLORS.GOLD },
                    bottom: { style: BorderStyle.SINGLE, size: 1, color: COLORS.BORDER },
                    left: { style: BorderStyle.SINGLE, size: 1, color: COLORS.BORDER },
                    right: { style: BorderStyle.SINGLE, size: 1, color: COLORS.BORDER },
                  },
                  margins: { top: 160, bottom: 160, left: 200, right: 200 },
                  children: [
                    new Paragraph({
                      children: [
                        new TextRun({ text: "Total Setup Fee: ", font: FONT_DISPLAY, size: 18, bold: true, color: COLORS.INK }),
                        new TextRun({ text: "5,000 AED", font: FONT_MONO, size: 18, bold: true, color: COLORS.TEAL }),
                        new TextRun({ text: "  (discounted — payable in 5 monthly installments)", font: FONT_BODY, size: 14, color: COLORS.INK_DIM, italics: true }),
                      ],
                    }),
                    new Paragraph({
                      spacing: { before: 60 },
                      children: [
                        new TextRun({ text: "Aug–Dec 2026: ", font: FONT_DISPLAY, size: 18, bold: true, color: COLORS.INK }),
                        new TextRun({ text: "1,200 AED / month", font: FONT_MONO, size: 18, bold: true, color: COLORS.TEAL }),
                        new TextRun({ text: "  (includes setup installment + hosting)", font: FONT_BODY, size: 14, color: COLORS.INK_DIM, italics: true }),
                      ],
                    }),
                    new Paragraph({
                      spacing: { before: 60 },
                      children: [
                        new TextRun({ text: "Jan 2027 onwards: ", font: FONT_DISPLAY, size: 18, bold: true, color: COLORS.INK }),
                        new TextRun({ text: "200 AED / month", font: FONT_MONO, size: 18, bold: true, color: COLORS.TEAL }),
                        new TextRun({ text: "  (hosting & maintenance only)", font: FONT_BODY, size: 14, color: COLORS.INK_DIM, italics: true }),
                      ],
                    }),
                  ],
                }),
              ],
            }),
          ],
        }),

        // Spacer
        new Paragraph({ spacing: { after: 300 }, children: [] }),

        // ── Section: Terms ────────────────────────────────────────────────
        new Paragraph({
          spacing: { before: 200, after: 120 },
          border: { bottom: { style: BorderStyle.SINGLE, size: 2, color: COLORS.GOLD } },
          children: [
            new TextRun({ text: "TERMS & CONDITIONS", font: FONT_DISPLAY, size: 22, bold: true, color: COLORS.TEAL, characterSpacing: 20 }),
          ],
        }),
        ...[
          "This quotation is valid for 30 days from the date of issue.",
          "The platform setup will be completed within 14 days of receiving the first payment and all necessary property data.",
          "Training is included for two (2) users: the Owner and the Maintenance Manager.",
          "Monthly hosting includes cloud infrastructure, security updates, daily automated backups, and email support.",
          "Additional users, custom features, or integrations beyond the stated scope will be quoted separately.",
          "Payment terms: Monthly payments due by the 1st of each month. Setup installments: August through December 2026.",
          "The platform is accessible from any web browser (desktop, tablet, mobile). No software installation required.",
        ].map((term) =>
          new Paragraph({
            spacing: { after: 80 },
            children: [
              new TextRun({ text: "•  ", font: FONT_BODY, size: 16, color: COLORS.GOLD, bold: true }),
              new TextRun({ text: term, font: FONT_BODY, size: 16, color: COLORS.INK_SOFT }),
            ],
          })
        ),

        // Spacer
        new Paragraph({ spacing: { after: 300 }, children: [] }),

        // ── Acceptance ────────────────────────────────────────────────────
        new Paragraph({
          spacing: { before: 200, after: 200 },
          border: { top: { style: BorderStyle.SINGLE, size: 2, color: COLORS.GOLD } },
          children: [
            new TextRun({ text: "ACCEPTANCE", font: FONT_DISPLAY, size: 22, bold: true, color: COLORS.TEAL, characterSpacing: 20 }),
          ],
        }),
        new Paragraph({
          spacing: { after: 300 },
          children: [
            new TextRun({ text: "By signing below, both parties agree to the scope, pricing, and terms outlined in this quotation.", font: FONT_BODY, size: 16, color: COLORS.INK_SOFT }),
          ],
        }),

        // Signature table
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          borders: {
            top: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
            bottom: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
            left: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
            right: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
            insideHorizontal: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
            insideVertical: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
          },
          rows: [
            new TableRow({
              children: [
                // Client signature
                new TableCell({
                  width: { size: 50, type: WidthType.PERCENTAGE },
                  borders: noBorders,
                  margins: { top: 200, bottom: 40, left: 0, right: 200 },
                  children: [
                    new Paragraph({
                      border: { bottom: { style: BorderStyle.SINGLE, size: 1, color: COLORS.INK_DIM } },
                      spacing: { after: 60 },
                      children: [],
                    }),
                    new Paragraph({ children: [new TextRun({ text: "Qasr Al Jawad Real Estate — L.L.C", font: FONT_DISPLAY, size: 16, bold: true, color: COLORS.INK })] }),
                    new Paragraph({ children: [new TextRun({ text: "Authorised Signatory", font: FONT_BODY, size: 14, color: COLORS.INK_DIM, italics: true })] }),
                    new Paragraph({ spacing: { before: 80 }, children: [new TextRun({ text: "Date: __________________", font: FONT_MONO, size: 14, color: COLORS.INK_DIM })] }),
                  ],
                }),
                // Provider signature
                new TableCell({
                  width: { size: 50, type: WidthType.PERCENTAGE },
                  borders: noBorders,
                  margins: { top: 200, bottom: 40, left: 200, right: 0 },
                  children: [
                    new Paragraph({
                      border: { bottom: { style: BorderStyle.SINGLE, size: 1, color: COLORS.INK_DIM } },
                      spacing: { after: 60 },
                      children: [],
                    }),
                    new Paragraph({ children: [new TextRun({ text: "Ahmed Ali", font: FONT_DISPLAY, size: 16, bold: true, color: COLORS.INK })] }),
                    new Paragraph({ children: [new TextRun({ text: "Studio of Phronesis", font: FONT_BODY, size: 14, color: COLORS.INK_DIM, italics: true })] }),
                    new Paragraph({ spacing: { before: 80 }, children: [new TextRun({ text: "Date: __________________", font: FONT_MONO, size: 14, color: COLORS.INK_DIM })] }),
                  ],
                }),
              ],
            }),
          ],
        }),
      ],
    },
  ],
});

// ─── Generate ───────────────────────────────────────────────────────────────
const outputPath = path.join("/home/z/my-project/download", "Quotation_QasrAlJawad_RealEstateEmperor.docx");

Packer.toBuffer(doc).then((buffer) => {
  fs.writeFileSync(outputPath, buffer);
  console.log(`Document saved: ${outputPath}`);
  console.log(`File size: ${(buffer.length / 1024).toFixed(1)} KB`);
});
