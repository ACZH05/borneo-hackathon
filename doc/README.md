# Required Information

- Website URL: https://borneo-hackathon-web-beige.vercel.app/
- Demo Video URL: https://youtu.be/FFtnrWynUGQ
- Final Report URL: https://drive.google.com/file/d/1MfYfEInGYYWXxgn2inuS9eN2ZNnaedgs/view?usp=sharing

<br />

- Team Name: HACHIMI
- Topic: Case Study 5 - Disaster Resilience AI

| Role | Team Member | University / Institution |
| --- | --- | --- |
| Leader | Alfred Chin Zhan Hoong | Universiti Teknologi Malaysia (UTM) |
| Member | Gui GuanYu | Universiti Teknologi Malaysia (UTM) |
| Member | Leong Jun Qiang | Universiti Teknologi Malaysia (UTM) |
| Member | Ng Jaa Wei | Universiti Teknologi Malaysia (UTM) |

## Account Access

The platform has two role modes:

- Normal User (Resident)
- Admin

### Normal User Account (Resident)

- Login Type: Supabase Magic Link (Passwordless)
- Email: Use any valid email address you can access.
- Password: Not required.

<br />

- Login Steps:
1. Open the website and click Login.
2. Enter your email address.
3. Click Send Magic Link.
4. Open your email inbox and click the login link.
5. You will be redirected back as a resident user.

### Admin Account

- Login Type: Supabase Magic Link (Same Flow as Normal User)
- Admin Email: hachimiAdmin@gmail.com
- Gmail Password: hachimi2026
- Note: The password is used to access the Gmail inbox and click the magic link. It is not entered in the BorNEO AI login form.

<br />

- Login Steps:
1. Login the Google account with the provided admin email and password.
2. Open the website and click Login.
3. Enter the admin email.
4. Click Send Magic Link.
5. Open the admin email inbox (gmail) and click the login link.
6. You will be redirected back as an admin user.

## Setup Instructions

### 1) Prerequisites

- Node.js 20+ (LTS recommended)
- npm 10+ (or pnpm if preferred)
- A PostgreSQL database (Supabase Postgres is supported)
- API access for Gemini and Google Maps

### 2) Install dependencies

```bash
npm install
```

### 3) Configure environment variables

Create `.env.local` in the project root and set the variables below.

```env
# Database
DIRECT_URL="postgresql://YOUR_DB_DIRECT_CONNECTION"
DATABASE_URL="postgresql://YOUR_DB_POOLED_CONNECTION"

# Gemini (set at least one key; more keys enable failover rotation)
GEMINI_API_KEY_1="YOUR_GEMINI_API_KEY"
GEMINI_API_KEY_2=""
GEMINI_API_KEY_3=""
GEMINI_API_KEY_4=""
GEMINI_API_KEY_5=""
GEMINI_API_KEY_6=""
GEMINI_API_KEY_7=""
GEMINI_API_KEY_8=""
GEMINI_API_KEY_9=""
GEMINI_API_KEY_10=""
GEMINI_API_KEY_11=""
GEMINI_API_KEY_12=""

# Google Maps
GOOGLE_MAPS_API_KEY="YOUR_GOOGLE_MAPS_SERVER_API_KEY"
NEXT_PUBLIC_GOOGLE_MAPS_JS_API_KEY="YOUR_GOOGLE_MAPS_BROWSER_API_KEY"

# Supabase Auth
NEXT_PUBLIC_SUPABASE_URL="https://YOUR_PROJECT.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="YOUR_SUPABASE_ANON_KEY"

# App / cron
URL="http://localhost:3000"
CRON_SECRET="YOUR_CRON_SECRET"
WEATHER_API_KEY="YOUR_WEATHERAPI_KEY"
```

Notes:
- Keep `.env.local` private and never commit real secrets.
- `URL` should match your local dev origin.
- `CRON_SECRET` is used by `/api/cron/fetch-hazards`.

### 4) Prepare the database schema

Run Prisma client generation and push the schema to your database.

```bash
npx prisma generate
npx prisma db push
```

### 5) Start development server

```bash
npm run dev
```

Open http://localhost:3000

### 6) Production build (optional)

```bash
npm run build
npm run start
```

### 7) Lint (optional)

```bash
npm run lint
```