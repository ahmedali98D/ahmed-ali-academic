#!/usr/bin/env node
/**
 * Resume v9 — Professional CV rewrite.
 * Extracts facts from phronesis-studio.com/en/about and rewrites them in
 * concise, professional CV language. No website prose, no marketing copy.
 * Preserves the original resume's design (photo, navy theme, EB Garamond /
 * Calibri, hyperlinks, publications section).
 */

const {
  Document, Packer, Paragraph, TextRun, AlignmentType,
  BorderStyle, ExternalHyperlink, ImageRun,
  Table, TableRow, TableCell, WidthType, VerticalAlign,
} = require("docx");
const fs = require("fs");

// ─── Design tokens (from original resume) ──────────────────────────────────
const C = {
  navy: "00366D", navyDark: "1B3A5C", ink: "1D1D1D", graphite: "333333",
  gray: "555555", grayMed: "595959", silver: "AAAAAA", white: "FFFFFF",
  line: "D4D4D4", lightBg: "F5F5F5",
};
const BODY = "Calibri";
const HEAD = "EB Garamond";
const EM = "\u2014";   // em dash
const EN  = "\u2013";  // en dash

// ─── Helpers ────────────────────────────────────────────────────────────────
function t(text, o = {}) {
  return new TextRun({ text, font: o.font || BODY, size: o.size || 20, color: o.color || C.ink, bold: o.bold || false, italics: o.italics || false });
}
function ln(url, text, color = C.navy) {
  return new ExternalHyperlink({ link: url, children: [new TextRun({ text, font: BODY, size: 18, color, underline: { type: "single", color } })] });
}
function spacer(h = 60) { return new Paragraph({ spacing: { before: 0, after: h }, children: [new TextRun({ text: "" })] }); }
function rule(color = C.navy, size = 8) {
  return new Paragraph({ spacing: { before: 30, after: 60 }, border: { bottom: { color, space: 1, style: BorderStyle.SINGLE, size } }, children: [new TextRun({ text: "" })] });
}

function sectionTitle(text) {
  return new Paragraph({
    spacing: { before: 160, after: 30 },
    border: { bottom: { color: C.navy, space: 1, style: BorderStyle.SINGLE, size: 8 } },
    keepNext: true,
    children: [t(text.toUpperCase(), { font: HEAD, size: 24, color: C.navy, bold: true })],
  });
}

function job(title, org, period, bullets) {
  const ch = [
    new Paragraph({ spacing: { before: 100, after: 10 }, keepNext: true, children: [t(title, { font: HEAD, size: 22, color: C.navy, bold: true })] }),
    new Paragraph({ spacing: { after: 10 }, keepNext: true, children: [t(org, { size: 20, color: C.navyDark, italics: true }), t("  |  ", { size: 19, color: C.gray }), t(period, { size: 18, color: C.gray })] }),
  ];
  for (const b of bullets) {
    ch.push(new Paragraph({
      spacing: { after: 40, line: 264 }, indent: { left: 200, hanging: 120 }, alignment: AlignmentType.JUSTIFIED, keepLines: true,
      children: [t("\u2022  ", { size: 20, color: C.navy }), t(b, { size: 20, color: C.graphite })],
    }));
  }
  return ch;
}

function bullets(items) {
  return items.map(i => new Paragraph({
    spacing: { after: 40, line: 264 }, indent: { left: 200, hanging: 120 }, alignment: AlignmentType.JUSTIFIED, keepLines: true,
    children: [t("\u2022  ", { size: 20, color: C.navy }), t(i, { size: 20, color: C.graphite })],
  }));
}

