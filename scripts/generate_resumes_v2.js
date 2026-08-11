#!/usr/bin/env node
/**
 * Redesigned executive-level resume DOCX generator.
 * 
 * Design philosophy:
 * - Two-column layout (sidebar + main content) — the gold standard for executive CVs
 * - Generous whitespace, editorial discipline
 * - Restrained color palette: deep navy, muted teal accent, warm gray text
 * - Clear typographic hierarchy with consistent spacing rules
 * - Information architecture: identity > experience > education > credentials
 * - No visual clutter, no template-driven boxes, no information density
 * 
 * Both resumes share the same design system but differ in content emphasis:
 * - Operations: emphasizes leadership, results, scale, author identity
 * - Teaching: emphasizes pedagogy, scholarship, curriculum, author identity
 */

const {
  Document, Packer, Paragraph, TextRun, AlignmentType,
  BorderStyle, TabStopType, TabStopPosition, ExternalHyperlink,
  Table, TableRow, TableCell, WidthType, ShadingType, convertInchesToTwip,
  VerticalAlign, HeightRule,
} = require("docx");
const fs = require("fs");

// ─── Design tokens ──────────────────────────────────────────────────────────
const COLOR = {
  navy: "1A2332",
  teal: "2C6E6F",
  gold: "8B7355",
  ink: "2D2D2D",
  graphite: "555555",
  mist: "888888",
  silver: "AAAAAA",
  cloud: "F7F5F2",
  parchment: "FAF8F5",
  white: "FFFFFF",
  line: "D4CFC8",
};

const FONT = "Georgia";
const SANS = "Helvetica";
const MONO = "Courier New";

// ─── Helpers ────────────────────────────────────────────────────────────────

function txt(text, opts = {}) {
  return new TextRun({
    text,
    font: opts.font || FONT,
    size: opts.size || 20,
    color: opts.color || COLOR.ink,
    bold: opts.bold || false,
    italics: opts.italics || false,
    characterSpacing: opts.spacing || 0,
    ...(opts.underline ? { underline: { type: "single", color: opts.color || COLOR.ink } } : {}),
  });
}

function link(url, text, color = COLOR.teal) {
  return new ExternalHyperlink({
    link: url,
    children: [new TextRun({
      text, font: SANS, size: 16, color,
      underline: { type: "single", color },
    })],
  });
}

function para(children, opts = {}) {
  return new Paragraph({
    spacing: { before: opts.before || 0, after: opts.after || 80, line: opts.line || 264 },
    alignment: opts.align || AlignmentType.LEFT,
    indent: opts.indent || undefined,
    border: opts.border || undefined,
    children,
  });
}

function spacer(h = 100) {
  return new Paragraph({ spacing: { before: 0, after: h }, children: [new TextRun({ text: "" })] });
}

function rule(color = COLOR.line, size = 4) {
  return new Paragraph({
    spacing: { before: 60, after: 60 },
    border: { bottom: { color, space: 1, style: BorderStyle.SINGLE, size } },
    children: [new TextRun({ text: "" })],
  });
}

// ─── Sidebar cell builder ──────────────────────────────────────────────────

function sidebarSection(label, lines) {
  const children = [
    new Paragraph({
      spacing: { before: 240, after: 80 },
      children: [txt(label.toUpperCase(), { font: SANS, size: 15, color: COLOR.mist, bold: true, spacing: 60 })],
    }),
    new Paragraph({
      spacing: { after: 60 },
      border: { bottom: { color: COLOR.line, space: 1, style: BorderStyle.SINGLE, size: 3 } },
      children: [new TextRun({ text: "" })],
    }),
  ];
  for (const line of lines) {
    children.push(new Paragraph({
      spacing: { after: 30, line: 240 },
      children: [txt(line, { font: SANS, size: 16, color: COLOR.graphite })],
    }));
  }
  return children;
}

