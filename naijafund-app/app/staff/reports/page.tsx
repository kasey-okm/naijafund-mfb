'use client'
import { useEffect, useState } from 'react'
import { createClient, fmt } from '@/lib/supabase'

export default function ReportsPage() {
  const [stats, setStats] = useState({ clients: 0, loans: 0, portfolio: 0, transactions: 0, volume: 0, overdue: 0, approvals: 0 })
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const [clients, loans, transactions, approvals] = await Promise.all([
        supabase.from('clients').select('id', { count: 'exact' }),
        supabase.from('loans').select('outstanding, status'),
        supabase.from('transactions').select('amount, status'),
        supabase.from('approval_queue').select('id', { count: 'exact' }),
      ])
      const allLoans = loans.data || []
      const allTxns = transactions.data || []
      setStats({
        clients: clients.count || 0,
        loans: allLoans.length,
        portfolio: allLoans.reduce((a, l) => a + (l.outstanding || 0), 0),
        transactions: allTxns.length,
        volume: allTxns.filter(t => t.status === 'success').reduce((a, t) => a + (t.amount || 0), 0),
        overdue: allLoans.filter(l => l.status === 'overdue').length,
        approvals: approvals.count || 0,
      })
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return (
    <div className="p-12 text-center text-mfb-muted text-sm">
      <div className="w-8 h-8 border-2 border-emerald-DEFAULT border-t-transparent rounded-full animate-spin mx-auto mb-3" />Loading reports…
    </div>
  )

  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <h2 className="font-display text-2xl font-bold">Reports & Analytics</h2>
        <p className="text-mfb-muted text-sm mt-0.5">CBN-ready financial summary · {new Date().toLocaleDateString('en-NG', { month: 'long', year: 'numeric' })}</p>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Clients', value: stats.clients.toString(), icon: '⬡', color: '#0D5C3A' },
          { label: 'Loan Portfolio', value: fmt(stats.portfolio), icon: '◆', color: '#C9941A' },
          { label: 'Transaction Volume', value: fmt(stats.volume), icon: '⇄', color: '#0E7490' },
          { label: 'Overdue Loans', value: stats.overdue.toString(), icon: '⚠️', color: '#DC2626' },
        ].map(k => (
          <div key={k.label} className="card p-5">
            <div className="flex items-center gap-2 mb-2">
              <span>{k.icon}</span>
              <span className="text-mfb-muted text-xs font-semibold uppercase tracking-wide">{k.label}</span>
            </div>
            <div className="font-display text-2xl font-black" style={{ color: k.color }}>{k.value}</div>
          </div>
        ))}
      </div>

      {/* Detailed breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="card p-5">
          <h3 className="font-bold mb-4">Portfolio Summary</h3>
          <div className="space-y-3">
            {[
              { label: 'Total Loan Portfolio', value: fmt(stats.portfolio), color: '#C9941A' },
              { label: 'Total Loans', value: `${stats.loans} loans`, color: '#0E7490' },
              { label: 'Overdue Amount', value: `${stats.overdue} overdue`, color: '#DC2626' },
              { label: 'Active Clients', value: `${stats.clients} clients`, color: '#0D5C3A' },
            ].map(row => (
              <div key={row.label} className="flex items-center justify-between p-3 bg-mfb-bg rounded-lg">
                <span className="text-sm text-mfb-muted">{row.label}</span>
                <span className="font-bold text-sm" style={{ color: row.color }}>{row.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-5">
          <h3 className="font-bold mb-4">Transaction Summary</h3>
          <div className="space-y-3">
            {[
              { label: 'Total Transactions', value: `${stats.transactions}` },
              { label: 'Transaction Volume', value: fmt(stats.volume) },
              { label: 'Pending Approvals', value: `${stats.approvals} items` },
            ].map(row => (
              <div key={row.label} className="flex items-center justify-between p-3 bg-mfb-bg rounded-lg">
                <span className="text-sm text-mfb-muted">{row.label}</span>
                <span className="font-bold text-sm text-mfb-text">{row.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card p-5 border-emerald-DEFAULT/20 bg-emerald-soft">
        <h3 className="font-bold text-emerald-DEFAULT mb-2">📊 Export Reports</h3>
        <p className="text-emerald-DEFAULT/70 text-sm mb-4">Download CBN-format reports for regulatory submission</p>
        <div className="flex flex-wrap gap-3">
          {['Monthly MFB Return', 'Loan Portfolio Report', 'KYC Compliance Report', 'Transaction Ledger'].map(r => (
            <button key={r} className="btn text-emerald-DEFAULT border border-emerald-DEFAULT/30 bg-white hover:bg-emerald-soft text-xs">{r}</button>
          ))}
        </div>
      </div>
    </div>
  )
}
