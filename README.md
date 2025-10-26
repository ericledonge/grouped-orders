This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Tech Stack

- **Framework**: Next.js 15.5 with App Router
- **Authentication**: Better Auth with Admin plugin
- **Database**: Neon PostgreSQL (serverless)
- **ORM**: Drizzle ORM
- **Styling**: Tailwind CSS 4 + shadcn/ui
- **Testing**: Playwright (E2E)
- **Deployment**: Vercel

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Database Migrations

This project uses Drizzle ORM with a safe migration workflow.

### Commands

```bash
npm run db:push      # Quick DB sync for local development (destructive)
npm run db:generate  # Generate migration files from schema changes
npm run db:migrate   # Apply pending migrations (used in production)
```

### Workflow: Making Schema Changes

#### 1. **Modify the schema**
Edit `src/lib/db/schema.ts`:
```typescript
export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone"),  // ← New field
  // ...
});
```

#### 2. **Test locally (quick iteration)**
```bash
npm run db:push
```
⚠️ **Warning**: This directly modifies your database without creating migration files. Use only for local development.

#### 3. **Generate migration for production**
```bash
npm run db:generate
```
This creates a new SQL file in `migrations/` (e.g., `migrations/0001_add_phone_field.sql`)

#### 4. **Review the generated migration**
Check `migrations/XXXX_*.sql` to verify the changes are correct.

#### 5. **Commit and push**
```bash
git add migrations/ src/lib/db/schema.ts
git commit -m "migration: add phone field to user"
git push
```

#### 6. **Deployment (automatic)**
Vercel automatically runs `npm run build`, which executes:
1. `npm run db:migrate` → Applies new migrations safely
2. `next build` → Builds the app

### Migration Files Location

Migrations are stored in `migrations/` directory:
```
migrations/
├── 0000_initial.sql
├── 0001_add_phone.sql
└── meta/
    └── _journal.json
```

### Important Notes

- ✅ **Always use `db:generate` + `db:migrate` for production**
- ✅ Migration files are versioned and tracked in Git
- ✅ Vercel applies migrations automatically during deployment
- ⚠️ **Never use `db:push` in production** - it's destructive and has no rollback
- ⚠️ Always review generated SQL before committing

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
