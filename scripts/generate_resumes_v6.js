#!/usr/bin/env node
/**
 * Resume v6 — Fixed font sizes, spacing, and section splitting.
 * 
 * Key fixes:
 * 1. Font sizes: sidebar 10pt (size:20), main body 11pt (size:22), headings 11pt
 * 2. Line spacing: 276 twips (13.8pt) — comfortable, professional
 * 3. Paragraph spacing: 80-120 twips after bullets, 300+ before headings
 * 4. Section integrity: keepNext + keepLines on section content to prevent splitting
 * 5. All original content preserved — no deletions
 */

const {
  Document, Packer, Paragraph, TextRun, AlignmentType,
  BorderStyle, ExternalHyperlink,
  Table, TableRow, TableCell, WidthType, ShadingType, convertInchesToTwip,
  VerticalAlign,
} = require("docx");
const fs = require("fs");

const C = {
  navy: "1A2332", teal: "2C6E6F", ink: "2D2D2D", graphite: "555555",
  mist: "888888", silver: "AAAAAA", sidebarBg: "F8F6F3", line: "D4CFC8",
};
const F = "Georgia", S = "Helvetica";

// ─── Font size constants (half-points) ──────────────────────────────────────
const SZ = {
  name: 32,        // 16pt
  role: 18,        // 9pt
  sidebarLabel: 18, // 9pt
  sidebarItem: 20,  // 10pt
  sidebarLink: 18,  // 9pt
  mainHeading: 22,  // 11pt
  jobTitle: 22,     // 11pt
  jobOrg: 20,       // 10pt
  jobPeriod: 18,    // 9pt
  body: 22,         // 11pt
  bullet: 22,       // 11pt
  pubTitle: 22,     // 11pt
  pubMeta: 18,      // 9pt
};

// ─── Spacing constants (twips) ──────────────────────────────────────────────
const SP = {
  lineHeight: 276,    // 13.8pt — comfortable
  bulletAfter: 100,   // 5pt between bullets
  headingBefore: 360, // 18pt before section headings
  headingAfter: 80,   // 4pt after heading text
  ruleAfter: 120,     // 6pt after the rule line
  jobBefore: 200,     // 10pt before each job entry
  jobTitleAfter: 40,  // 2pt after title
  jobOrgAfter: 40,    // 2pt after org/period line
  sidebarLabelBefore: 300, // 15pt before sidebar labels
  sidebarLabelAfter: 80,   // 4pt after label
  sidebarItemAfter: 60,    // 3pt between sidebar items
  sidebarRuleAfter: 100,   // 5pt after sidebar rule
};

function t(text, o = {}) {
  return new TextRun({ text, font: o.font || F, size: o.size || SZ.body, color: o.color || C.ink, bold: o.bold || false, italics: o.italics || false, characterSpacing: o.spacing || 0 });
}
function ln(url, text, color = C.teal) {
  return new ExternalHyperlink({ link: url, children: [new TextRun({ text, font: S, size: SZ.sidebarLink, color, underline: { type: "single", color } })] });
}

// ─── Sidebar helpers ────────────────────────────────────────────────────────
function sidebarLabel(text) {
  return new Paragraph({
    spacing: { before: SP.sidebarLabelBefore, after: SP.sidebarLabelAfter, line: SP.lineHeight },
    keepNext: true,
    children: [t(text.toUpperCase(), { font: S, size: SZ.sidebarLabel, color: C.mist, bold: true, spacing: 60 })],
  });
}
function sidebarRule() {
  return new Paragraph({
    spacing: { after: SP.sidebarRuleAfter, line: SP.lineHeight },
    keepNext: true,
    border: { bottom: { color: C.line, space: 1, style: BorderStyle.SINGLE, size: 3 } },
    children: [new TextRun({ text: "" })],
  });
}
function sidebarItem(text, opts = {}) {
  return new Paragraph({
    spacing: { after: opts.after || SP.sidebarItemAfter, line: SP.lineHeight },
    keepLines: true,
    children: [t(text, { font: S, size: SZ.sidebarItem, color: C.graphite })],
  });
}
function sidebarItemBold(label, value) {
  return new Paragraph({
    spacing: { after: SP.sidebarItemAfter, line: SP.lineHeight },
    keepLines: true,
    children: [
      t(label, { font: S, size: SZ.sidebarItem, color: C.navy, bold: true }),
      t(" " + value, { font: S, size: SZ.sidebarItem, color: C.graphite }),
    ],
  });
}
function sidebarLink(url, text) {
  return new Paragraph({
    spacing: { after: SP.sidebarItemAfter, line: SP.lineHeight },
    keepLines: true,
    children: [ln(url, text)],
  });
}

