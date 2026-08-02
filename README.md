# Bookstore Starter (Next.js + TypeScript + Prisma + S3 + Stripe)

This is a starter scaffold for an online book publishing & store MVP:
- Next.js + TypeScript (Pages router)
- Prisma + PostgreSQL
- NextAuth (Credentials) + registration endpoint
- AWS S3 presigned upload for book files
- Stripe Checkout + webhook for order creation

Quick start
1. Copy `.env.example` to `.env.local` and fill values.
2. Install dependencies:
   npm install
3. Prisma:
   npx prisma generate
   npx prisma migrate dev --name init
4. Run dev:
   npm run dev

Notes
- To receive Stripe webhooks locally, use stripe CLI `stripe listen --forward-to localhost:3000/api/stripe/webhook`.
- If you'd like me to push this to GitHub, provide owner/repo and I will commit the files.
