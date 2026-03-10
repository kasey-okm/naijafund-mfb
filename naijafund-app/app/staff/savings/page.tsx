'use client'
import { useEffect, useState } from 'react'
import { createClient, fmt, badge, type Account } from '@/lib/supabase'

export default function SavingsPage() {
  const [accounts, setAccounts] = useState<(Account & { clients?: { full_name: string; acct_no: string } })[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('accounts').select('*, clients(full_name, acct_no)').order('created_at', { ascending: false })
      setAccounts(data || [])
      setLoading(false)
    }
    load()
  }, [])

  const totalBalance = accounts.reduce((a, acc) => a + (acc.balance || 0), 0)

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold">Savings Accounts</h2>
          <p className="text-mfb-muted text-sm mt-0.5">{accounts.length} accounts · Total deposits: <strong>{fmt(totalBalance)}</strong></p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {['savings','current','fixed','loan'].map(type => {
          const typeAccounts = accounts.filter(a => a.account_type === type)
          return (
            <div key={type} className="card p-4">
              <div className="text-mfb-muted text-xs font-semibold uppercase mb-1 capitalize">{type}</div>
              <div className="font-display text-xl font-black text-mfb-text">{typeAccounts.length}</div>
              <div className="text-emerald-DEFAULT text-xs font-semibold mt-1">{fmt(typeAccounts.reduce((a,acc) => a+(acc.balance||0),0))}</div>
            </div>
          )
        })}
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-mfb-muted text-sm">
            <div className="w-8 h-8 border-2 border-emerald-DEFAULT border-t-transparent rounded-full animate-spin mx-auto mb-3" />Loading…
          </div>
        ) : accounts.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-5xl mb-3">◉</div>
            <p className="text-mfb-muted text-sm">No savings accounts yet. Accounts are created automatically when clients are onboarded.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr><th>Account Number</th><th>Client</th><th>Type</th><th>Balance</th><th>Currency</th><th>Branch</th><th>Status</th><th>Opened</th></tr>
              </thead>
              <tbody>
                {accounts.map(a => (
                  <tr key={a.id}>
                    <td className="font-mono text-xs text-teal">{a.account_number}</td>
                    <td className="font-medium">{(a as { clients?: { full_name: string } }).clients?.full_name || '—'}</td>
                    <td><span className={badge(a.account_type)}>{a.account_type}</span></td>
                    <td className="font-bold">{fmt(a.balance || 0)}</td>
                    <td className="text-mfb-muted text-xs">{a.currency || 'NGN'}</td>
                    <td className="text-mfb-muted text-xs">{a.branch || '—'}</td>
                    <td><span className={badge(a.status || 'active')}>{a.status || 'active'}</span></td>
                    <td className="text-mfb-muted text-xs">{new Date(a.created_at).toLocaleDateString('en-NG')}</td>
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
