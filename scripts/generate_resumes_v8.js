#!/usr/bin/env node
/**
 * Resume v7 — Based on the ORIGINAL resume design.
 * Uses the original's font (Calibri/EB Garamond), colors (navy #00366D),
 * spacing, and structure. Adds: photo, updated content, hyperlinks, publications.
 * 
 * Content strategy for 3-page max:
 * - Preserve ALL achievements with metrics
 * - Consolidate generic/repetitive bullets (e.g., "mentored junior staff" 
 *   appears 3x across roles — keep the most specific instance)
 * - Remove purely filler bullets that add no information
 */

const {
  Document, Packer, Paragraph, TextRun, AlignmentType,
  BorderStyle, ExternalHyperlink, ImageRun,
  Table, TableRow, TableCell, WidthType, ShadingType, convertInchesToTwip,
  VerticalAlign, HeightRule,
} = require("docx");
const fs = require("fs");

// ─── Original design tokens ─────────────────────────────────────────────────
const C = {
  navy: "00366D", navyDark: "1B3A5C", ink: "1D1D1D", graphite: "333333",
  gray: "555555", grayMed: "595959", silver: "AAAAAA", white: "FFFFFF",
  line: "D4D4D4", lightBg: "F5F5F5",
};
const BODY = "Calibri";
const HEAD = "EB Garamond";

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

