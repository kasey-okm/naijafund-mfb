# NaijaFund MFB — Core Banking Platform

A full-stack Nigerian microfinance bank platform built with Next.js 14, Supabase, and Tailwind CSS.

## 🏦 Features

- **5 Staff Roles**: Admin, Branch Manager, Loan Officer, Teller, Accountant
- **4-Stage Approval Workflow**: Officer → Manager → Accountant → Admin
- **Customer Portal**: Self-service banking with Supabase Auth
- **Real-time Dashboard**: Live KPIs, transaction feeds, portfolio overview
- **KYC Management**: CBN-compliant client onboarding
- **Loan Management**: Full lifecycle from application to disbursement
- **Transaction Processing**: Multi-channel (counter, USSD, mobile)
- **Reports**: CBN-ready regulatory reporting

## 🚀 Deploying to Vercel

### Method 1: Drag-and-drop (Fastest)
1. Go to https://vercel.com/new
2. Drag the `naijafund-app` folder into the import area
3. Vercel will auto-detect Next.js
4. Add environment variables (see below)
5. Click Deploy!

### Method 2: GitHub Integration
1. Push code to GitHub
2. Connect repo at https://vercel.com/new
3. Import and deploy

### Required Environment Variables
```
NEXT_PUBLIC_SUPABASE_URL=https://aeoujfgoakbxnrgbizzx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 🗄️ Supabase Setup

Project: `naijamfb` (aeoujfgoakbxnrgbizzx)
URL: https://aeoujfgoakbxnrgbizzx.supabase.co

All migrations have been applied. Tables:
- `clients` — Customer profiles with KYC data
- `staff_profiles` — Staff with roles and permissions
- `transactions` — Financial transactions
- `loans` — Loan applications and disbursements
- `accounts` — Bank accounts
- `approval_queue` — 4-stage workflow items
- `savings_products` — Savings product catalogue
- `loan_repayments` — Repayment records
- `audit_logs` — Compliance audit trail

### Creating Demo Staff

In Supabase Dashboard → Authentication → Users, invite staff:
- `admin@naijafund.ng` (password: Demo@1234!)
- `manager@naijafund.ng`
- `officer@naijafund.ng`
- `teller@naijafund.ng`
- `accountant@naijafund.ng`

Then insert their profiles in `staff_profiles` table:
```sql
INSERT INTO staff_profiles (user_id, full_name, email, role, branch, is_active)
VALUES 
  ('<admin-user-id>', 'Emeka Okafor', 'admin@naijafund.ng', 'admin', 'Lagos HQ', true),
  ('<manager-user-id>', 'Ngozi Adeyemi', 'manager@naijafund.ng', 'manager', 'Lagos HQ', true),
  ('<officer-user-id>', 'Chukwudi Nwosu', 'officer@naijafund.ng', 'loan_officer', 'Lagos HQ', true),
  ('<teller-user-id>', 'Fatima Bello', 'teller@naijafund.ng', 'teller', 'Lagos HQ', true),
  ('<accountant-user-id>', 'Biodun Afolabi', 'accountant@naijafund.ng', 'accountant', 'Lagos HQ', true);
```

## 🛠 Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14 App Router |
| Styling | Tailwind CSS + DM Sans / Playfair Display |
| Database | Supabase PostgreSQL |
| Auth | Supabase Auth |
| Deployment | Vercel |

## 📁 Project Structure

```
naijafund-app/
├── app/
│   ├── page.tsx              # Landing page
│   ├── staff/
│   │   ├── layout.tsx        # Staff sidebar + auth guard
│   │   ├── login/page.tsx    # Staff login
│   │   ├── dashboard/page.tsx
│   │   ├── clients/page.tsx
│   │   ├── loans/page.tsx
│   │   ├── transactions/page.tsx
│   │   ├── approvals/page.tsx
│   │   ├── savings/page.tsx
│   │   ├── reports/page.tsx
│   │   └── access/page.tsx
│   └── customer/
│       ├── auth/page.tsx     # Login + signup
│       └── portal/page.tsx   # Self-service dashboard
├── lib/
│   └── supabase.ts           # Client + types
└── vercel.json
```

## License

Proprietary — Ronit Soft Limited © 2025
