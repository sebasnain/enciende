import { useEffect, useState } from 'react'
import { listRegistrations, removeRegistration } from '@/services/signups.service'
import { MINISTRY_LABELS, type Ministry, type SignupEvent, type SignupRegistration } from '@/types/signups'
import { Button } from '@/components/ui/Button'
import styles from '@/components/admin/AdminCrudPage.module.css'

interface RegistrationsListProps {
  event: SignupEvent
}

function ministryLabel(ministry: Ministry | undefined): string {
  return MINISTRY_LABELS[ministry ?? 'sin_especificar']
}

function ministryCounts(registrations: SignupRegistration[]): Record<Ministry, number> {
  const counts: Record<Ministry, number> = { danza: 0, adoracion: 0, sin_especificar: 0 }
  registrations.forEach((r) => {
    counts[r.ministry ?? 'sin_especificar'] += 1
    r.companions.forEach((c) => (counts[c.ministry ?? 'sin_especificar'] += 1))
  })
  return counts
}

function toPdfRows(registrations: SignupRegistration[], withMinistry: boolean): string[][] {
  const rows: string[][] = []
  registrations.forEach((r) => {
    rows.push([
      String(rows.length + 1),
      r.firstName,
      r.lastName,
      String(r.age),
      ...(withMinistry ? [ministryLabel(r.ministry)] : []),
      r.church,
      r.city,
      r.phone,
      r.isGroupLeader ? 'Líder de grupo' : 'Individual',
    ])
    r.companions.forEach((c) => {
      rows.push([
        String(rows.length + 1),
        c.firstName,
        c.lastName,
        String(c.age),
        ...(withMinistry ? [ministryLabel(c.ministry)] : []),
        r.church,
        r.city,
        r.phone,
        `Va con ${r.firstName} ${r.lastName}`,
      ])
    })
  })
  return rows
}

export function RegistrationsList({ event }: RegistrationsListProps) {
  const [registrations, setRegistrations] = useState<SignupRegistration[] | null>(null)
  const [count, setCount] = useState(event.registeredCount)
  const [error, setError] = useState<string | null>(null)

  async function reload() {
    setRegistrations(await listRegistrations(event.id))
  }

  useEffect(() => {
    setCount(event.registeredCount)
    reload().catch(() => setError('No se pudieron cargar las inscripciones.'))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event.id])

  async function handleRemove(registration: SignupRegistration) {
    if (!window.confirm(`¿Quitar la inscripción de ${registration.firstName} ${registration.lastName} (${registration.totalPeople} personas)?`)) return
    await removeRegistration(event.id, registration, count)
    setCount((c) => Math.max(0, c - registration.totalPeople))
    await reload()
  }

  async function handleDownloadPdf() {
    if (!registrations) return
    const [{ jsPDF }, { default: autoTable }] = await Promise.all([import('jspdf'), import('jspdf-autotable')])
    const pdf = new jsPDF({ orientation: 'landscape' })
    const withMinistry = !!event.askMinistry
    const rows = toPdfRows(registrations, withMinistry)
    const counts = ministryCounts(registrations)

    pdf.setFontSize(16)
    pdf.text(`Inscriptos: ${event.title}`, 14, 16)
    pdf.setFontSize(10)
    pdf.text(
      `${rows.length} personas${event.capacity ? ` de ${event.capacity} cupos` : ''} · ${registrations.length} inscripciones · ${new Date().toLocaleDateString('es-AR')}`,
      14,
      23,
    )
    if (withMinistry) {
      pdf.text(`Danza: ${counts.danza} · Adoración: ${counts.adoracion} · Sin especificar: ${counts.sin_especificar}`, 14, 29)
    }
    autoTable(pdf, {
      startY: withMinistry ? 34 : 28,
      head: [['#', 'Nombre', 'Apellido', 'Edad', ...(withMinistry ? ['Ministerio'] : []), 'Iglesia', 'Ciudad', 'Teléfono', 'Rol']],
      body: rows,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [214, 69, 38] },
    })
    pdf.save(`inscriptos-${event.title.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}.pdf`)
  }

  return (
    <div style={{ marginTop: 8 }}>
      <h3 style={{ fontSize: 15, margin: '8px 0' }}>
        Inscriptos: {count}
        {event.capacity ? ` de ${event.capacity} cupos` : ''}
      </h3>
      {error && <p className={styles.saveError}>{error}</p>}
      {!registrations && !error && <p style={{ color: 'var(--color-ink-400)', fontSize: 13 }}>Cargando…</p>}
      {registrations?.length === 0 && <p style={{ color: 'var(--color-ink-400)', fontSize: 13 }}>Todavía no hay inscripciones.</p>}

      {registrations?.map((r) => (
        <div key={r.id} className={styles.row}>
          <span>
            {r.firstName} {r.lastName} ({r.age}){event.askMinistry ? ` · ${ministryLabel(r.ministry)}` : ''} · {r.church} · {r.city} · {r.phone}
            {r.isGroupLeader && (
              <>
                <br />
                <span style={{ fontSize: 12, color: 'var(--color-ink-400)' }}>
                  Líder de grupo, con: {r.companions.map((c) => `${c.firstName} ${c.lastName} (${c.age}${event.askMinistry ? `, ${ministryLabel(c.ministry)}` : ''})`).join(', ')}
                </span>
              </>
            )}
          </span>
          <span className={styles.rowActions}>
            <button type="button" className={styles.link} onClick={() => handleRemove(r)}>
              Quitar
            </button>
          </span>
        </div>
      ))}

      <div className={styles.formActions} style={{ marginTop: 8 }}>
        <Button type="button" variant="secondary" onClick={handleDownloadPdf} disabled={!registrations || registrations.length === 0}>
          Descargar lista en PDF
        </Button>
      </div>
    </div>
  )
}
