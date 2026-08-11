#!/usr/bin/env node
/**
 * Resume v10 — Full professional detail.
 * Operations: full profile + extensive bullets (user-provided verbatim).
 * Teaching: only Al Nahda, Ain Al Khaleej, Emory in Professional Experience;
 *           expanded publication focus.
 * Languages, Affiliations, Technical Skills each in their own section.
 */

const {
  Document, Packer, Paragraph, TextRun, AlignmentType,
  BorderStyle, ExternalHyperlink, ImageRun,
  Table, TableRow, TableCell, WidthType, VerticalAlign,
} = require("docx");
const fs = require("fs");

const C = {
  navy: "00366D", navyDark: "1B3A5C", ink: "1D1D1D", graphite: "333333",
  gray: "555555", grayMed: "595959", silver: "AAAAAA", white: "FFFFFF",
  line: "D4D4D4", lightBg: "F5F5F5",
};
const BODY = "Calibri";
const HEAD = "EB Garamond";
const EM = "\u2014";
const EN = "\u2013";

function t(text, o = {}) {
  return new TextRun({ text, font: o.font || BODY, size: o.size || 20, color: o.color || C.ink, bold: o.bold || false, italics: o.italics || false });
}
function ln(url, text, color = C.navy) {
  return new ExternalHyperlink({ link: url, children: [new TextRun({ text, font: BODY, size: 18, color, underline: { type: "single", color } })] });
}
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