function sidebarLinkSection(label, links) {
  const children = [
    new Paragraph({
      spacing: { before: 240, after: 80 },
      children: [txt(label.toUpperCase(), { font: SANS, size: 15, color: COLOR.mist, bold: true, spacing: 60 })],
    }),
    new Paragraph({
      spacing: { after: 60 },
      border: { bottom: { color: COLOR.line, space: 1, style: BorderStyle.SINGLE, size: 3 } },
      children: [new TextRun({ text: "" })],
    }),
  ];
  for (const l of links) {
    children.push(new Paragraph({
      spacing: { after: 40, line: 240 },
      children: [link(l.url, l.text)],
    }));
  }
  return children;
}

// ─── Main content helpers ──────────────────────────────────────────────────

function mainHeading(text) {
  return [
    new Paragraph({
      spacing: { before: 320, after: 100 },
      children: [txt(text.toUpperCase(), { font: SANS, size: 18, color: COLOR.navy, bold: true, spacing: 80 })],
    }),
    new Paragraph({
      spacing: { after: 120 },
      border: { bottom: { color: COLOR.navy, space: 1, style: BorderStyle.SINGLE, size: 8 } },
      children: [new TextRun({ text: "" })],
    }),
  ];
}

function experienceEntry(title, org, period, bullets) {
  const children = [
    new Paragraph({
      spacing: { before: 200, after: 20 },
      children: [txt(title, { font: FONT, size: 22, color: COLOR.navy, bold: true })],
    }),
    new Paragraph({
      spacing: { after: 20 },
      children: [
        txt(org, { font: FONT, size: 19, color: COLOR.teal, italics: true }),
        txt("  \u00B7  ", { font: FONT, size: 18, color: COLOR.silver }),
        txt(period, { font: SANS, size: 17, color: COLOR.mist }),
      ],
    }),
  ];
  for (const b of bullets) {
    children.push(new Paragraph({
      spacing: { after: 50, line: 252 },
      indent: { left: 280, hanging: 160 },
      children: [
        txt("\u2013  ", { font: FONT, size: 19, color: COLOR.teal }),
        txt(b, { font: FONT, size: 19, color: COLOR.ink }),
      ],
    }));
  }
  return children;
}

function publicationEntry(title, meta, description, links) {
  const children = [
    new Paragraph({
      spacing: { before: 200, after: 20 },
      children: [txt(title, { font: FONT, size: 22, color: COLOR.navy, bold: true, italics: true })],
    }),
    new Paragraph({
      spacing: { after: 40 },
      children: [txt(meta, { font: SANS, size: 16, color: COLOR.mist })],
    }),
    new Paragraph({
      spacing: { after: 60, line: 252 },
      alignment: AlignmentType.JUSTIFIED,
      children: [txt(description, { font: FONT, size: 19, color: COLOR.graphite, italics: true })],
    }),
    new Paragraph({
      spacing: { after: 80 },
      children: links,
    }),
  ];
  return children;
}

function educationEntry(degree, institution, period, detail) {
  const children = [
    new Paragraph({
      spacing: { before: 180, after: 20 },
      children: [txt(degree, { font: FONT, size: 21, color: COLOR.navy, bold: true })],
    }),
    new Paragraph({
      spacing: { after: 20 },
      children: [
        txt(institution, { font: FONT, size: 19, color: COLOR.teal, italics: true }),
        txt("  \u00B7  ", { font: FONT, size: 18, color: COLOR.silver }),
        txt(period, { font: SANS, size: 17, color: COLOR.mist }),
      ],
    }),
  ];
  if (detail) {
    children.push(new Paragraph({
      spacing: { after: 60, line: 252 },
      children: [txt(detail, { font: FONT, size: 18, color: COLOR.graphite })],
    }));
  }
  return children;
}

function bulletEntry(items) {
  return items.map(item => new Paragraph({
    spacing: { after: 50, line: 252 },
    indent: { left: 280, hanging: 160 },
    children: [
      txt("\u2013  ", { font: FONT, size: 19, color: COLOR.teal }),
      txt(item, { font: FONT, size: 19, color: COLOR.ink }),
    ],
  }));
}

