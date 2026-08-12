#!/usr/bin/env node
/**
 * Academic Application Package — Ahmed Ali
 * Generates tailored application materials for Philosophy Instructor positions
 * at Central Mindanao University (CMU), SWU PHINMA Cebu, and PHINMA CDO.
 *
 * Outputs:
 * 1. CMU_Application_Letter_to_Dr_Eballe.docx
 * 2. CMU_Academic_CV_Ahmed_Ali.docx
 * 3. SWU_PHINMA_Cover_Letter.docx
 * 4. PHINMA_CDO_Cover_Letter.docx
 * 5. Academic_CV_Ahmed_Ali.docx (shared academic CV for all three)
 */

const {
  Document, Packer, Paragraph, TextRun, AlignmentType,
  BorderStyle, ExternalHyperlink, ImageRun,
  Table, TableRow, TableCell, WidthType, VerticalAlign,
  HeadingLevel,
} = require("docx");
const fs = require("fs");

// ─── Design tokens ──────────────────────────────────────────────────────────
const C = {
  navy: "00366D", navyDark: "1B3A5C", ink: "1D1D1D", graphite: "333333",
  gray: "555555", grayMed: "595959", silver: "AAAAAA", white: "FFFFFF",
  line: "D4D4D4", lightBg: "F5F5F5",
};
const BODY = "Calibri";
const HEAD = "EB Garamond";
const SERIF = "Cambria";
const EM = "\u2014";
const EN = "\u2013";

// ─── Helpers ────────────────────────────────────────────────────────────────
function t(text, o = {}) {
  return new TextRun({ text, font: o.font || BODY, size: o.size || 22, color: o.color || C.ink, bold: o.bold || false, italics: o.italics || false });
}
function ln(url, text, color = C.navy) {
  return new ExternalHyperlink({ link: url, children: [new TextRun({ text, font: BODY, size: 20, color, underline: { type: "single", color } })] });
}
function rule(color = C.navy, size = 8) {
  return new Paragraph({ spacing: { before: 30, after: 60 }, border: { bottom: { color, space: 1, style: BorderStyle.SINGLE, size } }, children: [new TextRun({ text: "" })] });
}
function spacer(h = 60) { return new Paragraph({ spacing: { before: 0, after: h }, children: [new TextRun({ text: "" })] }); }

function sectionTitle(text) {
  return new Paragraph({
    spacing: { before: 200, after: 40 },
    border: { bottom: { color: C.navy, space: 1, style: BorderStyle.SINGLE, size: 8 } },
    keepNext: true,
    children: [t(text.toUpperCase(), { font: HEAD, size: 26, color: C.navy, bold: true })],
  });
}

function job(title, org, period, bullets) {
  const ch = [
    new Paragraph({ spacing: { before: 120, after: 10 }, keepNext: true, children: [t(title, { font: HEAD, size: 24, color: C.navy, bold: true })] }),
    new Paragraph({ spacing: { after: 10 }, keepNext: true, children: [t(org, { size: 22, color: C.navyDark, italics: true }), t("  |  ", { size: 21, color: C.gray }), t(period, { size: 20, color: C.gray })] }),
  ];
  for (const b of bullets) {
    ch.push(new Paragraph({
      spacing: { after: 50, line: 276 }, indent: { left: 220, hanging: 140 }, alignment: AlignmentType.JUSTIFIED, keepLines: true,
      children: [t("\u2022  ", { size: 22, color: C.navy }), t(b, { size: 22, color: C.graphite })],
    }));
  }
  return ch;
}

function bullets(items) {
  return items.map(i => new Paragraph({
    spacing: { after: 50, line: 276 }, indent: { left: 220, hanging: 140 }, alignment: AlignmentType.JUSTIFIED, keepLines: true,
    children: [t("\u2022  ", { size: 22, color: C.navy }), t(i, { size: 22, color: C.graphite })],
  }));
}

// Letter helpers (formal correspondence)
function letterHeader(name, title, line1, line2, contact) {
  return [
    new Paragraph({ spacing: { after: 40 }, children: [t(name, { font: HEAD, size: 28, color: C.navy, bold: true })] }),
    new Paragraph({ spacing: { after: 20 }, children: [t(title, { size: 20, color: C.navyDark, italics: true })] }),
    new Paragraph({ spacing: { after: 10, line: 240 }, children: [t(line1, { size: 18, color: C.gray })] }),
    new Paragraph({ spacing: { after: 10, line: 240 }, children: [t(line2, { size: 18, color: C.gray })] }),
    new Paragraph({ spacing: { after: 200, line: 240 }, children: [t(contact, { size: 18, color: C.gray })] }),
  ];
}

function letterDate() {
  return new Paragraph({ spacing: { after: 200 }, alignment: AlignmentType.RIGHT, children: [t("11 August 2026", { size: 20, color: C.gray })] });
}

