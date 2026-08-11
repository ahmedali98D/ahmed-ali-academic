#!/usr/bin/env node
/**
 * Executive resume generator v3 — single-column with compact header.
 * Eliminates table pagination issues by using a header table that doesn't
 * split, with all main content flowing as normal paragraphs.
 */

const {
  Document, Packer, Paragraph, TextRun, AlignmentType,
  BorderStyle, ExternalHyperlink,
  Table, TableRow, TableCell, WidthType, ShadingType, convertInchesToTwip,
  VerticalAlign, TabStopType, TabStopPosition,
} = require("docx");
const fs = require("fs");

const COLOR = {
  navy: "1A2332", teal: "2C6E6F", gold: "8B7355",
  ink: "2D2D2D", graphite: "555555", mist: "888888",
  silver: "AAAAAA", cloud: "F7F5F2", parchment: "F5F2EE",
  white: "FFFFFF", line: "D4CFC8",
};

const FONT = "Georgia";
const SANS = "Helvetica";

function txt(text, opts = {}) {
  return new TextRun({
    text, font: opts.font || FONT, size: opts.size || 20,
    color: opts.color || COLOR.ink, bold: opts.bold || false,
    italics: opts.italics || false, characterSpacing: opts.spacing || 0,
  });
}

function link(url, text, color = COLOR.teal) {
  return new ExternalHyperlink({
    link: url,
    children: [new TextRun({ text, font: SANS, size: 15, color, underline: { type: "single", color } })],
  });
}

function mainHeading(text) {
  return [
    new Paragraph({
      spacing: { before: 200, after: 40 },
      children: [txt(text.toUpperCase(), { font: SANS, size: 16, color: COLOR.navy, bold: true, spacing: 80 })],
    }),
    new Paragraph({
      spacing: { after: 60 },
      border: { bottom: { color: COLOR.navy, space: 1, style: BorderStyle.SINGLE, size: 6 } },
      children: [new TextRun({ text: "" })],
    }),
  ];
}

function experienceEntry(title, org, period, bullets) {
  const children = [
    new Paragraph({
      spacing: { before: 140, after: 10 },
      children: [txt(title, { font: FONT, size: 21, color: COLOR.navy, bold: true })],
    }),
    new Paragraph({
      spacing: { after: 10 },
      children: [
        txt(org, { font: FONT, size: 18, color: COLOR.teal, italics: true }),
        txt("  \u00B7  ", { font: FONT, size: 17, color: COLOR.silver }),
        txt(period, { font: SANS, size: 16, color: COLOR.mist }),
      ],
    }),
  ];
  for (const b of bullets) {
    children.push(new Paragraph({
      spacing: { after: 25, line: 234 },
      indent: { left: 240, hanging: 140 },
      alignment: AlignmentType.JUSTIFIED,
      children: [
        txt("\u2013  ", { font: FONT, size: 18, color: COLOR.teal }),
        txt(b, { font: FONT, size: 18, color: COLOR.ink }),
      ],
    }));
  }
  return children;
}

function bulletEntry(items) {
  return items.map(item => new Paragraph({
    spacing: { after: 25, line: 234 },
    indent: { left: 240, hanging: 140 },
    alignment: AlignmentType.JUSTIFIED,
    children: [
      txt("\u2013  ", { font: FONT, size: 18, color: COLOR.teal }),
      txt(item, { font: FONT, size: 18, color: COLOR.ink }),
    ],
  }));
}

