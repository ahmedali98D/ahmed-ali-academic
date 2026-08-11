#!/usr/bin/env node
/**
 * Resume generator v4 — preserves ALL original content + website updates.
 * Layout: compact header + single-column flow.
 * Justified body text, proper spacing, no content deletion.
 * Pages: as many as the content requires (3-4 is fine).
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
  mist: "888888", silver: "AAAAAA", parchment: "F5F2EE", line: "D4CFC8",
};
const F = "Georgia", S = "Helvetica";

function t(text, o = {}) {
  return new TextRun({ text, font: o.font || F, size: o.size || 19, color: o.color || C.ink, bold: o.bold || false, italics: o.italics || false, characterSpacing: o.spacing || 0 });
}
function ln(url, text, color = C.teal) {
  return new ExternalHyperlink({ link: url, children: [new TextRun({ text, font: S, size: 15, color, underline: { type: "single", color } })] });
}
function heading(text) {
  return [
    new Paragraph({ spacing: { before: 220, after: 40 }, children: [t(text.toUpperCase(), { font: S, size: 16, color: C.navy, bold: true, spacing: 80 })] }),
    new Paragraph({ spacing: { after: 60 }, border: { bottom: { color: C.navy, space: 1, style: BorderStyle.SINGLE, size: 6 } }, children: [new TextRun({ text: "" })] }),
  ];
}
function job(title, org, period, bullets) {
  const ch = [
    new Paragraph({ spacing: { before: 140, after: 8 }, children: [t(title, { size: 20, color: C.navy, bold: true })] }),
    new Paragraph({ spacing: { after: 8 }, children: [t(org, { size: 18, color: C.teal, italics: true }), t("  \u00B7  ", { size: 17, color: C.silver }), t(period, { font: S, size: 15, color: C.mist })] }),
  ];
  for (const b of bullets) ch.push(new Paragraph({ spacing: { after: 20, line: 228 }, indent: { left: 220, hanging: 130 }, alignment: AlignmentType.JUSTIFIED, children: [t("\u2013  ", { color: C.teal }), t(b)] }));
  return ch;
}
function bullets(items) {
  return items.map(i => new Paragraph({ spacing: { after: 20, line: 228 }, indent: { left: 220, hanging: 130 }, alignment: AlignmentType.JUSTIFIED, children: [t("\u2013  ", { color: C.teal }), t(i)] }));
}
function edu(degree, inst, period, detail) {
  const ch = [
    new Paragraph({ spacing: { before: 100, after: 8 }, children: [t(degree, { size: 19, color: C.navy, bold: true })] }),
    new Paragraph({ spacing: { after: 8 }, children: [t(inst, { size: 18, color: C.teal, italics: true }), t("  \u00B7  ", { size: 17, color: C.silver }), t(period, { font: S, size: 15, color: C.mist })] }),
  ];
  if (detail) ch.push(new Paragraph({ spacing: { after: 30, line: 228 }, alignment: AlignmentType.JUSTIFIED, children: [t(detail, { size: 17, color: C.graphite })] }));
  return ch;
}

function header(name, roles, contact, links) {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE }, insideHorizontal: { style: BorderStyle.NONE }, insideVertical: { style: BorderStyle.NONE } },
    rows: [new TableRow({ cantSplit: true, children: [new TableCell({ width: { size: 100, type: WidthType.PERCENTAGE }, margins: { top: 260, bottom: 140, left: 500, right: 500 }, shading: { type: ShadingType.CLEAR, fill: C.parchment }, children: [
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 60, after: 15 }, children: name }),
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 40 }, children: roles }),
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 15 }, children: contact }),
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 60 }, children: links }),
    ] })] })],
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// OPERATIONS RESUME — preserves ALL original bullets + website updates
// ═══════════════════════════════════════════════════════════════════════════

function buildOps() {
  const hdr = header(
    [t("AHMED ", { size: 34, color: C.navy, bold: true, spacing: 40 }), t("ALI", { size: 34, color: C.teal, bold: true, spacing: 40 })],
    [t("Operations Leader  \u00B7  Author  \u00B7  Systems Architect  \u00B7  Educator", { font: S, size: 15, color: C.graphite, spacing: 20 })],
    [t("Abu Dhabi, UAE  \u00B7  +971 56 166 9766  \u00B7  ", { font: S, size: 15, color: C.mist }), ln("mailto:ahmedmahmoudsaeed98@gmail.com", "ahmedmahmoudsaeed98@gmail.com")],
    [ln("https://ahmed-ali-ops.vercel.app/", "Portfolio"), t("   |   ", { font: S, size: 14, color: C.silver }), ln("https://phronesis-studio.com/", "Studio of Phronesis"), t("   |   ", { font: S, size: 14, color: C.silver }), ln("https://linkedin.com/in/ahmedmahmoudsaeedahmedali", "LinkedIn"), t("   |   ", { font: S, size: 14, color: C.silver }), ln("https://www.amazon.com/author/ahmed-ali", "Amazon Author"), t("   |   ", { font: S, size: 14, color: C.silver }), ln("https://phronesis-studio.com/en/publications/depth-of-knowledge", "Book")]
  );

  const main = [
    // Profile — updated with Author + Studio, Abu Dhabi
    ...heading("Profile"),
    new Paragraph({ spacing: { after: 50, line: 240 }, alignment: AlignmentType.JUSTIFIED, children: [t(
      "High-impact Operations Leader, Author, and Systems Architect with 8+ years of progressive experience driving operational excellence, revenue growth, and team performance across Academia, Retail, Contact Centers, Telecommunications, and Family Entertainment sectors in the UAE, UK, and Egypt. Proven track record of achieving 21% year-one revenue growth despite a decline in footfall, securing four rapid promotions with three salary increments and early completion of probation within a single organization, and introducing performance frameworks that became organizational benchmarks. Experienced Internal Auditor (ISO 9001 & ISO 45001) with expertise in compliance, process optimization, and multi-site operations. Author of \"Depth of Knowledge: A Practical Guide to Designing Rigorous Questions Without AI\" (2026). Founder of Studio of Phronesis, building production-grade software systems for education and real estate. Bilingual in Arabic (native) and English (Academic IELTS Band 7).",
      { size: 19 })] }),

    // Experience — ALL original bullets preserved + Al Nahda added + AAKPS updated
    ...heading("Experience"),

    // NEW: Al Nahda role (from phronesis-studio.com)
    ...job("English Social Studies Teacher", "Al Nahda National School for Boys, Abu Dhabi, UAE", "Aug 2026 \u2013 Present",
      ["Teaching English Social Studies at Al Nahda National School for Boys, commencing the 2026/2027 academic year."]
    ),

    // UPDATED: AAKPS title + end date + bullets from phronesis-studio.com
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

    // ORIGINAL: Cheeky Monkeys — ALL bullets preserved
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

    // ORIGINAL: Etisalat — ALL bullets preserved
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

    // ORIGINAL: Vodafone — ALL bullets preserved
    ...job("International Account Advisor", "Vodafone UK, Remote", "Mar 2019 \u2013 Jul 2022",
      [
        "Managed a high-volume portfolio of UK-based customer accounts, delivering exceptional service in telecom product support, billing inquiries, and complex issue resolution.",
        "Provided peer mentoring and training to new team members, enhancing overall team performance and accelerating onboarding processes.",
        "Consistently met daily performance targets and service-level agreements (SLAs) while maintaining high customer satisfaction and retention rates.",
        "Adapted communication style to diverse audiences, fostering positive relationships with clients and colleagues across cultural contexts.",
        "Strengthened organizational and time management skills in a fast-paced, target-driven contact center environment.",
      ]
    ),

    // ORIGINAL: FEED — ALL bullets preserved
    ...job("Team Leader", "FEED, Alexandria, Egypt", "Feb 2017 \u2013 Feb 2019",
      [
        "Led multiple divisions including Natural Products, Sports, Plants, Carpentry, Translation, and Public Relations within a community permaculture initiative.",
        "Managed and mentored a diverse team of volunteers, coordinating task assignments and ensuring effective multi-disciplinary project delivery.",
        "Developed and implemented structured programmes promoting sustainability, environmental education, and community engagement.",
        "Conducted regular performance evaluations and provided coaching to improve participant skills, motivation, and project outcomes.",
        "Oversaw public relations efforts, increasing project visibility and community participation through targeted outreach campaigns.",
      ]
    ),

    // ORIGINAL: Emory — preserved
    ...job("Research Assistant and Translator", "Emory University (with Ustadh Dr. Rahimjon Abdugafurov)", "2017",
      ["Transcribed and analyzed historical manuscripts in Islamic Civilization with a focus on philosophical and theological contexts. Produced English\u2013Arabic translations of academic works for use in bilingual educational settings and contributed scholarly material."]
    ),

    // NEW: Publications section
    ...heading("Publication"),
    new Paragraph({ spacing: { before: 100, after: 8 }, children: [t("Depth of Knowledge: A Practical Guide to Designing Rigorous Questions Without AI", { size: 20, color: C.navy, bold: true, italics: true })] }),
    new Paragraph({ spacing: { after: 15 }, children: [t("Self-published, First Edition, 2026  |  ISBN: 979-8-1913137-5-7  |  149 pages  |  Paperback $19.99, eBook $9.99", { font: S, size: 14, color: C.mist })] }),
    new Paragraph({ spacing: { after: 25 }, children: [t("Available globally on Amazon. ", { size: 18 }), ln("https://www.amazon.com/author/ahmed-ali", "Buy on Amazon"), t("   |   ", { font: S, size: 14, color: C.silver }), ln("https://phronesis-studio.com/en/publications/depth-of-knowledge", "Book Details Page")] }),
    new Paragraph({ spacing: { after: 40, line: 228 }, alignment: AlignmentType.JUSTIFIED, children: [t("A handbook that restores to educators the craft of writing cognitively demanding questions from lesson content alone, without relying on AI tools. Grounded in Norman Webb's Depth of Knowledge framework, returns to his original 1997 and 2002 monographs as primary sources, and corrects the widespread misinterpretation perpetuated by the unauthorized DOK Wheel. The method is verified by reverse-coding. A substantial chapter traces the principle that recall is not reasoning through the Islamic intellectual tradition, from Al-Hasan al-Basri in the eighth century to Ibn Khaldun's four-level progression in the Muqaddimah.", { size: 18, color: C.graphite, italics: true })] }),

    // Education — original detail preserved
    ...heading("Education"),
    ...edu("Postgraduate Diploma in Education", "Faculty of Education, Al-Azhar University", "Sep 2024 \u2013 Sep 2025",
      "Completed a one-year teacher preparation program with a focus on educational psychology, curriculum development, pedagogy, and effective instructional methods applicable to diverse subjects and learners."),
    ...edu("Bachelor's Degree in Philosophy", "Faculty of Arts, Alexandria University, Egypt", "Sep 2016 \u2013 May 2021",
      "Focused on logic, ethics, epistemology, metaphysics, education, psychology, and critical thinking. Developed strong analytical, research, academic, and teaching-relevant skills."),

    // Core Competencies — ALL original items preserved
    ...heading("Core Competencies"),
    ...bullets([
      "Operations & Facility Management (Retail, Contact Center, Entertainment, Education)",
      "Strategic Planning & Financial Forecasting",
      "Sales Strategy, Revenue Growth & KPI Achievement",
      "Team Leadership, Coaching & Performance Management",
      "Safeguarding & Child Protection Awareness",
      "ISO 9001 & ISO 45001 Compliance & Internal Audit",
      "Curriculum Design & Academic Quality Assurance (ADEK, Irtiqa'a)",
      "Client Acquisition, Retention & Stakeholder Management",
      "Cross-Functional Collaboration & Change Management",
      "Vendor Negotiation & Supply Chain Coordination",
      "Educational Technology Integration & Digital Transformation",
      "Differentiated Instruction & Inclusive Education Practices",
      "Bilingual Communication \u2014 English (C1, IELTS 7) & Native Arabic",
    ]),

    // Certifications — ALL original items preserved
    ...heading("Certifications"),
    ...bullets([
      "Certified Professional Teaching License (Social Studies, Cycle 3) \u2014 UAE MoE \u2014 Valid until Feb 2029",
      "IELTS Academic Band 7 \u2014 Valid until Aug 2027",
      "Prepare For Your First Two Weeks & Differentiate with Small Groups and Centers \u2014 HMH \u2014 Apr 2026",
      "Ready to Wrestle \u2014 United World Wrestling \u2014 Feb 2026",
      "Certified in AI for Educators (Level 1) \u2014 Teachy \u2014 Oct 2025",
      "Network Fundamentals & Network Security \u2014 Mahara Tech & MCIT, Egypt \u2014 Jun 2025",
      "Certified Advanced Person-in-Charge (PIC) \u2014 Dubai Municipality \u2014 May 2025",
      "Fire Warden Training (Level 2) \u2014 Dubai Civil Defence \u2014 Valid until Aug 2026",
      "Mastering Sales Excellence \u2014 e& Etisalat UAE \u2014 Apr 2024",
      "Front Line for Retail Sales \u2014 e& Etisalat UAE \u2014 Aug 2022",
      "Verification of Manuscripts in Philosophy & Theology \u2014 Bibliotheca Alexandrina \u2014 Nov 2021",
      "Critical Thinking & Decision Making \u2014 LinkedIn Learning \u2014 Jul 2021",
    ]),

    // Leadership Initiatives — ALL original items preserved
    ...heading("Leadership Initiatives & Projects"),

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

    ...job("Co-Organiser \u2014 3rd Annual International Conference, Department of Philosophy", "Alexandria University, Egypt", "Nov 2017",
      ["Co-organised the international conference on philosophical reading, creativity, and critical criticism."]
    ),

    // Additional Information
    ...heading("Additional Information"),
    ...bullets([
      "Languages: Arabic (Native), English (Fluent, C1, IELTS 7), Urdu (Beginner), Spanish (Beginner)",
      "Sports Coaching: Strength & Conditioning Coach, Swift Football Academy, Al Ain (2023\u20132024)",
      "Affiliations: Member, British Philosophical Association (BPA) \u2014 2025 to Present",
      "IT Skills: CompTIA (A+, Network+, Linux+), Microsoft Office Suite, Google Workspace, Educational Technology Platforms (HMH, Alef, Paradigm, MS Teams, Google Classroom, Canva, Teachy)",
    ]),
  ];

  return new Document({
    creator: "Ahmed Ali", title: "Ahmed Ali \u2014 Operations Resume",
    styles: { default: { document: { run: { font: F, size: 19 }, paragraph: { spacing: { line: 234 } } } } },
    sections: [{ properties: { page: { margin: { top: 0, bottom: 360, left: 560, right: 560 } } }, children: [hdr, ...main] }],
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// TEACHING RESUME — preserves ALL original bullets + website updates
// ═══════════════════════════════════════════════════════════════════════════

function buildTeach() {
  const hdr = header(
    [t("AHMED ", { size: 34, color: C.navy, bold: true, spacing: 40 }), t("ALI", { size: 34, color: C.teal, bold: true, spacing: 40 })],
    [t("Humanities Educator  \u00B7  Philosopher  \u00B7  Author", { font: S, size: 15, color: C.graphite, spacing: 20 })],
    [t("Abu Dhabi, UAE  \u00B7  +971 56 166 9766  \u00B7  ", { font: S, size: 15, color: C.mist }), ln("mailto:ahmed.ali.academic@gmail.com", "ahmed.ali.academic@gmail.com")],
    [ln("https://mr-ahmed-ali.vercel.app/", "Academic Portfolio"), t("   |   ", { font: S, size: 14, color: C.silver }), ln("https://phronesis-studio.com/", "Studio of Phronesis"), t("   |   ", { font: S, size: 14, color: C.silver }), ln("https://linkedin.com/in/ahmedmahmoudsaeedahmedali", "LinkedIn"), t("   |   ", { font: S, size: 14, color: C.silver }), ln("https://www.amazon.com/author/ahmed-ali", "Amazon Author"), t("   |   ", { font: S, size: 14, color: C.silver }), ln("https://phronesis-studio.com/en/publications/depth-of-knowledge", "Book")]
  );

  const main = [
    // Profile — updated with Author + Abu Dhabi
    ...heading("Profile"),
    new Paragraph({ spacing: { after: 50, line: 240 }, alignment: AlignmentType.JUSTIFIED, children: [t(
      "ADEK-approved Social Studies and Islamic Education teacher with demonstrated expertise across Grades 1\u201312 in the American Curriculum. Skilled in inquiry-driven lesson design, effective differentiation for ELLs and gifted learners, and both in-class and distance learning delivery. Experienced in leading Model United Nations programmes, integrating educational technology platforms (HMH, Alef, Paradigm, MS Teams, Google Classroom, Canva, Teachy), and fostering critical thinking, cultural literacy, and global citizenship. Author of \"Depth of Knowledge: A Practical Guide to Designing Rigorous Questions Without AI\" (2026). Holds a valid UAE Teaching License and Academic IELTS Band 7.",
      { size: 19 })] }),

    // Experience — ALL original bullets preserved + Al Nahda added + AAKPS updated
    ...heading("Experience"),

    ...job("English Social Studies Teacher", "Al Nahda National School for Boys, Abu Dhabi, UAE", "Aug 2026 \u2013 Present",
      ["Teaching English Social Studies at Al Nahda National School for Boys, commencing the 2026/2027 academic year."]
    ),

    // UPDATED: AAKPS title + end date + bullets (merged original + website updates)
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

    // ORIGINAL: Cheeky Monkeys — ALL bullets preserved
    ...job("Branch Operations Manager (ISO-Certified Child-Focused Facility)", "Cheeky Monkeys Playland LLC, UAE", "May 2024 \u2013 Sep 2025",
      [
        "Led a safe, child-centered learning environment, designing and supervising engaging activities (arts, crafts, structured play) that support early childhood development, creativity, and social skills.",
        "Ensured quality, safety, and staff development in a child-focused setting, applying ISO 9001 and ISO 45001 standards while training and guiding staff to maintain high educational and wellbeing standards.",
      ]
    ),

    // ORIGINAL: Emory — preserved
    ...job("Research Assistant and Translator", "Emory University (with Ustadh Dr. Rahimjon Abdugafurov)", "2017",
      ["Transcribed and analyzed historical manuscripts in Islamic Civilization with a focus on philosophical and theological contexts. Produced English\u2013Arabic translations of academic works for use in bilingual educational settings and contributed scholarly material."]
    ),

    // NEW: Publications section
    ...heading("Publication"),
    new Paragraph({ spacing: { before: 100, after: 8 }, children: [t("Depth of Knowledge: A Practical Guide to Designing Rigorous Questions Without AI", { size: 20, color: C.navy, bold: true, italics: true })] }),
    new Paragraph({ spacing: { after: 15 }, children: [t("Self-published, First Edition, 2026  |  ISBN: 979-8-1913137-5-7  |  149 pages  |  Paperback $19.99, eBook $9.99", { font: S, size: 14, color: C.mist })] }),
    new Paragraph({ spacing: { after: 25 }, children: [t("Available globally on Amazon. ", { size: 18 }), ln("https://www.amazon.com/author/ahmed-ali", "Buy on Amazon"), t("   |   ", { font: S, size: 14, color: C.silver }), ln("https://phronesis-studio.com/en/publications/depth-of-knowledge", "Book Details Page")] }),
    new Paragraph({ spacing: { after: 40, line: 228 }, alignment: AlignmentType.JUSTIFIED, children: [t("A handbook that restores to educators the craft of writing cognitively demanding questions from lesson content alone, without relying on AI tools. Grounded in Norman Webb's Depth of Knowledge framework, returns to his original 1997 and 2002 monographs as primary sources, and corrects the widespread misinterpretation perpetuated by the unauthorized DOK Wheel. The method is verified by reverse-coding. Includes 12 chapters, 11 printable classroom resources, a verb-agnostic question stem library, and worked examples across seven subjects. A substantial chapter traces the principle that recall is not reasoning through the Islamic intellectual tradition, from Al-Hasan al-Basri to Ibn Khaldun.", { size: 18, color: C.graphite, italics: true })] }),

    // Education — original detail preserved
    ...heading("Education"),
    ...edu("Postgraduate Diploma in Education", "Faculty of Education, Al-Azhar University", "Sep 2024 \u2013 Sep 2025",
      "Completed a one-year teacher preparation program with a focus on educational psychology, curriculum development, pedagogy, and effective instructional methods applicable to diverse subjects and learners."),
    ...edu("Bachelor's Degree in Philosophy", "Faculty of Arts, Alexandria University, Egypt", "Sep 2016 \u2013 May 2021",
      "Focused on logic, ethics, epistemology, metaphysics, education, psychology, and critical thinking. Developed strong analytical, research, academic, and teaching-relevant skills."),

    // Core Competencies — ALL original items preserved
    ...heading("Core Competencies"),
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

    // Certifications — ALL original items preserved
    ...heading("Certifications"),
    ...bullets([
      "Certified Professional Teaching License (Social Studies, Cycle 3) \u2014 UAE MoE \u2014 Valid until Feb 2029",
      "IELTS Academic Band 7 \u2014 Valid until Aug 2027",
      "Prepare For Your First Two Weeks & Differentiate with Small Groups and Centers \u2014 HMH \u2014 Apr 2026",
      "Ready to Wrestle \u2014 United World Wrestling \u2014 Feb 2026",
      "Certified in AI for Educators (Level 1) \u2014 Teachy \u2014 Oct 2025",
      "Fire Warden Training (Level 2) \u2014 Dubai Civil Defence \u2014 Valid until Aug 2026",
      "Verification of Manuscripts in Philosophy & Theology \u2014 Bibliotheca Alexandrina \u2014 Nov 2021",
      "Critical Thinking & Decision Making \u2014 LinkedIn Learning \u2014 Jul 2021",
    ]),

    // Educational Initiatives — ALL original items preserved
    ...heading("Educational Initiatives and Projects"),

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

    // Additional Information
    ...heading("Additional Information"),
    ...bullets([
      "Languages: Arabic (Native), English (Fluent, C1, IELTS 7), Urdu (Beginner), Spanish (Beginner)",
      "Sports Coaching: Strength & Conditioning Coach, Swift Football Academy, Al Ain (2023\u20132024)",
      "Affiliations: Member, British Philosophical Association (BPA) \u2014 2025 to Present",
      "Conference Organisation: Co-organised the 3rd Annual International Conference, Dept. of Philosophy, Alexandria University (Nov 2017)",
      "IT Skills: CompTIA (A+, Network+, Linux+), Microsoft Office Suite, Google Workspace, Educational Technology Platforms",
    ]),
  ];

  return new Document({
    creator: "Ahmed Ali", title: "Ahmed Ali \u2014 Teaching Resume",
    styles: { default: { document: { run: { font: F, size: 19 }, paragraph: { spacing: { line: 234 } } } } },
    sections: [{ properties: { page: { margin: { top: 0, bottom: 360, left: 560, right: 560 } } }, children: [hdr, ...main] }],
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
