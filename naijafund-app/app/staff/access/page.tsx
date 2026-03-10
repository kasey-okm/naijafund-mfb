'use client'
import { useEffect, useState } from 'react'
import { createClient, ROLES, type StaffProfile } from '@/lib/supabase'

const DEFAULT_PERMS: Record<string, Record<string, boolean>> = {
  admin: { dashboard:true, clients:true, loans:true, savings:true, transactions:true, approvals:true, reports:true, access:true },
  manager: { dashboard:true, clients:true, loans:true, savings:true, transactions:true, approvals:true, reports:true, access:false },
  loan_officer: { dashboard:true, clients:true, loans:true, savings:true, transactions:false, approvals:false, reports:false, access:false },
  teller: { dashboard:true, clients:false, loans:false, savings:false, transactions:true, approvals:false, reports:false, access:false },
  accountant: { dashboard:true, clients:false, loans:false, savings:false, transactions:true, approvals:true, reports:true, access:false },
}

const MODULES = [
  { key: 'dashboard', label: 'Dashboard', icon: '◈' },
  { key: 'clients', label: 'Clients & KYC', icon: '⬡' },
  { key: 'loans', label: 'Loans', icon: '◆' },
  { key: 'savings', label: 'Savings', icon: '◉' },
  { key: 'transactions', label: 'Transactions', icon: '⇄' },
  { key: 'approvals', label: 'Approvals', icon: '✅' },
  { key: 'reports', label: 'Reports', icon: '⊡' },
  { key: 'access', label: 'Access Control', icon: '🔐' },
]

export default function AccessPage() {
  const [staff, setStaff] = useState<StaffProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [myRole, setMyRole] = useState('')
  const [activating, setActivating] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase.from('staff_profiles').select('role').eq('user_id', user.id).single()
        if (data) setMyRole(data.role)
      }
      const { data } = await supabase.from('staff_profiles').select('*').order('role').order('full_name')
      setStaff((data as StaffProfile[]) || [])
      setLoading(false)
    }
    load()
  }, [])

  async function toggleActive(id: string, current: boolean) {
    setActivating(id)
    await supabase.from('staff_profiles').update({ is_active: !current }).eq('id', id)
    const { data } = await supabase.from('staff_profiles').select('*').order('role').order('full_name')
    setStaff((data as StaffProfile[]) || [])
    setActivating(null)
  }

  if (myRole !== 'admin') return (
    <div className="p-12 text-center">
      <div className="text-5xl mb-3">🔐</div>
      <h3 className="font-bold text-mfb-text mb-2">Admin Only</h3>
      <p className="text-mfb-muted text-sm">Access Control is restricted to Super Admin only.</p>
    </div>
  )

  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <h2 className="font-display text-2xl font-bold">Access Control</h2>
        <p className="text-mfb-muted text-sm mt-0.5">{staff.length} staff members · Manage roles and permissions</p>
      </div>

      {/* Role matrix */}
      <div className="card overflow-hidden">
        <div className="p-5 border-b border-mfb-border">
          <h3 className="font-bold">Role Permission Matrix</h3>
          <p className="text-mfb-muted text-xs mt-0.5">Default permissions per role</p>
        </div>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Module</th>
                {Object.keys(ROLES).map(role => (
                  <th key={role} style={{ color: ROLES[role as keyof typeof ROLES].color }}>
                    {ROLES[role as keyof typeof ROLES].label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MODULES.map(mod => (
                <tr key={mod.key}>
                  <td className="font-medium">
                    <span className="mr-2">{mod.icon}</span>{mod.label}
                  </td>
                  {Object.keys(ROLES).map(role => (
                    <td key={role} className="text-center">
                      {DEFAULT_PERMS[role]?.[mod.key] ? (
                        <span className="text-emerald-DEFAULT font-bold">✓</span>
                      ) : (
                        <span className="text-mfb-border">✗</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Staff list */}
      <div className="card overflow-hidden">
        <div className="p-5 border-b border-mfb-border flex items-center justify-between">
          <h3 className="font-bold">Staff Members</h3>
          <span className="text-mfb-muted text-xs">{staff.filter(s => !s.is_active).length} pending activation</span>
        </div>
        {loading ? (
          <div className="p-8 text-center text-mfb-muted text-sm">Loading…</div>
        ) : staff.length === 0 ? (
          <div className="p-8 text-center text-mfb-muted text-sm">No staff profiles yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr><th>Name</th><th>Role</th><th>Branch</th><th>Email</th><th>Status</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {staff.map(s => {
                  const rc = ROLES[s.role as keyof typeof ROLES]
                  return (
                    <tr key={s.id}>
                      <td>
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                            style={{ background: rc.color }}>{s.full_name[0]}</div>
                          <span className="font-medium">{s.full_name}</span>
                        </div>
                      </td>
                      <td><span className="text-xs font-semibold px-2 py-1 rounded-full" style={{ background: rc.bg, color: rc.color }}>{rc.label}</span></td>
                      <td className="text-mfb-muted text-xs">{s.branch}</td>
                      <td className="text-mfb-muted text-xs">{s.email}</td>
                      <td>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${s.is_active ? 'bg-emerald-soft text-emerald-DEFAULT' : 'bg-amber-100 text-amber-700'}`}>
                          {s.is_active ? '● Active' : '○ Inactive'}
                        </span>
                      </td>
                      <td>
                        <button onClick={() => toggleActive(s.id, s.is_active)}
                          disabled={activating === s.id}
                          className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-colors disabled:opacity-50 ${s.is_active ? 'bg-red-50 text-danger hover:bg-red-100' : 'bg-emerald-soft text-emerald-DEFAULT hover:bg-emerald-DEFAULT/20'}`}>
                          {activating === s.id ? '…' : s.is_active ? 'Deactivate' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