// ─── Main column helpers ───────────────────────────────────────────────────
function mainHeading(text) {
  return [
    new Paragraph({
      spacing: { before: SP.headingBefore, after: SP.headingAfter, line: SP.lineHeight },
      keepNext: true,
      children: [t(text.toUpperCase(), { font: S, size: SZ.mainHeading, color: C.navy, bold: true, spacing: 80 })],
    }),
    new Paragraph({
      spacing: { after: SP.ruleAfter, line: SP.lineHeight },
      keepNext: true,
      border: { bottom: { color: C.navy, space: 1, style: BorderStyle.SINGLE, size: 6 } },
      children: [new TextRun({ text: "" })],
    }),
  ];
}
function job(title, org, period, bullets) {
  const ch = [
    new Paragraph({
      spacing: { before: SP.jobBefore, after: SP.jobTitleAfter, line: SP.lineHeight },
      keepNext: true,
      children: [t(title, { size: SZ.jobTitle, color: C.navy, bold: true })],
    }),
    new Paragraph({
      spacing: { after: SP.jobOrgAfter, line: SP.lineHeight },
      keepNext: true,
      children: [
        t(org, { size: SZ.jobOrg, color: C.teal, italics: true }),
        t("  \u00B7  ", { size: SZ.jobOrg, color: C.silver }),
        t(period, { font: S, size: SZ.jobPeriod, color: C.mist }),
      ],
    }),
  ];
  for (const b of bullets) {
    ch.push(new Paragraph({
      spacing: { after: SP.bulletAfter, line: SP.lineHeight },
      indent: { left: 240, hanging: 140 },
      alignment: AlignmentType.JUSTIFIED,
      keepLines: true,
      children: [
        t("\u2013  ", { size: SZ.bullet, color: C.teal }),
        t(b, { size: SZ.bullet }),
      ],
    }));
  }
  return ch;
}
function bullets(items) {
  return items.map(i => new Paragraph({
    spacing: { after: SP.bulletAfter, line: SP.lineHeight },
    indent: { left: 240, hanging: 140 },
    alignment: AlignmentType.JUSTIFIED,
    keepLines: true,
    children: [
      t("\u2013  ", { size: SZ.bullet, color: C.teal }),
      t(i, { size: SZ.bullet }),
    ],
  }));
}

// ─── Two-column table ───────────────────────────────────────────────────────
function twoColumn(sidebar, main) {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE },
      left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE },
      insideHorizontal: { style: BorderStyle.NONE },
      insideVertical: { style: BorderStyle.SINGLE, size: 2, color: C.line },
    },
    rows: [
      new TableRow({
        cantSplit: false,
        children: [
          new TableCell({
            width: { size: 34, type: WidthType.PERCENTAGE },
            margins: { top: 400, bottom: 400, left: 360, right: 300 },
            shading: { type: ShadingType.CLEAR, fill: C.sidebarBg },
            verticalAlign: VerticalAlign.TOP,
            children: sidebar,
          }),
          new TableCell({
            width: { size: 66, type: WidthType.PERCENTAGE },
            margins: { top: 400, bottom: 400, left: 400, right: 360 },
            verticalAlign: VerticalAlign.TOP,
            children: main,
          }),
        ],
      }),
    ],
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// OPERATIONS RESUME
// ═══════════════════════════════════════════════════════════════════════════