// ─── Header with photo ──────────────────────────────────────────────────────
function headerWithPhoto(photoPath, name, roles, contact, links) {
  const photoData = fs.readFileSync(photoPath);
  const photoRun = new ImageRun({
    data: photoData,
    transformation: { width: 85, height: 90 },
    type: "jpg",
  });

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE }, insideHorizontal: { style: BorderStyle.NONE }, insideVertical: { style: BorderStyle.NONE } },
    rows: [new TableRow({ cantSplit: true, children: [
      new TableCell({ width: { size: 15, type: WidthType.PERCENTAGE }, margins: { top: 0, bottom: 0, left: 0, right: 80 }, verticalAlign: VerticalAlign.TOP, children: [
        new Paragraph({ spacing: { after: 0 }, children: [photoRun] }),
      ] }),
      new TableCell({ width: { size: 85, type: WidthType.PERCENTAGE }, margins: { top: 0, bottom: 0, left: 0, right: 0 }, verticalAlign: VerticalAlign.TOP, children: [
        new Paragraph({ spacing: { after: 20 }, children: [t(name, { font: HEAD, size: 32, color: C.navy, bold: true })] }),
        new Paragraph({ spacing: { after: 30 }, children: roles }),
        new Paragraph({ spacing: { after: 15, line: 240 }, children: contact }),
        new Paragraph({ spacing: { after: 0, line: 240 }, children: links }),
      ] }),
    ] })],
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// OPERATIONS RESUME
// ═══════════════════════════════════════════════════════════════════════════