function headerWithPhoto(photoPath, name, roles, contact, links) {
  const photoData = fs.readFileSync(photoPath);
  const photoRun = new ImageRun({ data: photoData, transformation: { width: 85, height: 90 }, type: "jpg" });
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

    // ── Profile ──────────────────────────────────────────────────────────
    sectionTitle("Profile"),
    new Paragraph({ spacing: { after: 60, line: 264 }, alignment: AlignmentType.JUSTIFIED, keepLines: true, children: [t(
      "High-impact Operations Leader, Author, and Systems Architect with 8+ years of progressive experience driving operational excellence, revenue growth, and team performance across Academia, Retail, Contact Centers, Telecommunications, and Family Entertainment sectors in the UAE, UK, and Egypt. Proven track record of achieving 21% year-one revenue growth despite a decline in footfall, securing four rapid promotions with three salary increments and early completion of probation within a single organization, and introducing performance frameworks that became organizational benchmarks. Experienced Internal Auditor (ISO 9001 & ISO 45001) with expertise in compliance, process optimization, and multi-site operations. Author of \u201CDepth of Knowledge: A Practical Guide to Designing Rigorous Questions Without AI\u201D (2026). Founder of Studio of Phronesis, building production-grade software systems for education and real estate. Bilingual in Arabic (native) and English (Academic IELTS Band 7).",
      { size: 20, color: C.graphite })] }),

    // ── Professional Experience ──────────────────────────────────────────
    sectionTitle("Professional Experience"),

    ...job("English Social Studies Teacher", "Al Nahda National School for Boys, Abu Dhabi, UAE", "Aug 2026 " + EN + " Present",
      [
        "Teaching English Social Studies at Al Nahda National School for Boys, commencing the 2026/2027 academic year.",
      ]
    ),

    ...job("MSC Studies and Islamic Education B Teacher and Lead of Non-Arabic Speaking Section", "Ain Al Khaleej Private School, American Division, UAE", "Sep 2025 " + EN + " Jul 2026",
      [
        "Oversee the Non-Arabic Studies department, managing Social Studies and Islamic Education delivery for non-Arabic speakers across Grades 1" + EN + "12, ensuring alignment with ADEK and Irtiqa'a quality standards.",
        "Lead curriculum design, lesson planning, and differentiated instruction strategies for diverse learner profiles including ELLs and gifted students, driving strong attainment and inclusive progress.",
        "Appointed Faculty Head for Model United Nations (MUN) programme (2025/2026 and 2026/2027), directing student preparation, debate coaching, and cross-school event coordination.",
        "Champion integration of educational technology platforms (HMH, Alef, Paradigm, MS Teams, Google Classroom, Canva, Teachy) to enhance personalized, data-driven learning outcomes.",
        "Collaborate with cross-curricular teams to embed critical thinking, cultural literacy, and global citizenship across the school curriculum.",
        "Pioneered expert-level distance and blended learning delivery during school closures, maintaining full curriculum continuity and student engagement.",
        "Coached the school delegation to win Best School at MANORMUN V 2026, developing students' diplomatic reasoning, research writing, and public speaking.",
        "Active contributor to the school's \u201CStudent First\u201D initiative and a campus-wide source of mentorship and emotional support for students beyond his own classes.",
        "Manage parent communication, student progress reporting, and stakeholder engagement to support holistic student development.",
      ]
    ),

    ...job("Branch Operations Manager", "Cheeky Monkeys Playland LLC, UAE", "May 2024 " + EN + " Sep 2025",
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

    ...job("Sales Executive and Duty Manager", "e& Etisalat UAE, Al Ain Mall Branch, Abu Dhabi, UAE", "Jul 2022 " + EN + " Jun 2024",
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

    ...job("International Account Advisor", "Vodafone UK, Remote", "Mar 2019 " + EN + " Jul 2022",
      [
        "Managed a high-volume portfolio of UK-based customer accounts, delivering exceptional service in telecom product support, billing inquiries, and complex issue resolution.",
        "Provided peer mentoring and training to new team members, enhancing overall team performance and accelerating onboarding processes.",
        "Consistently met daily performance targets and service-level agreements (SLAs) while maintaining high customer satisfaction and retention rates.",
        "Adapted communication style to diverse audiences, fostering positive relationships with clients and colleagues across cultural contexts.",
        "Strengthened organizational and time management skills in a fast-paced, target-driven contact center environment.",
      ]
    ),

    ...job("Team Leader", "FEED, Alexandria, Egypt", "Feb 2017 " + EN + " Feb 2019",
      [
        "Led multiple divisions including Natural Products, Sports, Plants, Carpentry, Translation, and Public Relations within a community permaculture initiative.",
        "Managed and mentored a diverse team of volunteers, coordinating task assignments and ensuring effective multi-disciplinary project delivery.",
        "Developed and implemented structured programmes promoting sustainability, environmental education, and community engagement.",
        "Conducted regular performance evaluations and provided coaching to improve participant skills, motivation, and project outcomes.",
        "Oversaw public relations efforts, increasing project visibility and community participation through targeted outreach campaigns.",
      ]
    ),

    ...job("Research Assistant and Translator", "Emory University (with Ustadh Dr. Rahimjon Abdugafurov)", "2017",
      [
        "Transcribed and analyzed historical manuscripts in Islamic Civilization with a focus on philosophical and theological contexts. Produced English" + EN + "Arabic translations of academic works for use in bilingual educational settings and contributed scholarly material.",
      ]
    ),

    // ── Publication ──────────────────────────────────────────────────────
    sectionTitle("Publication"),
    new Paragraph({ spacing: { before: 60, after: 10 }, keepNext: true, children: [t("Depth of Knowledge: A Practical Guide to Designing Rigorous Questions Without AI", { font: HEAD, size: 22, color: C.navy, bold: true, italics: true })] }),
    new Paragraph({ spacing: { after: 15 }, keepNext: true, children: [t("Self-published, First Edition, 2026  |  ISBN: 979-8-1913137-5-7  |  149 pages  |  Paperback $19.99, eBook $9.99", { size: 18, color: C.gray })] }),
    new Paragraph({ spacing: { after: 30 }, keepNext: true, children: [t("Available globally on Amazon.  ", { size: 19 }), ln("https://www.amazon.com/author/ahmed-ali", "Buy on Amazon"), t("   |   ", { size: 17, color: C.silver }), ln("https://phronesis-studio.com/en/publications/depth-of-knowledge", "Book Details")] }),
    new Paragraph({ spacing: { after: 40, line: 264 }, alignment: AlignmentType.JUSTIFIED, keepLines: true, children: [t("A handbook that restores to educators the craft of writing cognitively demanding questions from lesson content alone, without relying on AI tools. Grounded in Norman Webb's Depth of Knowledge framework, returns to his original 1997 and 2002 monographs as primary sources, and corrects the widespread misinterpretation perpetuated by the unauthorized DOK Wheel. The method is verified by reverse-coding. A substantial chapter traces the principle that recall is not reasoning through the Islamic intellectual tradition, from Al-Hasan al-Basri to Ibn Khaldun.", { size: 19, color: C.grayMed, italics: true })] }),

    // ── Selected Projects & Initiatives ──────────────────────────────────
    sectionTitle("Selected Projects & Initiatives"),

    ...job("Founder & Systems Architect", "Studio of Phronesis", "2024 " + EN + " Present",
      [
        "Founded a personal studio producing bilingual educational content and production-grade software platforms.",
        "Built Real Estate Emperor: property management SaaS managing 400+ units live, 4 roles, 4 languages.",
        "Built MSCS Academy: 130 lessons, 390+ activities, UAE curriculum-aligned learning platform.",
        "Built DiplomatiQ: MUN operating system with seven-tier competency framework and AI evaluation.",
        "Built Al Ain Real Estate: production listings site for a live broker client.",
      ]
    ),

    ...job("Creator & Host " + EM + " Echoes of Wisdom Podcast", "Independent Educational Initiative", "2026 " + EN + " Present",
      [
        "Produces and hosts a bilingual (Arabic/English) philosophy podcast with 16 episodes across 2 seasons.",
        "Bridges academic philosophy and public discourse, making complex ideas in ethics, logic, and epistemology understandable and actionable.",
      ]
    ),

    ...job("Co-Founder & Member " + EM + " Educational Youth Club", "Bibliotheca Alexandrina, Alexandria, Egypt", "Oct 2013 " + EN + " Dec 2018",
      [
        "Co-founded an educational youth club in partnership with Bibliotheca Alexandrina to promote environmental awareness, critical thinking, and community engagement among high school students.",
        "Participated in multiple student programmes including YESBU, LYM (League of Young Masters), and ALYM (African League of Young Masters).",
      ]
    ),

    ...job("General Coordinator " + EM + " Waste Segregation Initiative", "Bibliotheca Alexandrina & Alexandria Governorate, Egypt", "Feb 2015 " + EN + " Feb 2017",
      ["Managed logistics and outreach for a citywide environmental awareness initiative targeting youth and local schools, collaborating with local government and educators."]
    ),

    ...job("Co-Organiser " + EM + " 3rd Annual International Conference, Department of Philosophy", "Alexandria University, Egypt", "Nov 2017",
      ["Co-organised the international conference on philosophical reading, creativity, and critical criticism."]
    ),

    // ── Education ────────────────────────────────────────────────────────
    sectionTitle("Education"),
    new Paragraph({ spacing: { before: 60, after: 8 }, keepNext: true, children: [
      t("Postgraduate Diploma in Education", { font: HEAD, size: 21, color: C.navy, bold: true }),
      t("  |  Al-Azhar University  |  ", { size: 19, color: C.navyDark, italics: true }),
      t("Sep 2024 " + EN + " Sep 2025  (Very Good)", { size: 18, color: C.gray }),
    ] }),
    new Paragraph({ spacing: { after: 20, line: 264 }, keepLines: true, children: [t("Educational psychology and human development, philosophy and history of education, curriculum studies, instructional methodologies, educational administration and planning, micro-teaching and practical teaching experience. Accredited and attested by authorities in Egypt and the UAE, with UAE Ministry of Education equivalency.", { size: 18, color: C.grayMed })] }),
    new Paragraph({ spacing: { before: 40, after: 8 }, keepNext: true, children: [
      t("Bachelor of Arts in Philosophy", { font: HEAD, size: 21, color: C.navy, bold: true }),
      t("  |  Alexandria University  |  ", { size: 19, color: C.navyDark, italics: true }),
      t("Sep 2016 " + EN + " May 2021  (Good)", { size: 18, color: C.gray }),
    ] }),
    new Paragraph({ spacing: { after: 20, line: 264 }, keepLines: true, children: [t("Formal, inductive, and mathematical logic; philosophy of science; metaphysics; philosophy of language; ethics and value theory; Greek, Islamic, modern, and contemporary philosophy; ancient Eastern thought; Islamic theology (Kalam) and Sufism; logic and artificial intelligence. Accredited and attested, with UAE Ministry of Education equivalency.", { size: 18, color: C.grayMed })] }),

    // ── Core Competencies ────────────────────────────────────────────────
    sectionTitle("Core Competencies"),
    ...bullets([
      "Operations and Facility Management (Retail, Contact Center, Entertainment, Education)",
      "Strategic Planning and Financial Forecasting",
      "ISO 9001 and ISO 45001 Compliance and Internal Audit",
      "Sales Strategy, Revenue Growth and KPI Achievement",
      "Vendor Negotiation and Supply Chain Coordination",
      "Team Leadership, Coaching and Performance Management",
      "Client Acquisition, Retention and Stakeholder Management",
      "Cross-Functional Collaboration and Change Management",
      "Curriculum Design and Academic Quality Assurance (ADEK, Irtiqa'a)",
      "Educational Technology Integration and Digital Transformation",
      "Differentiated Instruction and Inclusive Education Practices",
      "Model United Nations (MUN) Programme Leadership",
      "Podcasting and Educational Content Creation",
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

    // ── Languages ────────────────────────────────────────────────────────
    sectionTitle("Languages"),
    ...bullets([
      "Arabic " + EM + " Native",
      "English " + EM + " Fluent (C1, Academic IELTS Band 7)",
      "Urdu " + EM + " Beginner",
      "Spanish " + EM + " Beginner",
    ]),

    // ── Affiliations ─────────────────────────────────────────────────────
    sectionTitle("Affiliations"),
    ...bullets([
      "Member, British Philosophical Association (BPA), 2025 " + EN + " Present",
    ]),

    // ── Technical Skills ─────────────────────────────────────────────────
    sectionTitle("Technical Skills"),
    ...bullets([
      "CompTIA A+, Network+, Linux+",
      "Microsoft Office Suite  |  Google Workspace",
      "Educational Technology Platforms: HMH, Alef, Paradigm, MS Teams, Google Classroom, Canva, Teachy",
    ]),

    // ── Additional ───────────────────────────────────────────────────────
    sectionTitle("Additional"),
    ...bullets([
      "Sports Coaching: Strength and Conditioning Coach, Swift Football Academy, Al Ain, 2023" + EN + "2024",
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

    // ── Profile ──────────────────────────────────────────────────────────
    sectionTitle("Profile"),
    new Paragraph({ spacing: { after: 60, line: 264 }, alignment: AlignmentType.JUSTIFIED, keepLines: true, children: [t(
      "ADEK-licensed Social Studies and Islamic Education teacher for non-Arabic speakers, with expertise across Grades 1" + EN + "12 in the American Curriculum and subject mapping to IB MYP, Cambridge Global Perspectives, IB Theory of Knowledge, and A-Level Philosophy. Holds a BA in Philosophy (Alexandria University) and a Postgraduate Diploma in Education (Al-Azhar University). Appointed Faculty Head for Model United Nations; coached the school delegation to win Best School at MANORMUN V 2026. Author of \u201CDepth of Knowledge: A Practical Guide to Designing Rigorous Questions Without AI\u201D (2026), a handbook grounded in Norman Webb's Depth of Knowledge framework. UAE Teaching License and Academic IELTS Band 7. Bilingual in Arabic (native) and English.",
      { size: 20, color: C.graphite })] }),

    // ── Professional Experience (ONLY 3 roles) ──────────────────────────
    sectionTitle("Professional Experience"),

    ...job("English Social Studies Teacher", "Al Nahda National School for Boys, Abu Dhabi, UAE", "Aug 2026 " + EN + " Present",
      [
        "Teaching English Social Studies at Al Nahda National School for Boys, commencing the 2026/2027 academic year.",
      ]
    ),

    ...job("MSC Studies and Islamic Education B Teacher and Lead of Non-Arabic Speaking Section", "Ain Al Khaleej Private School, American Division, UAE", "Sep 2025 " + EN + " Jul 2026",
      [
        "Oversee the Non-Arabic Studies department, managing Social Studies and Islamic Education delivery for non-Arabic speakers across Grades 1" + EN + "12, ensuring alignment with ADEK and Irtiqa'a quality standards.",
        "Lead curriculum design, lesson planning, and differentiated instruction strategies for diverse learner profiles including ELLs and gifted students, driving strong attainment and inclusive progress.",
        "Appointed Faculty Head for Model United Nations (MUN) programme (2025/2026 and 2026/2027), directing student preparation, debate coaching, and cross-school event coordination.",
        "Champion integration of educational technology platforms (HMH, Alef, Paradigm, MS Teams, Google Classroom, Canva, Teachy) to enhance personalized, data-driven learning outcomes.",
        "Collaborate with cross-curricular teams to embed critical thinking, cultural literacy, and global citizenship across the school curriculum.",
        "Pioneered expert-level distance and blended learning delivery during school closures, maintaining full curriculum continuity and student engagement.",
        "Coached the school delegation to win Best School at MANORMUN V 2026, developing students' diplomatic reasoning, research writing, and public speaking.",
        "Active contributor to the school's \u201CStudent First\u201D initiative and a campus-wide source of mentorship and emotional support for students beyond his own classes.",
        "Manage parent communication, student progress reporting, and stakeholder engagement to support holistic student development.",
      ]
    ),

    ...job("Research Assistant and Translator", "Emory University (with Ustadh Dr. Rahimjon Abdugafurov)", "2017",
      [
        "Transcribed and analyzed historical manuscripts in Islamic Civilization with a focus on philosophical and theological contexts.",
        "Produced English" + EN + "Arabic translations of academic works for use in bilingual educational settings.",
        "Contributed scholarly material analysing the philosophical and theological dimensions of historical texts for academic research.",
      ]
    ),

    // ── Publication (expanded focus) ─────────────────────────────────────
    sectionTitle("Publication"),
    new Paragraph({ spacing: { before: 60, after: 10 }, keepNext: true, children: [t("Depth of Knowledge: A Practical Guide to Designing Rigorous Questions Without AI", { font: HEAD, size: 22, color: C.navy, bold: true, italics: true })] }),
    new Paragraph({ spacing: { after: 15 }, keepNext: true, children: [t("Self-published, First Edition, 2026  |  ISBN: 979-8-1913137-5-7  |  149 pages  |  Paperback $19.99, eBook $9.99", { size: 18, color: C.gray })] }),
    new Paragraph({ spacing: { after: 30 }, keepNext: true, children: [t("Available globally on Amazon.  ", { size: 19 }), ln("https://www.amazon.com/author/ahmed-ali", "Buy on Amazon"), t("   |   ", { size: 17, color: C.silver }), ln("https://phronesis-studio.com/en/publications/depth-of-knowledge", "Book Details")] }),
    new Paragraph({ spacing: { after: 40, line: 264 }, alignment: AlignmentType.JUSTIFIED, keepLines: true, children: [t("A handbook that restores to educators the craft of writing cognitively demanding questions from lesson content alone, without relying on AI tools. Grounded in Norman Webb's Depth of Knowledge framework, returns to his original 1997 and 2002 monographs as primary sources, and corrects the widespread misinterpretation perpetuated by the unauthorized DOK Wheel. The method is verified by reverse-coding. Twelve chapters, eleven printable classroom resources, and worked examples across seven subjects. A substantial chapter traces the principle that recall is not reasoning through the Islamic intellectual tradition, from Al-Hasan al-Basri to Ibn Khaldun.", { size: 19, color: C.grayMed, italics: true })] }),

    // ── Education ────────────────────────────────────────────────────────
    sectionTitle("Education"),
    new Paragraph({ spacing: { before: 60, after: 8 }, keepNext: true, children: [
      t("Postgraduate Diploma in Education", { font: HEAD, size: 21, color: C.navy, bold: true }),
      t("  |  Al-Azhar University  |  ", { size: 19, color: C.navyDark, italics: true }),
      t("Sep 2024 " + EN + " Sep 2025  (Very Good)", { size: 18, color: C.gray }),
    ] }),
    new Paragraph({ spacing: { after: 20, line: 264 }, keepLines: true, children: [t("Educational psychology and human development, philosophy and history of education, curriculum studies, instructional methodologies, educational administration and planning, micro-teaching and practical teaching experience. Accredited and attested by authorities in Egypt and the UAE, with UAE Ministry of Education equivalency.", { size: 18, color: C.grayMed })] }),
    new Paragraph({ spacing: { before: 40, after: 8 }, keepNext: true, children: [
      t("Bachelor of Arts in Philosophy", { font: HEAD, size: 21, color: C.navy, bold: true }),
      t("  |  Alexandria University  |  ", { size: 19, color: C.navyDark, italics: true }),
      t("Sep 2016 " + EN + " May 2021  (Good)", { size: 18, color: C.gray }),
    ] }),
    new Paragraph({ spacing: { after: 20, line: 264 }, keepLines: true, children: [t("Formal, inductive, and mathematical logic; philosophy of science; metaphysics; philosophy of language; ethics and value theory; Greek, Islamic, modern, and contemporary philosophy; ancient Eastern thought; Islamic theology (Kalam) and Sufism; logic and artificial intelligence. Accredited and attested, with UAE Ministry of Education equivalency.", { size: 18, color: C.grayMed })] }),

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
      "Podcasting and Educational Content Creation",
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

    ...job("Creator & Host " + EM + " Echoes of Wisdom Podcast", "Independent Educational Initiative", "2026 " + EN + " Present",
      [
        "Produces and hosts a bilingual (Arabic/English) philosophy podcast with 16 episodes across 2 seasons.",
        "Bridges academic philosophy and public discourse, making complex ideas in ethics, logic, and epistemology understandable and actionable.",
      ]
    ),

    ...job("Founder, Studio of Phronesis", "Educational Content and Software Platform Studio", "2024 " + EN + " Present",
      [
        "Founded a personal studio producing bilingual educational content and production-grade software platforms.",
        "Built MSCS Academy: 130 lessons, 390+ activities, UAE curriculum-aligned learning platform.",
        "Built DiplomatiQ: MUN operating system with seven-tier competency framework and AI evaluation.",
      ]
    ),

    ...job("Co-Founder & Member " + EM + " Educational Youth Club", "Bibliotheca Alexandrina, Alexandria, Egypt", "Oct 2013 " + EN + " Dec 2018",
      [
        "Co-founded an educational youth club in partnership with Bibliotheca Alexandrina to promote environmental awareness, critical thinking, and community engagement among high school students.",
        "Participated in multiple student programmes including YESBU, LYM (League of Young Masters), and ALYM (African League of Young Masters).",
      ]
    ),

    // ── Languages ────────────────────────────────────────────────────────
    sectionTitle("Languages"),
    ...bullets([
      "Arabic " + EM + " Native",
      "English " + EM + " Fluent (C1, Academic IELTS Band 7)",
      "Urdu " + EM + " Beginner",
      "Spanish " + EM + " Beginner",
    ]),

    // ── Affiliations ─────────────────────────────────────────────────────
    sectionTitle("Affiliations"),
    ...bullets([
      "Member, British Philosophical Association (BPA), 2025 " + EN + " Present",
    ]),

    // ── Technical Skills ─────────────────────────────────────────────────
    sectionTitle("Technical Skills"),
    ...bullets([
      "CompTIA A+, Network+, Linux+",
      "Microsoft Office Suite  |  Google Workspace",
      "Educational Technology Platforms: HMH, Alef, Paradigm, MS Teams, Google Classroom, Canva, Teachy",
    ]),

    // ── Additional ───────────────────────────────────────────────────────
    sectionTitle("Additional"),
    ...bullets([
      "Conference Organisation: Co-organised the 3rd Annual International Conference, Department of Philosophy, Alexandria University (Nov 2017)",
      "Sports Coaching: Strength and Conditioning Coach, Swift Football Academy, Al Ain, 2023" + EN + "2024",
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
