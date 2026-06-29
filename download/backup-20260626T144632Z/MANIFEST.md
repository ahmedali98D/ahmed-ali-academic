# Phronesis Studio — Complete Backup Manifest

**Backup Timestamp:** 2026-06-26 14:48:40 UTC
**Backup Location:** `/home/z/my-project/download/backup-20260626T144632Z`

---

## What This Backup Contains

This is a complete snapshot of the Phronesis Studio website at the moment
before Arabic version updates begin. It contains everything needed to
restore the site to its exact current state.

---

## 1. Source Code (`files/`)

| File | Contents | Size |
|------|----------|------|
| `source-code-20260626T144632Z.tar.gz` | Full Next.js 16 source (src/, public/, prisma/, config files) | 13M |
| `git-history-20260626T144632Z.tar.gz` | Full .git directory (all commits, branches, history) | 12M |

**Current HEAD commit:**
```
Commit: 93078fce4c692cd939cd49c46bac15098c20a0fc
Author: Phronesis Audit <audit@phronesis-studio.com>
Date: 2026-06-26T14:38:39Z
Message: fix(neural): larger readable fonts, Vitruvian Man properly visible, centered label
```

---

## 2. Database Content (`database/`)

The live editable content — admin edits go to Neon, not to git. This is
the most critical part of the backup.

| File | Table | Rows | Size |
|------|-------|------|------|
| `database-full-backup.json` | All 5 tables combined | 69 | 392K |
| `table-leads.json` | Contact form submissions | 3 | 4.0K |
| `table-site_content.json` | Editable i18n content (en + ar) | 26 | 120K |
| `table-episodes.json` | Echoes podcast episodes | 8 | 232K |
| `table-template_logs.json` | DOCX template generation logs | 26 | 20K |
| `table-sent_emails.json` | Emails sent from admin | 6 | 20K |

**Database connection:** Neon PostgreSQL, eu-west-2 (London)
**Point-in-time recovery:** Also available via Neon console (7-day retention)

---

## 3. Deployment Metadata (`metadata/`)

| File | Contents |
|------|----------|
| `deployment-details.json` | Current production deployment (dpl_EjsyyrGWeMBmhnCBeM9j8QVDoNi2) |
| `project-details.json` | Vercel project config (framework, build settings) |
| `all-deployments.json` | Last 20 deployments with commit SHAs |
| `environment-variables.json` | All env vars (names + values) |
| `current-commit.txt` | HEAD commit info |
| `commit-history.txt` | Last 20 commits |

---

## How to Restore

### Restore source code:
```bash
cd /home/z/my-project/audit
rm -rf phronesis-studio
tar -xzf /home/z/my-project/download/backup-20260626T144632Z/files/source-code-20260626T144632Z.tar.gz
cd phronesis-studio
bun install
```

### Restore git history:
```bash
cd /home/z/my-project/audit/phronesis-studio
tar -xzf /home/z/my-project/download/backup-20260626T144632Z/files/git-history-20260626T144632Z.tar.gz
```

### Restore database (single table):
```bash
# Use the Prisma client to restore from JSON
# Example for site_content:
node -e "
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
const prisma = new PrismaClient();
const rows = JSON.parse(fs.readFileSync('/home/z/my-project/download/backup-20260626T144632Z/database/table-site_content.json'));
for (const row of rows) {
  await prisma.siteContent.upsert({
    where: { locale_namespace: { locale: row.locale, namespace: row.namespace } },
    create: row,
    update: { value: row.value },
  });
}
"
```

### Roll back to this deployment via Vercel:
```bash
# Promote this deployment back to production
curl -X POST -H "Authorization: Bearer vcp_..." \
  "https://api.vercel.com/v13/deployments/dpl_EjsyyrGWeMBmhnCBeM9j8QVDoNi2/aliases?teamId=team_NzpbgM79RV4WFNsVuOfWkwAO" \
  -H "Content-Type: application/json" \
  -d '{"redirect":"phronesis-studio.com"}'
```

---

## Production URLs (at time of backup)

- **Production:** https://phronesis-studio.com
- **Admin portal:** https://phronesis-studio.com/admin
- **Vercel console:** https://vercel.com/phronesis-studio/phronesis-studio
- **GitHub repo:** https://github.com/ahmedphronesis/phronesis-studio
- **Neon console:** https://console.neon.tech

---

*This backup was created automatically before Arabic version updates.*