// ─── Two-column layout builder ─────────────────────────────────────────────

function twoColumnResume(sidebarChildren, mainChildren) {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.NONE },
      bottom: { style: BorderStyle.NONE },
      left: { style: BorderStyle.NONE },
      right: { style: BorderStyle.NONE },
      insideHorizontal: { style: BorderStyle.NONE },
      insideVertical: { style: BorderStyle.SINGLE, size: 2, color: COLOR.line },
    },
    rows: [
      new TableRow({
        children: [
          // Sidebar
          new TableCell({
            width: { size: 32, type: WidthType.PERCENTAGE },
            margins: { top: 400, bottom: 400, left: 300, right: 300 },
            shading: { type: ShadingType.CLEAR, fill: COLOR.parchment },
            verticalAlign: VerticalAlign.TOP,
            children: sidebarChildren,
          }),
          // Main content
          new TableCell({
            width: { size: 68, type: WidthType.PERCENTAGE },
            margins: { top: 400, bottom: 400, left: 400, right: 300 },
            verticalAlign: VerticalAlign.TOP,
            children: mainChildren,
          }),
        ],
      }),
    ],
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// RESUME 1: OPERATIONS & LEADERSHIP
// ═══════════════════════════════════════════════════════════════════════════

function buildOperationsResume() {
  const sidebar = [
    // Identity
    new Paragraph({
      spacing: { before: 0, after: 30 },
      children: [txt("AHMED", { font: FONT, size: 32, color: COLOR.navy, bold: true, spacing: 40 })],
    }),
    new Paragraph({
      spacing: { after: 60 },
      children: [txt("ALI", { font: FONT, size: 32, color: COLOR.teal, bold: true, spacing: 40 })],
    }),
    new Paragraph({
      spacing: { after: 40 },
      children: [txt("Operations Leader", { font: SANS, size: 16, color: COLOR.graphite, spacing: 30 })],
    }),
    new Paragraph({
      spacing: { after: 40 },
      children: [txt("Author", { font: SANS, size: 16, color: COLOR.graphite, spacing: 30 })],
    }),
    new Paragraph({
      spacing: { after: 40 },
      children: [txt("Systems Architect", { font: SANS, size: 16, color: COLOR.graphite, spacing: 30 })],
    }),
    new Paragraph({
      spacing: { after: 40 },
      children: [txt("Educator", { font: SANS, size: 16, color: COLOR.graphite, spacing: 30 })],
    }),

    // Contact
    ...sidebarSection("Contact", [
      "Abu Dhabi, UAE",
      "+971 56 166 9766",
    ]),
    new Paragraph({
      spacing: { before: 60, after: 30 },
      children: [link("mailto:ahmedmahmoudsaeed98@gmail.com", "ahmedmahmoudsaeed98@gmail.com")],
    }),

    // Links
    ...sidebarLinkSection("Digital Presence", [
      { url: "https://ahmed-ali-ops.vercel.app/", text: "Professional Portfolio" },
      { url: "https://phronesis-studio.com/", text: "Studio of Phronesis" },
      { url: "https://mr-ahmed-ali.vercel.app/", text: "Academic Portfolio" },
      { url: "https://linkedin.com/in/ahmedmahmoudsaeedahmedali", text: "LinkedIn Profile" },
      { url: "https://www.amazon.com/author/ahmed-ali", text: "Amazon Author Page" },
      { url: "https://phronesis-studio.com/en/publications/depth-of-knowledge", text: "Book Details" },
    ]),

    // Education
    ...sidebarSection("Education", [
      "PGDE in Education",
      "Al-Azhar University",
      "2024 \u2013 2025",
      "",
      "BA in Philosophy",
      "Alexandria University",
      "2016 \u2013 2021",
    ]),

    // Languages
    ...sidebarSection("Languages", [
      "Arabic \u2014 Native",
      "English \u2014 C1 (IELTS 7)",
      "Urdu \u2014 Beginner",
      "Spanish \u2014 Beginner",
    ]),

    // Affiliations
    ...sidebarSection("Affiliations", [
      "British Philosophical",
      "Association (BPA)",
      "2025 \u2013 Present",
    ]),

    // IT Skills
    ...sidebarSection("Technical Skills", [
      "CompTIA A+, Network+, Linux+",
      "MS Office, Google Workspace",
      "HMH, Alef, Paradigm",
      "MS Teams, Google Classroom",
      "Canva, Teachy",
    ]),
  ];

  const main = [
    // Summary
    ...mainHeading("Profile"),
    new Paragraph({
      spacing: { after: 120, line: 280 },
      alignment: AlignmentType.JUSTIFIED,
      children: [txt(
        "Operations leader, author, and systems architect with eight years across education, operations, and software. Twenty-one percent revenue growth in year one. Four rapid promotions in a single organization. ISO 9001 and 45001 certified. Author of a published handbook on instructional design. Founder of a studio that builds production-grade platforms serving real clients. One method throughout: see clearly, decide wisely, build what lasts.",
        { font: FONT, size: 20, color: COLOR.ink }
      )],
    }),

    // Experience
    ...mainHeading("Experience"),

    ...experienceEntry(
      "English Social Studies Teacher",
      "Al Nahda National School for Boys, Abu Dhabi",
      "Aug 2026 \u2013 Present",
      ["Teaching English Social Studies at Al Nahda National School for Boys, commencing the 2026/2027 academic year."]
    ),

    ...experienceEntry(
      "MSC Studies Teacher & Lead of Non-Arabic Speaking Section",
      "Ain Al Khaleej Private School, American Division",
      "Sep 2025 \u2013 Jul 2026",
      [
        "Delivered MSC Studies and Islamic Education B through English-medium instruction, ensuring ADEK and Irtiqa'a compliance.",
        "Promoted from Subject Teacher to Lead of Non-Arabic Speaking Section in Term 2.",
        "Mentored department teachers in differentiated instruction, educational technology integration, safeguarding, inclusive education, and UAE national identity.",
        "Appointed Faculty Head for Model United Nations; coached the school delegation to win Best School at MANORMUN V 2026.",
        "Active contributor to the school's Student First initiative; campus-wide source of mentorship and emotional support for students.",
      ]
    ),

    ...experienceEntry(
      "Branch Operations Manager",
      "Cheeky Monkeys Playland LLC, UAE",
      "May 2024 \u2013 Sep 2025",
      [
        "Achieved 21% revenue growth in year one despite declining footfall, through optimized service packages and stronger vendor partnerships.",
        "Earned four rapid promotions, three salary increments, and early completion of probation within one year.",
        "Directed daily operations of a 1,700 sqm facility with a 12-person cross-functional team, maintaining ISO 9001/45001 compliance and an A municipal hygiene rating.",
        "Negotiated vendor partnerships reducing operational costs while maintaining service quality.",
        "Partnered with senior leadership on strategic planning, staffing, and branch expansion initiatives.",
      ]
    ),

    ...experienceEntry(
      "Sales Executive & Duty Manager",
      "e& Etisalat UAE, Al Ain Mall Branch",
      "Jul 2022 \u2013 Jun 2024",
      [
        "Ranked highest-performing executive in 2023; introduced Net Promoter Score framework to branch operations.",
        "Frequently selected as Acting Duty Manager; mentored junior staff in product knowledge and customer service.",
        "Certifications: Frontline for Retail Sales (2022), Mastering Sales Excellence (2024).",
      ]
    ),

    ...experienceEntry(
      "International Account Advisor",
      "Vodafone UK, Remote",
      "Mar 2019 \u2013 Jul 2022",
      [
        "Managed high-volume UK customer accounts in a target-driven contact center environment.",
        "Provided peer mentoring and consistently met daily performance targets and SLAs.",
      ]
    ),

    ...experienceEntry(
      "Team Leader",
      "FEED, Alexandria, Egypt",
      "Feb 2017 \u2013 Feb 2019",
      [
        "Led multiple divisions within a community permaculture initiative, managing and mentoring volunteer teams.",
        "Developed sustainability and environmental education programmes; oversaw public relations.",
      ]
    ),

    ...experienceEntry(
      "Research Assistant & Translator",
      "Emory University (with Dr. Rahimjon Abdugafurov)",
      "2017",
      [
        "Transcribed and analyzed historical manuscripts in Islamic Civilization for Emory University research.",
        "Produced English-to-Arabic academic translations of scholarly material.",
      ]
    ),

    // Publications
    ...mainHeading("Publication"),

    ...publicationEntry(
      "Depth of Knowledge: A Practical Guide to Designing Rigorous Questions Without AI",
      "Self-published, First Edition, 2026  |  ISBN 979-8-1913137-5-7  |  149 pages  |  Paperback $19.99, eBook $9.99",
      "A handbook restoring to educators the craft of writing cognitively demanding questions from lesson content alone. Grounded in Norman Webb's DOK framework with a five-step protocol verified by reverse-coding, and a chapter tracing the principle through the Islamic intellectual tradition from Al-Hasan al-Basri to Ibn Khaldun.",
      [
        link("https://www.amazon.com/author/ahmed-ali", "Amazon"),
        txt("   |   ", { font: SANS, size: 16, color: COLOR.silver }),
        link("https://phronesis-studio.com/en/publications/depth-of-knowledge", "Book Details Page"),
      ]
    ),

    // Certifications
    ...mainHeading("Certifications"),
    ...bulletEntry([
      "Certified Professional Teaching License (Social Studies, Cycle 3) \u2014 UAE MoE \u2014 Valid until Feb 2029",
      "IELTS Academic Band 7 \u2014 Valid until Aug 2027",
      "Certified in AI for Educators (Level 1) \u2014 Teachy \u2014 Oct 2025",
      "Network Fundamentals & Network Security \u2014 Mahara Tech & MCIT \u2014 Jun 2025",
      "Certified Advanced Person-in-Charge (PIC) \u2014 Dubai Municipality \u2014 May 2025",
      "Fire Warden Training (Level 2) \u2014 Dubai Civil Defence \u2014 Valid until Aug 2026",
      "ISO 9001 & ISO 45001 Internal Auditor",
      "Mastering Sales Excellence \u2014 e& Etisalat \u2014 Apr 2024",
      "Front Line for Retail Sales \u2014 e& Etisalat \u2014 Aug 2022",
      "Verification of Manuscripts in Philosophy & Theology \u2014 Bibliotheca Alexandrina \u2014 Nov 2021",
      "Critical Thinking & Decision Making \u2014 LinkedIn Learning \u2014 Jul 2021",
    ]),

    // Studio
    ...mainHeading("Studio of Phronesis"),
    new Paragraph({
      spacing: { after: 80, line: 264 },
      alignment: AlignmentType.JUSTIFIED,
      children: [
        txt("Founded 2024. ", { font: FONT, size: 19, color: COLOR.graphite, italics: true }),
        txt("A personal studio producing bilingual educational content and production-grade software platforms, built on the Aristotelian principle of phronesis: practical wisdom applied to the perception and closure of gaps in systems, classrooms, and operations.",
          { font: FONT, size: 19, color: COLOR.graphite }),
      ],
    }),
    ...bulletEntry([
      "Real Estate Emperor: property management SaaS, 400+ units managed live, 4 roles, 4 languages.",
      "MSCS Academy: 130 lessons, 390+ activities, UAE curriculum-aligned learning platform.",
      "DiplomatiQ: MUN operating system with seven-tier competency framework and AI evaluation.",
      "Al Ain Real Estate: production listings site for a live broker client.",
      "Echoes of Wisdom: bilingual philosophy podcast, 16 episodes across 2 seasons.",
    ]),
  ];

  return new Document({
    creator: "Ahmed Ali",
    title: "Ahmed Ali \u2014 Operations & Leadership Resume",
    description: "Professional resume",
    styles: {
      default: {
        document: {
          run: { font: FONT, size: 20 },
          paragraph: { spacing: { line: 264 } },
        },
      },
    },
    sections: [{
      properties: {
        page: {
          margin: { top: 0, bottom: 0, left: 0, right: 0 },
        },
      },
      children: [
        twoColumnResume(sidebar, main),
      ],
    }],
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// RESUME 2: TEACHING / ACADEMIC
// ═══════════════════════════════════════════════════════════════════════════

function buildTeachingResume() {
  const sidebar = [
    // Identity
    new Paragraph({
      spacing: { before: 0, after: 30 },
      children: [txt("AHMED", { font: FONT, size: 32, color: COLOR.navy, bold: true, spacing: 40 })],
    }),
    new Paragraph({
      spacing: { after: 60 },
      children: [txt("ALI", { font: FONT, size: 32, color: COLOR.teal, bold: true, spacing: 40 })],
    }),
    new Paragraph({
      spacing: { after: 40 },
      children: [txt("Humanities Educator", { font: SANS, size: 16, color: COLOR.graphite, spacing: 30 })],
    }),
    new Paragraph({
      spacing: { after: 40 },
      children: [txt("Philosopher", { font: SANS, size: 16, color: COLOR.graphite, spacing: 30 })],
    }),
    new Paragraph({
      spacing: { after: 40 },
      children: [txt("Author", { font: SANS, size: 16, color: COLOR.graphite, spacing: 30 })],
    }),

    // Contact
    ...sidebarSection("Contact", [
      "Abu Dhabi, UAE",
      "+971 56 166 9766",
    ]),
    new Paragraph({
      spacing: { before: 60, after: 30 },
      children: [link("mailto:ahmed.ali.academic@gmail.com", "ahmed.ali.academic@gmail.com")],
    }),

    // Links
    ...sidebarLinkSection("Digital Presence", [
      { url: "https://mr-ahmed-ali.vercel.app/", text: "Academic Portfolio" },
      { url: "https://phronesis-studio.com/", text: "Studio of Phronesis" },
      { url: "https://ahmed-ali-ops.vercel.app/", text: "Professional Portfolio" },
      { url: "https://linkedin.com/in/ahmedmahmoudsaeedahmedali", text: "LinkedIn Profile" },
      { url: "https://www.amazon.com/author/ahmed-ali", text: "Amazon Author Page" },
      { url: "https://phronesis-studio.com/en/publications/depth-of-knowledge", text: "Book Details" },
    ]),

    // Education
    ...sidebarSection("Education", [
      "PGDE in Education",
      "Al-Azhar University",
      "2024 \u2013 2025",
      "Grade: Very Good",
      "",
      "BA in Philosophy",
      "Alexandria University",
      "2016 \u2013 2021",
      "Grade: Good",
    ]),

    // Languages
    ...sidebarSection("Languages", [
      "Arabic \u2014 Native",
      "English \u2014 C1 (IELTS 7)",
      "Urdu \u2014 Beginner",
      "Spanish \u2014 Beginner",
    ]),

    // Affiliations
    ...sidebarSection("Affiliations", [
      "British Philosophical",
      "Association (BPA)",
      "2025 \u2013 Present",
    ]),

    // Credentials
    ...sidebarSection("Credentials", [
      "UAE Teaching License",
      "Social Studies, Cycle 3",
      "Valid until Feb 2029",
      "",
      "ADEK Approved",
      "MSC & Islamic Education",
    ]),
  ];

  const main = [
    // Profile
    ...mainHeading("Profile"),
    new Paragraph({
      spacing: { after: 120, line: 280 },
      alignment: AlignmentType.JUSTIFIED,
      children: [txt(
        "Licensed UAE educator with ADEK approval in Moral, Social, and Cultural Studies and Islamic Education. Classroom practice spans Grades 1 to 12 in the American Curriculum, with subject mapping to IB MYP, Cambridge Global Perspectives, IB Theory of Knowledge, and A-Level Philosophy. Author of a published handbook on instructional design. Faculty Head for Model United Nations; coached students to win Best School at MANORMUN V 2026. BA in Philosophy from Alexandria University, PGDE from Al-Azhar University.",
        { font: FONT, size: 20, color: COLOR.ink }
      )],
    }),

    // Experience
    ...mainHeading("Experience"),

    ...experienceEntry(
      "English Social Studies Teacher",
      "Al Nahda National School for Boys, Abu Dhabi",
      "Aug 2026 \u2013 Present",
      ["Teaching English Social Studies at Al Nahda National School for Boys, commencing the 2026/2027 academic year."]
    ),

    ...experienceEntry(
      "MSC Studies Teacher & Lead of Non-Arabic Speaking Section",
      "Ain Al Khaleej Private School, American Division",
      "Sep 2025 \u2013 Jul 2026",
      [
        "Delivered MSC Studies and Islamic Education B through English-medium instruction, ensuring ADEK and Irtiqa'a compliance.",
        "Promoted from Subject Teacher to Lead of Non-Arabic Speaking Section in Term 2.",
        "Mentored department teachers in differentiated instruction, educational technology integration, safeguarding, inclusive education, and UAE national identity.",
        "Appointed Faculty Head for Model United Nations; coached the school delegation to win Best School at MANORMUN V 2026.",
        "Active contributor to the school's Student First initiative; campus-wide source of mentorship and emotional support for students.",
      ]
    ),

    ...experienceEntry(
      "Branch Operations Manager",
      "Cheeky Monkeys Playland LLC, UAE",
      "May 2024 \u2013 Sep 2025",
      [
        "Led a safe, child-centered learning environment, supervising activities that support early childhood development and social skills.",
        "Applied ISO 9001 and 45001 standards while training and guiding staff to maintain high educational and wellbeing standards.",
        "Achieved 21% revenue growth and earned four rapid promotions within one year.",
      ]
    ),

    ...experienceEntry(
      "Research Assistant & Translator",
      "Emory University (with Dr. Rahimjon Abdugafurov)",
      "2017",
      [
        "Transcribed and analyzed historical manuscripts in Islamic Civilization with focus on philosophical and theological contexts.",
        "Produced English-to-Arabic translations of academic works for bilingual educational settings.",
      ]
    ),

    // Publications
    ...mainHeading("Publication"),

    ...publicationEntry(
      "Depth of Knowledge: A Practical Guide to Designing Rigorous Questions Without AI",
      "Self-published, First Edition, 2026  |  ISBN 979-8-1913137-5-7  |  149 pages  |  Paperback $19.99, eBook $9.99",
      "A handbook restoring to educators the craft of writing cognitively demanding questions from lesson content alone. Grounded in Norman Webb's DOK framework with a five-step protocol verified by reverse-coding. Includes 12 chapters, 11 printable classroom resources, a verb-agnostic question stem library, and worked examples across seven subjects. A substantial chapter traces the principle that recall is not reasoning through the Islamic intellectual tradition.",
      [
        link("https://www.amazon.com/author/ahmed-ali", "Amazon"),
        txt("   |   ", { font: SANS, size: 16, color: COLOR.silver }),
        link("https://phronesis-studio.com/en/publications/depth-of-knowledge", "Book Details Page"),
      ]
    ),

    // Core Competencies
    ...mainHeading("Core Competencies"),
    ...bulletEntry([
      "Curriculum Design & Academic Quality Assurance (ADEK, Irtiqa'a, American, IB, British, UAE MoE)",
      "Differentiated Instruction & Inclusive Education (ELLs, gifted, students of determination)",
      "Inquiry-Based Learning & Student-Centered Instruction",
      "Assessment Design & Cognitive Taxonomies (Webb's DOK, Bloom's, SOLO)",
      "Educational Technology Integration (HMH, Alef, Paradigm, MS Teams, Google Classroom, Canva, Teachy)",
      "Model United Nations Programme Leadership",
      "Safeguarding & Child Protection Awareness",
      "Podcasting & Educational Content Creation",
      "Bilingual Communication \u2014 English (C1, IELTS 7) & Native Arabic",
    ]),

    // Certifications
    ...mainHeading("Certifications"),
    ...bulletEntry([
      "Certified Professional Teaching License (Social Studies, Cycle 3) \u2014 UAE MoE \u2014 Valid until Feb 2029",
      "IELTS Academic Band 7 \u2014 Valid until Aug 2027",
      "Prepare For Your First Two Weeks & Differentiate with Small Groups and Centers \u2014 HMH \u2014 Apr 2026",
      "Ready to Wrestle \u2014 United World Wrestling \u2014 Feb 2026",
      "Certified in AI for Educators (Level 1) \u2014 Teachy \u2014 Oct 2025",
      "Network Fundamentals & Network Security \u2014 Mahara Tech & MCIT \u2014 Jun 2025",
      "Fire Warden Training (Level 2) \u2014 Dubai Civil Defence \u2014 Valid until Aug 2026",
      "Verification of Manuscripts in Philosophy & Theology \u2014 Bibliotheca Alexandrina \u2014 Nov 2021",
      "Critical Thinking & Decision Making \u2014 LinkedIn Learning \u2014 Jul 2021",
    ]),

    // Educational Initiatives
    ...mainHeading("Educational Initiatives"),

    ...experienceEntry(
      "Creator & Host \u2014 Echoes of Wisdom Podcast",
      "Independent Educational Initiative",
      "2026 \u2013 Present",
      [
        "Produces and hosts a bilingual (Arabic/English) philosophy podcast with 16 episodes across 2 seasons.",
        "Bridges academic philosophy and public discourse, making complex ideas in ethics, logic, and epistemology accessible.",
      ]
    ),

    ...experienceEntry(
      "Founder \u2014 Studio of Phronesis",
      "Educational Content & Software Platform Studio",
      "2024 \u2013 Present",
      [
        "Built MSCS Academy: interactive learning platform for UAE MSCS curriculum (130 lessons, 390+ activities).",
        "Built DiplomatiQ: MUN operating system with seven-tier competency framework and AI evaluation.",
        "Published bilingual mathematics curriculum guides (Grades 1\u20134 live, 5\u201312 in production, free PDFs).",
      ]
    ),
  ];

  return new Document({
    creator: "Ahmed Ali",
    title: "Ahmed Ali \u2014 Teaching Resume",
    description: "Academic/Teaching resume",
    styles: {
      default: {
        document: {
          run: { font: FONT, size: 20 },
          paragraph: { spacing: { line: 264 } },
        },
      },
    },
    sections: [{
      properties: {
        page: {
          margin: { top: 0, bottom: 0, left: 0, right: 0 },
        },
      },
      children: [
        twoColumnResume(sidebar, main),
      ],
    }],
  });
}

// ─── Generate ───────────────────────────────────────────────────────────────

async function main() {
  const outDir = "/home/z/my-project/download";

  console.log("Generating Operations Resume...");
  const opsDoc = buildOperationsResume();
  const opsBuffer = await Packer.toBuffer(opsDoc);
  fs.writeFileSync(`${outDir}/Ahmed_Ali_Operations_Resume.docx`, opsBuffer);
  console.log(`  Saved (${(opsBuffer.length / 1024).toFixed(1)} KB)`);

  console.log("Generating Teaching Resume...");
  const teachDoc = buildTeachingResume();
  const teachBuffer = await Packer.toBuffer(teachDoc);
  fs.writeFileSync(`${outDir}/Ahmed_Ali_Teaching_Resume.docx`, teachBuffer);
  console.log(`  Saved (${(teachBuffer.length / 1024).toFixed(1)} KB)`);

  console.log("\nDone.");
}

main().catch(console.error);