function buildOps() {
  const photoPath = "/home/z/my-project/upload/Personal Photo.jpg";

  const header = headerWithPhoto(
    photoPath,
    "AHMED ALI",
    [t("Operations Leader  |  Author  |  Systems Architect  |  Educator", { font: HEAD, size: 21, color: C.navyDark, italics: true })],
    [
      t("Abu Dhabi, UAE  |  +971 56 166 9766  |  ", { size: 18, color: C.gray }),
      ln("mailto:ahmedmahmoudsaeed98@gmail.com", "ahmedmahmoudsaeed98@gmail.com"),
    ],
    [
      ln("https://ahmed-ali-ops.vercel.app/", "Portfolio"),
      t("  |  ", { size: 17, color: C.silver }),
      ln("https://phronesis-studio.com/", "Studio of Phronesis"),
      t("  |  ", { size: 17, color: C.silver }),
      ln("https://linkedin.com/in/ahmedmahmoudsaeedahmedali", "LinkedIn"),
      t("  |  ", { size: 17, color: C.silver }),
      ln("https://www.amazon.com/author/ahmed-ali", "Amazon Author"),
      t("  |  ", { size: 17, color: C.silver }),
      ln("https://phronesis-studio.com/en/publications/depth-of-knowledge", "Book"),
    ]
  );

  const main = [
    header,
    rule(C.navy, 12),

    // ── Summary ──────────────────────────────────────────────────────────
    sectionTitle("Professional Summary"),
    new Paragraph({ spacing: { after: 60, line: 264 }, alignment: AlignmentType.JUSTIFIED, keepLines: true, children: [t(
      "Operations leader and systems architect with 8+ years of experience across education, retail, telecommunications, and family entertainment in the UAE, UK, and Egypt. ISO 9001 and ISO 45001 Internal Auditor. Delivered 21% year-one revenue growth and earned four promotions within a single organization. Founder of Studio of Phronesis, a studio producing bilingual educational content and production-grade software platforms. Author of \"Depth of Knowledge: A Practical Guide to Designing Rigorous Questions Without AI\" (2026). Bilingual: native Arabic and English (C1, IELTS Band 7).",
      { size: 20, color: C.graphite })] }),

    // ── Experience ───────────────────────────────────────────────────────
    sectionTitle("Professional Experience"),

    ...job("English Social Studies Teacher", "Al Nahda National School for Boys, Abu Dhabi, UAE", "Aug 2026 " + EN + " Present",
      [
        "Appointed to teach English Social Studies for the 2026/2027 academic year.",
      ]
    ),

    ...job("MSC Studies and Islamic Education B Teacher; Lead, Non-Arabic Speaking Section", "Ain Al Khaleej Private School, American Division, UAE", "Sep 2025 " + EN + " Jul 2026",
      [
        "Delivered MSC Studies (Cycles 2" + EN + "3) and Islamic Education B (Cycle 1) through English-medium instruction, ensuring ADEK and Irtiqa'a compliance.",
        "Promoted from Subject Teacher to Lead of the Non-Arabic Speaking Section in Term 2.",
        "Mentored department teachers in differentiated instruction, educational technology integration, safeguarding, inclusive education, and UAE national identity.",
        "Appointed Faculty Head for Model United Nations; coached the school delegation to win Best School at MANORMUN V 2026.",
        "Contributed to the school's \"Student First\" initiative and served as a campus-wide mentorship resource.",
      ]
    ),

    ...job("Branch Operations Manager", "Cheeky Monkeys Playland LLC, UAE", "May 2024 " + EN + " Sep 2025",
      [
        "Directed daily operations of a 1,700 sqm facility, leading a 12-person cross-functional team across customer service, food operations, and event planning.",
        "Achieved 21% revenue growth in year one despite declining footfall (verified by Head of Operations reference letter).",
        "Increased 5-star customer feedback by 150%.",
        "Earned four promotions and three salary increments within one year.",
        "Negotiated vendor partnerships that reduced operational costs while maintaining service quality.",
        "Maintained ISO 9001 and ISO 45001 compliance as Certified Internal Auditor.",
      ]
    ),

    ...job("Sales Executive and Duty Manager", "e& Etisalat UAE, Al Ain Mall Branch", "Jul 2022 " + EN + " Jun 2024",
      [
        "Ranked highest-performing sales executive at Al Ain Mall Branch in 2023.",
        "Introduced the Net Promoter Score (NPS) framework to branch operations.",
        "Designed and led the branch's first internal customer satisfaction training programme.",
        "Served as Acting Duty Manager, overseeing branch operations and escalations.",
        "Mentored junior staff in product knowledge, upselling, and customer service.",
      ]
    ),

    ...job("International Account Advisor", "Vodafone UK, Remote", "Mar 2019 " + EN + " Jul 2022",
      [
        "Managed a high-volume portfolio of UK-based customer accounts in a target-driven contact centre environment.",
        "Delivered telecom support, billing, and complex issue resolution meeting daily SLAs.",
        "Provided peer mentoring and training to new team members.",
      ]
    ),

    ...job("Team Leader", "FEED, Alexandria, Egypt", "Feb 2017 " + EN + " Feb 2019",
      [
        "Led six divisions within a community permaculture initiative: Natural Products, Sports, Plants, Carpentry, Translation, and Public Relations.",
        "Developed sustainability and environmental education programmes.",
        "Oversaw public relations, increasing project visibility and participation.",
        "Conducted performance evaluations and coordinated multi-disciplinary project delivery.",
      ]
    ),

    ...job("Research Assistant and Translator", "Emory University (with Dr. Rahimjon Abdugafurov)", "2017",
      [
        "Transcribed and analysed historical manuscripts in Islamic civilization for academic research.",
        "Produced English-to-Arabic academic translations for bilingual educational use.",
        "Contributed scholarly material analysing the philosophical and theological contexts of historical texts.",
      ]
    ),

    // ── Publication ──────────────────────────────────────────────────────
    sectionTitle("Publication"),
    new Paragraph({ spacing: { before: 60, after: 10 }, keepNext: true, children: [t("Depth of Knowledge: A Practical Guide to Designing Rigorous Questions Without AI", { font: HEAD, size: 22, color: C.navy, bold: true, italics: true })] }),
    new Paragraph({ spacing: { after: 15 }, keepNext: true, children: [t("Self-published, 2026  |  ISBN: 979-8-1913137-5-7  |  149 pages  |  Paperback $19.99, eBook $9.99", { size: 18, color: C.gray })] }),
    new Paragraph({ spacing: { after: 30 }, keepNext: true, children: [t("Available on Amazon.  ", { size: 19 }), ln("https://www.amazon.com/author/ahmed-ali", "amazon.com/author/ahmed-ali"), t("   |   ", { size: 17, color: C.silver }), ln("https://phronesis-studio.com/en/publications/depth-of-knowledge", "Book page")] }),
    new Paragraph({ spacing: { after: 40, line: 264 }, alignment: AlignmentType.JUSTIFIED, keepLines: true, children: [t("A practical handbook for educators on writing cognitively demanding questions from lesson content alone, without AI. Grounded in Norman Webb's Depth of Knowledge framework, with a five-step protocol verified by reverse-coding. Includes a chapter tracing the principle through the Islamic intellectual tradition from Al-Hasan al-Basri to Ibn Khaldun.", { size: 19, color: C.grayMed, italics: true })] }),

    // ── Education ────────────────────────────────────────────────────────
    sectionTitle("Education"),
    new Paragraph({ spacing: { before: 60, after: 8 }, keepNext: true, children: [
      t("Postgraduate Diploma in Education", { font: HEAD, size: 21, color: C.navy, bold: true }),
      t("  |  Al-Azhar University  |  ", { size: 19, color: C.navyDark, italics: true }),
      t("Sep 2024 " + EN + " Sep 2025  (Very Good)", { size: 18, color: C.gray }),
    ] }),
    new Paragraph({ spacing: { after: 20, line: 264 }, keepLines: true, children: [t("Educational psychology, curriculum studies, instructional methodologies, philosophy and history of education, educational administration. Accredited and attested by authorities in Egypt and the UAE, with UAE Ministry of Education equivalency.", { size: 18, color: C.grayMed })] }),
    new Paragraph({ spacing: { before: 40, after: 8 }, keepNext: true, children: [
      t("Bachelor of Arts in Philosophy", { font: HEAD, size: 21, color: C.navy, bold: true }),
      t("  |  Alexandria University  |  ", { size: 19, color: C.navyDark, italics: true }),
      t("Sep 2016 " + EN + " May 2021  (Good)", { size: 18, color: C.gray }),
    ] }),
    new Paragraph({ spacing: { after: 20, line: 264 }, keepLines: true, children: [t("Formal and mathematical logic, philosophy of science, metaphysics, philosophy of language, ethics, Greek/Islamic/modern/contemporary philosophy, Islamic theology (Kalam) and Sufism, logic and artificial intelligence. Accredited and attested, with UAE Ministry of Education equivalency.", { size: 18, color: C.grayMed })] }),

    // ── Core Competencies ────────────────────────────────────────────────
    sectionTitle("Core Competencies"),
    ...bullets([
      "Operations and Facility Management  |  Strategic Planning and Financial Forecasting",
      "ISO 9001 and ISO 45001 Compliance and Internal Audit",
      "Sales Strategy, Revenue Growth and KPI Achievement  |  Vendor Negotiation",
      "Team Leadership, Coaching and Performance Management",
      "Client Acquisition, Retention and Stakeholder Management",
      "Cross-Functional Collaboration and Change Management",
      "Curriculum Design and Academic Quality Assurance (ADEK, Irtiqa'a)",
      "Educational Technology Integration and Digital Transformation",
      "Bilingual Communication: English (C1, IELTS 7) and Native Arabic",
    ]),

    // ── Certifications ───────────────────────────────────────────────────
    sectionTitle("Certifications"),
    ...bullets([
      "Certified Professional Teaching License (Social Studies, Cycle 3), UAE MoE " + EM + " Valid until Feb 2029",
      "IELTS Academic Band 7, British Council " + EM + " Valid until Aug 2027",
      "ISO 9001 and ISO 45001 Internal Auditor",
      "Advanced Person-in-Charge (PIC), Dubai Municipality " + EM + " May 2025",
      "Fire Warden (Level 2), Dubai Civil Defence " + EM + " Valid until Aug 2026",
      "AI for Educators (Level 1), Teachy " + EM + " Oct 2025  |  Network Fundamentals and Security, Mahara Tech " + EM + " Jun 2025",
      "Mastering Sales Excellence, e& Etisalat " + EM + " Apr 2024  |  Front Line for Retail Sales " + EM + " Aug 2022",
      "Verification of Manuscripts in Philosophy and Theology, Bibliotheca Alexandrina " + EM + " Nov 2021",
      "Critical Thinking and Decision Making, LinkedIn Learning " + EM + " Jul 2021",
    ]),

    // ── Selected Projects ────────────────────────────────────────────────
    sectionTitle("Selected Projects and Initiatives"),

    ...job("Founder and Systems Architect", "Studio of Phronesis", "2024 " + EN + " Present",
      [
        "Founded a studio producing bilingual educational content and production-grade software platforms.",
        "Real Estate Emperor: property management SaaS with 400+ units live.",
        "MSCS Academy: 130 lessons and 390+ activities.",
        "DiplomatiQ: Model United Nations operating system with AI evaluation.",
      ]
    ),

    ...job("Creator and Host, Echoes of Wisdom Podcast", "Independent Educational Initiative", "2026 " + EN + " Present",
      ["Bilingual (Arabic/English) philosophy podcast with 16 episodes across two seasons, bridging academic philosophy and public discourse in ethics, logic, and epistemology."]
    ),

    ...job("Co-Founder and Member, Educational Youth Club", "Bibliotheca Alexandrina, Alexandria, Egypt", "Oct 2013 " + EN + " Dec 2018",
      ["Co-founded a youth club promoting environmental awareness and critical thinking; participated in YESBU, LYM, and ALYM programmes."]
    ),

    ...job("General Coordinator, Waste Segregation Initiative", "Bibliotheca Alexandrina and Alexandria Governorate, Egypt", "Feb 2015 " + EN + " Feb 2017",
      ["Managed logistics and outreach for a citywide environmental awareness initiative targeting youth and local schools."]
    ),

    ...job("Co-Organiser, 3rd Annual International Conference", "Department of Philosophy, Alexandria University, Egypt", "Nov 2017",
      ["Co-organised the international conference on philosophical reading, creativity, and critical criticism."]
    ),

    // ── Languages, Affiliations & Technical Skills ──────────────────────
    sectionTitle("Languages, Affiliations and Technical Skills"),
    ...bullets([
      "Languages: Arabic (Native), English (C1, IELTS Band 7), Urdu (Beginner), Spanish (Beginner)",
      "Affiliations: Member, British Philosophical Association (BPA), 2025" + EN + "Present",
      "Sports Coaching: Strength and Conditioning Coach, Swift Football Academy, Al Ain, 2023" + EN + "2024",
      "Technical Skills: CompTIA A+, Network+, Linux+; Microsoft Office; Google Workspace; EdTech platforms (HMH, Alef, Paradigm, MS Teams, Google Classroom, Canva, Teachy)",
    ]),
  ];

  return new Document({
    creator: "Ahmed Ali", title: "Ahmed Ali " + EM + " Operations Resume",
    styles: { default: { document: { run: { font: BODY, size: 20 }, paragraph: { spacing: { line: 264 } } } } },
    sections: [{ properties: { page: { margin: { top: 600, bottom: 400, left: 566, right: 425 } } }, children: main }],
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// TEACHING RESUME
// ═══════════════════════════════════════════════════════════════════════════

function buildTeach() {
  const photoPath = "/home/z/my-project/upload/Personal Photo.jpg";

  const header = headerWithPhoto(
    photoPath,
    "AHMED ALI",
    [t("Humanities Educator  |  Philosopher  |  Author", { font: HEAD, size: 21, color: C.navyDark, italics: true })],
    [
      t("Abu Dhabi, UAE  |  +971 56 166 9766  |  ", { size: 18, color: C.gray }),
      ln("mailto:ahmed.ali.academic@gmail.com", "ahmed.ali.academic@gmail.com"),
    ],
    [
      ln("https://mr-ahmed-ali.vercel.app/", "Academic Portfolio"),
      t("  |  ", { size: 17, color: C.silver }),
      ln("https://phronesis-studio.com/", "Studio of Phronesis"),
      t("  |  ", { size: 17, color: C.silver }),
      ln("https://linkedin.com/in/ahmedmahmoudsaeedahmedali", "LinkedIn"),
      t("  |  ", { size: 17, color: C.silver }),
      ln("https://www.amazon.com/author/ahmed-ali", "Amazon Author"),
      t("  |  ", { size: 17, color: C.silver }),
      ln("https://phronesis-studio.com/en/publications/depth-of-knowledge", "Book"),
    ]
  );

  const main = [
    header,
    rule(C.navy, 12),

    // ── Summary ──────────────────────────────────────────────────────────
    sectionTitle("Professional Summary"),
    new Paragraph({ spacing: { after: 60, line: 264 }, alignment: AlignmentType.JUSTIFIED, keepLines: true, children: [t(
      "ADEK-licensed Social Studies and Islamic Education teacher with experience across Grades 1" + EN + "12 in the American Curriculum, with subject mapping to IB MYP, Cambridge Global Perspectives, IB Theory of Knowledge, and A-Level Philosophy. Holds a BA in Philosophy (Alexandria University) and a Postgraduate Diploma in Education (Al-Azhar University). Faculty Head for Model United Nations; coached the school delegation to win Best School at MANORMUN V 2026. Author of \"Depth of Knowledge: A Practical Guide to Designing Rigorous Questions Without AI\" (2026). UAE Teaching License and IELTS Band 7.",
      { size: 20, color: C.graphite })] }),

    // ── Experience ───────────────────────────────────────────────────────
    sectionTitle("Professional Experience"),

    ...job("English Social Studies Teacher", "Al Nahda National School for Boys, Abu Dhabi, UAE", "Aug 2026 " + EN + " Present",
      [
        "Appointed to teach English Social Studies for the 2026/2027 academic year.",
      ]
    ),

    ...job("MSC Studies and Islamic Education B Teacher; Lead, Non-Arabic Speaking Section", "Ain Al Khaleej Private School, American Division, UAE", "Sep 2025 " + EN + " Jul 2026",
      [
        "Delivered MSC Studies (Cycles 2" + EN + "3) and Islamic Education B (Cycle 1) through English-medium instruction, ensuring ADEK and Irtiqa'a compliance.",
        "Promoted from Subject Teacher to Lead of the Non-Arabic Speaking Section in Term 2.",
        "Designed and executed differentiated instruction for English Language Learners and gifted students.",
        "Appointed Faculty Head for Model United Nations; coached the school delegation to win Best School at MANORMUN V 2026.",
        "Integrated educational technology platforms (HMH, Alef, Paradigm, MS Teams, Google Classroom, Canva, Teachy) into daily instruction.",
        "Contributed to the school's \"Student First\" initiative and served as a campus-wide mentorship resource.",
      ]
    ),

    ...job("Branch Operations Manager", "Cheeky Monkeys Playland LLC, UAE", "May 2024 " + EN + " Sep 2025",
      [
        "Directed operations of a 1,700 sqm child-focused facility, leading a 12-person cross-functional team.",
        "Maintained ISO 9001 and ISO 45001 compliance as Certified Internal Auditor.",
        "Applied child-safeguarding and health-and-safety standards in a venue serving families and young children.",
      ]
    ),

    ...job("Sales Executive and Duty Manager", "e& Etisalat UAE, Al Ain Mall Branch", "Jul 2022 " + EN + " Jun 2024",
      [
        "Ranked highest-performing sales executive at Al Ain Mall Branch in 2023.",
        "Introduced the Net Promoter Score (NPS) framework to branch operations.",
        "Designed and led the branch's first internal customer satisfaction training programme.",
        "Mentored junior staff in product knowledge, upselling, and customer service.",
      ]
    ),

    ...job("Research Assistant and Translator", "Emory University (with Dr. Rahimjon Abdugafurov)", "2017",
      [
        "Transcribed and analysed historical manuscripts in Islamic civilization for academic research.",
        "Produced English-to-Arabic academic translations for bilingual educational use.",
        "Contributed scholarly material analysing the philosophical and theological contexts of historical texts.",
      ]
    ),

    // ── Publication ──────────────────────────────────────────────────────
    sectionTitle("Publication"),
    new Paragraph({ spacing: { before: 60, after: 10 }, keepNext: true, children: [t("Depth of Knowledge: A Practical Guide to Designing Rigorous Questions Without AI", { font: HEAD, size: 22, color: C.navy, bold: true, italics: true })] }),
    new Paragraph({ spacing: { after: 15 }, keepNext: true, children: [t("Self-published, 2026  |  ISBN: 979-8-1913137-5-7  |  149 pages  |  Paperback $19.99, eBook $9.99", { size: 18, color: C.gray })] }),
    new Paragraph({ spacing: { after: 30 }, keepNext: true, children: [t("Available on Amazon.  ", { size: 19 }), ln("https://www.amazon.com/author/ahmed-ali", "amazon.com/author/ahmed-ali"), t("   |   ", { size: 17, color: C.silver }), ln("https://phronesis-studio.com/en/publications/depth-of-knowledge", "Book page")] }),
    new Paragraph({ spacing: { after: 40, line: 264 }, alignment: AlignmentType.JUSTIFIED, keepLines: true, children: [t("A practical handbook for educators on writing cognitively demanding questions from lesson content alone, without AI. Grounded in Norman Webb's Depth of Knowledge framework, with a five-step protocol verified by reverse-coding. Twelve chapters, eleven printable classroom resources, and worked examples across seven subjects. Includes a chapter tracing the principle through the Islamic intellectual tradition from Al-Hasan al-Basri to Ibn Khaldun.", { size: 19, color: C.grayMed, italics: true })] }),

    // ── Education ────────────────────────────────────────────────────────
    sectionTitle("Education"),
    new Paragraph({ spacing: { before: 60, after: 8 }, keepNext: true, children: [
      t("Postgraduate Diploma in Education", { font: HEAD, size: 21, color: C.navy, bold: true }),
      t("  |  Al-Azhar University  |  ", { size: 19, color: C.navyDark, italics: true }),
      t("Sep 2024 " + EN + " Sep 2025  (Very Good)", { size: 18, color: C.gray }),
    ] }),
    new Paragraph({ spacing: { after: 20, line: 264 }, keepLines: true, children: [t("Educational psychology and human development, philosophy and history of education, curriculum studies, instructional methodologies, educational administration, micro-teaching and practical teaching experience. Accredited and attested, with UAE Ministry of Education equivalency.", { size: 18, color: C.grayMed })] }),
    new Paragraph({ spacing: { before: 40, after: 8 }, keepNext: true, children: [
      t("Bachelor of Arts in Philosophy", { font: HEAD, size: 21, color: C.navy, bold: true }),
      t("  |  Alexandria University  |  ", { size: 19, color: C.navyDark, italics: true }),
      t("Sep 2016 " + EN + " May 2021  (Good)", { size: 18, color: C.gray }),
    ] }),
    new Paragraph({ spacing: { after: 20, line: 264 }, keepLines: true, children: [t("Formal and mathematical logic, philosophy of science, metaphysics, philosophy of language, ethics, Greek/Islamic/modern/contemporary philosophy, Islamic theology (Kalam) and Sufism, logic and artificial intelligence. Accredited and attested, with UAE Ministry of Education equivalency.", { size: 18, color: C.grayMed })] }),

    // ── Core Competencies ────────────────────────────────────────────────
    sectionTitle("Core Competencies"),
    ...bullets([
      "Lesson Planning and Curriculum Design (American, IB MYP, British, UAE MoE)",
      "Inquiry-Based Learning and Student-Centred Instruction",
      "Differentiated Instruction for ELLs and Gifted Learners  |  Inclusive Education",
      "Assessment Design and Cognitive Taxonomies (Webb's DOK, Bloom's, SOLO)",
      "Classroom and Behaviour Management  |  Safeguarding and Child Protection Awareness",
      "Educational Technology (HMH, Alef, Paradigm, MS Teams, Google Classroom, Canva, Teachy, Plickers, Kahoot)",
      "Model United Nations Programme Leadership",
      "Parent Communication and Student Progress Reporting",
      "Distance and Blended Learning Delivery",
      "Bilingual Communication: English (C1, IELTS 7) and Native Arabic",
    ]),

    // ── Certifications ───────────────────────────────────────────────────
    sectionTitle("Certifications"),
    ...bullets([
      "Certified Professional Teaching License (Social Studies, Cycle 3), UAE MoE " + EM + " Valid until Feb 2029",
      "IELTS Academic Band 7, British Council " + EM + " Valid until Aug 2027",
      "HMH Differentiate with Small Groups " + EM + " Apr 2026  |  Ready to Wrestle, UWW " + EM + " Feb 2026",
      "AI for Educators (Level 1), Teachy " + EM + " Oct 2025  |  Network Fundamentals and Security, Mahara Tech " + EM + " Jun 2025",
      "Advanced Person-in-Charge (PIC), Dubai Municipality " + EM + " May 2025",
      "Fire Warden (Level 2), Dubai Civil Defence " + EM + " Valid until Aug 2026",
      "Verification of Manuscripts in Philosophy and Theology, Bibliotheca Alexandrina " + EM + " Nov 2021",
      "Critical Thinking and Decision Making, LinkedIn Learning " + EM + " Jul 2021",
    ]),

    // ── Educational Initiatives ──────────────────────────────────────────
    sectionTitle("Educational Initiatives"),

    ...job("Creator and Host, Echoes of Wisdom Podcast", "Independent Educational Initiative", "2026 " + EN + " Present",
      ["Bilingual (Arabic/English) philosophy podcast with 16 episodes across two seasons, bridging academic philosophy and public discourse in ethics, logic, and epistemology."]
    ),

    ...job("Founder, Studio of Phronesis", "Educational Content and Software Platform Studio", "2024 " + EN + " Present",
      [
        "Built MSCS Academy (130 lessons, 390+ activities) and DiplomatiQ (Model United Nations with AI evaluation).",
        "Produced bilingual mathematics guides for Grades 1" + EN + "4.",
      ]
    ),

    ...job("Co-Founder and Member, Educational Youth Club", "Bibliotheca Alexandrina, Alexandria, Egypt", "Oct 2013 " + EN + " Dec 2018",
      ["Co-founded a youth club promoting environmental awareness and critical thinking; participated in YESBU, LYM, and ALYM programmes."]
    ),

    ...job("General Coordinator, Waste Segregation Initiative", "Bibliotheca Alexandrina and Alexandria Governorate, Egypt", "Feb 2015 " + EN + " Feb 2017",
      ["Managed logistics and outreach for a citywide environmental awareness initiative targeting youth and local schools."]
    ),

    // ── Languages, Affiliations & Technical Skills ──────────────────────
    sectionTitle("Languages, Affiliations and Technical Skills"),
    ...bullets([
      "Languages: Arabic (Native), English (C1, IELTS Band 7), Urdu (Beginner), Spanish (Beginner)",
      "Affiliations: Member, British Philosophical Association (BPA), 2025" + EN + "Present",
      "Conference Organisation: Co-organised the 3rd Annual International Conference, Department of Philosophy, Alexandria University (Nov 2017)",
      "Sports Coaching: Strength and Conditioning Coach, Swift Football Academy, Al Ain, 2023" + EN + "2024",
      "Technical Skills: CompTIA A+, Network+, Linux+; Microsoft Office; Google Workspace; EdTech Platforms",
    ]),
  ];

  return new Document({
    creator: "Ahmed Ali", title: "Ahmed Ali " + EM + " Teaching Resume",
    styles: { default: { document: { run: { font: BODY, size: 20 }, paragraph: { spacing: { line: 264 } } } } },
    sections: [{ properties: { page: { margin: { top: 600, bottom: 400, left: 566, right: 425 } } }, children: main }],
  });
}

async function main() {
  const d = "/home/z/my-project/download";
  console.log("Operations...");
  const ops = await Packer.toBuffer(buildOps());
  fs.writeFileSync(`${d}/Ahmed_Ali_Operations_Resume.docx`, ops);
  console.log(`  ${(ops.length / 1024).toFixed(1)} KB`);
  console.log("Teaching...");
  const teach = await Packer.toBuffer(buildTeach());
  fs.writeFileSync(`${d}/Ahmed_Ali_Teaching_Resume.docx`, teach);
  console.log(`  ${(teach.length / 1024).toFixed(1)} KB`);
  console.log("Done.");
}
main().catch(console.error);
