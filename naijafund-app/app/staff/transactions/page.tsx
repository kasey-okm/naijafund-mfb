'use client'
import { useEffect, useState } from 'react'
import { createClient, fmt, badge, type Transaction } from '@/lib/supabase'

const TXN_TYPES = ['Deposit', 'Withdrawal', 'Transfer', 'Repayment', 'Fee', 'Reversal']
const CHANNELS = ['Counter', 'USSD', 'Mobile App', 'Online', 'Agent']

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState('')
  const [form, setForm] = useState({
    type: 'Deposit', amount: '', client_name: '', description: '', channel: 'Counter', account_number: '',
  })
  const supabase = createClient()

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    const { data } = await supabase.from('transactions').select('*').order('created_at', { ascending: false }).limit(50)
    setTransactions((data as Transaction[]) || [])
    setLoading(false)
  }

  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }))

  async function post(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const ref = 'TXN' + Date.now().toString().slice(-8)
      const { error } = await supabase.from('transactions').insert({
        reference: ref,
        type: form.type,
        amount: parseFloat(form.amount),
        status: 'success',
        channel: form.channel.toLowerCase(),
        client_name: form.client_name,
        description: form.description || `${form.type} via ${form.channel}`,
      })
      if (error) throw error
      setSuccess(`Transaction ${ref} posted successfully!`)
      setShowForm(false)
      setForm({ type: 'Deposit', amount: '', client_name: '', description: '', channel: 'Counter', account_number: '' })
      load()
      setTimeout(() => setSuccess(''), 4000)
    } catch (err) { alert('Error: ' + (err as Error).message) }
    finally { setSaving(false) }
  }

  const todayTxns = transactions.filter(t => new Date(t.created_at).toDateString() === new Date().toDateString())
  const todayVolume = todayTxns.filter(t => t.status === 'success').reduce((a, t) => a + t.amount, 0)

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold">Transactions</h2>
          <p className="text-mfb-muted text-sm mt-0.5">Today: {todayTxns.length} transactions · {fmt(todayVolume)} volume</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary">+ Post Transaction</button>
      </div>

      {success && (
        <div className="bg-emerald-soft border border-emerald-DEFAULT/30 rounded-lg p-4 text-emerald-DEFAULT text-sm font-semibold flex items-center gap-2">
          ✅ {success}
        </div>
      )}

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Today's Volume", value: fmt(todayVolume), color: '#0D5C3A' },
          { label: "Today's Count", value: todayTxns.length.toString(), color: '#0E7490' },
          { label: 'Total Records', value: transactions.length.toString(), color: '#C9941A' },
          { label: 'Failed', value: transactions.filter(t => t.status === 'failed').length.toString(), color: '#DC2626' },
        ].map(k => (
          <div key={k.label} className="card p-4">
            <div className="text-mfb-muted text-xs font-semibold uppercase tracking-wide mb-1">{k.label}</div>
            <div className="font-display text-xl font-black" style={{ color: k.color }}>{k.value}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-mfb-muted text-sm">
            <div className="w-8 h-8 border-2 border-emerald-DEFAULT border-t-transparent rounded-full animate-spin mx-auto mb-3" />Loading…
          </div>
        ) : transactions.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-5xl mb-3">⇄</div>
            <p className="text-mfb-muted text-sm mb-4">No transactions yet.</p>
            <button onClick={() => setShowForm(true)} className="btn-primary">Post First Transaction</button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr><th>Reference</th><th>Type</th><th>Amount</th><th>Client</th><th>Channel</th><th>Description</th><th>Status</th><th>Date & Time</th></tr>
              </thead>
              <tbody>
                {transactions.map(t => (
                  <tr key={t.id}>
                    <td className="font-mono text-xs text-teal">{t.reference}</td>
                    <td><span className="font-medium">{t.type}</span></td>
                    <td className="font-bold">{fmt(t.amount)}</td>
                    <td className="text-mfb-muted text-xs">{t.client_name || '—'}</td>
                    <td className="text-mfb-muted text-xs capitalize">{t.channel || '—'}</td>
                    <td className="text-mfb-muted text-xs max-w-[150px] truncate">{t.description || '—'}</td>
                    <td><span className={badge(t.status)}>{t.status}</span></td>
                    <td className="text-mfb-muted text-xs whitespace-nowrap">
                      {new Date(t.created_at).toLocaleString('en-NG', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Post Transaction Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-navy-DEFAULT/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-modal">
            <div className="flex items-center justify-between p-6 border-b border-mfb-border">
              <h3 className="font-display text-xl font-bold">Post Transaction</h3>
              <button onClick={() => setShowForm(false)} className="w-8 h-8 rounded-full bg-mfb-bg hover:bg-gray-200 flex items-center justify-center text-mfb-muted">✕</button>
            </div>
            <form onSubmit={post} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-mfb-muted mb-1.5 uppercase tracking-wide">Transaction Type *</label>
                <select value={form.type} onChange={e => set('type', e.target.value)} className="input-field">
                  {TXN_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-mfb-muted mb-1.5 uppercase tracking-wide">Amount (₦) *</label>
                <input type="number" value={form.amount} onChange={e => set('amount', e.target.value)} className="input-field" placeholder="0.00" required min="1" step="0.01" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-mfb-muted mb-1.5 uppercase tracking-wide">Client Name / Account</label>
                <input value={form.client_name} onChange={e => set('client_name', e.target.value)} className="input-field" placeholder="Customer name or account no" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-mfb-muted mb-1.5 uppercase tracking-wide">Channel</label>
                <select value={form.channel} onChange={e => set('channel', e.target.value)} className="input-field">
                  {CHANNELS.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-mfb-muted mb-1.5 uppercase tracking-wide">Description / Narration</label>
                <input value={form.description} onChange={e => set('description', e.target.value)} className="input-field" placeholder="Optional narration" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary flex-1 justify-center">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary flex-1 justify-center disabled:opacity-60">
                  {saving ? 'Posting…' : 'Post Transaction ✓'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