// ─── Header builder (compact, non-splitting table) ──────────────────────────
function headerBlock(nameParts, roles, contactLines, linkLines) {
  const headerChildren = [
    // Name
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 80, after: 20 },
      children: nameParts,
    }),
    // Roles
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 60 },
      children: roles,
    }),
    // Contact
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 20 },
      children: contactLines,
    }),
    // Links
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 80 },
      children: linkLines,
    }),
  ];

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE },
      left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE },
      insideHorizontal: { style: BorderStyle.NONE }, insideVertical: { style: BorderStyle.NONE },
    },
    rows: [
      new TableRow({
        cantSplit: true,
        children: [
          new TableCell({
            width: { size: 100, type: WidthType.PERCENTAGE },
            margins: { top: 280, bottom: 160, left: 500, right: 500 },
            shading: { type: ShadingType.CLEAR, fill: COLOR.parchment },
            children: headerChildren,
          }),
        ],
      }),
    ],
  });
}

// ─── Build contact/link lines ───────────────────────────────────────────────
function buildContactLines(location, phone, emailAddr) {
  return [
    txt(location + "  \u00B7  " + phone + "  \u00B7  ", { font: SANS, size: 15, color: COLOR.mist }),
    link("mailto:" + emailAddr, emailAddr),
  ];
}

function buildLinkLines(links) {
  const parts = [];
  for (let i = 0; i < links.length; i++) {
    if (i > 0) parts.push(txt("   |   ", { font: SANS, size: 14, color: COLOR.silver }));
    parts.push(link(links[i].url, links[i].text));
  }
  return parts;
}

// ═══════════════════════════════════════════════════════════════════════════
// OPERATIONS RESUME
// ═══════════════════════════════════════════════════════════════════════════

