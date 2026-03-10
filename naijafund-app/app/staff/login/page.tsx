'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'

const DEMO_STAFF = [
  { email: 'admin@naijafund.ng', role: 'Super Admin', color: '#8B5CF6' },
  { email: 'manager@naijafund.ng', role: 'Branch Manager', color: '#0D5C3A' },
  { email: 'officer@naijafund.ng', role: 'Loan Officer', color: '#C9941A' },
  { email: 'teller@naijafund.ng', role: 'Teller', color: '#0E7490' },
  { email: 'accountant@naijafund.ng', role: 'Accountant', color: '#DC2626' },
]

export default function StaffLogin() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const supabase = createClient()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const { error: authError } = await supabase.auth.signInWithPassword({ email, password })
      if (authError) { setError(authError.message); return }
      // Verify staff profile exists
      const { data: profile } = await supabase
        .from('staff_profiles')
        .select('id, role, is_active')
        .eq('email', email)
        .single()
      if (!profile) { setError('No staff profile found. Contact your admin.'); return }
      if (!profile.is_active) { setError('Your account is pending activation. Contact Admin.'); return }
      router.push('/staff/dashboard')
    } catch {
      setError('Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  function fillDemo(em: string) { setEmail(em); setPassword('Demo@1234!') }

  return (
    <div className="min-h-screen gradient-navy flex">
      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-between w-[420px] bg-white/5 border-r border-white/10 p-10">
        <div>
          <Link href="/" className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 rounded-xl gradient-gold flex items-center justify-center text-white font-black text-xl">₦</div>
            <span className="font-display font-bold text-xl text-white">NaijaFund <span className="text-gold-light">MFB</span></span>
          </Link>
          <h2 className="font-display text-3xl font-bold text-white mb-4">Staff Portal</h2>
          <p className="text-white/40 text-sm leading-relaxed mb-8">
            Secure access for authorized staff. Your session is encrypted and all actions are audit-logged.
          </p>
          <div className="space-y-2">
            <p className="text-white/30 text-xs font-semibold uppercase tracking-wider mb-3">Demo Accounts</p>
            {DEMO_STAFF.map(s => (
              <button key={s.email} onClick={() => fillDemo(s.email)}
                className="w-full flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-left group">
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                  style={{ background: s.color }}>{s.email[0].toUpperCase()}</div>
                <div>
                  <div className="text-white/70 text-sm font-medium group-hover:text-white transition-colors">{s.role}</div>
                  <div className="text-white/30 text-xs">{s.email}</div>
                </div>
                <span className="ml-auto text-white/20 group-hover:text-white/50 text-xs">→</span>
              </button>
            ))}
            <p className="text-white/20 text-xs mt-2">Password: Demo@1234!</p>
          </div>
        </div>
        <div className="text-white/20 text-xs">
          © 2025 NaijaFund MFB · CBN Licensed<br />
          All activity is monitored and logged
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <Link href="/" className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-lg gradient-gold flex items-center justify-center text-white font-black">₦</div>
            <span className="font-display font-bold text-lg text-white">NaijaFund MFB</span>
          </Link>
          <div className="card p-8">
            <h1 className="font-display text-2xl font-bold text-mfb-text mb-1">Welcome back</h1>
            <p className="text-mfb-muted text-sm mb-7">Sign in to your staff account</p>
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-5 text-sm text-danger-light flex items-start gap-2">
                <span>⚠️</span> {error}
              </div>
            )}
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-mfb-muted mb-1.5 uppercase tracking-wide">Work Email</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  className="input-field" placeholder="you@naijafund.ng" required />
              </div>
              <div>
                <label className="block text-xs font-semibold text-mfb-muted mb-1.5 uppercase tracking-wide">Password</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                  className="input-field" placeholder="••••••••" required />
              </div>
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 text-mfb-muted cursor-pointer">
                  <input type="checkbox" className="rounded border-mfb-border" />
                  Remember me
                </label>
                <a href="#" className="text-emerald-DEFAULT hover:underline font-medium">Forgot password?</a>
              </div>
              <button type="submit" disabled={loading}
                className="btn-primary w-full justify-center py-2.5 text-base disabled:opacity-60">
                {loading ? 'Signing in…' : 'Sign In →'}
              </button>
            </form>
            <div className="mt-6 pt-6 border-t border-mfb-border text-center">
              <p className="text-mfb-muted text-sm">
                Are you a customer?{' '}
                <Link href="/customer/auth" className="text-emerald-DEFAULT font-semibold hover:underline">
                  Customer Portal →
                </Link>
              </p>
            </div>
          </div>
          <p className="text-center text-white/20 text-xs mt-6">
            🔒 256-bit SSL encrypted · ISO 27001 Compliant
          </p>
        </div>
      </div>
    </div>
  )
}
