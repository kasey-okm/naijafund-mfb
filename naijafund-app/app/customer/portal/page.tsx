'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient, fmt, badge, type Client, type Transaction, type Loan } from '@/lib/supabase'

export default function CustomerPortal() {
  const router = useRouter()
  const [client, setClient] = useState<Client | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loans, setLoans] = useState<Loan[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'overview' | 'transactions' | 'loans' | 'profile'>('overview')
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/customer/auth'); return }
      const [c, t, l] = await Promise.all([
        supabase.from('clients').select('*').eq('user_id', user.id).single(),
        supabase.from('transactions').select('*').order('created_at', { ascending: false }).limit(20),
        supabase.from('loans').select('*').order('created_at', { ascending: false }),
      ])
      setClient(c.data as Client)
      setTransactions((t.data as Transaction[]) || [])
      setLoans((l.data as Loan[]) || [])
      setLoading(false)
    }
    load()
  }, [])

  async function logout() {
    await supabase.auth.signOut()
    router.push('/customer/auth')
  }

  if (loading) return (
    <div className="min-h-screen gradient-navy flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 rounded-xl gradient-gold flex items-center justify-center text-white font-black text-xl mx-auto mb-4 animate-float">₦</div>
        <p className="text-white/40 text-sm">Loading your account…</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-mfb-bg">
      {/* Header */}
      <header className="gradient-navy px-4 pt-4 pb-20">
        <div className="max-w-2xl mx-auto flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-gold flex items-center justify-center text-white font-black text-sm">₦</div>
            <span className="font-display font-bold text-white">NaijaFund MFB</span>
          </div>
          <button onClick={logout} className="text-white/40 hover:text-white text-sm transition-colors">Sign Out</button>
        </div>
        {/* Balance card */}
        <div className="max-w-2xl mx-auto">
          <div className="bg-white/10 border border-white/15 rounded-2xl p-6 backdrop-blur-sm">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-white/50 text-xs font-semibold uppercase tracking-wide">Account Balance</p>
                <p className="font-display text-4xl font-black text-white mt-1">{fmt(client?.savings_balance || 0)}</p>
              </div>
              <div className="text-right">
                <p className="text-white/40 text-xs">Account No</p>
                <p className="font-mono text-white font-bold text-sm mt-0.5">{client?.acct_no || 'Pending'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 mt-2">
              <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${client?.kyc_status === 'approved' ? 'bg-emerald-soft text-emerald-DEFAULT' : 'bg-amber-100 text-amber-700'}`}>
                {client?.kyc_status === 'approved' ? '✓ KYC Verified' : '⏳ KYC Pending'}
              </span>
              <span className="text-white/40 text-xs">{client?.branch}</span>
            </div>
          </div>

          {/* Quick action row */}
          <div className="grid grid-cols-3 gap-3 mt-4">
            {[
              { icon: '⬆️', label: 'Transfer' },
              { icon: '📋', label: 'Statement' },
              { icon: '💳', label: 'Pay Loan' },
            ].map(a => (
              <button key={a.label} className="bg-white/10 border border-white/15 rounded-xl p-3 text-center hover:bg-white/20 transition-colors">
                <div className="text-2xl mb-1">{a.icon}</div>
                <div className="text-white text-xs font-semibold">{a.label}</div>
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 -mt-6 pb-12">
        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-card mb-5 p-1 flex">
          {(['overview', 'transactions', 'loans', 'profile'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all ${tab === t ? 'gradient-emerald text-white shadow-sm' : 'text-mfb-muted hover:text-mfb-text'}`}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {tab === 'overview' && (
          <div className="space-y-4 animate-fade-up">
            {/* Account summary */}
            <div className="grid grid-cols-2 gap-4">
              <div className="card p-4">
                <div className="text-mfb-muted text-xs font-semibold uppercase mb-1">Savings Balance</div>
                <div className="font-display text-xl font-black text-emerald-DEFAULT">{fmt(client?.savings_balance || 0)}</div>
              </div>
              <div className="card p-4">
                <div className="text-mfb-muted text-xs font-semibold uppercase mb-1">Loan Balance</div>
                <div className={`font-display text-xl font-black ${(client?.loan_balance || 0) > 0 ? 'text-warning' : 'text-mfb-muted'}`}>{fmt(client?.loan_balance || 0)}</div>
              </div>
            </div>

            {/* Credit score */}
            <div className="card p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold">Credit Score</h3>
                <span className={`text-lg font-display font-black ${(client?.credit_score || 0) >= 700 ? 'text-emerald-DEFAULT' : (client?.credit_score || 0) >= 600 ? 'text-warning' : 'text-danger-light'}`}>
                  {client?.credit_score || 0}
                </span>
              </div>
              <div className="w-full bg-mfb-border rounded-full h-2">
                <div className={`h-2 rounded-full transition-all ${(client?.credit_score || 0) >= 700 ? 'gradient-emerald' : (client?.credit_score || 0) >= 600 ? 'gradient-gold' : 'bg-danger-light'}`}
                  style={{ width: `${Math.min(100, ((client?.credit_score || 0) / 850) * 100)}%` }} />
              </div>
              <div className="flex justify-between text-xs text-mfb-muted mt-1.5">
                <span>Poor (300)</span><span>Good (700)</span><span>Excellent (850)</span>
              </div>
            </div>

            {/* KYC status */}
            {client?.kyc_status !== 'approved' && (
              <div className="card p-5 border-amber-200 bg-amber-50">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">⚠️</span>
                  <div>
                    <h3 className="font-bold text-amber-800">Complete Your KYC</h3>
                    <p className="text-amber-700 text-sm mt-1">
                      Verify your BVN and NIN at any branch or upload documents to unlock full banking features.
                    </p>
                    <Link href="#" className="btn text-amber-700 border border-amber-300 bg-amber-100 hover:bg-amber-200 text-xs mt-3 inline-flex">
                      Start KYC Verification →
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* Recent activity */}
            <div className="card">
              <div className="flex items-center justify-between p-4 border-b border-mfb-border">
                <h3 className="font-bold text-sm">Recent Activity</h3>
                <button onClick={() => setTab('transactions')} className="text-emerald-DEFAULT text-xs font-semibold hover:underline">View all</button>
              </div>
              {transactions.slice(0, 4).length === 0 ? (
                <div className="p-8 text-center text-mfb-muted text-sm">No transactions yet.</div>
              ) : (
                <div className="divide-y divide-mfb-border">
                  {transactions.slice(0, 4).map(t => (
                    <div key={t.id} className="flex items-center justify-between px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${t.type === 'Deposit' ? 'bg-emerald-soft text-emerald-DEFAULT' : 'bg-red-50 text-danger-light'}`}>
                          {t.type === 'Deposit' ? '↓' : '↑'}
                        </div>
                        <div>
                          <div className="font-semibold text-sm">{t.type}</div>
                          <div className="text-mfb-muted text-xs">{new Date(t.created_at).toLocaleDateString('en-NG')}</div>
                        </div>
                      </div>
                      <div className={`font-bold ${t.type === 'Deposit' ? 'text-emerald-DEFAULT' : 'text-danger-light'}`}>
                        {t.type === 'Deposit' ? '+' : '-'}{fmt(t.amount)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {tab === 'transactions' && (
          <div className="space-y-3 animate-fade-up">
            {transactions.length === 0 ? (
              <div className="card p-12 text-center text-mfb-muted text-sm">
                <div className="text-4xl mb-3">⇄</div>No transactions yet.
              </div>
            ) : transactions.map(t => (
              <div key={t.id} className="card p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${t.type === 'Deposit' ? 'bg-emerald-soft text-emerald-DEFAULT' : 'bg-red-50 text-danger-light'}`}>
                    {t.type === 'Deposit' ? '↓' : '↑'}
                  </div>
                  <div>
                    <div className="font-semibold text-sm">{t.type}</div>
                    <div className="text-mfb-muted text-xs">{t.reference} · {new Date(t.created_at).toLocaleDateString('en-NG')}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`font-bold ${t.type === 'Deposit' ? 'text-emerald-DEFAULT' : 'text-danger-light'}`}>
                    {t.type === 'Deposit' ? '+' : '-'}{fmt(t.amount)}
                  </div>
                  <span className={badge(t.status)}>{t.status}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 'loans' && (
          <div className="space-y-4 animate-fade-up">
            {loans.length === 0 ? (
              <div className="card p-12 text-center">
                <div className="text-4xl mb-3">◆</div>
                <p className="text-mfb-muted text-sm mb-4">No active loans.</p>
                <p className="text-mfb-muted text-xs">Visit any branch to apply for a loan.</p>
              </div>
            ) : loans.map(l => (
              <div key={l.id} className="card p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="font-bold">{l.loan_ref || 'Loan'}</div>
                    <div className="text-mfb-muted text-xs">{l.purpose || 'General purpose'} · {l.tenure} months</div>
                  </div>
                  <span className={badge(l.status)}>{l.status}</span>
                </div>
                <div className="grid grid-cols-3 gap-3 text-sm">
                  <div className="bg-mfb-bg rounded-lg p-3 text-center">
                    <div className="text-mfb-muted text-xs mb-1">Principal</div>
                    <div className="font-bold">{fmt(l.principal)}</div>
                  </div>
                  <div className="bg-mfb-bg rounded-lg p-3 text-center">
                    <div className="text-mfb-muted text-xs mb-1">Outstanding</div>
                    <div className="font-bold text-warning">{fmt(l.outstanding || 0)}</div>
                  </div>
                  <div className="bg-mfb-bg rounded-lg p-3 text-center">
                    <div className="text-mfb-muted text-xs mb-1">Rate</div>
                    <div className="font-bold">{l.interest_rate}%</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 'profile' && (
          <div className="space-y-4 animate-fade-up">
            <div className="card p-5">
              <h3 className="font-bold mb-4">Account Details</h3>
              {[
                ['Full Name', client?.full_name || '—'],
                ['Account No', client?.acct_no || 'Pending'],
                ['Email', client?.email || '—'],
                ['Phone', client?.phone || '—'],
                ['Branch', client?.branch || '—'],
                ['KYC Status', client?.kyc_status || '—'],
                ['Account Status', client?.status || '—'],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between py-3 border-b border-mfb-border last:border-0">
                  <span className="text-mfb-muted text-sm">{k}</span>
                  <span className="font-semibold text-sm">{v}</span>
                </div>
              ))}
            </div>
            <button onClick={logout} className="btn-danger w-full justify-center">Sign Out</button>
          </div>
        )}
      </div>
    </div>
  )
}