function buildOps() {
  const sidebar = [
    // Name
    new Paragraph({ spacing: { before: 0, after: 20, line: SP.lineHeight }, children: [t("AHMED", { size: SZ.name, color: C.navy, bold: true, spacing: 30 })] }),
    new Paragraph({ spacing: { after: 60, line: SP.lineHeight }, children: [t("ALI", { size: SZ.name, color: C.teal, bold: true, spacing: 30 })] }),
    new Paragraph({ spacing: { after: 20, line: SP.lineHeight }, children: [t("Operations Leader", { font: S, size: SZ.role, color: C.graphite })] }),
    new Paragraph({ spacing: { after: 20, line: SP.lineHeight }, children: [t("Author", { font: S, size: SZ.role, color: C.graphite })] }),
    new Paragraph({ spacing: { after: 20, line: SP.lineHeight }, children: [t("Systems Architect", { font: S, size: SZ.role, color: C.graphite })] }),
    new Paragraph({ spacing: { after: 20, line: SP.lineHeight }, children: [t("Educator", { font: S, size: SZ.role, color: C.graphite })] }),

    // Contact
    sidebarLabel("Contact"), sidebarRule(),
    sidebarItem("Abu Dhabi, UAE"),
    sidebarItem("+971 56 166 9766"),
    new Paragraph({ spacing: { after: SP.sidebarItemAfter, line: SP.lineHeight }, keepLines: true, children: [ln("mailto:ahmedmahmoudsaeed98@gmail.com", "ahmedmahmoudsaeed98@gmail.com")] }),

    // Digital Presence
    sidebarLabel("Digital Presence"), sidebarRule(),
    sidebarLink("https://ahmed-ali-ops.vercel.app/", "Professional Portfolio"),
    sidebarLink("https://phronesis-studio.com/", "Studio of Phronesis"),
    sidebarLink("https://mr-ahmed-ali.vercel.app/", "Academic Portfolio"),
    sidebarLink("https://linkedin.com/in/ahmedmahmoudsaeedahmedali", "LinkedIn Profile"),
    sidebarLink("https://www.amazon.com/author/ahmed-ali", "Amazon Author Page"),
    sidebarLink("https://phronesis-studio.com/en/publications/depth-of-knowledge", "Book Details Page"),

    // Education
    sidebarLabel("Education"), sidebarRule(),
    sidebarItemBold("PGDE in Education", ""),
    sidebarItem("Al-Azhar University"),
    sidebarItem("Sep 2024 \u2013 Sep 2025", { after: 80 }),
    sidebarItemBold("BA in Philosophy", ""),
    sidebarItem("Alexandria University"),
    sidebarItem("Sep 2016 \u2013 May 2021"),

    // Languages
    sidebarLabel("Languages"), sidebarRule(),
    sidebarItemBold("Arabic", "\u2014 Native"),
    sidebarItemBold("English", "\u2014 C1 (IELTS 7)"),
    sidebarItemBold("Urdu", "\u2014 Beginner"),
    sidebarItemBold("Spanish", "\u2014 Beginner"),

    // Certifications
    sidebarLabel("Certifications"), sidebarRule(),
    sidebarItem("Teaching License (Social Studies, Cycle 3), UAE MoE \u2014 until Feb 2029"),
    sidebarItem("IELTS Academic Band 7 \u2014 until Aug 2027"),
    sidebarItem("ISO 9001 & 45001 Internal Auditor"),
    sidebarItem("AI for Educators (Level 1), Teachy \u2014 Oct 2025"),
    sidebarItem("Network Fundamentals & Security, Mahara Tech \u2014 Jun 2025"),
    sidebarItem("Advanced PIC, Dubai Municipality \u2014 May 2025"),
    sidebarItem("Fire Warden (Level 2), Dubai Civil Defence \u2014 until Aug 2026"),
    sidebarItem("Sales Excellence, e& Etisalat \u2014 Apr 2024"),
    sidebarItem("Frontline for Retail Sales, e& Etisalat \u2014 Aug 2022"),
    sidebarItem("Manuscript Verification, Bibliotheca Alexandrina \u2014 Nov 2021"),
    sidebarItem("Critical Thinking & Decision Making, LinkedIn \u2014 Jul 2021"),

    // Technical Skills
    sidebarLabel("Technical Skills"), sidebarRule(),
    sidebarItem("CompTIA A+, Network+, Linux+"),
    sidebarItem("Microsoft Office Suite"),
    sidebarItem("Google Workspace"),
    sidebarItem("HMH, Alef, Paradigm"),
    sidebarItem("MS Teams, Google Classroom"),
    sidebarItem("Canva, Teachy"),

    // Affiliations
    sidebarLabel("Affiliations"), sidebarRule(),
    sidebarItem("British Philosophical Association (BPA)"),
    sidebarItem("2025 \u2013 Present"),

    // Interests
    sidebarLabel("Interests"), sidebarRule(),
    sidebarItem("Strength & Conditioning Coach"),
    sidebarItem("Swift Football Academy, Al Ain"),
    sidebarItem("2023 \u2013 2024"),
  ];

  const main = [
    ...mainHeading("Profile"),
    new Paragraph({ spacing: { after: 120, line: SP.lineHeight }, alignment: AlignmentType.JUSTIFIED, keepLines: true, children: [t(
      "High-impact Operations Leader, Author, and Systems Architect with 8+ years of progressive experience driving operational excellence, revenue growth, and team performance across Academia, Retail, Contact Centers, Telecommunications, and Family Entertainment sectors in the UAE, UK, and Egypt. Proven track record of achieving 21% year-one revenue growth despite a decline in footfall, securing four rapid promotions with three salary increments and early completion of probation within a single organization, and introducing performance frameworks that became organizational benchmarks. Experienced Internal Auditor (ISO 9001 & ISO 45001) with expertise in compliance, process optimization, and multi-site operations. Author of \"Depth of Knowledge: A Practical Guide to Designing Rigorous Questions Without AI\" (2026). Founder of Studio of Phronesis, building production-grade software systems for education and real estate. Bilingual in Arabic (native) and English (Academic IELTS Band 7).",
      { size: SZ.body })] }),

    ...mainHeading("Professional Experience"),

    ...job("English Social Studies Teacher", "Al Nahda National School for Boys, Abu Dhabi, UAE", "Aug 2026 \u2013 Present",
      ["Teaching English Social Studies at Al Nahda National School for Boys, commencing the 2026/2027 academic year."]
    ),

    ...job("MSC Studies and Islamic Education B Teacher and Lead of Non-Arabic Speaking Section", "Ain Al Khaleej Private School, American Division, UAE", "Sep 2025 \u2013 Jul 2026",
      [
        "Oversee the Non-Arabic Studies department, managing Social Studies and Islamic Education delivery for non-Arabic speakers across Grades 1\u201312, ensuring alignment with ADEK and Irtiqa'a quality standards.",
        "Lead curriculum design, lesson planning, and differentiated instruction strategies for diverse learner profiles including ELLs and gifted students, driving strong attainment and inclusive progress.",
        "Appointed Faculty Head for Model United Nations (MUN) programme (2025/2026 and 2026/2027), directing student preparation, debate coaching, and cross-school event coordination.",
        "Champion integration of educational technology platforms (HMH, Alef, Paradigm, MS Teams, Google Classroom, Canva, Teachy) to enhance personalized, data-driven learning outcomes.",
        "Collaborate with cross-curricular teams to embed critical thinking, cultural literacy, and global citizenship across the school curriculum.",
        "Pioneered expert-level distance and blended learning delivery during school closures, maintaining full curriculum continuity and student engagement.",
        "Coached the school delegation to win Best School at MANORMUN V 2026, developing students' diplomatic reasoning, research writing, and public speaking.",
        "Active contributor to the school's \"Student First\" initiative and a campus-wide source of mentorship and emotional support for students beyond his own classes.",
        "Manage parent communication, student progress reporting, and stakeholder engagement to support holistic student development.",
      ]
    ),

    ...job("Branch Operations Manager", "Cheeky Monkeys Playland LLC, UAE", "May 2024 \u2013 Sep 2025",
      [
        "Achieved 21% revenue growth in the first year despite a decline in footfall, by optimizing service packages, enhancing client acquisition strategies, and strengthening vendor partnerships.",
        "Earned four rapid promotions, three salary increments, and early completion of probation within one year in recognition of outstanding business performance and leadership.",
        "Oversaw daily operations of a 1,700 sqm child-focused facility, directing a cross-functional team of 12 across customer service, food operations, and event planning.",
        "Maintained full compliance with ISO 9001 and ISO 45001 standards, ensuring safe, efficient, and high-quality operations.",
        "Negotiated with procurement partners and vendors to reduce operational costs while maintaining service quality, directly increasing profitability.",
        "Partnered with senior leadership on strategic planning, staffing, financial forecasting, and branch expansion initiatives.",
        "Developed tailored client proposals that secured new business and long-term partnerships, serving as the primary point of contact for prospective clients.",
        "Delivered regular performance reports and spearheaded continuous improvement initiatives in team productivity and customer satisfaction.",
      ]
    ),

    ...job("Sales Executive and Duty Manager", "e& Etisalat UAE, Al Ain Mall Branch, Abu Dhabi, UAE", "Jul 2022 \u2013 Jun 2024",
      [
        "Ranked as the highest-performing executive in 2023 at Al Ain Mall Branch, outperforming sales KPIs and consistently leading in customer engagement metrics.",
        "Introduced Net Promoter Score (NPS) to Etisalat branch operations, and personally designed and led the first internal training sessions, setting a new standard for customer satisfaction tracking across the network.",
        "Frequently selected to serve as Acting Duty Manager, overseeing branch operations, resolving escalations, and guiding daily team activity in the absence of senior management.",
        "Mentored junior staff in product knowledge, upselling techniques, and customer service best practices, contributing to overall team performance improvement.",
        "Recognized by senior executives for excellence in performance, professionalism, and service delivery.",
        "Earned internal certifications: Frontline for Retail Sales (2022) and Mastering Sales Excellence (2024).",
        "Played a key role in implementing customer-centric strategies that improved loyalty and enhanced overall branch performance.",
      ]
    ),

    ...job("International Account Advisor", "Vodafone UK, Remote", "Mar 2019 \u2013 Jul 2022",
      [
        "Managed a high-volume portfolio of UK-based customer accounts, delivering exceptional service in telecom product support, billing inquiries, and complex issue resolution.",
        "Provided peer mentoring and training to new team members, enhancing overall team performance and accelerating onboarding processes.",
        "Consistently met daily performance targets and service-level agreements (SLAs) while maintaining high customer satisfaction and retention rates.",
        "Adapted communication style to diverse audiences, fostering positive relationships with clients and colleagues across cultural contexts.",
        "Strengthened organizational and time management skills in a fast-paced, target-driven contact center environment.",
      ]
    ),

    ...job("Team Leader", "FEED, Alexandria, Egypt", "Feb 2017 \u2013 Feb 2019",
      [
        "Led multiple divisions including Natural Products, Sports, Plants, Carpentry, Translation, and Public Relations within a community permaculture initiative.",
        "Managed and mentored a diverse team of volunteers, coordinating task assignments and ensuring effective multi-disciplinary project delivery.",
        "Developed and implemented structured programmes promoting sustainability, environmental education, and community engagement.",
        "Conducted regular performance evaluations and provided coaching to improve participant skills, motivation, and project outcomes.",
        "Oversaw public relations efforts, increasing project visibility and community participation through targeted outreach campaigns.",
      ]
    ),

    ...job("Research Assistant and Translator", "Emory University (with Ustadh Dr. Rahimjon Abdugafurov)", "2017",
      ["Transcribed and analyzed historical manuscripts in Islamic Civilization with a focus on philosophical and theological contexts. Produced English\u2013Arabic translations of academic works for use in bilingual educational settings and contributed scholarly material."]
    ),

    ...mainHeading("Publication"),
    new Paragraph({ spacing: { before: 120, after: 40, line: SP.lineHeight }, keepNext: true, children: [t("Depth of Knowledge: A Practical Guide to Designing Rigorous Questions Without AI", { size: SZ.pubTitle, color: C.navy, bold: true, italics: true })] }),
    new Paragraph({ spacing: { after: 60, line: SP.lineHeight }, keepNext: true, children: [t("Self-published, First Edition, 2026  |  ISBN: 979-8-1913137-5-7  |  149 pages  |  Paperback $19.99, eBook $9.99", { font: S, size: SZ.pubMeta, color: C.mist })] }),
    new Paragraph({ spacing: { after: 80, line: SP.lineHeight }, keepNext: true, children: [t("Available globally on Amazon. ", { size: SZ.body }), ln("https://www.amazon.com/author/ahmed-ali", "Buy on Amazon"), t("   |   ", { font: S, size: SZ.pubMeta, color: C.silver }), ln("https://phronesis-studio.com/en/publications/depth-of-knowledge", "Book Details")] }),
    new Paragraph({ spacing: { after: 80, line: SP.lineHeight }, alignment: AlignmentType.JUSTIFIED, keepLines: true, children: [t("A handbook that restores to educators the craft of writing cognitively demanding questions from lesson content alone, without relying on AI tools. Grounded in Norman Webb's Depth of Knowledge framework, returns to his original 1997 and 2002 monographs as primary sources, and corrects the widespread misinterpretation perpetuated by the unauthorized DOK Wheel. The method is verified by reverse-coding. A substantial chapter traces the principle that recall is not reasoning through the Islamic intellectual tradition, from Al-Hasan al-Basri to Ibn Khaldun.", { size: SZ.body, color: C.graphite, italics: true })] }),

    ...mainHeading("Selected Projects & Initiatives"),

    ...job("Founder & Systems Architect", "Studio of Phronesis", "2024 \u2013 Present",
      [
        "Founded a personal studio producing bilingual educational content and production-grade software platforms.",
        "Built Real Estate Emperor: property management SaaS managing 400+ units live, 4 roles, 4 languages.",
        "Built MSCS Academy: 130 lessons, 390+ activities, UAE curriculum-aligned learning platform.",
        "Built DiplomatiQ: MUN operating system with seven-tier competency framework and AI evaluation.",
        "Built Al Ain Real Estate: production listings site for a live broker client.",
      ]
    ),

    ...job("Creator & Host \u2014 Echoes of Wisdom Podcast", "Independent Educational Initiative", "2026 \u2013 Present",
      [
        "Produces and hosts a bilingual (Arabic/English) philosophy podcast with 16 episodes across 2 seasons.",
        "Bridges academic philosophy and public discourse, making complex ideas in ethics, logic, and epistemology understandable and actionable.",
      ]
    ),

    ...job("Co-Founder & Member \u2014 Educational Youth Club", "Bibliotheca Alexandrina, Alexandria, Egypt", "Oct 2013 \u2013 Dec 2018",
      [
        "Co-founded an educational youth club in partnership with Bibliotheca Alexandrina to promote environmental awareness, critical thinking, and community engagement among high school students.",
        "Participated in multiple student programmes including YESBU, LYM (League of Young Masters), and ALYM (African League of Young Masters).",
      ]
    ),

    ...job("General Coordinator \u2014 Waste Segregation Initiative", "Bibliotheca Alexandrina & Alexandria Governorate, Egypt", "Feb 2015 \u2013 Feb 2017",
      ["Managed logistics and outreach for a citywide environmental awareness initiative targeting youth and local schools, collaborating with local government and educators."]
    ),

    ...job("Co-Organiser \u2014 3rd Annual International Conference, Department of Philosophy", "Alexandria University, Egypt", "Nov 2017",
      ["Co-organised the international conference on philosophical reading, creativity, and critical criticism."]
    ),
  ];

  return new Document({
    creator: "Ahmed Ali", title: "Ahmed Ali \u2014 Operations Resume",
    styles: { default: { document: { run: { font: F, size: SZ.body }, paragraph: { spacing: { line: SP.lineHeight } } } } },
    sections: [{ properties: { page: { margin: { top: 0, bottom: 400, left: 0, right: 0 } } }, children: [twoColumn(sidebar, main)] }],
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// TEACHING RESUME
// ═══════════════════════════════════════════════════════════════════════════

function buildTeach() {
  const sidebar = [
    new Paragraph({ spacing: { before: 0, after: 20, line: SP.lineHeight }, children: [t("AHMED", { size: SZ.name, color: C.navy, bold: true, spacing: 30 })] }),
    new Paragraph({ spacing: { after: 60, line: SP.lineHeight }, children: [t("ALI", { size: SZ.name, color: C.teal, bold: true, spacing: 30 })] }),
    new Paragraph({ spacing: { after: 20, line: SP.lineHeight }, children: [t("Humanities Educator", { font: S, size: SZ.role, color: C.graphite })] }),
    new Paragraph({ spacing: { after: 20, line: SP.lineHeight }, children: [t("Philosopher", { font: S, size: SZ.role, color: C.graphite })] }),
    new Paragraph({ spacing: { after: 20, line: SP.lineHeight }, children: [t("Author", { font: S, size: SZ.role, color: C.graphite })] }),

    sidebarLabel("Contact"), sidebarRule(),
    sidebarItem("Abu Dhabi, UAE"),
    sidebarItem("+971 56 166 9766"),
    new Paragraph({ spacing: { after: SP.sidebarItemAfter, line: SP.lineHeight }, keepLines: true, children: [ln("mailto:ahmed.ali.academic@gmail.com", "ahmed.ali.academic@gmail.com")] }),

    sidebarLabel("Digital Presence"), sidebarRule(),
    sidebarLink("https://mr-ahmed-ali.vercel.app/", "Academic Portfolio"),
    sidebarLink("https://phronesis-studio.com/", "Studio of Phronesis"),
    sidebarLink("https://ahmed-ali-ops.vercel.app/", "Professional Portfolio"),
    sidebarLink("https://linkedin.com/in/ahmedmahmoudsaeedahmedali", "LinkedIn Profile"),
    sidebarLink("https://www.amazon.com/author/ahmed-ali", "Amazon Author Page"),
    sidebarLink("https://phronesis-studio.com/en/publications/depth-of-knowledge", "Book Details Page"),

    sidebarLabel("Education"), sidebarRule(),
    sidebarItemBold("PGDE in Education", ""),
    sidebarItem("Al-Azhar University"),
    sidebarItem("Sep 2024 \u2013 Sep 2025  (Very Good)", { after: 80 }),
    sidebarItemBold("BA in Philosophy", ""),
    sidebarItem("Alexandria University"),
    sidebarItem("Sep 2016 \u2013 May 2021  (Good)"),

    sidebarLabel("Credentials"), sidebarRule(),
    sidebarItem("UAE Teaching License"),
    sidebarItem("Social Studies, Cycle 3"),
    sidebarItem("Valid until Feb 2029", { after: 80 }),
    sidebarItem("ADEK Approved"),
    sidebarItem("MSC & Islamic Education"),

    sidebarLabel("Languages"), sidebarRule(),
    sidebarItemBold("Arabic", "\u2014 Native"),
    sidebarItemBold("English", "\u2014 C1 (IELTS 7)"),
    sidebarItemBold("Urdu", "\u2014 Beginner"),
    sidebarItemBold("Spanish", "\u2014 Beginner"),

    sidebarLabel("Certifications"), sidebarRule(),
    sidebarItem("IELTS Academic Band 7 \u2014 until Aug 2027"),
    sidebarItem("HMH Differentiate with Small Groups \u2014 Apr 2026"),
    sidebarItem("Ready to Wrestle, UWW \u2014 Feb 2026"),
    sidebarItem("AI for Educators (Level 1), Teachy \u2014 Oct 2025"),
    sidebarItem("Network Fundamentals & Security \u2014 Jun 2025"),
    sidebarItem("Fire Warden (Level 2) \u2014 until Aug 2026"),
    sidebarItem("Manuscript Verification, Bibliotheca Alexandrina \u2014 Nov 2021"),
    sidebarItem("Critical Thinking, LinkedIn \u2014 Jul 2021"),

    sidebarLabel("Technical Skills"), sidebarRule(),
    sidebarItem("CompTIA A+, Network+, Linux+"),
    sidebarItem("Microsoft Office Suite, Google Workspace"),
    sidebarItem("HMH, Alef, Paradigm"),
    sidebarItem("MS Teams, Google Classroom"),
    sidebarItem("Canva, Teachy"),
    sidebarItem("Plickers, Kahoot, Google Forms"),

    sidebarLabel("Affiliations"), sidebarRule(),
    sidebarItem("British Philosophical Association (BPA)"),
    sidebarItem("2025 \u2013 Present"),

    sidebarLabel("Interests"), sidebarRule(),
    sidebarItem("Strength & Conditioning Coach"),
    sidebarItem("Swift Football Academy, Al Ain"),
    sidebarItem("2023 \u2013 2024", { after: 80 }),
    sidebarItem("Conference Organisation:"),
    sidebarItem("3rd Annual International Conference, Dept. of Philosophy, Alexandria University (Nov 2017)"),
  ];

  const main = [
    ...mainHeading("Profile"),
    new Paragraph({ spacing: { after: 120, line: SP.lineHeight }, alignment: AlignmentType.JUSTIFIED, keepLines: true, children: [t(
      "ADEK-approved Social Studies and Islamic Education teacher with demonstrated expertise across Grades 1\u201312 in the American Curriculum. Skilled in inquiry-driven lesson design, effective differentiation for ELLs and gifted learners, and both in-class and distance learning delivery. Experienced in leading Model United Nations programmes, integrating educational technology platforms (HMH, Alef, Paradigm, MS Teams, Google Classroom, Canva, Teachy), and fostering critical thinking, cultural literacy, and global citizenship. Author of \"Depth of Knowledge: A Practical Guide to Designing Rigorous Questions Without AI\" (2026). Holds a valid UAE Teaching License and Academic IELTS Band 7.",
      { size: SZ.body })] }),

    ...mainHeading("Professional Experience"),

    ...job("English Social Studies Teacher", "Al Nahda National School for Boys, Abu Dhabi, UAE", "Aug 2026 \u2013 Present",
      ["Teaching English Social Studies at Al Nahda National School for Boys, commencing the 2026/2027 academic year."]
    ),

    ...job("MSC Studies and Islamic Education B Teacher and Lead of Non-Arabic Speaking Section", "Ain Al Khaleej Private School, American Curriculum, UAE", "Sep 2025 \u2013 Jul 2026",
      [
        "Delivers inquiry-based, standards-aligned Social Studies and Islamic Education lessons meeting ADEK and Irtiqa'a quality expectations across Grades 1\u20139.",
        "Designs and executes differentiated instruction for ELLs and gifted learners, ensuring strong attainment and inclusive progress for all ability levels.",
        "Promoted from Subject Teacher to Lead of Non-Arabic Speaking Section in Term 2.",
        "Appointed Faculty Head for Model United Nations (MUN) programme (2025/2026 academic year), overseeing student preparation, debate coaching, and event coordination.",
        "Coached the school delegation to win Best School at MANORMUN V 2026, developing students' diplomatic reasoning, research writing, and public speaking.",
        "Pioneered expert-level distance learning delivery via Microsoft Teams, Google Classroom, Canva, and Teachy during school closures, maintaining full curriculum continuity and student engagement.",
        "Integrates leading educational platforms including HMH, Alef, and Paradigm into daily instruction to enhance personalised and data-driven learning.",
        "Collaborates with cross-curricular teams to embed critical thinking, cultural literacy, and global citizenship across the curriculum.",
        "Active contributor to the school's \"Student First\" initiative and a campus-wide source of mentorship and emotional support for students.",
      ]
    ),

    ...job("Branch Operations Manager (ISO-Certified Child-Focused Facility)", "Cheeky Monkeys Playland LLC, UAE", "May 2024 \u2013 Sep 2025",
      [
        "Led a safe, child-centered learning environment, designing and supervising engaging activities (arts, crafts, structured play) that support early childhood development, creativity, and social skills.",
        "Ensured quality, safety, and staff development in a child-focused setting, applying ISO 9001 and ISO 45001 standards while training and guiding staff to maintain high educational and wellbeing standards.",
      ]
    ),

    ...job("Research Assistant and Translator", "Emory University (with Ustadh Dr. Rahimjon Abdugafurov)", "2017",
      ["Transcribed and analyzed historical manuscripts in Islamic Civilization with a focus on philosophical and theological contexts. Produced English\u2013Arabic translations of academic works for use in bilingual educational settings and contributed scholarly material."]
    ),

    ...mainHeading("Publication"),
    new Paragraph({ spacing: { before: 120, after: 40, line: SP.lineHeight }, keepNext: true, children: [t("Depth of Knowledge: A Practical Guide to Designing Rigorous Questions Without AI", { size: SZ.pubTitle, color: C.navy, bold: true, italics: true })] }),
    new Paragraph({ spacing: { after: 60, line: SP.lineHeight }, keepNext: true, children: [t("Self-published, First Edition, 2026  |  ISBN: 979-8-1913137-5-7  |  149 pages  |  Paperback $19.99, eBook $9.99", { font: S, size: SZ.pubMeta, color: C.mist })] }),
    new Paragraph({ spacing: { after: 80, line: SP.lineHeight }, keepNext: true, children: [t("Available globally on Amazon. ", { size: SZ.body }), ln("https://www.amazon.com/author/ahmed-ali", "Buy on Amazon"), t("   |   ", { font: S, size: SZ.pubMeta, color: C.silver }), ln("https://phronesis-studio.com/en/publications/depth-of-knowledge", "Book Details")] }),
    new Paragraph({ spacing: { after: 80, line: SP.lineHeight }, alignment: AlignmentType.JUSTIFIED, keepLines: true, children: [t("A handbook that restores to educators the craft of writing cognitively demanding questions from lesson content alone, without relying on AI tools. Grounded in Norman Webb's Depth of Knowledge framework, returns to his original 1997 and 2002 monographs as primary sources, and corrects the widespread misinterpretation perpetuated by the unauthorized DOK Wheel. The method is verified by reverse-coding. Includes 12 chapters, 11 printable classroom resources, a verb-agnostic question stem library, and worked examples across seven subjects. A substantial chapter traces the principle that recall is not reasoning through the Islamic intellectual tradition, from Al-Hasan al-Basri to Ibn Khaldun.", { size: SZ.body, color: C.graphite, italics: true })] }),

    ...mainHeading("Core Competencies"),
    ...bullets([
      "Lesson Planning & Curriculum Design (British, IB, American, UAE MoE)",
      "Inquiry-Based Learning & Student-Centered Instruction",
      "Differentiated Instruction & Inclusive Education Practices",
      "Classroom Management & Behavior Management",
      "Safeguarding & Child Protection Awareness",
      "Educational Technology Integration (Google Classroom, MS Teams, Google Forms, Plickers, Kahoot)",
      "Parent Communication & Student Progress Reporting",
      "Distance & Blended Learning (MS Teams, Google Classroom, Canva)",
      "Podcasting & Educational Content Creation",
      "Model United Nations (MUN) Programme Leadership",
    ]),

    ...mainHeading("Educational Initiatives"),

    ...job("Creator & Host \u2014 Echoes of Wisdom Podcast", "Independent Educational Initiative", "2026 \u2013 Present",
      [
        "Produces and hosts a podcast dedicated to promoting Philosophy as an accessible field of education with practical relevance to everyday life, critical thinking, and personal development.",
        "Bridges academic philosophy and public discourse, making complex ideas in ethics, logic, and epistemology understandable and actionable for diverse audiences.",
      ]
    ),

    ...job("Co-Founder & Member \u2014 Educational Youth Club", "Bibliotheca Alexandrina, Alexandria, Egypt", "Oct 2013 \u2013 Dec 2018",
      [
        "Co-founded an educational youth club in partnership with Bibliotheca Alexandrina to promote environmental awareness, critical thinking, and community engagement among high school students.",
        "Participated in multiple student programmes including YESBU, LYM (League of Young Masters), and ALYM (African League of Young Masters).",
      ]
    ),

    ...job("General Coordinator \u2014 Waste Segregation Initiative", "Bibliotheca Alexandrina & Alexandria Governorate, Egypt", "Feb 2015 \u2013 Feb 2017",
      ["Managed logistics and outreach for a citywide environmental awareness initiative targeting youth and local schools, collaborating with local government and educators."]
    ),
  ];

  return new Document({
    creator: "Ahmed Ali", title: "Ahmed Ali \u2014 Teaching Resume",
    styles: { default: { document: { run: { font: F, size: SZ.body }, paragraph: { spacing: { line: SP.lineHeight } } } } },
    sections: [{ properties: { page: { margin: { top: 0, bottom: 400, left: 0, right: 0 } } }, children: [twoColumn(sidebar, main)] }],
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
