import { useEffect, useState } from 'react'
import { setLibraryMembership } from '@/services/users.service'
import { getMembershipPlan } from '@/services/library.service'
import { DEFAULT_MEMBERSHIP_PLAN_ID, isMembershipActive, type LibraryMembershipPlan } from '@/types/library'
import type { UserProfile } from '@/types/user'
import { Button } from '@/components/ui/Button'
import { MemberPicker } from './MemberPicker'
import styles from '@/components/admin/AdminCrudPage.module.css'

const ONE_MONTH_MS = 30 * 24 * 60 * 60 * 1000

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString('es-AR')
}

export function MemberMembershipManager() {
  const [member, setMember] = useState<UserProfile | null>(null)
  const [plan, setPlan] = useState<LibraryMembershipPlan | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    getMembershipPlan().then(setPlan)
  }, [])

  async function handleActivate() {
    if (!member) return
    setSaving(true)
    try {
      const membership = { planId: DEFAULT_MEMBERSHIP_PLAN_ID, status: 'activa' as const, renewalDate: Date.now() + ONE_MONTH_MS }
      await setLibraryMembership(member.uid, membership)
      setMember({ ...member, libraryMembership: membership })
    } finally {
      setSaving(false)
    }
  }

  async function handleDeactivate() {
    if (!member) return
    setSaving(true)
    try {
      const membership = {
        planId: DEFAULT_MEMBERSHIP_PLAN_ID,
        status: 'vencida' as const,
        renewalDate: member.libraryMembership?.renewalDate ?? null,
      }
      await setLibraryMembership(member.uid, membership)
      setMember({ ...member, libraryMembership: membership })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className={styles.form}>
      <h2>Membresías</h2>
      <MemberPicker selected={member} onSelect={setMember} />

      {member && (
        <div style={{ marginTop: 8 }}>
          {isMembershipActive(member.libraryMembership) ? (
            <p>Membresía activa hasta el {member.libraryMembership!.renewalDate ? formatDate(member.libraryMembership!.renewalDate!) : '—'}.</p>
          ) : (
            <p style={{ color: 'var(--color-ink-400)' }}>No tiene una membresía activa.</p>
          )}
          {plan && (
            <p style={{ fontSize: 13, color: 'var(--color-ink-400)' }}>
              Plan: {plan.name} · hasta {plan.concurrentLoanLimit} libros a la vez.
            </p>
          )}

          <div className={styles.formActions}>
            <Button type="button" onClick={handleActivate} disabled={saving}>
              Activar / renovar 1 mes
            </Button>
            <Button type="button" variant="ghost" onClick={handleDeactivate} disabled={saving}>
              Dar de baja
            </Button>
          </div>
          <p style={{ fontSize: 12, color: 'var(--color-ink-400)', margin: 0 }}>
            Confirmá el pago por WhatsApp antes de activar o renovar.
          </p>
        </div>
      )}
    </div>
  )
}