function buildOperationsResume() {
  const header = headerBlock(
    [
      txt("AHMED ", { font: FONT, size: 36, color: COLOR.navy, bold: true, spacing: 40 }),
      txt("ALI", { font: FONT, size: 36, color: COLOR.teal, bold: true, spacing: 40 }),
    ],
    [
      txt("Operations Leader  \u00B7  Author  \u00B7  Systems Architect  \u00B7  Educator", { font: SANS, size: 15, color: COLOR.graphite, spacing: 20 }),
    ],
    buildContactLines("Abu Dhabi, UAE", "+971 56 166 9766", "ahmedmahmoudsaeed98@gmail.com"),
    buildLinkLines([
      { url: "https://ahmed-ali-ops.vercel.app/", text: "Portfolio" },
      { url: "https://phronesis-studio.com/", text: "Studio of Phronesis" },
      { url: "https://linkedin.com/in/ahmedmahmoudsaeedahmedali", text: "LinkedIn" },
      { url: "https://www.amazon.com/author/ahmed-ali", text: "Amazon Author" },
      { url: "https://phronesis-studio.com/en/publications/depth-of-knowledge", text: "Book" },
    ])
  );

  const main = [
    // Profile
    ...mainHeading("Profile"),
    new Paragraph({
      spacing: { after: 60, line: 246 },
      alignment: AlignmentType.JUSTIFIED,
      children: [txt(
        "Operations leader, author, and systems architect with eight years across education, operations, and software. Twenty-one percent revenue growth in year one. Four rapid promotions in a single organization. ISO 9001/45001 certified. Author of a published handbook on instructional design. Founder of a studio building production-grade platforms for real clients.",
        { font: FONT, size: 19, color: COLOR.ink }
      )],
    }),

    // Experience
    ...mainHeading("Experience"),

    ...experienceEntry("English Social Studies Teacher", "Al Nahda National School for Boys, Abu Dhabi", "Aug 2026 \u2013 Present",
      ["Teaching English Social Studies, commencing the 2026/2027 academic year."]
    ),

    ...experienceEntry("MSC Studies Teacher & Lead of Non-Arabic Speaking Section", "Ain Al Khaleej Private School, American Division", "Sep 2025 \u2013 Jul 2026",
      [
        "Delivered MSC Studies and Islamic Education B through English-medium instruction, ensuring ADEK and Irtiqa'a compliance.",
        "Promoted from Subject Teacher to Lead of Non-Arabic Speaking Section in Term 2.",
        "Mentored teachers in differentiated instruction, ed-tech integration, safeguarding, inclusive education, and UAE national identity.",
        "Appointed Faculty Head for MUN; coached delegation to win Best School at MANORMUN V 2026.",
        "Active contributor to the Student First initiative; campus-wide mentorship and emotional support for students.",
      ]
    ),

    ...experienceEntry("Branch Operations Manager", "Cheeky Monkeys Playland LLC, UAE", "May 2024 \u2013 Sep 2025",
      [
        "Achieved 21% revenue growth in year one despite declining footfall; earned four rapid promotions within one year.",
        "Directed operations of a 1,700 sqm facility with a 12-person team, maintaining ISO 9001/45001 compliance and an A hygiene rating.",
        "Negotiated vendor partnerships reducing costs; partnered with senior leadership on strategic planning and expansion.",
      ]
    ),

    ...experienceEntry("Sales Executive & Duty Manager", "e& Etisalat UAE, Al Ain Mall Branch", "Jul 2022 \u2013 Jun 2024",
      [
        "Ranked highest-performing executive in 2023; introduced NPS framework to branch operations.",
        "Frequently served as Acting Duty Manager; mentored junior staff. Certifications: Frontline (2022), Sales Excellence (2024).",
      ]
    ),

    ...experienceEntry("International Account Advisor", "Vodafone UK, Remote", "Mar 2019 \u2013 Jul 2022",
      ["Managed high-volume UK customer accounts in a target-driven contact center; provided peer mentoring."]
    ),

    ...experienceEntry("Team Leader", "FEED, Alexandria, Egypt", "Feb 2017 \u2013 Feb 2019",
      ["Led multiple divisions within a community permaculture initiative; developed sustainability education programmes."]
    ),

    ...experienceEntry("Research Assistant & Translator", "Emory University (with Dr. Rahimjon Abdugafurov)", "2017",
      ["Transcribed and analyzed Islamic Civilization manuscripts; produced English-to-Arabic academic translations."]
    ),

    // Publication
    ...mainHeading("Publication"),
    new Paragraph({
      spacing: { before: 120, after: 10 },
      children: [txt("Depth of Knowledge: A Practical Guide to Designing Rigorous Questions Without AI", { font: FONT, size: 20, color: COLOR.navy, bold: true, italics: true })],
    }),
    new Paragraph({
      spacing: { after: 20 },
      children: [txt("Self-published, 2026  |  ISBN 979-8-1913137-5-7  |  149 pp  |  Paperback $19.99, eBook $9.99", { font: SANS, size: 14, color: COLOR.mist })],
    }),
    new Paragraph({
      spacing: { after: 30 },
      children: [
        link("https://www.amazon.com/author/ahmed-ali", "Amazon"),
        txt("   |   ", { font: SANS, size: 14, color: COLOR.silver }),
        link("https://phronesis-studio.com/en/publications/depth-of-knowledge", "Book Details"),
      ],
    }),
    new Paragraph({
      spacing: { after: 40, line: 234 },
      alignment: AlignmentType.JUSTIFIED,
      children: [txt("Restores to educators the craft of writing cognitively demanding questions without AI. Grounded in Webb's DOK framework with a five-step protocol verified by reverse-coding.", { font: FONT, size: 18, color: COLOR.graphite, italics: true })],
    }),

    // Education
    ...mainHeading("Education"),
    new Paragraph({
      spacing: { before: 100, after: 10 },
      children: [
        txt("Postgraduate Diploma in Education", { font: FONT, size: 19, color: COLOR.navy, bold: true }),
        txt("  \u00B7  Al-Azhar University  \u00B7  ", { font: FONT, size: 18, color: COLOR.teal, italics: true }),
        txt("Sep 2024 \u2013 Sep 2025", { font: SANS, size: 16, color: COLOR.mist }),
      ],
    }),
    new Paragraph({
      spacing: { before: 60, after: 10 },
      children: [
        txt("Bachelor of Arts in Philosophy", { font: FONT, size: 19, color: COLOR.navy, bold: true }),
        txt("  \u00B7  Alexandria University  \u00B7  ", { font: FONT, size: 18, color: COLOR.teal, italics: true }),
        txt("Sep 2016 \u2013 May 2021", { font: SANS, size: 16, color: COLOR.mist }),
      ],
    }),

    // Certifications
    ...mainHeading("Certifications"),
    ...bulletEntry([
      "Certified Professional Teaching License (Social Studies, Cycle 3) \u2014 UAE MoE \u2014 until Feb 2029",
      "IELTS Academic Band 7 \u2014 until Aug 2027",
      "ISO 9001 & ISO 45001 Internal Auditor",
      "AI for Educators (Level 1) \u2014 Teachy \u2014 Oct 2025",
      "Network Fundamentals & Security \u2014 Mahara Tech \u2014 Jun 2025",
      "Advanced Person-in-Charge (PIC) \u2014 Dubai Municipality \u2014 May 2025",
      "Fire Warden (Level 2) \u2014 Dubai Civil Defence \u2014 until Aug 2026",
      "Sales Excellence \u2014 e& Etisalat \u2014 Apr 2024  |  Frontline for Retail Sales \u2014 Aug 2022",
      "Manuscript Verification \u2014 Bibliotheca Alexandrina \u2014 Nov 2021  |  Critical Thinking \u2014 LinkedIn \u2014 Jul 2021",
    ]),

    // Studio
    ...mainHeading("Studio of Phronesis"),
    ...bulletEntry([
      "Founded 2024. Bilingual educational content and production-grade software platforms.",
      "Real Estate Emperor: SaaS managing 400+ units. MSCS Academy: 130 lessons, 390+ activities.",
      "DiplomatiQ: MUN operating system with AI evaluation. Echoes of Wisdom: bilingual philosophy podcast, 16 episodes.",
    ]),
  ];

  return new Document({
    creator: "Ahmed Ali",
    title: "Ahmed Ali \u2014 Operations Resume",
    styles: { default: { document: { run: { font: FONT, size: 19 }, paragraph: { spacing: { line: 240 } } } } },
    sections: [{
      properties: { page: { margin: { top: 0, bottom: 360, left: 560, right: 560 } } },
      children: [header, ...main],
    }],
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// TEACHING RESUME
// ═══════════════════════════════════════════════════════════════════════════

function buildTeachingResume() {
  const header = headerBlock(
    [
      txt("AHMED ", { font: FONT, size: 36, color: COLOR.navy, bold: true, spacing: 40 }),
      txt("ALI", { font: FONT, size: 36, color: COLOR.teal, bold: true, spacing: 40 }),
    ],
    [
      txt("Humanities Educator  \u00B7  Philosopher  \u00B7  Author", { font: SANS, size: 15, color: COLOR.graphite, spacing: 20 }),
    ],
    buildContactLines("Abu Dhabi, UAE", "+971 56 166 9766", "ahmed.ali.academic@gmail.com"),
    buildLinkLines([
      { url: "https://mr-ahmed-ali.vercel.app/", text: "Academic Portfolio" },
      { url: "https://phronesis-studio.com/", text: "Studio of Phronesis" },
      { url: "https://linkedin.com/in/ahmedmahmoudsaeedahmedali", text: "LinkedIn" },
      { url: "https://www.amazon.com/author/ahmed-ali", text: "Amazon Author" },
      { url: "https://phronesis-studio.com/en/publications/depth-of-knowledge", text: "Book" },
    ])
  );

  const main = [
    // Profile
    ...mainHeading("Profile"),
    new Paragraph({
      spacing: { after: 60, line: 246 },
      alignment: AlignmentType.JUSTIFIED,
      children: [txt(
        "Licensed UAE educator with ADEK approval in MSC and Islamic Education. Classroom practice spans Grades 1 to 12 in the American Curriculum, with mapping to IB MYP, Cambridge Global Perspectives, IB TOK, and A-Level Philosophy. Author of a published handbook on instructional design. Faculty Head for MUN; coached students to win Best School at MANORMUN V 2026. BA in Philosophy, PGDE in Education.",
        { font: FONT, size: 19, color: COLOR.ink }
      )],
    }),

    // Experience
    ...mainHeading("Experience"),

    ...experienceEntry("English Social Studies Teacher", "Al Nahda National School for Boys, Abu Dhabi", "Aug 2026 \u2013 Present",
      ["Teaching English Social Studies, commencing the 2026/2027 academic year."]
    ),

    ...experienceEntry("MSC Studies Teacher & Lead of Non-Arabic Speaking Section", "Ain Al Khaleej Private School, American Division", "Sep 2025 \u2013 Jul 2026",
      [
        "Delivered MSC Studies and Islamic Education B through English-medium instruction, ensuring ADEK and Irtiqa'a compliance.",
        "Promoted from Subject Teacher to Lead of Non-Arabic Speaking Section in Term 2.",
        "Mentored teachers in differentiated instruction, ed-tech, safeguarding, inclusive education, UAE national identity.",
        "Appointed Faculty Head for MUN; coached delegation to win Best School at MANORMUN V 2026.",
        "Active contributor to Student First initiative; campus-wide mentorship and emotional support.",
      ]
    ),

    ...experienceEntry("Branch Operations Manager", "Cheeky Monkeys Playland LLC, UAE", "May 2024 \u2013 Sep 2025",
      [
        "Led a child-centered learning environment supporting early childhood development and social skills.",
        "Applied ISO 9001/45001 standards; achieved 21% revenue growth and four rapid promotions.",
      ]
    ),

    ...experienceEntry("Research Assistant & Translator", "Emory University (with Dr. Rahimjon Abdugafurov)", "2017",
      ["Transcribed and analyzed Islamic Civilization manuscripts; produced English-to-Arabic academic translations."]
    ),

    // Publication
    ...mainHeading("Publication"),
    new Paragraph({
      spacing: { before: 120, after: 10 },
      children: [txt("Depth of Knowledge: A Practical Guide to Designing Rigorous Questions Without AI", { font: FONT, size: 20, color: COLOR.navy, bold: true, italics: true })],
    }),
    new Paragraph({
      spacing: { after: 20 },
      children: [txt("Self-published, 2026  |  ISBN 979-8-1913137-5-7  |  149 pp  |  Paperback $19.99, eBook $9.99", { font: SANS, size: 14, color: COLOR.mist })],
    }),
    new Paragraph({
      spacing: { after: 30 },
      children: [
        link("https://www.amazon.com/author/ahmed-ali", "Amazon"),
        txt("   |   ", { font: SANS, size: 14, color: COLOR.silver }),
        link("https://phronesis-studio.com/en/publications/depth-of-knowledge", "Book Details"),
      ],
    }),
    new Paragraph({
      spacing: { after: 40, line: 234 },
      alignment: AlignmentType.JUSTIFIED,
      children: [txt("Restores to educators the craft of writing cognitively demanding questions without AI. Grounded in Webb's DOK framework with a five-step protocol verified by reverse-coding. 12 chapters, 11 printable resources, worked examples across seven subjects.", { font: FONT, size: 18, color: COLOR.graphite, italics: true })],
    }),

    // Education
    ...mainHeading("Education"),
    new Paragraph({
      spacing: { before: 100, after: 10 },
      children: [
        txt("Postgraduate Diploma in Education", { font: FONT, size: 19, color: COLOR.navy, bold: true }),
        txt("  \u00B7  Al-Azhar University  \u00B7  ", { font: FONT, size: 18, color: COLOR.teal, italics: true }),
        txt("Sep 2024 \u2013 Sep 2025  (Very Good)", { font: SANS, size: 16, color: COLOR.mist }),
      ],
    }),
    new Paragraph({
      spacing: { before: 60, after: 10 },
      children: [
        txt("Bachelor of Arts in Philosophy", { font: FONT, size: 19, color: COLOR.navy, bold: true }),
        txt("  \u00B7  Alexandria University  \u00B7  ", { font: FONT, size: 18, color: COLOR.teal, italics: true }),
        txt("Sep 2016 \u2013 May 2021  (Good)", { font: SANS, size: 16, color: COLOR.mist }),
      ],
    }),

    // Core Competencies
    ...mainHeading("Core Competencies"),
    ...bulletEntry([
      "Curriculum Design & Quality Assurance (ADEK, Irtiqa'a, American, IB, British, UAE MoE)",
      "Differentiated Instruction & Inclusive Education (ELLs, gifted, students of determination)",
      "Assessment Design & Cognitive Taxonomies (Webb's DOK, Bloom's, SOLO)",
      "Educational Technology (HMH, Alef, Paradigm, MS Teams, Google Classroom, Canva, Teachy)",
      "Model United Nations Programme Leadership",
      "Safeguarding & Child Protection Awareness",
      "Bilingual Communication \u2014 English (C1, IELTS 7) & Native Arabic",
    ]),

    // Certifications
    ...mainHeading("Certifications"),
    ...bulletEntry([
      "Certified Professional Teaching License (Social Studies, Cycle 3) \u2014 UAE MoE \u2014 until Feb 2029",
      "IELTS Academic Band 7 \u2014 until Aug 2027",
      "AI for Educators (Level 1) \u2014 Teachy \u2014 Oct 2025",
      "Network Fundamentals & Security \u2014 Mahara Tech \u2014 Jun 2025",
      "Fire Warden (Level 2) \u2014 Dubai Civil Defence \u2014 until Aug 2026",
      "HMH Differentiate with Small Groups \u2014 Apr 2026  |  Ready to Wrestle \u2014 UWW \u2014 Feb 2026",
      "Manuscript Verification \u2014 Bibliotheca Alexandrina \u2014 Nov 2021  |  Critical Thinking \u2014 LinkedIn \u2014 Jul 2021",
    ]),

    // Initiatives
    ...mainHeading("Educational Initiatives"),
    ...bulletEntry([
      "Echoes of Wisdom: bilingual philosophy podcast, 16 episodes, 2 seasons. Bridges academic philosophy and public discourse.",
      "Studio of Phronesis (founded 2024): MSCS Academy (130 lessons), DiplomatiQ (MUN with AI evaluation), bilingual math guides.",
    ]),
  ];

  return new Document({
    creator: "Ahmed Ali",
    title: "Ahmed Ali \u2014 Teaching Resume",
    styles: { default: { document: { run: { font: FONT, size: 19 }, paragraph: { spacing: { line: 240 } } } } },
    sections: [{
      properties: { page: { margin: { top: 0, bottom: 360, left: 560, right: 560 } } },
      children: [header, ...main],
    }],
  });
}

// ─── Generate ───────────────────────────────────────────────────────────────
async function main() {
  const outDir = "/home/z/my-project/download";
  console.log("Generating Operations Resume...");
  const opsBuffer = await Packer.toBuffer(buildOperationsResume());
  fs.writeFileSync(`${outDir}/Ahmed_Ali_Operations_Resume.docx`, opsBuffer);
  console.log(`  Saved (${(opsBuffer.length / 1024).toFixed(1)} KB)`);
  console.log("Generating Teaching Resume...");
  const teachBuffer = await Packer.toBuffer(buildTeachingResume());
  fs.writeFileSync(`${outDir}/Ahmed_Ali_Teaching_Resume.docx`, teachBuffer);
  console.log(`  Saved (${(teachBuffer.length / 1024).toFixed(1)} KB)`);
  console.log("\nDone.");
}
main().catch(console.error);