function recipient(name, title, org, address) {
  return [
    new Paragraph({ spacing: { after: 40 }, children: [t(name, { size: 22, color: C.ink, bold: true })] }),
    new Paragraph({ spacing: { after: 30 }, children: [t(title, { size: 20, color: C.grayMed, italics: true })] }),
    new Paragraph({ spacing: { after: 30 }, children: [t(org, { size: 20, color: C.grayMed })] }),
    new Paragraph({ spacing: { after: 200 }, children: [t(address, { size: 20, color: C.grayMed })] }),
  ];
}

function salutation(text) {
  return new Paragraph({ spacing: { after: 160 }, children: [t(text, { size: 22, color: C.ink })] });
}

function body(text, opts = {}) {
  return new Paragraph({
    spacing: { after: 160, line: 312 },
    alignment: AlignmentType.JUSTIFIED,
    children: [t(text, { size: 22, color: C.graphite, ...opts })],
  });
}

function bodyMulti(runs) {
  return new Paragraph({
    spacing: { after: 160, line: 312 },
    alignment: AlignmentType.JUSTIFIED,
    children: runs,
  });
}

function closing(text) {
  return new Paragraph({ spacing: { before: 100, after: 60 }, children: [t(text, { size: 22, color: C.ink })] });
}

function signature(name, title) {
  return [
    new Paragraph({ spacing: { before: 200, after: 30 }, children: [t(name, { size: 22, color: C.ink, bold: true })] }),
    new Paragraph({ spacing: { after: 200 }, children: [t(title, { size: 20, color: C.grayMed, italics: true })] }),
  ];
}

// ═══════════════════════════════════════════════════════════════════════════
// SHARED ACADEMIC CV (used for all three applications)
// ═══════════════════════════════════════════════════════════════════════════

