# Sports Village Registration Platform

A complete Registration and Validation Platform for Vodafone Qatar's Sports Village Event happening on **February 10, 2026** at Downtown Msheireb, Qatar.

## Features

- **Public Registration Portal** - Where attendees register for the event
- **Admin Dashboard** - For Vodafone staff to manage registrations
- **Validation System** - For on-site check-in at event entrance
- **QR Code Generation** - Unique QR codes for each registration
- **Email Confirmation** - Automated confirmation emails with QR codes
- **Export Functionality** - Export registrations to CSV/Excel

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Database | PostgreSQL (Supabase) |
| ORM | Prisma |
| Cache | Upstash Redis |
| Email | Resend |
| Auth | NextAuth.js v5 |
| UI | shadcn/ui + Tailwind CSS |
| Charts | Recharts |

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database (Supabase recommended)
- Upstash Redis account
- Resend account

### Installation

1. Clone the repository and install dependencies:

```bash
cd sports-village-registration
npm install
```

2. Copy the environment variables:

```bash
cp .env.example .env.local
```

3. Update `.env.local` with your credentials:

```env
# Database (Supabase)
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"

# Upstash Redis
UPSTASH_REDIS_REST_URL="https://..."
UPSTASH_REDIS_REST_TOKEN="..."

# Resend
RESEND_API_KEY="re_..."
EMAIL_FROM="Sports Village <noreply@yourdomain.com>"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

4. Push the database schema:

```bash
npx prisma db push
```

5. Seed the database:

```bash
npx prisma db seed
```

6. Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Default Login Credentials

After seeding the database:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@vodafone.qa | Admin@123456 |
| Manager | manager@vodafone.qa | Staff@123456 |
| Staff | staff@vodafone.qa | Staff@123456 |

## Project Structure

```
sports-village-registration/
├── app/
│   ├── (public)/          # Public pages
│   │   ├── page.tsx       # Home/Landing page
│   │   ├── register/      # Registration form
│   │   └── success/       # Success page with QR
│   ├── (admin)/           # Admin pages
│   │   ├── dashboard/     # Dashboard with stats
│   │   ├── registrations/ # Registrations list
│   │   ├── validation/    # QR scanner
│   │   ├── users/         # User management
│   │   └── settings/      # System settings
│   └── api/               # API routes
├── components/
│   ├── ui/                # shadcn/ui components
│   ├── forms/             # Form components
│   ├── admin/             # Admin components
│   └── public/            # Public components
├── lib/                   # Utilities and configs
├── prisma/                # Database schema
└── types/                 # TypeScript types
```

## User Roles

| Role | Permissions |
|------|-------------|
| ADMIN | Full access - can manage users and settings |
| MANAGER | Can manage registrations and perform check-ins |
| STAFF | Can only perform check-ins |

## API Endpoints

### Public
- `POST /api/registrations` - Create registration
- `POST /api/registrations/check-duplicate` - Check for duplicates

### Protected
- `GET /api/registrations` - List registrations
- `GET /api/registrations/stats` - Get statistics
- `GET /api/registrations/export` - Export data
- `POST /api/validation/check-in` - Check in participant
- `POST /api/validation/lookup` - Lookup by QID/email

## Deployment

The application is optimized for deployment on Vercel:

```bash
npm run build
```

## Vodafone Brand Colors

| Color | Hex | Usage |
|-------|-----|-------|
| Vodafone Red | #E60000 | Primary |
| Dark Red | #820000 | Gradient |
| Aqua Blue | #00B0CA | Status badges |
| Spring Green | #A8B400 | Success states |

## License

This project is proprietary software developed for Vodafone Qatar.
