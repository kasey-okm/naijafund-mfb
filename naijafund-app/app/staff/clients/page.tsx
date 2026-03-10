'use client'
import { useEffect, useState } from 'react'
import { createClient, fmt, badge, BRANCHES, type Client } from '@/lib/supabase'

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    first_name: '', last_name: '', phone: '', email: '', bvn: '', nin: '',
    date_of_birth: '', gender: '', address: '', lga: '', state: 'Lagos',
    occupation: '', monthly_income: '', branch: 'Lagos HQ', next_of_kin: '', nok_phone: '',
  })
  const supabase = createClient()

  useEffect(() => { fetchClients() }, [])

  async function fetchClients() {
    setLoading(true)
    const { data } = await supabase.from('clients').select('*').order('created_at', { ascending: false })
    setClients((data as Client[]) || [])
    setLoading(false)
  }

  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }))

  async function submitClient(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const { error } = await supabase.from('clients').insert({
        first_name: form.first_name,
        last_name: form.last_name,
        full_name: `${form.first_name} ${form.last_name}`.trim(),
        phone: form.phone,
        email: form.email,
        bvn: form.bvn,
        nin: form.nin,
        date_of_birth: form.date_of_birth || null,
        gender: form.gender,
        address: form.address,
        lga: form.lga,
        state: form.state,
        occupation: form.occupation,
        monthly_income: parseFloat(form.monthly_income) || 0,
        branch: form.branch,
        next_of_kin: form.next_of_kin,
        nok_phone: form.nok_phone,
        kyc_status: 'pending',
        status: 'active',
        credit_score: 650,
      })
      if (error) throw error
      setShowForm(false)
      setForm({ first_name: '', last_name: '', phone: '', email: '', bvn: '', nin: '', date_of_birth: '', gender: '', address: '', lga: '', state: 'Lagos', occupation: '', monthly_income: '', branch: 'Lagos HQ', next_of_kin: '', nok_phone: '' })
      fetchClients()
    } catch (err) {
      alert('Error: ' + (err as Error).message)
    } finally { setSaving(false) }
  }

  const filtered = clients.filter(c =>
    c.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    c.phone?.includes(search) ||
    c.acct_no?.includes(search) ||
    c.bvn?.includes(search)
  )

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold text-mfb-text">Clients & KYC</h2>
          <p className="text-mfb-muted text-sm mt-0.5">{clients.length} total clients · {clients.filter(c => c.kyc_status === 'pending').length} pending KYC</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary">+ Onboard New Client</button>
      </div>

      {/* Search */}
      <div className="card p-4">
        <input value={search} onChange={e => setSearch(e.target.value)}
          className="input-field" placeholder="Search by name, phone, account number, BVN…" />
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-mfb-muted text-sm">
            <div className="w-8 h-8 border-2 border-emerald-DEFAULT border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            Loading clients…
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-5xl mb-3">⬡</div>
            <p className="text-mfb-muted text-sm mb-4">{search ? 'No clients match your search.' : 'No clients yet.'}</p>
            {!search && <button onClick={() => setShowForm(true)} className="btn-primary">Onboard First Client</button>}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Account No</th><th>Name</th><th>Phone</th><th>Branch</th>
                  <th>KYC Status</th><th>Credit Score</th><th>Loan Balance</th><th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(c => (
                  <tr key={c.id}>
                    <td><span className="font-mono text-xs text-teal">{c.acct_no || '—'}</span></td>
                    <td>
                      <div className="font-semibold text-mfb-text">{c.full_name}</div>
                      <div className="text-mfb-muted text-xs">{c.email}</div>
                    </td>
                    <td className="text-sm">{c.phone}</td>
                    <td className="text-mfb-muted text-xs">{c.branch}</td>
                    <td><span className={badge(c.kyc_status)}>{c.kyc_status}</span></td>
                    <td>
                      <span className={`font-bold text-sm ${c.credit_score >= 700 ? 'text-emerald-DEFAULT' : c.credit_score >= 600 ? 'text-warning' : 'text-danger-light'}`}>
                        {c.credit_score}
                      </span>
                    </td>
                    <td className="font-semibold">{fmt(c.loan_balance || 0)}</td>
                    <td><span className={badge(c.status)}>{c.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-navy-DEFAULT/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto shadow-modal">
            <div className="flex items-center justify-between p-6 border-b border-mfb-border sticky top-0 bg-white z-10">
              <h3 className="font-display text-xl font-bold">Onboard New Client</h3>
              <button onClick={() => setShowForm(false)} className="w-8 h-8 rounded-full bg-mfb-bg hover:bg-gray-200 flex items-center justify-center text-mfb-muted transition-colors">✕</button>
            </div>
            <form onSubmit={submitClient} className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-mfb-muted mb-1.5 uppercase tracking-wide">First Name *</label>
                  <input value={form.first_name} onChange={e => set('first_name', e.target.value)} className="input-field" required />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-mfb-muted mb-1.5 uppercase tracking-wide">Last Name *</label>
                  <input value={form.last_name} onChange={e => set('last_name', e.target.value)} className="input-field" required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-mfb-muted mb-1.5 uppercase tracking-wide">Phone *</label>
                  <input type="tel" value={form.phone} onChange={e => set('phone', e.target.value)} className="input-field" placeholder="08012345678" required />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-mfb-muted mb-1.5 uppercase tracking-wide">Email</label>
                  <input type="email" value={form.email} onChange={e => set('email', e.target.value)} className="input-field" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-mfb-muted mb-1.5 uppercase tracking-wide">BVN</label>
                  <input value={form.bvn} onChange={e => set('bvn', e.target.value)} className="input-field" maxLength={11} placeholder="11-digit BVN" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-mfb-muted mb-1.5 uppercase tracking-wide">NIN</label>
                  <input value={form.nin} onChange={e => set('nin', e.target.value)} className="input-field" maxLength={11} placeholder="11-digit NIN" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-mfb-muted mb-1.5 uppercase tracking-wide">Date of Birth</label>
                  <input type="date" value={form.date_of_birth} onChange={e => set('date_of_birth', e.target.value)} className="input-field" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-mfb-muted mb-1.5 uppercase tracking-wide">Gender</label>
                  <select value={form.gender} onChange={e => set('gender', e.target.value)} className="input-field">
                    <option value="">Select</option>
                    <option>Male</option><option>Female</option><option>Other</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-mfb-muted mb-1.5 uppercase tracking-wide">Address</label>
                <input value={form.address} onChange={e => set('address', e.target.value)} className="input-field" placeholder="Street address" />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-mfb-muted mb-1.5 uppercase tracking-wide">LGA</label>
                  <input value={form.lga} onChange={e => set('lga', e.target.value)} className="input-field" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-mfb-muted mb-1.5 uppercase tracking-wide">State</label>
                  <input value={form.state} onChange={e => set('state', e.target.value)} className="input-field" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-mfb-muted mb-1.5 uppercase tracking-wide">Branch *</label>
                  <select value={form.branch} onChange={e => set('branch', e.target.value)} className="input-field" required>
                    {BRANCHES.map(b => <option key={b}>{b}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-mfb-muted mb-1.5 uppercase tracking-wide">Occupation</label>
                  <input value={form.occupation} onChange={e => set('occupation', e.target.value)} className="input-field" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-mfb-muted mb-1.5 uppercase tracking-wide">Monthly Income (₦)</label>
                  <input type="number" value={form.monthly_income} onChange={e => set('monthly_income', e.target.value)} className="input-field" placeholder="50000" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-mfb-muted mb-1.5 uppercase tracking-wide">Next of Kin</label>
                  <input value={form.next_of_kin} onChange={e => set('next_of_kin', e.target.value)} className="input-field" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-mfb-muted mb-1.5 uppercase tracking-wide">NOK Phone</label>
                  <input type="tel" value={form.nok_phone} onChange={e => set('nok_phone', e.target.value)} className="input-field" />
                </div>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-700">
                💡 An account number will be auto-generated. KYC verification required within 5 business days per CBN regulation.
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary flex-1 justify-center">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary flex-1 justify-center disabled:opacity-60">
                  {saving ? 'Creating Account…' : 'Create Account ✓'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