function job(title, org, period, bullets, body) {
  const ch = [
    new Paragraph({ spacing: { before: 100, after: 10 }, keepNext: true, children: [t(title, { font: HEAD, size: 22, color: C.navy, bold: true })] }),
    new Paragraph({ spacing: { after: 10 }, keepNext: true, children: [t(org, { size: 20, color: C.navyDark, italics: true }), t("  |  ", { size: 19, color: C.gray }), t(period, { size: 18, color: C.gray })] }),
  ];
  if (body) {
    ch.push(new Paragraph({ spacing: { after: 30, line: 264 }, alignment: AlignmentType.JUSTIFIED, keepLines: true, children: [t(body, { size: 19, color: C.grayMed, italics: true })] }));
  }
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
      // Photo cell
      new TableCell({ width: { size: 15, type: WidthType.PERCENTAGE }, margins: { top: 0, bottom: 0, left: 0, right: 80 }, verticalAlign: VerticalAlign.TOP, children: [
        new Paragraph({ spacing: { after: 0 }, children: [photoRun] }),
      ] }),
      // Info cell
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

    // Summary
    sectionTitle("Summary"),
    new Paragraph({ spacing: { after: 60, line: 264 }, alignment: AlignmentType.JUSTIFIED, keepLines: true, children: [t(
      "High-impact Operations Leader, Author, and Systems Architect with 8+ years driving operational excellence, revenue growth, and team performance across Academia, Retail, Telecommunications, and Family Entertainment in the UAE, UK, and Egypt. 21% year-one revenue growth. Four rapid promotions in a single organization. ISO 9001/45001 certified. Author of \"Depth of Knowledge: A Practical Guide to Designing Rigorous Questions Without AI\" (2026). Founder of Studio of Phronesis. Bilingual in Arabic (native) and English (IELTS Band 7).",
      { size: 20, color: C.graphite })] }),

    // Experience — full unconsolidated content from phronesis-studio.com/en/about
    sectionTitle("Work Experience"),

    ...job("English Social Studies Teacher", "Al Nahda National School for Boys, Abu Dhabi, UAE", "Aug 2026 \u2013 Present",
      [],
      "Teaching English Social Studies at Al Nahda National School for Boys, commencing the 2026/2027 academic year."
    ),

    ...job("MSC Studies and Islamic Education B Teacher and Lead of Non-Arabic Speaking Section", "Ain Al Khaleej Private School, American Division, UAE", "Sep 2025 \u2013 Jul 2026",
      [
        "Delivered MSC Studies and Islamic Education B through English-medium instruction, ensuring ADEK and Irtiqa'a compliance.",
        "Mentored department teachers in differentiated instruction, educational technology integration, safeguarding, inclusive education, and UAE national identity.",
        "Appointed Faculty Head for Model United Nations in Term 2, taking charge of the school delegation programme.",
        "Coached the delegation to win Best School at MANORMUN V 2026, developing students' diplomatic reasoning, research writing, and public speaking.",
        "Active contributor to the school's \"Student First\" initiative and a campus-wide source of mentorship and emotional support for students beyond his own classes.",
      ],
      "Joined as Subject Teacher of MSC for Cycles 2 and 3 and Islamic Education B for Cycle 1, and was promoted in Term 2 to Lead of the Non-Arabic Speaking Section."
    ),

    ...job("Branch Operations Manager", "Cheeky Monkeys Playland LLC, UAE", "May 2024 \u2013 Sep 2025",
      [
        "Achieved 21% revenue growth in year one, verified by Head of Operations recommendation letter.",
        "Boosted 5-star customer feedback by 150%, transforming the branch's online reputation.",
        "Earned four rapid promotions and three salary increments within one year.",
        "Negotiated vendor partnerships that reduced operational costs while maintaining service quality.",
        "Partnered with senior leadership on strategic planning, staffing, and branch expansion initiatives.",
        "Downloadable reference: recommendation letter from Head of Operations available upon request.",
      ],
      "Oversaw daily operations of a 1,700 sqm child-focused facility, directing a cross-functional team of 12 across customer service, food operations, and event planning. Certified Internal Auditor maintaining full compliance with ISO 9001 and ISO 45001 standards."
    ),

    ...job("Sales Executive and Duty Manager", "e& Etisalat UAE, Al Ain Mall Branch", "Jul 2022 \u2013 Jun 2024",
      [
        "Introduced Net Promoter Score (NPS) framework to Etisalat branch operations.",
        "Designed and led the first internal customer satisfaction training sessions.",
        "Frequently selected as Acting Duty Manager, overseeing branch operations.",
        "Mentored junior staff in product knowledge, upselling, and customer service.",
        "Certifications: Frontline for Retail Sales (2022), Mastering Sales Excellence (2024).",
      ],
      "Ranked as the highest-performing executive in 2023 at Al Ain Mall Branch, consistently leading in sales KPIs and customer engagement metrics."
    ),

    ...job("International Account Advisor", "Vodafone UK, Remote", "Mar 2019 \u2013 Jul 2022",
      [
        "Delivered exceptional service in telecom support, billing, and complex issue resolution.",
        "Provided peer mentoring and training to new team members.",
        "Consistently met daily performance targets and service-level agreements.",
        "Adapted communication style across diverse cultural contexts.",
        "Strengthened time management and organizational skills in remote setting.",
      ],
      "Managed a high-volume portfolio of UK-based customer accounts in a fast-paced, target-driven contact center environment."
    ),

    ...job("Team Leader", "FEED, Alexandria, Egypt", "Feb 2017 \u2013 Feb 2019",
      [
        "Led 6 divisions: Natural Products, Sports, Plants, Carpentry, Translation, and PR.",
        "Developed sustainability and environmental education programmes.",
        "Oversaw public relations efforts, increasing project visibility and participation.",
        "Conducted regular performance evaluations and provided coaching.",
        "Coordinated multi-disciplinary project delivery across divisions.",
      ],
      "Led multiple divisions within a community permaculture initiative, managing and mentoring diverse volunteer teams."
    ),

    ...job("Research Assistant and Translator", "Emory University (with Dr. Rahimjon Abdugafurov)", "2017",
      [
        "Analyzed philosophical and theological contexts of historical texts.",
        "Produced English to Arabic academic translations for bilingual education.",
        "Contributed scholarly material for academic research settings.",
      ],
      "Transcribed and analyzed historical manuscripts in Islamic Civilization for Emory University research."
    ),

    // Publication
    sectionTitle("Publication"),
    new Paragraph({ spacing: { before: 60, after: 10 }, keepNext: true, children: [t("Depth of Knowledge: A Practical Guide to Designing Rigorous Questions Without AI", { font: HEAD, size: 22, color: C.navy, bold: true, italics: true })] }),
    new Paragraph({ spacing: { after: 15 }, keepNext: true, children: [t("Self-published, 2026  |  ISBN: 979-8-1913137-5-7  |  149 pages  |  Paperback $19.99, eBook $9.99", { size: 18, color: C.gray })] }),
    new Paragraph({ spacing: { after: 30 }, keepNext: true, children: [t("Available globally on Amazon.  ", { size: 19 }), ln("https://www.amazon.com/author/ahmed-ali", "Buy on Amazon"), t("   |   ", { size: 17, color: C.silver }), ln("https://phronesis-studio.com/en/publications/depth-of-knowledge", "Book Details")] }),
    new Paragraph({ spacing: { after: 40, line: 264 }, alignment: AlignmentType.JUSTIFIED, keepLines: true, children: [t("A handbook restoring to educators the craft of writing cognitively demanding questions from lesson content alone, without AI. Grounded in Norman Webb's DOK framework with a five-step protocol verified by reverse-coding. A chapter traces the principle through the Islamic intellectual tradition from Al-Hasan al-Basri to Ibn Khaldun.", { size: 19, color: C.grayMed, italics: true })] }),

    // Education
    sectionTitle("Education"),
    new Paragraph({ spacing: { before: 60, after: 8 }, keepNext: true, children: [
      t("Postgraduate Diploma in Education", { font: HEAD, size: 21, color: C.navy, bold: true }),
      t("  |  Al-Azhar University  |  ", { size: 19, color: C.navyDark, italics: true }),
      t("Sep 2024 \u2013 Sep 2025", { size: 18, color: C.gray }),
    ] }),
    new Paragraph({ spacing: { after: 20, line: 264 }, keepLines: true, children: [t("Educational psychology, curriculum development, pedagogy, instructional methods.", { size: 18, color: C.grayMed })] }),
    new Paragraph({ spacing: { before: 40, after: 8 }, keepNext: true, children: [
      t("Bachelor of Arts in Philosophy", { font: HEAD, size: 21, color: C.navy, bold: true }),
      t("  |  Alexandria University  |  ", { size: 19, color: C.navyDark, italics: true }),
      t("Sep 2016 \u2013 May 2021", { size: 18, color: C.gray }),
    ] }),
    new Paragraph({ spacing: { after: 20, line: 264 }, keepLines: true, children: [t("Logic, ethics, epistemology, metaphysics, Islamic philosophy, philosophy of language.", { size: 18, color: C.grayMed })] }),

    // Core Competencies
    sectionTitle("Core Competencies"),
    ...bullets([
      "Operations & Facility Management  |  Strategic Planning & Financial Forecasting  |  ISO 9001 & 45001 Internal Audit",
      "Sales Strategy, Revenue Growth & KPI Achievement  |  Vendor Negotiation & Supply Chain Coordination",
      "Team Leadership, Coaching & Performance Management  |  Client Acquisition & Stakeholder Management",
      "Curriculum Design & Academic Quality Assurance (ADEK, Irtiqa'a)  |  Differentiated Instruction & Inclusive Education",
      "Educational Technology Integration  |  Bilingual Communication: English (C1, IELTS 7) & Native Arabic",
    ]),

    // Certifications
    sectionTitle("Certifications"),
    ...bullets([
      "Certified Professional Teaching License (Social Studies, Cycle 3), UAE MoE \u2014 Valid until Feb 2029",
      "IELTS Academic Band 7 \u2014 Valid until Aug 2027",
      "ISO 9001 & ISO 45001 Internal Auditor",
      "AI for Educators (Level 1), Teachy \u2014 Oct 2025  |  Network Fundamentals & Security, Mahara Tech \u2014 Jun 2025",
      "Advanced Person-in-Charge (PIC), Dubai Municipality \u2014 May 2025  |  Fire Warden (Level 2) \u2014 until Aug 2026",
      "Sales Excellence, e& Etisalat \u2014 Apr 2024  |  Frontline for Retail Sales \u2014 Aug 2022",
      "Manuscript Verification, Bibliotheca Alexandrina \u2014 Nov 2021  |  Critical Thinking, LinkedIn \u2014 Jul 2021",
    ]),

    // Leadership Initiatives
    sectionTitle("Leadership Initiatives & Projects"),

    ...job("Founder & Systems Architect", "Studio of Phronesis", "2024 \u2013 Present",
      [
        "Founded a studio producing bilingual educational content and production-grade software platforms.",
        "Real Estate Emperor: property management SaaS, 400+ units live. MSCS Academy: 130 lessons, 390+ activities.",
        "DiplomatiQ: MUN operating system with AI evaluation. Echoes of Wisdom: bilingual philosophy podcast, 16 episodes.",
      ]
    ),

    ...job("Creator & Host \u2014 Echoes of Wisdom Podcast", "Independent Educational Initiative", "2026 \u2013 Present",
      ["Bilingual philosophy podcast bridging academic philosophy and public discourse, making complex ideas in ethics, logic, and epistemology accessible."]
    ),

    ...job("Co-Founder & Member \u2014 Educational Youth Club", "Bibliotheca Alexandrina, Alexandria, Egypt", "Oct 2013 \u2013 Dec 2018",
      ["Co-founded a youth club promoting environmental awareness and critical thinking; participated in YESBU, LYM, and ALYM programmes."]
    ),

    ...job("General Coordinator \u2014 Waste Segregation Initiative", "Bibliotheca Alexandrina & Alexandria Governorate, Egypt", "Feb 2015 \u2013 Feb 2017",
      ["Managed logistics and outreach for a citywide environmental awareness initiative targeting youth and local schools."]
    ),

    ...job("Co-Organiser \u2014 3rd Annual International Conference, Department of Philosophy", "Alexandria University, Egypt", "Nov 2017",
      ["Co-organised the international conference on philosophical reading, creativity, and critical criticism."]
    ),

    // Additional (compact, no header table — just lines)
    sectionTitle("Languages, Affiliations & Interests"),
    ...bullets([
      "Languages: Arabic (Native), English (C1, IELTS 7), Urdu (Beginner), Spanish (Beginner)",
      "Affiliations: Member, British Philosophical Association (BPA) \u2014 2025 to Present",
      "Sports Coaching: Strength & Conditioning Coach, Swift Football Academy, Al Ain (2023\u20132024)",
      "Technical Skills: CompTIA (A+, Network+, Linux+), Microsoft Office, Google Workspace, EdTech (HMH, Alef, Paradigm, MS Teams, Google Classroom, Canva, Teachy)",
    ]),
  ];

  return new Document({
    creator: "Ahmed Ali", title: "Ahmed Ali \u2014 Operations Resume",
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

    // Summary
    sectionTitle("Summary"),
    new Paragraph({ spacing: { after: 60, line: 264 }, alignment: AlignmentType.JUSTIFIED, keepLines: true, children: [t(
      "ADEK-approved Social Studies and Islamic Education teacher with expertise across Grades 1\u201312 in the American Curriculum, with subject mapping to IB MYP, Cambridge Global Perspectives, IB TOK, and A-Level Philosophy. Skilled in inquiry-driven lesson design, differentiation for ELLs and gifted learners, and distance learning delivery. Author of \"Depth of Knowledge: A Practical Guide to Designing Rigorous Questions Without AI\" (2026). Faculty Head for MUN; coached students to win Best School at MANORMUN V 2026. UAE Teaching License and IELTS Band 7.",
      { size: 20, color: C.graphite })] }),

    // Experience — full unconsolidated content from phronesis-studio.com/en/about
    sectionTitle("Work Experience"),

    ...job("English Social Studies Teacher", "Al Nahda National School for Boys, Abu Dhabi, UAE", "Aug 2026 \u2013 Present",
      [],
      "Teaching English Social Studies at Al Nahda National School for Boys, commencing the 2026/2027 academic year."
    ),

    ...job("MSC Studies and Islamic Education B Teacher and Lead of Non-Arabic Speaking Section", "Ain Al Khaleej Private School, American Division, UAE", "Sep 2025 \u2013 Jul 2026",
      [
        "Delivered MSC Studies and Islamic Education B through English-medium instruction, ensuring ADEK and Irtiqa'a compliance.",
        "Mentored department teachers in differentiated instruction, educational technology integration, safeguarding, inclusive education, and UAE national identity.",
        "Appointed Faculty Head for Model United Nations in Term 2, taking charge of the school delegation programme.",
        "Coached the delegation to win Best School at MANORMUN V 2026, developing students' diplomatic reasoning, research writing, and public speaking.",
        "Active contributor to the school's \"Student First\" initiative and a campus-wide source of mentorship and emotional support for students beyond his own classes.",
      ],
      "Joined as Subject Teacher of MSC for Cycles 2 and 3 and Islamic Education B for Cycle 1, and was promoted in Term 2 to Lead of the Non-Arabic Speaking Section."
    ),

    ...job("Branch Operations Manager", "Cheeky Monkeys Playland LLC, UAE", "May 2024 \u2013 Sep 2025",
      [
        "Achieved 21% revenue growth in year one, verified by Head of Operations recommendation letter.",
        "Boosted 5-star customer feedback by 150%, transforming the branch's online reputation.",
        "Earned four rapid promotions and three salary increments within one year.",
        "Negotiated vendor partnerships that reduced operational costs while maintaining service quality.",
        "Partnered with senior leadership on strategic planning, staffing, and branch expansion initiatives.",
        "Downloadable reference: recommendation letter from Head of Operations available upon request.",
      ],
      "Oversaw daily operations of a 1,700 sqm child-focused facility, directing a cross-functional team of 12 across customer service, food operations, and event planning. Certified Internal Auditor maintaining full compliance with ISO 9001 and ISO 45001 standards."
    ),

    ...job("Sales Executive and Duty Manager", "e& Etisalat UAE, Al Ain Mall Branch", "Jul 2022 \u2013 Jun 2024",
      [
        "Introduced Net Promoter Score (NPS) framework to Etisalat branch operations.",
        "Designed and led the first internal customer satisfaction training sessions.",
        "Frequently selected as Acting Duty Manager, overseeing branch operations.",
        "Mentored junior staff in product knowledge, upselling, and customer service.",
        "Certifications: Frontline for Retail Sales (2022), Mastering Sales Excellence (2024).",
      ],
      "Ranked as the highest-performing executive in 2023 at Al Ain Mall Branch, consistently leading in sales KPIs and customer engagement metrics."
    ),

    ...job("International Account Advisor", "Vodafone UK, Remote", "Mar 2019 \u2013 Jul 2022",
      [
        "Delivered exceptional service in telecom support, billing, and complex issue resolution.",
        "Provided peer mentoring and training to new team members.",
        "Consistently met daily performance targets and service-level agreements.",
        "Adapted communication style across diverse cultural contexts.",
        "Strengthened time management and organizational skills in remote setting.",
      ],
      "Managed a high-volume portfolio of UK-based customer accounts in a fast-paced, target-driven contact center environment."
    ),

    ...job("Team Leader", "FEED, Alexandria, Egypt", "Feb 2017 \u2013 Feb 2019",
      [
        "Led 6 divisions: Natural Products, Sports, Plants, Carpentry, Translation, and PR.",
        "Developed sustainability and environmental education programmes.",
        "Oversaw public relations efforts, increasing project visibility and participation.",
        "Conducted regular performance evaluations and provided coaching.",
        "Coordinated multi-disciplinary project delivery across divisions.",
      ],
      "Led multiple divisions within a community permaculture initiative, managing and mentoring diverse volunteer teams."
    ),

    ...job("Research Assistant and Translator", "Emory University (with Dr. Rahimjon Abdugafurov)", "2017",
      [
        "Analyzed philosophical and theological contexts of historical texts.",
        "Produced English to Arabic academic translations for bilingual education.",
        "Contributed scholarly material for academic research settings.",
      ],
      "Transcribed and analyzed historical manuscripts in Islamic Civilization for Emory University research."
    ),

    // Publication
    sectionTitle("Publication"),
    new Paragraph({ spacing: { before: 60, after: 10 }, keepNext: true, children: [t("Depth of Knowledge: A Practical Guide to Designing Rigorous Questions Without AI", { font: HEAD, size: 22, color: C.navy, bold: true, italics: true })] }),
    new Paragraph({ spacing: { after: 15 }, keepNext: true, children: [t("Self-published, 2026  |  ISBN: 979-8-1913137-5-7  |  149 pages  |  Paperback $19.99, eBook $9.99", { size: 18, color: C.gray })] }),
    new Paragraph({ spacing: { after: 30 }, keepNext: true, children: [t("Available globally on Amazon.  ", { size: 19 }), ln("https://www.amazon.com/author/ahmed-ali", "Buy on Amazon"), t("   |   ", { size: 17, color: C.silver }), ln("https://phronesis-studio.com/en/publications/depth-of-knowledge", "Book Details")] }),
    new Paragraph({ spacing: { after: 40, line: 264 }, alignment: AlignmentType.JUSTIFIED, keepLines: true, children: [t("A handbook restoring to educators the craft of writing cognitively demanding questions without AI. Grounded in Webb's DOK framework with a five-step protocol verified by reverse-coding. 12 chapters, 11 printable classroom resources, worked examples across seven subjects. A chapter traces the principle through the Islamic intellectual tradition from Al-Hasan al-Basri to Ibn Khaldun.", { size: 19, color: C.grayMed, italics: true })] }),

    // Education
    sectionTitle("Education"),
    new Paragraph({ spacing: { before: 60, after: 8 }, keepNext: true, children: [
      t("Postgraduate Diploma in Education", { font: HEAD, size: 21, color: C.navy, bold: true }),
      t("  |  Al-Azhar University  |  ", { size: 19, color: C.navyDark, italics: true }),
      t("Sep 2024 \u2013 Sep 2025  (Very Good)", { size: 18, color: C.gray }),
    ] }),
    new Paragraph({ spacing: { after: 20, line: 264 }, keepLines: true, children: [t("Educational psychology, curriculum development, pedagogy, instructional methods.", { size: 18, color: C.grayMed })] }),
    new Paragraph({ spacing: { before: 40, after: 8 }, keepNext: true, children: [
      t("Bachelor of Arts in Philosophy", { font: HEAD, size: 21, color: C.navy, bold: true }),
      t("  |  Alexandria University  |  ", { size: 19, color: C.navyDark, italics: true }),
      t("Sep 2016 \u2013 May 2021  (Good)", { size: 18, color: C.gray }),
    ] }),
    new Paragraph({ spacing: { after: 20, line: 264 }, keepLines: true, children: [t("Logic, ethics, epistemology, metaphysics, Islamic philosophy, philosophy of language.", { size: 18, color: C.grayMed })] }),

    // Core Competencies
    sectionTitle("Core Competencies"),
    ...bullets([
      "Lesson Planning & Curriculum Design (British, IB, American, UAE MoE)",
      "Inquiry-Based Learning & Student-Centered Instruction  |  Differentiated Instruction & Inclusive Education",
      "Assessment Design & Cognitive Taxonomies (Webb's DOK, Bloom's, SOLO)  |  Classroom Management",
      "Educational Technology (HMH, Alef, Paradigm, MS Teams, Google Classroom, Canva, Teachy, Plickers, Kahoot)",
      "Model United Nations Programme Leadership  |  Safeguarding & Child Protection Awareness",
      "Parent Communication & Student Progress Reporting  |  Podcasting & Educational Content Creation",
      "Distance & Blended Learning  |  Bilingual Communication: English (C1, IELTS 7) & Native Arabic",
    ]),

    // Certifications
    sectionTitle("Certifications"),
    ...bullets([
      "Certified Professional Teaching License (Social Studies, Cycle 3), UAE MoE \u2014 Valid until Feb 2029",
      "IELTS Academic Band 7 \u2014 Valid until Aug 2027",
      "HMH Differentiate with Small Groups \u2014 Apr 2026  |  Ready to Wrestle, UWW \u2014 Feb 2026",
      "AI for Educators (Level 1), Teachy \u2014 Oct 2025  |  Network Fundamentals & Security \u2014 Jun 2025",
      "Fire Warden (Level 2) \u2014 until Aug 2026",
      "Manuscript Verification, Bibliotheca Alexandrina \u2014 Nov 2021  |  Critical Thinking, LinkedIn \u2014 Jul 2021",
    ]),

    // Educational Initiatives
    sectionTitle("Educational Initiatives"),

    ...job("Creator & Host \u2014 Echoes of Wisdom Podcast", "Independent Educational Initiative", "2026 \u2013 Present",
      ["Bilingual (Arabic/English) philosophy podcast with 16 episodes across 2 seasons. Bridges academic philosophy and public discourse."]
    ),

    ...job("Founder \u2014 Studio of Phronesis", "Educational Content & Software Platform Studio", "2024 \u2013 Present",
      ["Built MSCS Academy (130 lessons, 390+ activities), DiplomatiQ (MUN with AI evaluation), and bilingual mathematics guides (Grades 1\u20134)."]
    ),

    ...job("Co-Founder & Member \u2014 Educational Youth Club", "Bibliotheca Alexandrina, Alexandria, Egypt", "Oct 2013 \u2013 Dec 2018",
      ["Co-founded a youth club promoting environmental awareness and critical thinking; participated in YESBU, LYM, and ALYM programmes."]
    ),

    ...job("General Coordinator \u2014 Waste Segregation Initiative", "Bibliotheca Alexandrina & Alexandria Governorate, Egypt", "Feb 2015 \u2013 Feb 2017",
      ["Managed logistics and outreach for a citywide environmental awareness initiative targeting youth and local schools."]
    ),

    // Additional
    sectionTitle("Languages, Affiliations & Interests"),
    ...bullets([
      "Languages: Arabic (Native), English (C1, IELTS 7), Urdu (Beginner), Spanish (Beginner)",
      "Affiliations: Member, British Philosophical Association (BPA) \u2014 2025 to Present",
      "Sports Coaching: Strength & Conditioning Coach, Swift Football Academy, Al Ain (2023\u20132024)",
      "Conference Organisation: Co-organised the 3rd Annual International Conference, Dept. of Philosophy, Alexandria University (Nov 2017)",
      "Technical Skills: CompTIA (A+, Network+, Linux+), Microsoft Office, Google Workspace, EdTech Platforms",
    ]),
  ];

  return new Document({
    creator: "Ahmed Ali", title: "Ahmed Ali \u2014 Teaching Resume",
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
