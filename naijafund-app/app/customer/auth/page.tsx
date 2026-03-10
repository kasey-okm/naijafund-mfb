'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'

export default function CustomerAuth() {
  const router = useRouter()
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const supabase = createClient()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error: err } = await supabase.auth.signInWithPassword({ email, password })
    if (err) { setError(err.message); setLoading(false); return }
    router.push('/customer/portal')
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { data, error: err } = await supabase.auth.signUp({
      email, password,
      options: { data: { phone, role: 'customer' } }
    })
    if (err) { setError(err.message); setLoading(false); return }
    if (data.user) {
      // Create a pending client record
      await supabase.from('clients').insert({
        user_id: data.user.id,
        full_name: email.split('@')[0],
        email,
        phone,
        branch: 'Lagos HQ',
        status: 'active',
        kyc_status: 'pending',
        credit_score: 0,
        loan_balance: 0,
        savings_balance: 0,
      })
    }
    setSuccess('Account created! Please verify your email, then sign in.')
    setMode('login')
    setLoading(false)
  }

  return (
    <div className="min-h-screen gradient-navy flex flex-col">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg gradient-gold flex items-center justify-center text-white font-black">₦</div>
          <span className="font-display font-bold text-white">NaijaFund MFB</span>
        </Link>
        <Link href="/staff/login" className="text-white/50 hover:text-white text-sm transition-colors">Staff Portal →</Link>
      </nav>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Tabs */}
          <div className="flex bg-white/10 rounded-xl p-1 mb-6">
            {(['login', 'signup'] as const).map(m => (
              <button key={m} onClick={() => setMode(m)}
                className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${mode === m ? 'bg-white text-mfb-text shadow-sm' : 'text-white/60 hover:text-white'}`}>
                {m === 'login' ? '🔐 Sign In' : '✨ Open Account'}
              </button>
            ))}
          </div>

          <div className="card p-7">
            {mode === 'login' ? (
              <>
                <h1 className="font-display text-2xl font-bold mb-1">Welcome back</h1>
                <p className="text-mfb-muted text-sm mb-6">Access your NaijaFund account</p>
                {error && <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 text-sm text-danger-light">⚠️ {error}</div>}
                {success && <div className="bg-emerald-soft border border-emerald-DEFAULT/30 rounded-lg p-3 mb-4 text-sm text-emerald-DEFAULT">✅ {success}</div>}
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-mfb-muted mb-1.5 uppercase tracking-wide">Email</label>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="input-field" placeholder="you@email.com" required />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-mfb-muted mb-1.5 uppercase tracking-wide">Password</label>
                    <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="input-field" placeholder="••••••••" required />
                  </div>
                  <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-2.5 disabled:opacity-60">
                    {loading ? 'Signing in…' : 'Sign In →'}
                  </button>
                </form>
              </>
            ) : (
              <>
                <h1 className="font-display text-2xl font-bold mb-1">Open an Account</h1>
                <p className="text-mfb-muted text-sm mb-6">Join thousands of Nigerians banking smarter</p>
                {error && <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 text-sm text-danger-light">⚠️ {error}</div>}
                <form onSubmit={handleSignup} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-mfb-muted mb-1.5 uppercase tracking-wide">Email Address *</label>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="input-field" placeholder="you@email.com" required />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-mfb-muted mb-1.5 uppercase tracking-wide">Phone Number *</label>
                    <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="input-field" placeholder="08012345678" required />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-mfb-muted mb-1.5 uppercase tracking-wide">Password *</label>
                    <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="input-field" placeholder="Min. 8 characters" required minLength={8} />
                  </div>
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-700">
                    📋 After registration, complete KYC verification (BVN + NIN) at any branch or via our app to activate full account features.
                  </div>
                  <button type="submit" disabled={loading} className="btn-gold w-full justify-center py-2.5 disabled:opacity-60">
                    {loading ? 'Creating Account…' : 'Create My Account ✨'}
                  </button>
                  <p className="text-center text-mfb-muted text-xs">
                    By registering you agree to our{' '}
                    <a href="#" className="text-emerald-DEFAULT hover:underline">Terms of Service</a> and{' '}
                    <a href="#" className="text-emerald-DEFAULT hover:underline">Privacy Policy</a>
                  </p>
                </form>
              </>
            )}
          </div>
          <p className="text-center text-white/20 text-xs mt-4">🔒 256-bit SSL · CBN Licensed MFB</p>
        </div>
      </div>
    </div>
  )
}
