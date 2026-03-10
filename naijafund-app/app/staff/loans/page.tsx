'use client'
import { useEffect, useState } from 'react'
import { createClient, fmt, badge, BRANCHES, type Loan, type Client } from '@/lib/supabase'

export default function LoansPage() {
  const [loans, setLoans] = useState<(Loan & { clients?: { full_name: string } })[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    client_id: '', principal: '', interest_rate: '18', tenure: '12',
    purpose: '', branch: 'Lagos HQ',
  })
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const [l, c] = await Promise.all([
        supabase.from('loans').select('*, clients(full_name)').order('created_at', { ascending: false }),
        supabase.from('clients').select('id, full_name, acct_no').order('full_name'),
      ])
      setLoans(l.data || [])
      setClients(c.data || [])
      setLoading(false)
    }
    load()
  }, [])

  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }))

  async function submitLoan(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const principal = parseFloat(form.principal)
      const { data: loan, error } = await supabase.from('loans').insert({
        client_id: form.client_id,
        principal,
        interest_rate: parseFloat(form.interest_rate),
        tenure: parseInt(form.tenure),
        purpose: form.purpose,
        outstanding: principal,
        branch: form.branch,
        status: 'pending',
        loan_ref: 'LN-' + Date.now().toString(36).toUpperCase(),
      }).select().single()
      if (error) throw error

      // Create approval queue entry
      const client = clients.find(c => c.id === form.client_id)
      await supabase.from('approval_queue').insert({
        entity_type: 'loan',
        entity_id: loan.id,
        title: `Loan Application — ${client?.full_name}`,
        amount: principal,
        client_name: client?.full_name,
        branch: form.branch,
        stage: 1,
        status: 'pending',
        metadata: { loan_ref: loan.loan_ref, purpose: form.purpose },
      })

      setShowForm(false)
      setForm({ client_id: '', principal: '', interest_rate: '18', tenure: '12', purpose: '', branch: 'Lagos HQ' })
      const { data } = await supabase.from('loans').select('*, clients(full_name)').order('created_at', { ascending: false })
      setLoans(data || [])
    } catch (err) { alert('Error: ' + (err as Error).message) }
    finally { setSaving(false) }
  }

  const filtered = loans.filter(l => {
    if (filter !== 'all' && l.status !== filter) return false
    const name = (l as unknown as { clients?: { full_name: string } }).clients?.full_name?.toLowerCase() || ''
    return name.includes(search.toLowerCase()) || l.loan_ref?.includes(search) || true
  })

  const portfolio = loans.reduce((a, l) => a + (l.outstanding || 0), 0)

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold">Loans</h2>
          <p className="text-mfb-muted text-sm mt-0.5">Portfolio: <strong>{fmt(portfolio)}</strong> · {loans.length} loans total</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary">+ New Loan Application</button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Portfolio', value: fmt(portfolio), color: '#0D5C3A' },
          { label: 'Active Loans', value: loans.filter(l => l.status === 'active' || l.status === 'disbursed').length.toString(), color: '#0E7490' },
          { label: 'Pending Approval', value: loans.filter(l => l.status === 'pending').length.toString(), color: '#C9941A' },
          { label: 'Overdue', value: loans.filter(l => l.status === 'overdue').length.toString(), color: '#DC2626' },
        ].map(k => (
          <div key={k.label} className="card p-4">
            <div className="text-mfb-muted text-xs font-semibold uppercase tracking-wide mb-1">{k.label}</div>
            <div className="font-display text-xl font-black" style={{ color: k.color }}>{k.value}</div>
          </div>
        ))}
      </div>

      {/* Filters & search */}
      <div className="card p-4 flex flex-wrap gap-3 items-center">
        <input value={search} onChange={e => setSearch(e.target.value)}
          className="input-field max-w-xs" placeholder="Search by client, reference…" />
        <div className="flex gap-1 flex-wrap">
          {['all', 'pending', 'active', 'disbursed', 'overdue', 'closed'].map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${filter === s ? 'gradient-emerald text-white' : 'bg-mfb-bg text-mfb-muted hover:bg-gray-200'}`}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-mfb-muted text-sm">
            <div className="w-8 h-8 border-2 border-emerald-DEFAULT border-t-transparent rounded-full animate-spin mx-auto mb-3" />Loading…
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-5xl mb-3">◆</div>
            <p className="text-mfb-muted text-sm mb-4">No loans found.</p>
            <button onClick={() => setShowForm(true)} className="btn-primary">New Loan Application</button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr><th>Ref</th><th>Client</th><th>Principal</th><th>Outstanding</th><th>Rate</th><th>Tenure</th><th>Purpose</th><th>Status</th><th>Date</th></tr>
              </thead>
              <tbody>
                {filtered.map(l => (
                  <tr key={l.id}>
                    <td className="font-mono text-xs text-teal">{l.loan_ref || l.id.slice(0,8)}</td>
                    <td className="font-medium">{(l as unknown as { clients?: { full_name: string } }).clients?.full_name || '—'}</td>
                    <td className="font-bold">{fmt(l.principal)}</td>
                    <td className={l.outstanding > 0 ? 'font-bold text-warning' : 'text-mfb-muted'}>{fmt(l.outstanding || 0)}</td>
                    <td>{l.interest_rate}% p.a.</td>
                    <td>{l.tenure} mo</td>
                    <td className="text-mfb-muted text-xs max-w-[120px] truncate">{l.purpose || '—'}</td>
                    <td><span className={badge(l.status)}>{l.status}</span></td>
                    <td className="text-mfb-muted text-xs">{new Date(l.created_at).toLocaleDateString('en-NG')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* New Loan Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-navy-DEFAULT/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-modal">
            <div className="flex items-center justify-between p-6 border-b border-mfb-border">
              <h3 className="font-display text-xl font-bold">New Loan Application</h3>
              <button onClick={() => setShowForm(false)} className="w-8 h-8 rounded-full bg-mfb-bg hover:bg-gray-200 flex items-center justify-center text-mfb-muted">✕</button>
            </div>
            <form onSubmit={submitLoan} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-mfb-muted mb-1.5 uppercase tracking-wide">Client *</label>
                <select value={form.client_id} onChange={e => set('client_id', e.target.value)} className="input-field" required>
                  <option value="">Select client…</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.full_name} — {c.acct_no}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-mfb-muted mb-1.5 uppercase tracking-wide">Principal (₦) *</label>
                  <input type="number" value={form.principal} onChange={e => set('principal', e.target.value)} className="input-field" placeholder="500000" required min="1000" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-mfb-muted mb-1.5 uppercase tracking-wide">Interest Rate (% p.a.)</label>
                  <input type="number" value={form.interest_rate} onChange={e => set('interest_rate', e.target.value)} className="input-field" step="0.1" min="1" max="50" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-mfb-muted mb-1.5 uppercase tracking-wide">Tenure (months)</label>
                  <select value={form.tenure} onChange={e => set('tenure', e.target.value)} className="input-field">
                    {[3,6,9,12,18,24,36,48,60].map(n => <option key={n} value={n}>{n} months</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-mfb-muted mb-1.5 uppercase tracking-wide">Branch</label>
                  <select value={form.branch} onChange={e => set('branch', e.target.value)} className="input-field">
                    {BRANCHES.map(b => <option key={b}>{b}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-mfb-muted mb-1.5 uppercase tracking-wide">Loan Purpose</label>
                <input value={form.purpose} onChange={e => set('purpose', e.target.value)} className="input-field" placeholder="Business expansion, medical, school fees…" />
              </div>
              {form.principal && (
                <div className="bg-emerald-soft border border-emerald-DEFAULT/20 rounded-lg p-3 text-xs text-emerald-DEFAULT">
                  💡 Monthly repayment ≈ <strong>{fmt((parseFloat(form.principal) * (1 + parseFloat(form.interest_rate)/100) / parseInt(form.tenure)) || 0)}</strong>
                  &nbsp;· This application will enter the 4-stage approval workflow.
                </div>
              )}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary flex-1 justify-center">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary flex-1 justify-center disabled:opacity-60">
                  {saving ? 'Submitting…' : 'Submit for Approval →'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