function buildAcademicCV() {
  const photoPath = "/home/z/my-project/upload/Personal Photo.jpg";

  const header = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE }, insideHorizontal: { style: BorderStyle.NONE }, insideVertical: { style: BorderStyle.NONE } },
    rows: [new TableRow({ cantSplit: true, children: [
      new TableCell({ width: { size: 18, type: WidthType.PERCENTAGE }, margins: { top: 0, bottom: 0, left: 0, right: 100 }, verticalAlign: VerticalAlign.TOP, children: [
        new Paragraph({ spacing: { after: 0 }, children: [new ImageRun({ data: fs.readFileSync(photoPath), transformation: { width: 95, height: 100 }, type: "jpg" })] }),
      ] }),
      new TableCell({ width: { size: 82, type: WidthType.PERCENTAGE }, margins: { top: 0, bottom: 0, left: 0, right: 0 }, verticalAlign: VerticalAlign.TOP, children: [
        new Paragraph({ spacing: { after: 30 }, children: [t("AHMED ALI", { font: HEAD, size: 36, color: C.navy, bold: true })] }),
        new Paragraph({ spacing: { after: 40 }, children: [t("Philosopher  |  Author  |  Educator  |  Researcher", { font: HEAD, size: 22, color: C.navyDark, italics: true })] }),
        new Paragraph({ spacing: { after: 20, line: 240 }, children: [
          t("Abu Dhabi, UAE (relocating to Cebu, Philippines)  |  +971 56 166 9766  |  ", { size: 18, color: C.gray }),
          ln("mailto:ahmed.ali.academic@gmail.com", "ahmed.ali.academic@gmail.com"),
        ] }),
        new Paragraph({ spacing: { after: 0, line: 240 }, children: [
          ln("https://mr-ahmed-ali.vercel.app/", "Academic Portfolio"),
          t("  |  ", { size: 17, color: C.silver }),
          ln("https://phronesis-studio.com/", "Studio of Phronesis"),
          t("  |  ", { size: 17, color: C.silver }),
          ln("https://linkedin.com/in/ahmedmahmoudsaeedahmedali", "LinkedIn"),
          t("  |  ", { size: 17, color: C.silver }),
          ln("https://www.amazon.com/author/ahmed-ali", "Amazon Author Page"),
        ] }),
      ] }),
    ] })],
  });

  const main = [
    header,
    rule(C.navy, 12),

    // ── Profile ──────────────────────────────────────────────────────────
    sectionTitle("Profile"),
    new Paragraph({ spacing: { after: 80, line: 312 }, alignment: AlignmentType.JUSTIFIED, keepLines: true, children: [t(
      "Philosopher and educator with a BA in Philosophy (Alexandria University), a Postgraduate Diploma in Education (Al-Azhar University), and research experience at Emory University. ADEK-approved teacher and UAE MoE Licensed Teacher with eight years of experience across education, operations, and academic research in the UAE, UK, and Egypt. Author of \u201CDepth of Knowledge: A Practical Guide to Designing Rigorous Questions Without AI\u201D (2026), a scholarly handbook engaging both Norman Webb's contemporary framework and the Islamic intellectual tradition from Al-Hasan al-Basri to Ibn Khaldun. Member of the British Philosophical Association (BPA). Bilingual in Arabic (native) and English (Academic IELTS Band 7). Creator and host of Echoes of Wisdom, a bilingual philosophy podcast with sixteen episodes across two seasons. Seeking to contribute to philosophy instruction and research at Central Mindanao University.",
      { size: 22, color: C.graphite })] }),

    // ── Research & Scholarly Activity ────────────────────────────────────
    sectionTitle("Research and Scholarly Activity"),

    new Paragraph({ spacing: { before: 80, after: 20 }, keepNext: true, children: [t("Book (Single-Author)", { font: HEAD, size: 24, color: C.navy, bold: true })] }),
    new Paragraph({ spacing: { after: 15 }, keepNext: true, children: [t("Depth of Knowledge: A Practical Guide to Designing Rigorous Questions Without AI", { font: HEAD, size: 23, color: C.navyDark, bold: true, italics: true })] }),
    new Paragraph({ spacing: { after: 15 }, keepNext: true, children: [t("Independently published, First Edition, 2026  |  ISBN: 979-8-1913137-5-7  |  149 pages  |  Paperback $19.99, eBook $9.99", { size: 20, color: C.gray })] }),
    new Paragraph({ spacing: { after: 15 }, keepNext: true, children: [t("Available globally on Amazon:  ", { size: 20 }), ln("https://www.amazon.com/author/ahmed-ali", "amazon.com/author/ahmed-ali"), t("   |   ", { size: 18, color: C.silver }), ln("https://phronesis-studio.com/en/publications/depth-of-knowledge", "Book page")] }),
    new Paragraph({ spacing: { after: 60, line: 300 }, alignment: AlignmentType.JUSTIFIED, keepLines: true, children: [t(
      "A scholarly handbook that restores to educators the craft of writing cognitively demanding questions from lesson content alone, without relying on AI tools. Grounded in Norman Webb's Depth of Knowledge framework, the work returns to Webb's original 1997 and 2002 monographs as primary sources and corrects the widespread misinterpretation perpetuated by the unauthorized \u201CDOK Wheel.\u201D The method is verified by reverse-coding. The handbook comprises twelve chapters, eleven printable classroom resources, and worked examples across seven subjects. A substantial chapter traces the principle that recall is not reasoning through the Islamic intellectual tradition, from Al-Hasan al-Basri in the eighth century to Ibn Khaldun's four-level progression in the Muqaddimah (1377), establishing that the underlying principle is neither uniquely Western nor exclusively modern.",
      { size: 21, color: C.grayMed, italics: true })] }),

    new Paragraph({ spacing: { before: 100, after: 20 }, keepNext: true, children: [t("Research Appointment", { font: HEAD, size: 24, color: C.navy, bold: true })] }),
    new Paragraph({ spacing: { after: 15 }, keepNext: true, children: [t("Research Assistant and Translator", { font: HEAD, size: 23, color: C.navyDark, bold: true, italics: true })] }),
    new Paragraph({ spacing: { after: 60 }, keepNext: true, children: [t("Emory University (with Ustadh Dr. Rahimjon Abdugafurov)  |  2017", { size: 20, color: C.gray })] }),
    ...bullets([
      "Transcribed and analysed historical manuscripts in Islamic civilization under the supervision of Dr. Rahimjon Abdugafurov, focusing on philosophical and theological contexts.",
      "Produced English" + EN + "Arabic translations of academic works for use in bilingual educational settings, maintaining scholarly precision across both languages.",
      "Contributed scholarly material analysing the philosophical and theological dimensions of historical texts for academic research at Emory University.",
      "Engaged primary-source manuscripts with attention to philological detail, doctrinal context, and the conceptual genealogies linking classical Islamic philosophy to contemporary philosophical questions.",
    ]),

    new Paragraph({ spacing: { before: 100, after: 20 }, keepNext: true, children: [t("Public Philosophy", { font: HEAD, size: 24, color: C.navy, bold: true })] }),
    new Paragraph({ spacing: { after: 15 }, keepNext: true, children: [t("Creator and Host, Echoes of Wisdom Podcast", { font: HEAD, size: 23, color: C.navyDark, bold: true, italics: true })] }),
    new Paragraph({ spacing: { after: 60 }, keepNext: true, children: [t("Independent Educational Initiative  |  2026 " + EN + " Present", { size: 20, color: C.gray })] }),
    ...bullets([
      "Produces and hosts a bilingual (Arabic/English) philosophy podcast with sixteen episodes across two seasons, spanning ethics, logic, epistemology, philosophy of mind, and political philosophy.",
      "Bridges academic philosophy and public discourse, rendering complex ideas in ethics, logic, and epistemology accessible and actionable for diverse audiences.",
      "Demonstrates sustained scholarly engagement with both Western and Islamic philosophical traditions in a public-facing medium.",
    ]),

    new Paragraph({ spacing: { before: 100, after: 20 }, keepNext: true, children: [t("Conference Organisation", { font: HEAD, size: 24, color: C.navy, bold: true })] }),
    ...bullets([
      "Co-organiser, 3rd Annual International Conference, Department of Philosophy, Alexandria University (November 2017). The conference addressed philosophical reading, creativity, and critical criticism.",
    ]),

    // ── Academic Appointments & Teaching Experience ──────────────────────
    sectionTitle("Academic and Teaching Experience"),

    ...job("English Social Studies Teacher", "Al Nahda National School for Boys, Abu Dhabi, UAE", "Aug 2026 " + EN + " Present",
      [
        "Appointed to teach English Social Studies for the 2026/2027 academic year, commencing at one of Abu Dhabi's established national schools.",
      ]
    ),

    ...job("MSC Studies and Islamic Education B Teacher; Lead, Non-Arabic Speaking Section", "Ain Al Khaleej Private School, American Division, UAE", "Sep 2025 " + EN + " Jul 2026",
      [
        "Designed and delivered curriculum for Social Studies and Islamic Education with substantial philosophical content, including units on ethics, epistemology, philosophy of religion, and political philosophy, for non-Arabic speakers across Grades 1" + EN + "12.",
        "Promoted from Subject Teacher to Lead of the Non-Arabic Speaking Section in Term 2, overseeing departmental curriculum design, instructional methodology, and academic quality standards aligned with ADEK and Irtiqa'a.",
        "Appointed Faculty Head for Model United Nations (MUN) programme (2025/2026 and 2026/2027), directing student preparation in diplomatic reasoning, research writing, public speaking, and the philosophical foundations of international relations.",
        "Coached the school delegation to win Best School at MANORMUN V 2026, developing students' capacities in argumentation, ethical reasoning, and cross-cultural philosophical dialogue.",
        "Embedded critical thinking, philosophical analysis, and cultural literacy across the curriculum through cross-curricular collaboration.",
        "Mentored department teachers in differentiated instruction, educational technology integration, safeguarding, inclusive education, and the pedagogical application of cognitive taxonomies (Webb's DOK, Bloom's, SOLO).",
        "Pioneered expert-level distance and blended learning delivery during school closures, maintaining full curriculum continuity and student engagement.",
      ]
    ),

    ...job("Research Assistant and Translator", "Emory University (with Ustadh Dr. Rahimjon Abdugafurov)", "2017",
      [
        "Transcribed and analysed historical manuscripts in Islamic civilization under Dr. Abdugafurov's supervision, focusing on philosophical and theological contexts.",
        "Produced English" + EN + "Arabic translations of academic works for bilingual educational settings.",
        "Contributed scholarly material analysing the philosophical and theological dimensions of historical texts.",
      ]
    ),

    // ── Education ────────────────────────────────────────────────────────
    sectionTitle("Education"),
    new Paragraph({ spacing: { before: 80, after: 10 }, keepNext: true, children: [
      t("Bachelor of Arts in Philosophy", { font: HEAD, size: 23, color: C.navy, bold: true }),
      t("  |  Alexandria University, Faculty of Arts, Egypt  |  ", { size: 20, color: C.navyDark, italics: true }),
      t("Sep 2016 " + EN + " May 2021  (Good)", { size: 19, color: C.gray }),
    ] }),
    new Paragraph({ spacing: { after: 30, line: 300 }, keepLines: true, children: [t(
      "Comprehensive programme covering formal, inductive, and mathematical logic; philosophy of science; metaphysics; philosophy of language; ethics and value theory; Greek, Islamic, modern, and contemporary philosophy; ancient Eastern thought; Islamic theology (Kalam) and Sufism; and logic and artificial intelligence. Included the study of philosophical texts in a European language throughout most academic semesters. Accredited and attested by authorities in Egypt and the UAE, with formal equivalency issued by the UAE Ministry of Education.",
      { size: 20, color: C.grayMed })] }),

    new Paragraph({ spacing: { before: 80, after: 10 }, keepNext: true, children: [
      t("Postgraduate Diploma in Education", { font: HEAD, size: 23, color: C.navy, bold: true }),
      t("  |  Al-Azhar University, Faculty of Education, Egypt  |  ", { size: 20, color: C.navyDark, italics: true }),
      t("Sep 2024 " + EN + " Sep 2025  (Very Good)", { size: 19, color: C.gray }),
    ] }),
    new Paragraph({ spacing: { after: 30, line: 300 }, keepLines: true, children: [t(
      "Educational psychology and human development; philosophy and history of education; curriculum studies; instructional methodologies; educational administration and planning; micro-teaching and practical teaching experience. Accredited and attested, with UAE Ministry of Education equivalency.",
      { size: 20, color: C.grayMed })] }),

    // ── Certifications ───────────────────────────────────────────────────
    sectionTitle("Certifications and Credentials"),
    ...bullets([
      "Certified Professional Teaching License (Social Studies, Cycle 3), UAE Ministry of Education " + EM + " Valid until February 2029",
      "ADEK-Approved Teacher (Moral, Social, and Cultural Studies; Islamic Education B for Non-Arabic Speakers), Abu Dhabi, UAE",
      "IELTS Academic Band 7, British Council " + EM + " Valid until August 2027",
      "Verification of Manuscripts in Philosophy and Theology, Bibliotheca Alexandrina " + EM + " November 2021",
      "Critical Thinking and Decision Making, LinkedIn Learning " + EM + " July 2021",
      "AI for Educators (Level 1), Teachy " + EM + " October 2025",
      "Network Fundamentals and Security, Mahara Tech (MCIT, Egypt) " + EM + " June 2025",
      "Advanced Person-in-Charge (PIC), Dubai Municipality " + EM + " May 2025",
      "Fire Warden (Level 2), Dubai Civil Defence " + EM + " Valid until August 2026",
      "HMH Differentiate with Small Groups " + EM + " April 2026",
      "Ready to Wrestle, United World Wrestling (UWW) " + EM + " February 2026",
    ]),

    // ── Affiliations ─────────────────────────────────────────────────────
    sectionTitle("Affiliations and Professional Membership"),
    ...bullets([
      "Member, British Philosophical Association (BPA), 2025 " + EN + " Present",
      "Member, Educational Youth Club (co-founder), Bibliotheca Alexandrina, Alexandria, Egypt, October 2013 " + EN + " December 2018",
    ]),

    // ── Core Competencies ────────────────────────────────────────────────
    sectionTitle("Core Competencies"),
    ...bullets([
      "Philosophy instruction across introductory and intermediate levels (ethics, logic, epistemology, philosophy of religion, political philosophy, Islamic philosophy)",
      "Bilingual academic instruction and translation (Arabic " + EN + " English)",
      "Curriculum design and academic quality assurance (UAE MoE, ADEK, Irtiqa'a standards)",
      "Inquiry-based learning, critical thinking pedagogy, and Socratic method",
      "Assessment design and cognitive taxonomies (Webb's DOK, Bloom's Taxonomy, SOLO Taxonomy)",
      "Model United Nations programme leadership and debate coaching",
      "Educational technology integration (HMH, Alef, Paradigm, MS Teams, Google Classroom, Canva, Teachy)",
      "Distance and blended learning delivery",
      "Manuscript analysis, philological method, and primary-source research",
      "Public philosophy communication via podcasting and bilingual content creation",
    ]),

    // ── Languages ────────────────────────────────────────────────────────
    sectionTitle("Languages"),
    ...bullets([
      "Arabic " + EM + " Native (Modern Standard Arabic and Egyptian Colloquial)",
      "English " + EM + " Fluent (C1, Academic IELTS Band 7)",
      "Urdu " + EM + " Beginner",
      "Spanish " + EM + " Beginner",
    ]),

    // ── Technical Skills ─────────────────────────────────────────────────
    sectionTitle("Technical Skills"),
    ...bullets([
      "CompTIA A+, Network+, Linux+",
      "Microsoft Office Suite and Google Workspace",
      "Educational technology platforms: HMH, Alef, Paradigm, MS Teams, Google Classroom, Canva, Teachy, Plickers, Kahoot",
      "Podcast production and bilingual educational content creation",
    ]),

    // ── Selected Projects ────────────────────────────────────────────────
    sectionTitle("Selected Projects"),
    ...bullets([
      "Founder, Studio of Phronesis (2024 " + EN + " Present): A studio producing bilingual educational content and production-grade software platforms, including MSCS Academy (130 lessons, 390+ activities, UAE curriculum-aligned) and DiplomatiQ (MUN operating system with seven-tier competency framework and AI evaluation).",
      "Co-Founder and Member, Educational Youth Club, Bibliotheca Alexandrina (October 2013 " + EN + " December 2018): Co-founded a youth club promoting environmental awareness and critical thinking; participated in YESBU, LYM (League of Young Masters), and ALYM (African League of Young Masters) programmes.",
      "General Coordinator, Waste Segregation Initiative, Bibliotheca Alexandrina and Alexandria Governorate (February 2015 " + EN + " February 2017): Managed logistics and outreach for a citywide environmental awareness initiative targeting youth and local schools.",
    ]),

    // ── Additional ───────────────────────────────────────────────────────
    sectionTitle("Additional Information"),
    ...bullets([
      "Sports Coaching: Strength and Conditioning Coach, Swift Football Academy, Al Ain, UAE, 2023" + EN + "2024.",
      "References: Multiple academic and professional recommendation letters available upon request, including from Dr. Rahimjon Abdugafurov (Emory University). Full portfolio at https://phronesis-studio.com/en/about.",
    ]),
  ];

  return new Document({
    creator: "Ahmed Ali",
    title: "Ahmed Ali " + EM + " Academic CV",
    styles: { default: { document: { run: { font: BODY, size: 22 }, paragraph: { spacing: { line: 276 } } } } },
    sections: [{ properties: { page: { margin: { top: 720, bottom: 540, left: 720, right: 540 } } }, children: main }],
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// CMU APPLICATION LETTER — to Dr. Rolito G. Eballe
// ═══════════════════════════════════════════════════════════════════════════

function buildCMULetter() {
  const elements = [
    // Sender header
    ...letterHeader(
      "AHMED ALI",
      "Philosopher, Author, and Educator",
      "Abu Dhabi, United Arab Emirates (relocating to Cebu, Philippines)",
      "+971 56 166 9766  |  ahmed.ali.academic@gmail.com",
      "https://mr-ahmed-ali.vercel.app/  |  https://phronesis-studio.com/"
    ),

    letterDate(),

    // Recipient
    ...recipient(
      "ROLITO G. EBALLE, PhD",
      "University President, Central Mindanao University",
      "Through Proper Channels (Department of Social Sciences, College of Arts and Sciences)",
      "Musuan, Bukidnon, Philippines"
    ),

    salutation("Dear Dr. Eballe,"),

    body("I write to express my earnest interest in the Philosophy Instructor position (Contract of Service, two slots) in the Department of Social Sciences, College of Arts and Sciences, for the First Semester of Academic Year 2026\u20132027, as advertised on the Central Mindanao University official channels on 24 June 2026."),

    body("I hold a Bachelor of Arts in Philosophy from Alexandria University (2016\u20132021), with comprehensive training in formal and mathematical logic, philosophy of science, metaphysics, philosophy of language, ethics, Greek and Islamic philosophy, ancient Eastern thought, Islamic theology (Kalam), and Sufism. I additionally hold a Postgraduate Diploma in Education from Al-Azhar University (2024\u20132025), and I am a Member of the British Philosophical Association (BPA) since 2025."),

    body("My scholarly profile is perhaps best represented by my single-author book, Depth of Knowledge: A Practical Guide to Designing Rigorous Questions Without AI (Independently published, First Edition, 2026; ISBN 979-8-1913137-5-7; 149 pages). The handbook engages Norman Webb's Depth of Knowledge framework, returning to Webb's original 1997 and 2002 monographs as primary sources and correcting the widespread misinterpretation perpetuated by the unauthorized \u201CDOK Wheel.\u201D A substantial chapter traces the principle that recall is not reasoning through the Islamic intellectual tradition, from Al-Hasan al-Basri in the eighth century to Ibn Khaldun's four-level progression in the Muqaddimah (1377). The book is available globally on Amazon, and its detail page may be consulted at https://phronesis-studio.com/en/publications/depth-of-knowledge."),

    body("Prior to my current appointment, I served as Research Assistant and Translator at Emory University in 2017, working under the supervision of Ustadh Dr. Rahimjon Abdugafurov on historical manuscripts in Islamic civilization. My responsibilities included transcription, analysis of philosophical and theological contexts, and the production of English\u2013Arabic academic translations for bilingual educational settings. This appointment cultivated my capacity for primary-source research, philological attention, and the conceptual analysis linking classical Islamic philosophy to contemporary questions."),

    body("I have additionally contributed to public philosophy through the creation and hosting of Echoes of Wisdom, a bilingual (Arabic/English) philosophy podcast with sixteen episodes across two seasons, addressing ethics, logic, epistemology, philosophy of mind, and political philosophy. The podcast reflects my commitment to rendering philosophical ideas accessible to diverse audiences while preserving their scholarly integrity, and it demonstrates sustained engagement with both Western and Islamic philosophical traditions in a public-facing medium."),

    body("My teaching experience, while primarily at the K-12 level in the UAE, has been substantively philosophical in content. As MSC Studies and Islamic Education B Teacher and Lead of the Non-Arabic Speaking Section at Ain Al Khaleej Private School (2025\u20132026), I designed and delivered curriculum with substantial philosophical content, including units on ethics, epistemology, philosophy of religion, and political philosophy. I was appointed Faculty Head for the Model United Nations programme and coached the school delegation to win Best School at MANORMUN V 2026, developing students' capacities in diplomatic reasoning, argumentation, ethical analysis, and cross-cultural philosophical dialogue. I am ADEK-approved and hold a UAE Ministry of Education Certified Professional Teaching License (Social Studies, Cycle 3), valid until February 2029."),

    body("I am relocating to the Philippines within the coming weeks, with Cebu as my intended base, and I am particularly drawn to Central Mindanao University because of its established commitment to philosophy education from the bachelor's to the doctoral level, and because of your own scholarly leadership as University President. I would consider it a privilege to contribute to the Department of Social Sciences through instruction in philosophy, participation in departmental research, and engagement with the broader academic community at CMU."),

    body("I am enclosing my curriculum vitae with supporting documents, including my Official Transcript of Records (attested), the CSC Form 212 (Personal Data Sheet, Revised 2017), and copies of my academic and professional credentials. I am able to provide original documents upon request and am available for an interview at your convenience, whether in person at the Musuan campus or via video conference."),

    body("Thank you for your time and consideration. I look forward to the possibility of contributing to Central Mindanao University."),

    closing("Respectfully yours,"),

    ...signature("AHMED ALI", "Philosopher, Author, and Educator"),

    new Paragraph({ spacing: { before: 200, after: 60 }, children: [t("Enclosures:", { size: 20, color: C.gray, bold: true })] }),
    ...bullets([
      "Curriculum Vitae with supporting documents",
      "Official Transcript of Records (BA Philosophy, Alexandria University \u2014 attested)",
      "Official Transcript of Records (PGDE, Al-Azhar University \u2014 attested)",
      "CSC Form 212 (Personal Data Sheet, Revised 2017)",
      "Copies of academic and professional credentials (Teaching License, IELTS, BPA Membership, certifications)",
      "Copy of published book: Depth of Knowledge (2026)",
    ]),
  ];

  return new Document({
    creator: "Ahmed Ali",
    title: "Application Letter " + EM + " CMU Philosophy Instructor " + EM + " Ahmed Ali",
    styles: { default: { document: { run: { font: BODY, size: 22 }, paragraph: { spacing: { line: 312 } } } } },
    sections: [{ properties: { page: { margin: { top: 720, bottom: 720, left: 1080, right: 1080 } } }, children: elements }],
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// SWU PHINMA COVER LETTER (Cebu)
// ═══════════════════════════════════════════════════════════════════════════

function buildSWULetter() {
  const elements = [
    ...letterHeader(
      "AHMED ALI",
      "Philosopher, Author, and Educator",
      "Abu Dhabi, United Arab Emirates (relocating to Cebu, Philippines)",
      "+971 56 166 9766  |  ahmed.ali.academic@gmail.com",
      "https://mr-ahmed-ali.vercel.app/  |  https://phronesis-studio.com/"
    ),

    letterDate(),

    ...recipient(
      "Hiring Committee, College of Arts and Sciences",
      "Southwestern University PHINMA",
      "Urgello Street, Cebu City, Philippines",
      ""
    ),

    salutation("Dear Members of the Hiring Committee,"),

    body("I write to apply for the CAS Instructor position (part-time) at Southwestern University PHINMA, with Philosophy as my declared specialization, as advertised on the university's careers portal. The application deadline is 20 September 2026."),

    body("I hold a Bachelor of Arts in Philosophy from Alexandria University and a Postgraduate Diploma in Education from Al-Azhar University. I am a Member of the British Philosophical Association (BPA) and the author of Depth of Knowledge: A Practical Guide to Designing Rigorous Questions Without AI (Independently published, 2026; ISBN 979-8-1913137-5-7), a scholarly handbook engaging Norman Webb's Depth of Knowledge framework and tracing a key epistemological principle through the Islamic intellectual tradition from Al-Hasan al-Basri to Ibn Khaldun."),

    body("My teaching experience includes serving as Faculty Head for Model United Nations at Ain Al Khaleej Private School, where I coached the school delegation to win Best School at MANORMUN V 2026, and designing curriculum with substantial philosophical content across ethics, epistemology, philosophy of religion, and political philosophy. I hold a UAE Ministry of Education Certified Professional Teaching License (valid until February 2029) and am ADEK-approved. I am bilingual in Arabic (native) and English (Academic IELTS Band 7)."),

    body("I am relocating to Cebu within the coming weeks and intend to base my residence there. The part-time CAS Instructor role at SWU PHINMA is particularly attractive because it would allow me to contribute to undergraduate philosophy instruction while continuing my own scholarly research and writing. I am comfortable with both face-to-face and Google Classroom modalities, and I am committed to fostering an engaging, student-centered learning environment that promotes critical thinking and collaborative inquiry."),

    body("I am enclosing my curriculum vitae with supporting documents. I would welcome the opportunity to discuss how my background in philosophy, my publication record, and my teaching experience could contribute to the College of Arts and Sciences at SWU PHINMA."),

    closing("Respectfully yours,"),

    ...signature("AHMED ALI", "Philosopher, Author, and Educator"),

    new Paragraph({ spacing: { before: 200, after: 60 }, children: [t("Enclosures:", { size: 20, color: C.gray, bold: true })] }),
    ...bullets([
      "Curriculum Vitae with supporting documents",
      "Copies of academic and professional credentials",
      "Copy of published book: Depth of Knowledge (2026)",
    ]),
  ];

  return new Document({
    creator: "Ahmed Ali",
    title: "Cover Letter " + EM + " SWU PHINMA CAS Instructor " + EM + " Ahmed Ali",
    styles: { default: { document: { run: { font: BODY, size: 22 }, paragraph: { spacing: { line: 312 } } } } },
    sections: [{ properties: { page: { margin: { top: 720, bottom: 720, left: 1080, right: 1080 } } }, children: elements }],
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// PHINMA CDO COVER LETTER
// ═══════════════════════════════════════════════════════════════════════════

function buildCDOLetter() {
  const elements = [
    ...letterHeader(
      "AHMED ALI",
      "Philosopher, Author, and Educator",
      "Abu Dhabi, United Arab Emirates (relocating to the Philippines)",
      "+971 56 166 9766  |  ahmed.ali.academic@gmail.com",
      "https://mr-ahmed-ali.vercel.app/  |  https://phronesis-studio.com/"
    ),

    letterDate(),

    ...recipient(
      "Hiring Committee, PHINMA Cagayan de Oro College",
      "Carmen Campus, Cagayan de Oro City, Misamis Oriental, Philippines",
      "",
      ""
    ),

    salutation("Dear Members of the Hiring Committee,"),

    body("I write to apply for the Philosophy Faculty position (full-time) at PHINMA Cagayan de Oro College, as advertised. The application deadline is 1 September 2026."),

    body("I hold a Bachelor of Arts in Philosophy from Alexandria University and a Postgraduate Diploma in Education from Al-Azhar University. I am a Member of the British Philosophical Association (BPA) and the author of Depth of Knowledge: A Practical Guide to Designing Rigorous Questions Without AI (Independently published, 2026; ISBN 979-8-1913137-5-7), a scholarly handbook grounded in Norman Webb's Depth of Knowledge framework, with a substantial chapter tracing a key epistemological principle through the Islamic intellectual tradition from Al-Hasan al-Basri to Ibn Khaldun."),

    body("My academic research experience includes serving as Research Assistant and Translator at Emory University in 2017, working under Dr. Rahimjon Abdugafurov on historical manuscripts in Islamic civilization, with responsibility for transcription, philosophical and theological analysis, and English\u2013Arabic academic translation. This appointment cultivated my capacity for primary-source research and the conceptual analysis linking classical Islamic philosophy to contemporary questions."),

    body("My teaching experience includes K-12 instruction in the UAE with substantial philosophical content across ethics, epistemology, philosophy of religion, and political philosophy. I served as Faculty Head for Model United Nations and coached the school delegation to win Best School at MANORMUN V 2026. I hold a UAE Ministry of Education Certified Professional Teaching License (valid until February 2029) and am ADEK-approved. I am bilingual in Arabic (native) and English (Academic IELTS Band 7), and I am dynamic, flexible, and available for a full-time position."),

    body("I am relocating to the Philippines within the coming weeks, with Cagayan de Oro as a strong candidate location given its proximity to academic institutions in Northern Mindanao. I am particularly drawn to PHINMA Cagayan de Oro College because of its commitment to accessible, quality education and its position within the PHINMA Education network. I would be honoured to contribute to the Philosophy programme through instruction, curriculum development, and scholarly engagement."),

    body("I am enclosing my curriculum vitae with supporting documents. I would welcome the opportunity to discuss how my background in philosophy, my publication record, my research experience at Emory University, and my teaching credentials could contribute to the Philosophy Faculty at PHINMA Cagayan de Oro College."),

    closing("Respectfully yours,"),

    ...signature("AHMED ALI", "Philosopher, Author, and Educator"),

    new Paragraph({ spacing: { before: 200, after: 60 }, children: [t("Enclosures:", { size: 20, color: C.gray, bold: true })] }),
    ...bullets([
      "Curriculum Vitae with supporting documents",
      "Copies of academic and professional credentials",
      "Copy of published book: Depth of Knowledge (2026)",
    ]),
  ];

  return new Document({
    creator: "Ahmed Ali",
    title: "Cover Letter " + EM + " PHINMA CDO Philosophy Faculty " + EM + " Ahmed Ali",
    styles: { default: { document: { run: { font: BODY, size: 22 }, paragraph: { spacing: { line: 312 } } } } },
    sections: [{ properties: { page: { margin: { top: 720, bottom: 720, left: 1080, right: 1080 } } }, children: elements }],
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════════════════

async function main() {
  const outDir = "/home/z/my-project/download/Philosophy_Applications";
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  console.log("Generating Academic CV (shared)...");
  const cv = await Packer.toBuffer(buildAcademicCV());
  fs.writeFileSync(`${outDir}/Academic_CV_Ahmed_Ali.docx`, cv);
  console.log(`  ${(cv.length / 1024).toFixed(1)} KB`);

  console.log("Generating CMU Application Letter to Dr. Eballe...");
  const cmuLetter = await Packer.toBuffer(buildCMULetter());
  fs.writeFileSync(`${outDir}/CMU_Application_Letter_to_Dr_Eballe.docx`, cmuLetter);
  console.log(`  ${(cmuLetter.length / 1024).toFixed(1)} KB`);

  console.log("Generating SWU PHINMA Cover Letter...");
  const swuLetter = await Packer.toBuffer(buildSWULetter());
  fs.writeFileSync(`${outDir}/SWU_PHINMA_Cover_Letter.docx`, swuLetter);
  console.log(`  ${(swuLetter.length / 1024).toFixed(1)} KB`);

  console.log("Generating PHINMA CDO Cover Letter...");
  const cdoLetter = await Packer.toBuffer(buildCDOLetter());
  fs.writeFileSync(`${outDir}/PHINMA_CDO_Cover_Letter.docx`, cdoLetter);
  console.log(`  ${(cdoLetter.length / 1024).toFixed(1)} KB`);

  console.log("Done. All files saved to " + outDir);
}
main().catch(console.error);
