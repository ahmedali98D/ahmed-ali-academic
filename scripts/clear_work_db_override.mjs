// Direct DB cleanup — delete the stale 'work' and 'workContent' SiteContent rows
// for both EN and AR locales so the JSON files become the sole source of truth.
//
// This is necessary because:
// - The DB rows still contain `tabFinance` / `tabFinanceDesc` / `finance.*` /
//   `treasury.*` keys from the previous Finance tab.
// - The i18n deep-merge only ADDS DB keys on top of JSON; it does not DELETE
//   keys that were removed from JSON.
// - So even after we removed the Finance i18n from JSON, the DB override
//   continues to inject the Finance strings into the rendered page.
//
// After running this, the live site will use ONLY the JSON files, which have
// the Finance tab removed entirely.

import { PrismaClient } from "@prisma/client";

const dbUrl = "postgresql://neondb_owner:npg_lwxv6RFDay1E@ep-twilight-rain-abvguave.eu-west-2.aws.neon.tech/neondb?sslmode=require";

const prisma = new PrismaClient({ datasources: { db: { url: dbUrl } } });

async function main() {
  console.log("─── CLEARING STALE WORK/WORKCONTENT DB OVERRIDES ───\n");

  // First, list what's there
  const before = await prisma.siteContent.findMany({
    where: {
      namespace: { in: ["work", "workContent"] }
    },
    select: { locale: true, namespace: true, value: true }
  });

  console.log(`Found ${before.length} row(s) before deletion:`);
  for (const row of before) {
    const keys = row.value && typeof row.value === "object"
      ? Object.keys(row.value).slice(0, 8).join(", ")
      : "(not object)";
    console.log(`  - locale=${row.locale}, namespace=${row.namespace}, keys=[${keys}]`);
  }

  // Delete them
  const result = await prisma.siteContent.deleteMany({
    where: {
      namespace: { in: ["work", "workContent"] }
    }
  });
  console.log(`\nDeleted ${result.count} row(s).`);

  // Verify
  const after = await prisma.siteContent.findMany({
    where: {
      namespace: { in: ["work", "workContent"] }
    }
  });
  console.log(`\nAfter deletion: ${after.length} row(s) remain (should be 0).`);

  // Also show what other namespaces exist in DB
  const all = await prisma.siteContent.findMany({
    select: { locale: true, namespace: true }
  });
  console.log(`\nRemaining DB overrides (other namespaces):`);
  for (const row of all) {
    console.log(`  - locale=${row.locale}, namespace=${row.namespace}`);
  }
}

main()
  .catch((err) => {
    console.error("Error:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
