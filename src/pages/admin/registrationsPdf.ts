import { listRegistrations } from '@/services/signups.service'
import { ministryLabel, type Ministry, type SignupEvent, type SignupRegistration } from '@/types/signups'

function ministryCounts(registrations: SignupRegistration[]): Record<Ministry, number> {
  const counts: Record<Ministry, number> = { danza: 0, adoracion: 0, sin_especificar: 0 }
  registrations.forEach((r) => {
    counts[r.ministry ?? 'sin_especificar'] += 1
    r.companions.forEach((c) => (counts[c.ministry ?? 'sin_especificar'] += 1))
  })
  return counts
}

/** La fuente estándar del PDF no tiene emojis ni símbolos fuera de Latin-1: se descartan para que no salgan como basura. */
function latin(text: string): string {
  return text.replace(/[^ -ÿ]/g, '').replace(/\s+/g, ' ').trim()
}

function toRows(registrations: SignupRegistration[], withMinistry: boolean): string[][] {
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
  return rows.map((row) => row.map(latin))
}

/** Trae las inscripciones del evento y descarga la lista en PDF (una fila por persona, acompañantes incluidos). */
export async function downloadRegistrationsPdf(event: SignupEvent): Promise<void> {
  const registrations = await listRegistrations(event.id)
  if (registrations.length === 0) throw new Error('Todavía no hay inscripciones para descargar.')

  const [{ jsPDF }, { default: autoTable }] = await Promise.all([import('jspdf'), import('jspdf-autotable')])
  const pdf = new jsPDF({ orientation: 'landscape' })
  const withMinistry = !!event.askMinistry
  const rows = toRows(registrations, withMinistry)

  pdf.setFontSize(16)
  pdf.text(`Inscriptos: ${latin(event.title)}`, 14, 16)
  pdf.setFontSize(10)
  pdf.text(
    `${rows.length} personas${event.capacity ? ` de ${event.capacity} cupos` : ''} · ${registrations.length} inscripciones · ${new Date().toLocaleDateString('es-AR')}`,
    14,
    23,
  )
  if (withMinistry) {
    const counts = ministryCounts(registrations)
    pdf.text(
      `Danzor: ${counts.danza} · Adorador: ${counts.adoracion} · Sin especificar: ${counts.sin_especificar}`,
      14,
      29,
    )
  }
  autoTable(pdf, {
    startY: withMinistry ? 34 : 28,
    head: [['#', 'Nombre', 'Apellido', 'Edad', ...(withMinistry ? ['Ministerio'] : []), 'Iglesia', 'Ciudad', 'Teléfono', 'Rol']],
    body: rows,
    styles: { fontSize: 9 },
    headStyles: { fillColor: [214, 69, 38] },
  })
  pdf.save(`inscriptos-${event.title.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '').toLowerCase()}.pdf`)
}
