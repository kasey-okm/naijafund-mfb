'use client'
import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { createClient, ROLES, type StaffProfile } from '@/lib/supabase'

const NAV = [
  { key: 'dashboard', label: 'Dashboard', icon: '◈', href: '/staff/dashboard' },
  { key: 'clients', label: 'Clients & KYC', icon: '⬡', href: '/staff/clients' },
  { key: 'loans', label: 'Loans', icon: '◆', href: '/staff/loans' },
  { key: 'savings', label: 'Savings', icon: '◉', href: '/staff/savings' },
  { key: 'transactions', label: 'Transactions', icon: '⇄', href: '/staff/transactions' },
  { key: 'approvals', label: 'Approvals', icon: '✅', href: '/staff/approvals' },
  { key: 'reports', label: 'Reports', icon: '⊡', href: '/staff/reports' },
  { key: 'access', label: 'Access Control', icon: '🔐', href: '/staff/access' },
]

const ROLE_MODULES: Record<string, string[]> = {
  admin: ['dashboard','clients','loans','savings','transactions','approvals','reports','access'],
  manager: ['dashboard','clients','loans','savings','transactions','approvals','reports'],
  loan_officer: ['dashboard','clients','loans','savings','transactions'],
  teller: ['dashboard','transactions'],
  accountant: ['dashboard','transactions','reports','approvals'],
}

export default function StaffLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [profile, setProfile] = useState<StaffProfile | null>(null)
  const [collapsed, setCollapsed] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { router.push('/staff/login'); return }
      const { data } = await supabase.from('staff_profiles').select('*').eq('user_id', user.id).single()
      if (!data) { router.push('/staff/login'); return }
      setProfile(data as StaffProfile)
    })
  }, [])

  async function logout() {
    await supabase.auth.signOut()
    router.push('/staff/login')
  }

  if (!profile) return (
    <div className="min-h-screen gradient-navy flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 rounded-xl gradient-gold flex items-center justify-center text-white font-black text-xl mx-auto mb-4 animate-float">₦</div>
        <p className="text-white/40 text-sm">Loading portal…</p>
      </div>
    </div>
  )

  const allowed = ROLE_MODULES[profile.role] || ['dashboard']
  const rc = ROLES[profile.role]

  return (
    <div className="min-h-screen flex bg-mfb-bg">
      {/* Sidebar */}
      <aside className={`${collapsed ? 'w-16' : 'w-56'} flex-shrink-0 gradient-navy flex flex-col transition-all duration-200`}>
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-4 py-4 border-b border-white/10">
          <div className="w-8 h-8 rounded-lg gradient-gold flex items-center justify-center text-white font-black shrink-0">₦</div>
          {!collapsed && <span className="font-display font-bold text-white text-sm">NaijaFund MFB</span>}
        </div>

        {/* Role badge */}
        {!collapsed && (
          <div className="px-4 py-3 border-b border-white/10">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                style={{ background: rc.color }}>{profile.full_name[0]}</div>
              <div className="min-w-0">
                <div className="text-white text-xs font-semibold truncate">{profile.full_name}</div>
                <div className="text-xs font-semibold" style={{ color: rc.color }}>{rc.label}</div>
              </div>
            </div>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 px-2 py-3 overflow-y-auto space-y-0.5">
          {NAV.map(n => {
            const ok = allowed.includes(n.key)
            const active = pathname.startsWith(n.href)
            return (
              <Link key={n.key} href={ok ? n.href : '#'}
                title={collapsed ? n.label : undefined}
                className={`nav-item ${active ? 'active' : ''} ${!ok ? 'opacity-30 cursor-not-allowed pointer-events-none' : ''}`}
                style={{ color: active ? '#fff' : 'rgba(255,255,255,0.55)', borderLeft: `3px solid ${active ? rc.color : 'transparent'}` }}>
                <span className="text-sm w-5 text-center shrink-0">{n.icon}</span>
                {!collapsed && <span>{n.label}</span>}
                {!ok && !collapsed && <span className="ml-auto text-xs">🔒</span>}
              </Link>
            )
          })}
        </nav>

        {/* Bottom */}
        <div className="px-2 py-3 border-t border-white/10 space-y-0.5">
          <button onClick={() => setCollapsed(!collapsed)}
            className="nav-item w-full" style={{ color: 'rgba(255,255,255,0.4)' }}>
            <span className="text-sm w-5 text-center">{collapsed ? '→' : '←'}</span>
            {!collapsed && <span className="text-xs">Collapse</span>}
          </button>
          <button onClick={logout}
            className="nav-item w-full" style={{ color: 'rgba(255,255,255,0.4)' }}>
            <span className="text-sm w-5 text-center">⏻</span>
            {!collapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="h-14 bg-white border-b border-mfb-border flex items-center justify-between px-6 sticky top-0 z-10">
          <div>
            <h1 className="font-bold text-mfb-text text-sm">
              {NAV.find(n => pathname.startsWith(n.href))?.label || 'Dashboard'}
            </h1>
            <p className="text-mfb-muted text-xs">{profile.branch} · {new Date().toLocaleDateString('en-NG', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs px-2.5 py-1 rounded-full font-semibold border" style={{ background: rc.bg, color: rc.color, borderColor: rc.color + '40' }}>
              {rc.label}
            </span>
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
              style={{ background: rc.color }}>{profile.full_name[0]}</div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
