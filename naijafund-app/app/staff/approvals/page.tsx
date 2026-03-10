'use client'
import { useEffect, useState } from 'react'
import { createClient, fmt, badge, type ApprovalItem } from '@/lib/supabase'

const STAGE_LABELS = ['', 'Loan Officer Review', 'Manager Approval', 'Accountant Verification', 'Admin Final Approval']

export default function ApprovalsPage() {
  const [items, setItems] = useState<ApprovalItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<ApprovalItem | null>(null)
  const [note, setNote] = useState('')
  const [acting, setActing] = useState(false)
  const [myRole, setMyRole] = useState('')
  const [myId, setMyId] = useState('')
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: prof } = await supabase.from('staff_profiles').select('id,role').eq('user_id', user.id).single()
        if (prof) { setMyRole(prof.role); setMyId(prof.id) }
      }
      const { data } = await supabase.from('approval_queue').select('*').order('created_at', { ascending: false })
      setItems((data as ApprovalItem[]) || [])
      setLoading(false)
    }
    load()
  }, [])

  const stageForRole: Record<string, number> = { loan_officer: 1, manager: 2, accountant: 3, admin: 4 }
  const myStage = stageForRole[myRole] || 0

  async function act(action: 'approved' | 'rejected') {
    if (!selected || !myStage) return
    setActing(true)
    const stageKey = `stage${selected.stage}` as `stage${1 | 2 | 3 | 4}`
    const newStage = action === 'approved' ? selected.stage + 1 : selected.stage
    const newStatus = action === 'rejected' ? 'rejected' : newStage > 4 ? 'approved' : 'pending'

    const update: Record<string, unknown> = {
      [`${stageKey}_action`]: action,
      [`${stageKey}_note`]: note,
      [`${stageKey}_at`]: new Date().toISOString(),
      [`${stageKey}_${myRole === 'loan_officer' ? 'officer' : myRole === 'manager' ? 'manager' : myRole === 'accountant' ? 'accountant' : 'admin'}`]: myId,
      status: newStatus,
      stage: action === 'approved' && newStage <= 4 ? newStage : selected.stage,
    }

    await supabase.from('approval_queue').update(update).eq('id', selected.id)

    // If final approval, update loan status
    if (newStatus === 'approved' && selected.entity_type === 'loan') {
      await supabase.from('loans').update({ status: 'approved', approved_by: myId }).eq('id', selected.entity_id)
    }
    if (newStatus === 'rejected' && selected.entity_type === 'loan') {
      await supabase.from('loans').update({ status: 'rejected' }).eq('id', selected.entity_id)
    }

    const { data } = await supabase.from('approval_queue').select('*').order('created_at', { ascending: false })
    setItems((data as ApprovalItem[]) || [])
    setSelected(null)
    setNote('')
    setActing(false)
  }

  const pending = items.filter(i => i.status === 'pending' && i.stage === myStage)
  const all = items

  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <h2 className="font-display text-2xl font-bold">Approval Workflow</h2>
        <p className="text-mfb-muted text-sm mt-0.5">4-stage approval pipeline · Your stage: <strong className="text-emerald-DEFAULT">{STAGE_LABELS[myStage] || 'View Only'}</strong></p>
      </div>

      {/* Stage pipeline */}
      <div className="card p-5">
        <div className="flex items-start gap-0">
          {[1,2,3,4].map((s, i) => (
            <div key={s} className="flex-1 relative">
              <div className={`h-1.5 ${s <= (items.find(i => i.status === 'pending')?.stage || 1) ? 'gradient-emerald' : 'bg-mfb-border'} ${i > 0 ? '' : 'rounded-l-full'} ${i === 3 ? 'rounded-r-full' : ''}`} />
              <div className="mt-2 text-xs text-mfb-muted text-center px-1">{STAGE_LABELS[s]}</div>
            </div>
          ))}
        </div>
      </div>

      {/* My pending items */}
      {myStage > 0 && (
        <div>
          <h3 className="font-bold text-mfb-text mb-3 flex items-center gap-2">
            Awaiting My Action
            {pending.length > 0 && <span className="bg-warning text-white text-xs px-2 py-0.5 rounded-full">{pending.length}</span>}
          </h3>
          {loading ? (
            <div className="card p-8 text-center text-mfb-muted text-sm">Loading…</div>
          ) : pending.length === 0 ? (
            <div className="card p-8 text-center">
              <div className="text-4xl mb-2">✅</div>
              <p className="text-mfb-muted text-sm">No items pending your action.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pending.map(item => (
                <div key={item.id} onClick={() => setSelected(item)}
                  className="card p-5 cursor-pointer hover:shadow-md transition-all hover:border-emerald-DEFAULT/30">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-semibold text-mfb-text">{item.title}</div>
                      <div className="text-mfb-muted text-xs mt-0.5">{item.ref_no} · {item.entity_type} · {item.branch}</div>
                    </div>
                    {item.amount && <div className="font-display font-bold text-lg text-emerald-DEFAULT">{fmt(item.amount)}</div>}
                  </div>
                  <div className="flex items-center gap-3 mt-3">
                    <span className={badge(item.status)}>{item.status}</span>
                    <span className="text-xs text-mfb-muted">Stage {item.stage}/4 · {STAGE_LABELS[item.stage]}</span>
                    <span className="ml-auto text-emerald-DEFAULT text-xs font-semibold">Review →</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* All items */}
      <div>
        <h3 className="font-bold text-mfb-text mb-3">All Approval Items</h3>
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr><th>Ref</th><th>Title</th><th>Type</th><th>Amount</th><th>Client</th><th>Branch</th><th>Stage</th><th>Status</th><th>Submitted</th></tr>
              </thead>
              <tbody>
                {all.length === 0 ? (
                  <tr><td colSpan={9} className="text-center py-10 text-mfb-muted text-sm">No approval items yet.</td></tr>
                ) : all.map(item => (
                  <tr key={item.id} onClick={() => setSelected(item)} className="cursor-pointer">
                    <td className="font-mono text-xs text-teal">{item.ref_no}</td>
                    <td className="font-medium text-sm">{item.title}</td>
                    <td className="text-mfb-muted text-xs capitalize">{item.entity_type}</td>
                    <td className="font-bold text-sm">{item.amount ? fmt(item.amount) : '—'}</td>
                    <td className="text-mfb-muted text-xs">{item.client_name || '—'}</td>
                    <td className="text-mfb-muted text-xs">{item.branch || '—'}</td>
                    <td><span className="text-xs font-semibold text-mfb-muted">{item.stage}/4</span></td>
                    <td><span className={badge(item.status)}>{item.status}</span></td>
                    <td className="text-mfb-muted text-xs">{new Date(item.created_at).toLocaleDateString('en-NG')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Review Modal */}
      {selected && (
        <div className="fixed inset-0 bg-navy-DEFAULT/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-modal">
            <div className="flex items-center justify-between p-6 border-b border-mfb-border">
              <h3 className="font-display text-xl font-bold">Review Application</h3>
              <button onClick={() => setSelected(null)} className="w-8 h-8 rounded-full bg-mfb-bg hover:bg-gray-200 flex items-center justify-center text-mfb-muted">✕</button>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-mfb-bg rounded-xl p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-mfb-muted">Reference</span>
                  <span className="font-mono font-semibold text-teal">{selected.ref_no}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-mfb-muted">Type</span>
                  <span className="font-semibold capitalize">{selected.entity_type}</span>
                </div>
                {selected.amount && (
                  <div className="flex justify-between text-sm">
                    <span className="text-mfb-muted">Amount</span>
                    <span className="font-display font-bold text-emerald-DEFAULT text-lg">{fmt(selected.amount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-mfb-muted">Client</span>
                  <span className="font-semibold">{selected.client_name || '—'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-mfb-muted">Branch</span>
                  <span>{selected.branch || '—'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-mfb-muted">Current Stage</span>
                  <span className="font-semibold">{STAGE_LABELS[selected.stage]}</span>
                </div>
              </div>

              {/* Stage audit trail */}
              <div className="space-y-2">
                {[1,2,3,4].map(s => {
                  const action = (selected as Record<string, unknown>)[`stage${s}_action`] as string
                  const at = (selected as Record<string, unknown>)[`stage${s}_at`] as string
                  const n = (selected as Record<string, unknown>)[`stage${s}_note`] as string
                  return (
                    <div key={s} className={`flex items-start gap-3 p-3 rounded-lg text-sm ${action ? (action === 'approved' ? 'bg-emerald-soft' : 'bg-red-50') : s === selected.stage ? 'bg-amber-50 border border-amber-200' : 'bg-mfb-bg opacity-50'}`}>
                      <span className="text-base mt-0.5">{action === 'approved' ? '✅' : action === 'rejected' ? '❌' : s === selected.stage ? '⏳' : '○'}</span>
                      <div>
                        <div className="font-semibold">{STAGE_LABELS[s]}</div>
                        {action && <div className="text-xs text-mfb-muted">{action} · {at ? new Date(at).toLocaleDateString('en-NG') : ''}</div>}
                        {n && <div className="text-xs italic mt-0.5">"{n}"</div>}
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Action area */}
              {selected.status === 'pending' && selected.stage === myStage && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-mfb-muted mb-1.5 uppercase tracking-wide">Review Note (optional)</label>
                    <textarea value={note} onChange={e => setNote(e.target.value)} rows={2}
                      className="input-field resize-none" placeholder="Add a note or condition…" />
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => act('rejected')} disabled={acting}
                      className="btn-danger flex-1 justify-center disabled:opacity-60">{acting ? '…' : '✗ Reject'}</button>
                    <button onClick={() => act('approved')} disabled={acting}
                      className="btn-primary flex-1 justify-center disabled:opacity-60">{acting ? '…' : '✓ Approve'}</button>
                  </div>
                </div>
              )}
              {(selected.status !== 'pending' || selected.stage !== myStage) && (
                <div className={`text-sm text-center py-2 font-semibold rounded-lg ${selected.status === 'approved' ? 'bg-emerald-soft text-emerald-DEFAULT' : selected.status === 'rejected' ? 'bg-red-50 text-danger' : 'bg-amber-50 text-warning'}`}>
                  {selected.status === 'approved' ? '✅ Fully Approved' : selected.status === 'rejected' ? '❌ Rejected' : `⏳ Awaiting Stage ${selected.stage} (${STAGE_LABELS[selected.stage]})`}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
