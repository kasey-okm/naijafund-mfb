'use client'
import Link from 'next/link'
import { useState } from 'react'

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-navy-DEFAULT overflow-x-hidden">
      {/* Gradient background blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-emerald-DEFAULT/20 blur-3xl" />
        <div className="absolute top-1/3 -left-20 w-80 h-80 rounded-full bg-gold-DEFAULT/10 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-64 rounded-full bg-emerald-mid/10 blur-3xl" />
      </div>

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-6 md:px-16 py-5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl gradient-gold flex items-center justify-center text-white font-black text-lg">₦</div>
          <span className="font-display font-bold text-xl text-white">NaijaFund <span className="text-gold-light">MFB</span></span>
        </div>
        <div className="hidden md:flex items-center gap-8">
          {['Products', 'About', 'CBN Compliance', 'Contact'].map(item => (
            <a key={item} href="#" className="text-white/60 hover:text-white text-sm font-medium transition-colors">{item}</a>
          ))}
        </div>
        <div className="hidden md:flex items-center gap-3">
          <Link href="/customer/auth" className="text-white/70 hover:text-white text-sm font-semibold transition-colors px-4 py-2">
            Customer Portal
          </Link>
          <Link href="/staff/login" className="btn-primary text-sm">
            Staff Login →
          </Link>
        </div>
        <button className="md:hidden text-white" onClick={() => setMenuOpen(!menuOpen)}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={menuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
          </svg>
        </button>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden fixed inset-0 z-20 bg-navy-DEFAULT/95 backdrop-blur flex flex-col items-center justify-center gap-6">
          <button onClick={() => setMenuOpen(false)} className="absolute top-5 right-6 text-white text-2xl">✕</button>
          <Link href="/customer/auth" className="text-white text-xl font-semibold" onClick={() => setMenuOpen(false)}>Customer Portal</Link>
          <Link href="/staff/login" className="btn-primary text-lg px-8 py-3" onClick={() => setMenuOpen(false)}>Staff Login</Link>
        </div>
      )}

      {/* Hero */}
      <section className="relative z-10 px-6 md:px-16 pt-16 pb-24 text-center max-w-5xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 mb-6 text-xs text-white/60 font-medium animate-fade-up">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-light inline-block" />
          CBN Licensed Microfinance Bank · ISO 27001 Compliant
        </div>
        <h1 className="font-display text-4xl md:text-6xl font-black text-white leading-tight mb-6 animate-fade-up-delay-1 text-balance">
          Banking the <span className="text-gold-light">Unbanked</span>,<br />Empowering Nigeria
        </h1>
        <p className="text-white/50 text-lg max-w-2xl mx-auto mb-10 animate-fade-up-delay-2 leading-relaxed">
          A fully integrated core banking platform built for Nigerian microfinance banks. 
          Multi-branch management, 4-stage approval workflows, real-time transactions, and CBN-ready compliance.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-up-delay-3">
          <Link href="/customer/auth" className="btn-gold text-base px-8 py-3 shadow-glow w-full sm:w-auto justify-center">
            Open an Account →
          </Link>
          <Link href="/staff/login" className="btn text-white/80 border border-white/20 bg-white/5 hover:bg-white/10 text-base px-8 py-3 w-full sm:w-auto justify-center">
            Staff Portal
          </Link>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-20 animate-fade-up-delay-3">
          {[
            { v: '₦2.4B+', l: 'Loans Disbursed' },
            { v: '12,400+', l: 'Active Clients' },
            { v: '4 Branches', l: 'Nationwide' },
            { v: '99.9%', l: 'Uptime SLA' },
          ].map(s => (
            <div key={s.l} className="bg-white/5 border border-white/10 rounded-xl p-5">
              <div className="font-display text-2xl font-black text-gold-light">{s.v}</div>
              <div className="text-white/40 text-xs mt-1">{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="relative z-10 px-6 md:px-16 pb-24 max-w-6xl mx-auto">
        <h2 className="font-display text-3xl font-bold text-white text-center mb-12">Everything a modern MFB needs</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            { icon: '🔐', title: 'Role-Based Access', desc: '5 distinct staff roles with granular module permissions — Admin, Manager, Loan Officer, Teller, Accountant.' },
            { icon: '✅', title: '4-Stage Approvals', desc: 'Loan and account approvals flow through Officer → Manager → Accountant → Admin with full audit trail.' },
            { icon: '📊', title: 'Real-time Dashboard', desc: 'Live KPI cards, portfolio health, branch performance, and transaction feeds per staff scope.' },
            { icon: '🏦', title: 'CBN Compliance', desc: 'Built-in KYC workflows, BVN/NIN verification, audit logs, and regulatory-ready reporting.' },
            { icon: '💳', title: 'Multi-channel Transactions', desc: 'Counter, USSD, mobile, and inter-branch transfers with instant ledger reconciliation.' },
            { icon: '📈', title: 'Loan Management', desc: 'Full loan lifecycle from application to disbursement, repayment scheduling, and overdue tracking.' },
          ].map(f => (
            <div key={f.title} className="bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/8 transition-colors">
              <div className="text-3xl mb-3">{f.icon}</div>
              <h3 className="font-bold text-white mb-2">{f.title}</h3>
              <p className="text-white/50 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 px-6 md:px-16 pb-24 max-w-3xl mx-auto text-center">
        <div className="bg-gradient-to-br from-emerald-DEFAULT/30 to-emerald-mid/20 border border-emerald-DEFAULT/30 rounded-2xl p-10">
          <h2 className="font-display text-3xl font-bold text-white mb-4">Ready to bank smarter?</h2>
          <p className="text-white/50 mb-8">Open your account in minutes. No paperwork, no queues.</p>
          <Link href="/customer/auth" className="btn-gold text-base px-10 py-3 inline-flex">
            Get Started — It's Free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 px-6 md:px-16 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg gradient-gold flex items-center justify-center text-white font-black text-xs">₦</div>
          <span className="text-white/40 text-sm">NaijaFund MFB © 2025. CBN License #MFB/ABJ/2024.</span>
        </div>
        <div className="flex gap-6 text-white/30 text-xs">
          <a href="#" className="hover:text-white/60">Privacy</a>
          <a href="#" className="hover:text-white/60">Terms</a>
          <a href="#" className="hover:text-white/60">CBN Disclosure</a>
        </div>
      </footer>
    </div>
  )
}
