import { useEffect, useState } from 'react'
import { getMembershipPlan, setMembershipPlan } from '@/services/library.service'
import { DEFAULT_CONCURRENT_LOAN_LIMIT, DEFAULT_MEMBERSHIP_PLAN_ID, type LibraryMembershipPlan } from '@/types/library'
import { Button } from '@/components/ui/Button'
import styles from '@/components/admin/AdminCrudPage.module.css'

type SaveState = 'idle' | 'saving' | 'saved' | 'error'

const EMPTY_PLAN: Omit<LibraryMembershipPlan, 'id'> = {
  name: 'Membresía biblioteca comunitaria',
  concurrentLoanLimit: DEFAULT_CONCURRENT_LOAN_LIMIT,
  price: 0,
  description: '',
}

interface MembershipPlanEditorProps {
  readOnly?: boolean
}

export function MembershipPlanEditor({ readOnly }: MembershipPlanEditorProps) {
  const [plan, setPlan] = useState<Omit<LibraryMembershipPlan, 'id'> | null>(null)
  const [saveState, setSaveState] = useState<SaveState>('idle')

  useEffect(() => {
    getMembershipPlan().then((p) => setPlan(p ?? EMPTY_PLAN))
  }, [])

  async function handleSave() {
    if (!plan) return
    setSaveState('saving')
    try {
      await setMembershipPlan(plan, DEFAULT_MEMBERSHIP_PLAN_ID)
      setSaveState('saved')
    } catch {
      setSaveState('error')
    } finally {
      setTimeout(() => setSaveState('idle'), 2500)
    }
  }

  if (!plan) return null

  return (
    <div className={styles.form}>
      <h2>Membresía</h2>
      <label>
        <span>Nombre</span>
        <input className={styles.input} value={plan.name} disabled={readOnly} onChange={(e) => setPlan({ ...plan, name: e.target.value })} />
      </label>
      <label>
        <span>Préstamos simultáneos permitidos</span>
        <input
          className={styles.input}
          type="number"
          min={1}
          value={plan.concurrentLoanLimit}
          disabled={readOnly}
          onChange={(e) => setPlan({ ...plan, concurrentLoanLimit: Number(e.target.value) })}
        />
      </label>
      <label>
        <span>Precio mensual</span>
        <input
          className={styles.input}
          type="number"
          min={0}
          value={plan.price}
          disabled={readOnly}
          onChange={(e) => setPlan({ ...plan, price: Number(e.target.value) })}
        />
      </label>
      <label>
        <span>Descripción (opcional)</span>
        <textarea
          className={styles.textarea}
          value={plan.description}
          disabled={readOnly}
          onChange={(e) => setPlan({ ...plan, description: e.target.value })}
        />
      </label>
      {!readOnly && (
        <Button type="button" onClick={handleSave} disabled={saveState === 'saving'}>
          {saveState === 'saving' ? 'Guardando…' : saveState === 'saved' ? '✓ Guardado' : 'Guardar'}
        </Button>
      )}
      <p style={{ fontSize: 12, color: 'var(--color-ink-400)', margin: 0 }}>
        El pago se coordina manualmente por WhatsApp; acá solo se define el cupo y el precio de referencia.
      </p>
    </div>
  )
}
