#!/usr/bin/env node
/**
 * Generate two updated resume DOCX files:
 * 1. Ahmed_Ali_Operations_Resume.docx (Professional/Operations)
 * 2. Ahmed_Ali_Teaching_Resume.docx (Academic/Teaching)
 *
 * Both are updated to match the authoritative online information from:
 * - phronesis-studio.com/en/about
 * - mr-ahmed-ali.vercel.app
 * - ahmed-ali-ops.vercel.app
 */

const {
  Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType,
  BorderStyle, TabStopType, TabStopPosition, ExternalHyperlink,
  Table, TableRow, TableCell, WidthType, ShadingType, convertInchesToTwip,
  PageNumber, NumberFormat, Header, Footer, HorizontalPositionAlign,
  VerticalPositionAlign, HorizontalPositionRelativeFrom, VerticalPositionRelativeFrom,
} = require("docx");
const fs = require("fs");

// ─── Shared colors and styles ──────────────────────────────────────────────
const NAVY = "0A1628";
const TEAL = "0F5C5E";
const GOLD = "C9A84C";
const STEEL = "1E3A5F";
const GRAY = "666666";
const LIGHT_GRAY = "999999";
const WHITE = "FFFFFF";

const FONT = "Calibri";
const MONO = "Consolas";

// ─── Helper: hyperlink ─────────────────────────────────────────────────────
function hyperlink(url, text, color = TEAL) {
  return new ExternalHyperlink({
    link: url,
    children: [new TextRun({ text, style: "Hyperlink", color, underline: { type: "single", color } })],
  });
}

// ─── Helper: section heading ───────────────────────────────────────────────
function sectionHeading(text) {
  return new Paragraph({
    spacing: { before: 300, after: 120 },
    border: { bottom: { color: TEAL, space: 4, style: BorderStyle.SINGLE, size: 6 } },
    children: [new TextRun({ text: text.toUpperCase(), bold: true, size: 22, color: TEAL, font: FONT, characterSpacing: 40 })],
  });
}

// ─── Helper: job entry ─────────────────────────────────────────────────────
function jobEntry(title, org, period, bullets) {
  const children = [
    new Paragraph({
      spacing: { before: 200, after: 40 },
      children: [
        new TextRun({ text: title, bold: true, size: 22, color: NAVY, font: FONT }),
        new TextRun({ text: "  |  ", size: 20, color: LIGHT_GRAY, font: FONT }),
        new TextRun({ text: org, size: 20, color: STEEL, font: FONT }),
      ],
    }),
    new Paragraph({
      spacing: { after: 80 },
      children: [new TextRun({ text: period, italics: true, size: 18, color: GRAY, font: FONT })],
    }),
  ];
  for (const b of bullets) {
    children.push(new Paragraph({
      spacing: { after: 40 },
      indent: { left: 360, hanging: 200 },
      children: [
        new TextRun({ text: "\u2022  ", size: 20, color: TEAL, font: FONT }),
        new TextRun({ text: b, size: 20, color: "333333", font: FONT }),
      ],
    }));
  }
  return children;
}

// ─── Helper: education entry ───────────────────────────────────────────────
function eduEntry(degree, institution, period, detail) {
  const children = [
    new Paragraph({
      spacing: { before: 160, after: 30 },
      children: [
        new TextRun({ text: degree, bold: true, size: 22, color: NAVY, font: FONT }),
      ],
    }),
    new Paragraph({
      spacing: { after: 30 },
      children: [
        new TextRun({ text: institution, size: 20, color: STEEL, font: FONT }),
        new TextRun({ text: "  |  ", size: 18, color: LIGHT_GRAY, font: FONT }),
        new TextRun({ text: period, italics: true, size: 18, color: GRAY, font: FONT }),
      ],
    }),
  ];
  if (detail) {
    children.push(new Paragraph({
      spacing: { after: 80 },
      children: [new TextRun({ text: detail, size: 19, color: GRAY, font: FONT })],
    }));
  }
  return children;
}

// ─── Helper: bullet list ───────────────────────────────────────────────────
function bulletList(items) {
  return items.map(item => new Paragraph({
    spacing: { after: 40 },
    indent: { left: 360, hanging: 200 },
    children: [
      new TextRun({ text: "\u2022  ", size: 20, color: TEAL, font: FONT }),
      new TextRun({ text: item, size: 20, color: "333333", font: FONT }),
    ],
  }));
}

