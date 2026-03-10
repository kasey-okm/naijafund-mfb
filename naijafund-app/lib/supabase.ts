import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

export type Database = {
  public: {
    Tables: {
      clients: { Row: Client; Insert: Partial<Client>; Update: Partial<Client> }
      staff_profiles: { Row: StaffProfile; Insert: Partial<StaffProfile>; Update: Partial<StaffProfile> }
      transactions: { Row: Transaction; Insert: Partial<Transaction>; Update: Partial<Transaction> }
      loans: { Row: Loan; Insert: Partial<Loan>; Update: Partial<Loan> }
      accounts: { Row: Account; Insert: Partial<Account>; Update: Partial<Account> }
      approval_queue: { Row: ApprovalItem; Insert: Partial<ApprovalItem>; Update: Partial<ApprovalItem> }
      loan_repayments: { Row: LoanRepayment; Insert: Partial<LoanRepayment>; Update: Partial<LoanRepayment> }
    }
  }
}

export interface Client {
  id: string
  user_id?: string
  full_name: string
  first_name?: string
  last_name?: string
  phone: string
  email?: string
  bvn?: string
  nin?: string
  date_of_birth?: string
  gender?: string
  address?: string
  lga?: string
  state?: string
  occupation?: string
  monthly_income?: number
  next_of_kin?: string
  nok_phone?: string
  branch: string
  credit_score: number
  kyc_status: 'pending' | 'submitted' | 'approved' | 'rejected'
  status: 'active' | 'inactive' | 'suspended'
  acct_no: string
  loan_balance: number
  savings_balance: number
  photo_url?: string
  created_at: string
  updated_at: string
}

export interface StaffProfile {
  id: string
  user_id?: string
  staff_id?: string
  full_name: string
  email: string
  phone?: string
  role: 'admin' | 'manager' | 'loan_officer' | 'teller' | 'accountant'
  branch: string
  zone?: string
  avatar?: string
  is_active: boolean
  permissions: Record<string, boolean>
  created_at: string
  updated_at: string
}

export interface Transaction {
  id: string
  reference: string
  type: string
  amount: number
  status: 'pending' | 'success' | 'failed' | 'reversed'
  channel?: string
  branch?: string
  description?: string
  client_name?: string
  from_account_id?: string
  to_account_id?: string
  processed_by?: string
  created_at: string
}

export interface Loan {
  id: string
  client_id: string
  loan_ref?: string
  principal: number
  interest_rate: number
  tenure: number
  purpose?: string
  outstanding: number
  status: 'pending' | 'approved' | 'disbursed' | 'active' | 'overdue' | 'closed' | 'rejected'
  disbursed_at?: string
  next_due?: string
  officer_id?: string
  branch?: string
  created_at: string
}

export interface Account {
  id: string
  client_id: string
  account_number: string
  account_type: 'savings' | 'current' | 'fixed' | 'loan'
  currency: string
  balance: number
  status: 'active' | 'inactive' | 'frozen'
  branch?: string
  created_at: string
}

export interface ApprovalItem {
  id: string
  ref_no: string
  entity_type: 'loan' | 'account' | 'client_kyc' | 'transaction'
  entity_id: string
  title: string
  amount?: number
  client_name?: string
  branch?: string
  submitted_by?: string
  submitted_at: string
  stage: number
  status: 'pending' | 'approved' | 'rejected' | 'escalated'
  stage1_action?: string
  stage1_note?: string
  stage1_at?: string
  stage2_action?: string
  stage2_note?: string
  stage2_at?: string
  stage3_action?: string
  stage3_note?: string
  stage3_at?: string
  stage4_action?: string
  stage4_note?: string
  stage4_at?: string
  metadata?: Record<string, unknown>
  created_at: string
}

export interface LoanRepayment {
  id: string
  loan_id: string
  amount: number
  paid_at: string
}

export const ROLES = {
  admin: { label: 'Super Admin', color: '#8B5CF6', bg: '#F3E8FF' },
  manager: { label: 'Branch Manager', color: '#0D5C3A', bg: '#E8F5EE' },
  loan_officer: { label: 'Loan Officer', color: '#C9941A', bg: '#FFF8E6' },
  teller: { label: 'Teller', color: '#0E7490', bg: '#ECFEFF' },
  accountant: { label: 'Accountant', color: '#DC2626', bg: '#FEF2F2' },
}

export const BRANCHES = ['Lagos HQ', 'Abuja FCT', 'Port Harcourt', 'Kano']

export function fmt(n: number) {
  return '₦' + (n || 0).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export function badge(status: string) {
  const map: Record<string, string> = {
    active: 'bg-emerald-soft text-emerald-DEFAULT',
    approved: 'bg-emerald-soft text-emerald-DEFAULT',
    success: 'bg-emerald-soft text-emerald-DEFAULT',
    disbursed: 'bg-emerald-soft text-emerald-DEFAULT',
    pending: 'bg-gold-soft text-gold-DEFAULT',
    submitted: 'bg-blue-50 text-blue-700',
    overdue: 'bg-red-50 text-danger-light',
    failed: 'bg-red-50 text-danger-light',
    rejected: 'bg-red-50 text-danger-light',
    closed: 'bg-gray-100 text-gray-500',
    inactive: 'bg-gray-100 text-gray-500',
    frozen: 'bg-blue-100 text-blue-600',
  }
  return (map[status] || 'bg-gray-100 text-gray-500') + ' px-2 py-0.5 rounded-full text-xs font-semibold'
}
