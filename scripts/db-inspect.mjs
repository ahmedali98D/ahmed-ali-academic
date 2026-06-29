// Direct DB inspection — read-only sanity check
// Verifies schema integrity, indexes, row counts, sensitive column exposure
import { PrismaClient } from "@prisma/client";
import fs from "fs";

const dbUrl = "postgresql://neondb_owner:npg_lwxv6RFDay1E@ep-twilight-rain-abvguave.eu-west-2.aws.neon.tech/neondb?sslmode=require";

const prisma = new PrismaClient({ datasources: { db: { url: dbUrl } } });

async function main() {
  console.log("─── DATABASE INTEGRITY CHECK ─────────────────────");
  console.log("");

  // 1. Connection check
  const version = await prisma.$queryRaw`SELECT version()`;
  console.log("✓ DB connection OK:", version[0].version.split(",")[0]);

  // 2. List all tables
  const tables = await prisma.$queryRaw`
    SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename
  `;
  console.log("✓ Tables in public schema:");
  for (const t of tables) console.log("   -", t.tablename);

  // 3. Row counts
  const counts = {
    leads: await prisma.lead.count(),
    site_content: await prisma.siteContent.count(),
    episodes: await prisma.episode.count(),
    template_logs: await prisma.templateLog.count(),
    sent_emails: await prisma.sentEmail.count(),
  };
  console.log("✓ Row counts:");
  for (const [k, v] of Object.entries(counts)) console.log(`   - ${k}: ${v}`);

  // 4. Index inspection
  const indexes = await prisma.$queryRaw`
    SELECT tablename, indexname, indexdef FROM pg_indexes WHERE schemaname = 'public' ORDER BY tablename, indexname
  `;
  console.log("✓ Indexes:");
  for (const i of indexes) console.log(`   - ${i.tablename}.${i.indexname}`);

  // 5. Latest 3 leads (verify QA audit submission was persisted)
  const recentLeads = await prisma.lead.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
    select: { id: true, name: true, email: true, createdAt: true },
  });
  console.log("✓ Most recent 5 leads:");
  for (const l of recentLeads) {
    console.log(`   - ${l.createdAt.toISOString()} | ${l.name} <${l.email}> [${l.id}]`);
  }

  // 6. Verify our QA Audit Bot lead was persisted
  const auditLead = await prisma.lead.findFirst({
    where: { email: "qa-audit@phronesis-studio.com" },
    orderBy: { createdAt: "desc" },
  });
  if (auditLead) {
    console.log("✓ QA Audit Bot lead confirmed in DB:", auditLead.id);
  } else {
    console.log("✗ QA Audit Bot lead NOT found");
  }

  // 7. Locale coverage of site_content
  const localeCoverage = await prisma.siteContent.groupBy({
    by: ["locale"],
    _count: { namespace: true },
  });
  console.log("✓ Locale coverage of site_content:");
  for (const lc of localeCoverage) console.log(`   - ${lc.locale}: ${lc._count.namespace} namespaces`);

  // 8. Namespaces per locale
  const ns = await prisma.siteContent.findMany({
    select: { locale: true, namespace: true, updatedAt: true },
    orderBy: [{ locale: "asc" }, { namespace: "asc" }],
  });
  console.log("✓ All namespaces:");
  for (const n of ns) console.log(`   - [${n.locale}] ${n.namespace} (updated ${n.updatedAt.toISOString()})`);

  // 9. SentEmail audit
  const recentEmails = await prisma.sentEmail.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
    select: { toEmail: true, subject: true, createdAt: true },
  });
  console.log("✓ Most recent 5 sent emails:");
  for (const e of recentEmails) {
    console.log(`   - ${e.createdAt.toISOString()} → ${e.toEmail} | ${e.subject}`);
  }

  // 10. Episodes list
  const eps = await prisma.episode.findMany({
    orderBy: { number: "asc" },
    select: { number: true, enTitle: true, arTitle: true },
  });
  console.log("✓ Episodes:");
  for (const e of eps) console.log(`   - Ep ${e.number}: "${e.enTitle}" / "${e.arTitle}"`);

  // 11. Template logs
  const tlogs = await prisma.templateLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 10,
    select: { template: true, clientName: true, fileName: true, createdAt: true },
  });
  console.log("✓ Recent template logs:");
  for (const t of tlogs) {
    console.log(`   - ${t.createdAt.toISOString()} | ${t.template} | client=${t.clientName || "—"} | ${t.fileName}`);
  }

  // 12. Constraint check (RLS / privileges)
  const rls = await prisma.$queryRaw`
    SELECT relname, relrowsecurity FROM pg_class WHERE relname IN ('leads','site_content','episodes','template_logs','sent_emails')
  `;
  console.log("✓ Row-Level Security status:");
  for (const r of rls) console.log(`   - ${r.relname}: RLS ${r.relrowsecurity ? "ENABLED" : "disabled"}`);

  await prisma.$disconnect();
  console.log("");
  console.log("─── DB CHECK COMPLETE ─────────────────────────────");
}

main().catch((e) => {
  console.error("FATAL:", e);
  process.exit(1);
});