// ─── Helper: two-column table ──────────────────────────────────────────────
function twoColTable(leftLabel, leftValue, rightLabel, rightValue) {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 1, color: "DDDDDD" },
      bottom: { style: BorderStyle.SINGLE, size: 1, color: "DDDDDD" },
      left: { style: BorderStyle.SINGLE, size: 1, color: "DDDDDD" },
      right: { style: BorderStyle.SINGLE, size: 1, color: "DDDDDD" },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: "DDDDDD" },
      insideVertical: { style: BorderStyle.SINGLE, size: 1, color: "DDDDDD" },
    },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 50, type: WidthType.PERCENTAGE },
            margins: { top: 80, bottom: 80, left: 120, right: 120 },
            children: [
              new Paragraph({ children: [new TextRun({ text: leftLabel, bold: true, size: 18, color: TEAL, font: FONT, characterSpacing: 20 })] }),
              new Paragraph({ spacing: { before: 20 }, children: [new TextRun({ text: leftValue, size: 19, color: "333333", font: FONT })] }),
            ],
          }),
          new TableCell({
            width: { size: 50, type: WidthType.PERCENTAGE },
            margins: { top: 80, bottom: 80, left: 120, right: 120 },
            children: [
              new Paragraph({ children: [new TextRun({ text: rightLabel, bold: true, size: 18, color: TEAL, font: FONT, characterSpacing: 20 })] }),
              new Paragraph({ spacing: { before: 20 }, children: [new TextRun({ text: rightValue, size: 19, color: "333333", font: FONT })] }),
            ],
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
  return new Document({
    creator: "Ahmed Ali",
    title: "Ahmed Ali - Operations & Leadership Resume",
    description: "Professional resume for Ahmed Ali",
    styles: {
      default: {
        document: {
          run: { font: FONT, size: 20 },
          paragraph: { spacing: { line: 276 } },
        },
      },
    },
    sections: [{
      properties: {
        page: {
          margin: { top: convertInchesToTwip(0.6), bottom: convertInchesToTwip(0.6), left: convertInchesToTwip(0.7), right: convertInchesToTwip(0.7) },
        },
      },
      children: [
        // ─── Header ─────────────────────────────────────────────────────
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 60 },
          children: [new TextRun({ text: "AHMED ALI", bold: true, size: 36, color: NAVY, font: FONT, characterSpacing: 60 })],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 80 },
          children: [
            new TextRun({ text: "Operations & Leadership Professional", size: 22, color: TEAL, font: FONT }),
            new TextRun({ text: "  |  ", size: 20, color: LIGHT_GRAY }),
            new TextRun({ text: "Author", size: 22, color: TEAL, font: FONT }),
            new TextRun({ text: "  |  ", size: 20, color: LIGHT_GRAY }),
            new TextRun({ text: "Systems Architect", size: 22, color: TEAL, font: FONT }),
            new TextRun({ text: "  |  ", size: 20, color: LIGHT_GRAY }),
            new TextRun({ text: "Educator", size: 22, color: TEAL, font: FONT }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 40 },
          children: [
            new TextRun({ text: "Abu Dhabi, UAE  |  +971 56 166 9766  |  ", size: 18, color: GRAY, font: FONT }),
            hyperlink("mailto:ahmedmahmoudsaeed98@gmail.com", "ahmedmahmoudsaeed98@gmail.com"),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 40 },
          children: [
            new TextRun({ text: "Portfolio: ", size: 18, color: GRAY, font: FONT }),
            hyperlink("https://ahmed-ali-ops.vercel.app/", "ahmed-ali-ops.vercel.app"),
            new TextRun({ text: "  |  Studio: ", size: 18, color: GRAY, font: FONT }),
            hyperlink("https://phronesis-studio.com/", "phronesis-studio.com"),
            new TextRun({ text: "  |  LinkedIn: ", size: 18, color: GRAY, font: FONT }),
            hyperlink("https://linkedin.com/in/ahmedmahmoudsaeedahmedali", "linkedin.com/in/ahmedmahmoudsaeedahmedali"),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 60 },
          children: [
            new TextRun({ text: "Book: ", size: 18, color: GRAY, font: FONT }),
            hyperlink("https://phronesis-studio.com/en/publications/depth-of-knowledge", "Depth of Knowledge: A Practical Guide to Designing Rigorous Questions Without AI"),
          ],
        }),

        // ─── Summary ───────────────────────────────────────────────────
        sectionHeading("Summary"),
        new Paragraph({
          spacing: { after: 120 },
          alignment: AlignmentType.JUSTIFIED,
          children: [new TextRun({
            text: "High-impact Operations Leader, Author, and Educator with 8+ years of progressive experience driving operational excellence, revenue growth, and team performance across Academia, Retail, Telecommunications, and Family Entertainment in the UAE, UK, and Egypt. Proven track record of 21% year-one revenue growth, four rapid promotions within a single organization, and ISO 9001/45001 compliance. Author of \"Depth of Knowledge: A Practical Guide to Designing Rigorous Questions Without AI\" (2026). Founder of Studio of Phronesis, building production-grade software systems for education and real estate. Bilingual in Arabic (native) and English (IELTS Band 7).",
            size: 20, color: "333333", font: FONT,
          })],
        }),

        // ─── Work Experience ───────────────────────────────────────────
        sectionHeading("Work Experience"),

        ...jobEntry(
          "English Social Studies Teacher",
          "Al Nahda National School for Boys, Abu Dhabi, UAE",
          "Aug 2026 - Present",
          [
            "Teaching English Social Studies at Al Nahda National School for Boys, commencing the 2026/2027 academic year.",
          ]
        ),

        ...jobEntry(
          "MSC Studies & Islamic Education B Teacher and Lead of Non-Arabic Speaking Section",
          "Ain Al Khaleej Private School, American Division, UAE",
          "Sep 2025 - Jul 2026",
          [
            "Delivered MSC Studies and Islamic Education B through English-medium instruction, ensuring ADEK and Irtiqa'a compliance.",
            "Promoted from Subject Teacher to Lead of Non-Arabic Speaking Section in Term 2.",
            "Mentored department teachers in differentiated instruction, educational technology integration, safeguarding, inclusive education, and UAE national identity.",
            "Appointed Faculty Head for Model United Nations in Term 2, taking charge of the school delegation programme.",
            "Coached the delegation to win Best School at MANORMUN V 2026, developing students' diplomatic reasoning, research writing, and public speaking.",
            "Active contributor to the school's \"Student First\" initiative and a campus-wide source of mentorship and emotional support for students beyond his own classes.",
          ]
        ),

        ...jobEntry(
          "Branch Operations Manager",
          "Cheeky Monkeys Playland LLC, UAE",
          "May 2024 - Sep 2025",
          [
            "Achieved 21% revenue growth in the first year despite a decline in footfall, through optimized service packages and stronger vendor partnerships.",
            "Earned four rapid promotions, three salary increments, and early completion of probation within one year.",
            "Directed daily operations of a 1,700 sqm facility with a 12-person cross-functional team, maintaining ISO 9001 and ISO 45001 compliance and an 'A' municipal hygiene rating.",
            "Negotiated vendor partnerships that reduced operational costs while maintaining service quality.",
            "Partnered with senior leadership on strategic planning, staffing, and branch expansion initiatives.",
          ]
        ),

        ...jobEntry(
          "Sales Executive and Duty Manager",
          "e& Etisalat UAE, Al Ain Mall Branch",
          "Jul 2022 - Jun 2024",
          [
            "Ranked as the highest-performing executive in 2023 at Al Ain Mall Branch, consistently leading in sales KPIs and customer engagement metrics.",
            "Introduced Net Promoter Score (NPS) framework to Etisalat branch operations.",
            "Designed and led the first internal customer satisfaction training sessions.",
            "Frequently selected as Acting Duty Manager, overseeing branch operations.",
            "Mentored junior staff in product knowledge, upselling, and customer service.",
            "Certifications: Frontline for Retail Sales (2022), Mastering Sales Excellence (2024).",
          ]
        ),

        ...jobEntry(
          "International Account Advisor",
          "Vodafone UK, Remote",
          "Mar 2019 - Jul 2022",
          [
            "Managed a high-volume portfolio of UK-based customer accounts in a fast-paced, target-driven contact center environment.",
            "Provided peer mentoring and training to new team members.",
            "Consistently met daily performance targets and service-level agreements.",
          ]
        ),

        ...jobEntry(
          "Team Leader",
          "FEED, Alexandria, Egypt",
          "Feb 2017 - Feb 2019",
          [
            "Led multiple divisions within a community permaculture initiative, managing and mentoring diverse volunteer teams.",
            "Developed sustainability and environmental education programmes.",
            "Oversaw public relations efforts, increasing project visibility and community participation.",
          ]
        ),

        ...jobEntry(
          "Research Assistant and Translator",
          "Emory University (with Dr. Rahimjon Abdugafurov)",
          "2017",
          [
            "Transcribed and analyzed historical manuscripts in Islamic Civilization for Emory University research.",
            "Produced English-to-Arabic academic translations and contributed scholarly material.",
          ]
        ),

        // ─── Publications ──────────────────────────────────────────────
        sectionHeading("Publications"),
        new Paragraph({
          spacing: { before: 120, after: 40 },
          children: [
            new TextRun({ text: "Depth of Knowledge: A Practical Guide to Designing Rigorous Questions Without AI", bold: true, size: 22, color: NAVY, font: FONT }),
          ],
        }),
        new Paragraph({
          spacing: { after: 40 },
          children: [
            new TextRun({ text: "Self-published, First Edition, 2026  |  ISBN: 979-8-1913137-5-7  |  149 pages  |  Paperback $19.99, eBook $9.99", size: 18, color: GRAY, font: FONT }),
          ],
        }),
        new Paragraph({
          spacing: { after: 40 },
          children: [
            new TextRun({ text: "Available globally on Amazon. ", size: 19, color: "333333", font: FONT }),
            hyperlink("https://www.amazon.com/author/ahmed-ali", "Buy on Amazon"),
            new TextRun({ text: "  |  ", size: 18, color: LIGHT_GRAY }),
            hyperlink("https://phronesis-studio.com/en/publications/depth-of-knowledge", "Book Details Page"),
          ],
        }),
        new Paragraph({
          spacing: { after: 60 },
          alignment: AlignmentType.JUSTIFIED,
          children: [new TextRun({
            text: "A handbook that restores to educators the craft of writing cognitively demanding questions from lesson content alone, without relying on AI tools. Grounded in Norman Webb's Depth of Knowledge framework, with a five-step content-first protocol verified by reverse-coding and a chapter tracing the principle through the Islamic intellectual tradition from Al-Hasan al-Basri to Ibn Khaldun.",
            size: 19, color: GRAY, font: FONT, italics: true,
          })],
        }),

        // ─── Education ─────────────────────────────────────────────────
        sectionHeading("Education"),
        ...eduEntry(
          "Postgraduate Diploma in Education",
          "Faculty of Education, Al-Azhar University",
          "Sep 2024 - Sep 2025",
          "Educational psychology, curriculum development, pedagogy, instructional methods. Grade: Very Good."
        ),
        ...eduEntry(
          "Bachelor of Arts in Philosophy",
          "Faculty of Arts, Alexandria University, Egypt",
          "Sep 2016 - May 2021",
          "Logic, ethics, epistemology, metaphysics, Islamic philosophy, Sufism, philosophy of language. Grade: Good. Attested by Egypt and UAE authorities; UAE MoE equivalency issued."
        ),

        // ─── Core Competencies ────────────────────────────────────────
        sectionHeading("Core Competencies"),
        ...bulletList([
          "Operations & Facility Management (Retail, Contact Center, Entertainment, Education)",
          "Strategic Planning & Financial Forecasting",
          "Sales Strategy, Revenue Growth & KPI Achievement",
          "Team Leadership, Coaching & Performance Management",
          "ISO 9001 & ISO 45001 Compliance & Internal Audit",
          "Curriculum Design & Academic Quality Assurance (ADEK, Irtiqa'a)",
          "Client Acquisition, Retention & Stakeholder Management",
          "Educational Technology Integration & Digital Transformation",
          "Bilingual Communication - English (C1, IELTS 7) & Native Arabic",
        ]),

        // ─── Certifications ────────────────────────────────────────────
        sectionHeading("Certifications"),
        ...bulletList([
          "Certified Professional Teaching License (Social Studies, Cycle 3) - UAE MoE - Valid until Feb 2029",
          "IELTS Academic Band 7 - Valid until Aug 2027",
          "Prepare For Your First Two Weeks & Differentiate with Small Groups and Centers - HMH - Apr 2026",
          "Ready to Wrestle - United World Wrestling - Feb 2026",
          "Certified in AI for Educators (Level 1) - Teachy - Oct 2025",
          "Network Fundamentals & Network Security - Mahara Tech & MCIT, Egypt - Jun 2025",
          "Certified Advanced Person-in-Charge (PIC) - Dubai Municipality - May 2025",
          "Fire Warden Training (Level 2) - Dubai Civil Defence - Valid until Aug 2026",
          "Mastering Sales Excellence - e& Etisalat UAE - Apr 2024",
          "Front Line for Retail Sales - e& Etisalat UAE - Aug 2022",
          "Verification of Manuscripts in Philosophy & Theology - Bibliotheca Alexandrina - Nov 2021",
          "Critical Thinking & Decision Making - LinkedIn Learning - Jul 2021",
        ]),

        // ─── Leadership Initiatives ────────────────────────────────────
        sectionHeading("Leadership Initiatives & Projects"),
        ...jobEntry(
          "Founder & Systems Architect",
          "Studio of Phronesis",
          "2024 - Present",
          [
            "Founded a personal studio producing bilingual educational content and production-grade software platforms.",
            "Built Real Estate Emperor (property management SaaS, 400+ units managed live), MSCS Academy (130 lessons, 390+ activities), DiplomatiQ (MUN operating system with AI evaluation), and Al Ain Real Estate (live listings site for a broker client).",
            "Produces the Echoes of Wisdom bilingual philosophy podcast (16 episodes across 2 seasons).",
          ]
        ),
        ...jobEntry(
          "Creator & Host - Echoes of Wisdom Podcast",
          "Independent Educational Initiative",
          "2026 - Present",
          [
            "Produces and hosts a bilingual (Arabic/English) philosophy podcast promoting philosophy as an accessible field of education.",
            "Bridges academic philosophy and public discourse, making complex ideas in ethics, logic, and epistemology understandable and actionable.",
          ]
        ),

        // ─── Additional ────────────────────────────────────────────────
        sectionHeading("Additional Information"),
        twoColTable(
          "Languages", "Arabic (Native) | English (Fluent, C1, IELTS 7) | Urdu (Beginner) | Spanish (Beginner)",
          "Sports Coaching", "Strength & Conditioning Coach, Swift Football Academy, Al Ain (2023-2024)"
        ),
        new Paragraph({ spacing: { before: 80 } }),
        twoColTable(
          "Affiliations", "Member, British Philosophical Association (BPA) - 2025 to Present",
          "IT Skills", "CompTIA (A+, Network+, Linux+), Microsoft Office Suite, Google Workspace, EdTech Platforms (HMH, Alef, Paradigm, MS Teams, Google Classroom, Canva, Teachy)"
        ),
      ],
    }],
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// RESUME 2: TEACHING / ACADEMIC
// ═══════════════════════════════════════════════════════════════════════════

function buildTeachingResume() {
  return new Document({
    creator: "Ahmed Ali",
    title: "Ahmed Ali - Teaching Resume",
    description: "Academic/Teaching resume for Ahmed Ali",
    styles: {
      default: {
        document: {
          run: { font: FONT, size: 20 },
          paragraph: { spacing: { line: 276 } },
        },
      },
    },
    sections: [{
      properties: {
        page: {
          margin: { top: convertInchesToTwip(0.6), bottom: convertInchesToTwip(0.6), left: convertInchesToTwip(0.7), right: convertInchesToTwip(0.7) },
        },
      },
      children: [
        // ─── Header ─────────────────────────────────────────────────────
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 60 },
          children: [new TextRun({ text: "AHMED ALI", bold: true, size: 36, color: NAVY, font: FONT, characterSpacing: 60 })],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 80 },
          children: [
            new TextRun({ text: "Humanities Educator", size: 22, color: TEAL, font: FONT }),
            new TextRun({ text: "  |  ", size: 20, color: LIGHT_GRAY }),
            new TextRun({ text: "Philosopher", size: 22, color: TEAL, font: FONT }),
            new TextRun({ text: "  |  ", size: 20, color: LIGHT_GRAY }),
            new TextRun({ text: "Author", size: 22, color: TEAL, font: FONT }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 40 },
          children: [
            new TextRun({ text: "Abu Dhabi, UAE  |  +971 56 166 9766  |  ", size: 18, color: GRAY, font: FONT }),
            hyperlink("mailto:ahmed.ali.academic@gmail.com", "ahmed.ali.academic@gmail.com"),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 40 },
          children: [
            new TextRun({ text: "Portfolio: ", size: 18, color: GRAY, font: FONT }),
            hyperlink("https://mr-ahmed-ali.vercel.app/", "mr-ahmed-ali.vercel.app"),
            new TextRun({ text: "  |  Studio: ", size: 18, color: GRAY, font: FONT }),
            hyperlink("https://phronesis-studio.com/", "phronesis-studio.com"),
            new TextRun({ text: "  |  LinkedIn: ", size: 18, color: GRAY, font: FONT }),
            hyperlink("https://linkedin.com/in/ahmedmahmoudsaeedahmedali", "linkedin.com/in/ahmedmahmoudsaeedahmedali"),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 60 },
          children: [
            new TextRun({ text: "Book: ", size: 18, color: GRAY, font: FONT }),
            hyperlink("https://phronesis-studio.com/en/publications/depth-of-knowledge", "Depth of Knowledge: A Practical Guide to Designing Rigorous Questions Without AI"),
          ],
        }),

        // ─── Summary ───────────────────────────────────────────────────
        sectionHeading("Summary"),
        new Paragraph({
          spacing: { after: 120 },
          alignment: AlignmentType.JUSTIFIED,
          children: [new TextRun({
            text: "Licensed UAE Educator with ADEK approval in Moral, Social, and Cultural Studies (MSC) and Islamic Education, qualified to deliver both subjects in Arabic-medium and English-medium classrooms (native Arabic speaker, Academic IELTS Band 7). Classroom practice spans Grades 1 to 12 in the American Curriculum, with direct subject mapping to IB MYP Individuals and Societies, Cambridge Global Perspectives, IB Diploma Theory of Knowledge, and A-Level Philosophy. Author of \"Depth of Knowledge: A Practical Guide to Designing Rigorous Questions Without AI\" (2026). Faculty Head for Model United Nations, coached students to win Best School at MANORMUN V 2026. BA in Philosophy (Alexandria University), PGDE (Al-Azhar University).",
            size: 20, color: "333333", font: FONT,
          })],
        }),

        // ─── Work Experience ───────────────────────────────────────────
        sectionHeading("Work Experience"),

        ...jobEntry(
          "English Social Studies Teacher",
          "Al Nahda National School for Boys, Abu Dhabi, UAE",
          "Aug 2026 - Present",
          [
            "Teaching English Social Studies at Al Nahda National School for Boys, commencing the 2026/2027 academic year.",
          ]
        ),

        ...jobEntry(
          "MSC Studies & Islamic Education B Teacher and Lead of Non-Arabic Speaking Section",
          "Ain Al Khaleej Private School, American Division, UAE",
          "Sep 2025 - Jul 2026",
          [
            "Delivered MSC Studies and Islamic Education B through English-medium instruction, ensuring ADEK and Irtiqa'a compliance.",
            "Promoted from Subject Teacher to Lead of Non-Arabic Speaking Section in Term 2.",
            "Mentored department teachers in differentiated instruction, educational technology integration, safeguarding, inclusive education, and UAE national identity.",
            "Appointed Faculty Head for Model United Nations in Term 2, taking charge of the school delegation programme.",
            "Coached the delegation to win Best School at MANORMUN V 2026, developing students' diplomatic reasoning, research writing, and public speaking.",
            "Active contributor to the school's \"Student First\" initiative and a campus-wide source of mentorship and emotional support for students beyond his own classes.",
          ]
        ),

        ...jobEntry(
          "Branch Operations Manager (ISO-Certified Facility)",
          "Cheeky Monkeys Playland LLC, UAE",
          "May 2024 - Sep 2025",
          [
            "Led a safe, child-centered learning environment, designing and supervising engaging activities that support early childhood development, creativity, and social skills.",
            "Ensured quality, safety, and staff development applying ISO 9001 and ISO 45001 standards while training and guiding staff.",
            "Achieved 21% revenue growth and earned four rapid promotions within one year.",
          ]
        ),

        ...jobEntry(
          "Research Assistant and Translator",
          "Emory University (with Dr. Rahimjon Abdugafurov)",
          "2017",
          [
            "Transcribed and analyzed historical manuscripts in Islamic Civilization with a focus on philosophical and theological contexts.",
            "Produced English-to-Arabic translations of academic works for bilingual educational settings.",
          ]
        ),

        // ─── Publications ──────────────────────────────────────────────
        sectionHeading("Publications"),
        new Paragraph({
          spacing: { before: 120, after: 40 },
          children: [
            new TextRun({ text: "Depth of Knowledge: A Practical Guide to Designing Rigorous Questions Without AI", bold: true, size: 22, color: NAVY, font: FONT }),
          ],
        }),
        new Paragraph({
          spacing: { after: 40 },
          children: [
            new TextRun({ text: "Self-published, First Edition, 2026  |  ISBN: 979-8-1913137-5-7  |  149 pages  |  Paperback $19.99, eBook $9.99", size: 18, color: GRAY, font: FONT }),
          ],
        }),
        new Paragraph({
          spacing: { after: 40 },
          children: [
            new TextRun({ text: "Available globally on Amazon. ", size: 19, color: "333333", font: FONT }),
            hyperlink("https://www.amazon.com/author/ahmed-ali", "Buy on Amazon"),
            new TextRun({ text: "  |  ", size: 18, color: LIGHT_GRAY }),
            hyperlink("https://phronesis-studio.com/en/publications/depth-of-knowledge", "Book Details Page"),
          ],
        }),
        new Paragraph({
          spacing: { after: 60 },
          alignment: AlignmentType.JUSTIFIED,
          children: [new TextRun({
            text: "A handbook that restores to educators the craft of writing cognitively demanding questions from lesson content alone, without relying on AI tools. Grounded in Norman Webb's Depth of Knowledge framework, with a five-step content-first protocol verified by reverse-coding and a chapter tracing the principle through the Islamic intellectual tradition from Al-Hasan al-Basri to Ibn Khaldun. Includes 12 chapters, 11 printable classroom resources, a verb-agnostic DOK question stem library, and worked examples across seven subjects.",
            size: 19, color: GRAY, font: FONT, italics: true,
          })],
        }),

        // ─── Education ─────────────────────────────────────────────────
        sectionHeading("Education"),
        ...eduEntry(
          "Postgraduate Diploma in Education",
          "Faculty of Education, Al-Azhar University",
          "Sep 2024 - Sep 2025",
          "Educational psychology, curriculum development, pedagogy, instructional methods. Grade: Very Good."
        ),
        ...eduEntry(
          "Bachelor of Arts in Philosophy",
          "Faculty of Arts, Alexandria University, Egypt",
          "Sep 2016 - May 2021",
          "Logic, ethics, epistemology, metaphysics, Islamic philosophy, Sufism, philosophy of language. Grade: Good. Attested by Egypt and UAE authorities; UAE MoE equivalency issued."
        ),

        // ─── Core Competencies ────────────────────────────────────────
        sectionHeading("Core Competencies"),
        ...bulletList([
          "Curriculum Design & Academic Quality Assurance (ADEK, Irtiqa'a, American, IB, British, UAE MoE)",
          "Differentiated Instruction & Inclusive Education (ELLs, gifted, students of determination)",
          "Inquiry-Based Learning & Student-Centered Instruction",
          "Safeguarding & Child Protection Awareness",
          "Educational Technology Integration (HMH, Alef, Paradigm, MS Teams, Google Classroom, Canva, Teachy)",
          "Model United Nations (MUN) Programme Leadership",
          "Assessment Design & Cognitive Taxonomies (Webb's DOK, Bloom's, SOLO)",
          "Podcasting & Educational Content Creation",
          "Bilingual Communication - English (C1, IELTS 7) & Native Arabic",
        ]),

        // ─── Certifications ────────────────────────────────────────────
        sectionHeading("Certifications"),
        ...bulletList([
          "Certified Professional Teaching License (Social Studies, Cycle 3) - UAE MoE - Valid until Feb 2029",
          "IELTS Academic Band 7 - Valid until Aug 2027",
          "Prepare For Your First Two Weeks & Differentiate with Small Groups and Centers - HMH - Apr 2026",
          "Ready to Wrestle - United World Wrestling - Feb 2026",
          "Certified in AI for Educators (Level 1) - Teachy - Oct 2025",
          "Network Fundamentals & Network Security - Mahara Tech & MCIT, Egypt - Jun 2025",
          "Fire Warden Training (Level 2) - Dubai Civil Defence - Valid until Aug 2026",
          "Verification of Manuscripts in Philosophy & Theology - Bibliotheca Alexandrina - Nov 2021",
          "Critical Thinking & Decision Making - LinkedIn Learning - Jul 2021",
        ]),

        // ─── Educational Initiatives ───────────────────────────────────
        sectionHeading("Educational Initiatives & Projects"),
        ...jobEntry(
          "Creator & Host - Echoes of Wisdom Podcast",
          "Independent Educational Initiative",
          "2026 - Present",
          [
            "Produces and hosts a bilingual (Arabic/English) philosophy podcast with 16 episodes across 2 seasons.",
            "Bridges academic philosophy and public discourse, making complex ideas in ethics, logic, and epistemology understandable and actionable for diverse audiences.",
          ]
        ),
        ...jobEntry(
          "Founder - Studio of Phronesis",
          "Educational Content & Software Platform Studio",
          "2024 - Present",
          [
            "Built MSCS Academy: interactive learning platform for UAE Moral, Social, and Cultural Studies (130 lessons, 390+ activities, Grades 6-9).",
            "Built DiplomatiQ: MUN operating system with seven-tier competency framework and AI-powered research paper evaluation.",
            "Published bilingual mathematics curriculum guides (Grades 1-4 live, 5-12 in production, free PDFs).",
          ]
        ),

        // ─── Additional ────────────────────────────────────────────────
        sectionHeading("Additional Information"),
        twoColTable(
          "Languages", "Arabic (Native) | English (Fluent, C1, IELTS 7) | Urdu (Beginner) | Spanish (Beginner)",
          "Sports Coaching", "Strength & Conditioning Coach, Swift Football Academy, Al Ain (2023-2024)"
        ),
        new Paragraph({ spacing: { before: 80 } }),
        twoColTable(
          "Affiliations", "Member, British Philosophical Association (BPA) - 2025 to Present",
          "IT Skills", "CompTIA (A+, Network+, Linux+), Microsoft Office Suite, Google Workspace, EdTech Platforms (HMH, Alef, Paradigm, MS Teams, Google Classroom, Canva, Teachy)"
        ),
      ],
    }],
  });
}

// ─── Generate both files ────────────────────────────────────────────────────

async function main() {
  const outDir = "/home/z/my-project/download";

  // Resume 1: Operations
  console.log("Generating Operations Resume...");
  const opsDoc = buildOperationsResume();
  const opsBuffer = await Packer.toBuffer(opsDoc);
  const opsPath = `${outDir}/Ahmed_Ali_Operations_Resume.docx`;
  fs.writeFileSync(opsPath, opsBuffer);
  console.log(`  Saved: ${opsPath} (${(opsBuffer.length / 1024).toFixed(1)} KB)`);

  // Resume 2: Teaching
  console.log("Generating Teaching Resume...");
  const teachDoc = buildTeachingResume();
  const teachBuffer = await Packer.toBuffer(teachDoc);
  const teachPath = `${outDir}/Ahmed_Ali_Teaching_Resume.docx`;
  fs.writeFileSync(teachPath, teachBuffer);
  console.log(`  Saved: ${teachPath} (${(teachBuffer.length / 1024).toFixed(1)} KB)`);

  console.log("\nDone! Both resumes generated.");
}

main().catch(console.error);
