'use client'
import { useEffect, useState } from 'react'
import { createClient, fmt, badge, ROLES, type StaffProfile, type Transaction, type Loan, type Client } from '@/lib/supabase'
import Link from 'next/link'

function KPICard({ label, value, sub, trend, color }: { label: string; value: string; sub: string; trend: number; color: string }) {
  return (
    <div className="card p-5">
      <div className="text-mfb-muted text-xs font-semibold uppercase tracking-wide mb-2">{label}</div>
      <div className="font-display text-2xl font-black text-mfb-text mb-1">{value}</div>
      <div className={`text-xs font-semibold flex items-center gap-1 ${trend > 0 ? 'text-emerald-DEFAULT' : trend < 0 ? 'text-danger-light' : 'text-mfb-muted'}`}>
        {trend > 0 ? '↑' : trend < 0 ? '↓' : '—'} {sub}
      </div>
    </div>
  )
}

export default function Dashboard() {
  const [profile, setProfile] = useState<StaffProfile | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loans, setLoans] = useState<Loan[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const [p, t, l, c] = await Promise.all([
        supabase.from('staff_profiles').select('*').eq('user_id', user.id).single(),
        supabase.from('transactions').select('*').order('created_at', { ascending: false }).limit(8),
        supabase.from('loans').select('*').order('created_at', { ascending: false }).limit(20),
        supabase.from('clients').select('*').order('created_at', { ascending: false }).limit(20),
      ])
      setProfile(p.data as StaffProfile)
      setTransactions(t.data || [])
      setLoans(l.data || [])
      setClients(c.data || [])
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center h-64 text-mfb-muted text-sm">
      <div className="text-center">
        <div className="w-10 h-10 border-2 border-emerald-DEFAULT border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        Loading dashboard…
      </div>
    </div>
  )

  const totalLoanPortfolio = loans.reduce((a, l) => a + (l.outstanding || 0), 0)
  const activeLoans = loans.filter(l => l.status === 'active' || l.status === 'disbursed').length
  const overdueLoans = loans.filter(l => l.status === 'overdue').length
  const successTxns = transactions.filter(t => t.status === 'success').reduce((a, t) => a + t.amount, 0)

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Welcome */}
      <div className="gradient-navy rounded-xl p-6 text-white flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold mb-1">
            Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}, {profile?.full_name.split(' ')[0]} 👋
          </h2>
          <p className="text-white/50 text-sm">{profile?.branch} · {ROLES[profile?.role || 'teller']?.label}</p>
        </div>
        <Link href="/staff/transactions" className="btn-gold text-sm hidden sm:flex">
          New Transaction →
        </Link>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard label="Total Clients" value={clients.length.toString()} sub="Across all branches" trend={0} color="#0D5C3A" />
        <KPICard label="Loan Portfolio" value={fmt(totalLoanPortfolio)} sub={`${activeLoans} active loans`} trend={1} color="#C9941A" />
        <KPICard label="Transactions Today" value={transactions.length.toString()} sub={fmt(successTxns) + ' volume'} trend={1} color="#0E7490" />
        <KPICard label="Overdue Loans" value={overdueLoans.toString()} sub="Require follow-up" trend={overdueLoans > 0 ? -1 : 0} color="#DC2626" />
      </div>

      {/* Two column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Transactions */}
        <div className="lg:col-span-2 card">
          <div className="flex items-center justify-between p-5 border-b border-mfb-border">
            <h3 className="font-bold text-mfb-text">Recent Transactions</h3>
            <Link href="/staff/transactions" className="text-emerald-DEFAULT text-xs font-semibold hover:underline">View all →</Link>
          </div>
          {transactions.length === 0 ? (
            <div className="p-10 text-center text-mfb-muted text-sm">
              <div className="text-4xl mb-3">⇄</div>
              No transactions yet. <Link href="/staff/transactions" className="text-emerald-DEFAULT hover:underline">Post the first one →</Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr><th>Reference</th><th>Type</th><th>Amount</th><th>Client</th><th>Status</th><th>Date</th></tr>
                </thead>
                <tbody>
                  {transactions.map(t => (
                    <tr key={t.id}>
                      <td className="font-mono text-xs text-teal">{t.reference}</td>
                      <td className="font-medium">{t.type}</td>
                      <td className="font-bold">{fmt(t.amount)}</td>
                      <td className="text-mfb-muted text-xs">{t.client_name || '—'}</td>
                      <td><span className={badge(t.status)}>{t.status}</span></td>
                      <td className="text-mfb-muted text-xs">{new Date(t.created_at).toLocaleDateString('en-NG')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Loan overview */}
        <div className="card">
          <div className="flex items-center justify-between p-5 border-b border-mfb-border">
            <h3 className="font-bold text-mfb-text">Loan Status</h3>
            <Link href="/staff/loans" className="text-emerald-DEFAULT text-xs font-semibold hover:underline">View all →</Link>
          </div>
          {loans.length === 0 ? (
            <div className="p-8 text-center text-mfb-muted text-sm">
              <div className="text-4xl mb-3">◆</div>
              No loans yet.
            </div>
          ) : (
            <div className="p-4 space-y-3">
              {[
                { status: 'active', label: 'Active', color: '#0D5C3A' },
                { status: 'disbursed', label: 'Disbursed', color: '#0E7490' },
                { status: 'pending', label: 'Pending', color: '#C9941A' },
                { status: 'overdue', label: 'Overdue', color: '#DC2626' },
                { status: 'closed', label: 'Closed', color: '#94A3B8' },
              ].map(({ status, label, color }) => {
                const count = loans.filter(l => l.status === status).length
                const total = loans.filter(l => l.status === status).reduce((a, l) => a + (l.outstanding || 0), 0)
                return (
                  <div key={status} className="flex items-center justify-between p-3 rounded-lg bg-mfb-bg">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
                      <span className="text-sm font-medium">{label}</span>
                      <span className="text-xs text-mfb-muted">({count})</span>
                    </div>
                    <span className="text-sm font-bold">{fmt(total)}</span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Recent Clients */}
      <div className="card">
        <div className="flex items-center justify-between p-5 border-b border-mfb-border">
          <h3 className="font-bold text-mfb-text">Recent Clients</h3>
          <Link href="/staff/clients" className="text-emerald-DEFAULT text-xs font-semibold hover:underline">Manage clients →</Link>
        </div>
        {clients.length === 0 ? (
          <div className="p-10 text-center text-mfb-muted">
            <div className="text-4xl mb-3">⬡</div>
            <p className="text-sm mb-4">No clients onboarded yet.</p>
            <Link href="/staff/clients" className="btn-primary text-sm">Onboard First Client →</Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr><th>Account No</th><th>Name</th><th>Phone</th><th>Branch</th><th>KYC</th><th>Credit Score</th><th>Status</th></tr>
              </thead>
              <tbody>
                {clients.slice(0, 6).map(c => (
                  <tr key={c.id}>
                    <td className="font-mono text-xs text-teal">{c.acct_no || '—'}</td>
                    <td className="font-medium">{c.full_name}</td>
                    <td className="text-mfb-muted text-xs">{c.phone}</td>
                    <td className="text-mfb-muted text-xs">{c.branch}</td>
                    <td><span className={badge(c.kyc_status)}>{c.kyc_status}</span></td>
                    <td>
                      <span className={`font-bold text-sm ${c.credit_score >= 700 ? 'text-emerald-DEFAULT' : c.credit_score >= 600 ? 'text-warning' : 'text-danger-light'}`}>
                        {c.credit_score}
                      </span>
                    </td>
                    <td><span className={badge(c.status)}>{c.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
